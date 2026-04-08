/**
 * Progress Bar Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Progress Bar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#progress').scrollIntoViewIfNeeded()
  })

  test('should render progress bar', async ({ page }) => {
    const progress = page.getByTestId('progress-default')
    await expect(progress).toBeVisible()
  })

  test('should render JPE progress bar', async ({ page }) => {
    const progress = page.getByTestId('jpe-progress')
    await expect(progress).toBeVisible()
  })

  test('should render common progress bar', async ({ page }) => {
    const progress = page.getByTestId('common-progress')
    await expect(progress).toBeVisible()
  })

  test('should display correct value', async ({ page }) => {
    const progress = page.getByTestId('progress-default')
    // Progress should have aria-valuenow
    await expect(progress).toHaveAttribute('aria-valuenow', '65')
  })

  test('should have correct ARIA attributes', async ({ page }) => {
    const progress = page.getByTestId('progress-default')
    await expect(progress).toHaveAttribute('role', 'progressbar')
    await expect(progress).toHaveAttribute('aria-valuenow')
    await expect(progress).toHaveAttribute('aria-valuemin')
    await expect(progress).toHaveAttribute('aria-valuemax')
  })

  test('should show value label', async ({ page }) => {
    const label = page.locator('#progress .text-xs.text-text-muted')
    await expect(label).toContainText('65%')
  })

  test('should increase value on button click', async ({ page }) => {
    await page.getByTestId('progress-increase').click()
    await page.waitForTimeout(200)

    const progress = page.getByTestId('progress-default')
    await expect(progress).toHaveAttribute('aria-valuenow', '75')
  })

  test('should decrease value on button click', async ({ page }) => {
    await page.getByTestId('progress-decrease').click()
    await page.waitForTimeout(200)

    const progress = page.getByTestId('progress-default')
    await expect(progress).toHaveAttribute('aria-valuenow', '55')
  })

  test('should not exceed 100%', async ({ page }) => {
    // Set to near max
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('progress-increase').click()
      await page.waitForTimeout(100)
    }

    const progress = page.getByTestId('progress-default')
    const value = await progress.getAttribute('aria-valuenow')
    expect(parseInt(value)).toBeLessThanOrEqual(100)
  })

  test('should not go below 0%', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('progress-decrease').click()
      await page.waitForTimeout(100)
    }

    const progress = page.getByTestId('progress-default')
    const value = await progress.getAttribute('aria-valuenow')
    expect(parseInt(value)).toBeGreaterThanOrEqual(0)
  })

  test('should have track background', async ({ page }) => {
    const progress = page.getByTestId('progress-default')
    const bg = await progress.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bg).toBeTruthy()
  })

  test('should have animated fill', async ({ page }) => {
    const progress = page.getByTestId('progress-default')
    const fill = progress.locator('[class*="indicator"], div[style*="width"]').first()
    await expect(fill).toBeVisible()

    const width = await fill.evaluate((el) => window.getComputedStyle(el).width)
    expect(width).toBeTruthy()
  })

  test('should have color styling', async ({ page }) => {
    const progress = page.getByTestId('jpe-progress')
    const className = await progress.getAttribute('class')
    expect(className).toBeTruthy()
  })
})
