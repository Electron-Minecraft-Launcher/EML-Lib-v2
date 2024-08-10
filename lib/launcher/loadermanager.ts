/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { FullConfig } from '../../types/config'
import { FilesManagerEvents } from '../../types/events'
import { File, Loader } from '../../types/file'
import { MinecraftManifest } from '../../types/manifest'
import EventEmitter from '../utils/events'
import ForgeLoader from './loaders/forgeloader'
import Patcher from './loaders/patcher'

export default class LoaderManager extends EventEmitter<FilesManagerEvents> {
  private config: FullConfig
  private manifest: MinecraftManifest
  private loader: Loader

  constructor(config: FullConfig, manifest: MinecraftManifest, loader: Loader) {
    super()
    this.config = config
    this.manifest = manifest
    this.loader = loader
  }

  async setupLoader() {
    let setup = { loaderManifest: null as null | MinecraftManifest, installProfile: null as any, libraries: [] as File[], files: [] as File[] }

    if (this.loader.loader === 'forge') {
      const forgeLoader = new ForgeLoader(this.config, this.manifest, this.loader)
      setup = forgeLoader.setup()
    }

    return setup
  }

  patchLoader(installProfile: any) {
    if (this.loader.loader === 'forge' && installProfile) {
      const patcher = new Patcher(this.config, this.manifest, this.loader, installProfile)
      return patcher.patch()
    }

    return []
  }
}
