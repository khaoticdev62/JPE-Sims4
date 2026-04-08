/**
 * Radio Group Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Radio Group Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#radio-group').scrollIntoViewIfNeeded()
  })

  test('should render radio group', async ({ page }) => {
    const group = page.getByTestId('radio-group-default')
    await expect(group).toBeVisible()
  })

  test('should render radio options', async ({ page }) => {
    await expect(page.getByTestId('radio-option-1')).toBeVisible()
    await expect(page.getByTestId('radio-option-2')).toBeVisible()
    await expect(page.getByTestId('radio-option-3')).toBeVisible()
  })

  test('should render option labels', async ({ page }) => {
    const group = page.getByTestId('radio-group-default')
    await expect(group).toContainText('Option One')
    await expect(group).toContainText('Option Two')
    await expect(group).toContainText('Option Three')
  })

  test('should have first option selected by default', async ({ page }) => {
    await expect(page.getByTestId('radio-option-1')).toBeChecked()
  })

  test('should select option on click', async ({ page }) => {
    await page.getByTestId('radio-option-2').click()
    await page.waitForTimeout(100)

    await expect(page.getByTestId('radio-option-2')).toBeChecked()
    await expect(page.getByTestId('radio-option-1')).not.toBeChecked()
  })

  test('should deselect previous option', async ({ page }) => {
    await page.getByTestId('radio-option-2').click()
    await page.waitForTimeout(100)

    await expect(page.getByTestId('radio-option-1')).not.toBeChecked()
    await expect(page.getByTestId('radio-option-3')).not.toBeChecked()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.getByTestId('radio-option-1').focus()
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)

    await expect(page.getByTestId('radio-option-2')).toBeChecked()
  })

  test('should have correct role', async ({ page }) => {
    const group = page.getByTestId('radio-group-default')
    await expect(group).toHaveAttribute('role', 'radiogroup')
  })

  test('should have radio buttons with correct role', async ({ page }) => {
    const option = page.getByTestId('radio-option-1')
    await expect(option).toHaveAttribute('role', 'radio')
  })
})
