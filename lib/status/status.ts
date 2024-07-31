/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import * as net from 'net'
import { ServerStatus as ServerStatus_ } from '../../models/status.model'

export default class ServerStatus {
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

  async getStatus(): Promise<ServerStatus_> {
    return new Promise((resolve) => {
      let start = +new Date()
      let client = net.connect(this.port, this.ip, () => {
        client.write(Buffer.from([0xfe, 0x01]))
      })

      client.on('data', (data) => {
        if (data != null) {
          let infos = data.toString().split('\x00\x00\x00')
          resolve({
            success: true,
            ms: Math.round(+new Date() - start),
            version: infos[2].replace(/\u0000/g, ''),
            nameServer: infos[3].replace(/\u0000/g, ''),
            playersConnect: +infos[4].replace(/\u0000/g, ''),
            playersMax: +infos[5].replace(/\u0000/g, '')
          } as ServerStatus_)
        }
        client.end()
      })

      client.on('timeout', () => {
        resolve({ success: false, message: 'Timed out' } as ServerStatus_)
        client.end()
      })

      client.on('err', (err) => {
        resolve({ success: false, message: err } as ServerStatus_)
        console.error(err)
      })
    })
  }
}
