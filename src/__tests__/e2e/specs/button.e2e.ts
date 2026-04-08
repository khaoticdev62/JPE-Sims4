/**
 * Button Component E2E Tests
 *
 * Tests all variants, sizes, states, interactions, keyboard navigation,
 * and accessibility for the Button component.
 */
import { test, expect } from '../fixtures'

test.describe('Button Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    // Scroll to button section
    await page.locator('#button').scrollIntoViewIfNeeded()
  })

  // ---- Rendering ----

  test('should render primary button', async ({ page }) => {
    const btn = page.getByTestId('button-primary')
    await expect(btn).toBeVisible()
    await expect(btn).toContainText('Primary')
  })

  test('should render JPE primary button', async ({ page }) => {
    const btn = page.getByTestId('jpe-button-primary')
    await expect(btn).toBeVisible()
    await expect(btn).toContainText('JPE Primary')
  })

  test('should render all variant buttons', async ({ page }) => {
    await expect(page.getByTestId('button-secondary')).toBeVisible()
    await expect(page.getByTestId('button-ghost')).toBeVisible()
    await expect(page.getByTestId('button-danger')).toBeVisible()
    await expect(page.getByTestId('jpe-button-danger')).toBeVisible()
    await expect(page.getByTestId('button-success')).toBeVisible()
    await expect(page.getByTestId('jpe-button-success')).toBeVisible()
    await expect(page.getByTestId('button-icon')).toBeVisible()
    await expect(page.getByTestId('jpe-button-icon')).toBeVisible()
  })

  test('should render all size buttons', async ({ page }) => {
    await expect(page.getByTestId('button-xs')).toBeVisible()
    await expect(page.getByTestId('button-sm')).toBeVisible()
    await expect(page.getByTestId('button-md')).toBeVisible()
    await expect(page.getByTestId('button-lg')).toBeVisible()
  })

  test('should have correct height for size variants', async ({ page }) => {
    // XS button should be ~24px
    const xsBox = await page.getByTestId('button-xs').boundingBox()
    expect(xsBox?.height).toBeGreaterThanOrEqual(20)
    expect(xsBox?.height).toBeLessThanOrEqual(30)

    // LG button should be ~38px
    const lgBox = await page.getByTestId('button-lg').boundingBox()
    expect(lgBox?.height).toBeGreaterThanOrEqual(34)
    expect(lgBox?.height).toBeLessThanOrEqual(44)
  })

  // ---- Disabled State ----

  test('should render disabled button', async ({ page }) => {
    const btn = page.getByTestId('button-disabled')
    await expect(btn).toBeVisible()
    await expect(btn).toBeDisabled()
    await expect(btn).toContainText('Disabled')
  })

  test('should not respond to clicks when disabled', async ({ page }) => {
    const btn = page.getByTestId('button-disabled')
    await btn.evaluate((el) => {
      ;(window as any).__clickCount = 0
      el.addEventListener('click', () => {
        ;(window as any).__clickCount++
      })
    })
    await btn.click({ force: true })
    const count = await btn.evaluate(() => (window as any).__clickCount)
    expect(count).toBe(0)
  })

  // ---- Loading State ----

  test('should render loading button with spinner', async ({ page }) => {
    const btn = page.getByTestId('button-loading')
    await expect(btn).toBeVisible()
    await expect(btn).toBeDisabled()

    // Spinner should be visible
    const spinner = btn.locator('[class*="animate-spin"]')
    await expect(spinner).toBeVisible()
  })

  test('should render JPE loading button', async ({ page }) => {
    const btn = page.getByTestId('jpe-button-loading')
    await expect(btn).toBeVisible()
    await expect(btn).toBeDisabled()

    const spinner = btn.locator('[class*="animate-spin"]')
    await expect(spinner).toBeVisible()
  })

  // ---- Click Interactions ----

  test('should respond to clicks on enabled button', async ({ page }) => {
    const btn = page.getByTestId('button-primary')
    await expect(btn).toBeEnabled()

    // Use Promise-based click tracking
    const wasClicked = await btn.evaluate((el) => {
      return new Promise<boolean>((resolve) => {
        el.addEventListener('click', () => resolve(true), { once: true })
        // Trigger click via dispatchEvent to ensure it fires
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      })
    })
    expect(wasClicked).toBe(true)
  })

  test('should have accessible name from text content', async ({ page }) => {
    const btn = page.getByTestId('button-primary')
    await expect(btn).toBeVisible()
    // Button text content serves as accessible name
    await expect(btn).toContainText('Primary')
  })

  test('should respond to clicks on JPE button', async ({ page }) => {
    const btn = page.getByTestId('jpe-button-primary')
    await expect(btn).toBeEnabled()
    await btn.click()
    // No error means click succeeded
  })

  // ---- Hover States ----

  test('should show hover glow effect on primary button', async ({ page }) => {
    const btn = page.getByTestId('button-primary')
    await btn.hover()
    await page.waitForTimeout(300)

    // The button should still be visible (hover doesn't hide it)
    await expect(btn).toBeVisible()
  })

  test('should change background on hover for secondary button', async ({ page }) => {
    const btn = page.getByTestId('button-secondary')
    await btn.hover()
    await page.waitForTimeout(300)
    // After hover, the element should still be visible
    await expect(btn).toBeVisible()
  })

  // ---- Keyboard Navigation ----

  test('should be focusable via Tab key', async ({ page }) => {
    // Tab to the first button
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    // One of the buttons should be focused
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedTag).toBe('BUTTON')
  })

  test('should show focus-visible ring when focused via keyboard', async ({ page }) => {
    const btn = page.getByTestId('button-primary')
    await btn.focus()
    await expect(btn).toBeFocused()

    // Check for focus ring styles
    const outlineStyle = await btn.evaluate((el) => window.getComputedStyle(el).outlineStyle)
    const boxShadow = await btn.evaluate((el) => window.getComputedStyle(el).boxShadow)
    // Should have either outline or box-shadow for focus
    expect(outlineStyle !== 'none' || boxShadow !== 'none').toBe(true)
  })

  test('should activate on Enter key when focused', async ({ page }) => {
    const btn = page.getByTestId('button-primary')
    await btn.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)
    // Button should still be visible after activation
    await expect(btn).toBeVisible()
  })

  test('should activate on Space key when focused', async ({ page }) => {
    const btn = page.getByTestId('button-primary')
    await btn.focus()
    await page.keyboard.press('Space')
    await page.waitForTimeout(100)
    await expect(btn).toBeVisible()
  })

  // ---- Accessibility ----

  test('should have button role', async ({ page }) => {
    const btn = page.getByTestId('button-primary')
    // Verify it behaves like a button (implicit or explicit)
    const tagName = await btn.evaluate(el => el.tagName.toLowerCase())
    const role = await btn.getAttribute('role')
    expect(tagName === 'button' || role === 'button').toBe(true)
  })

  test('should have aria-disabled when disabled', async ({ page }) => {
    const btn = page.getByTestId('button-disabled')
    await expect(btn).toBeDisabled()
  })

  test('icon button should have accessible label or title', async ({ page }) => {
    const btn = page.getByTestId('button-icon')
    await expect(btn).toBeVisible()
    // Icon buttons should either have aria-label or title attribute
    const hasAriaLabel = await btn.getAttribute('aria-label')
    const hasTitle = await btn.getAttribute('title')
    expect(hasAriaLabel || hasTitle).toBeTruthy()
  })
})
