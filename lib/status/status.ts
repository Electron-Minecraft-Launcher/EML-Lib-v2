/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import * as net from 'net'

export default class Status {
  private ip: string
  private port: number

  /**
   * @param ip Your Minecraft Server's IP or Host (eg. `'172.65.236.36'` or `'mc.hypixel.net'`)
   * @param port [Optional: default is `25565`] Your Minecraft Server's main port (eg. 25565)
   */
  constructor(ip: string, port: number = 25565) {
    if (!ip) throw new Error('No IP or host given')
    this.ip = ip
    this.port = port
  }

  async getStatus() {
    return new Promise((resolve) => {
      let start = +(new Date())
      let client = net.connect(this.port, this.ip, () => {
        client.write(Buffer.from([0xfe, 0x01]))
      })

      client.on('data', (data) => {
        if (data != null) {
          let infos = data.toString().split('\x00\x00\x00')
          resolve({
            error: false,
            ms: Math.round(+(new Date()) - start),
            version: infos[2].replace(/\u0000/g, ''),
            nameServer: infos[3].replace(/\u0000/g, ''),
            playersConnect: infos[4].replace(/\u0000/g, ''),
            playersMax: infos[5].replace(/\u0000/g, '')
          })
        }
        client.end()
      })

      client.on('timeout', () => {
        resolve({ error: true, message: 'Timed out' })
        client.end()
      })

      client.on('err', (err) => {
        resolve({ error: true, message: err })
        console.error(err)
      })
    })
  }
}
