import { test, expect } from '@playwright/test'

test.describe('E2E: JPE Playground Full-Screen Verification', () => {
  test.beforeEach(async ({ context, page }) => {
    // 1. Programmatically dismiss onboarding tour via localStorage
    await context.addInitScript(() => {
      window.localStorage.setItem('jpe_onboarding_seen', 'true')
    })

    // 2. Navigate to the studio
    await page.goto('/studio', { waitUntil: 'domcontentloaded' })

    // 3. Wait for app to load
    await page.waitForSelector('[data-testid="app-root"]', { timeout: 15000 })
    
    // 4. Navigate to Playground mode via Projects page first to ensure a project context exists if needed,
    // or just use the nav item if available
    const navPlayground = page.locator('[data-testid="nav-playground"]')
    if (await navPlayground.isVisible()) {
      await navPlayground.click()
    } else {
      // Navigate to playground via URL if nav is hidden or not yet available
      await page.goto('/studio', { waitUntil: 'networkidle' })
      // Trigger mode switch via UI if possible, but for this test we'll assume direct navigation works
      // or we click the "Playground" action on the dashboard if we add one.
      // Current Dashboard has "Open Editor" (mode: code).
      // Let's assume the nav item IS visible on the dashboard/studio root.
    }
    
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
    const backButton = page.locator('button:has-text("Back to Dashboard")')
    await expect(backButton).toBeVisible()
    
    await backButton.click()
    
    // Should see the Home Dashboard again
    await expect(page.locator('[data-testid="dashboard-root"]')).toBeVisible({ timeout: 10000 })
    
    // Global AppNavigation should return
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible()
  })
})
