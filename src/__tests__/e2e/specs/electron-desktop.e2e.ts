/**
 * Electron Desktop App E2E Tests
 * 
 * Tests the Electron shell:
 * - App launches successfully
 * - Window is created with correct dimensions
 * - IPC handlers respond (file dialogs, window controls)
 * - Native menu is present
 * - Preload bridge exposes electron API
 */
import { _electron, test, expect } from '@playwright/test'
import path from 'path'

// Electron launch configuration
const electronAppPath = path.join(__dirname, '..', '..', '..', '..', 'dist-electron', 'main.js')
const isElectronBuilt = require('fs').existsSync(electronAppPath)

test.describe('Electron Desktop App', () => {
  // Skip if electron isn't built yet
  test.skip(!isElectronBuilt, 'Electron main process not built — run `npm run electron:build` first')

  let electronApp: Awaited<ReturnType<typeof _electron.launch>>
  let page: Awaited<ReturnType<typeof electronApp.firstWindow>>

  test.beforeAll(async () => {
    electronApp = await _electron.launch({
      args: [electronAppPath],
      env: {
        ...process.env,
        NODE_ENV: 'production',
        // Ensure dev server URL is NOT used
      },
      timeout: 30000,
    })

    // Wait for the first window to open
    page = await electronApp.firstWindow({ timeout: 15000 })
    // Give the Next.js dev server time to respond
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 })
  })

  test.afterAll(async () => {
    await electronApp.close()
  })

  test('should launch with a visible window', async () => {
    const windowState = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0]
      return {
        isVisible: win.isVisible(),
        width: win.getSize()[0],
        height: win.getSize()[1],
        title: win.getTitle(),
      }
    })

    expect(windowState.isVisible).toBe(true)
    expect(windowState.width).toBeGreaterThanOrEqual(1000)
    expect(windowState.height).toBeGreaterThanOrEqual(600)
  })

  test('should expose electron API via preload bridge', async () => {
    // Check that window.electron exists
    const hasElectronAPI = await page.evaluate(() => {
      return typeof (window as any).electron !== 'undefined'
    })
    expect(hasElectronAPI).toBe(true)
  })

  test('should expose file API methods', async () => {
    const fileMethods = await page.evaluate(() => {
      const e = (window as any).electron
      return {
        hasFile: typeof e?.file !== 'undefined',
        hasOpenFolder: typeof e?.file?.openFolder === 'function',
        hasOpenFile: typeof e?.file?.openFile === 'function',
        hasReadFile: typeof e?.file?.readFile === 'function',
        hasWriteFile: typeof e?.file?.writeFile === 'function',
        hasReadFileBuffer: typeof e?.file?.readFileBuffer === 'function',
        hasWriteFileBuffer: typeof e?.file?.writeFileBuffer === 'function',
      }
    })

    expect(fileMethods.hasFile).toBe(true)
    expect(fileMethods.hasOpenFolder).toBe(true)
    expect(fileMethods.hasOpenFile).toBe(true)
    expect(fileMethods.hasReadFile).toBe(true)
    expect(fileMethods.hasWriteFile).toBe(true)
    expect(fileMethods.hasReadFileBuffer).toBe(true)
    expect(fileMethods.hasWriteFileBuffer).toBe(true)
  })

  test('should expose project API methods', async () => {
    const projectMethods = await page.evaluate(() => {
      const e = (window as any).electron
      return {
        hasProject: typeof e?.project !== 'undefined',
        hasOpenDirectory: typeof e?.project?.openDirectory === 'function',
        hasReveal: typeof e?.project?.reveal === 'function',
        hasDelete: typeof e?.project?.delete === 'function',
        hasRename: typeof e?.project?.rename === 'function',
      }
    })

    expect(projectMethods.hasProject).toBe(true)
    expect(projectMethods.hasOpenDirectory).toBe(true)
    expect(projectMethods.hasReveal).toBe(true)
    expect(projectMethods.hasDelete).toBe(true)
    expect(projectMethods.hasRename).toBe(true)
  })

  test('should expose window control API methods', async () => {
    const windowMethods = await page.evaluate(() => {
      const e = (window as any).electron
      return {
        hasWindow: typeof e?.window !== 'undefined',
        hasMinimize: typeof e?.window?.minimize === 'function',
        hasMaximize: typeof e?.window?.maximize === 'function',
        hasClose: typeof e?.window?.close === 'function',
      }
    })

    expect(windowMethods.hasWindow).toBe(true)
    expect(windowMethods.hasMinimize).toBe(true)
    expect(windowMethods.hasMaximize).toBe(true)
    expect(windowMethods.hasClose).toBe(true)
  })

  test('should respond to IPC file:exists handler', async () => {
    // Test a real IPC call — check a non-existent file
    const result = await page.evaluate(async () => {
      return (window as any).electron.exists('C:\\nonexistent\\path\\file.txt')
    })

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.exists).toBe(false)
  })

  test('should have native application menu', async () => {
    const menuItems = await electronApp.evaluate(async ({ Menu }) => {
      const menu = Menu.getApplicationMenu()
      return menu?.items.map(item => item.label) || []
    })

    expect(menuItems).toContain('File')
    expect(menuItems).toContain('Edit')
    expect(menuItems).toContain('View')
    expect(menuItems).toContain('Help')
  })
})
