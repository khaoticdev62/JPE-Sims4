/**
 * Breadcrumb Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Breadcrumb Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#breadcrumb').scrollIntoViewIfNeeded()
  })

  test('should render breadcrumb', async ({ page }) => {
    const breadcrumb = page.getByTestId('breadcrumb-default')
    await expect(breadcrumb).toBeVisible()
  })

  test('should render breadcrumb items', async ({ page }) => {
    const items = page.locator('[aria-label="Breadcrumb"] li, [class*="BreadcrumbItem"]')
    expect(await items.count()).toBeGreaterThanOrEqual(3)
  })

  test('should render separators', async ({ page }) => {
    const separators = page.locator('[class*="BreadcrumbSeparator"], svg')
    expect(await separators.count()).toBeGreaterThanOrEqual(2)
  })

  test('should render home icon', async ({ page }) => {
    const homeLink = page.locator('[aria-label="Breadcrumb"] a').first()
    const icon = homeLink.locator('svg').first()
    await expect(icon).toBeVisible()
  })

  test('should render active/current page', async ({ page }) => {
    const activePage = page.getByTestId('breadcrumb-active')
    await expect(activePage).toBeVisible()
    await expect(activePage).toContainText('Button')
  })

  test('should have clickable links', async ({ page }) => {
    const links = page.locator('[aria-label="Breadcrumb"] a')
    expect(await links.count()).toBeGreaterThanOrEqual(2)

    const firstLink = links.first()
    await expect(firstLink).toBeVisible()
  })

  test('should have correct ARIA role', async ({ page }) => {
    const breadcrumb = page.locator('[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toHaveAttribute('aria-label', 'Breadcrumb')
  })

  test('should not have link on current page', async ({ page }) => {
    const currentPage = page.getByTestId('breadcrumb-active')
    // Current page should be a span, not a link
    const tagName = await currentPage.evaluate((el) => el.tagName.toLowerCase())
    expect(tagName).not.toBe('a')
  })
})
