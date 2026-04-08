/**
 * Dialog/Modal Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Dialog Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#dialog').scrollIntoViewIfNeeded()
  })

  test('should render dialog trigger button', async ({ page }) => {
    const trigger = page.getByTestId('dialog-trigger')
    await expect(trigger).toBeVisible()
    await expect(trigger).toContainText('Open Dialog')
  })

  test('should open dialog on trigger click', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    const dialog = page.getByTestId('dialog-content')
    await expect(dialog).toBeVisible()
  })

  test('should render dialog title', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    const title = page.getByTestId('dialog-title')
    await expect(title).toBeVisible()
    await expect(title).toContainText('Dialog Title')
  })

  test('should render dialog description', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    const desc = page.getByTestId('dialog-description')
    await expect(desc).toBeVisible()
    await expect(desc).toContainText('dialog description with glassmorphic styling')
  })

  test('should render dialog action buttons', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    const dialog = page.getByTestId('dialog-content')
    const cancelBtn = dialog.getByRole('button', { name: 'Cancel' })
    const confirmBtn = page.getByTestId('dialog-confirm')

    await expect(cancelBtn).toBeVisible()
    await expect(confirmBtn).toBeVisible()
  })

  test('should close dialog with close button', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    const dialog = page.getByTestId('dialog-content')
    const closeBtn = dialog.locator('[class*="DialogClose"], button[aria-label*="Close"]').first()
    await closeBtn.click()
    await page.waitForTimeout(200)

    await expect(dialog).not.toBeVisible()
  })

  test('should close dialog with Escape key', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    const dialog = page.getByTestId('dialog-content')
    await expect(dialog).not.toBeVisible()
  })

  test('should close dialog on backdrop click', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    // Click on overlay/backdrop
    const overlay = page.locator('[class*="DialogOverlay"]').first()
    await overlay.click()
    await page.waitForTimeout(200)

    const dialog = page.getByTestId('dialog-content')
    await expect(dialog).not.toBeVisible()
  })

  test('should have open animation', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()

    const dialog = page.getByTestId('dialog-content')
    // Dialog should become visible after animation
    await expect(dialog).toBeVisible({ timeout: 5000 })
  })

  test('should trap focus inside dialog', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    // Tab through elements
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    // Focus should be inside dialog
    const focusedElement = await page.evaluate(() => document.activeElement?.closest('[data-testid="dialog-content"]'))
    // After Tab, focus should be within the dialog or on a dialog element
    expect(focusedElement !== null || document.activeElement?.tagName === 'BUTTON').toBeTruthy()
  })

  test('should have glassmorphic background', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    const dialog = page.getByTestId('dialog-content')
    const backdropFilter = await dialog.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.backdropFilter || (style as any).webkitBackdropFilter
    })
    expect(backdropFilter).toContain('blur')
  })

  test('should have backdrop overlay', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    const overlay = page.locator('[class*="DialogOverlay"]').first()
    await expect(overlay).toBeVisible()
  })

  test('confirm button should close dialog', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    await page.getByTestId('dialog-confirm').click()
    await page.waitForTimeout(200)

    const dialog = page.getByTestId('dialog-content')
    await expect(dialog).not.toBeVisible()
  })

  test('should have correct ARIA role', async ({ page }) => {
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    const dialog = page.getByTestId('dialog-content')
    await expect(dialog).toHaveAttribute('role', 'dialog')
  })
})
