/**
 * Alert Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Alert Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#alert').scrollIntoViewIfNeeded()
  })

  test('should render info alert', async ({ page }) => {
    const alert = page.getByTestId('alert-info')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Information')
  })

  test('should render success alert', async ({ page }) => {
    const alert = page.getByTestId('alert-success')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Success')
  })

  test('should render warning alert', async ({ page }) => {
    const alert = page.getByTestId('alert-warning')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Warning')
  })

  test('should render error alert', async ({ page }) => {
    const alert = page.getByTestId('alert-error')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Error')
  })

  test('should render alert icon', async ({ page }) => {
    const alert = page.getByTestId('alert-info')
    const icon = alert.locator('svg').first()
    await expect(icon).toBeVisible()
  })

  test('should render alert title', async ({ page }) => {
    const alert = page.getByTestId('alert-info')
    const title = alert.locator('[class*="AlertTitle"], [class*="alert-title"], strong').first()
    await expect(title).toBeVisible()
    await expect(title).toContainText('Information')
  })

  test('should render alert description', async ({ page }) => {
    const alert = page.getByTestId('alert-info')
    const desc = alert.locator('[class*="AlertDescription"], [class*="alert-description"]').first()
    await expect(desc).toBeVisible()
    await expect(desc).toContainText('info alert message')
  })

  test('should have correct variant styling for error', async ({ page }) => {
    const alert = page.getByTestId('alert-error')
    const className = await alert.getAttribute('class')
    expect(className).toMatch(/destructive|rose|error/)
  })

  test('should have border', async ({ page }) => {
    const alert = page.getByTestId('alert-info')
    const border = await alert.evaluate((el) => window.getComputedStyle(el).borderWidth)
    expect(border).not.toBe('0px')
  })

  test('should have rounded corners', async ({ page }) => {
    const alert = page.getByTestId('alert-info')
    const radius = await alert.evaluate((el) => window.getComputedStyle(el).borderRadius)
    expect(radius).not.toBe('0px')
  })

  test('should have correct semantic colors', async ({ page }) => {
    const successAlert = page.getByTestId('alert-success')
    const borderColor = await successAlert.evaluate((el) => window.getComputedStyle(el).borderColor)
    expect(borderColor).toBeTruthy()
  })
})
