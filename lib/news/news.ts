/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { EMLLibError, ErrorType } from '../../types/errors'
import { News as News_, NewsCategory } from '../../types/news'

/**
 * Manage the News of the Launcher.
 * 
 * **Attention!** This class only works with the EML AdminTool. Please do not use it without the AdminTool.
 */
export default class News {
  private url: string

  /**
   * @param url The URL of your EML AdminTool website.
   */
  constructor(url: string) {
    this.url = `${url}/api`
  }

  /**
   * Get all the news from the EML AdminTool.
   * @returns The list of News.
   */
  async getNews() {
    let res = await fetch(`${this.url}/news`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new EMLLibError(ErrorType.FETCH_ERROR, `Error while fetching News from the EML AdminTool: ${err}`)
      })

    return res.data as News_[]
  }

  /**
   * Get all the News categories from the EML AdminTool.
   * @returns The list of News categories.
   */
  async getCategories() {
    let res = await fetch(`${this.url}/news/categories`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new EMLLibError(ErrorType.FETCH_ERROR, `Error while fetching News Categories from the EML AdminTool: ${err}`)
      })

    return res.data as NewsCategory[]
  }

  /**
   * Get the News of a specific category.
   * @param categoryId The ID of the category (got from `News.getCategories()`).
   * @returns The News if the category exists.
   */
  async getNewsByCategory(categoryId: number) {
    let res = await fetch(`${this.url}/news/categories/${categoryId}`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new EMLLibError(ErrorType.FETCH_ERROR, `Error while fetching News Categories from the EML AdminTool: ${err}`)
      })

    if (res.status === 404) res.data = []

    return res.data as News_[]
  }
}
