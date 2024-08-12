/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { Account } from '../../types/account'
import { EMLCoreError, ErrorType } from '../../types/errors'

export default class AzAuth {
  private url: string

  /**
   * @param url The URL of your Azuriom website.
   */
  constructor(url: string) {
    if (url.endsWith('/')) url = url.slice(0, -1)
    this.url = `${url}/api/auth`
  }

  /**
   * Authenticate a user with Azuriom.
   * @param username The username or email of the user.
   * @param password The password of the user.
   * @param twoFACode [Optional] The 2FA code if the user has 2FA enabled.
   * @returns The account information.
   */
  async auth(username: string, password: string, twoFACode?: string): Promise<Account> {
    const res = await fetch(`${this.url}/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: username,
        password: password,
        code: twoFACode
      })
    }).then((res: any) => res.json())

    if (res.status == 'pending' && res.reason == '2fa') {
      throw new EMLCoreError(ErrorType.TWOFA_CODE_REQUIRED, '2FA code required')
    }

    if (res.status == 'error') {
      throw new EMLCoreError(ErrorType.AUTH_ERROR, `AzAuth authentication failed: ${res.reason}`)
    }

    return {
      name: res.username,
      uuid: res.uuid,
      accessToken: res.accessToken,
      clientToken: res.clientToken,
      userProperties: {},
      meta: {
        online: false,
        type: 'azuriom'
      }
    }
  }

  /**
   * Verify a user with Azuriom. This method will renew the user's token.
   * @param user The user account to verify.
   * @returns The renewed account information.
   */
  async verify(user: Account): Promise<Account> {
    const res = await fetch(`${this.url}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: user.accessToken
      })
    }).then((res: any) => res.json())

    if (res.status == 'error') {
      throw new EMLCoreError(ErrorType.AUTH_ERROR, `AzAuth verify failed: ${res.reason}`)
    }

    return {
      name: res.username,
      uuid: res.uuid,
      accessToken: res.accessToken,
      clientToken: res.clientToken,
      userProperties: {},
      meta: {
        online: false,
        type: 'azuriom'
      }
    }
  }

  /**
   * Logout a user from Azuriom.
   * @param user The account of the user.
   */
  async logout(user: Account): Promise<void> {
    await fetch(`${this.url}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: user.accessToken
      })
    })
  }
}
