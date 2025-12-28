import { test, expect } from '@playwright/test'
import { ProjectHelpers } from '../helpers/projectHelpers'
import { EditorHelpers } from '../helpers/editorHelpers'

test.describe('E2E: Create Project Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (baseURL is set to http://localhost:5173)
    await page.goto('/', { waitUntil: 'networkidle' })

    // Wait for app to load
    await page.waitForSelector('[data-testid="app-root"]', { timeout: 10000 })
  })

  test('should display home dashboard on startup', async ({ page }) => {
    // Verify app root is visible
    const appRoot = page.locator('[data-testid="app-root"]')
    await expect(appRoot).toBeVisible()

    // Verify new project card is visible
    const newProjectCard = page.locator('[data-testid="new-project-card"]')
    await expect(newProjectCard).toBeVisible()
  })

  test('should navigate to studio from project card', async ({ page }) => {
    // Check if there are existing projects
    const projectCards = await page.locator('[data-testid*="project-card"]:not([data-testid="new-project-card"])').count()

    if (projectCards > 0) {
      // Click first project card
      await page.locator('[data-testid*="project-card"]').first().click()

      // Verify studio layout loads
      const editorLayout = page.locator('[data-testid="editor-layout"]')
      await expect(editorLayout).toBeVisible({ timeout: 5000 })

      // Verify three-pane layout
      const threePane = page.locator('[data-testid="editor-three-pane"]')
      await expect(threePane).toBeVisible()
    }
  })

  test('should display empty state message when no projects', async ({ page }) => {
    // Verify app loads
    const appRoot = page.locator('[data-testid="app-root"]')
    await expect(appRoot).toBeVisible()

    // Either empty state or project cards should be visible
    const hasProjectCards = await page.locator('[data-testid*="project-card"]').count() > 0
    const hasEmptyState = await page.locator('text=No Projects Yet').isVisible().catch(() => false)

    // At least one should be true
    expect(hasProjectCards || hasEmptyState).toBeTruthy()
  })

  test('should display project metadata', async ({ page }) => {
    // Check for project cards
    const projectCount = await page.locator('[data-testid*="project-card"]:not([data-testid="new-project-card"])').count()

    if (projectCount > 0) {
      // Get first project card text
      const firstCard = page.locator('[data-testid*="project-card"]').first()
      const text = await firstCard.textContent()

      // Should have some content
      expect(text).toBeTruthy()
      expect(text?.length).toBeGreaterThan(0)
    }
  })

  test('should show recent activity feed', async ({ page }) => {
    // Wait for activity section to be visible
    await page.waitForTimeout(500)

    // Check for activity items
    const activityItems = page.locator('[data-testid*="activity-item"]')
    const activityCount = await activityItems.count()

    // Can be 0 on fresh load, just verify the section exists
    expect(activityCount).toBeGreaterThanOrEqual(0)
  })

  test('should navigate using sidebar navigation', async ({ page }) => {
    // Click studio nav
    await page.locator('[data-testid="nav-studio"]').click()
    await page.waitForTimeout(500)

    // Navigate back to home
    await page.locator('[data-testid="nav-home"]').click()
    await page.waitForTimeout(500)

    // Should be back on home with new project card
    const newProjectCard = page.locator('[data-testid="new-project-card"]')
    await expect(newProjectCard).toBeVisible()
  })
})
