/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { ClientError, ErrorType } from '../../types/errors'
import { News as News_, NewsCategory } from '../../types/news'

/**
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
   * Get all the news.
   * @returns The list of News.
   */
  async getNews(): Promise<News_[]> {
    let res = await fetch(`${this.url}/news`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.FETCH_ERROR, `Error while fetching News from the EML AdminTool: ${err}`)
      })

    return res.data as News_[]
  }

  /**
   * Get all the categories of the News.
   * @returns The list of News Categories.
   */
  async getCategories(): Promise<NewsCategory[]> {
    let res = await fetch(`${this.url}/news/categories`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.FETCH_ERROR, `Error while fetching News Categories from the EML AdminTool: ${err}`)
      })

    return res.data as NewsCategory[]
  }

  /**
   * Get the News of a specific category.
   * @param id The ID of the category (got from `this.getCategories()`).
   * @returns The News if the category.
   */
  async getNewsByCategory(id: number): Promise<News_[]> {
    let res = await fetch(`${this.url}/news/categories/${id}`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.FETCH_ERROR, `Error while fetching News Categories from the EML AdminTool: ${err}`)
      })

    return res.data as News_[]
  }
}
