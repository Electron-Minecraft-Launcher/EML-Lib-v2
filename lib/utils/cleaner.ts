/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import EventEmitter from './events'
import path from 'path'
import fs from 'fs'
import utils from './utils'
import { CleanerEvents } from '../../types/events'
import { File } from '../../types/file'

export default class Cleaner extends EventEmitter<CleanerEvents> {
  private dest: string = ''
  private browsed: { name: string; path: string; sha1: string }[] = []

  /**
   * You can use `this.forwardEvents()` to forward events to another EventEmitter.
   * @param dest Destination folder.
   */
  constructor(dest: string) {
    super()
    this.dest = path.join(dest)
  }

  /**
   * Clean the destination folder by removing files that are not in the list.
   * @param files List of files to check ('ok' files; files that should be in the destination folder).
   * @param ignore List of files to ignore (don't delete them).
   */
  clean(files: File[], ignore: string[] = []) {
    let i = 0
    this.browsed = []
    this.browse(this.dest)

    this.browsed.forEach((file) => {
      const fullPath = path.join(file.path, file.name)
      if (
        !files.find((f) => path.join(this.dest, f.path, f.name) === fullPath) &&
        !ignore.find((ig) => fullPath.startsWith(path.join(this.dest, ig)))
      ) {
        fs.unlinkSync(fullPath)
        i++
        this.emit('clean_progress', { filename: file.name })
      }
      // Can't check hash for performance reasons
    })

    this.emit('clean_end', { amount: i })
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
          sha1: utils.getFileHash(path.join(dir, file))
        })
      }
    })
  }
}
