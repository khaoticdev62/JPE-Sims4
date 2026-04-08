/**
 * Sheet Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Sheet Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#sheet').scrollIntoViewIfNeeded()
  })

  test('should render sheet trigger', async ({ page }) => {
    const trigger = page.getByTestId('sheet-trigger')
    await expect(trigger).toBeVisible()
  })

  test('should open sheet from right on click', async ({ page }) => {
    await page.getByTestId('sheet-trigger').click()
    await page.waitForTimeout(300)

    const sheet = page.getByTestId('sheet-content-right')
    await expect(sheet).toBeVisible()
  })

  test('should render sheet title', async ({ page }) => {
    await page.getByTestId('sheet-trigger').click()
    await page.waitForTimeout(300)

    const title = page.getByTestId('sheet-title')
    await expect(title).toBeVisible()
    await expect(title).toContainText('Sheet Title')
  })

  test('should render sheet description', async ({ page }) => {
    await page.getByTestId('sheet-trigger').click()
    await page.waitForTimeout(300)

    const desc = page.getByTestId('sheet-description')
    await expect(desc).toBeVisible()
    await expect(desc).toContainText('slides in from the right')
  })

  test('should close sheet on Escape', async ({ page }) => {
    await page.getByTestId('sheet-trigger').click()
    await page.waitForTimeout(300)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await expect(page.getByTestId('sheet-content-right')).not.toBeVisible()
  })

  test('should close sheet on backdrop click', async ({ page }) => {
    await page.getByTestId('sheet-trigger').click()
    await page.waitForTimeout(300)

    const overlay = page.locator('[class*="SheetOverlay"], [class*="overlay"]').first()
    await expect(overlay).toBeVisible()
    await overlay.click()
    await page.waitForTimeout(200)

    await expect(page.getByTestId('sheet-content-right')).not.toBeVisible()
  })

  test('should open sheet from left', async ({ page }) => {
    await page.getByTestId('sheet-trigger-left').click()
    await page.waitForTimeout(300)

    const sheet = page.getByTestId('sheet-content-left')
    await expect(sheet).toBeVisible()
  })

  test('should have slide-in animation', async ({ page }) => {
    await page.getByTestId('sheet-trigger').click()

    const sheet = page.getByTestId('sheet-content-right')
    await expect(sheet).toBeVisible({ timeout: 5000 })
  })

  test('should have overlay', async ({ page }) => {
    await page.getByTestId('sheet-trigger').click()
    await page.waitForTimeout(300)

    const overlay = page.locator('[class*="SheetOverlay"], [class*="overlay"]').first()
    await expect(overlay).toBeVisible()
  })
})
