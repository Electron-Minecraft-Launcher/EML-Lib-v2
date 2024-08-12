/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { EMLCoreError, ErrorType } from '../../types/errors'
import path_ from 'path'
import fs from 'fs'
import crypto from 'crypto'
import os from 'os'

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

  /**
   * Get the current architecture.
   * @returns The architecture (`'64'` or `'32'`).
   */
  getArch() {
    if (process.arch.includes('64')) return '64'
    if (process.arch.includes('32')) return '32'
    throw new EMLCoreError(ErrorType.UNKNOWN_OS, 'Unknown architecture')
  }

  /**
   * Get the current architecture Minecraft-core.
   * @returns The architecture (`'x64'` or `'x86'`).
   */
  getArch_MCCode() {
    if (process.arch.includes('64')) return 'x64'
    if (process.arch.includes('32')) return 'x86'
    throw new EMLCoreError(ErrorType.UNKNOWN_OS, 'Unknown architecture')
  }

  getOSVersion() {
    return os.release()
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
    return path_.join(this.getAppDataFolder(), serverId)
  }

  /**
   * Get the path of the temp folder, depending on the operating system.
   * @returns The path to the temp folder (eg. `'C:\Users\user\AppData\Local\Temp'`).
   */
  getTempFolder() {
    return this.getOS() === 'win' ? process.env.TEMP + '' : '/tmp'
  }

  /**
   * Get the hash of a file.
   * @param filePath Path of the file.
   * @returns The hash of the file.
   */
  getFileHash(filePath: string) {
    try {
      const fileHash = fs.readFileSync(filePath)
      return crypto.createHash('sha1').update(fileHash).digest('hex')
    } catch (err) {
      throw new EMLCoreError(ErrorType.HASH_ERROR, `Error while getting hash of the file ${filePath}: ${err}`)
    }
  }

  /**
   * Check if a library is allowed for the current operating system.
   * @param lib The library to check.
   * @returns `true` if the library is allowed, `false` otherwise.
   */
  isLibAllowed(lib: any) {
    if (lib.rules) {
      if (lib.rules.length > 1) {
        if (lib.rules[0].action === 'allow' && lib.rules[1].action === 'disallow') {
          return lib.rules[1].os.name !== this.getOS_MCCode()
        }
        return false
      } else {
        if (lib.rules[0].action === 'allow' && lib.rules[0].os) {
          return lib.rules[0].os.name === this.getOS_MCCode()
        }
        return true
      }
    }
    return true
  }

  /**
   * Check if a JVM/game argument is allowed for the current operating system.
   * @param arg The argument to check.
   * @returns `true` if the argument is allowed, `false` otherwise.
   */
  isArgAllowed(arg: any) {
    if (arg.rules) {
      if (arg.rules.length > 1) {
        if (arg.rules[0].action === 'allow' && arg.rules[1].action === 'disallow') {
          if (arg.rules[1].os.name) return arg.rules[1].os.name !== this.getOS_MCCode()
          if (arg.rules[1].os.arch) return arg.rules[1].os.arch !== this.getArch_MCCode()
        }
        return false
      } else {
        if (arg.rules[0].action === 'allow' && arg.rules[0].os) {
          if (arg.rules[0].os.name) {
            if (arg.rules[0].os.name === this.getOS_MCCode() && arg.rules[0].os.version) return +this.getOSVersion().split('.')[0] >= 10
            return arg.rules[0].os.name === this.getOS_MCCode()
          }
          if (arg.rules[0].os.arch) return arg.rules[0].os.arch === this.getArch_MCCode()
          return arg.rules[0].os.name === this.getOS_MCCode()
        } else if (arg.rules[0].action === 'allow' && arg.rules[0].features) {
          return false
        }
        return true
      }
    }
    return true
  }

  /**
   * Get the name of a Maven library.
   * @param libName The name of the library (eg. `'com.mojang:authlib:1.5.25'`).
   * @returns The name of the library.
   */
  getLibraryName(libName: string) {
    const l = libName.split(':')
    return `${l[1]}-${l[2]}${l[3] ? '-' + l[3] : ''}.jar`.replace('@', '.')
  }

  /**
   * Get the path of a Maven library.
   * @param libName The name of the library (eg. `'com.mojang:authlib:1.5.25'`).
   * @param path [Optional] Additional path to add to the library path.
   * @returns The path of the library.
   */
  getLibraryPath(libName: string, ...path: string[]) {
    const l = libName.split(':')
    return path_.join(...path, `${l[0].replace(/\./g, '/')}/${l[1]}/${l[2]}/`)
  }
}

export default new Utils()
