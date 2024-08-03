import { MinecraftManifest } from './../../types/manifest.d'
import { EMLCoreError, ErrorType } from '../../types/errors'
import { JAVA_RUNTIME_URL, MINECRAFT_MANIFEST_URL } from './consts'
import os from 'os'

class Manifests {
  /**
   * Get the manifest of the Minecraft version.
   * @param minecraftVersion The version of Minecraft you want to get the manifest for.
   * @returns The manifest of the Minecraft version.
   */
  async getMinecraftManifest(minecraftVersion: string | null = null) {
    const url = await this.getMinecraftManifestUrl(minecraftVersion)

    const res = await fetch(url)
      .then((res) => res.json())
      .catch((err) => {
        throw new EMLCoreError(ErrorType.FETCH_ERROR, `Failed to fetch Minecraft manifest: ${err.message}`)
      })

    return res as MinecraftManifest
  }

  /**
   * Get the manifest URL of the Minecraft version.
   * @param minecraftVersion The version of Minecraft you want to get the manifest URL for.
   * @returns The manifest URL of the Minecraft version.
   */
  async getMinecraftManifestUrl(minecraftVersion: string | null = null) {
    const res = await fetch(MINECRAFT_MANIFEST_URL)
      .then((res) => res.json())
      .catch((err) => {
        throw new EMLCoreError(ErrorType.FETCH_ERROR, `Failed to fetch Minecraft version manifest: ${err.message}`)
      })

    minecraftVersion = minecraftVersion || res.latest.release

    if (!res.versions.find((version: any) => version.id === minecraftVersion)) {
      throw new EMLCoreError(ErrorType.MINECRAFT_ERROR, `Minecraft version ${minecraftVersion} not found in manifest`)
    }

    return res.versions.find((version: any) => version.id === minecraftVersion).url as string
  }

  async getJavaManifest(
    javaVersion:
      | 'java-runtime-alpha'
      | 'java-runtime-beta'
      | 'java-runtime-delta'
      | 'java-runtime-gamma'
      | 'java-runtime-gamma-snapshot'
      | 'jre-legacy'
  ): Promise<{ files: any }> {
    const url = await this.getJavaManifestUrl(javaVersion)

    const res = await fetch(url)
      .then((res) => res.json())
      .catch((err) => {
        throw new EMLCoreError(ErrorType.FETCH_ERROR, `Failed to fetch Java manifest: ${err.message}`)
      })

    return res
  }

  /**
   * Get the manifest URL of the Java version.
   * @param javaVersion The version of Java you want to get the manifest for.
   * @returns The manifest URL of the Java version.
   */
  async getJavaManifestUrl(
    javaVersion:
      | 'java-runtime-alpha'
      | 'java-runtime-beta'
      | 'java-runtime-delta'
      | 'java-runtime-gamma'
      | 'java-runtime-gamma-snapshot'
      | 'jre-legacy'
  ) {
    const archMapping = {
      win32: { x64: 'windows-x64', ia32: 'windows-x86', arm64: 'windows-arm64' },
      darwin: { x64: 'mac-os', arm64: 'mac-os-arm64' },
      linux: { x64: 'linux', ia32: 'linux-i386' }
    } as any

    const arch = os.arch()
    const platform = os.platform()

    if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') {
      throw new EMLCoreError(ErrorType.UNKNOWN_OS, `Unsupported platform: ${platform}`)
    }
    if (
      (platform === 'win32' && arch !== 'x64' && arch !== 'ia32' && arch !== 'arm64') ||
      (platform === 'darwin' && arch !== 'x64' && arch !== 'arm64') ||
      (platform === 'linux' && arch !== 'x64' && arch !== 'ia32')
    ) {
      throw new EMLCoreError(ErrorType.UNKNOWN_OS, `Unsupported architecture: ${arch}`)
    }

    const res = await fetch(JAVA_RUNTIME_URL)
      .then((res) => res.json())
      .catch((err) => {
        throw new EMLCoreError(ErrorType.FETCH_ERROR, `Failed to fetch Java manifest: ${err.message}`)
      })

    if (
      !res[archMapping[platform][arch]] ||
      !res[archMapping[platform][arch]][javaVersion] ||
      !res[archMapping[platform][arch]][javaVersion][0] ||
      !res[archMapping[platform][arch]][javaVersion][0].manifest
    ) {
      throw new EMLCoreError(ErrorType.JAVA_ERROR, `Java version ${javaVersion} not found in manifest`)
    }

    return res[archMapping[platform][arch]][javaVersion][0].manifest.url as string
  }
}

export default new Manifests()
