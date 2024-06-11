/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

/**
 * **Attention!** This class only works with the EML AdminTool. Please do not use it without the AdminTool.
 */
export default class Background {
  private url: string
	
  /**
   * @param url The URL of your EML AdminTool website
   */
  constructor(url: string) {
    if (!url) throw new Error('No URL given for Background')
    this.url = `${url}/api`
  }

  getBackground() {
    return `${this.url}/background/background.jpg`
  }
}
