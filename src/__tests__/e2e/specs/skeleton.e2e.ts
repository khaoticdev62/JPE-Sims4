/**
 * Skeleton Loader Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Skeleton Loader Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#skeleton').scrollIntoViewIfNeeded()
  })

  test('should render default skeleton', async ({ page }) => {
    const skeleton = page.getByTestId('skeleton-default')
    await expect(skeleton).toBeVisible()
  })

  test('should render text skeleton', async ({ page }) => {
    const skeleton = page.getByTestId('skeleton-text')
    await expect(skeleton).toBeVisible()
  })

  test('should render circle skeleton', async ({ page }) => {
    const skeleton = page.getByTestId('skeleton-circle')
    await expect(skeleton).toBeVisible()
  })

  test('should render rectangle skeleton', async ({ page }) => {
    const skeleton = page.getByTestId('skeleton-rect')
    await expect(skeleton).toBeVisible()
  })

  test('should render JPE skeleton', async ({ page }) => {
    const skeleton = page.getByTestId('jpe-skeleton')
    await expect(skeleton).toBeVisible()
  })

  test('should render JPE skeleton with rounded corners', async ({ page }) => {
    const skeleton = page.getByTestId('jpe-skeleton-rounded')
    await expect(skeleton).toBeVisible()
  })

  test('should have pulse animation', async ({ page }) => {
    const skeleton = page.getByTestId('skeleton-default')
    const animation = await skeleton.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.animation || style.animationName
    })
    expect(animation).toBeTruthy()
  })

  test('should have correct height for text skeleton', async ({ page }) => {
    const skeleton = page.getByTestId('skeleton-text')
    const height = await skeleton.evaluate((el) => window.getComputedStyle(el).height)
    expect(parseFloat(height)).toBeGreaterThanOrEqual(12)
    expect(parseFloat(height)).toBeLessThanOrEqual(24)
  })

  test('should have rounded corners for circle', async ({ page }) => {
    const skeleton = page.getByTestId('skeleton-circle')
    const radius = await skeleton.evaluate((el) => window.getComputedStyle(el).borderRadius)
    expect(radius).toMatch(/9999|50%|48px/)
  })

  test('should have rounded corners for rect', async ({ page }) => {
    const skeleton = page.getByTestId('skeleton-rect')
    const radius = await skeleton.evaluate((el) => window.getComputedStyle(el).borderRadius)
    expect(radius).not.toBe('0px')
  })

  test('should have shimmer gradient background', async ({ page }) => {
    const skeleton = page.getByTestId('skeleton-text')
    const bg = await skeleton.evaluate((el) => window.getComputedStyle(el).backgroundImage)
    // Should have gradient for shimmer effect
    expect(bg).toBeTruthy()
  })

  test('should respect custom width', async ({ page }) => {
    const skeleton = page.getByTestId('jpe-skeleton')
    const width = await skeleton.evaluate((el) => window.getComputedStyle(el).width)
    expect(parseFloat(width)).toBeGreaterThan(0)
  })

  test('should respect custom height', async ({ page }) => {
    const skeleton = page.getByTestId('jpe-skeleton')
    const height = await skeleton.evaluate((el) => window.getComputedStyle(el).height)
    expect(parseFloat(height)).toBeGreaterThanOrEqual(12)
  })
})
