import { _electron, test, expect } from '@playwright/test'
import path from 'path'

/**
 * PRODUCTION SMOKE TEST
 * 
 * Target: Unpacked production binary
 * Verification:
 * - App launches from built .exe
 * - Page loads from local filesystem (out/index.html)
 * - window.electron bridge is active
 * - No critical console errors
 */

const EXECUTABLE_PATH = path.join(process.cwd(), 'release-dist', 'win-unpacked', 'JPE Studio.exe')

test.describe('JPE Studio Production Smoke Test', () => {
  let electronApp: Awaited<ReturnType<typeof _electron.launch>>
  
  test.beforeAll(async () => {
    // Check if executable exists
    const fs = require('fs')
    if (!fs.existsSync(EXECUTABLE_PATH)) {
      throw new Error(`Executable not found at ${EXECUTABLE_PATH}. Run "npm run electron:dist:win" first.`)
    }

    electronApp = await _electron.launch({
      executablePath: EXECUTABLE_PATH,
      timeout: 30000,
    })
  })

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close()
    }
  })

  test('should launch the production application window', async () => {
    const page = await electronApp.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    
    const title = await page.title()
    // Product name from package.json/electron-builder.yml
    expect(title).toContain('JPE Studio')
    
    const isVisible = await page.isVisible('body')
    expect(isVisible).toBe(true)
  })

  test('should have a functional native bridge (IPC)', async () => {
    const page = await electronApp.firstWindow()
    
    // Verify bridge exists
    const hasBridge = await page.evaluate(() => {
      return typeof (window as any).electron !== 'undefined'
    })
    expect(hasBridge).toBe(true)
    
    // Verify specific bridge methods
    const bridgeMethods = await page.evaluate(() => {
      const e = (window as any).electron
      return {
        hasFile: !!e.file,
        hasProject: !!e.project,
        hasAI: !!e.ai, // Assuming AI was refactored similarly
      }
    })
    
    expect(bridgeMethods.hasFile).toBe(true)
    expect(bridgeMethods.hasProject).toBe(true)
  })

  test('should reach the studio editor from the landing page', async () => {
    const page = await electronApp.firstWindow()
    
    // 1. Verify Landing Page
    await page.waitForSelector('h1', { timeout: 10000 })
    const heading = await page.textContent('h1')
    expect(heading).toContain('written in')
    
    // 2. Click Launch Editor
    await page.click('[data-testid="launch-editor"]')
    
    // 3. Wait for Studio View (contains sidebar or specific editor components)
    // The studio page often has a sidebar or specific editor parts
    await page.waitForTimeout(2000) // Transition time
    
    const content = await page.textContent('body')
    expect(content).not.toContain('Error: window is not defined')
    
    // Check if we are in the studio
    const url = page.url()
    // It might be file path based, but should end in studio/index.html or similar
    expect(url.toLowerCase()).toContain('studio')
  })

  test('should monitor for critical console errors', async () => {
    const page = await electronApp.firstWindow()
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Interact slightly to trigger any latent events
    await page.mouse.move(100, 100)
    await page.waitForTimeout(2000)
    
    // Fail if there are catastrophic React errors (ignoring common noise if any)
    const criticalErrors = errors.filter(e => 
      e.includes('React hydration') || 
      e.includes('bridge') ||
      e.includes('ReferenceError')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })
})
