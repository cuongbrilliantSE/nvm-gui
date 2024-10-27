// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },

  getInstalledVersions: () => ipcRenderer.invoke('get-installed-versions'),
  installVersion: (version: string) => ipcRenderer.invoke('install-version', version),
  removeVersion: (version: string) => ipcRenderer.invoke('remove-version', version),
  useVersion: (version: string) => ipcRenderer.invoke('use-version', version),
  recommendVersions: () => ipcRenderer.invoke('get-recommended-versions'),
  setProxy: (proxyUrl: string, proxyPort: string) => ipcRenderer.invoke('set-proxy', proxyUrl, proxyPort),
  getProxy: () => ipcRenderer.invoke('get-proxy'),
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
