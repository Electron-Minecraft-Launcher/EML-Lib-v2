/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { DownloaderEvents, JavaEvents } from '../../types/events'
import EventEmitter from '../utils/events'
import manifests from '../utils/manifests'
import { File } from '../../types/file'
import path_ from 'path'
import Downloader from '../utils/downloader'
import utils from '../utils/utils'
import { spawnSync } from 'child_process'
import { EMLLibError, ErrorType } from '../../types/errors'
import { MinecraftManifest } from '../../types/manifest'

/**
 * Download Java for Minecraft.
 * 
 * You should not use this class if you launch Minecraft with `java.install: 'auto'` in
 * the configuration.
 */
export default class Java extends EventEmitter<DownloaderEvents & JavaEvents> {
  private minecraftVersion: string | null
  private serverId: string
  private url?: string

  /**
   * @param minecraftVersion The version of Minecraft you want to install Java for. Set to
   * `null` to get the version from the EML AdminTool. Set to `latest_release` to get the latest
   * release version of Minecraft. Set to `latest_snapshot` to get the latest snapshot version of
   * Minecraft.
   * @param serverId Your Minecraft server ID (eg. `'minecraft'`). This will be used to
   * create the server folder (eg. `.minecraft`). Java will be installed in the `runtime/jre-X`
   * folder, where `X` is the major version of Java. If you don't want to install Java in the
   * game folder, you must install Java by yourself.
   * @param url The URL of the EML AdminTool website, to get the version from the EML AdminTool.
   */
  constructor(minecraftVersion: string | null, serverId: string, url?: string) {
    super()
    this.minecraftVersion = minecraftVersion
    this.serverId = serverId
    this.url = url
  }

  /**
   * Download Java for the Minecraft version.
   */
  async download() {
    const files = await this.getFiles()

    const downloader = new Downloader(utils.getServerFolder(this.serverId))
    downloader.forwardEvents(this)

    await downloader.download(files)
  }

  /**
   * Get the files of the Java version to download.
   *
   * **You should not use this method directly. Use `Java.download()` instead.**
   * @param manifest The manifest of the Minecraft version. If not provided, the manifest will be fetched.
   * @returns The files of the Java version.
   */
  async getFiles(manifest?: MinecraftManifest) {
    manifest = manifest || (await manifests.getMinecraftManifest(this.minecraftVersion, this.url))
    const jreVersion = (manifest.javaVersion?.component || 'jre-legacy') as
      | 'java-runtime-alpha'
      | 'java-runtime-beta'
      | 'java-runtime-delta'
      | 'java-runtime-gamma'
      | 'java-runtime-gamma-snapshot'
      | 'jre-legacy'
    const jreV = manifest.javaVersion?.majorVersion || '8'

    const jreManifest = await manifests.getJavaManifest(jreVersion)

    let files: File[] = []

    Object.entries(jreManifest.files).forEach((file: [string, any]) => {
      if (file[1].type === 'directory') {
        files.push({
          name: path_.basename(file[0]),
          path: path_.join('runtime', `jre-${jreV}`, path_.dirname(file[0]), '/'),
          url: '',
          type: 'FOLDER'
        })
      } else if (file[1].downloads) {
        files.push({
          name: path_.basename(file[0]),
          path: path_.join('runtime', `jre-${jreV}`, path_.dirname(file[0]), '/'),
          url: file[1].downloads.raw.url,
          size: file[1].downloads.raw.size,
          sha1: file[1].downloads.raw.sha1,
          type: 'JAVA'
        })
      }
    })

    return files
  }

  /**
   * Check if Java is correctly installed.
   * @param absolutePath [Optional: default is `path.join(utils.getServerFolder(this.serverId), 'runtime',
   * 'jre-${X}', 'bin', 'java')`] Absolute path to the Java executable. You can use `${X}` to replace it
   * with the major version of Java.
   * @param majorVersion [Optional: default is `8`] Major version of Java to check.
   * @returns The version and architecture of Java.
   */
  check(
    absolutePath: string = path_.join(utils.getServerFolder(this.serverId), 'runtime', 'jre-${X}', 'bin', 'java'),
    majorVersion: number = 8
  ): {
    version: string
    arch: '64-bit' | '32-bit'
  } {
    const check = spawnSync(`"${absolutePath.replace('${X}', majorVersion + '')}"`, ['-version'], { shell: true })
    if (check.error) throw new EMLLibError(ErrorType.JAVA_ERROR, `Java is not correctly installed: ${check.error.message}`)
    const res = {
      version:
        check.output
          .map((o) => o?.toString('utf8'))
          .join(' ')
          .match(/"(.*?)"/)
          ?.pop() || majorVersion + '',
      arch: check.output
        .map((o) => o?.toString('utf8'))
        .join(' ')
        .includes('64-Bit')
        ? '64-bit'
        : ('32-bit' as '64-bit' | '32-bit')
    }
    this.emit('java_info', res)
    return res
  }
}
