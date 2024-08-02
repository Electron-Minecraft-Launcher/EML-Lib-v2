import { Account } from './account'

export interface Config {
  /**
   * The URL of your EML AdminTool website, where is stored your modpack.
   */
  url: string
  /**
   * Your Minecraft server ID (eg. `'minecraft'`). This will be used to create the
   * server folder (eg. `.minecraft`).
   */
  serverId: string
  /**
   * [Optional: default is `['runtime/', 'crash-reports/', 'logs/', 'resourcepacks/', 'resources/',
   * 'saves/', 'shaderpacks/', 'options.txt', 'optionsof.txt']`]
   * The list of paths/files to ignore when checking and cleaning the game folder, before launching
   * the Minecraft game.
   *
   * **Attention!** If you don't include `'runtime/'` in this list, the launcher will delete the
   * Java installation folder when cleaning the game folder.
   */
  ignored?: string[]
  /**
   * The player account (use `MicrosoftAuth`, `AzAuth` or `CrackAuth` to get the account).
   */
  account: Account
  /**
   * Minecraft configuration.
   */
  minecraft: {
    /**
     * The version of Minecraft you want to install.
     */
    version: string
    /**
     * [Optional: default is `'vanilla'`]
     * The used loader to launch the game.
     */
    loader?: 'vanilla' | 'forge' | 'mcp'
    /**
     * [Optional: default is `[]`]
     * **Use this option only if you know what you are doing!** Add custom args to launch Minecraft.
     */
    args?: string[]
  }
  /**
   * [Optional: default automatically installs Java when calling `Launcher.launch()`]
   * Java configuration.
   */
  java?: {
    /**
     * Should the launcher install Java automatically? `'auto'` automatically installs Java when
     * calling `Launcher.launch()`. `'manual'` does not install Java automatically. You can use
     * `Java.download()` to install Java manually.
     */
    install: 'auto' | 'manual'
    /**
     * [Optional: default is `'runtime/jre/bin/'`]
     * The path to the `bin` folder of the Java installation. If you use a custom Java installation
     * with a custom path, you can set it here. If you don't install Java manually, set this value
     * to `'java'` to use the Java installed on the user's computer.
     */
    path?: string
    /**
     * [Optional: default is `[]`]
     * **Use this option only if you know what you are doing!** Add custom args to Java.
     */
    args?: string[]
  }
  /**
   * [Optional: default is a 854x480 window]
   * The Minecraft window configuration.
   */
  window?: {
    /**
     * The width of the Minecraft window.
     */
    width: number
    /**
     * The height of the Minecraft window.
     */
    height: number
    /**
     * [Optional: default is `false`]
     * Should the Minecraft window be fullscreen?
     */
    fullscreen?: boolean
  }
  /**
   * [Optional: default is `{ min: 1024, max: 2048 }`]
   * The memory (RAM) configuration.
   */
  memory?: {
    /**
     * The minimum memory (RAM), in MB, allocated to Minecraft.
     */
    min: number
    /**
     * The maximum memory (RAM), in MB, allocated to Minecraft.
     */
    max: number
  }
}
