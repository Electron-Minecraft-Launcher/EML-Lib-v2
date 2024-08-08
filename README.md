# Electron Minecraft Launcher Core (EML Core)

**Electron Minecraft Launcher Core (EML Core) is an Electron library. It permits to authenticate, download Java and Minecraft and launch Minecraft.**

**Electron Minecraft Launcher Core (EML Core) est une librairie pour Electron. Elle permet l'authentification, le téléchargement de Java et de Minecraft et le lancement de Minecraft.**

[<p align="center"><img src="https://img.shields.io/badge/Discord-Electron_Minecraft_Launcher-5561e6?&style=for-the-badge">](https://discord.gg/YVB4k6HzAY)
[<img src="https://img.shields.io/badge/platforms-Windows%2C%20macOS%2C%20Linux-0077DA?style=for-the-badge&color=0077DA">](#platforms) 
[<img src="https://img.shields.io/badge/version-2.0.0--alpha.0-orangered?style=for-the-badge&color=orangered">](package.json)</p>

---

## <span id="platforms">Platform compatibility • Compatibilité des plateformes</span>

| OS (platform)               | Supported?     | Minimum version supported  |
|-----------------------------|----------------|----------------------------|
| Windows (win32)             | Yes            | Windows 7 (Windows NT 6.1) |
| macOS (Darwin)              | Yes            | macOS El Capitan (10.11)   |
| Linux (including Chrome OS) | Yes            | Variable                   |
| Others                      | Not officially | -                          |

---

## Electron Minecraft Launcher Core (EML Core)

### Features

* Launcher Bootstrap
* Auth:
  - Microsoft
  - Azuriom (CMS)
  - Crack
* Minecraft:
  - Vanilla (from Alpha to the latest version)
  - Forge (all versions)
  - (Fabric, OptiFine and NeoForge coming soon...)
* Displaying server information (from 1.4 to the latest Minecraft version)
* News (using [EML AdminTool](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool-v2))
* Settings (RAM and Launcher action after launching the Game)
* Java autodownloading (for Windows, macOS and Linux)
* Game downloading (using [EML AdminTool](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool-v2)) and launching

### Installing

> [!NOTE]
> The library is not yet available on npm.

You need [Node.js](https://nodejs.org) and [Electron](https://electronjs.org).

```bash
npm i eml-core
```

`eml-core` package includes TypeScript typings, so you don't need to install `@types/eml-core`.

### Documentation

_SOON_