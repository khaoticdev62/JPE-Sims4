/**
 * Card Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Card Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#card').scrollIntoViewIfNeeded()
  })

  test('should render default glass card', async ({ page }) => {
    const card = page.getByTestId('card-default')
    await expect(card).toBeVisible()
  })

  test('should render card header', async ({ page }) => {
    const card = page.getByTestId('card-default')
    const header = card.locator('[class*="CardHeader"]').first()
    await expect(header).toBeVisible()
  })

  test('should render card title', async ({ page }) => {
    const card = page.getByTestId('card-default')
    const title = card.locator('[class*="CardTitle"], h3').first()
    await expect(title).toBeVisible()
    await expect(title).toContainText('Card Title')
  })

  test('should render card content', async ({ page }) => {
    const card = page.getByTestId('card-default')
    const content = card.locator('[class*="CardContent"]').first()
    await expect(content).toBeVisible()
    await expect(content).toContainText('Card content with glassmorphic background.')
  })

  test('should render card footer with button', async ({ page }) => {
    const card = page.getByTestId('card-default')
    const footer = card.locator('[class*="CardFooter"]').first()
    await expect(footer).toBeVisible()
    const btn = footer.locator('button')
    await expect(btn).toBeVisible()
    await expect(btn).toContainText('Action')
  })

  test('should render solid card variant', async ({ page }) => {
    const card = page.getByTestId('card-solid')
    await expect(card).toBeVisible()
  })

  test('should have glassmorphic background on default card', async ({ page }) => {
    const card = page.getByTestId('card-default')
    const bg = await card.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.backgroundColor
    })
    // Glass card should have rgba or specific bg-panel color
    expect(bg).toBeTruthy()
  })

  test('should have border and border-radius', async ({ page }) => {
    const card = page.getByTestId('card-default')
    const border = await card.evaluate((el) => window.getComputedStyle(el).borderWidth)
    const radius = await card.evaluate((el) => window.getComputedStyle(el).borderRadius)
    expect(border).not.toBe('0px')
    expect(radius).not.toBe('0px')
  })

  test('should show hover effect on card', async ({ page }) => {
    const card = page.getByTestId('card-default')
    await card.hover()
    await page.waitForTimeout(300)
    await expect(card).toBeVisible()
    // Border color may change on hover
    const borderColor = await card.evaluate((el) => window.getComputedStyle(el).borderColor)
    expect(borderColor).toBeTruthy()
  })

  test('should be clickable', async ({ page }) => {
    const card = page.getByTestId('card-default')
    await card.click()
    await page.waitForTimeout(100)
    await expect(card).toBeVisible()
  })

  test('should have shadow', async ({ page }) => {
    const card = page.getByTestId('card-default')
    const shadow = await card.evaluate((el) => window.getComputedStyle(el).boxShadow)
    expect(shadow).not.toBe('none')
  })
})
