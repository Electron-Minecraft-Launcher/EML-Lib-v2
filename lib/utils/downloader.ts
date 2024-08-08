/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { File } from '../../types/file'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import EventEmitter from '../utils/events'
import { DownloaderEvents } from '../../types/events'
import utils from './utils'

export default class Downloader extends EventEmitter<DownloaderEvents> {
  private size: number = 0
  private dest: string = ''
  private downloaded: { amount: number; size: number } = { amount: 0, size: 0 }
  private errors: number = 0
  private speed: number = 0
  private eta: number = 0
  private history: { size: number; time: number }[] = []

  /**
   * You can use `this.forwardEvents()` to forward events to another EventEmitter.
   * @param dest Destination folder.
   */
  constructor(dest: string) {
    super()
    this.dest = path.join(dest)
  }

  /**
   * Download files from the list.
   * @param files List of files to download. This list must include folders.
   * @param skipFileExists Skip files that already exist in the destination folder (force to 
   * download all files).
   */
  async download(files: File[], skipFileExists: boolean = false): Promise<void> {
    const filesToDownload: File[] = !skipFileExists ? this.getFilesToDownload(files) : files

    this.size = filesToDownload.reduce((acc, curr) => acc + (curr.size || 0), 0)
    if (this.size === 0) {
      this.emit('download_end', { downloaded: this.downloaded })
      return
    }

    const max = filesToDownload.length > 5 ? 5 : filesToDownload.length

    for (let i = 0; i < max; i++) this.downloadFile(filesToDownload, i)

    return new Promise((resolve, reject) => {
      this.on('download_end', () => resolve())
      this.on('download_error', (err) => reject(err))
    })
  }

  /**
   * Get files that need to be downloaded (files that don't exist or have different hash).
   * @param files List of files to check.
   * @returns List of files to download.
   */
  getFilesToDownload(files: File[]) {
    let filesToDownload: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filePath = path.join(this.dest, file.path, file.name)
      if (file.type === 'FOLDER') {
        if (!fs.existsSync(path.join(this.dest, file.path, file.name))) {
          fs.mkdirSync(path.join(this.dest, file.path, file.name), { recursive: true })
        }
      } else if (!fs.existsSync(filePath) || file.sha1 !== utils.getFileHash(filePath)) {
        filesToDownload.push(file)
      }
    }

    return filesToDownload
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
        this.emit('download_error', {
          filename: file.name,
          type: file.type,
          message: res.statusText
        })
        return
      }
      if (!res.body) {
        if (t < 5) {
          setTimeout(() => this.downloadFile(files, i, t + 1), 1000)
          return
        }
        this.emit('download_error', {
          filename: file.name,
          type: file.type,
          message: 'No body'
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

          this.emit('download_progress', {
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
          this.emit('download_error', {
            filename: file.name,
            type: file.type,
            message: err
          })
          reject(err)
        })

        res.body.on('end', (val) => {
          this.downloaded.amount++
          if (this.downloaded.amount + this.errors === files.length) {
            this.emit('download_end', { downloaded: this.downloaded })
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
      this.emit('download_error', {
        filename: file.name,
        type: file.type,
        message: error
      })
      return
    }
  }
}
