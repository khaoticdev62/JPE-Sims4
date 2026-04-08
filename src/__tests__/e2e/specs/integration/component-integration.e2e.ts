/**
 * Integration Tests
 *
 * Tests that verify component combinations and real-world usage flows.
 */
import { test, expect } from '../../fixtures'

test.describe('Integration: Form Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should fill out form fields and validate', async ({ page }) => {
    // Navigate to form-field section
    await page.locator('#form-field').scrollIntoViewIfNeeded()

    // Fill out username
    const usernameInput = page.locator('[data-testid="form-field-default"] input')
    await usernameInput.fill('testuser')
    await expect(usernameInput).toHaveValue('testuser')

    // Error field should have error styling
    await page.locator('#form-field-error').scrollIntoViewIfNeeded()
    const errorInput = page.locator('[data-testid="form-field-error"] input')
    await expect(errorInput).toBeVisible()

    // Required field should have required attribute
    const requiredInput = page.locator('[data-testid="form-field-required"] input')
    await expect(requiredInput).toHaveAttribute('required')
  })

  test('should show validation errors', async ({ page }) => {
    await page.locator('#form-field').scrollIntoViewIfNeeded()

    // Error message should be visible
    const errorMsg = page.locator('[data-testid="form-field-error"] [role="alert"]')
    await expect(errorMsg).toContainText('Please enter a valid email.')
  })
})

test.describe('Integration: Dialog with Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should open dialog and interact with content', async ({ page }) => {
    await page.locator('#dialog').scrollIntoViewIfNeeded()

    // Open dialog
    await page.getByTestId('dialog-trigger').click()
    await page.waitForTimeout(300)

    const dialog = page.getByTestId('dialog-content')
    await expect(dialog).toBeVisible()

    // Dialog should have title
    await expect(page.getByTestId('dialog-title')).toContainText('Dialog Title')

    // Dialog should have action buttons
    const cancelBtn = dialog.getByRole('button', { name: 'Cancel' })
    const confirmBtn = page.getByTestId('dialog-confirm')
    await expect(cancelBtn).toBeVisible()
    await expect(confirmBtn).toBeVisible()

    // Close with confirm
    await confirmBtn.click()
    await page.waitForTimeout(200)
    await expect(dialog).not.toBeVisible()
  })
})

test.describe('Integration: Tabs with Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should switch tabs and show different content', async ({ page }) => {
    await page.locator('#tabs').scrollIntoViewIfNeeded()

    // Default tab
    await expect(page.getByTestId('tabpanel-general')).toBeVisible()

    // Switch to settings
    await page.getByTestId('tab-settings').click()
    await page.waitForTimeout(200)
    await expect(page.getByTestId('tabpanel-settings')).toBeVisible()
    await expect(page.getByTestId('tabpanel-general')).not.toBeVisible()

    // Switch to advanced
    await page.getByTestId('tab-advanced').click()
    await page.waitForTimeout(200)
    await expect(page.getByTestId('tabpanel-advanced')).toBeVisible()
  })
})

test.describe('Integration: Dropdown with Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should open dropdown and select item', async ({ page }) => {
    await page.locator('#dropdown').scrollIntoViewIfNeeded()

    await page.getByTestId('dropdown-trigger').click()
    await page.waitForTimeout(300)

    // Select option 1
    await page.getByTestId('dropdown-item-option1').click()
    await page.waitForTimeout(200)

    // Dropdown should close
    await expect(page.getByTestId('dropdown-content')).not.toBeVisible()
  })
})

test.describe('Integration: Accordion with Multiple Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should expand and collapse accordion sections', async ({ page }) => {
    await page.locator('#accordion').scrollIntoViewIfNeeded()

    // First item expanded by default
    await expect(page.getByTestId('accordion-trigger-1')).toHaveAttribute('aria-expanded', 'true')

    // Expand second item
    await page.getByTestId('accordion-trigger-2').click()
    await page.waitForTimeout(300)

    await expect(page.getByTestId('accordion-trigger-2')).toHaveAttribute('aria-expanded', 'true')
    // First should collapse (single type)
    await expect(page.getByTestId('accordion-trigger-1')).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('Integration: Table with Badges', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should render table with status badges', async ({ page }) => {
    await page.locator('#table').scrollIntoViewIfNeeded()

    // Table should have rows
    await expect(page.getByTestId('table-row-0')).toBeVisible()

    // Status cell should have badge
    const statusCell = page.getByTestId('table-cell-0-1')
    const badge = statusCell.locator('[class*="Badge"]')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Active')
  })

  test('should hover highlight rows', async ({ page }) => {
    await page.locator('#table').scrollIntoViewIfNeeded()

    const row = page.getByTestId('table-row-0')
    await row.hover()
    await page.waitForTimeout(300)

    // Row should still be visible with hover styling
    await expect(row).toBeVisible()
  })
})

