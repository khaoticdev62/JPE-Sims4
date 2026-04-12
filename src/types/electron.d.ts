/**
 * Electron IPC type definitions
 */

export interface FileResult {
  success: boolean
  content?: string
  buffer?: ArrayBuffer
  size?: number
  modified?: number
  path?: string
  exists?: boolean
  files?: Array<{ name: string; isDirectory: boolean; isFile: boolean }>
  error?: string
}

export interface ProjectResult {
  success: boolean
  path?: string
  name?: string
  files?: Array<{ path: string; name: string; ext: string }>
  error?: string
}

export interface ElectronFileAPI {
  openFolder: () => Promise<string | null>
  openFile: () => Promise<string[]>
  saveFile: (defaultPath?: string) => Promise<string | null>
  readFile: (filePath: string) => Promise<FileResult>
  writeFile: (filePath: string, content: string) => Promise<FileResult>
  listDirectory: (dirPath: string) => Promise<FileResult>
  exists: (filePath: string) => Promise<FileResult>
  createDirectory: (dirPath: string) => Promise<FileResult>
  deleteFile: (filePath: string) => Promise<FileResult>
  readFileBuffer: (filePath: string) => Promise<FileResult>
  writeFileBuffer: (filePath: string, buffer: ArrayBuffer) => Promise<FileResult>
  readSlice: (filePath: string, offset: number, length: number) => Promise<FileResult>
  appendFileBuffer: (filePath: string, buffer: ArrayBuffer) => Promise<FileResult>
  truncateFile: (filePath: string) => Promise<FileResult>
}

export interface ElectronProjectAPI {
  openDirectory: () => Promise<ProjectResult | null>
  reveal: (filePath: string) => Promise<FileResult>
  delete: (filePath: string) => Promise<FileResult>
  rename: (oldPath: string, newName: string) => Promise<FileResult>
  readFile: (filePath: string) => Promise<FileResult>
}

export interface ElectronWindowAPI {
  minimize: () => Promise<boolean>
  maximize: () => Promise<boolean>
  close: () => Promise<boolean>
}

export interface ElectronShellAPI {
  installContextMenu: () => Promise<{ success: boolean; error?: string }>
}

export interface ElectronSimsAPI {
  getModsPath: () => Promise<{ success: boolean; path: string }>
  deployBridge: (source: string) => Promise<{ success: boolean; path?: string; error?: string }>
}

export interface ElectronSensoryAPI {
  triggerVibration: (duration: number, intensity: number) => Promise<void>
}

export interface ElectronIPC {
  file: ElectronFileAPI
  project: ElectronProjectAPI
  window: ElectronWindowAPI
  shell?: ElectronShellAPI
  sims4?: ElectronSimsAPI
  sensory?: ElectronSensoryAPI
  compile: (content: string) => Promise<{ success: boolean; message?: string }>
  compileResult: (result: unknown) => Promise<{ success: boolean }>
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void
  off: (channel: string, callback: (...args: unknown[]) => void) => void
  send: (channel: string, ...args: any[]) => void
}

declare global {
  interface Window {
    ipc: ElectronIPC
    electron: ElectronIPC // aligning legacy with current
  }
}
