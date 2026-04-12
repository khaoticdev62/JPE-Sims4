import {
  app,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  ipcMain,
  dialog,
  shell,
  Tray,
  protocol,
} from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'
import axios from 'axios'
import { spawn, exec } from 'child_process'
import { LiveMonitor } from './services/main/LiveMonitor'
import { PathResolver } from './services/main/PathResolver'
import { OllamaManager } from './services/main/OllamaManager'
import { ModelSetupService } from './services/main/ModelSetupService'
import { SecureStore } from './services/main/SecureStore'
import { LinkServer } from './services/main/LinkServer'

// Auto-updater (only in production — check after app ready to avoid require issues)
let autoUpdater: typeof import('electron-updater').autoUpdater | null = null

// ─── Protocol Registration ───────────────────────────────────────────────────
// Must be called before app.ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, allowServiceWorkers: true, supportFetchAPI: true } }
])

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
let liveMonitor: LiveMonitor | null = null
let linkServer: LinkServer | null = null
let ollamaManager: OllamaManager | null = null
const isDev = process.env.NODE_ENV === 'development'

// ─── Environment Detection ──────────────────────────────────────────────────
const isSteamDeck = (): boolean => {
  // Check common Steam Deck environmental signatures
  return (
    process.env.STEAM_DECK === '1' ||
    process.env.XDG_CURRENT_DESKTOP === 'gamescope' ||
    // Heuristic: check specific screen resolution if we have a window already (less reliable early)
    process.platform === 'linux' && process.env.USER === 'deck'
  )
}

// ─── Window Creation ────────────────────────────────────────────────────────
const createWindow = (_url: string) => {
  const onSteamDeck = isSteamDeck()

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    fullscreen: onSteamDeck,
    // Start hidden, maximize/fullscreen, then show to prevent flicker
    show: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0c10',
    icon: PathResolver.getBrandingIconPath(),
    webPreferences: {
      preload: PathResolver.getInternalPath('dist-electron', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
    },
  })

  // Set maximized on desktop immediately after creation
  if (!onSteamDeck) {
    mainWindow.maximize()
  }

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
  } else {
    mainWindow.loadURL('app://./index.html')
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    
    // Initialize Spectral LiveMonitor
    if (mainWindow) {
      liveMonitor = new LiveMonitor(mainWindow)
      liveMonitor.start()

      // Initialize Spectral LinkServer (Story 13.1)
      linkServer = new LinkServer(mainWindow)
      linkServer.start()
    }

    if (isDev && mainWindow) {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    liveMonitor?.stop()
    liveMonitor = null
    linkServer?.stop()
    linkServer = null
  })

  // Prevent navigation to external URLs
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })
}

