/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 * @copyright Copyright (c) 2019, Pierce Harriz, from [Minecraft Launcher Core](https://github.com/Pierce01/MinecraftLauncher-core)
 */

import { FullConfig } from '../../types/config'
import { EMLCoreError, ErrorType } from '../../types/errors'
import { File, Loader } from '../../types/file'
import { Artifact, MinecraftManifest, Assets } from '../../types/manifest'
import utils from '../utils/utils'
import path_ from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'
import EventEmitter from '../utils/events'
import { FilesManagerEvents } from '../../types/events'
import Java from '../java/java'

export default class FilesManager extends EventEmitter<FilesManagerEvents> {
  private config: FullConfig
  private manifest: MinecraftManifest
  private loader: Loader

  constructor(config: FullConfig, manifest: MinecraftManifest, loader: Loader) {
    super()
    this.config = config
    this.manifest = manifest
    this.loader = loader
  }

  async getJava() {
    if (this.config.java.install === 'auto') {
      const java = await new Java(this.manifest.id, this.config.serverId).getFiles()
      return java
    } else {
      return []
    }
  }

  async getModpack() {
    if (!this.config.url) return []

    const res = await fetch(`${this.config.url}/api/files-updater`)
      .then((res) => res.json())
      .catch((err) => {
        throw new EMLCoreError(ErrorType.FETCH_ERROR, `Failed to fetch modpack files: ${err}`)
      })

    return res.data as File[]
  }

  async getLibraries() {
    if (!fs.existsSync(path_.join(this.config.root, `versions/${this.manifest.id}`))) {
      fs.mkdirSync(path_.join(this.config.root, `versions/${this.manifest.id}`), { recursive: true })
    }

    fs.writeFileSync(path_.join(this.config.root, `versions/${this.manifest.id}/${this.manifest.id}.json`), JSON.stringify(this.manifest, null, 2))

    let libraries: File[] = []

    this.manifest.libraries.forEach((lib) => {
      let type: 'LIBRARY' | 'NATIVE'
      let artifact: Artifact | undefined

      if (lib.natives) {
        type = 'NATIVE'
        const classifiers = lib.downloads.classifiers as any
        const native = lib.natives[utils.getOS_MCCode()]
        if (!native) return
        artifact = classifiers ? (classifiers[native.replace('${arch}', utils.getArch())] as unknown as Artifact | undefined) : undefined
      } else {
        if (!utils.isLibAllowed(lib)) return
        type = 'LIBRARY'
        artifact = lib.downloads.artifact
      }

      let name: string
      let path: string

      if (artifact) {
        if (artifact.path) {
          name = artifact.path.split('/').pop()!
          path = path_.join('libraries', artifact.path.split('/').slice(0, -1).join('/'), '/')
        } else {
          name = utils.getLibraryName(lib.name!)
          path = utils.getLibraryPath(lib.name!, 'libraries')
        }

        libraries.push({
          name: name,
          path: path,
          url: artifact.url,
          sha1: artifact.sha1,
          size: artifact.size,
          type: type
        })
      }
    })

    libraries.push({
      name: `${this.manifest.id}.jar`,
      path: path_.join(`versions/${this.manifest.id}/`),
      url: this.manifest.downloads.client.url,
      sha1: this.manifest.downloads.client.sha1,
      size: this.manifest.downloads.client.size,
      type: 'LIBRARY'
    })

    if (this.loader.file) {
      libraries.push(this.loader.file)
    }

    return libraries
  }

  async getAssets() {
    const res = await fetch(this.manifest.assetIndex.url)
      .then((res) => res.json() as Promise<Assets>)
      .catch((err) => {
        throw new EMLCoreError(ErrorType.FETCH_ERROR, `Failed to fetch assets: ${err}`)
      })

    if (!fs.existsSync(path_.join(this.config.root, 'assets/indexes'))) {
      fs.mkdirSync(path_.join(this.config.root, 'assets/indexes'), { recursive: true })
    }

    fs.writeFileSync(path_.join(this.config.root, `assets/indexes/${this.manifest.id}.json`), JSON.stringify(res, null, 2))

    let assets: File[] = []

    Object.values(res.objects).forEach((asset) => {
      assets.push({
        name: asset.hash,
        path: path_.join(`assets/objects/${asset.hash.substring(0, 2)}/`),
        url: `https://resources.download.minecraft.net/${asset.hash.substring(0, 2)}/${asset.hash}`,
        sha1: asset.hash,
        size: asset.size,
        type: 'ASSET'
      })
    })

    return assets
  }

  extractNatives(libraries: File[]) {
    const natives = libraries.filter((lib) => lib.type === 'NATIVE')
    const nativesFolder = path_.join(this.config.root, `versions/${this.manifest.id}/natives`)
    let extracted: File[] = []

    if (!fs.existsSync(nativesFolder)) {
      fs.mkdirSync(nativesFolder)
    }

    natives.forEach((native) => {
      const zip = new AdmZip(path_.join(this.config.root, native.path, native.name))
      zip.getEntries().forEach((entry) => {
        if (!entry.entryName.startsWith('META-INF')) {
          if (entry.isDirectory) {
            fs.mkdirSync(`${nativesFolder}/${entry.entryName}`, { recursive: true })
          } else {
            fs.writeFileSync(`${nativesFolder}/${entry.entryName}`, zip.readFile(entry)!)
          }

          extracted.push({
            name: path_.join(entry.entryName).replaceAll('\\', '/').split('/').pop()!,
            path: path_.join(`versions/${this.manifest.id}/natives/${entry.entryName}`.replaceAll('\\', '/').split('/').slice(0, -1).join('/'), '/'),
            url: '',
            sha1: '',
            size: entry.header.size,
            type: entry.isDirectory ? 'FOLDER' : 'NATIVE'
          })
        }
      })

      this.emit('extract_progress', { filename: native.name })
    })

    this.emit('extract_end', { amount: extracted.length })

    return extracted
  }

  copyAssets() {
    let copied: File[] = []

    if (this.manifest.assets === 'legacy' || this.manifest.assets === 'pre-1.6') {
      if (fs.existsSync(path_.join(this.config.root, 'assets', 'legacy'))) {
        this.emit('copy_debug', "The 'assets/legacy' directory is no longer used. You can safely remove it from your server's root directory.")
      }

      const assets = JSON.parse(fs.readFileSync(path_.join(this.config.root, `assets/indexes/${this.manifest.id}.json`), 'utf-8')) as Assets

      Object.entries(assets.objects).forEach(([path, { hash, size }]) => {
        const assetLegacyPath = path_.join('resources', path.split('/').slice(0, -1).join('/'))
        const assetLegacyName = path.split('/').pop()!

        if (!fs.existsSync(path_.join(this.config.root, assetLegacyPath))) {
          fs.mkdirSync(path_.join(this.config.root, assetLegacyPath), { recursive: true })
        }

        if (!fs.existsSync(path_.join(assetLegacyPath, assetLegacyName))) {
          fs.copyFileSync(
            path_.join(this.config.root, 'assets', 'objects', hash.substring(0, 2), hash),
            path_.join(this.config.root, assetLegacyPath, assetLegacyName)
          )
        }

        copied.push({
          name: assetLegacyName,
          path: assetLegacyPath,
          url: '',
          sha1: hash,
          size: size,
          type: 'ASSET'
        })

        this.emit('copy_progress', { filename: hash, dest: path_.join(assetLegacyPath, assetLegacyName) })
      })

      this.emit('copy_end', { amount: copied.length })
    }
    return copied
  }
}
