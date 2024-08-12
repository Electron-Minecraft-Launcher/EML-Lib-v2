# Electron Minecraft Launcher Core (EML Core)

**Electron Minecraft Launcher Core (EML Core) is an Electron library. It permits to authenticate, download Java and Minecraft and launch Minecraft.**

[<p align="center"><img src="https://img.shields.io/badge/Discord-Electron_Minecraft_Launcher-5561e6?&style=for-the-badge">](https://discord.gg/YVB4k6HzAY)
[<img src="https://img.shields.io/badge/platforms-Windows%2C%20macOS%2C%20Linux-0077DA?style=for-the-badge&color=0077DA">](#platforms)
[<img src="https://img.shields.io/badge/version-2.0.0--alpha.0-orangered?style=for-the-badge&color=orangered">](package.json)</p>

---

## <span id="platforms">Platform compatibility</span>

| OS (platform)              | Supported?     | Minimum version supported  |
| -------------------------- | -------------- | -------------------------- |
| Windows (win32)            | Yes            | Windows 7 (Windows NT 6.1) |
| macOS (Darwin)             | Yes            | Mac OS X Lion (10.7)       |
| Linux, including Chrome OS | Yes            | Variable                   |
| Others                     | Not officially | -                          |

> [!WARNING]
> No support will be provided for older versions of Windows, macOS and Linux, or for other operating systems.

---

## Features

- Launcher Bootstrap
- Auth:
  - Microsoft
  - Azuriom (CMS)
  - Crack
- Minecraft:
  - Vanilla (from Alpha to the latest version)
  - Forge (all versions)
  - (Fabric, NeoForge, Quilt and MCP coming soon...)
- Displaying server information (from 1.4 to the latest Minecraft version)
- News (using [EML AdminTool](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool-v2))
- Settings (RAM and Launcher action after launching the Game)
- Java download (for Windows, macOS and Linux)
- Game download (using [EML AdminTool](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool-v2)) and launching

## Installation

> [!NOTE]
> The library is not yet available on npm.

You need [Node.js](https://nodejs.org) and [Electron](https://electronjs.org).

```bash
npm i emlcore
```

`emlcore` package includes TypeScript typings, so you don't need to install `@types/emlcore`.

## Documentation

Quick start (once the [EML AdminTool](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool-v2) is installed and configured):

```javascript
const EMLCore = require('emlcore')

const launcher = new EMLCore.Launcher({
  url: 'https://admintool.electron-minecraft-launcher.com',
  serverId: 'eml',
  account: new EMLCore.CrackAuth().auth('GoldFrite')
})

launcher.launch()
```

Please refer to the [documentation](https://github.com/Electrn-Minecraft-Launcher/EML-Core-v2/wiki) for more information.

## Tests

The library have been tested on:

| Minecraft version | OS                      | Loader  |
| ----------------- | ----------------------- | ------- |
| 1.21.1            | Windows 11 (26120.1252) | Vanilla |
| 1.17.1            | Windows 11 (19043.1165) | Vanilla |
| 1.12.2            | Windows 11 (19043.1165) | Vanilla |
| 1.7.10            | Windows 11 (19043.1165) | Vanilla |

