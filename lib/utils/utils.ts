/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { ClientError, ErrorType } from '../../types/errors'
import path from 'path'

class Utils {
  /**
   * Get the current operating system code.
   * @returns The operating system code (`'win'`, `'mac'` or `'lin'`).
   */
  getOS() {
    if (process.platform === 'win32') return 'win'
    if (process.platform === 'darwin') return 'mac'
    if (process.platform === 'linux') return 'lin'
    throw new ClientError(ErrorType.UNKNOWN_OS, 'Unknown operating system')
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
}

export default new Utils()
