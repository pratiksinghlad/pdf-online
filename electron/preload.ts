import { contextBridge } from 'electron'

if (!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled in the BrowserWindow')
}

try {
  contextBridge.exposeInMainWorld('desktopAPI', {
    // Add specific IPC handlers here to keep frontend decoupled
    isDesktop: true,
    ping: () => console.log('pong from preload')
  })
} catch (error) {
  console.error(error)
}
