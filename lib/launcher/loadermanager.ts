/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { FullConfig } from '../../types/config'
import { Loader } from '../../types/file'
import { MinecraftManifest } from '../../types/manifest'
import ForgeLoader from './loaders/forgeloader'

export default class LoaderManager {
  private config: FullConfig
  private manifest: MinecraftManifest
  private loader: Loader

  constructor(config: FullConfig, manifest: MinecraftManifest, loader: Loader) {
    this.config = config
    this.manifest = manifest
    this.loader = loader
  }

  async setupLoader() {
    if (this.loader.loader === 'forge') {
      const forgeLoader = new ForgeLoader(this.config, this.manifest, this.loader)
      await forgeLoader.setup()
    }
  }
}
