/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import Downloader from '../utils/downloader'
import utils from '../utils/utils'
import EventEmitter from '../utils/events'
import path from 'path'
import { exec } from 'child_process'
import { ClientError, ErrorType } from '../../models/errors.model'

/**
 * **Attention!** This class only works with the EML AdminTool. Please do not use it without the AdminTool.
 * @workInProgress
 */
export default class Bootstrap extends EventEmitter {
  private url: string

  /**
   * @param url The URL of your EML AdminTool website
   */
  constructor(url: string) {
    super()
    if (!url) throw new Error('No URL given for Bootstrap')
    this.url = `${url}/api`
  }

  /**
   * Check for updates of your Launcher. This method will return the version of the latest Bootstrap, but it will not download it.
   * @param currentVersion The current version of your Launcher. You can get it with `app.getVersion()`.
   */
  async checkForUpdate(currentVersion: string) {
    let res = await fetch(`${this.url}/bootstraps`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new Error(`Error while fetching Bootstrap from the EML AdminTool: ${err}`)
      })

    if (res.data.version === currentVersion) return { updateAvailable: false }
    return { updateAvailable: true, version: res.data.version as string }
  }

  /**
   * Download the latest Bootstrap from the EML AdminTool.
   * This method does not check for updates, it will always download the latest version.
   */
  async download(): Promise<string> {
    let res = await fetch(`${this.url}/bootstraps`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new Error(`Error while fetching Bootstrap from the EML AdminTool: ${err}`)
      })

    const os = utils.getOS()
    const bootstrap = os === 'win' ? res.data.win : os === 'mac' ? res.data.mac : res.data.lin
    const dl = new Downloader(utils.getTempFolder())
    dl.forwardEvents(this)

    dl.download(bootstrap)

    return path.join(utils.getTempFolder(), bootstrap.path, bootstrap.name)
  }

  /**
   * @workInProgress **This method is not tested yet.**
   * @param bootstrapPath The path to the downloaded Bootstrap (returned by `this.download()`)
   */
  async runUpdate(bootstrapPath: string) {
    const os = utils.getOS()
    const cmd = os === 'win' ? `start ${bootstrapPath}` : os === 'mac' ? `open ${bootstrapPath}` : `chmod +x ${bootstrapPath} && ./${bootstrapPath}`
    exec(cmd, (err) => {
      if (err) {
        throw new ClientError(ErrorType.EXEC_ERROR, `Error while executing the Bootstrap: ${err}`)
      }
      process.exit()
    })
  }
}
