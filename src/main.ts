import {
  app,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  ipcMain,
  dialog,
  shell,
  Tray,
} from 'electron'
import path from 'path'
import fs from 'fs'
import { spawn, exec, ChildProcess } from 'child_process'
import { LiveMonitor } from './services/main/LiveMonitor'

// Auto-updater (only in production — check after app ready to avoid require issues)
let autoUpdater: typeof import('electron-updater').autoUpdater | null = null

// ─── Single Instance Lock ────────────────────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    // Someone tried to run a second instance — focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      // Handle potential deep link from second instance
      const url = commandLine.pop()
      if (url) handleDeepLink(url)
    }
  })
}

// ─── Protocol Handler ────────────────────────────────────────────────────────
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('jpe', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('jpe')
}

let deepLinkURL: string | null = null

app.on('open-url', (event, url) => {
  event.preventDefault()
  handleDeepLink(url)
})

function handleDeepLink(url: string) {
  deepLinkURL = url
  if (mainWindow) {
    mainWindow.webContents.send('deep-link', url)
  }
}

// ─── Globals ─────────────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let nextServer: ChildProcess | null = null
let liveMonitor: LiveMonitor | null = null
const isDev = process.env.NODE_ENV === 'development'
const NEXT_SERVER_PORT = 3000

// ─── Window Creation ────────────────────────────────────────────────────────
const createWindow = (url: string) => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    frame: false, // Frameless for custom title bar
    titleBarStyle: 'hiddenInset', // macOS native hidden title bar
    backgroundColor: '#0a0c10',
    show: false, // Show when ready
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
    },
  })

  mainWindow.loadURL(url)

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    
    // Initialize Spectral LiveMonitor
    if (mainWindow) {
      liveMonitor = new LiveMonitor(mainWindow)
      liveMonitor.start()
    }

    if (isDev && mainWindow) {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    liveMonitor?.stop()
    liveMonitor = null
  })

  // Prevent navigation to external URLs
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })
}

// ─── Start Next.js Server (Production) ────────────────────────────────────────
const startNextServer = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // In production, spawn `next start` from the app's bundled resources
    const appPath = app.isPackaged
      ? path.join(process.resourcesPath, 'app')
      : process.cwd()

    nextServer = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['next', 'start', '--port', String(NEXT_SERVER_PORT)],
      {
        cwd: appPath,
        env: { ...process.env, NODE_ENV: 'production' },
        stdio: 'inherit',
      },
    )

    nextServer.on('error', (err) => {
      console.error('Failed to start Next.js server:', err)
      reject(err)
    })

    // Wait for server to start
    setTimeout(() => {
      resolve(`http://localhost:${NEXT_SERVER_PORT}`)
    }, 3000)
  })
}

// ─── System Tray ─────────────────────────────────────────────────────────────
const createTray = () => {
  try {
    const iconPath = getIconPath()
    tray = new Tray(iconPath)
    tray.setToolTip('JPE Studio — Sims 4 Mod Translator')
    tray.setContextMenu(buildTrayMenu())

    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.focus()
        } else {
          mainWindow.show()
        }
      }
    })
  } catch {
    // Tray creation failed — app still works without it
    console.warn('Failed to create system tray')
  }
}

