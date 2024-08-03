/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 * @copyright Copyright (c) 2019, Pierce Harriz
 */

import { CleanerEvents, DownloaderEvents, FilesManagerEvents, LauncherEvents } from '../../types/events'
import EventEmitter from '../utils/events'
import manifests from '../utils/manifests'
import utils from '../utils/utils'
import { Config, FullConfig } from './../../types/config'
import path from 'path'
import FilesManager from './files-manager'
import Downloader from '../utils/downloader'
import Cleaner from '../utils/cleaner'
import Java from '../java/java'

export default class Launcher extends EventEmitter<LauncherEvents & DownloaderEvents & CleanerEvents & FilesManagerEvents> {
  private config: FullConfig

  /**
   * @param config The configuration of the launcher.
   */
  constructor(config: Config) {
    super()

    config.ignored = config.ignored || [
      'runtime/',
      'crash-reports/',
      'logs/',
      'resourcepacks/',
      'resources/',
      'saves/',
      'shaderpacks/',
      'options.txt',
      'optionsof.txt'
    ]
    config.minecraft.loader = config.minecraft.loader || 'vanilla'
    config.minecraft.args = config.minecraft.args || []
    config.java = {
      install: config.java?.install || 'auto',
      absolutePath: config.java?.absolutePath
        ? config.java.absolutePath
        : config.java?.relativePath
          ? path.join(utils.getServerFolder(config.serverId), config.java.relativePath, '/')
          : path.join(utils.getServerFolder(config.serverId), 'runtime/jre/bin/java'),
      args: config.java?.args || []
    }
    config.window = {
      width: config.window?.width || 854,
      height: config.window?.height || 480,
      fullscreen: config.window?.fullscreen || false
    }
    config.memory = {
      min: config.memory?.min || 1024,
      max: config.memory?.max || 2048
    }

    this.config = config as FullConfig
  }

  async launch() {
    const manifest = await manifests.getMinecraftManifest(this.config.minecraft.version)
    const filesManager = new FilesManager(this.config, manifest)
    const downloader = new Downloader(utils.getServerFolder(this.config.serverId))
    const cleaner = new Cleaner(utils.getServerFolder(this.config.serverId))
    const java = new Java(manifest.id, this.config.serverId)

    filesManager.forwardEvents(this)
    downloader.forwardEvents(this)
    cleaner.forwardEvents(this)

    const javaFiles = await filesManager.getJava()
    const modpackFiles = await filesManager.getModpack()
    const librariesFiles = await filesManager.getLibraries()
    const assetsFiles = await filesManager.getAssets()
    const files = downloader.getFilesToDownload([...javaFiles, ...modpackFiles, ...librariesFiles, ...assetsFiles])

    this.emit('launch_download', { total: { amount: files.length, size: files.reduce((acc, file) => acc + (file.size || 0), 0) } })

    await downloader.download(javaFiles)
    await downloader.download(modpackFiles)
    await downloader.download(librariesFiles)
    await downloader.download(assetsFiles)

    const extractedNatives = filesManager.extractNatives(librariesFiles)
    const copiedAssets = filesManager.copyAssets()

    this.emit('launch_debug', 'Checking Java...')

    await java.check(this.config.java.absolutePath)

    cleaner.clean(
      [...javaFiles, ...modpackFiles, ...librariesFiles, ...assetsFiles, ...extractedNatives, ...copiedAssets],
      [...this.config.ignored, `versions/${manifest.id}/${manifest.id}.json`, `assets/indexes/${manifest.id}.json`]
    )
  }
}
