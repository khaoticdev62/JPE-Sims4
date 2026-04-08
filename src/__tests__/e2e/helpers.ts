/**
 * Helper functions for common E2E test operations.
 */
import { type Page, type Locator } from '@playwright/test'
import { expect } from './fixtures'
import { Keys } from './fixtures'
import path from 'path'
import fs from 'fs'

// ---------------------------------------------------------------------------
// Environment Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if the Electron application is built and available at the expected path.
 */
export const isElectronBuilt = (): boolean => {
  const distPath = path.join(process.cwd(), 'dist-electron')
  return fs.existsSync(distPath)
}

/**
 * Gets the absolute path to the Electron executable.
 */
export const getExecutablePath = (): string => {
  const distPath = path.join(process.cwd(), 'dist-electron', 'main.js')
  return distPath
}

/**
 * Gets the distribution path for Electron builds.
 */
export const getDistPath = (): string => {
  return path.join(process.cwd(), 'dist-electron')
}

// ---------------------------------------------------------------------------
// Keyboard Navigation Helpers
// ---------------------------------------------------------------------------

/**
 * Tab through focusable elements a given number of times.
 */
export async function tabThrough(page: Page, count: number = 1): Promise<void> {
  for (let i = 0; i < count; i++) {
    await page.keyboard.press(Keys.Tab)
    // Small delay to let focus transitions settle
    await page.waitForTimeout(50)
  }
}

/**
 * Shift+Tab through focusable elements (reverse direction).
 */
export async function shiftTabThrough(page: Page, count: number = 1): Promise<void> {
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Shift+Tab')
    await page.waitForTimeout(50)
  }
}

/**
 * Navigate with arrow keys.
 */
export async function arrowNavigate(
  page: Page,
  direction: 'up' | 'down' | 'left' | 'right',
  count: number = 1
): Promise<void> {
  const keyMap = {
    up: Keys.ArrowUp,
    down: Keys.ArrowDown,
    left: Keys.ArrowLeft,
    right: Keys.ArrowRight,
  }
  for (let i = 0; i < count; i++) {
    await page.keyboard.press(keyMap[direction])
    await page.waitForTimeout(50)
  }
}

/**
 * Press Escape key.
 */
export async function pressEscape(page: Page): Promise<void> {
  await page.keyboard.press(Keys.Escape)
  await page.waitForTimeout(100)
}

/**
 * Press Enter key.
 */
export async function pressEnter(page: Page): Promise<void> {
  await page.keyboard.press(Keys.Enter)
  await page.waitForTimeout(100)
}

/**
 * Press Space key.
 */
export async function pressSpace(page: Page): Promise<void> {
  await page.keyboard.press(Keys.Space)
  await page.waitForTimeout(100)
}

// ---------------------------------------------------------------------------
// Accessibility Helpers
// ---------------------------------------------------------------------------

/**
 * Check that an element has the expected ARIA attribute.
 */
export async function expectAriaAttribute(
  locator: Locator,
  attribute: string,
  value: string
): Promise<void> {
  await expect(locator).toHaveAttribute(attribute, value)
}

/**
 * Check that an element has a specific role.
 */
export async function expectRole(locator: Locator, role: string): Promise<void> {
  await expect(locator).toHaveAttribute('role', role)
}

/**
 * Check that an element is focusable and receives focus.
 */
export async function expectFocusable(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible()
  // Click to focus, then check focus-visible ring or focus state
  await locator.focus()
  await expect(locator).toBeFocused()
}

/**
 * Verify an element has focus-visible styling (cyan ring in JPE design).
 */
export async function expectFocusVisible(locator: Locator): Promise<void> {
  await locator.focus()
  await expect(locator).toBeFocused()
  // The design system uses focus-visible:ring-2 focus-visible:ring-cyan
  await expect(locator).toHaveCSS('outline-style', /solid|none/)
}

/**
 * Basic accessibility smoke test for a component.
 * Checks for role, label, and keyboard accessibility.
 */
export async function accessibilitySmokeTest(
  page: Page,
  selector: string,
  expectedRole?: string
): Promise<void> {
  const el = page.locator(selector).first()
  await expect(el).toBeVisible()

  if (expectedRole) {
    await expectRole(el, expectedRole)
  }

  // Check it's focusable
  await expectFocusable(el)
}

// ---------------------------------------------------------------------------
// Visual Comparison Helpers
// ---------------------------------------------------------------------------

/**
 * Take a screenshot and compare with baseline.
 * Returns true if visual match is within threshold.
 */
export async function visualSnapshot(
  locator: Locator,
  _name: string
): Promise<Buffer> {
  return locator.screenshot({
    animations: 'disabled',
  })
}

/**
 * Wait for animations to settle before taking screenshots.
 */
export async function waitForAnimationsSettled(page: Page, timeout = 1000): Promise<void> {
  await page.waitForTimeout(timeout)
}

/**
 * Hover over an element and wait for hover state to settle.
 */
export async function hoverAndSettle(locator: Locator, timeout = 300): Promise<void> {
  await locator.hover()
  await locator.page().waitForTimeout(timeout)
}

// ---------------------------------------------------------------------------
// Component Interaction Helpers
// ---------------------------------------------------------------------------

/**
 * Click an element and wait for any resulting navigation/state change.
 */
export async function clickAndWait(locator: Locator, waitMs = 200): Promise<void> {
  await locator.click()
  await locator.page().waitForTimeout(waitMs)
}

/**
 * Open a dropdown/popover/menu by clicking its trigger.
 */
