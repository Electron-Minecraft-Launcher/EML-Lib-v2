/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { ClientError, ErrorType } from '../../models/errors.model'
import { News as News_, NewsCategory } from '../../models/news.model'

/**
 * **Attention!** This class only works with the EML AdminTool. Please do not use it without the AdminTool.
 */
export default class News {
  private url: string

  /**
   * @param url The URL of your EML AdminTool website
   */
  constructor(url: string) {
    if (!url) throw new Error('No URL given for News')
    this.url = `${url}/api`
  }

  async getNews(): Promise<News_[]> {
    let res = await fetch(`${this.url}/news`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.FETCH_ERROR, `Error while fetching News from the EML AdminTool: ${err}`)
      })

    return res.data
  }

  async getCategories(): Promise<NewsCategory[]> {
    let res = await fetch(`${this.url}/news/categories`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.FETCH_ERROR, `Error while fetching News Categories from the EML AdminTool: ${err}`)
      })

    return res
  }

  /**
   * News can be filtered by category.
   * @param id The ID of the category (got from `this.getCategories()`)
   */
  async getNewsByCategory(id: number): Promise<News_[]> {
    let res = await fetch(`${this.url}/news/categories/${id}`, { method: 'GET' })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.FETCH_ERROR, `Error while fetching News Categories from the EML AdminTool: ${err}`)
      })

    return res
  }
}
