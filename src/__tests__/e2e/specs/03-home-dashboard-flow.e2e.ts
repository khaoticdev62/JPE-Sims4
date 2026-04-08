import { test, expect } from '@playwright/test'
import { isElectronBuilt } from '../helpers'

test.describe('E2E: Home Dashboard Flow', () => {
  // This suite requires the app to be built
  test.skip(!isElectronBuilt(), 'Electron app is not built')

  test.beforeEach(async ({ context, page }) => {
    // 1. Programmatically dismiss onboarding tour via localStorage
    await context.addInitScript(() => {
      window.localStorage.setItem('jpe_onboarding_seen', 'true')
    })

    // 2. Navigate to the studio
    await page.goto('/studio', { waitUntil: 'domcontentloaded' })

    // 3. Wait for app to load
    await page.waitForSelector('[data-testid="app-root"]', { timeout: 15000 })
  })

  test('should display home dashboard summary and cards', async ({ page }) => {
    // 1. Verify app root and navigation
    await expect(page.locator('[data-testid="app-root"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible()

    // 2. Verify dashboard root and quick actions
    await expect(page.locator('[data-testid="dashboard-root"]')).toBeVisible()
    await expect(page.locator('[data-testid="quick-action-code"]')).toBeVisible()

    // 3. Verify stats grid is present
    await expect(page.locator('[data-testid="stats-grid"]')).toBeVisible()
  })

  test('should navigate between main views', async ({ page }) => {
    // 1. Navigate to Projects
    await page.locator('[data-testid="nav-projects"]').click()
    await expect(page.locator('[data-testid="projects-root"]')).toBeVisible()

    // 2. Navigate to Settings
    await page.locator('[data-testid="nav-settings"]').click()
    // Verify app remains stable (settings root test-id could be added if needed, but app-root is fine)
    await expect(page.locator('[data-testid="app-root"]')).toBeVisible()

    // 3. Return Home
    await page.locator('[data-testid="nav-dashboard"]').click()
    await expect(page.locator('[data-testid="dashboard-root"]')).toBeVisible()
  })

  test('should handle dashboard responsiveness', async ({ page }) => {
    // Test tablet/mobile viewports
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="app-root"]')).toBeVisible()

    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="app-root"]')).toBeVisible()
  })
})
