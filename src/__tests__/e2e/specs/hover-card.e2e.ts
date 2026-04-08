/**
 * Hover Card Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Hover Card Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#hover-card').scrollIntoViewIfNeeded()
  })

  test('should render hover card trigger', async ({ page }) => {
    const trigger = page.getByTestId('hover-card-trigger')
    await expect(trigger).toBeVisible()
  })

  test('should show hover card on hover', async ({ page }) => {
    const trigger = page.getByTestId('hover-card-trigger')
    await trigger.hover()
    await page.waitForTimeout(700)

    const content = page.getByTestId('hover-card-content')
    await expect(content).toBeVisible()
  })

  test('should hide hover card on mouse leave', async ({ page }) => {
    const trigger = page.getByTestId('hover-card-trigger')
    await trigger.hover()
    await page.waitForTimeout(700)

    await expect(page.getByTestId('hover-card-content')).toBeVisible()

    await page.mouse.move(0, 0)
    await page.waitForTimeout(300)

    await expect(page.getByTestId('hover-card-content')).not.toBeVisible()
  })

  test('should render hover card content', async ({ page }) => {
    const trigger = page.getByTestId('hover-card-trigger')
    await trigger.hover()
    await page.waitForTimeout(700)

    const content = page.getByTestId('hover-card-content')
    await expect(content).toContainText('JPE Studio')
    await expect(content).toContainText('Cyberpunk-themed')
  })

  test('should have delay before showing', async ({ page }) => {
    const trigger = page.getByTestId('hover-card-trigger')
    await trigger.hover()
    await page.waitForTimeout(200)

    // May not be visible yet due to delay
    const content = page.getByTestId('hover-card-content')
    await page.waitForTimeout(600)
    await expect(content).toBeVisible()
  })
})
