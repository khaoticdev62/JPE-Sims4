/**
 * Navigation Menu Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Navigation Menu Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#navigation-menu').scrollIntoViewIfNeeded()
  })

  test('should render navigation menu', async ({ page }) => {
    const menu = page.getByTestId('navigation-menu')
    await expect(menu).toBeVisible()
  })

  test('should render menu items', async ({ page }) => {
    await expect(page.getByTestId('nav-trigger-products')).toBeVisible()
    await expect(page.getByTestId('nav-link-docs')).toBeVisible()
  })

  test('should open submenu on hover', async ({ page }) => {
    const trigger = page.getByTestId('nav-trigger-products')
    await trigger.hover()
    await page.waitForTimeout(300)

    // Submenu content should be visible
    const submenu = page.locator('[class*="NavigationMenuContent"]').first()
    await expect(submenu).toBeVisible()
  })

  test('should render submenu items', async ({ page }) => {
    const trigger = page.getByTestId('nav-trigger-products')
    await trigger.hover()
    await page.waitForTimeout(300)

    await expect(page.locator('text=Editor')).toBeVisible()
    await expect(page.locator('text=Translator')).toBeVisible()
  })

  test('should click on submenu item', async ({ page }) => {
    const trigger = page.getByTestId('nav-trigger-products')
    await trigger.hover()
    await page.waitForTimeout(300)

    await page.locator('text=Editor').click()
    await page.waitForTimeout(200)
    // Should not cause error
  })

  test('should close submenu on mouse leave', async ({ page }) => {
    const trigger = page.getByTestId('nav-trigger-products')
    await trigger.hover()
    await page.waitForTimeout(300)

    await page.mouse.move(0, 0)
    await page.waitForTimeout(300)

    const submenu = page.locator('[class*="NavigationMenuContent"]').first()
    await expect(submenu).not.toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    const trigger = page.getByTestId('nav-trigger-products')
    await trigger.focus()
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    const focused = await page.evaluate(() => document.activeElement?.textContent)
    expect(focused).toBeTruthy()
  })

  test('should have correct ARIA role', async ({ page }) => {
    const menu = page.getByTestId('navigation-menu')
    const role = await menu.getAttribute('role')
    expect(role).toMatch(/menubar|navigation/)
  })
})
