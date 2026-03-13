interface ElectronAPI {
  ping: () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
