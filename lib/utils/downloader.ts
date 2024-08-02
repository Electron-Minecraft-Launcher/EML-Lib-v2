/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { File } from '../../types/file'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { ClientError, ErrorType } from '../../types/errors'
import fetch from 'node-fetch'
import EventEmitter from '../utils/events'
import { DownloaderEvents } from '../../types/events'

export default class Downloader extends EventEmitter<DownloaderEvents> {
  private size: number = 0
  private dest: string = ''
  private downloaded: { amount: number; size: number } = { amount: 0, size: 0 }
  private errors: number = 0
  private speed: number = 0
  private eta: number = 0
  private history: { size: number; time: number }[] = []

  private browsed: { name: string; path: string; sha1: string }[] = []

  /**
   * You can use `this.forwardEvents()` to forward events to another EventEmitter.
   * @param dest Destination folder
   */
  constructor(dest: string) {
    super()
    this.dest = path.join(dest)
  }

  /**
   * Download files from the list.
   * @param files List of files to download
   */
  async download(files: File[]) {
    let filesToDownload: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filePath = path.join(this.dest, file.path, file.name)
      if (file.type === 'FOLDER') {
        if (!fs.existsSync(path.join(this.dest, file.path, file.name))) {
          fs.mkdirSync(path.join(this.dest, file.path, file.name), { recursive: true })
        }
      } else if (!fs.existsSync(filePath) || file.sha1 !== this.getHash(filePath)) {
        filesToDownload.push(file)
      }
    }

    this.size = filesToDownload.reduce((acc, curr) => acc + (curr.size || 0), 0)
    if (this.size === 0) {
      this.emit('finish', { downloaded: this.downloaded, errors: this.errors })
      return
    }

    const max = filesToDownload.length > 5 ? 5 : filesToDownload.length

    for (let i = 0; i < max; i++) this.downloadFile(filesToDownload, i)
  }

  /**
   * Clean the destination folder by removing files that are not in the list.
   * @param files List of files to check ('ok' files; files that should be in the destination folder).
   * @param ignore List of files to ignore (don't delete them).
   */
  async clean(files: File[], ignore: string[] = []) {
    let i = 0
    this.browsed = []
    this.browse(this.dest)

    this.browsed.forEach((file) => {
      if (!files.find((f) => path.join(this.dest, f.path, f.name) === path.join(file.path, file.name)) && !ignore.includes(file.name)) {
        fs.unlinkSync(path.join(file.path, file.name))
        i++
        this.emit('clean', { file: file.name })
      }
      // Can't check hash for performance reasons
    })

    this.emit('cleaned', { amount: i })
  }

  private async downloadFile(files: File[], i: number, t = 0) {
    const file = files[i]
    const dirPath = path.join(this.dest, file.path)
    const filePath = path.join(dirPath, file.name)

    try {
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })

      const res = await fetch(file.url, { headers: { Accept: 'application/octet-stream' } })
      const stream = fs.createWriteStream(filePath)

      if (res.status !== 200) {
        if (t < 5) {
          setTimeout(() => this.downloadFile(files, i, t + 1), 1000)
          return
        }
        this.emit('error', {
          file: file.name,
          error: res.statusText
        })
        return
      }
      if (!res.body) {
        if (t < 5) {
          setTimeout(() => this.downloadFile(files, i, t + 1), 1000)
          return
        }
        this.emit('error', {
          file: file.name,
          error: 'No body'
        })
        return
      }

      await new Promise((resolve, reject) => {
        res.body.on('data', (chunk) => {
          const now = Date.now()
          this.history.push({ size: chunk.length, time: now })

          while (this.history.length > 0 && now - this.history[0].time > 6000) {
            this.history.shift()
          }

          stream.write(chunk)

          this.downloaded.size += chunk.length

          const totalSize = this.history.reduce((acc, curr) => acc + curr.size, 0)
          const elapsedTime = (now - this.history[0].time) / 1000
          this.speed = totalSize / elapsedTime
          this.eta = (this.size - this.downloaded.size) / this.speed // TODO Fix ETA

          this.emit('progress', {
            total: { amount: files.length, size: this.size },
            downloaded: this.downloaded,
            speed: this.speed,
            eta: Math.floor(this.eta),
            type: file.type
          })
        })

        res.body.on('error', (err) => {
          this.errors++
          stream.destroy()
          this.emit('error', {
            file: file.name,
            error: err
          })
          reject(err)
        })

        res.body.on('end', (val) => {
          this.downloaded.amount++
          if (this.downloaded.amount + this.errors === files.length) {
            this.emit('finish', { downloaded: this.downloaded, errors: this.errors })
          } else if (i + 5 < files.length) {
            this.downloadFile(files, i + 5)
          }
          stream.close()
          resolve(val)
        })
      })
    } catch (error: any) {
      if (t < 5) {
        setTimeout(() => this.downloadFile(files, i, t + 1), 1000)
        return
      }
      this.emit('error', {
        file: file.name,
        error: error
      })
      return
    }
  }

  private browse(dir: string): void {
    if (!fs.existsSync(dir)) return

    const files = fs.readdirSync(dir)

    files.forEach((file) => {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        this.browse(path.join(dir, file))
      } else {
        this.browsed.push({
          name: file,
          path: `${dir}/`.split('\\').join('/').replace(/^\/+/, ''),
          sha1: this.getHash(path.join(dir, file))
        })
      }
    })
  }

  private getHash(filePath: string) {
    try {
      const fileHash = fs.readFileSync(filePath)
      return crypto.createHash('sha1').update(fileHash).digest('hex')
    } catch (err) {
      throw new ClientError(ErrorType.HASH_ERROR, `Error while getting hash of the file ${filePath}: ${err}`)
    }
  }
}