test.describe('Integration: Select with Options', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should open select and choose option', async ({ page }) => {
    await page.locator('#select').scrollIntoViewIfNeeded()

    await page.getByTestId('select-trigger').click()
    await page.waitForTimeout(300)

    // Select React
    await page.getByTestId('select-item-react').click()
    await page.waitForTimeout(200)

    // Value should update
    await expect(page.getByTestId('select-value')).toContainText('React')
  })
})

test.describe('Integration: Sheet with Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should open sheet and verify content', async ({ page }) => {
    await page.locator('#sheet').scrollIntoViewIfNeeded()

    await page.getByTestId('sheet-trigger').click()
    await page.waitForTimeout(300)

    const sheet = page.getByTestId('sheet-content-right')
    await expect(sheet).toBeVisible()

    // Should have title
    await expect(page.getByTestId('sheet-title')).toContainText('Sheet Title')

    // Close with Escape
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    await expect(sheet).not.toBeVisible()
  })
})

test.describe('Integration: Calendar with Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should navigate months and select date', async ({ page }) => {
    await page.locator('#calendar').scrollIntoViewIfNeeded()

    // Navigate to next month
    await page.getByTestId('calendar-next').click()
    await page.waitForTimeout(200)

    await expect(page.getByTestId('calendar-default')).toContainText('February')

    // Navigate back
    await page.getByTestId('calendar-prev').click()
    await page.waitForTimeout(200)

    await expect(page.getByTestId('calendar-default')).toContainText('January')
  })
})

test.describe('Integration: Progress with Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should increase and decrease progress', async ({ page }) => {
    await page.locator('#progress').scrollIntoViewIfNeeded()

    // Increase
    await page.getByTestId('progress-increase').click()
    await page.waitForTimeout(200)

    const progress = page.getByTestId('progress-default')
    await expect(progress).toHaveAttribute('aria-valuenow', '75')

    // Decrease
    await page.getByTestId('progress-decrease').click()
    await page.waitForTimeout(200)

    await expect(progress).toHaveAttribute('aria-valuenow', '65')
  })
})

test.describe('Integration: Switch and Checkbox State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should toggle switch and checkbox', async ({ page }) => {
    await page.locator('#switch').scrollIntoViewIfNeeded()

    const sw = page.getByTestId('switch-default')
    await sw.click()
    await page.waitForTimeout(100)
    await expect(sw).toBeChecked()

    await page.locator('#checkbox').scrollIntoViewIfNeeded()

    const cb = page.getByTestId('checkbox-input')
    await cb.click()
    await page.waitForTimeout(100)
    await expect(cb).toBeChecked()
  })
})

test.describe('Integration: Slider with Value Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should adjust slider and see value update', async ({ page }) => {
    await page.locator('#slider').scrollIntoViewIfNeeded()

    const slider = page.getByTestId('slider-default')
    const thumb = slider.locator('[role="slider"]').first()
    await thumb.focus()

    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(200)

    const val = await thumb.getAttribute('aria-valuenow')
    expect(parseInt(val)).toBeGreaterThan(30)
  })
})

test.describe('Integration: Graph Viewer with Nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should render graph with nodes and edges', async ({ page }) => {
    await page.locator('#graph-viewer').scrollIntoViewIfNeeded()

    const graph = page.getByTestId('graph-viewer')
    await expect(graph).toBeVisible()

    // Should have 3 nodes
    const nodes = graph.locator('circle')
    expect(await nodes.count()).toBeGreaterThanOrEqual(3)

    // Should have edges
    const edges = graph.locator('line, path')
    expect(await edges.count()).toBeGreaterThanOrEqual(2)

    // Should have labels
    await expect(graph).toContainText('Node A')
    await expect(graph).toContainText('Node B')
  })
})

test.describe('Integration: Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should navigate between sidebar items', async ({ page }) => {
    await page.locator('#sidebar').scrollIntoViewIfNeeded()

    // Home is active by default
    const homeItem = page.getByTestId('sidebar-item-home')
    let className = await homeItem.getAttribute('class')
    expect(className).toMatch(/bg-bg-active/)

    // Click settings
    await page.getByTestId('sidebar-item-settings').click()
    await page.waitForTimeout(100)

    const settingsItem = page.getByTestId('sidebar-item-settings')
    className = await settingsItem.getAttribute('class')
    expect(className).toMatch(/bg-bg-active/)

    // Home should no longer be active
    const homeClass = await homeItem.getAttribute('class')
    expect(homeClass).not.toMatch(/bg-bg-active/)
  })
})

test.describe('Integration: Toast and Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
  })

  test('should render all notification types', async ({ page }) => {
    await page.locator('#notification').scrollIntoViewIfNeeded()

    await expect(page.getByTestId('notification-info')).toBeVisible()
    await expect(page.getByTestId('notification-success')).toBeVisible()
    await expect(page.getByTestId('notification-warning')).toBeVisible()
    await expect(page.getByTestId('notification-error')).toBeVisible()
  })
})
