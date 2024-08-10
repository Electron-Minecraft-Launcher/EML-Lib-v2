/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { DownloaderEvents } from '../../types/events'
import EventEmitter from '../utils/events'
import manifests from '../utils/manifests'
import { File } from '../../types/file'
import path from 'path'
import Downloader from '../utils/downloader'
import utils from '../utils/utils'
import { spawnSync } from 'child_process'
import { EMLCoreError, ErrorType } from '../../types/errors'

export default class Java extends EventEmitter<DownloaderEvents> {
  private minecraftVersion: string | null
  private serverId: string
  private url?: string

  /**
   * You should not use this class if you launch Minecraft with `java.install: 'auto'` in
   * the configuration.
   * @param minecraftVersion The version of Minecraft you want to install Java for. Set to
   * `null` to get the version from the EML AdminTool. Set to `latest_release` to get the latest
   * release version of Minecraft. Set to `latest_snapshot` to get the latest snapshot version of
   * Minecraft.
   * @param serverId Your Minecraft server ID (eg. `'minecraft'`). This will be used to
   * create the server folder (eg. `.minecraft`).
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
   * @returns The files of the Java version.
   */
  async getFiles() {
    const jreVersion = ((await manifests.getMinecraftManifest(this.minecraftVersion, this.url)).javaVersion?.component || 'jre-legacy') as
      | 'java-runtime-alpha'
      | 'java-runtime-beta'
      | 'java-runtime-delta'
      | 'java-runtime-gamma'
      | 'java-runtime-gamma-snapshot'
      | 'jre-legacy'

    const jreManifest = await manifests.getJavaManifest(jreVersion)

    let files: File[] = []

    Object.entries(jreManifest.files).forEach((file: [string, any]) => {
      if (file[1].type === 'directory') {
        files.push({
          name: file[0].split('/').pop() as string,
          path: path.join('runtime', 'jre', file[0].split('/').slice(0, -1).join('/'), '/'),
          url: '',
          type: 'FOLDER'
        })
      } else if (file[1].downloads) {
        files.push({
          name: file[0].split('/').pop() as string,
          path: path.join('runtime', 'jre', file[0].split('/').slice(0, -1).join('/'), '/'),
          url: file[1].downloads.raw.url,
          size: file[1].downloads.raw.size,
          sha1: file[1].downloads.raw.sha1,
          type: 'JAVA'
        })
      }
    })

    return files
  }

  check(absolutePath: string = path.join(utils.getServerFolder(this.serverId), 'runtime', 'jre', 'bin', 'java')): {
    version: string
    arch: '64-bit' | '32-bit'
  } {
    const check = spawnSync(`"${absolutePath}" -version`)
    if (check.error) throw new EMLCoreError(ErrorType.JAVA_ERROR, `Java is not correctly installed: ${check.error.message}`)
    return {
      version:
        (check.stdout || check.stderr)
          .toString('utf8')
          .match(/"(.*?)"/)
          ?.pop() + '',
      arch: (check.stdout || check.stderr).toString('utf8').includes('64-Bit') ? '64-bit' : '32-bit'
    }
  }
}
