import { test, expect } from '@playwright/test'

test.describe('E2E: JPE Playground Full-Screen Verification', () => {
  test.beforeEach(async ({ context, page }) => {
    // 1. Programmatically dismiss onboarding tour via localStorage
    await context.addInitScript(() => {
      window.localStorage.setItem('jpe_onboarding_seen', 'true')
      window.localStorage.setItem('jpe-splash-dismissed', 'true')
      window.localStorage.setItem('jpe-ui-store', JSON.stringify({
        state: { hasCompletedTour: true }
      }))
    })

    // 2. Navigate to the studio
    await page.goto('/studio', { waitUntil: 'domcontentloaded' })

    // 3. Wait for app to load
    await page.waitForSelector('[data-testid="app-root"]', { timeout: 15000 })
    
    // 4. Navigate to Playground mode via the side navigation
    await page.locator('[data-testid="nav-playground"]').click()
    
    await expect(page.locator('[data-testid="playground-view"]')).toBeVisible({ timeout: 15000 })
  })

  test('should hide global title bar and navigation in playground mode', async ({ page }) => {
    // Verify that the global TitleBar is NOT visible
    // The TitleSection is hidden in playground mode
    const titleSection = page.locator('div:has(> [data-testid="title-bar-logo"])').first()
    if (await titleSection.count() > 0) {
      await expect(titleSection).toBeHidden()
    }

    // Verify that AppNavigation is NOT visible
    const appNav = page.locator('[data-testid="app-navigation"]')
    await expect(appNav).toBeHidden()
  })

  test('should fill the entire viewport without internal padding', async ({ page }) => {
    // Check playground container padding - Spectral PlaygroundView uses p-0
    const playgroundView = page.locator('[data-testid="playground-view"]')
    const padding = await playgroundView.evaluate((el) => window.getComputedStyle(el).padding)
    // p-0 means 0px or similar
    expect(padding === '0px' || padding === '0px 0px 0px 0px').toBeTruthy()
  })

  test('should navigate back to dashboard via the Return button', async ({ page }) => {
    const backButton = page.locator('button[title="Return to Dashboard"]')
    await expect(backButton).toBeVisible()
    
    await backButton.click()
    
    // Should see the Home Dashboard again
    await expect(page.locator('[data-testid="dashboard-root"]')).toBeVisible({ timeout: 10000 })
    
    // Global AppNavigation should return
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible()
  })
})
