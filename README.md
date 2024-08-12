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

- **Authentication**: Authenticate users with Microsoft, Azuriom or Crack.
- **Minecraft**: Automatically download and launch Minecraft (Vanilla and Forge [^1]; Fabric, NeoForge, Quilt and MCP are coming soon), and remove unwanted files (such as unwanted mods).
- **Java**: Automatically download and install Java.
- **Bootstraps [^1]**: Auto-update your launcher.
- **Maintenance [^1]**: Block the launcher during maintenance.
- **Server status**: Displaying server information (from Minecraft 1.4 to the latest Minecraft version)
- **News [^1]**: Displaying news.
- **Background [^1]**: Displaying a background image.

## Installation

### Software requirements

- Node.js 15.14.0 or higher: see [Node.js](https://nodejs.org/);
- Electron 15.0.0 or higher: please install it with `npm i electron` _if you use Microsoft Authentication_.

To get all the capacities of this Node.js library, you must set up your [EML AdminTool](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool-v2) website! Without it, you can only use Minecraft Vanilla, and many features will be disabled (such as News, Bootstrap, etc.).

If you don't want to use the EML AdminTool, you should rather use the [Minecraft Launcher Core](https://npmjs.com/package/minecraft-launcher-core) library.

### EML Core installation

> [!NOTE]
> The library is not yet available on npm.

You need [Node.js](https://nodejs.org) and [Electron](https://electronjs.org).

```bash
npm i emlcore
```

`emlcore` package includes TypeScript typings, so you don't need to install `@types/emlcore`.

### Quick start

Quick start using the [EML AdminTool](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool-v2:

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

| Minecraft version | OS                      | Loader  | Result |
| ----------------- | ----------------------- | ------- | ------ |
| 1.21.1            | Windows 11 (26120.1252) | Vanilla | OK     |
| 1.17.1            | Windows 11 (19043.1165) | Vanilla | OK     |
| 1.12.2            | Windows 11 (19043.1165) | Vanilla | OK     |
| 1.7.10            | Windows 11 (19043.1165) | Vanilla | OK     |

## Contributing

### Development

Download the code and run the commands:

```bash
cd EML-Core-v2
npm i
```

### Tests

You can submit your tests by creating an issue.

Please indicate the following information in your issue:
- The Minecraft version;
- The operating system the test was performed on (including the version);
- The loader used (Vanilla, Forge, Fabric, etc., including the loader version);
- The result of the test (`OK` if the test was successful, `KO` if the test failed, or a detailed explanation if the test was not conclusive).

[^1]: Requires the [EML AdminTool](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool-v2).
