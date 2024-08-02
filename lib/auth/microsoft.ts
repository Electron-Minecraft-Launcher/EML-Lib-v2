/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { BrowserWindow } from 'electron'
// import fetch from 'node-fetch'
import MicrosoftAuthGui from './microsoft-gui'
import { Account } from '../../types/auth'
import { ClientError, ErrorType } from '../../types/errors'

export default class MicrosoftAuth {
  private mainWindow: BrowserWindow
  private clientId: string

  /**
   * @param mainWindow Your electron application's main window (to create a child window for the Microsoft login).
   * @param clientId [Optional] Your Microsoft application's client ID.
   */
  constructor(mainWindow: BrowserWindow, clientId?: string) {
    this.mainWindow = mainWindow
    this.clientId = clientId || '00000000402b5328'
  }

  /**
   * Authenticate a user with Microsoft. This method will open a child window to login.
   * @returns The account information.
   */
  async auth(): Promise<Account> {
    let userCode = await new MicrosoftAuthGui(this.mainWindow, this.clientId).openWindow()
    if (userCode == 'cancel') throw new ClientError(ErrorType.AUTH_CANCELLED, 'User cancelled the login')

    let res = await fetch('https://login.live.com/oauth20_token.srf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `client_id=${this.clientId}&code=${userCode}&grant_type=authorization_code&redirect_uri=https://login.live.com/oauth20_desktop.srf`
    })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.AUTH_ERROR, 'Error while getting the OAuth2 token')
      })

    try {
      return await this.getAccount(res)
    } catch (err: unknown) {
      throw err
    }
  }

  /**
   * Verify a user with Microsoft. This method will renew the user's token.
   * @param user The user account to verify.
   * @returns The renewed account information.
   */
  async verify(user: Account): Promise<Account> {
    let res = await fetch('https://login.live.com/oauth20_token.srf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `client_id=${this.clientId}&grant_type=refresh_token&refresh_token=${user.refreshToken}`
    })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.AUTH_ERROR, 'Error while getting the OAuth2 token')
      })

    try {
      return await this.getAccount(res)
    } catch (err: unknown) {
      throw err
    }
  }

  private async getAccount(authInfo: any): Promise<Account> {
    let xboxLive = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
      method: 'POSt',
      body: JSON.stringify({
        Properties: {
          AuthMethod: 'RPS',
          SiteName: 'user.auth.xboxlive.com',
          RpsTicket: 'd=' + authInfo.access_token
        },
        RelyingParty: 'http://auth.xboxlive.com',
        TokenType: 'JWT'
      }),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
    })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.AUTH_ERROR, 'Error while getting the Xbox Live token')
      })

    let xsts = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        Properties: {
          SandboxId: 'RETAIL',
          UserTokens: [xboxLive.Token]
        },
        RelyingParty: 'rp://api.minecraftservices.com/',
        TokenType: 'JWT'
      })
    })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.AUTH_ERROR, 'Error while getting the XSTS token')
      })

    let launch = await fetch('https://api.minecraftservices.com/launcher/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ xtoken: `XBL3.0 x=${xboxLive.DisplayClaims.xui[0].uhs};${xsts.Token}`, platform: 'PC_LAUNCHER' })
    })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.AUTH_ERROR, 'Error while launching the game')
      })

    let mcLogin = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identityToken: `XBL3.0 x=${xboxLive.DisplayClaims.xui[0].uhs};${xsts.Token}` })
    })
      .then((res) => res.json())
      .catch((err) => {
        throw new ClientError(ErrorType.AUTH_ERROR, 'Error while logging into Minecraft')
      })

    let hasGame = await fetch('https://api.minecraftservices.com/entitlements/mcstore', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${mcLogin.access_token}`
      }
    }).then((res: any) => res.json())

    if (!hasGame.items.find((i: any) => i.name == 'product_minecraft' || i.name == 'game_minecraft')) {
      throw new ClientError(ErrorType.AUTH_ERROR, 'Minecraft not owned')
    }

    let profile: { uuid: any; name: any }

    try {
      profile = await this.getProfile(mcLogin)
    } catch (err: unknown) {
      throw err
    }

    return {
      name: profile.name,
      uuid: profile.uuid,
      accessToken: mcLogin.access_token,
      clientToken: this.getUuid(),
      refreshToken: authInfo.refresh_token,
      userProperties: {},
      meta: {
        online: true,
        type: 'Xbox'
      }
    }
  }

  private async getProfile(mcLogin: any) {
    let profile = await fetch('https://api.minecraftservices.com/minecraft/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${mcLogin.access_token}`
      }
    }).then((res: any) => res.json())
    if (profile.error) throw new ClientError(ErrorType.AUTH_ERROR, 'Error while getting the Minecraft profile')

    return {
      uuid: profile.id,
      name: profile.name
    }
  }

  private getUuid() {
    var result = ''
    for (var i = 0; i <= 4; i++) {
      result += (Math.floor(Math.random() * 16777216) + 1048576).toString(16)
      if (i < 4) result += '-'
    }
    return result
  }
}
