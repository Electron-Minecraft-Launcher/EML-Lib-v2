import MicrosoftAuth from './lib/auth/microsoft'
import AzAuth from './lib/auth/azuriom'
import CrackAuth from './lib/auth/crack'
import Bootstraps from './lib/bootstraps/bootstraps'
import Maintenance from './lib/maintenance/maintenance'
import News from './lib/news/news'
import Background from './lib/background/background'
import ServerStatus from './lib/serverstatus/serverstatus'
import Java from './lib/java/java'
import Launcher from './lib/launcher/launcher'

/**
 * ## Electron Minecraft Launcher Core
 * ### Create your Electron Minecraft Launcher easily.
 * 
 * ---
 *
 * **Requirements:**
 * - Node.js 15.14.0 or higher: see [Node.js](https://nodejs.org/)
 * - Electron 15.0.0 or higher: please install it with `npm install electron`
 * 
 * **Recommandations:** 
 * - To get all the capacities of this Node.js library, you must set up your
 * [EML AdminTool](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool-v2) website!
 * - If you don't want to use the EML AdminTool, you should rather use the
 * [Minecraft Launcher Core](https://npmjs.com/package/minecraft-launcher-core) library.
 *
 * ---
 * 
 * [Docs](https://github.com/Electron-Minecraft-Launcher/EML-Core/wiki) —
 * [GitHub](https://github.com/Electron-Minecraft-Launcher/EML-Core) —
 * [NPM](https://www.npmjs.com/package/eml-core) —
 * [EML Website](https://electron-minecraft-launcher.ml)
 *
 * ---
 *
 * @version 2.0.0-alpha.0
 * @license MIT — See the `LICENSE` file for more information
 * @copyright Copyright (c) 2024, GoldFrite
 */

declare module EMLCore {
  export { MicrosoftAuth, AzAuth, CrackAuth, Bootstraps, Maintenance, News, Background, ServerStatus, Java, Launcher }
}

export { default as MicrosoftAuth } from './lib/auth/microsoft'
export { default as AzAuth } from './lib/auth/azuriom'
export { default as CrackAuth } from './lib/auth/crack'
export { default as Bootstrap } from './lib/bootstraps/bootstraps'
export { default as Maintenance } from './lib/maintenance/maintenance'
export { default as News } from './lib/news/news'
export { default as Background } from './lib/background/background'
export { default as ServerStatus } from './lib/serverstatus/serverstatus'
export { default as Java } from './lib/java/java'
export { default as Launcher } from './lib/launcher/launcher'
export default EMLCore