const buildTrayMenu = (): Menu => {
  return Menu.buildFromTemplate([
    {
      label: 'Show JPE Studio',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Compile Project',
      click: () => {
        mainWindow?.webContents.send('tray:compile')
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])
}

// ─── Native Application Menu ────────────────────────────────────────────────
const buildAppMenu = (): Menu => {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new-project'),
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu:open-project'),
        },
        { type: 'separator' },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => mainWindow?.webContents.send('menu:open-file'),
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:save'),
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('menu:save-as'),
        },
        { type: 'separator' },
        {
          label: 'Export Package',
          click: () => mainWindow?.webContents.send('menu:export'),
        },
        { type: 'separator' },
        { role: 'quit', label: 'Exit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', label: 'Undo' },
        { role: 'redo', label: 'Redo' },
        { type: 'separator' },
        { role: 'cut', label: 'Cut' },
        { role: 'copy', label: 'Copy' },
        { role: 'paste', label: 'Paste' },
        { role: 'delete', label: 'Delete' },
        { type: 'separator' },
        { role: 'selectAll', label: 'Select All' },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => mainWindow?.webContents.send('menu:find'),
        },
        {
          label: 'Replace',
          accelerator: 'CmdOrCtrl+H',
          click: () => mainWindow?.webContents.send('menu:replace'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
        { type: 'separator' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { role: 'resetZoom', label: 'Reset Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Full Screen' },
      ],
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Build Package',
          accelerator: 'CmdOrCtrl+B',
          click: () => mainWindow?.webContents.send('menu:build'),
        },
        {
          label: 'Run Diagnostics',
          click: () => mainWindow?.webContents.send('menu:diagnostics'),
        },
        {
          label: 'Mod Library',
          click: () => mainWindow?.webContents.send('menu:library'),
        },
        {
          label: 'AI Assistant',
          accelerator: 'CmdOrCtrl+I',
          click: () => mainWindow?.webContents.send('menu:ai'),
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => mainWindow?.webContents.send('menu:settings'),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'JPE Manual',
          click: () => mainWindow?.webContents.send('menu:manual'),
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+?',
          click: () => mainWindow?.webContents.send('menu:shortcuts'),
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => mainWindow?.webContents.send('menu:check-updates'),
        },
        { type: 'separator' },
        {
          label: 'About JPE Studio',
          click: () => mainWindow?.webContents.send('menu:about'),
        },
      ],
    },
  ]

  // macOS-specific app menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: `About ${app.getName()}` },
        { type: 'separator' },
        { role: 'services', label: 'Services' },
        { type: 'separator' },
        { role: 'hide', label: `Hide ${app.getName()}` },
        { role: 'hideOthers', label: 'Hide Others' },
        { role: 'unhide', label: 'Show All' },
        { type: 'separator' },
        { role: 'quit', label: `Quit ${app.getName()}` },
      ],
    })
  }

  return Menu.buildFromTemplate(template)
}

// ─── IPC Handlers ────────────────────────────────────────────────────────────

// === FILE DIALOGS (already implemented) ===
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
      { name: 'STBL Files', extensions: ['stbl'] },
      { name: 'Config Files', extensions: ['json', 'cfg'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })
  return result.filePaths
})

