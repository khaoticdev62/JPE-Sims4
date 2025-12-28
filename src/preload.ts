import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  file: {
    // Dialog operations
    openFolder: () => ipcRenderer.invoke('file:open'),
    openFile: () => ipcRenderer.invoke('file:openFile'),
    saveFile: () => ipcRenderer.invoke('file:save'),

    // File system operations
    readFile: (filePath: string) => ipcRenderer.invoke('file:readFile', filePath),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke('file:writeFile', filePath, content),
    listDirectory: (dirPath: string) => ipcRenderer.invoke('file:listDirectory', dirPath),
    exists: (filePath: string) => ipcRenderer.invoke('file:exists', filePath),
    createDirectory: (dirPath: string) => ipcRenderer.invoke('file:createDirectory', dirPath),
    deleteFile: (filePath: string) => ipcRenderer.invoke('file:deleteFile', filePath),
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
