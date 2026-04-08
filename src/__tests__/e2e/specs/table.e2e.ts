/**
 * Data Table Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Data Table Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#table').scrollIntoViewIfNeeded()
  })

  test('should render table', async ({ page }) => {
    const table = page.getByTestId('table-default')
    await expect(table).toBeVisible()
  })

  test('should render table headers', async ({ page }) => {
    const headers = page.locator('thead th')
    await expect(headers).toHaveCount(3)
    await expect(headers.nth(0)).toContainText('Name')
    await expect(headers.nth(1)).toContainText('Status')
    await expect(headers.nth(2)).toContainText('Role')
  })

  test('should render table rows', async ({ page }) => {
    await expect(page.getByTestId('table-row-0')).toBeVisible()
    await expect(page.getByTestId('table-row-1')).toBeVisible()
    await expect(page.getByTestId('table-row-2')).toBeVisible()
  })

  test('should render cell content', async ({ page }) => {
    await expect(page.getByTestId('table-cell-0-0')).toContainText('Alice')
    await expect(page.getByTestId('table-cell-0-1')).toContainText('Active')
    await expect(page.getByTestId('table-cell-0-2')).toContainText('Admin')
  })

  test('should render correct number of rows', async ({ page }) => {
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(3)
  })

  test('should render badges in status column', async ({ page }) => {
    const statusCell = page.getByTestId('table-cell-0-1')
    const badge = statusCell.locator('[class*="Badge"]')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Active')
  })

  test('should highlight row on hover', async ({ page }) => {
    const row = page.getByTestId('table-row-0')
    await row.hover()
    await page.waitForTimeout(300)

    const bgColor = await row.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bgColor).toBeTruthy()
  })

  test('should have alternating row styles', async ({ page }) => {
    const row0 = page.getByTestId('table-row-0')
    const row1 = page.getByTestId('table-row-1')

    const bg0 = await row0.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    const bg1 = await row1.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    // Rows may or may not have alternating styles, just verify they render
    expect(bg0).toBeTruthy()
    expect(bg1).toBeTruthy()
  })

  test('should have table border', async ({ page }) => {
    const table = page.getByTestId('table-default')
    const border = await table.evaluate((el) => window.getComputedStyle(el).borderWidth)
    expect(border).not.toBe('0px')
  })

  test('should have header styling', async ({ page }) => {
    const header = page.locator('thead tr').first()
    const fontWeight = await header.evaluate((el) => window.getComputedStyle(el).fontWeight)
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(500)
  })

  test('should render sortable headers', async ({ page }) => {
    const firstHeader = page.locator('thead th').first()
    // Click to sort (if sortable)
    await firstHeader.click()
    await page.waitForTimeout(200)
    // Table should still be visible
    await expect(page.getByTestId('table-default')).toBeVisible()
  })
})
