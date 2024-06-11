export interface Account {
  name: string
  uuid: string
  accessToken: string
  clientToken: string
  refreshToken?: string
  userProperties: any
  meta: {
    online: boolean
    type: 'Mojang' | 'Xbox' | 'Azuriom' | 'Crack'
  }
  xbox?: {
    xuid: string
    gamertag: string
    ageGroup: string
  }
}
