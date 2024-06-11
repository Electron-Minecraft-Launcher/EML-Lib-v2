import { app, BrowserWindow } from 'electron'
import AzAuth from '../lib/auth/azuriom'
import MicrosoftAuth from '../lib/auth/microsoft'

let mainWindow: BrowserWindow

async function createWindow() {
  mainWindow = new BrowserWindow({
    // resizable: false,
    width: 650,
    height: 550,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      // devTools: false,
      nodeIntegrationInWorker: true,
      webSecurity: true,
      contextIsolation: false
    }
  })
  mainWindow.setBackgroundColor('#272727')
  mainWindow.setMenuBarVisibility(false)

  const auth = await new MicrosoftAuth(mainWindow).auth()
  console.log(auth)
}

app.whenReady().then(createWindow)
