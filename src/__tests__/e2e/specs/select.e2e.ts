/**
 * Select Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Select Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#select').scrollIntoViewIfNeeded()
  })

  test('should render select trigger', async ({ page }) => {
    const trigger = page.getByTestId('select-trigger')
    await expect(trigger).toBeVisible()
  })

  test('should render placeholder value', async ({ page }) => {
    const value = page.getByTestId('select-value')
    await expect(value).toContainText('Select a framework...')
  })

  test('should open dropdown on click', async ({ page }) => {
    await page.getByTestId('select-trigger').click()
    await page.waitForTimeout(300)

    const content = page.getByTestId('select-content')
    await expect(content).toBeVisible()
  })

  test('should render select items', async ({ page }) => {
    await page.getByTestId('select-trigger').click()
    await page.waitForTimeout(300)

    await expect(page.getByTestId('select-item-react')).toBeVisible()
    await expect(page.getByTestId('select-item-vue')).toBeVisible()
    await expect(page.getByTestId('select-item-angular')).toBeVisible()
  })

  test('should render disabled item', async ({ page }) => {
    await page.getByTestId('select-trigger').click()
    await page.waitForTimeout(300)

    const disabledItem = page.getByTestId('select-item-svelte')
    await expect(disabledItem).toBeVisible()
    await expect(disabledItem).toHaveAttribute('data-disabled', 'true').or(
      expect(disabledItem).toHaveClass(/disabled/)
    )
  })

  test('should select an item', async ({ page }) => {
    await page.getByTestId('select-trigger').click()
    await page.waitForTimeout(300)

    await page.getByTestId('select-item-react').click()
    await page.waitForTimeout(200)

    // Content should close
    await expect(page.getByTestId('select-content')).not.toBeVisible()
    // Value should update
    await expect(page.getByTestId('select-value')).toContainText('React')
  })

  test('should close on Escape', async ({ page }) => {
    await page.getByTestId('select-trigger').click()
    await page.waitForTimeout(300)

    await expect(page.getByTestId('select-content')).toBeVisible()

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await expect(page.getByTestId('select-content')).not.toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.getByTestId('select-trigger').click()
    await page.waitForTimeout(300)

    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)

    // Dropdown should still be open
    await expect(page.getByTestId('select-content')).toBeVisible()
  })

  test('should close on outside click', async ({ page }) => {
    await page.getByTestId('select-trigger').click()
    await page.waitForTimeout(300)

    await page.locator('body').click({ position: { x: 10, y: 10 } })
    await page.waitForTimeout(200)

    await expect(page.getByTestId('select-content')).not.toBeVisible()
  })

  test('should have glassmorphic content', async ({ page }) => {
    await page.getByTestId('select-trigger').click()
    await page.waitForTimeout(300)

    const content = page.getByTestId('select-content')
    const backdropFilter = await content.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.backdropFilter || style.webkitBackdropFilter
    })
    expect(backdropFilter).toContain('blur')
  })
})
