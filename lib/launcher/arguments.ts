/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 * @copyright Copyright (c) 2019, Pierce Harriz, from [Minecraft Launcher Core](https://github.com/Pierce01/MinecraftLauncher-core)
 */

import { FullConfig } from '../../types/config'
import { MinecraftManifest } from '../../types/manifest'
import utils from '../utils/utils'
import path from 'path'

export default class Arguments {
  private config: FullConfig
  private manifest: MinecraftManifest
  private root: string

  constructor(config: FullConfig, manifest: MinecraftManifest) {
    this.config = config
    this.manifest = manifest
    this.root = path.join(utils.getServerFolder(this.config.serverId))
  }

  getJvm() {
    const opts = {
      win: '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump',
      mac: '-XstartOnFirstThread',
      lin: '-Xss1M'
    }
    return opts[utils.getOS()]
  }
}
