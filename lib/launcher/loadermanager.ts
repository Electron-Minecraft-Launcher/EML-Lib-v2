/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { FullConfig } from '../../types/config'
import { FilesManagerEvents, PatcherEvents } from '../../types/events'
import { File, Loader } from '../../types/file'
import { MinecraftManifest } from '../../types/manifest'
import EventEmitter from '../utils/events'
import ForgeLoader from './loaders/forgeloader'
import Patcher from './loaders/patcher'

export default class LoaderManager extends EventEmitter<FilesManagerEvents & PatcherEvents> {
  private config: FullConfig
  private manifest: MinecraftManifest
  private loader: Loader

  constructor(config: FullConfig, manifest: MinecraftManifest, loader: Loader) {
    super()
    this.config = config
    this.manifest = manifest
    this.loader = loader
  }

  /**
   * Setup the loader.
   * @returns `loaderManifest`: Loader manifest; `installProfile`: Install profile; `libraries`: libraries
   * files; `files`: all files created by the method or that will be created (including `libraries`).
   */
  async setupLoader() {
    let setup = { loaderManifest: null as null | MinecraftManifest, installProfile: null as any, libraries: [] as File[], files: [] as File[] }

    if (this.loader.loader === 'forge') {
      const forgeLoader = new ForgeLoader(this.config, this.manifest, this.loader)
      forgeLoader.forwardEvents(this)
      setup = await forgeLoader.setup()
    }

    return setup
  }

  /**
   * Patch the loader.
   * @param installProfile The install profile from `LoaderManager.setupLoader()`.
   * @returns `files`: all files created by the method.
   */
  patchLoader(installProfile: any) {
    if (this.loader.loader === 'forge' && installProfile) {
      const patcher = new Patcher(this.config, this.manifest, this.loader, installProfile)
      patcher.forwardEvents(this)
      return { files: patcher.patch() }
    }

    return { files: [] }
  }
}
