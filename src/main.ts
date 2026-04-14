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
import { exec } from 'child_process'
import { LiveMonitor } from './services/main/LiveMonitor'
import { PathResolver } from './services/main/PathResolver'
import { OllamaManager } from './services/main/OllamaManager'
import { ModelSetupService } from './services/main/ModelSetupService'
import { LinkServer } from './services/main/LinkServer'
import { RebelsManager } from './services/main/RebelsManager'
import { AiManager } from './services/main/AiManager'
import { ScarletManager } from './services/main/ScarletManager'
import { SecurityManager } from './services/main/SecurityManager'
import { Sims4Manager } from './services/main/Sims4Manager'
import { TransformManager } from './services/main/TransformManager'

// Auto-updater (only in production — check after app ready to avoid require issues)
let autoUpdater: typeof import('electron-updater').autoUpdater | null = null

// ─── Protocol Registration ───────────────────────────────────────────────────
// Must be called before app.ready
protocol.registerSchemesAsPrivileged([
  { 
    scheme: 'app', 
    privileges: { 
      standard: true, 
      secure: true, 
      allowServiceWorkers: true, 
      supportFetchAPI: true,
      bypassCSP: true, 
      corsEnabled: true 
    } 
  }
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
      webSecurity: true, // Hardened: Re-enabling standard security barriers
      allowRunningInsecureContent: false, // Hardened: Disabling insecure content
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

  // Diagnostic: Monitor renderer crashes (Story 13.1 Stabilization)
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    const { reason, exitCode } = details
    console.error(`[Main] Renderer Process Gone: ${reason} (${exitCode})`)
    if (reason === 'crashed' || reason === 'oom') {
       console.error('[Main] Critical Renderer Failure Detected')
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

// === SENSORY HUB (NEW — 1 handler) ===
ipcMain.on('sensory:trigger', (_event, event: string, data?: unknown) => {
  // Low-latency, non-blocking trigger for "Living Brand" sensory feedback
  // Implementation will dispatch to native audio/haptic APIs
  console.log(`[SensoryHub] Triggered: ${event}`, data)

  if (event === 'test-latency') {
    mainWindow?.webContents.send('sensory:latency-pong', { timestamp: Date.now() })
  }
})

// === MANAGER-SERVICE IPC HANDLERS ===
// The following IPC channels are handled by Manager services:
// - sims4:getModsPath, sims4:deployBridge (Sims4Manager)
// - bridge:sendCommand (Sims4Manager via LinkServer)
// - security:vault:get, security:vault:set, security:vault:status (SecurityManager)
// - ts4rebels:invoke (RebelsManager)
// - transform:health, transform:run (TransformManager)
// - ai:invoke (AiManager)
// - scarlet:fetch (ScarletManager)
// - ai:ollama:info, ai:ollama:switch-provider (OllamaManager)
//
// See src/services/main/*Manager.ts for implementations.
// These handlers are registered during app.whenReady() initialization.

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
    protocol.handle('app', async (request) => {
      try {
        const parsedUrl = new URL(request.url)
        let pathname = parsedUrl.pathname
        
        // Remove leading dots and slashes (compatibility for various Electron path styles)
        pathname = pathname.replace(/^\/*\.\/+/, '').replace(/^\/+/, '')
        
        // Industrial Fallback: if no extension, it's likely a route, serve index.html
        if (!path.extname(pathname)) {
          console.log(`[Protocol] Route detected: ${pathname} -> serving index.html`)
          pathname = pathname ? `${pathname}/index.html` : 'index.html'
        }

        let filePath = PathResolver.getStaticAssetPath(pathname)
        
        // 404/403 Fallback Strategy
        if (!fs.existsSync(filePath)) {
           // Check if directory exists but index.html was expected
           if (fs.existsSync(filePath.replace(/\.html$/, '')) && fs.lstatSync(filePath.replace(/\.html$/, '')).isDirectory()) {
              filePath = path.join(filePath.replace(/\.html$/, ''), 'index.html')
           }
           
           if (!fs.existsSync(filePath)) {
              console.warn(`[Protocol] 404 Fallback: ${filePath} -> serving root index.html`)
              filePath = PathResolver.getInternalPath('out', 'index.html')
           }
        }

        const data = await fs.promises.readFile(filePath)
        const ext = path.extname(filePath).toLowerCase()
        
        // Next.js 15 RSC expects text/x-component for .txt shards
        const isRsc = parsedUrl.searchParams.has('_rsc')
        const mimeMap: Record<string, string> = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.txt': isRsc ? 'text/x-component' : 'text/plain',
          '.json': 'application/json'
        }

        return new Response(data, {
          status: 200,
          headers: {
            'Content-Type': mimeMap[ext] || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
          }
        })
      } catch (error) {
        console.error('[Protocol Handler] Critical Error:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
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

  // Initialize Industrial AI Engine & All Manager Services (unless in E2E mode)
  if (!process.env.JPE_E2E_MODE) {
    try {
      // 1. Initialize all Manager services (registers IPC handlers)
      RebelsManager.initialize()
      AiManager.initialize()
      ScarletManager.initialize()
      SecurityManager.initialize()
      TransformManager.initialize()
      Sims4Manager.initialize(linkServer || undefined)

      // 2. Sync models
      await ModelSetupService.initialize()

      // 3. Start OllamaManager
      ollamaManager = new OllamaManager()
      await ollamaManager.initialize()

      console.log('[Main] All Manager services initialized')
    } catch (err) {
      console.error('[Main] Failed to initialize Manager services:', err)
    }
  } else {
    console.log('[Main] Skipping Manager service init in E2E Mode')
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
