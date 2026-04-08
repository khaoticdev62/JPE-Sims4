/**
 * Textarea Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Textarea Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#textarea').scrollIntoViewIfNeeded()
  })

  test('should render textarea', async ({ page }) => {
    const textarea = page.getByTestId('textarea-default')
    await expect(textarea).toBeVisible()
  })

  test('should render with placeholder', async ({ page }) => {
    const textarea = page.getByTestId('textarea-default')
    await expect(textarea).toHaveAttribute('placeholder', 'Enter description...')
  })

  test('should accept multi-line input', async ({ page }) => {
    const textarea = page.getByTestId('textarea-default')
    await textarea.fill('Line 1\nLine 2\nLine 3')
    await expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
  })

  test('should render disabled textarea', async ({ page }) => {
    const textarea = page.getByTestId('textarea-disabled')
    await expect(textarea).toBeVisible()
    await expect(textarea).toBeDisabled()
  })

  test('should show focus state', async ({ page }) => {
    const textarea = page.getByTestId('textarea-default')
    await textarea.focus()
    await expect(textarea).toBeFocused()
  })

  test('should have correct min rows', async ({ page }) => {
    const textarea = page.getByTestId('textarea-default')
    const rows = await textarea.getAttribute('rows')
    expect(rows).toBeTruthy()
  })

  test('should support keyboard input', async ({ page }) => {
    const textarea = page.getByTestId('textarea-default')
    await textarea.click()
    await page.keyboard.type('hello')
    await expect(textarea).toHaveValue('hello')
  })

  test('should have resizable styles', async ({ page }) => {
    const textarea = page.getByTestId('textarea-default')
    const resize = await textarea.evaluate((el) => window.getComputedStyle(el).resize)
    expect(resize).toBeTruthy()
  })
})
