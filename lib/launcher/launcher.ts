/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { CleanerEvents, DownloaderEvents, FilesManagerEvents, LauncherEvents } from '../../types/events'
import EventEmitter from '../utils/events'
import manifests from '../utils/manifests'
import utils from '../utils/utils'
import { Config, FullConfig } from './../../types/config'
import path from 'path'
import FilesManager from './filesmanager'
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
    config.minecraft = {
      version: config.minecraft?.version ? config.minecraft?.version : config.url ? null : 'latest_release',
      args: config.minecraft?.args || []
    }
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
      min: config.memory?.min || 512,
      max: config.memory?.max && config.memory.max > (config.memory.min || 512) ? config.memory.max : 1023
    }

    this.config = { ...(config as FullConfig), root: utils.getServerFolder(config.serverId) }
  }

  async launch() {
    const manifest = await manifests.getMinecraftManifest(this.config.minecraft.version, this.config.url)
    const loader = await manifests.getLoaderInfo(this.config.minecraft.version, this.config.url)
    this.config.minecraft.version = manifest.id

    const filesManager = new FilesManager(this.config, manifest, loader)
    const downloader = new Downloader(utils.getServerFolder(this.config.serverId))
    const cleaner = new Cleaner(utils.getServerFolder(this.config.serverId))
    const java = new Java(manifest.id, this.config.serverId)

    filesManager.forwardEvents(this)
    downloader.forwardEvents(this)
    cleaner.forwardEvents(this)

    this.emit('launch_compute_download')

    const javaFiles = await filesManager.getJava()
    const modpackFiles = await filesManager.getModpack()
    const librariesFiles = await filesManager.getLibraries()
    const assetsFiles = await filesManager.getAssets()

    const javaFilesToDownload = downloader.getFilesToDownload(javaFiles)
    const modpackFilesToDownload = downloader.getFilesToDownload(modpackFiles)
    const librariesFilesToDownload = downloader.getFilesToDownload(librariesFiles)
    const assetsFilesToDownload = downloader.getFilesToDownload(assetsFiles)
    const filesToDownload = [...javaFilesToDownload, ...modpackFilesToDownload, ...librariesFilesToDownload, ...assetsFilesToDownload]

    this.emit('launch_download', { total: { amount: filesToDownload.length, size: filesToDownload.reduce((acc, file) => acc + file.size!, 0) } })

    await downloader.download(javaFilesToDownload, true)
    await downloader.download(modpackFilesToDownload, true)
    await downloader.download(librariesFilesToDownload, true)
    await downloader.download(filesToDownload, true)

    this.emit('launch_install_loader', loader)

    

    this.emit('launch_extract_natives')

    const extractedNatives = filesManager.extractNatives(librariesFiles)
    const copiedAssets = filesManager.copyAssets()

    this.emit('launch_check_java')

    java.check(this.config.java.absolutePath)

    const files = [...javaFiles, ...modpackFiles, ...librariesFiles, ...assetsFiles, ...extractedNatives, ...copiedAssets]
    const ignore = [...this.config.ignored, `versions/${manifest.id}/${manifest.id}.json`, `assets/indexes/${manifest.id}.json`]
    cleaner.clean(files, ignore)

    const versionDirectory = path.join(this.config.root, 'versions', manifest.id)
    const clientJarPath = path.join(versionDirectory, `${manifest.id}.jar`)
    const nativeDirectory = path.join(versionDirectory, 'natives')

    const args = []
    const jvm = [
      '-XX:-UseAdaptiveSizePolicy',
      '-XX:-OmitStackTraceInFastThrow',
      '-Dfml.ignorePatchDiscrepancies=true',
      '-Dfml.ignoreInvalidMinecraftCertificates=true',
      `-Djava.library.path=${nativeDirectory}`,
      `-Xmx${this.config.memory.max}M`,
      `-Xms${this.config.memory.min}M`
    ]
  }
}
