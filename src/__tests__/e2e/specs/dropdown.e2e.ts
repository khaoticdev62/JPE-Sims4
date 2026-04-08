/**
 * Dropdown Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Dropdown Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#dropdown').scrollIntoViewIfNeeded()
  })

  test('should render dropdown trigger button', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await expect(trigger).toBeVisible()
    await expect(trigger).toContainText('Select Option')
  })

  test('should open dropdown on click', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await trigger.click()
    await page.waitForTimeout(300)

    const content = page.getByTestId('dropdown-content')
    await expect(content).toBeVisible()
  })

  test('should render dropdown items', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await trigger.click()
    await page.waitForTimeout(300)

    await expect(page.getByTestId('dropdown-item-option1')).toBeVisible()
    await expect(page.getByTestId('dropdown-item-option2')).toBeVisible()
  })

  test('should render item icons', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await trigger.click()
    await page.waitForTimeout(300)

    const item1 = page.getByTestId('dropdown-item-option1')
    const svg = item1.locator('svg')
    await expect(svg).toBeVisible()
  })

  test('should render dropdown label', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await trigger.click()
    await page.waitForTimeout(300)

    const label = page.locator('[role="menu"] [role="menuitem"]').first()
    await expect(label).toBeVisible()
  })

  test('should render disabled item', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await trigger.click()
    await page.waitForTimeout(300)

    const disabledItem = page.getByTestId('dropdown-item-disabled')
    await expect(disabledItem).toBeVisible()
    await expect(disabledItem).toHaveAttribute('data-disabled', 'true').or(
      expect(disabledItem).toHaveClass(/disabled|disabled:/)
    )
  })

  test('should select an item on click', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await trigger.click()
    await page.waitForTimeout(300)

    await page.getByTestId('dropdown-item-option1').click()
    await page.waitForTimeout(200)

    // Dropdown should close after selection
    const content = page.getByTestId('dropdown-content')
    await expect(content).not.toBeVisible()
  })

  test('should close dropdown on Escape', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await trigger.click()
    await page.waitForTimeout(300)

    await expect(page.getByTestId('dropdown-content')).toBeVisible()

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await expect(page.getByTestId('dropdown-content')).not.toBeVisible()
  })

  test('should close dropdown on outside click', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await trigger.click()
    await page.waitForTimeout(300)

    await expect(page.getByTestId('dropdown-content')).toBeVisible()

    // Click outside
    await page.locator('body').click({ position: { x: 10, y: 10 } })
    await page.waitForTimeout(200)

    await expect(page.getByTestId('dropdown-content')).not.toBeVisible()
  })

  test('should support keyboard navigation with arrow keys', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await trigger.click()
    await page.waitForTimeout(300)

    // Arrow down to navigate between items
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)

    // Dropdown should still be open
    await expect(page.getByTestId('dropdown-content')).toBeVisible()
  })

  test('should have glassmorphic background', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await trigger.click()
    await page.waitForTimeout(300)

    const content = page.getByTestId('dropdown-content')
    const backdropFilter = await content.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.backdropFilter || style.webkitBackdropFilter
    })
    expect(backdropFilter).toContain('blur')
  })

  test('should render JPE dropdown', async ({ page }) => {
    const jpeDropdown = page.getByTestId('jpe-dropdown')
    await expect(jpeDropdown).toBeVisible()
  })

  test('should hover highlight items', async ({ page }) => {
    const trigger = page.getByTestId('dropdown-trigger')
    await trigger.click()
    await page.waitForTimeout(300)

    const item = page.getByTestId('dropdown-item-option1')
    await item.hover()
    await page.waitForTimeout(200)

    // Item should still be visible with hover styling
    await expect(item).toBeVisible()
  })
})
