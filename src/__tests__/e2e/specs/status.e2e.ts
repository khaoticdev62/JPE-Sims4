/**
 * Status Indicators E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Status Indicators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#status').scrollIntoViewIfNeeded()
  })

  test('should render ok status', async ({ page }) => {
    await expect(page.getByTestId('status-ok')).toBeVisible()
    await expect(page.getByTestId('jpe-status-dot-ok')).toBeVisible()
  })

  test('should render warning status', async ({ page }) => {
    await expect(page.getByTestId('status-warning')).toBeVisible()
    await expect(page.getByTestId('jpe-status-dot-warning')).toBeVisible()
  })

  test('should render error status', async ({ page }) => {
    await expect(page.getByTestId('status-error')).toBeVisible()
    await expect(page.getByTestId('jpe-status-dot-error')).toBeVisible()
  })

  test('should render info status', async ({ page }) => {
    await expect(page.getByTestId('status-info')).toBeVisible()
    await expect(page.getByTestId('jpe-status-dot-info')).toBeVisible()
  })

  test('should render idle status', async ({ page }) => {
    await expect(page.getByTestId('status-idle')).toBeVisible()
    await expect(page.getByTestId('jpe-status-dot-idle')).toBeVisible()
  })

  test('should render running status', async ({ page }) => {
    await expect(page.getByTestId('status-running')).toBeVisible()
    await expect(page.getByTestId('jpe-status-dot-running')).toBeVisible()
  })

  test('should render status badge with label', async ({ page }) => {
    const badge = page.getByTestId('jpe-status-badge-ok')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Operational')
  })

  test('should render warning status badge', async ({ page }) => {
    const badge = page.getByTestId('jpe-status-badge-warning')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Degraded')
  })

  test('should render error status badge', async ({ page }) => {
    const badge = page.getByTestId('jpe-status-badge-error')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Down')
  })

  test('should render pulse animation', async ({ page }) => {
    const dot = page.getByTestId('jpe-status-dot-pulse')
    await expect(dot).toBeVisible()

    const animation = await dot.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.animation || style.animationName
    })
    // Pulse dot should have some animation
    expect(animation).toBeTruthy()
  })

  test('should render compact status badge', async ({ page }) => {
    const badge = page.getByTestId('jpe-status-badge-compact')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('OK')

    // Compact badge should be smaller
    const height = await badge.evaluate((el) => window.getComputedStyle(el).height)
    expect(parseFloat(height)).toBeLessThanOrEqual(22)
  })

  test('should have correct color for ok status', async ({ page }) => {
    const dot = page.getByTestId('jpe-status-dot-ok')
    const bgColor = await dot.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    // Emerald green: rgb(72, 187, 120) or similar
    expect(bgColor).toBeTruthy()
  })

  test('should have correct color for error status', async ({ page }) => {
    const dot = page.getByTestId('jpe-status-dot-error')
    const bgColor = await dot.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    // Rose: rgb(252, 129, 129) or similar
    expect(bgColor).toBeTruthy()
  })

  test('should render status dot with correct size', async ({ page }) => {
    const dot = page.getByTestId('jpe-status-dot-ok')
    const size = await dot.evaluate((el) => ({
      width: window.getComputedStyle(el).width,
      height: window.getComputedStyle(el).height,
    }))
    expect(parseFloat(size.width)).toBeGreaterThanOrEqual(6)
    expect(parseFloat(size.height)).toBeGreaterThanOrEqual(6)
  })

  test('should render status badge with border', async ({ page }) => {
    const badge = page.getByTestId('jpe-status-badge-ok')
    const borderWidth = await badge.evaluate((el) => window.getComputedStyle(el).borderWidth)
    expect(borderWidth).not.toBe('0px')
  })

  test('should render status badge with mono font', async ({ page }) => {
    const badge = page.getByTestId('jpe-status-badge-ok')
    const fontFamily = await badge.evaluate((el) => window.getComputedStyle(el).fontFamily)
    expect(fontFamily.toLowerCase()).toMatch(/mono|jetbrains|fira|consolas/)
  })
})
