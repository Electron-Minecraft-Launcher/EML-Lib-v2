/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import AdmZip from 'adm-zip'
import { FullConfig } from '../../../types/config'
import { Loader } from '../../../types/file'
import { MinecraftManifest } from '../../../types/manifest'
import utils from '../../utils/utils'
import fs from 'fs'
import path_ from 'path'
import { spawnSync } from 'child_process'
import { File } from '../../../types/file'

export default class Patcher {
  private config: FullConfig
  private manifest: MinecraftManifest
  private loader: Loader
  private installProfile: any

  constructor(config: FullConfig, manifest: MinecraftManifest, loader: Loader, installProfile: any) {
    this.config = config
    this.manifest = manifest
    this.loader = loader
    this.installProfile = installProfile
  }

  patch() {
    const files = this.isPatched()
    if (!this.installProfile.processors || this.installProfile.processors.length === 0 || files.patched) return files.files

    const processors = this.installProfile.processors

    processors.forEach(async (processor: any) => {
      if (processor?.sides && !processor.sides.includes('client')) return

      const jarExtractPathName = path_.join(this.config.root, 'libraries', utils.getLibraryPath(processor.jar), utils.getLibraryName(processor.jar))
      const args = (processor.args as string[]).map(this.mapArg).map(this.mapPath)
      const classpath = (processor.classpath as string[]).map(
        (cp) => `"${path_.join(this.config.root, 'libraries', utils.getLibraryPath(cp), utils.getLibraryName(cp))}"`
      )
      const mainClass = this.getJarMain(jarExtractPathName)!

      const patch = spawnSync(
        `"${this.config.java.absolutePath}"`,
        ['-classpath', [`"${jarExtractPathName}"`, ...classpath].join(path_.delimiter), mainClass, ...args],
        { shell: true }
      )

      // TODO if (patch.error) this.emit('debug', patch.error)
      // TODO if (patch.status === 0) this.emit('patch', `Patched ${processor.jar}`)
    })

    return files.files
  }

  private isPatched() {
    const processors = this.installProfile.processors

    let patched = true
    let files: File[] = []
    let libraries: string[] = []

    processors.forEach((processor: any) => {
      if (processor?.sides && !processor.sides.includes('client')) return

      processor.args.forEach((arg: string) => {
        arg = arg.replace('{', '').replace('}', '')
        if (this.installProfile.data[arg]) {
          if (arg === 'BINPATCH') return
          libraries.push(this.installProfile.data[arg].client)
        }
      })
    })

    libraries = [...new Set(libraries)]

    for (let lib of libraries) {
      const libName = utils.getLibraryName(lib.replace('[', '').replace(']', ''))
      const libPath = utils.getLibraryPath(lib.replace('[', '').replace(']', ''))
      const libExtractPath = path_.join(this.config.root, 'libraries', libPath)

      files.push({ name: libName, path: path_.join('libraries', libPath), url: '', type: 'LIBRARY' })
      if (!fs.existsSync(path_.join(libExtractPath, libName))) patched = false
    }

    return { patched, files }
  }

  private getJarMain(jarPath: string) {
    if (!fs.existsSync(jarPath)) return null
    const manifest = new AdmZip(jarPath).getEntry('META-INF/MANIFEST.MF')?.getData()
    if (!manifest) return null
    return manifest.toString('utf8').split('Main-Class: ')[1].split('\r\n')[0]
  }

  private mapArg(arg: string) {
    arg = arg.replace('{', '').replace('}', '')

    const universalMaven = this.installProfile.libraries.find((v: any) => {
      if (this.loader.loader === 'forge') return v.name.startsWith('net.minecraftforge:forge')
    })

    if (this.installProfile.data[arg]) {
      if (arg === 'BINPATCH') {
        const clientDataName = utils.getLibraryName(this.installProfile.path || universalMaven.name).replace('.jar', '-clientdata.lzma')
        const clientDataExtractPath = utils.getLibraryPath(this.installProfile.path || universalMaven.name, this.config.root, 'libraries')
        return `"${path_.join(clientDataExtractPath, clientDataName).replace('.jar', '-clientdata.lzma')}"`
      }

      return this.installProfile.data[arg].client as string
    }

    return arg
      .replace('{SIDE}', `client`)
      .replace('{ROOT}', `"${this.config.root}}"`)
      .replace('{MINECRAFT_JAR}', `"${path_.join(this.config.root, 'versions', this.manifest.id, `${this.manifest.id}.jar`)}"`)
      .replace('{MINECRAFT_VERSION}', `"${path_.join(this.config.root, 'versions', this.manifest.id, `${this.manifest.id}.json`)}"`)
      .replace('{INSTALLER}', `"${path_.join(this.config.root, 'libraries')}"`)
      .replace('{LIBRARY_DIR}', `"${path_.join(this.config.root, 'libraries')}"`)
  }

  private mapPath(arg: string) {
    if (arg.startsWith('[')) {
      return `"${path_.join(this.config.root, 'libraries', utils.getLibraryPath(arg), utils.getLibraryName(arg.replace('[', '').replace(']', '')))}"`
    }
    return arg
  }
}
