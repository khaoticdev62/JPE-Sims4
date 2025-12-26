import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  file: {
    openFolder: () => ipcRenderer.invoke('file:open'),
    openFile: () => ipcRenderer.invoke('file:openFile'),
    saveFile: () => ipcRenderer.invoke('file:save'),
  },
  on: (channel: string, callback: (event: any, data: any) => void) => {
    ipcRenderer.on(channel, callback)
  },
  off: (channel: string, callback: (event: any, data: any) => void) => {
    ipcRenderer.off(channel, callback)
  },
}

contextBridge.exposeInMainWorld('electron', electronAPI)

declare global {
  interface Window {
    electron: typeof electronAPI
  }
}
