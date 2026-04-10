import { test, expect } from '@playwright/test'
import { isElectronBuilt } from '../helpers'

test.describe('E2E: Create Project Flow', () => {
  // This suite requires the app to be built
  test.skip(!isElectronBuilt(), 'Electron app is not built')

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
  })

  test('should complete full project creation flow', async ({ page }) => {
    // 1. Navigate to Projects page
    await page.locator('[data-testid="nav-projects"]').click()
    await expect(page.locator('[data-testid="projects-root"]')).toBeVisible()

    // 2. Start project creation
    const createBtn = page.locator('[data-testid="create-new-project-btn"]')
    await expect(createBtn).toBeVisible()
    await createBtn.click()

    // 2. Fill in project details
    // Assuming the "Create Project" modal or page uses these IDs
    await page.fill('input[placeholder="Project Name"]', 'E2E Test Project')
    await page.fill('textarea[placeholder="Project Description"]', 'This project was created by an automated E2E test.')

    // 3. Create project
    // Update button locator to be more robust
    const submitBtn = page.getByRole('button', { name: /Initialize Project|Create Project/i })
    await submitBtn.click()

    // 4. Verify navigation to Studio/Editor
    // Spectral UI uses a different layout, verify the three-pane exists
    const editorLayout = page.locator('[data-testid="editor-main-viewport"]')
    await expect(editorLayout).toBeVisible({ timeout: 10000 })
    
    // 5. Verify project name in explorer or header
    await expect(page.locator('text=E2E Test Project').first()).toBeVisible()
  })
})
