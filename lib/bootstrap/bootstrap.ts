/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import utils from '../utils/utils'

/**
 * **Attention!** This class only works with the EML AdminTool. Please do not use it without the AdminTool.
 * @workInProgress
 */
export default class Bootstrap {
  private url: string

  /**
   * @param url The URL of your EML AdminTool website
   */
  constructor(url: string) {
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
    return { updateAvailable: true, version: res.data.version }
  }

  /**
   * Download the latest Bootstrap from the EML AdminTool. 
   * This method does not check for updates, it will always download the latest version.
   */
  async download() {
    let res = await fetch(`${this.url}/bootstraps`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new Error(`Error while fetching Bootstrap from the EML AdminTool: ${err}`)
      })

    const { win, mac, lin } = res.data

    const os = utils.getOS()

    if (os === 'win') {
      // TODO
    } else if (os === 'mac') {
      // TODO
    } else if (os === 'lin') {
      // TODO
    }
  }
}
