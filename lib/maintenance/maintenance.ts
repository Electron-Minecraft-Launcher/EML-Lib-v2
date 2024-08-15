/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { EMLLibError, ErrorType } from '../../types/errors'
import { Maintenance as Maintenance_ } from '../../types/maintenance'

/**
 * Manage the Maintenance of the Launcher.
 * 
 * **Attention!** This class only works with the EML AdminTool. Please do not use it without the AdminTool.
 */
export default class Maintenance {
  private url: string

  /**
   * @param url The URL of your EML AdminTool website.
   */
  constructor(url: string) {
    this.url = `${url}/api`
  }

  /**
   * Get the current Maintenance status from the EML AdminTool.
   * @returns The Maintenance status.
   */
  async getMaintenance(): Promise<Maintenance_> {
    let res = await fetch(`${this.url}/maintenance`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new EMLLibError(ErrorType.FETCH_ERROR, `Error while fetching Maintenance from the EML AdminTool: ${err}`)
      })

    return res.data
  }
}
