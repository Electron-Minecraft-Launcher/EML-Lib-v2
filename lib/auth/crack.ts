/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

export default class CrackAuth {
  /**
   * @deprecated This auth method is not secure, use it only for testing purposes or for local servers!
   */
  auth(username: string) {
    if (/^[a-zA-Z0-9_]+$/gm.test(username) && username.length > 2) {
      return true
    } else {
      return false
    }
  }
}
