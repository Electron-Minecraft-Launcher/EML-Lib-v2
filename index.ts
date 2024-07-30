/**
 * ## EML Core
 *
 * Be careful: **this NodeJS library requires [Electron](https://www.npmjs.com/package/electron)!** You need Electron for the Microsoft login.
 *
 * Create your Electron Minecraft Launcher easily.
 * To get all the capacities of this NodeJS library, it is highly recommended to set up your [EML AdminTool](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool) website!
 *
 * [GitHub](https://github.com/Electron-Minecraft-Launcher/EML-Core) —
 * [NPM](https://www.npmjs.com/package/eml-core) —
 * [Doc](https://github.com/Electron-Minecraft-Launcher/EML-Core/wiki) —
 * [EML Website](https://electron-minecraft-launcher.ml)
 *
 * ---
 *
 * @version 2.0.0-alpha.0
 * @license MIT — See the `LICENSE` file for more information
 * @copyright Copyright (c) 2024, GoldFrite
 */

export { default as MicrosoftAuth } from './lib/auth/microsoft'
export { default as AzAuth } from './lib/auth/azuriom'
export { default as CrackAuth } from './lib/auth/crack'
export { default as Bootstrap } from './lib/bootstrap/bootstrap'
export { default as Maintenance } from './lib/maintenance/maintenance'
export { default as News } from './lib/news/news'
export { default as Background } from './lib/background/background'
export { default as ServerStatus } from './lib/status/status'
// export { default as Java } from './lib/java/java'
// export { default as Launch } from './lib/minecraft/launch'
