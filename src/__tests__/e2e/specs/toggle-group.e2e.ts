/**
 * Toggle Group Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Toggle Group Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#toggle-group').scrollIntoViewIfNeeded()
  })

  test('should render single selection toggle group', async ({ page }) => {
    const group = page.getByTestId('toggle-group-single')
    await expect(group).toBeVisible()
  })

  test('should render multiple selection toggle group', async ({ page }) => {
    const group = page.getByTestId('toggle-group-multiple')
    await expect(group).toBeVisible()
  })

  test('should render toggle items', async ({ page }) => {
    await expect(page.getByTestId('toggle-bold')).toBeVisible()
    await expect(page.getByTestId('toggle-italic')).toBeVisible()
    await expect(page.getByTestId('toggle-underline')).toBeVisible()
  })

  test('should have bold pressed by default in single group', async ({ page }) => {
    await expect(page.getByTestId('toggle-bold')).toHaveAttribute('aria-pressed', 'true')
  })

  test('should toggle single selection', async ({ page }) => {
    await page.getByTestId('toggle-italic').click()
    await page.waitForTimeout(100)

    await expect(page.getByTestId('toggle-italic')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('toggle-bold')).toHaveAttribute('aria-pressed', 'false')
  })

  test('should have multiple items pressed in multiple group', async ({ page }) => {
    await expect(page.getByTestId('toggle-multi-bold')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('toggle-multi-italic')).toHaveAttribute('aria-pressed', 'true')
  })

  test('should toggle multiple selections independently', async ({ page }) => {
    await page.getByTestId('toggle-multi-underline').click()
    await page.waitForTimeout(100)

    await expect(page.getByTestId('toggle-multi-underline')).toHaveAttribute('aria-pressed', 'true')
    // Bold should still be pressed
    await expect(page.getByTestId('toggle-multi-bold')).toHaveAttribute('aria-pressed', 'true')
  })

  test('should deselect in single type', async ({ page }) => {
    await page.getByTestId('toggle-bold').click()
    await page.waitForTimeout(100)

    await expect(page.getByTestId('toggle-bold')).toHaveAttribute('aria-pressed', 'false')
  })

  test('should render icons in toggles', async ({ page }) => {
    const bold = page.getByTestId('toggle-bold')
    const icon = bold.locator('svg').first()
    await expect(icon).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.getByTestId('toggle-bold').focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)

    const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    expect(focused).toBe('Italic')
  })
})
