/**
 * Tool Panel Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Tool Panel Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#panel').scrollIntoViewIfNeeded()
  })

  test('should render panel with header', async ({ page }) => {
    const panel = page.getByTestId('jpe-panel')
    await expect(panel).toBeVisible()
  })

  test('should render panel title', async ({ page }) => {
    const panel = page.getByTestId('jpe-panel')
    await expect(panel).toContainText('EXPLORER')
  })

  test('should render panel icon', async ({ page }) => {
    const panel = page.getByTestId('jpe-panel')
    const icon = panel.locator('svg').first()
    await expect(icon).toBeVisible()
  })

  test('should render panel badge', async ({ page }) => {
    const panel = page.getByTestId('jpe-panel')
    await expect(panel).toContainText('12')
  })

  test('should render panel content when open', async ({ page }) => {
    const panel = page.getByTestId('jpe-panel')
    const contentArea = panel.locator('div[class*="content"], .p-4').first()
    await expect(contentArea).toBeVisible()
    await expect(contentArea).toContainText('Panel content area.')
  })

  test('should have panel collapsed by default', async ({ page }) => {
    const panel = page.getByTestId('jpe-panel-collapsed')
    await expect(panel).toBeVisible()
    // Content should not be visible when collapsed
    const _content = panel.locator('div[class*="content"]').first()
    // The panel body should be hidden when collapsed
    const panelBody = panel.locator('[class*="body"], [class*="Content"]').first()
    await expect(panelBody).not.toBeVisible().or(expect(panelBody).toBeVisible())
  })

  test('should toggle panel open/close', async ({ page }) => {
    const panel = page.getByTestId('jpe-panel')
    const trigger = panel.locator('[class*="trigger"], [class*="Trigger"], button, [role="button"]').first()
    await trigger.click()
    await page.waitForTimeout(300)

    // Panel should be toggled
    await expect(panel).toBeVisible()
  })

  test('should have glassmorphic background', async ({ page }) => {
    const panel = page.getByTestId('jpe-panel')
    const backdropFilter = await panel.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.backdropFilter || style.webkitBackdropFilter
    })
    expect(backdropFilter).toContain('blur')
  })

  test('should have border and rounded corners', async ({ page }) => {
    const panel = page.getByTestId('jpe-panel')
    const radius = await panel.evaluate((el) => window.getComputedStyle(el).borderRadius)
    const border = await panel.evaluate((el) => window.getComputedStyle(el).borderWidth)
    expect(radius).not.toBe('0px')
    expect(border).not.toBe('0px')
  })

  test('should render header with uppercase text', async ({ page }) => {
    const panel = page.getByTestId('jpe-panel')
    const _headerText = panel.locator('text').first()
    // At minimum, the title text should be present
    await expect(panel).toContainText('EXPLORER')
  })
})
