/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { File } from '../../models/file'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { ClientError } from '../../models/errors'
import fetch from 'node-fetch'
import { EventEmitter } from 'events'

export default class Downloader extends EventEmitter {
  private files: File[]
  private size: number
  private dest: string
  private downloaded: { amount: number; size: number }
  private errors: number
  private speed: number
  private eta: number
  private history: { size: number; time: number }[]

  constructor(files: File[], dest: string) {
    super()

    this.files = files
    this.dest = dest

    this.size = files.reduce((acc, curr) => acc + (curr.size || 0), 0)
    this.downloaded = { amount: 0, size: 0 }
    this.errors = 0
    this.speed = 0
    this.eta = 0
    this.history = []
  }

  async download() {
    this.files.forEach((file, i) => {
      const filePath = path.join(this.dest, file.path, file.name)
      if (file.type === 'FOLDER') {
        if (!fs.existsSync(path.join(this.dest, file.path, file.name))) {
          fs.mkdirSync(path.join(this.dest, file.path, file.name), { recursive: true })
        }
        this.files.splice(i, 1)
      } else if (fs.existsSync(filePath) && file.sha1 === this.getHash(filePath)) {
        this.files.splice(i, 1)
      }
    })

    for (let i = 0; i < 5; i++) this.downloadFile(i)
  }

  private async downloadFile(i: number) {
    const file = this.files[i]
    const dirPath = path.join(this.dest, file.path)
    const filePath = path.join(dirPath, file.name)

    try {
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })

      const res = await fetch(file.url, { headers: { Accept: 'application/octet-stream' } })
      const stream = fs.createWriteStream(filePath)

      if (res.status !== 200) {
        throw new ClientError('DOWNLOAD_ERROR', `Error while downloading file: ${res.statusText}`)
      }
      if (!res.body) {
        throw new ClientError('DOWNLOAD_ERROR', 'Error while downloading file: No body')
      }

      await new Promise((resolve, reject) => {
        res.body.pipe(stream)
        res.body.on('data', (chunk) => {
          const now = Date.now()
          this.history.push({ size: chunk.length, time: now })

          while (this.history.length > 0 && now - this.history[0].time > 5000) {
            this.history.shift()
          }

          const totalSize = this.history.reduce((acc, curr) => acc + curr.size, 0)
          const elapsedTime = (now - this.history[0].time) / 1000
          this.speed = totalSize / elapsedTime
          this.eta = (this.size - this.downloaded.size) / this.speed

          stream.write(chunk)

          this.downloaded.size += chunk.length

          this.emit('progress', {
            total: { amount: this.files.length, size: this.size },
            downloaded: this.downloaded,
            speed: this.speed,
            eta: Math.round(this.eta),
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
          if (this.downloaded.amount + this.errors === this.files.length) {
            this.emit('finish', { downloaded: this.downloaded, errors: this.errors })
          } else if (i + 5 < this.files.length) {
            this.downloadFile(i + 5)
          }
          stream.close()
          resolve(val)
        })
      })
    } catch (error: any) {
      throw new ClientError('DOWNLOAD_ERROR', `Error while downloading file ${file.name}: ${error}`)
    }
  }

  private getHash(filePath: string) {
    try {
      const fileHash = fs.readFileSync(filePath)
      return crypto.createHash('sha1').update(fileHash).digest('hex')
    } catch (err) {
      throw new ClientError('DOWNLOAD_ERROR', `Error while getting hash of the file ${filePath}: ${err}`)
    }
  }
}
