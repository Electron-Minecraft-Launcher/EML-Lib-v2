/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

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

  async getLastVersion() {
    let res = await fetch(`${this.url}/bootstrap`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new Error(`Error while fetching Bootstrap from the EML AdminTool: ${err}`)
      })

    return res.version
  }
}
