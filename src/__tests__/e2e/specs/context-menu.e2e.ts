/**
 * Context Menu Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Context Menu Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#context-menu').scrollIntoViewIfNeeded()
  })

  test('should render context menu trigger area', async ({ page }) => {
    const trigger = page.getByTestId('context-menu-trigger')
    await expect(trigger).toBeVisible()
  })

  test('should open context menu on right-click', async ({ page }) => {
    const trigger = page.getByTestId('context-menu-trigger')
    const box = await trigger.boundingBox()
    if (!box) throw new Error('Trigger not found')

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' })
    await page.waitForTimeout(300)

    const menu = page.getByTestId('context-menu-content')
    await expect(menu).toBeVisible()
  })

  test('should render context menu items', async ({ page }) => {
    const trigger = page.getByTestId('context-menu-trigger')
    const box = await trigger.boundingBox()
    if (!box) throw new Error('Trigger not found')

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' })
    await page.waitForTimeout(300)

    await expect(page.getByTestId('context-menu-item-copy')).toBeVisible()
    await expect(page.getByTestId('context-menu-item-paste')).toBeVisible()
    await expect(page.getByTestId('context-menu-item-settings')).toBeVisible()
  })

  test('should render separator', async ({ page }) => {
    const trigger = page.getByTestId('context-menu-trigger')
    const box = await trigger.boundingBox()
    if (!box) throw new Error('Trigger not found')

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' })
    await page.waitForTimeout(300)

    const separator = page.getByTestId('context-menu-content').locator('[class*="Separator"], hr, div[class*="separator"]').first()
    await expect(separator).toBeVisible()
  })

  test('should select menu item on click', async ({ page }) => {
    const trigger = page.getByTestId('context-menu-trigger')
    const box = await trigger.boundingBox()
    if (!box) throw new Error('Trigger not found')

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' })
    await page.waitForTimeout(300)

    await page.getByTestId('context-menu-item-copy').click()
    await page.waitForTimeout(200)

    // Menu should close
    await expect(page.getByTestId('context-menu-content')).not.toBeVisible()
  })

  test('should close on Escape', async ({ page }) => {
    const trigger = page.getByTestId('context-menu-trigger')
    const box = await trigger.boundingBox()
    if (!box) throw new Error('Trigger not found')

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' })
    await page.waitForTimeout(300)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await expect(page.getByTestId('context-menu-content')).not.toBeVisible()
  })

  test('should close on outside click', async ({ page }) => {
    const trigger = page.getByTestId('context-menu-trigger')
    const box = await trigger.boundingBox()
    if (!box) throw new Error('Trigger not found')

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' })
    await page.waitForTimeout(300)

    await page.mouse.click(10, 10)
    await page.waitForTimeout(200)

    await expect(page.getByTestId('context-menu-content')).not.toBeVisible()
  })

  test('should have glassmorphic background', async ({ page }) => {
    const trigger = page.getByTestId('context-menu-trigger')
    const box = await trigger.boundingBox()
    if (!box) throw new Error('Trigger not found')

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' })
    await page.waitForTimeout(300)

    const menu = page.getByTestId('context-menu-content')
    const backdropFilter = await menu.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.backdropFilter || style.webkitBackdropFilter
    })
    expect(backdropFilter).toContain('blur')
  })

  test('should render item with icon', async ({ page }) => {
    const trigger = page.getByTestId('context-menu-trigger')
    const box = await trigger.boundingBox()
    if (!box) throw new Error('Trigger not found')

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' })
    await page.waitForTimeout(300)

    const settingsItem = page.getByTestId('context-menu-item-settings')
    const icon = settingsItem.locator('svg').first()
    await expect(icon).toBeVisible()
  })
})