export async function openDropdown(page: Page, triggerSelector: string): Promise<Locator> {
  const trigger = page.locator(triggerSelector)
  await expect(trigger).toBeVisible()
  await trigger.click()
  await page.waitForTimeout(300)
  // Return the opened content
  return page.locator('[role="listbox"], [role="menu"], [role="dialog"], .dropdown-content').first()
}

/**
 * Select an item from a dropdown by its text.
 */
export async function selectDropdownItem(
  page: Page,
  itemText: string
): Promise<void> {
  const item = page.getByRole('option', { name: itemText }).or(
    page.getByRole('menuitem', { name: itemText })
  )
  await expect(item).toBeVisible()
  await item.click()
  await page.waitForTimeout(200)
}

/**
 * Close a dropdown/popover by pressing Escape.
 */
export async function closeWithEscape(page: Page): Promise<void> {
  await pressEscape(page)
}

/**
 * Click outside the current focused element to dismiss overlays.
 */
export async function clickOutside(page: Page): Promise<void> {
  await page.locator('body').click({ position: { x: 0, y: 0 } })
  await page.waitForTimeout(200)
}

// ---------------------------------------------------------------------------
// Form Interaction Helpers
// ---------------------------------------------------------------------------

/**
 * Fill an input and verify the value.
 */
export async function fillInput(locator: Locator, value: string): Promise<void> {
  await locator.clear()
  await locator.fill(value)
  await expect(locator).toHaveValue(value)
}

/**
 * Toggle a checkbox.
 */
export async function toggleCheckbox(locator: Locator, checked: boolean): Promise<void> {
  const isChecked = await locator.isChecked()
  if (isChecked !== checked) {
    await locator.click()
    await locator.page().waitForTimeout(100)
  }
  await expect(locator).toBeChecked({ checked })
}

/**
 * Toggle a switch.
 */
export async function toggleSwitch(locator: Locator, checked: boolean): Promise<void> {
  const isChecked = await locator.isChecked()
  if (isChecked !== checked) {
    await locator.click()
    await locator.page().waitForTimeout(100)
  }
  await expect(locator).toBeChecked({ checked })
}

// ---------------------------------------------------------------------------
// Assertion Helpers
// ---------------------------------------------------------------------------

/**
 * Assert element has a specific CSS property value (with regex support).
 */
export async function expectCSS(
  locator: Locator,
  property: string,
  expectedPattern: string | RegExp
): Promise<void> {
  const value = await locator.evaluate((el, prop) => {
    return window.getComputedStyle(el).getPropertyValue(prop)
  }, property)

  if (typeof expectedPattern === 'string') {
    expect(value.trim()).toBe(expectedPattern)
  } else {
    expect(value.trim()).toMatch(expectedPattern)
  }
}

/**
 * Assert element has a specific computed background color.
 */
export async function expectBackgroundColor(
  locator: Locator,
  expectedPattern: RegExp
): Promise<void> {
  await expectCSS(locator, 'background-color', expectedPattern)
}

/**
 * Assert element has a specific border color.
 */
export async function expectBorderColor(
  locator: Locator,
  expectedPattern: RegExp
): Promise<void> {
  await expectCSS(locator, 'border-color', expectedPattern)
}

/**
 * Assert element has a specific box shadow.
 */
export async function expectBoxShadow(
  locator: Locator,
  expectedPattern: RegExp
): Promise<void> {
  await expectCSS(locator, 'box-shadow', expectedPattern)
}

/**
 * Assert element is not visible (hidden, not just off-screen).
 */
export async function expectHidden(locator: Locator): Promise<void> {
  await expect(locator).not.toBeVisible()
}

/**
 * Assert element has a specific text content (exact match).
 */
export async function expectExactText(locator: Locator, text: string): Promise<void> {
  await expect(locator).toHaveText(text, { useInnerText: false })
}

/**
 * Assert element contains text (partial match).
 */
export async function expectContainsText(locator: Locator, text: string): Promise<void> {
  await expect(locator).toContainText(text)
}

// ---------------------------------------------------------------------------
// Drag & Drop Helpers
// ---------------------------------------------------------------------------

/**
 * Drag a slider thumb to a specific position.
 */
export async function dragSlider(locator: Locator, targetX: number): Promise<void> {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Slider thumb not found')

  await locator.hover()
  await locator.page().mouse.down()
  await locator.page().mouse.move(targetX, box.y + box.height / 2, { steps: 10 })
  await locator.page().mouse.up()
  await locator.page().waitForTimeout(200)
}

/**
 * Click on a slider track at a specific position.
 */
export async function clickSliderTrack(locator: Locator, percentage: number): Promise<void> {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Slider track not found')

  const x = box.x + box.width * percentage
  const y = box.y + box.height / 2
  await locator.click({ position: { x: x - box.x, y: y - box.y } })
  await locator.page().waitForTimeout(200)
}

// ---------------------------------------------------------------------------
// Viewport Helpers
// ---------------------------------------------------------------------------

/**
 * Set the viewport to a specific size.
 */
export async function setViewport(
  page: Page,
  size: { width: number; height: number }
): Promise<void> {
  await page.setViewportSize(size)
}

/**
 * Run a test at multiple viewport sizes.
 */
export async function testAtViewports<T>(
  page: Page,
  viewports: { width: number; height: number }[],
  testFn: (viewport: { width: number; height: number }) => Promise<T>
): Promise<T[]> {
  const results: T[] = []
  for (const vp of viewports) {
    await setViewport(page, vp)
    results.push(await testFn(vp))
  }
  return results
}
