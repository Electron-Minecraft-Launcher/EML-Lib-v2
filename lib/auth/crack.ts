/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { Account } from '../../types/account'
import { EMLLibError, ErrorType } from './../../types/errors'
import { v4 } from 'uuid'

/**
 * Authenticate a user with a crack account.
 * @deprecated This auth method is not secure, use it only for testing purposes or for local servers!
 */
export default class CrackAuth {
  /**
   * 
   * @deprecated This auth method is not secure, use it only for testing purposes or for local servers!
   */
  auth(username: string): Account {
    if (/^[a-zA-Z0-9_]+$/gm.test(username) && username.length > 2) {
      const uuid = v4()
      return {
        name: username,
        uuid: uuid,
        accessToken: uuid,
        clientToken: uuid,
        meta: {
          online: false,
          type: 'crack'
        }
      }
    } else {
      throw new EMLLibError(ErrorType.AUTH_ERROR, 'Invalid username')
    }
  }
}
