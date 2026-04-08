/**
 * Badge Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Badge Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#badge').scrollIntoViewIfNeeded()
  })

  test('should render default badge', async ({ page }) => {
    const badge = page.getByTestId('badge-default')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Default')
  })

  test('should render secondary badge', async ({ page }) => {
    const badge = page.getByTestId('badge-secondary')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Secondary')
  })

  test('should render destructive badge', async ({ page }) => {
    const badge = page.getByTestId('badge-destructive')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Destructive')
  })

  test('should render outline badge', async ({ page }) => {
    const badge = page.getByTestId('badge-outline')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Outline')
  })

  test('should render JPE badge', async ({ page }) => {
    const badge = page.getByTestId('jpe-badge-default')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('JPE Default')
  })

  test('should render common badge', async ({ page }) => {
    const badge = page.getByTestId('common-badge')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('OK')
  })

  test('should have border styling', async ({ page }) => {
    const badge = page.getByTestId('badge-default')
    const borderWidth = await badge.evaluate((el) => window.getComputedStyle(el).borderWidth)
    expect(borderWidth).not.toBe('0px')
  })

  test('should have rounded corners', async ({ page }) => {
    const badge = page.getByTestId('badge-default')
    const radius = await badge.evaluate((el) => window.getComputedStyle(el).borderRadius)
    expect(radius).not.toBe('0px')
  })

  test('should have correct font styling', async ({ page }) => {
    const badge = page.getByTestId('badge-default')
    const fontSize = await badge.evaluate((el) => window.getComputedStyle(el).fontSize)
    expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(9)
    expect(parseFloat(fontSize)).toBeLessThanOrEqual(14)
  })

  test('should render badge with color variant', async ({ page }) => {
    const badge = page.getByTestId('common-badge')
    const className = await badge.getAttribute('class')
    // Badge should have some color class
    expect(className).toBeTruthy()
  })
})
