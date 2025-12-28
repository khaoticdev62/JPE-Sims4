import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development'

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  })

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC Handlers for File System Access
ipcMain.handle('file:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  })
  return result.filePaths[0] || null
})

ipcMain.handle('file:save', async () => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    filters: [{ name: 'All Files', extensions: ['*'] }],
  })
  return result.filePath || null
})

ipcMain.handle('file:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All Supported', extensions: ['xml', 'ts4script', 'py', 'stbl', 'json', 'cfg', 'package'] },
      { name: 'XML Files', extensions: ['xml'] },
      { name: 'Script Files', extensions: ['ts4script', 'py'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })
  return result.filePaths
})

// IPC Handler to read file content
ipcMain.handle('file:readFile', async (_event, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const stats = fs.statSync(filePath)
    return {
      success: true,
      content,
      size: stats.size,
      modified: stats.mtimeMs,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})

// IPC Handler to write file content
ipcMain.handle('file:writeFile', async (_event, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    const stats = fs.statSync(filePath)
    return {
      success: true,
      size: stats.size,
      modified: stats.mtimeMs,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})

// IPC Handler to list files in directory
ipcMain.handle('file:listDirectory', async (_event, dirPath: string) => {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true })
    return {
      success: true,
      files: files.map((file) => ({
        name: file.name,
        isDirectory: file.isDirectory(),
        isFile: file.isFile(),
      })),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})

// IPC Handler to check file exists
ipcMain.handle('file:exists', async (_event, filePath: string) => {
  try {
    return {
      success: true,
      exists: fs.existsSync(filePath),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})

// IPC Handler to create directory
ipcMain.handle('file:createDirectory', async (_event, dirPath: string) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true })
    return {
      success: true,
      path: dirPath,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})

// IPC Handler to delete file
ipcMain.handle('file:deleteFile', async (_event, filePath: string) => {
  try {
    fs.unlinkSync(filePath)
    return {
      success: true,
      path: filePath,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})
