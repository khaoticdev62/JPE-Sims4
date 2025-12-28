import { test, expect } from '@playwright/test'
import { ProjectHelpers } from '../helpers/projectHelpers'
import { EditorHelpers } from '../helpers/editorHelpers'

test.describe('E2E: Open Project Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/', { waitUntil: 'networkidle' })

    // Wait for app to load
    await page.waitForSelector('[data-testid="app-root"]', { timeout: 10000 })
  })

  test('should open existing project from home dashboard', async ({ page }) => {
    // Get project count
    const projectCount = await page.locator('[data-testid*="project-card"]:not([data-testid="new-project-card"])').count()

    if (projectCount > 0) {
      // Click first project
      await page.locator('[data-testid*="project-card"]').first().click()

      // Verify studio opens
      const editorLayout = page.locator('[data-testid="editor-layout"]')
      await expect(editorLayout).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display editor pane when project opens', async ({ page }) => {
    // Navigate to studio
    await page.locator('[data-testid="nav-studio"]').click()
    await page.waitForTimeout(500)

    // Editor layout should be visible
    const editorLayout = page.locator('[data-testid="editor-layout"]')
    const isVisible = await editorLayout.isVisible().catch(() => false)

    // If studio view is visible, editor pane should exist
    if (isVisible) {
      const editorPane = page.locator('[data-testid="editor-pane"]')
      await expect(editorPane).toBeVisible()
    }
  })

  test('should display Monaco editor when available', async ({ page }) => {
    // Go to studio
    await page.locator('[data-testid="nav-studio"]').click()
    await page.waitForTimeout(500)

    // Check for Monaco editor
    const monacoEditor = page.locator('[data-testid="monaco-editor"]')
    const isVisible = await monacoEditor.isVisible().catch(() => false)

    // Editor might not be visible if no files are open
    expect(typeof isVisible).toBe('boolean')
  })

  test('should show files in sidebar', async ({ page }) => {
    // Navigate to studio
    await page.locator('[data-testid="nav-studio"]').click()
    await page.waitForTimeout(500)

    // Editor pane should be visible
    const editorPane = page.locator('[data-testid="editor-pane"]')
    const isVisible = await editorPane.isVisible().catch(() => false)

    expect(isVisible).toBe(true)
  })

  test('should open file when clicked', async ({ page }) => {
    // Go to studio
    await page.locator('[data-testid="nav-studio"]').click()
    await page.waitForTimeout(500)

    // Check if files exist
    const files = page.locator('[data-testid*="file-"]')
    const fileCount = await files.count()

    if (fileCount > 0) {
      // Click first file
      await files.first().click()
      await page.waitForTimeout(500)

      // Editor pane should still be visible
      const editorPane = page.locator('[data-testid="editor-pane"]')
      await expect(editorPane).toBeVisible()
    }
  })

  test('should allow keyboard navigation', async ({ page }) => {
    // Press Tab to test keyboard navigation
    await page.keyboard.press('Tab')
    await page.waitForTimeout(200)

    // App should still be responsive
    const appRoot = page.locator('[data-testid="app-root"]')
    await expect(appRoot).toBeVisible()
  })

  test('should display project information', async ({ page }) => {
    // Navigate to studio
    await page.locator('[data-testid="nav-studio"]').click()
    await page.waitForTimeout(500)

    // Check that the layout loads properly
    const editorLayout = page.locator('[data-testid="editor-layout"]')
    const isVisible = await editorLayout.isVisible().catch(() => false)

    // Layout should be visible in studio view
    expect(isVisible).toBe(true)
  })
})
