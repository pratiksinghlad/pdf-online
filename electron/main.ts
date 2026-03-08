import { app, BrowserWindow } from 'electron';
import * as path from 'path';

const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: 'PDF Online',
    icon: path.join(__dirname, '..', isDev ? 'public' : 'dist', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      plugins: true, // Required for built-in PDF rendering
    },
  });

  if (isDev) {
    // Dev mode: load Vite dev server
    mainWindow.loadURL('http://localhost:3001');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load the built index.html via file:// protocol
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Gracefully handle load failures
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error(`Failed to load: ${errorCode} - ${errorDescription}`);
    if (isDev) {
      console.log('Retrying in 1 second...');
      setTimeout(() => mainWindow.loadURL('http://localhost:3001'), 1000);
    }
  });
}

app.whenReady().then(createWindow);

// macOS: re-create window when dock icon is clicked and no windows are open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Windows/Linux: quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