// ─── Tray & Resources ────────────────────────────────────────────────────────
const createTray = () => {
  try {
    const iconPath = PathResolver.getBrandingIconPath()
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

ipcMain.handle('file:save', async (_event, defaultPath?: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath,
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
  
  // Industrial Performance optimization: Filter during discovery
  // Common exclusion patterns
  const excludeDirs = ['node_modules', '.next', '.venv', 'dist', 'build', '.git', 'out', '__pycache__', '.jpe_history']
  
  try {
    const files: any[] = []
    
    // Recursive walker with exclusion optimization
    async function walk(currentPath: string) {
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true })
      for (const entry of entries) {
        if (excludeDirs.includes(entry.name)) continue
        
        const fullPath = path.join(currentPath, entry.name)
        if (entry.isDirectory()) {
          await walk(fullPath)
        } else if (entry.isFile()) {
          files.push({
            path: fullPath,
            name: entry.name,
            ext: path.extname(entry.name),
          })
        }
      }
    }

    await walk(dirPath)

    return {
      success: true,
      path: dirPath,
      name: path.basename(dirPath),
      files: files
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

ipcMain.handle('project:search', async (_event, dirPath: string, query: string, options: { isRegex: boolean, isCase: boolean, isWord: boolean, extension?: string }) => {
  const { isRegex, isCase, isWord, extension } = options
  const start = performance.now()
  console.log(`[IPC:project:search] Searching for "${query}" in ${dirPath}...`)
  
  try {
    const results: any[] = []
    const excludeDirs = ['node_modules', '.next', '.venv', 'dist', 'build', '.git', 'out', '__pycache__', '.jpe_history']
    const skipExts = ['package', 'png', 'jpg', 'zip', 'exe', 'bin', 'dll', 'pyc', 'node']

    // 1. Prepare Regex
    const flags = isCase ? 'g' : 'gi'
    let pattern = query
    if (!isRegex) pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (isWord) pattern = `\\b${pattern}\\b`
    
    let regex: RegExp
    try {
      regex = new RegExp(pattern, flags)
    } catch (_e) {
      return { success: false, error: 'Invalid regular expression' }
    }

    // 2. Discover files (Fast shallow filter)
    const filePaths: string[] = []
    async function collect(currentPath: string) {
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true })
      for (const entry of entries) {
        if (excludeDirs.includes(entry.name)) continue
        const fullPath = path.join(currentPath, entry.name)
        if (entry.isDirectory()) {
          await collect(fullPath)
        } else {
          const ext = path.extname(entry.name).slice(1).toLowerCase()
          if (extension && ext !== extension.toLowerCase()) continue
          if (skipExts.includes(ext)) continue
          filePaths.push(fullPath)
        }
      }
    }
    await collect(dirPath)

    // 3. Concurrent Search (Max 20 concurrent readers)
    const CONCURRENCY = 20
    for (let i = 0; i < filePaths.length; i += CONCURRENCY) {
      const chunk = filePaths.slice(i, i + CONCURRENCY)
      await Promise.all(chunk.map(async (filePath) => {
        try {
          const content = await fs.promises.readFile(filePath, 'utf-8')
          // Quick pre-check
          regex.lastIndex = 0
          if (!regex.test(content)) return

          const lines = content.split(/\r?\n/)
          const fileMatches: any[] = []
          lines.forEach((text, index) => {
            regex.lastIndex = 0
            if (regex.test(text)) {
              fileMatches.push({ num: index + 1, text: text.trim().substring(0, 200) })
            }
          })
          
          if (fileMatches.length > 0) {
            results.push({
              file: {
                path: path.relative(dirPath, filePath).replace(/\\/g, '/'),
                ext: path.extname(filePath).slice(1).toLowerCase()
              },
              matches: fileMatches
            })
          }
        } catch (_err) {
          // Skip unreadable files
        }
      }))
      
      // Stop if we have too many results to avoid IPC bloat
      if (results.length > 1000) break
    }

    const duration = (performance.now() - start).toFixed(2)
    console.log(`[IPC:project:search] Completed in ${duration}ms. Found ${results.length} files.`)
    return { success: true, results, duration }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('project:replaceInFiles', async (_event, dirPath: string, query: string, replacement: string, options: { isRegex: boolean, isCase: boolean, isWord: boolean, extension?: string }) => {
  const { isRegex, isCase, isWord, extension } = options
  const start = performance.now()
  console.log(`[IPC:project:replaceInFiles] Replacing "${query}" with "${replacement}" in ${dirPath}...`)
  
  try {
    let affectedFiles = 0
    let totalReplacements = 0
    
    // First, find all matches (reusing logic or calling internal)
    // Note: ipcMain.emit returns boolean, so we re-implement the scan logic directly below
    const files = await fs.promises.readdir(dirPath, { withFileTypes: true, recursive: true })
    const flags = isCase ? 'g' : 'gi'
    let pattern = query
    if (!isRegex) pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (isWord) pattern = `\\b${pattern}\\b`
    const regex = new RegExp(pattern, flags)
    const excludeDirs = ['node_modules', '.next', '.venv', 'dist', 'build', '.git', 'out']

    for (const file of files) {
      if (!file.isFile()) continue
      const filePath = path.join(dirPath, file.path || '', file.name)
      const standardizedPath = filePath.replace(/\\/g, '/')
      if (excludeDirs.some(dir => standardizedPath.includes(`/${dir}/`))) continue
      const ext = path.extname(file.name).slice(1).toLowerCase()
      if (extension && ext !== extension.toLowerCase()) continue
      if (['package', 'png', 'jpg', 'zip', 'exe', 'bin', 'dll'].includes(ext)) continue

      try {
        const content = await fs.promises.readFile(filePath, 'utf-8')
        if (regex.test(content)) {
          const newContent = content.replace(regex, replacement)
          const matchCount = (content.match(regex) || []).length
          await fs.promises.writeFile(filePath, newContent, 'utf-8')
          affectedFiles++
          totalReplacements += matchCount
        }
      } catch (_err) { continue }
    }

    const duration = (performance.now() - start).toFixed(2)
    return { success: true, affectedFiles, totalReplacements, duration }
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

// === LIVE BRIDGE COMMANDS (NEW — Story 13.1) ===
ipcMain.handle('bridge:sendCommand', async (_event, type: string, payload: any) => {
  try {
    if (!linkServer) throw new Error('Link server not initialized')
    linkServer.sendCommand(type, payload)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// === SECURITY VAULT (NEW — AES-256 Shielding) ===
ipcMain.handle('security:vault:get', async (_event, key: string) => {
  try {
    const value = SecureStore.getInstance().get(key)
    return { success: true, value }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('security:vault:set', async (_event, key: string, value: any) => {
  try {
    SecureStore.getInstance().set(key, value)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('security:vault:status', async () => {
  try {
    const isShielded = SecureStore.getInstance().isShielded()
    return { success: true, isShielded, algorithm: 'AES-256-GCM', provider: 'Native Security Engine' }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// === TS4Rebels NATIVE BRIDGE (NEW — Story 7.1) ===
// Production-hardened: timeout, sanitization, env-based credentials
ipcMain.handle('ts4rebels:invoke', async (_event, action: string, params: Record<string, string>) => {
  return new Promise((resolve) => {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3'

    // Resolve CLI path correctly for both dev and packaged modes
    const cliPath = PathResolver.getPythonScriptPath('cli.py')

    // Input sanitization helper
    const sanitize = (s: unknown, maxLen = 256): string => {
      if (typeof s !== 'string') throw new Error('Invalid parameter type')
      if (s.length === 0) throw new Error('Parameter cannot be empty')
      if (s.length > maxLen) throw new Error(`Parameter exceeds max length (${maxLen})`)
      if (s.startsWith('--') || s.startsWith('-')) throw new Error('Invalid parameter format')
      return s
    }

    // Validate action
    if (!['login', 'forum', 'topic', 'publish'].includes(action)) {
      resolve({ success: false, error: 'Invalid TS4Rebels action' })
      return
    }

    // Base arguments
    const args = [cliPath, 'ts4rebels', '--enable-network']

    // Temp file tracking (hoisted to avoid ReferenceError on child before spawn)
    let publishTempPath: string | null = null

    // Add session cookies if provided (base64 encoded JSON) with size limit
    if (params.cookies) {
      if (params.cookies.length > 65536) {
        resolve({ success: false, error: 'Cookies parameter too large' })
        return
      }
      try {
        const decodedCookies = Buffer.from(params.cookies, 'base64').toString('utf-8')
        args.push('--cookies', decodedCookies)
      } catch (_e) {
        // Silently handle cookie decode failures
      }
    }

    // Environment variables for credentials (more secure than CLI args)
    const childEnv: NodeJS.ProcessEnv = {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
    }

    // Action handling with sanitization
    try {
      if (action === 'login') {
        // Use env vars for credentials (not CLI args)
        childEnv.JPE_TS4REBELS_USER = sanitize(params.username, 256)
        childEnv.JPE_TS4REBELS_PASS = sanitize(params.password, 512)
        args.push('login')
      } else if (action === 'forum') {
        args.push('forum', sanitize(params.forum, 64), '--page', sanitize(params.page || '1', 10))
      } else if (action === 'topic') {
        args.push('topic', sanitize(params.topic, 64), '--page', sanitize(params.page || '1', 10))
      } else if (action === 'publish') {
        const title = sanitize(params.title, 512)
        const desc = sanitize(params.description, 4096)
        const tags = params.tags ? sanitize(params.tags, 512) : ''
        const packageName = sanitize(params.packageName, 256)
        
        // Handle binary data (passed as base64)
        if (!params.packageBase64) throw new Error('Package data is missing')
        
        const tempDir = path.join(os.tmpdir(), 'jpe-studio-publish')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const tempPath = path.join(tempDir, packageName)
        const buffer = Buffer.from(params.packageBase64, 'base64')
        fs.writeFileSync(tempPath, buffer)
        
        args.push('publish', '--title', title, '--description', desc, '--package', tempPath)
        if (tags) args.push('--tags', tags)
        
        // Track for cleanup after child exits
        publishTempPath = tempPath
      } else {
        resolve({ success: false, error: 'Invalid TS4Rebels action or missing parameters' })
        return
      }
    } catch (err) {
      resolve({ success: false, error: err instanceof Error ? err.message : 'Parameter validation failed' })
      return
    }

    // Safe logging to prevent EPIPE errors
    try {
      console.log(`[TS4Rebels Main] Executing: ${pythonCmd} ${args.join(' ')}`)
    } catch (_e) {
      // Ignore EPIPE errors from console.log
    }

    const child = spawn(pythonCmd, args, {
      env: childEnv,
      cwd: process.cwd(),
    })

    let stdout = ''
    let stderr = ''

    // Handle stdio errors to prevent EPIPE
    child.stdout.on('error', () => {
      // Ignore stdout errors (EPIPE, etc.)
    })
    child.stderr.on('error', () => {
      // Ignore stderr errors (EPIPE, etc.)
    })

    child.stdout.on('data', (data) => { stdout += data.toString() })
    child.stderr.on('data', (data) => { stderr += data.toString() })

    // Timeout: 600 seconds for large uploads (Story 5.6 industrialization)
    const timeout = setTimeout(() => {
      if (!child.killed) {
        try {
          console.warn('[TS4Rebels Main] Process timeout - killing child')
        } catch (_e) {
          // Ignore EPIPE
        }
        child.kill('SIGTERM')
        // Force kill after 5s grace period
        setTimeout(() => {
          if (!child.killed) child.kill('SIGKILL')
        }, 5000)
      }
    }, 600000)

    child.on('close', (code) => {
      clearTimeout(timeout)
      
      // Cleanup temp file if exists
      if (publishTempPath) {
        try {
          fs.unlinkSync(publishTempPath)
        } catch (_e) {
          // Expected: temp file may not exist if process was killed
        }
      }

      try {
        if (code === 0) {
          resolve({ success: true, data: JSON.parse(stdout) })
        } else {
          resolve({ success: false, error: stderr || `Process exited with code ${code}` })
        }
      } catch (err) {
        resolve({ success: false, error: `Parse error: ${String(err)}`, raw: stdout })
      }
    })

    child.on('error', (err) => {
      clearTimeout(timeout)
      resolve({ success: false, error: err instanceof Error ? err.message : String(err) })
    })
  })
})

// === PYTHON HEALTH CHECK (lightweight — no temp files, no transform) ===
ipcMain.handle('transform:health', async () => {
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3'
  return new Promise((resolve) => {
    const proc = spawn(pythonCmd, ['--version'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000,
    })
    let stdout = ''
    proc.stdout.on('data', (data) => { stdout += data.toString() })
    proc.on('close', (code) => {
      if (code === 0) {
        const versionMatch = stdout.match(/Python\s+(\d+\.\d+\.\d+)/)
        resolve({
          available: true,
          version: versionMatch ? versionMatch[1] : stdout.trim(),
          path: pythonCmd,
        })
      } else {
        resolve({ available: false, version: '', path: '' })
      }
    })
    proc.on('error', () => {
      resolve({ available: false, version: '', path: '' })
    })
  })
})

// === NATIVE TRANSFORM ENGINE (NEW — Ported from /api/transform) ===
ipcMain.handle('transform:run', async (_event, source: string, fileName: string) => {
  const start = performance.now()
  console.log('[IPC:transform:run] Starting industrial synthesis...')
  const tempDir = path.join(os.tmpdir(), `jpe-native-transform-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const inputFile = path.join(tempDir, fileName || 'input.jpe')
  const outputFile = path.join(tempDir, 'output.xml')

  try {
    await fs.promises.mkdir(tempDir, { recursive: true })
    await fs.promises.writeFile(inputFile, source, 'utf-8')

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3'
    const engineScript = PathResolver.getPythonScriptPath('scripts/transform_jpe.py')

    return new Promise((resolve) => {
      const args = [engineScript, inputFile, '-o', outputFile]
      const proc = spawn(pythonCmd, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        cwd: process.cwd(),
      })

      let _stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => { _stdout += data.toString() })
      proc.stderr.on('data', (data) => { stderr += data.toString() })

      const timeout = setTimeout(() => {
        if (!proc.killed) proc.kill('SIGKILL')
      }, 30000)

      proc.on('close', async (code) => {
        clearTimeout(timeout)
        const duration = (performance.now() - start).toFixed(2)
        console.log(`[IPC:transform:run] Completed in ${duration}ms`)
        
        try {
          if (code === 0) {
            const xml = await fs.promises.readFile(outputFile, 'utf-8')
            resolve({ success: true, xml, duration, errors: parseStderr(stderr) })
          } else {
            resolve({ success: false, error: stderr || `Exit code ${code}`, duration, errors: parseStderr(stderr) })
          }
        } catch (err) {
          resolve({ success: false, error: `Output error: ${err}`, duration })
        } finally {
          // Cleanup
          try {
            await fs.promises.unlink(inputFile).catch(() => {})
            await fs.promises.unlink(outputFile).catch(() => {})
            await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {})
          } catch (e) {
            console.warn('[Transform Main] Cleanup failed:', e)
          }
        }
      })

      proc.on('error', (err) => {
        clearTimeout(timeout)
        resolve({ success: false, error: err.message, duration: (performance.now() - start).toFixed(2) })
      })
    })
  } catch (err) {
    return { success: false, error: String(err), duration: (performance.now() - start).toFixed(2) }
  }
})

function parseStderr(stderr: string) {
  const errors: any[] = []
  if (!stderr.trim()) return errors
  
  stderr.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) return
    const match = trimmed.match(/^Line\s+(\d+):\s*(.*?):\s*(.*)/i)
    if (match) {
      errors.push({ line: parseInt(match[1]), severity: match[2].toLowerCase(), message: match[3] })
    } else {
      errors.push({ message: trimmed, severity: 'error' })
    }
  })
  return errors
}

// === NATIVE AI BRIDGE (IMPROVED) ===
ipcMain.handle('ai:invoke', async (_event, provider: string, method: string, params: any) => {
  const start = performance.now()
  console.log(`[IPC:ai:invoke] Routing to ${provider}...`)
  const { url, headers, data, key: _key } = params
  
  console.log(`[AI Main] Native Bridge: ${provider}:${method} -> ${url}`)

  try {
    // We handle the network request here in the Main process
    // This bypasses any CORS issues in the renderer and centralizes security
    const response = await axios({
      method: method.toUpperCase() || 'POST',
      url,
      headers: {
        ...headers,
        // If the key is passed we can ensure it's used correctly
        // In the future, we can pull keys from OS Keychain here instead of passing them
      },
      data,
      timeout: 30000,
    })

    const duration = (performance.now() - start).toFixed(2)
    console.log(`[IPC:ai:invoke] ${provider} responded in ${duration}ms`)

    return {
      success: true,
      data: response.data,
      status: response.status,
    }
  } catch (error: any) {
    console.error(`[AI Main] Native request failed for ${provider}:`, error.message)
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    }
  }
})

// === NATIVE SCARLET SCRAPER (NEW — Ported from /api/scarlet) ===
ipcMain.handle('scarlet:fetch', async () => {
  const start = performance.now()
  console.log('[IPC:scarlet:fetch] Initializing 2-stage handshake...')
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  
  try {
    // 1. Fetch page for nonce
    const pageResponse = await axios.get('https://scarletsrealm.com/the-mod-list-sfw-only-edition/', {
      headers: { 'User-Agent': userAgent }
    })
    
    const html = pageResponse.data
    const nonceMatch = html.match(/"nonce":"([a-zA-Z0-9]+)"/)
    if (!nonceMatch) throw new Error('Structure Change: Could not find nonce on Scarlet Realm.')
    const nonce = nonceMatch[1]

    // 2. AJAX data fetch
    const params = new URLSearchParams()
    params.append('action', 'mlc_get_data')
    params.append('nonce', nonce)
    params.append('table_id', '3')

    const apiResponse = await axios.post('https://scarletsrealm.com/wp-admin/admin-ajax.php', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent
      }
    })

    const data = apiResponse.data
    if (!data || !data.data) throw new Error('Malformed response from Scarlet')

    // 3. Transform
    const rows = data.data.rows || []
    const mods = rows.map((row: any[], index: number) => ({
      id: `scarlet-${index}`,
      name: row[1] || 'Unknown Mod',
      creator: row[2] || 'Unknown Creator',
      status: mapScarletStatus(row[4]),
      version: row[5] || 'Unknown',
      notes: row[7] || '',
      category: row[11] || ''
    }))

    const duration = (performance.now() - start).toFixed(2)
    console.log(`[IPC:scarlet:fetch] Completed in ${duration}ms`)

    return { success: true, count: mods.length, mods, performance: { totalTime: duration } }
  } catch (err: any) {
    console.error('[Scarlet Main] Fetch failed:', err.message)
    return { success: false, error: err.message }
  }
})

function mapScarletStatus(rawStatus: string): string {
  const s = rawStatus?.toLowerCase() || ''
  if (s.includes('fine') || s.includes('working') || s.includes('clear')) return 'Fine'
  if (s.includes('updated')) return 'Updated'
  if (s.includes('broken')) return 'Broken'
  if (s.includes('n/a')) return 'N/A'
  return 'Unknown'
}

// === SHELL CONTEXT MENU (Windows Only) ===
ipcMain.handle('shell:installContextMenu', async () => {
  if (process.platform !== 'win32') {
    return { success: false, error: 'Context menu integration only supported on Windows' }
  }

  try {
    // Resolve app executable path
    const jpePath = app.isPackaged 
      ? process.execPath 
      : 'jpe'

    const commands = [
      // Create the shell entry for all files (*)
      `reg add "HKCU\\Software\\Classes\\*\\shell\\Translate to JPE" /t REG_SZ /v "" /d "Translate to JPE" /f`,
      `reg add "HKCU\\Software\\Classes\\*\\shell\\Translate to JPE" /t REG_SZ /v "Icon" /d "${PathResolver.getBrandingIconPath()}" /f`,
      `reg add "HKCU\\Software\\Classes\\*\\shell\\Translate to JPE\\command" /t REG_SZ /v "" /d "\\"${jpePath}\\" open \\"%1\\"" /f`,
      
      // Specifically for .package files as well
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

// ─── App Lifecycle ───────────────────────────────────────────────────────────
app.on('ready', async () => {
  // Register custom protocol to serve static files from 'out' directory
  if (!isDev) {
    protocol.registerFileProtocol('app', (request, callback) => {
      // Robust URL extraction: remove app:// and then remove leading slashes
      let url = request.url.replace(/^app:\/\//, '')
      
      // Remove leading slashes/dots so it becomes relative to out/
      url = url.replace(/^[./]+/, '')

      // Clean up the path (remove query params etc)
      url = url.split('?')[0].split('#')[0]

      const filePath = PathResolver.getStaticAssetPath(url)

      callback({ path: path.normalize(filePath) })
    })
  }

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
      // In dev mode, we assume the Next.js server is already running
      createWindow('http://localhost:3000')
    } else {
      // In production, we load directly from the static 'out' directory
      createWindow('') // window.loadFile handles the path in the refactored version

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

  // Initialize Industrial AI Engine
  try {
    // 1. Sync models
    await ModelSetupService.initialize()
    
    // 2. Start manager
    ollamaManager = new OllamaManager()
    await ollamaManager.initialize()
  } catch (err) {
    console.error('[Main] Failed to initialize AI engine:', err)
  }

  // Handle deep links that opened before ready
  if (deepLinkURL) {
    handleDeepLink(deepLinkURL)
  }
})

app.on('before-quit', () => {
  // Graceful shutdown of sandboxed AI engine
  ollamaManager?.stop()
  liveMonitor?.stop()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', async () => {
  if (mainWindow === null) {
    if (isDev) {
      createWindow('http://localhost:3000')
    } else {
      createWindow('')
    }
  }
})

// ─── Export for testing ──────────────────────────────────────────────────────
export { buildAppMenu, buildTrayMenu }
