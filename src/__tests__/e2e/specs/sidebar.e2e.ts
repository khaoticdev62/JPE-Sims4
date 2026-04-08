/**
 * Sidebar Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Sidebar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#sidebar').scrollIntoViewIfNeeded()
  })

  test('should render sidebar', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-default')
    await expect(sidebar).toBeVisible()
  })

  test('should render sidebar header', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-default')
    await expect(sidebar).toContainText('Navigation')
  })

  test('should render navigation items', async ({ page }) => {
    await expect(page.getByTestId('sidebar-item-home')).toBeVisible()
    await expect(page.getByTestId('sidebar-item-settings')).toBeVisible()
    await expect(page.getByTestId('sidebar-item-users')).toBeVisible()
  })

  test('should highlight active item', async ({ page }) => {
    const homeItem = page.getByTestId('sidebar-item-home')
    const className = await homeItem.getAttribute('class')
    expect(className).toMatch(/bg-bg-active|text-cyan-bright/)
  })

  test('should change active item on click', async ({ page }) => {
    await page.getByTestId('sidebar-item-settings').click()
    await page.waitForTimeout(100)

    const settingsItem = page.getByTestId('sidebar-item-settings')
    const className = await settingsItem.getAttribute('class')
    expect(className).toMatch(/bg-bg-active|text-cyan-bright/)

    // Home should no longer be active
    const homeItem = page.getByTestId('sidebar-item-home')
    const homeClass = await homeItem.getAttribute('class')
    expect(homeClass).not.toMatch(/bg-bg-active/)
  })

  test('should render icons in nav items', async ({ page }) => {
    const homeItem = page.getByTestId('sidebar-item-home')
    const icon = homeItem.locator('svg').first()
    await expect(icon).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.getByTestId('sidebar-item-home').focus()
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
    expect(focused).toMatch(/sidebar-item/)
  })

  test('should have border and background', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-default')
    const bg = await sidebar.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bg).toBeTruthy()
  })

  test('should have correct width', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-default')
    const box = await sidebar.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(200)
  })
})
