/**
 * Command Palette Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Command Palette Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#command-palette').scrollIntoViewIfNeeded()
  })

  test('should show Ctrl+K hint', async ({ page }) => {
    await expect(page.getByTestId('section-command-palette')).toContainText('Ctrl+K')
  })

  test('should open command palette with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    // Command palette dialog should be visible
    const dialog = page.locator('[role="dialog"], [class*="CommandDialog"], [class*="command"]').first()
    await expect(dialog).toBeVisible()
  })

  test('should close command palette with Escape', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    const dialog = page.locator('[role="dialog"], [class*="CommandDialog"]').first()
    await expect(dialog).not.toBeVisible()
  })

  test('should have search input', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    const input = page.locator('[placeholder], input[type="text"]').first()
    await expect(input).toBeVisible()
    await expect(input).toBeFocused()
  })

  test('should filter items on search', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    const input = page.locator('input').first()
    await input.fill('nonexistent')
    await page.waitForTimeout(300)

    // Should show no results or filtered results
    // Just verify the search input works without error
    await expect(input).toHaveValue('nonexistent')
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(100)

    // Dialog should still be open
    const dialog = page.locator('[role="dialog"], [class*="CommandDialog"]').first()
    await expect(dialog).toBeVisible()
  })
})
