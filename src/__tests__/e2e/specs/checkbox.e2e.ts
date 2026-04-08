/**
 * Checkbox Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Checkbox Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#checkbox').scrollIntoViewIfNeeded()
  })

  test('should render checkbox', async ({ page }) => {
    const cb = page.getByTestId('checkbox-input')
    await expect(cb).toBeVisible()
  })

  test('should start unchecked', async ({ page }) => {
    const cb = page.getByTestId('checkbox-input')
    await expect(cb).not.toBeChecked()
  })

  test('should toggle on click', async ({ page }) => {
    const cb = page.getByTestId('checkbox-input')
    await cb.click()
    await page.waitForTimeout(100)
    await expect(cb).toBeChecked()
  })

  test('should toggle back off', async ({ page }) => {
    const cb = page.getByTestId('checkbox-input')
    await cb.click()
    await page.waitForTimeout(100)
    await expect(cb).toBeChecked()

    await cb.click()
    await page.waitForTimeout(100)
    await expect(cb).not.toBeChecked()
  })

  test('should render checkbox label', async ({ page }) => {
    const container = page.getByTestId('checkbox-default')
    await expect(container).toContainText('Accept terms')
  })

  test('should render disabled checkbox', async ({ page }) => {
    const cb = page.getByTestId('checkbox-disabled')
    const input = cb.locator('[type="checkbox"]').first()
    await expect(input).toBeDisabled()
  })

  test('should not toggle disabled checkbox', async ({ page }) => {
    const container = page.getByTestId('checkbox-disabled')
    const input = container.locator('[type="checkbox"]').first()
    await input.click({ force: true })
    await page.waitForTimeout(100)
    await expect(input).toBeDisabled()
  })

  test('should render indeterminate checkbox', async ({ page }) => {
    const container = page.getByTestId('checkbox-indeterminate')
    const input = container.locator('[type="checkbox"]').first()
    // Indeterminate state
    const isIndeterminate = await input.evaluate((el) => (el as HTMLInputElement).indeterminate)
    expect(isIndeterminate).toBe(true)
  })

  test('should support keyboard toggle', async ({ page }) => {
    const cb = page.getByTestId('checkbox-input')
    await cb.focus()
    await page.keyboard.press('Space')
    await page.waitForTimeout(100)
    await expect(cb).toBeChecked()
  })

  test('should support Enter key toggle', async ({ page }) => {
    const cb = page.getByTestId('checkbox-input')
    await cb.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)
    await expect(cb).toBeChecked()
  })

  test('should have correct role', async ({ page }) => {
    const cb = page.getByTestId('checkbox-input')
    await expect(cb).toHaveAttribute('type', 'checkbox')
  })

  test('should render with check icon when checked', async ({ page }) => {
    const cb = page.getByTestId('checkbox-input')
    await cb.click()
    await page.waitForTimeout(100)

    // Check for SVG check icon
    const checkIcon = cb.locator('svg').first()
    await expect(checkIcon).toBeVisible()
  })
})