// === FILE SYSTEM (already implemented) ===
ipcMain.handle('file:readFile', async (_event, filePath: string) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8')
    const stats = await fs.promises.stat(filePath)
    return { success: true, content, size: stats.size, modified: stats.mtimeMs }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('file:writeFile', async (_event, filePath: string, content: string) => {
  try {
    await fs.promises.writeFile(filePath, content, 'utf-8')
    const stats = await fs.promises.stat(filePath)
    return { success: true, size: stats.size, modified: stats.mtimeMs }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('file:listDirectory', async (_event, dirPath: string) => {
  try {
    const files = await fs.promises.readdir(dirPath, { withFileTypes: true })
    return {
      success: true,
      files: files.map((file) => ({
        name: file.name,
        isDirectory: file.isDirectory(),
        isFile: file.isFile(),
      })),
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('file:exists', async (_event, filePath: string) => {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK)
    return { success: true, exists: true }
  } catch {
    return { success: true, exists: false }
  }
})

ipcMain.handle('file:createDirectory', async (_event, dirPath: string) => {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true })
    return { success: true, path: dirPath }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('file:deleteFile', async (_event, filePath: string) => {
  try {
    await fs.promises.unlink(filePath)
    return { success: true, path: filePath }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// === BINARY FILE OPERATIONS (NEW — 5 handlers) ===
ipcMain.handle('file:readFileBuffer', async (_event, filePath: string) => {
  try {
    const buffer = await fs.promises.readFile(filePath)
    return {
      success: true,
      buffer: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      size: buffer.byteLength,
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('file:writeFileBuffer', async (_event, filePath: string, buffer: ArrayBuffer) => {
  try {
    const nodeBuffer = Buffer.from(buffer)
    await fs.promises.writeFile(filePath, nodeBuffer)
    const stats = await fs.promises.stat(filePath)
    return { success: true, size: stats.size, modified: stats.mtimeMs }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('file:readSlice', async (_event, filePath: string, offset: number, length: number) => {
  try {
    const fd = await fs.promises.open(filePath, 'r')
    const buffer = Buffer.alloc(length)
    await fd.read(buffer, 0, length, offset)
    await fd.close()
    return {
      success: true,
      buffer: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('file:appendFileBuffer', async (_event, filePath: string, buffer: ArrayBuffer) => {
  try {
    const nodeBuffer = Buffer.from(buffer)
    await fs.promises.appendFile(filePath, nodeBuffer)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('file:truncateFile', async (_event, filePath: string) => {
  try {
    await fs.promises.truncate(filePath, 0)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// === PROJECT OPERATIONS (NEW — 5 handlers) ===
ipcMain.handle('project:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: 'Select Project Folder',
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const dirPath = result.filePaths[0]
  // Read project structure
  try {
    const files = await fs.promises.readdir(dirPath, { withFileTypes: true, recursive: true })
    return {
      success: true,
      path: dirPath,
      name: path.basename(dirPath),
      files: files
        .filter((f) => f.isFile())
        .map((f) => ({
          path: path.join(f.path || dirPath, f.name),
          name: f.name,
          ext: path.extname(f.name),
        })),
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('project:reveal', async (_event, filePath: string) => {
  try {
    shell.showItemInFolder(filePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('project:delete', async (_event, filePath: string) => {
  try {
    const stat = await fs.promises.stat(filePath)
    if (stat.isDirectory()) {
      await fs.promises.rm(filePath, { recursive: true, force: true })
    } else {
      await fs.promises.unlink(filePath)
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('project:rename', async (_event, oldPath: string, newName: string) => {
  try {
    const parentDir = path.dirname(oldPath)
    const newPath = path.join(parentDir, newName)
    await fs.promises.rename(oldPath, newPath)
    return { success: true, newPath }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('project:readFile', async (_event, filePath: string) => {
  // Alias for file:readFile — consistent project API
  return ipcMain.emit('file:readFile', _event, filePath)
})

// === WINDOW CONTROLS (NEW — 3 handlers) ===
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
  return true
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
  return mainWindow?.isMaximized() ?? false
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
  return true
})

// === COMPILE IPC (NEW — 1 handler) ===
ipcMain.handle('compile', async (_event, content: string) => {
  // Forward compile request to renderer process which has the CompilerService
  // The renderer will handle the actual compilation — this handler acknowledges the request
  mainWindow?.webContents.send('compile:request', content)
  return { success: true, message: 'Compile request forwarded to renderer' }
})

// Listen for compile results from renderer
ipcMain.handle('compile:result', async (_event, result: unknown) => {
  // Notify tray or other listeners about compile completion
  if (tray) {
    tray.setToolTip(`JPE Studio — Compile ${result instanceof Object && 'success' in result ? (result as Record<string, unknown>).success : 'complete'}`)
  }
  return { success: true }
})

// === SENSORY HUB (NEW — 1 handler) ===
ipcMain.on('sensory:trigger', (_event, event: string, data?: unknown) => {
  // Low-latency, non-blocking trigger for "Living Brand" sensory feedback
  // Implementation will dispatch to native audio/haptic APIs
  console.log(`[SensoryHub] Triggered: ${event}`, data)
  
  if (event === 'test-latency') {
    mainWindow?.webContents.send('sensory:latency-pong', { timestamp: Date.now() })
  }
})

// === SIMS 4 ENGINE LINK (NEW — Story 6.2) ===
ipcMain.handle('sims4:getModsPath', async () => {
  try {
    const documentsPath = app.getPath('documents')
    const modsPath = path.join(documentsPath, 'Electronic Arts', 'The Sims 4', 'Mods')
    if (fs.existsSync(modsPath)) {
      return { success: true, path: modsPath }
    }
    return { success: false, error: 'Mods folder not found' }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('sims4:deployBridge', async (_event, pythonSource: string) => {
  try {
    const documentsPath = app.getPath('documents')
    const modsPath = path.join(documentsPath, 'Electronic Arts', 'The Sims 4', 'Mods')
    
    if (!fs.existsSync(modsPath)) {
      return { success: false, error: 'Mods folder not found' }
    }

    const bridgeFileName = 'jpe_live_sync.ts4script'
    const targetPath = path.join(modsPath, bridgeFileName)

    // Using JSZip to create the .ts4script binary on the fly
    const JSZip = require('jszip')
    const zip = new JSZip()
    zip.file('jpe_live_sync.py', pythonSource)
    
    const content = await zip.generateAsync({ type: 'nodebuffer' })
    await fs.promises.writeFile(targetPath, content)

    return { success: true, path: targetPath }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// === OS SHELL INTEGRATION (NEW — Story 6.4) ===
ipcMain.handle('shell:installContextMenu', async () => {
  if (process.platform !== 'win32') {
    return { success: false, error: 'Context menu integration only supported on Windows' }
  }

  try {
    // We'll use 'reg.exe' to avoid extra dependencies and maintain industrial stability.
    // %1 is the file path passed by Windows Explorer.
    const jpePath = app.isPackaged 
      ? path.join(path.dirname(process.execPath), 'jpe.exe') 
      : 'jpe'; // In dev, we assume 'jpe' is in the PATH or linked via npm

    const commands = [
      // Create the shell entry for all files (*)
      `reg add "HKCU\\Software\\Classes\\*\\shell\\Translate to JPE" /t REG_SZ /v "" /d "Translate to JPE" /f`,
      `reg add "HKCU\\Software\\Classes\\*\\shell\\Translate to JPE" /t REG_SZ /v "Icon" /d "${getIconPath()}" /f`,
      `reg add "HKCU\\Software\\Classes\\*\\shell\\Translate to JPE\\command" /t REG_SZ /v "" /d "\\"${jpePath}\\" open \\"%1\\"" /f`,
      
      // Specifically for .package files as well (ensure dominance)
      `reg add "HKCU\\Software\\Classes\\.package\\shell\\Translate to JPE" /t REG_SZ /v "" /d "Translate to JPE" /f`,
      `reg add "HKCU\\Software\\Classes\\.package\\shell\\Translate to JPE\\command" /t REG_SZ /v "" /d "\\"${jpePath}\\" open \\"%1\\"" /f`
    ]

    for (const cmd of commands) {
      await new Promise<void>((resolve, reject) => {
        exec(cmd, (error) => {
          if (error) reject(error)
          else resolve()
        })
      })
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// ─── Utility Functions ───────────────────────────────────────────────────────
function getIconPath(): string {
  const iconNames = ['icon.png', 'icon.ico', 'logo.png', 'jpe_logo.png']
  const possiblePaths = [
    path.join(__dirname, '../public'),
    path.join(__dirname, '../assets'),
    path.join(__dirname, '../core/libs/assets'),
    path.join(app.getAppPath(), 'public'),
    path.join(app.getAppPath(), 'assets'),
  ]

  for (const basePath of possiblePaths) {
    for (const icon of iconNames) {
      const fullPath = path.join(basePath, icon)
      if (fs.existsSync(fullPath)) return fullPath
    }
  }

  // Fallback: create a simple default icon
  return ''
}

// ─── App Lifecycle ───────────────────────────────────────────────────────────
app.on('ready', async () => {
  Menu.setApplicationMenu(buildAppMenu())

  // Initialize auto-updater (production only)
  if (!isDev) {
    try {
       
      const updater = require('electron-updater').autoUpdater as typeof import('electron-updater').autoUpdater
      updater.autoDownload = true
      updater.autoInstallOnAppQuit = true
      autoUpdater = updater
    } catch {
      console.warn('Auto-updater not available')
    }
  }

  try {
    if (isDev) {
      // In dev mode, connect to the running Next.js dev server
      createWindow('http://localhost:3000')
    } else {
      // In production, start the Next.js standalone server
      const url = await startNextServer()
      createWindow(url)

      // Set up auto-updater events
      if (autoUpdater) {
        autoUpdater.on('checking-for-update', () => {
          mainWindow?.webContents.send('update:checking')
        })
        autoUpdater.on('update-available', (info) => {
          mainWindow?.webContents.send('update:available', info.version)
        })
        autoUpdater.on('update-not-available', () => {
          mainWindow?.webContents.send('update:not-available')
        })
        autoUpdater.on('download-progress', (progressObj) => {
          mainWindow?.webContents.send('update:progress', progressObj.percent)
        })
        autoUpdater.on('update-downloaded', (info) => {
          mainWindow?.webContents.send('update:downloaded', info.version)
          // Show dialog asking user to restart
          dialog.showMessageBox(mainWindow!, {
            type: 'info',
            title: 'Update Ready',
            message: `JPE Studio ${info.version} is ready to install.`,
            detail: 'The app will restart to apply the update.',
            buttons: ['Restart Now', 'Later'],
          }).then((result) => {
            if (result.response === 0) {
              autoUpdater?.quitAndInstall()
            }
          })
        })
        autoUpdater.on('error', (err) => {
          console.error('Auto-updater error:', err)
          mainWindow?.webContents.send('update:error', err.message)
        })

        // Check for updates on startup
        autoUpdater.checkForUpdates().catch((err) => {
          console.error('Failed to check for updates:', err)
        })
      }
    }
    createTray()
  } catch (err) {
    console.error('Failed to start app:', err)
    app.quit()
  }

  // Handle deep links that opened before ready
  if (deepLinkURL) {
    handleDeepLink(deepLinkURL)
  }
})

app.on('before-quit', () => {
  // Kill the Next.js server when the app quits
  if (nextServer) {
    nextServer.kill()
    nextServer = null
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', async () => {
  if (mainWindow === null) {
    const url = isDev ? 'http://localhost:3000' : await startNextServer()
    createWindow(url)
  }
})

// ─── Export for testing ──────────────────────────────────────────────────────
export { buildAppMenu, buildTrayMenu, getIconPath }
