import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  file: {
    // Dialog operations
    openFolder: () => ipcRenderer.invoke('file:open'),
    openFile: () => ipcRenderer.invoke('file:openFile'),
    saveFile: (defaultPath?: string) => ipcRenderer.invoke('file:save', defaultPath),

    // File system operations (text)
    readFile: (filePath: string) => ipcRenderer.invoke('file:readFile', filePath),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke('file:writeFile', filePath, content),
    listDirectory: (dirPath: string) => ipcRenderer.invoke('file:listDirectory', dirPath),
    exists: (filePath: string) => ipcRenderer.invoke('file:exists', filePath),
    createDirectory: (dirPath: string) => ipcRenderer.invoke('file:createDirectory', dirPath),
    deleteFile: (filePath: string) => ipcRenderer.invoke('file:deleteFile', filePath),

    // Binary file operations
    readFileBuffer: (filePath: string) => ipcRenderer.invoke('file:readFileBuffer', filePath),
    writeFileBuffer: (filePath: string, buffer: ArrayBuffer) =>
      ipcRenderer.invoke('file:writeFileBuffer', filePath, buffer),
    readSlice: (filePath: string, offset: number, length: number) =>
      ipcRenderer.invoke('file:readSlice', filePath, offset, length),
    appendFileBuffer: (filePath: string, buffer: ArrayBuffer) =>
      ipcRenderer.invoke('file:appendFileBuffer', filePath, buffer),
    truncateFile: (filePath: string) => ipcRenderer.invoke('file:truncateFile', filePath),
  },
  sensory: {
    trigger: (event: string, data?: unknown) => ipcRenderer.send('sensory:trigger', event, data),
  },
  sync: {
    onEvent: (callback: (data: unknown) => void) => {
      const listener = (_event: unknown, data: unknown) => callback(data)
      ipcRenderer.on('sync:event', listener)
      return () => ipcRenderer.removeListener('sync:event', listener)
    },
    onStatus: (callback: (data: unknown) => void) => {
      const listener = (_event: unknown, data: unknown) => callback(data)
      ipcRenderer.on('sync:status', listener)
      return () => ipcRenderer.removeListener('sync:status', listener)
    },
  },
  project: {
    openDirectory: () => ipcRenderer.invoke('project:openDirectory'),
    reveal: (filePath: string) => ipcRenderer.invoke('project:reveal', filePath),
    delete: (filePath: string) => ipcRenderer.invoke('project:delete', filePath),
    rename: (oldPath: string, newName: string) =>
      ipcRenderer.invoke('project:rename', oldPath, newName),
    readFile: (filePath: string) => ipcRenderer.invoke('project:readFile', filePath),
    search: (dirPath: string, query: string, options: any) =>
      ipcRenderer.invoke('project:search', dirPath, query, options),
    replaceInFiles: (dirPath: string, query: string, replacement: string, options: any) =>
      ipcRenderer.invoke('project:replaceInFiles', dirPath, query, replacement, options),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
  compile: (content: string) => ipcRenderer.invoke('compile', content),
  compileResult: (result: unknown) => ipcRenderer.invoke('compile:result', result),
  sims4: {
    getModsPath: () => ipcRenderer.invoke('sims4:getModsPath'),
    deployBridge: (pythonSource: string) => ipcRenderer.invoke('sims4:deployBridge', pythonSource),
  },
  shell: {
    installContextMenu: () => ipcRenderer.invoke('shell:installContextMenu'),
  },
  ts4rebels: {
    invoke: (action: string, params: Record<string, string>) => 
      ipcRenderer.invoke('ts4rebels:invoke', action, params),
  },
  transform: {
    run: (source: string, fileName: string) => 
      ipcRenderer.invoke('transform:run', source, fileName),
    health: () => ipcRenderer.invoke('transform:health'),
  },
  ai: {
    invoke: (provider: string, method: string, params: any) => 
      ipcRenderer.invoke('ai:invoke', provider, method, params),
    getOllamaInfo: () => ipcRenderer.invoke('ai:ollama:info'),
    switchOllamaProvider: (type: string) => ipcRenderer.invoke('ai:ollama:switch-provider', type),
  },
  security: {
    vault: {
      get: (key: string) => ipcRenderer.invoke('security:vault:get', key),
      set: (key: string, value: any) => ipcRenderer.invoke('security:vault:set', key, value),
      status: () => ipcRenderer.invoke('security:vault:status'),
    }
  },
  scarlet: {
    fetch: () => ipcRenderer.invoke('scarlet:fetch'),
  },

  // Event listeners (main → renderer)
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = [
      'menu:new-project', 'menu:open-project', 'menu:open-file', 'menu:save', 'menu:save-as',
      'menu:export', 'menu:find', 'menu:replace', 'menu:build', 'menu:diagnostics',
      'menu:library', 'menu:ai', 'menu:settings', 'menu:manual', 'menu:shortcuts',
      'menu:check-updates', 'menu:about',
      'compile:request', 'tray:compile', 'deep-link',
      'sync:status', 'sync:event',
    ]
    if (validChannels.includes(channel)) {
      const strippedCallback = (_event: unknown, ...args: unknown[]) => callback(...args)
      ipcRenderer.on(channel, strippedCallback)
      return () => ipcRenderer.removeListener(channel, strippedCallback)
    }
    return () => {}
  },
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = [
      'menu:new-project', 'menu:open-project', 'menu:open-file', 'menu:save', 'menu:save-as',
      'menu:export', 'menu:find', 'menu:replace', 'menu:build', 'menu:diagnostics',
      'menu:library', 'menu:ai', 'menu:settings', 'menu:manual', 'menu:shortcuts',
      'menu:check-updates', 'menu:about',
      'compile:request', 'tray:compile', 'deep-link',
      'sync:status', 'sync:event',
    ]
    if (validChannels.includes(channel)) {
      const strippedCallback = (_event: unknown, ...args: unknown[]) => callback(...args)
      ipcRenderer.removeListener(channel, strippedCallback)
    }
  },
  invoke: (channel: string, ...args: unknown[]) => {
    const validChannels = ['bridge:sendCommand']
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    }
    return Promise.reject(new Error(`Invalid IPC channel: ${channel}`))
  },
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
}

contextBridge.exposeInMainWorld('electron', electronAPI)
contextBridge.exposeInMainWorld('ipc', electronAPI)

declare global {
  interface Window {
    electron: typeof electronAPI
    ipc: typeof electronAPI
  }
}
