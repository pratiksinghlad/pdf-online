import { contextBridge } from 'electron';

/**
 * Preload script — runs in a sandboxed, context-isolated environment.
 *
 * Use `contextBridge.exposeInMainWorld` to safely expose APIs to the
 * renderer (React app) without leaking Node.js or Electron internals.
 *
 * The React app can access these via `window.desktopAPI` — but only when
 * running inside Electron. The web app should always check for its
 * existence before using it:
 *
 *   if (window.desktopAPI) { ... }
 */
contextBridge.exposeInMainWorld('desktopAPI', {
  platform: process.platform,
  electronVersion: process.versions.electron,
  isDesktop: true,
});
