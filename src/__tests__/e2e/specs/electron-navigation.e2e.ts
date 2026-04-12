/**
 * Electron E2E Navigation Test (Diagnostic Version)
 * 
 * Verifies that the application can successfully navigate between
 * all primary studio views within the Electron shell.
 * Includes diagnostic capturing for debugging failures.
 */
import { _electron, test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// Electron launch configuration
const electronAppPath = path.join(__dirname, '..', '..', '..', '..', 'dist-electron', 'main.js')
const isElectronBuilt = fs.existsSync(electronAppPath)
const artifactDir = path.join(__dirname, '..', '..', '..', '..', 'artifacts')

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true })
}

test.describe('Electron Navigation Flow', () => {
  // Skip if electron isn't built yet
  test.skip(!isElectronBuilt, 'Electron main process not built — run `npm run electron:build` first')

  let electronApp: Awaited<ReturnType<typeof _electron.launch>>
  let firstWindow: Awaited<ReturnType<typeof electronApp.firstWindow>>

  test.beforeAll(async () => {
    console.log('[E2E] Launching Electron...')
    electronApp = await _electron.launch({
      args: [electronAppPath],
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
      timeout: 60000,
    })

    // Wait for the first window to open
    firstWindow = await electronApp.firstWindow({ timeout: 15000 })
    
    // Diagnostic: Capture console logs
    firstWindow.on('console', msg => console.log(`[Renderer Console] ${msg.type()}: ${msg.text()}`))
    firstWindow.on('pageerror', err => console.error(`[Renderer Error] ${err.message}`))

    console.log('[E2E] Window opened. URL:', firstWindow.url())
    
    // Dismiss Splash Screen
    console.log('[E2E] Waiting for splash screen dismissal...')
    await firstWindow.click('body', { force: true }).catch(() => {})
    
    // Wait for initial content to settle
    await firstWindow.waitForLoadState('networkidle').catch(() => {
        console.warn('[E2E] networkidle timeout - continuing anyway')
    })
  })

  test.afterEach(async ({}: any, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = path.join(artifactDir, `e2e-failure-${testInfo.title.replace(/\s+/g, '-')}.png`)
      await firstWindow.screenshot({ path: screenshotPath })
      console.log(`[E2E] Failure screenshot saved to: ${screenshotPath}`)
    }
  })

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close()
    }
  })

  test('should verify correct landing or direct to studio', async () => {
    // Some versions might skip landing if already initialized
    const launchButton = firstWindow.locator('[data-testid="launch-editor"]')
    const isLanding = await launchButton.isVisible({ timeout: 5000 }).catch(() => false)
    
    if (isLanding) {
      console.log('[E2E] On Landing Page, clicking Launch Editor')
      await launchButton.click()
    } else {
      console.log('[E2E] Skipped Landing Page or button not found')
    }

    // Capture state for debugging
    await firstWindow.screenshot({ path: path.join(artifactDir, 'debug-landing-state.png') })

    // Verify we are on the Dashboard or Studio
    const dashboard = firstWindow.locator('[data-testid="dashboard-root"]')
    const studio = firstWindow.locator('[data-testid="editor-pane"]')
    
    await expect(dashboard.or(studio)).toBeVisible({ timeout: 15000 })
  })

  test('should navigate across primary modules', async () => {
    // 1. Projects
    console.log('[E2E] Navigating to Projects')
    await firstWindow.click('[data-testid="nav-projects"]')
    await expect(firstWindow.locator('[data-testid="projects-root"]')).toBeVisible()

    // 2. Studio
    console.log('[E2E] Navigating to Studio')
    await firstWindow.click('[data-testid="nav-code"]')
    await expect(firstWindow.locator('[data-testid="editor-pane"]')).toBeVisible()

    // 3. Rebels
    console.log('[E2E] Navigating to Rebels')
    await firstWindow.click('[data-testid="nav-rebels"]')
    await expect(firstWindow.locator('[data-testid="rebels-root"]')).toBeVisible()

    // 4. Manual
    console.log('[E2E] Navigating to Manual')
    await firstWindow.click('[data-testid="nav-manual"]')
    await expect(firstWindow.locator('[data-testid="manual-root"]')).toBeVisible()

    // 5. Playground
    console.log('[E2E] Navigating to Playground')
    await firstWindow.click('[data-testid="nav-playground"]')
    await expect(firstWindow.locator('[data-testid="playground-view"]')).toBeVisible()

    // 6. Settings
    console.log('[E2E] Navigating to Settings')
    await firstWindow.click('[data-testid="nav-settings"]')
    await expect(firstWindow.locator('[data-testid="settings-root"]')).toBeVisible()

    // 7. Back to Dashboard
    console.log('[E2E] Returning to Dashboard')
    await firstWindow.click('[data-testid="nav-dashboard"]')
    await expect(firstWindow.locator('[data-testid="dashboard-root"]')).toBeVisible()
  })
})
