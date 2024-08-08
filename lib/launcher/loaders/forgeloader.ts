/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { FullConfig } from '../../../types/config'
import { File, Loader } from '../../../types/file'
import { Artifact, MinecraftManifest } from '../../../types/manifest'
import AdmZip from 'adm-zip'
import fs from 'fs'
import path_ from 'path'
import utils from '../../utils/utils'
import { EMLCoreError, ErrorType } from '../../../types/errors'
import EventEmitter from '../../utils/events'

export default class ForgeLoader extends EventEmitter<any> {
  private config: FullConfig
  private manifest: MinecraftManifest
  private loader: Loader

  constructor(config: FullConfig, manifest: MinecraftManifest, loader: Loader) {
    super()
    this.config = config
    this.manifest = manifest
    this.loader = loader
  }

  async setup() {
    const forgePath = path_.join(this.config.root, this.loader.file!.path)
    const minecraftPath = path_.join(this.config.root, 'versions', this.manifest.id)
    const zip = new AdmZip(path_.join(forgePath, this.loader.file!.name))
    const jar = new AdmZip(path_.join(minecraftPath, `${this.manifest.id}.jar`))

    if (!fs.existsSync(forgePath)) fs.mkdirSync(forgePath, { recursive: true })

    const { forgeManifest, libraries } =
      this.loader.loader_type !== 'installer'
        ? this.extractZip(forgePath, minecraftPath, zip, jar)
        : this.extractJar(forgePath, minecraftPath, zip, jar)
  }

  private extractZip(forgePath: string, minecraftPath: string, zip: AdmZip, jar: AdmZip) {
    jar.deleteFile('META-INF/')

    zip.getEntries().forEach((entry) => {
      if (!entry.isDirectory) jar.addFile(entry.entryName, entry.getData())
    })

    jar.writeZip(path_.join(minecraftPath, `${this.manifest.id}.jar`))

    const forgeManifest = { ...this.manifest, id: `forge-${this.loader.loader_version}`, libraries: [] }

    fs.writeFileSync(path_.join(forgePath, `${forgeManifest.id}.json`), JSON.stringify(forgeManifest, null, 2))

    return { forgeManifest, libraries: [] }
  }

  private extractJar(forgePath: string, minecraftPath: string, zip: AdmZip, jar: AdmZip) {
    //* Extract install profile
    let installProfile = JSON.parse(zip.getEntry('install_profile.json')?.getData().toString('utf8') + '')
    let forgeManifest: MinecraftManifest

    if (installProfile.install) {
      forgeManifest = installProfile.versionInfo
      installProfile = installProfile.install
    } else {
      forgeManifest = JSON.parse(zip.getEntry(path_.basename(installProfile.json))?.getData().toString('utf8') + '')
    }

    fs.writeFileSync(path_.join(forgePath, `forge-${this.loader.loader_version}.json`), JSON.stringify(forgeManifest, null, 2))

    //* Extract universal
    const lib = utils.getLibraryPath(installProfile.path)
    const path = path_.join(this.config.root, 'libraries', lib.path)
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true })

    if (installProfile.filePath) {
      fs.writeFileSync(path_.join(path, lib.name), zip.getEntry(installProfile.filePath)!.getData())
    } else if (installProfile.path) {
      zip
        .getEntries()
        .filter((entry) => entry.entryName.startsWith(`maven/${lib.path}`))
        .forEach((entry) => fs.writeFileSync(path_.join(path, entry.entryName.split('/').pop()!), entry.getData()))
    }

    if (installProfile.processors) {
      const universalMaven = installProfile.libraries.find((lib: any) => (lib.name + '').startsWith('net.minecraftforge:forge:'))
      const clientDataName = utils.getLibraryPath(installProfile.path || universalMaven.name).name.replace('.jar', '-clientdata.lzma')
      const clientDataPath = path_.join(this.config.root, 'libraries', utils.getLibraryPath(installProfile.path || universalMaven.name).path)
      const clientData = zip.getEntry('data/client.lzma')!.getData()

      if (!fs.existsSync(clientDataPath)) fs.mkdirSync(clientDataPath, { recursive: true })
      fs.writeFileSync(path_.join(clientDataPath, clientDataName), clientData)
    }

    //* Install libraries
    let libraries: File[] = []
    const forgeLibraries = ([...forgeManifest.libraries, ...installProfile.libraries] as MinecraftManifest['libraries']).filter(
      (lib, i, array) => i === array.findIndex((l) => l.name === lib.name)
    )

    const skip = installProfile.path || installProfile.filePath ? ['net.minecraftforge:forge:', 'net.minecraftforge:minecraftforge:'] : []

    forgeLibraries.forEach(async (lib) => {
      if (skip.some((s) => (lib.name + '').includes(s)) && !lib.downloads?.artifact?.url) return

      let type: 'LIBRARY' | 'NATIVE'
      let artifact: Artifact | undefined
      let native: string | undefined

      if (lib.natives) {
        native = lib.natives[utils.getOS_MCCode()]
        if (!native) return
        type = 'NATIVE'
      } else {
        if (!utils.allowLib(lib)) return
        type = 'LIBRARY'
      }

      artifact = lib.downloads.artifact

      let name: string = ''
      let path: string = ''

      if (artifact) {
        if (artifact.path) {
          name = artifact.path.split('/').pop()!
          path = path_.join('libraries', artifact.path.split('/').slice(0, -1).join('/'), '/')
        } else {
          name = utils.getLibraryPath(lib.name + '').name
          if (type === 'NATIVE') name = name.replace('.jar', `-${native}.jar`)
          path = path_.join('libraries', utils.getLibraryPath(lib.name + '').path)
        }
      } else {
        artifact = await this.getMirrorUrl(lib.name + '')
      }

      libraries.push({
        name: name,
        path: path,
        url: artifact.url,
        sha1: artifact.sha1,
        size: artifact.size,
        type: type
      })
    })

    return { forgeManifest, libraries }
  }

  private async getMirrorUrl(lib: string) {
    const mirrors = ['https://maven.minecraftforge.net/', 'https://maven.creeperhost.net/']

    for (const mirror of mirrors) {
      const url = `${mirror}${lib}`
      const res1 = await fetch(url)
        .then((res) => (res.headers.get('Content-Length') || 0) as number)
        .catch(() => false as false)

      if (!res1) continue

      const res2 = await fetch(`${url}.sha1`)
        .then((res) => res.text())
        .catch(() => false as false)

      if (!res2) continue

      return { url, size: res1, sha1: res2 }
    }

    throw new EMLCoreError(ErrorType.FETCH_ERROR, `Error while getting mirror URL for the library ${lib}`)
  }
}
