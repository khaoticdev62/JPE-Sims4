/**
 * Spinner Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Spinner Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#spinner').scrollIntoViewIfNeeded()
  })

  test('should render default spinner', async ({ page }) => {
    const spinner = page.getByTestId('spinner-default')
    await expect(spinner).toBeVisible()
  })

  test('should render JPE spinner', async ({ page }) => {
    const spinner = page.getByTestId('jpe-spinner')
    await expect(spinner).toBeVisible()
  })

  test('should render small spinner', async ({ page }) => {
    const spinner = page.getByTestId('jpe-spinner-sm')
    await expect(spinner).toBeVisible()
    const box = await spinner.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(20)
    expect(box?.height).toBeLessThanOrEqual(20)
  })

  test('should render large spinner', async ({ page }) => {
    const spinner = page.getByTestId('jpe-spinner-lg')
    await expect(spinner).toBeVisible()
    const box = await spinner.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(28)
    expect(box?.height).toBeGreaterThanOrEqual(28)
  })

  test('should render custom color spinner', async ({ page }) => {
    const spinner = page.getByTestId('jpe-spinner-color')
    await expect(spinner).toBeVisible()
  })

  test('should have spin animation', async ({ page }) => {
    const spinner = page.getByTestId('jpe-spinner')
    const animation = await spinner.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.animation || style.animationName
    })
    expect(animation).toBeTruthy()
  })

  test('should render as SVG', async ({ page }) => {
    const spinner = page.getByTestId('jpe-spinner')
    const svg = spinner.locator('svg').first()
    await expect(svg).toBeVisible()
  })

  test('should have circle element', async ({ page }) => {
    const spinner = page.getByTestId('jpe-spinner')
    const circle = spinner.locator('circle').first()
    await expect(circle).toBeVisible()
  })

  test('should have correct default size', async ({ page }) => {
    const spinner = page.getByTestId('jpe-spinner')
    const box = await spinner.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(16)
    expect(box?.width).toBeLessThanOrEqual(28)
  })
})
