import { app, BrowserWindow } from 'electron'
import { join } from 'path'

// Disable legacy node integration and features that slow down the process
// Using specific command line switches
app.commandLine.appendSwitch('disable-site-isolation-trials')
app.commandLine.appendSwitch('disable-gpu-compositing')    // Avoids heavy GPU boot delay
app.commandLine.appendSwitch('disable-software-rasterizer') // Speeds up headless rendering
app.commandLine.appendSwitch('disable-2d-canvas-clip-aa')
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling')

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null

function createWindow() {
  const startTime = Date.now()

  // 1. Create and show Splash Window immediately
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Load the lightweight splash screen
  if (process.env.ELECTRON_RENDERER_URL) {
    splashWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/splash.html`)
  } else {
    splashWindow.loadFile(join(__dirname, '../renderer/splash.html'))
  }

  // 2. Create the Main Window heavily in the background
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false, // Prevents white flash and hides during loading
    webPreferences: {
      preload: join(__dirname, '../preload/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  })

  // Wait for the renderer process to be fully ready before showing
  mainWindow.on('ready-to-show', () => {
    // Artificial 500ms delay to ensure React finishes hydrating layout
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close()
      }
      mainWindow!.show()
      mainWindow!.focus()
      console.log(`⏱️ Time to App Fully Interactive: ${Date.now() - startTime}ms`)
    }, 500)
  })

  // Load the main React app
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
