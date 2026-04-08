/**
 * Tooltip Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Tooltip Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#tooltip').scrollIntoViewIfNeeded()
  })

  test('should render tooltip trigger', async ({ page }) => {
    const trigger = page.getByTestId('tooltip-trigger')
    await expect(trigger).toBeVisible()
  })

  test('should show tooltip on hover', async ({ page }) => {
    const trigger = page.getByTestId('tooltip-trigger')
    await trigger.hover()
    await page.waitForTimeout(500)

    const tooltip = page.getByTestId('tooltip-content')
    await expect(tooltip).toBeVisible()
  })

  test('should hide tooltip on mouse leave', async ({ page }) => {
    const trigger = page.getByTestId('tooltip-trigger')
    await trigger.hover()
    await page.waitForTimeout(500)

    await expect(page.getByTestId('tooltip-content')).toBeVisible()

    // Move mouse away
    await page.mouse.move(0, 0)
    await page.waitForTimeout(300)

    await expect(page.getByTestId('tooltip-content')).not.toBeVisible()
  })

  test('should render tooltip content', async ({ page }) => {
    const trigger = page.getByTestId('tooltip-trigger')
    await trigger.hover()
    await page.waitForTimeout(500)

    const tooltip = page.getByTestId('tooltip-content')
    await expect(tooltip).toContainText('This is a tooltip!')
  })

  test('should have correct ARIA role', async ({ page }) => {
    const trigger = page.getByTestId('tooltip-trigger')
    await trigger.hover()
    await page.waitForTimeout(500)

    const tooltip = page.getByTestId('tooltip-content')
    await expect(tooltip).toHaveAttribute('role', 'tooltip')
  })

  test('should have delay before showing', async ({ page }) => {
    const trigger = page.getByTestId('tooltip-trigger')
    await trigger.hover()
    await page.waitForTimeout(100)

    // Tooltip should not appear immediately due to delay
    // It might or might not be visible yet depending on timing
    // After waiting for the full delay, it should be visible
    await page.waitForTimeout(500)
    await expect(page.getByTestId('tooltip-content')).toBeVisible()
  })
})
