/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { EMLLibError, ErrorType } from '../../types/errors'
import { Background as Background_ } from '../../types/background'

/**
 * **Attention!** This class only works with the EML AdminTool. Please do not use it without the AdminTool.
 */
export default class Background {
  private url: string

  /**
   * @param url The URL of your EML AdminTool website.
   */
  constructor(url: string) {
    this.url = `${url}/api`
  }

  /**
   * Get the current background for the Launcher.
   * @returns The current Background object, or `null` if no background is set.
   */
  async getBackground(): Promise<Background_ | null> {
    const res = await fetch(`${this.url}/backgrounds`)
      .then((res) => res.json() as Promise<{ data: Background_[] }>)
      .catch((err) => {
        throw new EMLLibError(ErrorType.DOWNLOAD_ERROR, `Error while fetching backgrounds: ${err}`)
      })

    return res.data.find((bg) => bg.status === 1) || null
  }
}
