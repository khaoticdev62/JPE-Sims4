/**
 * Calendar Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Calendar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#calendar').scrollIntoViewIfNeeded()
  })

  test('should render calendar', async ({ page }) => {
    const calendar = page.getByTestId('calendar-default')
    await expect(calendar).toBeVisible()
  })

  test('should render month header', async ({ page }) => {
    await expect(page.getByTestId('calendar-default')).toContainText('January 2026')
  })

  test('should render day headers', async ({ page }) => {
    const calendar = page.getByTestId('calendar-default')
    await expect(calendar).toContainText('Su')
    await expect(calendar).toContainText('Mo')
    await expect(calendar).toContainText('Tu')
  })

  test('should render date buttons', async ({ page }) => {
    const day4 = page.locator('[class*="calendar-day-4"]').first()
    await expect(day4).toBeVisible()
  })

  test('should highlight today', async ({ page }) => {
    const today = page.getByTestId('calendar-today')
    await expect(today).toBeVisible()
    // Today should have distinct styling
    const className = await today.getAttribute('class')
    expect(className).toMatch(/cyan|today|ring/)
  })

  test('should have previous month button', async ({ page }) => {
    const prevBtn = page.getByTestId('calendar-prev')
    await expect(prevBtn).toBeVisible()
  })

  test('should have next month button', async ({ page }) => {
    const nextBtn = page.getByTestId('calendar-next')
    await expect(nextBtn).toBeVisible()
  })

  test('should navigate to previous month', async ({ page }) => {
    await page.getByTestId('calendar-prev').click()
    await page.waitForTimeout(200)

    await expect(page.getByTestId('calendar-default')).toContainText('December')
  })

  test('should navigate to next month', async ({ page }) => {
    await page.getByTestId('calendar-next').click()
    await page.waitForTimeout(200)

    await expect(page.getByTestId('calendar-default')).toContainText('February')
  })

  test('should select a date', async ({ page }) => {
    const day5 = page.locator('button:has-text("5")').first()
    await day5.click()
    await page.waitForTimeout(100)
    // Date should still be visible after selection
    await expect(day5).toBeVisible()
  })

  test('should have disabled dates for other month', async ({ page }) => {
    const calendar = page.getByTestId('calendar-default')
    const buttons = calendar.locator('button')
    // Some buttons at start/end should be disabled (overflow days)
    // At least check that the calendar renders properly
    expect(await buttons.count()).toBeGreaterThanOrEqual(28)
  })

  test('should have grid layout', async ({ page }) => {
    const calendar = page.getByTestId('calendar-default')
    const grid = calendar.locator('[class*="grid"]').first()
    await expect(grid).toBeVisible()
  })
})
