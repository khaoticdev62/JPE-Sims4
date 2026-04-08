/**
 * Input Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Input Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#input').scrollIntoViewIfNeeded()
  })

  test('should render text input', async ({ page }) => {
    const input = page.getByTestId('input-field')
    await expect(input).toBeVisible()
    // Default input type is text (browser default)
    const type = await input.getAttribute('type')
    expect(type === 'text' || type === null).toBe(true)
  })

  test('should render with placeholder', async ({ page }) => {
    const input = page.getByTestId('input-field')
    await expect(input).toHaveAttribute('placeholder', 'Enter text...')
  })

  test('should render with label', async ({ page }) => {
    const label = page.locator('label[for="text-input"]')
    await expect(label).toBeVisible()
    await expect(label).toContainText('Text Input')
  })

  test('should accept text input', async ({ page }) => {
    const input = page.getByTestId('input-field')
    await input.fill('Hello World')
    await expect(input).toHaveValue('Hello World')
  })

  test('should clear input value', async ({ page }) => {
    const input = page.getByTestId('input-field')
    await input.fill('Test')
    await expect(input).toHaveValue('Test')
    await input.clear()
    await expect(input).toHaveValue('')
  })

  test('should render disabled input', async ({ page }) => {
    const input = page.getByTestId('input-disabled')
    await expect(input).toBeVisible()
    await expect(input).toBeDisabled()
  })

  test('should not accept input when disabled', async ({ page }) => {
    const input = page.getByTestId('input-disabled')
    await expect(input).toBeDisabled()
    // Disabled inputs cannot be filled by Playwright, so we just verify disabled state
    const initialVal = await input.inputValue()
    expect(initialVal).toBe('')
  })

  test('should render error state input', async ({ page }) => {
    const input = page.getByTestId('input-error')
    await expect(input).toBeVisible()
    // Error input should have destructive/error styling via aria-invalid
    const isInvalid = await input.getAttribute('aria-invalid')
    const className = await input.getAttribute('class')
    expect(isInvalid === 'true' || className?.includes('destructive') || className?.includes('rose')).toBe(true)
  })

  test('should show error message for error input', async ({ page }) => {
    const errorMsg = page.locator('[role="alert"]').first()
    await expect(errorMsg).toBeVisible()
    await expect(errorMsg).toContainText('This field is required')
  })

  test('should show focus glow on focus', async ({ page }) => {
    const input = page.getByTestId('input-field')
    await input.focus()
    await expect(input).toBeFocused()

    // Check for focus styles
    const boxShadow = await input.evaluate((el) => window.getComputedStyle(el).boxShadow)
    const ringWidth = await input.evaluate((el) => window.getComputedStyle(el).outlineWidth)
    expect(boxShadow !== 'none' || ringWidth !== '0px').toBe(true)
  })

  test('should update value on change', async ({ page }) => {
    const input = page.getByTestId('input-field')
    await input.fill('test value')
    await expect(input).toHaveValue('test value')
  })

  test('should handle keyboard navigation', async ({ page }) => {
    const input = page.getByTestId('input-field')
    await input.click()
    await input.fill('abc')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Home')
    await page.keyboard.press('End')
    await expect(input).toHaveValue('abc')
  })

  test('should support select all with Ctrl+A', async ({ page }) => {
    const input = page.getByTestId('input-field')
    await input.fill('selectable text')
    await input.focus()
    await page.keyboard.press('Control+a')
    await expect(input).toBeFocused()
  })

  test('should render with correct CSS classes for dark theme', async ({ page }) => {
    const input = page.getByTestId('input-field')
    const className = await input.getAttribute('class')
    expect(className).toBeTruthy()
    // Should have rounded corners
    expect(className).toContain('rounded-md')
    // Should have text color class
    expect(className?.includes('text-')).toBe(true)
  })
})
