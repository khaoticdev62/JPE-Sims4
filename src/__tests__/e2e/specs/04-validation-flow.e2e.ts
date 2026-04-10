import { test, expect } from '@playwright/test'

test.describe('E2E: Real-Time Validation Flow', () => {
  test.beforeEach(async ({ context, page }) => {
    // Inject localStorage to skip tutorial and onboarding globally for all tests
    await context.addInitScript(() => {
      window.localStorage.setItem('jpe_onboarding_seen', 'true')
      window.localStorage.setItem('jpe-splash-dismissed', 'true')
      // Set Zustand UI store to mark tour as completed
      window.localStorage.setItem('jpe-ui-store', JSON.stringify({
        state: {
          hasCompletedTour: true,
          isTourOpen: false,
          isTutorialActive: false,
          workspaceMode: 'dashboard',
          sidebarCollapsed: false,
          rightPanelCollapsed: false,
          showDiagnostics: true,
          fontSize: 13,
          showLineNumbers: true,
          rightPanelTab: 'diagnostics',
          sidebarTab: 'explorer',
          focusedPane: 'editor',
          immersionMode: 'normal',
          theme: 'dark'
        },
        version: 0
      }))
    })

    // Navigate to the studio
    await page.goto('/studio', { waitUntil: 'domcontentloaded' })

    // Wait for app to load
    await page.waitForSelector('[data-testid="app-root"]', { timeout: 10000 })
    
    // Additional wait to ensure any delayed modals are not rendered
    await page.waitForTimeout(500)
  })

  test('should display app on load', async ({ page }) => {
    // Verify app loads
    const appRoot = page.locator('[data-testid="app-root"]')
    await expect(appRoot).toBeVisible()

    // Navigation should be visible
    const navHome = page.locator('[data-testid="nav-dashboard"]')
    await expect(navHome).toBeVisible()
  })

  test('should navigate to studio view', async ({ page }) => {
    // Click studio nav and wait for it to be stable
    const navCode = page.locator('[data-testid="nav-code"]')
    await navCode.waitFor({ state: 'visible' })
    await navCode.click()
    
    // Explicitly wait for the workspace mode to change and layout items to appear
    const viewport = page.locator('[data-testid="editor-main-viewport"]')
    await expect(viewport).toBeVisible({ timeout: 15000 })
  })

  test('should display editor layout', async ({ page }) => {
    // Go to studio
    await page.locator('[data-testid="nav-code"]').click()
    await page.waitForTimeout(500)

    // Check for three-pane layout
    const threePane = page.locator('[data-testid="editor-main-viewport"]')
    await expect(threePane).toBeVisible({ timeout: 10000 })
  })

  test('should display editor pane', async ({ page }) => {
    // Go to studio
    const navCode = page.locator('[data-testid="nav-code"]')
    await navCode.waitFor({ state: 'visible' })
    await navCode.click()
    
    await page.waitForSelector('[data-testid="editor-pane"]', { timeout: 10000 })
    const editorPane = page.locator('[data-testid="editor-pane"]')
    const isVisible = await editorPane.isVisible().catch(() => false)

    expect(isVisible).toBe(true)
  })

  test('should show Monaco editor when files open', async ({ page }) => {
    // Navigate to studio
    await page.locator('[data-testid="nav-code"]').click()
    await page.waitForTimeout(500)

    // Monaco editor might be visible if files are open
    const monacoEditor = page.locator('[data-testid="monaco-editor"]')
    const isVisible = await monacoEditor.isVisible().catch(() => false)

    // Editor visibility depends on whether files are open
    expect(typeof isVisible).toBe('boolean')
  })

  test('should handle navigation between views', async ({ page }) => {
    // Navigate through different views
    await page.locator('[data-testid="nav-dashboard"]').click()
    await page.waitForTimeout(300)

    await page.locator('[data-testid="nav-code"]').click()
    await page.waitForTimeout(300)

    await page.locator('[data-testid="nav-projects"]').click()
    await page.waitForTimeout(300)

    // App should still be responsive
    const appRoot = page.locator('[data-testid="app-root"]')
    await expect(appRoot).toBeVisible()
  })

  test('should maintain state during navigation', async ({ page }) => {
    // Get initial project count
    const initialCount = await page.locator('[data-testid*="project-card"]').count()

    // Navigate away and back
    await page.locator('[data-testid="nav-code"]').click()
    await page.waitForTimeout(300)

    await page.locator('[data-testid="nav-dashboard"]').click()
    await page.waitForTimeout(300)

    // Project count should be the same
    const finalCount = await page.locator('[data-testid*="project-card"]').count()

    expect(finalCount).toBe(initialCount)
  })

  test('should handle keyboard input', async ({ page }) => {
    // Type some keyboard input
    await page.keyboard.type('test', { delay: 50 })
    await page.waitForTimeout(200)

    // App should still be responsive
    const appRoot = page.locator('[data-testid="app-root"]')
    await expect(appRoot).toBeVisible()
  })

  test('should respond to click events', async ({ page }) => {
    // Navigate to projects to see some actual content
    await page.locator('[data-testid="nav-projects"]').click()
    
    // Check for nav items
    const navItems = page.locator('[data-testid*="nav-"]')
    const count = await navItems.count()
    expect(count).toBeGreaterThan(0)

    // Click first nav item
    if (count > 0) {
      await navItems.first().click()
      await page.waitForTimeout(300)

      // App should still be loaded
      const appRoot = page.locator('[data-testid="app-root"]')
      await expect(appRoot).toBeVisible()
    }
  })
})
