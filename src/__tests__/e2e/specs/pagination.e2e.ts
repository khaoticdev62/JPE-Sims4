/**
 * Pagination Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Pagination Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#pagination').scrollIntoViewIfNeeded()
  })

  test('should render pagination', async ({ page }) => {
    const pagination = page.getByTestId('pagination-default')
    await expect(pagination).toBeVisible()
  })

  test('should render page numbers', async ({ page }) => {
    const links = page.locator('[class*="PaginationLink"]')
    expect(await links.count()).toBeGreaterThanOrEqual(3)
  })

  test('should render previous button', async ({ page }) => {
    const prevBtn = page.locator('[class*="PaginationPrevious"]').first()
    await expect(prevBtn).toBeVisible()
  })

  test('should render next button', async ({ page }) => {
    const nextBtn = page.locator('[class*="PaginationNext"]').first()
    await expect(nextBtn).toBeVisible()
  })

  test('should highlight active page', async ({ page }) => {
    const activeLink = page.locator('[aria-current="page"]')
    await expect(activeLink).toBeVisible()
    await expect(activeLink).toContainText('1')
  })

  test('should render ellipsis for many pages', async ({ page }) => {
    const ellipsis = page.locator('[class*="PaginationEllipsis"]').first()
    await expect(ellipsis).toBeVisible()
  })

  test('should have clickable page links', async ({ page }) => {
    const page2 = page.locator('[class*="PaginationLink"]').filter({ hasText: '2' })
    await expect(page2).toBeVisible()
    await page2.click()
    await page.waitForTimeout(200)
  })

  test('should have clickable next button', async ({ page }) => {
    const nextBtn = page.locator('[class*="PaginationNext"]').first()
    await nextBtn.click()
    await page.waitForTimeout(200)
  })

  test('should have correct ARIA label', async ({ page }) => {
    const nav = page.locator('nav[aria-label*="Pagination"]').first()
    await expect(nav).toBeVisible()
  })
})
