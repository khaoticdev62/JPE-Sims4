/**
 * Visual Regression Tests
 *
 * These tests take screenshots of component variants and compare them
 * against baseline images. Run with `--update-snapshots` to update baselines.
 *
 * Usage:
 *   npx playwright test visual-regression --update-snapshots
 */
import { test, expect } from '../../fixtures'

test.describe('Visual Regression: Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#button').scrollIntoViewIfNeeded()
  })

  test('should match primary button snapshot', async ({ page }) => {
    const btn = page.getByTestId('button-primary')
    await expect(btn).toHaveScreenshot('button-primary.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  test('should match secondary button snapshot', async ({ page }) => {
    const btn = page.getByTestId('button-secondary')
    await expect(btn).toHaveScreenshot('button-secondary.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  test('should match ghost button snapshot', async ({ page }) => {
    const btn = page.getByTestId('button-ghost')
    await expect(btn).toHaveScreenshot('button-ghost.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  test('should match danger button snapshot', async ({ page }) => {
    const btn = page.getByTestId('button-danger')
    await expect(btn).toHaveScreenshot('button-danger.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  test('should match disabled button snapshot', async ({ page }) => {
    const btn = page.getByTestId('button-disabled')
    await expect(btn).toHaveScreenshot('button-disabled.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  test('should match loading button snapshot', async ({ page }) => {
    const btn = page.getByTestId('button-loading')
    await expect(btn).toHaveScreenshot('button-loading.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.1,
    })
  })
})

test.describe('Visual Regression: Inputs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#input').scrollIntoViewIfNeeded()
  })

  test('should match input snapshot', async ({ page }) => {
    const input = page.getByTestId('input-field')
    await expect(input).toHaveScreenshot('input-default.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  test('should match error input snapshot', async ({ page }) => {
    const input = page.getByTestId('input-error')
    await expect(input).toHaveScreenshot('input-error.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })
})

test.describe('Visual Regression: Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#card').scrollIntoViewIfNeeded()
  })

  test('should match glass card snapshot', async ({ page }) => {
    const card = page.getByTestId('card-default')
    await expect(card).toHaveScreenshot('card-glass.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })
})

test.describe('Visual Regression: Badges', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#badge').scrollIntoViewIfNeeded()
  })

  test('should match default badge snapshot', async ({ page }) => {
    const badge = page.getByTestId('badge-default')
    await expect(badge).toHaveScreenshot('badge-default.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  test('should match destructive badge snapshot', async ({ page }) => {
    const badge = page.getByTestId('badge-destructive')
    await expect(badge).toHaveScreenshot('badge-destructive.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })
})

test.describe('Visual Regression: Status Indicators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#status').scrollIntoViewIfNeeded()
  })

  test('should match ok status snapshot', async ({ page }) => {
    const dot = page.getByTestId('jpe-status-dot-ok')
    await expect(dot).toHaveScreenshot('status-ok.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.1,
    })
  })

  test('should match error status snapshot', async ({ page }) => {
    const dot = page.getByTestId('jpe-status-dot-error')
    await expect(dot).toHaveScreenshot('status-error.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.1,
    })
  })
})

test.describe('Visual Regression: Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#alert').scrollIntoViewIfNeeded()
  })

  test('should match info alert snapshot', async ({ page }) => {
    const alert = page.getByTestId('alert-info')
    await expect(alert).toHaveScreenshot('alert-info.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  test('should match error alert snapshot', async ({ page }) => {
    const alert = page.getByTestId('alert-error')
    await expect(alert).toHaveScreenshot('alert-error.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })
})

test.describe('Visual Regression: Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#notification').scrollIntoViewIfNeeded()
  })

  test('should match info notification snapshot', async ({ page }) => {
    const notification = page.getByTestId('notification-info')
    await expect(notification).toHaveScreenshot('notification-info.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  test('should match error notification snapshot', async ({ page }) => {
    const notification = page.getByTestId('notification-error')
    await expect(notification).toHaveScreenshot('notification-error.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })
})
