/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { Account } from '../../types/account'
import { EMLCoreError, ErrorType } from './../../types/errors'

export default class CrackAuth {
  /**
   * @deprecated This auth method is not secure, use it only for testing purposes or for local servers!
   */
  auth(username: string): Account {
    if (/^[a-zA-Z0-9_]+$/gm.test(username) && username.length > 2) {
      return {
        name: username,
        uuid: '',
        accessToken: '',
        clientToken: '',
        meta: {
          online: false,
          type: 'Crack'
        }
      }
    } else {
      throw new EMLCoreError(ErrorType.AUTH_ERROR, 'Invalid username')
    }
  }
}
