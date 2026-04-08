/**
 * Slider Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Slider Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#slider').scrollIntoViewIfNeeded()
  })

  test('should render slider', async ({ page }) => {
    const slider = page.getByTestId('slider-default')
    await expect(slider).toBeVisible()
  })

  test('should have correct initial value', async ({ page }) => {
    const slider = page.getByTestId('slider-default')
    const thumb = slider.locator('[role="slider"]').first()
    await expect(thumb).toHaveAttribute('aria-valuenow', '30')
  })

  test('should have min and max attributes', async ({ page }) => {
    const slider = page.getByTestId('slider-default')
    const thumb = slider.locator('[role="slider"]').first()
    await expect(thumb).toHaveAttribute('aria-valuemin', '0')
    await expect(thumb).toHaveAttribute('aria-valuemax', '100')
  })

  test('should update value on arrow key press', async ({ page }) => {
    const slider = page.getByTestId('slider-default')
    const thumb = slider.locator('[role="slider"]').first()
    await thumb.focus()

    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)
    const newVal = await thumb.getAttribute('aria-valuenow')
    expect(parseInt(newVal)).toBeGreaterThan(30)
  })

  test('should decrease value on left arrow', async ({ page }) => {
    const slider = page.getByTestId('slider-default')
    const thumb = slider.locator('[role="slider"]').first()
    await thumb.focus()

    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(100)
    const newVal = await thumb.getAttribute('aria-valuenow')
    expect(parseInt(newVal)).toBeLessThan(30)
  })

  test('should respect step size', async ({ page }) => {
    const slider = page.getByTestId('slider-step')
    const thumb = slider.locator('[role="slider"]').first()
    await thumb.focus()

    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)
    const newVal = parseInt(await thumb.getAttribute('aria-valuenow'))
    // Step is 10, so value should be 50 + 10 = 60
    expect(newVal).toBe(60)
  })

  test('should not exceed max value', async ({ page }) => {
    const slider = page.getByTestId('slider-default')
    const thumb = slider.locator('[role="slider"]').first()
    await thumb.focus()

    // Press right arrow many times to approach max
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press('ArrowRight')
    }

    const val = parseInt(await thumb.getAttribute('aria-valuenow'))
    expect(val).toBeLessThanOrEqual(100)
  })

  test('should not go below min value', async ({ page }) => {
    const slider = page.getByTestId('slider-default')
    const thumb = slider.locator('[role="slider"]').first()
    await thumb.focus()

    // Press left arrow many times
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('ArrowLeft')
    }

    const val = parseInt(await thumb.getAttribute('aria-valuenow'))
    expect(val).toBeGreaterThanOrEqual(0)
  })

  test('should have thumb with glow styling', async ({ page }) => {
    const slider = page.getByTestId('slider-default')
    const thumb = slider.locator('[role="slider"]').first()
    await expect(thumb).toBeVisible()

    // Thumb should be a round element
    const borderRadius = await thumb.evaluate((el) => window.getComputedStyle(el).borderRadius)
    expect(borderRadius).toMatch(/50%|9999|px/)
  })

  test('should have track element', async ({ page }) => {
    const slider = page.getByTestId('slider-default')
    const track = slider.locator('[class*="track"], [class*="Track"]').first()
    await expect(track).toBeVisible()
  })

  test('should have range/fill element', async ({ page }) => {
    const slider = page.getByTestId('slider-default')
    const range = slider.locator('[class*="range"], [class*="Range"], [class*="fill"]').first()
    await expect(range).toBeVisible()
  })

  test('should display value label', async ({ page }) => {
    await expect(page.locator('#slider .text-sm')).toContainText('30%')
  })

  test('should update value label on change', async ({ page }) => {
    const slider = page.getByTestId('slider-default')
    const thumb = slider.locator('[role="slider"]').first()
    await thumb.focus()

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight')
    }
    await page.waitForTimeout(200)

    const val = await thumb.getAttribute('aria-valuenow')
    await expect(page.locator('#slider .text-sm')).toContainText(`${val}%`)
  })
})
