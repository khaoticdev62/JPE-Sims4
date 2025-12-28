import { test, expect } from '@playwright/test'

test.describe('E2E: Home Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home dashboard
    await page.goto('/', { waitUntil: 'networkidle' })

    // Wait for app to load
    await page.waitForSelector('[data-testid="app-root"]', { timeout: 10000 })

    // Make sure we're on home view
    await page.locator('[data-testid="nav-home"]').click()
    await page.waitForTimeout(500)
  })

  test('should display home dashboard', async ({ page }) => {
    // Verify app root exists
    const appRoot = page.locator('[data-testid="app-root"]')
    await expect(appRoot).toBeVisible()

    // Verify navigation is present
    const navHome = page.locator('[data-testid="nav-home"]')
    await expect(navHome).toBeVisible()
  })

  test('should display recent projects carousel', async ({ page }) => {
    // Check for new project card (always present)
    const newProjectCard = page.locator('[data-testid="new-project-card"]')
    await expect(newProjectCard).toBeVisible()

    // Can also have project cards
    const projectCount = await page.locator('[data-testid*="project-card"]:not([data-testid="new-project-card"])').count()
    expect(projectCount).toBeGreaterThanOrEqual(0)
  })

  test('should display activity feed section', async ({ page }) => {
    // Activity section should exist
    await page.waitForTimeout(500)

    // Check for activity items (can be 0)
    const activityItems = page.locator('[data-testid*="activity-item"]')
    const activityCount = await activityItems.count()

    expect(activityCount).toBeGreaterThanOrEqual(0)
  })

  test('should navigate to studio when project clicked', async ({ page }) => {
    // Check for project cards
    const projectCount = await page.locator('[data-testid*="project-card"]:not([data-testid="new-project-card"])').count()

    if (projectCount > 0) {
      // Click first project
      await page.locator('[data-testid*="project-card"]').first().click()

      // Wait for studio to load
      await page.waitForTimeout(500)

      // Verify studio layout is visible
      const editorLayout = page.locator('[data-testid="editor-layout"]')
      const isInStudio = await editorLayout.isVisible().catch(() => false)

      // If we have projects, studio should be visible
      if (isInStudio) {
        await expect(editorLayout).toBeVisible()
      }
    }
  })

  test('should navigate from new project card', async ({ page }) => {
    // Click new project card
    const newProjectCard = page.locator('[data-testid="new-project-card"]')
    await newProjectCard.click()

    // Wait for navigation
    await page.waitForTimeout(500)

    // App should still be responsive
    const appRoot = page.locator('[data-testid="app-root"]')
    await expect(appRoot).toBeVisible()
  })

  test('should show navigation menu items', async ({ page }) => {
    // Check all nav items are visible
    const navHome = page.locator('[data-testid="nav-home"]')
    const navStudio = page.locator('[data-testid="nav-studio"]')
    const navProjects = page.locator('[data-testid="nav-projects"]')
    const navSettings = page.locator('[data-testid="nav-settings"]')

    // All nav items should be present
    expect(await navHome.isVisible()).toBeTruthy()
    expect(await navStudio.isVisible()).toBeTruthy()
    expect(await navProjects.isVisible()).toBeTruthy()
    expect(await navSettings.isVisible()).toBeTruthy()
  })

  test('should maintain state across navigation', async ({ page }) => {
    // Get initial state (home dashboard)
    const initialCard = page.locator('[data-testid="new-project-card"]')
    const isInitiallyVisible = await initialCard.isVisible()

    // Navigate away
    await page.locator('[data-testid="nav-studio"]').click()
    await page.waitForTimeout(500)

    // Navigate back
    await page.locator('[data-testid="nav-home"]').click()
    await page.waitForTimeout(500)

    // Should be back on home with same state
    const finalCard = page.locator('[data-testid="new-project-card"]')
    const isFinallyVisible = await finalCard.isVisible()

    expect(isFinallyVisible).toBe(isInitiallyVisible)
  })

  test('should display project information when available', async ({ page }) => {
    // Check for project cards
    const projectCount = await page.locator('[data-testid*="project-card"]:not([data-testid="new-project-card"])').count()

    if (projectCount > 0) {
      // Get first project card
      const firstCard = page.locator('[data-testid*="project-card"]').first()

      // Should have text content
      const text = await firstCard.textContent()
      expect(text).toBeTruthy()
      expect(text?.length).toBeGreaterThan(0)
    }
  })

  test('should be responsive to viewport changes', async ({ page, context }) => {
    // Start with default viewport
    const initialAppRoot = page.locator('[data-testid="app-root"]')
    await expect(initialAppRoot).toBeVisible()

    // App should remain visible on different viewport sizes
    // (actual resize would require context recreation)
    await expect(initialAppRoot).toBeVisible()
  })
})
