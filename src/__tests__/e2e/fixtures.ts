/**
 * Playwright test fixtures and setup utilities for JPE Studio Design System.
 *
 * Provides extended fixtures with component-specific helpers,
 * common setup routines, and reusable test utilities.
 */

import { test as base, expect, type Page, type Locator } from '@playwright/test'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComponentFixture {
  page: Page
  /** Navigate to a component showcase page */
  gotoComponent: (componentPath: string) => Promise<void>
  /** Wait for a component to be fully rendered */
  waitForComponent: (selector: string) => Promise<Locator>
  /** Take a component screenshot for visual comparison */
  screenshotComponent: (selector: string, options?: { path?: string }) => Promise<Buffer>
}

export interface FormFixture {
  page: Page
  /** Fill a form field by label */
  fillField: (label: string, value: string) => Promise<void>
  /** Submit a form */
  submitForm: () => Promise<void>
  /** Get form validation state */
  getValidationState: () => Promise<{ isValid: boolean; errors: string[] }>
}

// ---------------------------------------------------------------------------
// Extended test with custom fixtures
// ---------------------------------------------------------------------------

export const test = base.extend<{
  component: ComponentFixture
  form: FormFixture
}>({
  page: async ({ page }, use) => {
    // Globally skip onboarding tour to prevent modal overlay blocks in ALL tests
    await page.addInitScript(() => {
      window.localStorage.setItem('jpe-onboarding-completed', 'true');
    });
    await use(page);
  },

  component: async ({ page }, use) => {
    const fixture: ComponentFixture = {
      page,
      gotoComponent: async (componentPath: string) => {
        // Skip onboarding tour to prevent modal overlay blocks
        await page.addInitScript(() => {
          window.localStorage.setItem('jpe-onboarding-completed', 'true');
        });
        
        // Support both `/components/...` and `/storybook/...` routes
        await page.goto(componentPath, { waitUntil: 'domcontentloaded', timeout: 30000 })
        // Wait for the main content area to be ready
        await page.waitForSelector('[data-testid="component-showcase"], body', {
          timeout: 10000,
        })
      },
      waitForComponent: async (selector: string) => {
        const locator = page.locator(selector)
        await expect(locator).toBeVisible({ timeout: 5000 })
        return locator
      },
      screenshotComponent: async (selector: string, options?: { path?: string }) => {
        const locator = page.locator(selector)
        return locator.screenshot(options)
      },
    }
    await use(fixture)
  },

  form: async ({ page }, use) => {
    const fixture: FormFixture = {
      page,
      fillField: async (label: string, value: string) => {
        const input = page.getByLabel(label)
        await input.fill(value)
      },
      submitForm: async () => {
        await page.keyboard.press('Enter')
      },
      getValidationState: async () => {
        const errors = await page.locator('[role="alert"], .error-message, [data-error]').all()
        const errorTexts = await Promise.all(errors.map((e) => e.textContent()))
        return {
          isValid: errorTexts.filter(Boolean).length === 0,
          errors: errorTexts.filter(Boolean) as string[],
        }
      },
    }
    await use(fixture)
  },
})

export { expect }

// ---------------------------------------------------------------------------
// Common component selectors / data-testid constants
// ---------------------------------------------------------------------------

export const TestIds = {
  // Buttons
  button: 'button',
  buttonPrimary: 'button-primary',
  buttonSecondary: 'button-secondary',
  buttonGhost: 'button-ghost',
  buttonDanger: 'button-danger',
  buttonSuccess: 'button-success',
  buttonIcon: 'button-icon',

  // Inputs
  input: 'input',
  inputField: 'input-field',
  inputError: 'input-error',
  inputLabel: 'input-label',

  // Cards
  card: 'card',
  cardHeader: 'card-header',
  cardContent: 'card-content',
  cardFooter: 'card-footer',

  // Dropdowns
  dropdown: 'dropdown',
  dropdownTrigger: 'dropdown-trigger',
  dropdownContent: 'dropdown-content',
  dropdownItem: 'dropdown-item',

  // Dialogs
  dialog: 'dialog',
  dialogOverlay: 'dialog-overlay',
  dialogTitle: 'dialog-title',
  dialogContent: 'dialog-content',
  dialogClose: 'dialog-close',

  // Navigation
  sidebar: 'sidebar',
  tab: 'tab',
  tabList: 'tab-list',
  tabPanel: 'tab-panel',
  breadcrumb: 'breadcrumb',

  // Status
  statusDot: 'status-dot',
  statusBadge: 'status-badge',
  progressBar: 'progress-bar',

  // Notifications
  notification: 'notification',
  notificationDismiss: 'notification-dismiss',

  // Loading
  spinner: 'spinner',
  skeleton: 'skeleton',

  // Form
  formField: 'form-field',
  formError: 'form-error',
  checkbox: 'checkbox',
  switch: 'switch',
  slider: 'slider',
  select: 'select',
  textarea: 'textarea',
  radioGroup: 'radio-group',
  toggleGroup: 'toggle-group',

  // Data display
  table: 'table',
  tableRow: 'table-row',
  tableCell: 'table-cell',
  badge: 'badge',
  alert: 'alert',
  tooltip: 'tooltip',
  popover: 'popover',
  accordion: 'accordion',
  accordionItem: 'accordion-item',
  accordionTrigger: 'accordion-trigger',
  accordionContent: 'accordion-content',

  // Overlays
  sheet: 'sheet',
  contextMenu: 'context-menu',
  hoverCard: 'hover-card',
  commandPalette: 'command-palette',
  calendar: 'calendar',
  pagination: 'pagination',
} as const

// ---------------------------------------------------------------------------
// Keyboard shortcut helpers
// ---------------------------------------------------------------------------

export const Keys = {
  Tab: 'Tab',
  Enter: 'Enter',
  Escape: 'Escape',
  Space: ' ',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Backspace: 'Backspace',
  Delete: 'Delete',
  Home: 'Home',
  End: 'End',
} as const

// ---------------------------------------------------------------------------
// Viewport presets
// ---------------------------------------------------------------------------

export const Viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  wide: { width: 1920, height: 1080 },
} as const
