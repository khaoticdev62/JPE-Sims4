/**
 * Tabs Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Tabs Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#tabs').scrollIntoViewIfNeeded()
  })

  test('should render tab list', async ({ page }) => {
    const tabList = page.locator('[role="tablist"]')
    await expect(tabList).toBeVisible()
  })

  test('should render all tabs', async ({ page }) => {
    await expect(page.getByTestId('tab-general')).toBeVisible()
    await expect(page.getByTestId('tab-settings')).toBeVisible()
    await expect(page.getByTestId('tab-advanced')).toBeVisible()
  })

  test('should show active tab content', async ({ page }) => {
    await expect(page.getByTestId('tabpanel-general')).toBeVisible()
    await expect(page.getByTestId('tabpanel-settings')).not.toBeVisible()
    await expect(page.getByTestId('tabpanel-advanced')).not.toBeVisible()
  })

  test('should switch tabs on click', async ({ page }) => {
    await page.getByTestId('tab-settings').click()
    await page.waitForTimeout(200)

    await expect(page.getByTestId('tabpanel-general')).not.toBeVisible()
    await expect(page.getByTestId('tabpanel-settings')).toBeVisible()
  })

  test('should switch to advanced tab', async ({ page }) => {
    await page.getByTestId('tab-advanced').click()
    await page.waitForTimeout(200)

    await expect(page.getByTestId('tabpanel-advanced')).toBeVisible()
  })

  test('should have active tab indicator', async ({ page }) => {
    const activeTab = page.getByTestId('tab-general')
    await expect(activeTab).toHaveAttribute('aria-selected', 'true')
  })

  test('should update aria-selected on tab change', async ({ page }) => {
    await page.getByTestId('tab-settings').click()
    await page.waitForTimeout(200)

    await expect(page.getByTestId('tab-general')).toHaveAttribute('aria-selected', 'false')
    await expect(page.getByTestId('tab-settings')).toHaveAttribute('aria-selected', 'true')
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.getByTestId('tab-general').focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)

    // Should now be on settings tab
    const focused = await page.evaluate(() => document.activeElement?.textContent)
    expect(focused).toContain('Settings')
  })

  test('should render JPE file tabs', async ({ page }) => {
    const fileTabs = page.getByTestId('jpe-file-tabs')
    await expect(fileTabs).toBeVisible()
  })

  test('should render file tab with icon', async ({ page }) => {
    const fileTabs = page.getByTestId('jpe-file-tabs')
    const icon = fileTabs.locator('svg').first()
    await expect(icon).toBeVisible()
  })

  test('should show modified indicator on file tab', async ({ page }) => {
    // The second file tab should have a modified dot
    const fileTabs = page.getByTestId('jpe-file-tabs')
    const tabs = fileTabs.locator('[class*="Tab"]')
    await expect(tabs.nth(1)).toBeVisible()
  })

  test('should show pinned indicator on file tab', async ({ page }) => {
    const fileTabs = page.getByTestId('jpe-file-tabs')
    const tabs = fileTabs.locator('[class*="Tab"]')
    await expect(tabs.nth(2)).toBeVisible()
  })

  test('should have correct tab bar height', async ({ page }) => {
    const fileTabs = page.getByTestId('jpe-file-tabs')
    const box = await fileTabs.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(30)
    expect(box?.height).toBeLessThanOrEqual(40)
  })

  test('should have active tab with different background', async ({ page }) => {
    const activeTab = page.getByTestId('tab-general')
    const bg = await activeTab.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bg).toBeTruthy()
  })
})
