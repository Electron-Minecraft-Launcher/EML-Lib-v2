/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { ClientError } from '../../models/errors'
import path from 'path'

class Utils {
  /**
   * Get the current operating system code.
   */
  getOS() {
    if (process.platform === 'win32') return 'win'
    if (process.platform === 'darwin') return 'mac'
    if (process.platform === 'linux') return 'lin'
    throw new ClientError('UNKNOWN_OS', 'Unknown operating system')
  }

  /**
   * Get the path to the application data directory, depending on the operating system.
   */
  getAppData() {
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
    return path.join(this.getAppData(), serverId)
  }
}

export default new Utils()
