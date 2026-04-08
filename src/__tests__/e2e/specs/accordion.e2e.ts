/**
 * Accordion Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Accordion Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#accordion').scrollIntoViewIfNeeded()
  })

  test('should render accordion', async ({ page }) => {
    const accordion = page.getByTestId('accordion-default')
    await expect(accordion).toBeVisible()
  })

  test('should render accordion items', async ({ page }) => {
    await expect(page.getByTestId('accordion-item-1')).toBeVisible()
    await expect(page.getByTestId('accordion-item-2')).toBeVisible()
    await expect(page.getByTestId('accordion-item-3')).toBeVisible()
  })

  test('should render triggers', async ({ page }) => {
    await expect(page.getByTestId('accordion-trigger-1')).toBeVisible()
    await expect(page.getByTestId('accordion-trigger-2')).toBeVisible()
    await expect(page.getByTestId('accordion-trigger-3')).toBeVisible()
  })

  test('should have first item expanded by default', async ({ page }) => {
    await expect(page.getByTestId('accordion-trigger-1')).toHaveAttribute('aria-expanded', 'true')
  })

  test('should have other items collapsed', async ({ page }) => {
    await expect(page.getByTestId('accordion-trigger-2')).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByTestId('accordion-trigger-3')).toHaveAttribute('aria-expanded', 'false')
  })

  test('should show content for expanded item', async ({ page }) => {
    await expect(page.getByTestId('accordion-content-1')).toBeVisible()
  })

  test('should hide content for collapsed items', async ({ page }) => {
    await expect(page.getByTestId('accordion-content-2')).not.toBeVisible()
  })

  test('should toggle item on click', async ({ page }) => {
    await page.getByTestId('accordion-trigger-2').click()
    await page.waitForTimeout(300)

    await expect(page.getByTestId('accordion-trigger-2')).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByTestId('accordion-content-2')).toBeVisible()
  })

  test('should collapse previously expanded item (single mode)', async ({ page }) => {
    await page.getByTestId('accordion-trigger-2').click()
    await page.waitForTimeout(300)

    // First item should now be collapsed (single type accordion)
    await expect(page.getByTestId('accordion-trigger-1')).toHaveAttribute('aria-expanded', 'false')
  })

  test('should render trigger text', async ({ page }) => {
    await expect(page.getByTestId('accordion-trigger-1')).toContainText('Section One')
    await expect(page.getByTestId('accordion-trigger-2')).toContainText('Section Two')
    await expect(page.getByTestId('accordion-trigger-3')).toContainText('Section Three')
  })

  test('should render content text', async ({ page }) => {
    await expect(page.getByTestId('accordion-content-1')).toContainText('Content for section one.')
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.getByTestId('accordion-trigger-1').focus()
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)

    const focused = await page.evaluate(() => document.activeElement?.textContent)
    expect(focused).toContain('Section Two')
  })

  test('should expand/collapse with Enter key', async ({ page }) => {
    await page.getByTestId('accordion-trigger-2').focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    await expect(page.getByTestId('accordion-trigger-2')).toHaveAttribute('aria-expanded', 'true')
  })

  test('should expand/collapse with Space key', async ({ page }) => {
    await page.getByTestId('accordion-trigger-3').focus()
    await page.keyboard.press('Space')
    await page.waitForTimeout(300)

    await expect(page.getByTestId('accordion-trigger-3')).toHaveAttribute('aria-expanded', 'true')
  })
})
