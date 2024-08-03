/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { EMLCoreError, ErrorType } from '../../types/errors'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

class Utils {
  /**
   * Get the current operating system code.
   * @returns The operating system code (`'win'`, `'mac'` or `'lin'`).
   */
  getOS() {
    if (process.platform === 'win32') return 'win'
    if (process.platform === 'darwin') return 'mac'
    if (process.platform === 'linux') return 'lin'
    throw new EMLCoreError(ErrorType.UNKNOWN_OS, 'Unknown operating system')
  }

  /**
   * Get the current operating system Minecraft-code.
   * @returns The operating system code (`'windows'`, `'osx'` or `'linux'`).
   */
  getOS_MCCode() {
    if (process.platform === 'win32') return 'windows'
    if (process.platform === 'darwin') return 'osx'
    if (process.platform === 'linux') return 'linux'
    throw new EMLCoreError(ErrorType.UNKNOWN_OS, 'Unknown operating system')
  }

  getArch() {
    if (process.arch.includes('64')) return '64'
    if (process.arch.includes('32')) return '32'
    throw new EMLCoreError(ErrorType.UNKNOWN_OS, 'Unknown architecture')
  }

  /**
   * Get the path to the application data folder, depending on the operating system.
   * @returns The path to the application data folder (eg. `'C:\Users\user\AppData\Roaming'`).
   */
  getAppDataFolder() {
    return this.getOS() === 'win'
      ? process.env.APPDATA + ''
      : this.getOS() === 'mac'
        ? process.env.HOME + '/Library/Application Support'
        : process.env.HOME + ''
  }

  /**
   * Get the path to the server folder.
   * @param serverId Your Minecraft server ID (eg. `'minecraft'`).
   * @returns The path to the server folder (eg. `'C:\Users\user\AppData\Roaming\.minecraft'`).
   */
  getServerFolder(serverId: string) {
    serverId = serverId.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    serverId = this.getOS() === 'mac' ? serverId : `.${serverId}`
    return path.join(this.getAppDataFolder(), serverId)
  }

  /**
   * Get the path of the temp folder, depending on the operating system.
   * @returns The path to the temp folder (eg. `'C:\Users\user\AppData\Local\Temp'`).
   */
  getTempFolder() {
    return this.getOS() === 'win' ? process.env.TEMP + '' : '/tmp'
  }

  /**
   * Get the SHA1 hash of a file.
   * @param filePath Path of the file.
   * @returns The SHA1 hash of the file.
   */
  getFileHash(filePath: string) {
    try {
      const fileHash = fs.readFileSync(filePath)
      return crypto.createHash('sha1').update(fileHash).digest('hex')
    } catch (err) {
      throw new EMLCoreError(ErrorType.HASH_ERROR, `Error while getting hash of the file ${filePath}: ${err}`)
    }
  }
}

export default new Utils()
