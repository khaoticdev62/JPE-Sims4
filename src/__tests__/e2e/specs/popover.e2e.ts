/**
 * Popover Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Popover Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#popover').scrollIntoViewIfNeeded()
  })

  test('should render popover trigger', async ({ page }) => {
    const trigger = page.getByTestId('popover-trigger')
    await expect(trigger).toBeVisible()
  })

  test('should open popover on click', async ({ page }) => {
    await page.getByTestId('popover-trigger').click()
    await page.waitForTimeout(300)

    const content = page.getByTestId('popover-content')
    await expect(content).toBeVisible()
  })

  test('should render popover content', async ({ page }) => {
    await page.getByTestId('popover-trigger').click()
    await page.waitForTimeout(300)

    const content = page.getByTestId('popover-content')
    await expect(content).toContainText('popover content')
  })

  test('should close popover on Escape', async ({ page }) => {
    await page.getByTestId('popover-trigger').click()
    await page.waitForTimeout(300)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await expect(page.getByTestId('popover-content')).not.toBeVisible()
  })

  test('should close popover on outside click', async ({ page }) => {
    await page.getByTestId('popover-trigger').click()
    await page.waitForTimeout(300)

    await page.locator('body').click({ position: { x: 10, y: 10 } })
    await page.waitForTimeout(200)

    await expect(page.getByTestId('popover-content')).not.toBeVisible()
  })

  test('should render input inside popover', async ({ page }) => {
    await page.getByTestId('popover-trigger').click()
    await page.waitForTimeout(300)

    const input = page.getByTestId('popover-content').locator('input')
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('placeholder', 'Search...')
  })
})
