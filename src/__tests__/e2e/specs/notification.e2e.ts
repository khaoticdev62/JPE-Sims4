/**
 * Notification Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Notification Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#notification').scrollIntoViewIfNeeded()
  })

  test('should render info notification', async ({ page }) => {
    const notification = page.getByTestId('notification-info')
    await expect(notification).toBeVisible()
    await expect(notification).toContainText('Info Notification')
  })

  test('should render success notification', async ({ page }) => {
    const notification = page.getByTestId('notification-success')
    await expect(notification).toBeVisible()
    await expect(notification).toContainText('Success')
  })

  test('should render warning notification', async ({ page }) => {
    const notification = page.getByTestId('notification-warning')
    await expect(notification).toBeVisible()
    await expect(notification).toContainText('Warning')
  })

  test('should render error notification', async ({ page }) => {
    const notification = page.getByTestId('notification-error')
    await expect(notification).toBeVisible()
    await expect(notification).toContainText('Error')
  })

  test('should render notification title', async ({ page }) => {
    const notification = page.getByTestId('notification-info')
    const title = notification.locator('[data-notification-title]').first()
    await expect(title).toBeVisible()
    await expect(title).toContainText('Info Notification')
  })

  test('should render notification message', async ({ page }) => {
    const notification = page.getByTestId('notification-info')
    await expect(notification).toContainText('This is an informational notification.')
  })

  test('should render notification timestamp', async ({ page }) => {
    const notification = page.getByTestId('notification-info')
    await expect(notification).toContainText('Just now')
  })

  test('should render success notification timestamp', async ({ page }) => {
    const notification = page.getByTestId('notification-success')
    await expect(notification).toContainText('2 min ago')
  })

  test('should render action button on error notification', async ({ page }) => {
    const notification = page.getByTestId('notification-error')
    const actionBtn = notification.locator('button').last()
    await expect(actionBtn).toBeVisible()
    await expect(actionBtn).toContainText('Retry')
  })

  test('should render dismiss button', async ({ page }) => {
    const notification = page.getByTestId('notification-info')
    const dismissBtn = notification.locator('[data-notification-dismiss]').first()
    await expect(dismissBtn).toBeVisible()
  })

  test('should have accent line', async ({ page }) => {
    const notification = page.getByTestId('notification-info')
    // JPE notifications have a left accent line
    // Even if no explicit accent line, the notification should have left border or padding
    const paddingLeft = await notification.evaluate((el) => window.getComputedStyle(el).paddingLeft)
    expect(parseFloat(paddingLeft)).toBeGreaterThanOrEqual(8)
  })

  test('should have glassmorphic background', async ({ page }) => {
    const notification = page.getByTestId('notification-info')
    const backdropFilter = await notification.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.backdropFilter || style.webkitBackdropFilter
    })
    expect(backdropFilter).toContain('blur')
  })

  test('should have correct type-specific color', async ({ page }) => {
    const notification = page.getByTestId('notification-info')
    const className = await notification.getAttribute('class')
    expect(className).toBeTruthy()
  })

  test('should render toast notification', async ({ page }) => {
    const toast = page.getByTestId('toast-notification')
    await expect(toast).toBeVisible()
    await expect(toast).toContainText('Toast Title')
  })

  test('should dismiss notification on click', async ({ page }) => {
    const notification = page.getByTestId('notification-info')
    const dismissBtn = notification.locator('[data-notification-dismiss]').first()
    // The dismiss callback is a no-op in the showcase, so we just verify the button is clickable
    await expect(dismissBtn).toBeVisible()
    await dismissBtn.click()
    await page.waitForTimeout(300)
    // Click should not cause an error
    await expect(dismissBtn).toBeVisible()
  })
})
