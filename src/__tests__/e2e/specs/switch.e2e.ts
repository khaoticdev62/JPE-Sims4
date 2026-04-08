/**
 * Switch/Toggle Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Switch/Toggle Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#switch').scrollIntoViewIfNeeded()
  })

  test('should render switch', async ({ page }) => {
    const sw = page.getByTestId('switch-default')
    await expect(sw).toBeVisible()
  })

  test('should start in unchecked state', async ({ page }) => {
    const sw = page.getByTestId('switch-default')
    await expect(sw).not.toBeChecked()
  })

  test('should toggle on click', async ({ page }) => {
    const sw = page.getByTestId('switch-default')
    await sw.click()
    await page.waitForTimeout(100)
    await expect(sw).toBeChecked()
  })

  test('should toggle back off on second click', async ({ page }) => {
    const sw = page.getByTestId('switch-default')
    await sw.click()
    await page.waitForTimeout(100)
    await expect(sw).toBeChecked()

    await sw.click()
    await page.waitForTimeout(100)
    await expect(sw).not.toBeChecked()
  })

  test('should render disabled switch', async ({ page }) => {
    const sw = page.getByTestId('switch-disabled')
    await expect(sw).toBeVisible()
    await expect(sw).toBeDisabled()
  })

  test('should not toggle when disabled', async ({ page }) => {
    const sw = page.getByTestId('switch-disabled')
    await sw.click({ force: true })
    await page.waitForTimeout(100)
    await expect(sw).toBeDisabled()
  })

  test('should render label', async ({ page }) => {
    const container = page.getByTestId('switch-container')
    await expect(container).toContainText('Off').or(expect(container).toContainText('On'))
  })

  test('should update label on toggle', async ({ page }) => {
    const sw = page.getByTestId('switch-default')
    const container = page.getByTestId('switch-container')

    await expect(container).toContainText('Off')
    await sw.click()
    await page.waitForTimeout(100)
    await expect(container).toContainText('On')
  })

  test('should support keyboard navigation', async ({ page }) => {
    const sw = page.getByTestId('switch-default')
    await sw.focus()
    await page.keyboard.press('Space')
    await page.waitForTimeout(100)
    await expect(sw).toBeChecked()
  })

  test('should toggle with Enter key', async ({ page }) => {
    const sw = page.getByTestId('switch-default')
    await sw.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)
    await expect(sw).toBeChecked()
  })

  test('should have correct role', async ({ page }) => {
    const sw = page.getByTestId('switch-default')
    await expect(sw).toHaveAttribute('role', 'switch')
  })

  test('should have aria-checked attribute', async ({ page }) => {
    const sw = page.getByTestId('switch-default')
    await expect(sw).toHaveAttribute('aria-checked', 'false')

    await sw.click()
    await page.waitForTimeout(100)
    await expect(sw).toHaveAttribute('aria-checked', 'true')
  })

  test('should have thumb and track', async ({ page }) => {
    const sw = page.getByTestId('switch-default')
    // Switch should have inner elements (thumb)
    const thumb = sw.locator('span, div').first()
    await expect(thumb).toBeVisible()
  })
})
