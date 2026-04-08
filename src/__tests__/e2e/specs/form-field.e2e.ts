/**
 * Form Field Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Form Field Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#form-field').scrollIntoViewIfNeeded()
  })

  test('should render form field with label', async ({ page }) => {
    const field = page.getByTestId('form-field-default')
    await expect(field).toBeVisible()
    await expect(field).toContainText('Username')
  })

  test('should render help text', async ({ page }) => {
    const field = page.getByTestId('form-field-default')
    await expect(field).toContainText('This is your display name.')
  })

  test('should render form field with error', async ({ page }) => {
    const field = page.getByTestId('form-field-error')
    await expect(field).toBeVisible()
    await expect(field).toContainText('Please enter a valid email.')
  })

  test('should render error message with alert role', async ({ page }) => {
    const errorMsg = page.locator('[data-testid="form-field-error"] [role="alert"]')
    await expect(errorMsg).toBeVisible()
    await expect(errorMsg).toContainText('Please enter a valid email.')
  })

  test('should render required field with indicator', async ({ page }) => {
    const field = page.getByTestId('form-field-required')
    await expect(field).toContainText('*')
    const input = field.locator('input')
    await expect(input).toHaveAttribute('required')
  })

  test('should render input inside form field', async ({ page }) => {
    const field = page.getByTestId('form-field-default')
    const input = field.locator('input')
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('placeholder', 'Enter username')
  })

  test('should have error styling on input', async ({ page }) => {
    const field = page.getByTestId('form-field-error')
    const input = field.locator('input')
    const className = await input.getAttribute('class')
    expect(className).toMatch(/error|rose/)
  })

  test('should associate label with input', async ({ page }) => {
    const field = page.getByTestId('form-field-default')
    const label = field.locator('label')
    const input = field.locator('input')

    const labelFor = await label.getAttribute('for')
    const inputId = await input.getAttribute('id')
    expect(labelFor).toBe(inputId)
  })
})
