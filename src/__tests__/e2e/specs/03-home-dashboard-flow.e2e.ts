import { test, expect } from '@playwright/test'

test.describe('E2E: Home Dashboard Flow', () => {
  // This suite can now run against the standard dev server

  test.beforeEach(async ({ context, page }) => {
    // 1. Programmatically dismiss onboarding tour and splash via multiple methods
    await context.addInitScript(() => {
      // Direct local storage bypass
      window.localStorage.setItem('jpe_onboarding_seen', 'true')
      window.localStorage.setItem('jpe-onboarding-completed', 'true')
      window.localStorage.setItem('jpe-splash-dismissed', 'true')
      window.localStorage.setItem('jpe-ui-store', JSON.stringify({
        state: { hasCompletedTour: true, isTourOpen: false }
      }))
      
      // Override the sessionStorage used by useUIStore's persistence
      window.sessionStorage.setItem('jpe-ui-store', JSON.stringify({
        state: { hasCompletedTour: true, isTourOpen: false }
      }))
    })

    // 2. Navigate to the studio
    await page.goto('/studio', { waitUntil: 'networkidle' })

    // 3. Robust wait for app-root
    await page.waitForSelector('[data-testid="app-root"]', { state: 'visible', timeout: 30000 })
    
    // Ensure navigation is ready
    await page.waitForSelector('[data-testid="app-navigation"]', { state: 'visible', timeout: 15000 })
    
    // 4. Specifically wait for any high-z-index overlays (like OnboardingTour) to be removed
    // We check for any fixed inset-0 element with high z-index
    try {
      const overlay = page.locator('div.fixed.inset-0.z-\\[9999\\]')
      if (await overlay.isVisible()) {
        // Try skipping if visible
        const skipBtn = overlay.locator('button[title="Skip tutorial"]')
        if (await skipBtn.isVisible()) {
          await skipBtn.click()
        }
        await overlay.waitFor({ state: 'hidden', timeout: 5000 })
      }
    } catch (_e) {
      console.log('No overlay found or already hidden')
    }

    // Also handle splash screen if it's still there
    try {
      const splash = page.locator('div.fixed.inset-0.z-\\[9000\\]')
      if (await splash.isVisible()) {
        await splash.click() // Dismiss by click
        await splash.waitFor({ state: 'hidden', timeout: 5000 })
      }
    } catch (_e) {
      console.log('No splash found or already hidden')
    }
  })

  test('should display home dashboard summary and cards', async ({ page }) => {
    // 1. Verify app root
    await expect(page.locator('[data-testid="app-root"]')).toBeVisible()
    
    // Check if we are in Dashboard mode
    // If we are in Manual or Rebels mode, the sidebar is hidden. 
    const returnBtn = page.locator('[data-testid="return-to-dashboard"]')
    if (await returnBtn.isVisible()) {
      await returnBtn.click()
    }

    // Now check for navigation sidebar
    await page.waitForSelector('[data-testid="app-navigation"]', { state: 'visible', timeout: 15000 })
    
    // Explicitly click Dashboard to be sure
    const navDashboard = page.locator('[data-testid="nav-dashboard"]')
    await expect(navDashboard).toBeVisible()
    await navDashboard.click()

    // 2. Verify dashboard root and quick actions
    await expect(page.locator('[data-testid="dashboard-root"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="quick-action-code"]')).toBeVisible()

    // 3. Verify stats grid is present
    await expect(page.locator('[data-testid="stats-grid"]')).toBeVisible()
  })

  test('should navigate between main views', async ({ page }) => {
    // Ensure we are on dashboard
    const returnBtn = page.locator('[data-testid="return-to-dashboard"]')
    if (await returnBtn.isVisible()) {
      await returnBtn.click()
    }
    
    await page.locator('[data-testid="nav-dashboard"]').click()
    await expect(page.locator('[data-testid="dashboard-root"]')).toBeVisible()

    // 1. Navigate to Projects
    await page.locator('[data-testid="nav-projects"]').click()
    await expect(page.locator('[data-testid="projects-root"]')).toBeVisible()

    // 2. Navigate to Settings
    await page.locator('[data-testid="nav-settings"]').click()
    await expect(page.locator('[data-testid="app-root"]')).toBeVisible()

    // 3. Return Home
    const navDashboard = page.locator('[data-testid="nav-dashboard"]')
    if (await navDashboard.isVisible()) {
      await navDashboard.click()
    } else {
       await page.goto('/studio', { waitUntil: 'domcontentloaded' })
    }
    
    await expect(page.locator('[data-testid="dashboard-root"]')).toBeVisible()
  })

  test('should handle dashboard responsiveness', async ({ page }) => {
    // Ensure we start from dashboard
    const returnBtn = page.locator('[data-testid="return-to-dashboard"]')
    if (await returnBtn.isVisible()) {
      await returnBtn.click()
    }
    
    await page.locator('[data-testid="nav-dashboard"]').click()
    await expect(page.locator('[data-testid="dashboard-root"]')).toBeVisible()

    // Test tablet/mobile viewports
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(1000)
    await expect(page.locator('[data-testid="app-root"]')).toBeVisible()

    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    await expect(page.locator('[data-testid="app-root"]')).toBeVisible()
  })
})
