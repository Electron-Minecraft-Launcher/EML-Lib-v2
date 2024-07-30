/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { Account } from '../../models/auth'
import { ClientError } from '../../models/errors'

export default class AzAuth {
  private url: string

  /**
   * @param url The URL of your Azuriom website
   */
  constructor(url: string) {
    if (url) {
      if (url.endsWith('/')) url = url.slice(0, -1)
      this.url = `${url}/api/auth`
    } else throw new Error('No URL given for AzAuth')
  }

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
      throw new ClientError('TWOFA_CODE_REQUIRED', '2FA code required')
    }

    if (res.status == 'error') {
      throw new ClientError('UNKNOWN_ERROR', res.reason)
    }

    return {
      name: res.username,
      uuid: res.uuid,
      accessToken: res.accessToken,
      clientToken: res.clientToken,
      userProperties: {},
      meta: {
        online: false,
        type: 'Azuriom'
      }
    }
  }

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
      throw new ClientError('UNKNOWN_ERROR', res.reason)
    }

    return {
      name: res.username,
      uuid: res.uuid,
      accessToken: res.accessToken,
      clientToken: res.clientToken,
      userProperties: {},
      meta: {
        online: false,
        type: 'Azuriom'
      }
    }
  }

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
