/**
 * Page Object Models for JPE Studio Design System component testing.
 *
 * Each page object encapsulates selectors and interactions for a component,
 * providing a clean API for test files to use.
 */
import { type Page, type Locator, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Base Page Object
// ---------------------------------------------------------------------------

export class BasePageObject {
  constructor(protected page: Page) {}

  protected locator(selector: string): Locator {
    return this.page.locator(selector)
  }

  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId)
  }

  protected getByRole(role: string, options?: Record<string, unknown>): Locator {
    return this.page.getByRole(role as any, options as any)
  }
}

// ---------------------------------------------------------------------------
// Button Page Object
// ---------------------------------------------------------------------------

export class ButtonPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : 'button'
  }

  get button(): Locator {
    return this.locator(this.baseSelector)
  }

  get spinner(): Locator {
    return this.locator(`${this.baseSelector} [class*="animate-spin"]`)
  }

  async click(): Promise<void> {
    await this.button.click()
  }

  async hover(): Promise<void> {
    await this.button.hover()
    await this.page.waitForTimeout(300)
  }

  async focus(): Promise<void> {
    await this.button.focus()
  }

  async isDisabled(): Promise<boolean> {
    return this.button.isDisabled()
  }

  async isLoading(): Promise<boolean> {
    return this.spinner.isVisible().catch(() => false)
  }

  async getText(): Promise<string> {
    return this.button.textContent() || ''
  }

  async expectVisible(): Promise<void> {
    await expect(this.button).toBeVisible()
  }

  async expectNotVisible(): Promise<void> {
    await expect(this.button).not.toBeVisible()
  }

  async expectDisabled(): Promise<void> {
    await expect(this.button).toBeDisabled()
  }

  async expectEnabled(): Promise<void> {
    await expect(this.button).toBeEnabled()
  }

  async expectLoading(): Promise<void> {
    await expect(this.spinner).toBeVisible()
    await expect(this.button).toBeDisabled()
  }

  async expectHasClass(className: string): Promise<void> {
    await expect(this.button).toHaveClass(new RegExp(className))
  }
}

// ---------------------------------------------------------------------------
// Input Page Object
// ---------------------------------------------------------------------------

export class InputPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : 'input'
  }

  get input(): Locator {
    return this.locator(this.baseSelector)
  }

  get label(): Locator {
    return this.locator(`label[for="${this.baseSelector}"]`).or(
      this.page.locator(`label:has(+ ${this.baseSelector})`)
    )
  }

  get errorMessage(): Locator {
    return this.page.locator('[role="alert"], .error-message, [data-error]').first()
  }

  async fill(value: string): Promise<void> {
    await this.input.fill(value)
  }

  async clear(): Promise<void> {
    await this.input.clear()
  }

  async focus(): Promise<void> {
    await this.input.focus()
  }

  async blur(): Promise<void> {
    await this.input.blur()
  }

  async getValue(): Promise<string> {
    return this.input.inputValue()
  }

  async getPlaceholder(): Promise<string> {
    return this.input.getAttribute('placeholder') || ''
  }

  async expectHasValue(value: string): Promise<void> {
    await expect(this.input).toHaveValue(value)
  }

  async expectHasPlaceholder(placeholder: string): Promise<void> {
    await expect(this.input).toHaveAttribute('placeholder', placeholder)
  }

  async expectDisabled(): Promise<void> {
    await expect(this.input).toBeDisabled()
  }

  async expectFocused(): Promise<void> {
    await expect(this.input).toBeFocused()
  }

  async expectHasError(): Promise<void> {
    // Check for error styling or error message
    const hasErrorClass = await this.input.evaluate((el) =>
      el.className.includes('rose') || el.className.includes('error')
    )
    const hasErrorBorder = await this.input.evaluate((el) => {
      const borderColor = window.getComputedStyle(el).borderColor
      return borderColor.includes('252') || borderColor.includes('129') // rose color rgb
    })
    expect(hasErrorClass || hasErrorBorder).toBe(true)
  }
}

// ---------------------------------------------------------------------------
// Card Page Object
// ---------------------------------------------------------------------------

export class CardPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : '[role="article"], .card, [class*="Card"]'
  }

  get card(): Locator {
    return this.locator(this.baseSelector)
  }

  get header(): Locator {
    return this.card.locator('[class*="CardHeader"], [class*="card-header"]').first()
  }

  get content(): Locator {
    return this.card.locator('[class*="CardContent"], [class*="card-content"]').first()
  }

  get footer(): Locator {
    return this.card.locator('[class*="CardFooter"], [class*="card-footer"]').first()
  }

  get title(): Locator {
    return this.card.locator('[class*="CardTitle"], [class*="card-title"], h3').first()
  }

  async hover(): Promise<void> {
    await this.card.hover()
    await this.page.waitForTimeout(300)
  }

  async click(): Promise<void> {
    await this.card.click()
  }

  async expectVisible(): Promise<void> {
    await expect(this.card).toBeVisible()
  }

  async expectHasGlassBackground(): Promise<void> {
    const hasGlass = await this.card.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return (
        style.backdropFilter.includes('blur') ||
        style.webkitBackdropFilter?.includes('blur') ||
        style.backgroundColor.includes('rgba')
      )
    })
    expect(hasGlass).toBe(true)
  }
}

// ---------------------------------------------------------------------------
// Dropdown Page Object
// ---------------------------------------------------------------------------

export class DropdownPageObject extends BasePageObject {
  private triggerSelector: string

  constructor(page: Page, triggerTestId?: string) {
    super(page)
    this.triggerSelector = triggerTestId
      ? `[data-testid="${triggerTestId}"]`
      : '[role="combobox"], [class*="DropdownTrigger"], button:has-text("Select")'
  }

  get trigger(): Locator {
    return this.locator(this.triggerSelector)
  }

  get content(): Locator {
    return this.page.locator('[role="listbox"], [role="menu"], [class*="DropdownContent"]').first()
  }

  getItem(text: string): Locator {
    return this.page.getByRole('option', { name: text }).or(
      this.page.getByRole('menuitem', { name: text })
    )
  }

  get allItems(): Locator {
    return this.page.locator('[role="option"], [role="menuitem"]')
  }

  async open(): Promise<void> {
    await this.trigger.click()
    await this.page.waitForTimeout(300)
    await expect(this.content).toBeVisible()
  }

  async close(): Promise<void> {
    await this.page.keyboard.press('Escape')
    await this.page.waitForTimeout(200)
  }

  async selectItem(text: string): Promise<void> {
    await this.open()
    await this.getItem(text).click()
    await this.page.waitForTimeout(200)
  }

  async expectOpen(): Promise<void> {
    await expect(this.content).toBeVisible()
  }

  async expectClosed(): Promise<void> {
    await expect(this.content).not.toBeVisible()
  }

  async expectItemSelected(text: string): Promise<void> {
    await expect(this.trigger).toContainText(text)
  }
}

// ---------------------------------------------------------------------------
// Dialog Page Object
// ---------------------------------------------------------------------------

export class DialogPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get dialog(): Locator {
    return this.page.locator('[role="dialog"], [class*="DialogContent"]').first()
  }

  get overlay(): Locator {
    return this.page.locator('[role="presentation"], [class*="DialogOverlay"]').first()
  }

  get title(): Locator {
    return this.page.locator('[class*="DialogTitle"], [class*="dialog-title"]').first()
  }

  get description(): Locator {
    return this.page.locator('[class*="DialogDescription"], [class*="dialog-description"]').first()
  }

  get closeButton(): Locator {
    return this.dialog.locator('[class*="DialogClose"], button[aria-label*="Close"]').first()
  }

  async open(triggerSelector: string): Promise<void> {
    await this.page.locator(triggerSelector).click()
    await this.page.waitForTimeout(300)
    await expect(this.dialog).toBeVisible()
  }

  async close(): Promise<void> {
    await this.closeButton.click()
    await this.page.waitForTimeout(200)
  }

  async closeWithBackdrop(): Promise<void> {
    await this.overlay.click()
    await this.page.waitForTimeout(200)
  }

  async closeWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
    await this.page.waitForTimeout(200)
  }

  async expectOpen(): Promise<void> {
    await expect(this.dialog).toBeVisible()
  }

  async expectClosed(): Promise<void> {
    await expect(this.dialog).not.toBeVisible()
  }

  async expectTitle(text: string): Promise<void> {
    await expect(this.title).toContainText(text)
  }
}

// ---------------------------------------------------------------------------
// Tabs Page Object
// ---------------------------------------------------------------------------

export class TabsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get tabList(): Locator {
    return this.page.locator('[role="tablist"]').first()
  }

  get tabs(): Locator {
    return this.page.locator('[role="tab"]')
  }

  getTab(index: number): Locator {
    return this.tabs.nth(index)
  }

  getTabByName(name: string): Locator {
    return this.page.getByRole('tab', { name })
  }

  get tabPanels(): Locator {
    return this.page.locator('[role="tabpanel"]')
  }

  async selectTab(index: number): Promise<void> {
    await this.getTab(index).click()
    await this.page.waitForTimeout(200)
  }

  async selectTabByName(name: string): Promise<void> {
    await this.getTabByName(name).click()
    await this.page.waitForTimeout(200)
  }

  async expectActiveTab(index: number): Promise<void> {
    await expect(this.getTab(index)).toHaveAttribute('aria-selected', 'true')
  }

  async expectTabCount(count: number): Promise<void> {
    await expect(this.tabs).toHaveCount(count)
  }
}

// ---------------------------------------------------------------------------
// Slider Page Object
// ---------------------------------------------------------------------------

export class SliderPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : '[role="slider"]'
  }

  get slider(): Locator {
    return this.locator(this.baseSelector)
  }

  get thumb(): Locator {
    return this.slider
  }

  async getValue(): Promise<number> {
    const val = await this.slider.getAttribute('aria-valuenow')
    return parseFloat(val)
  }

  async getMin(): Promise<number> {
    const val = await this.slider.getAttribute('aria-valuemin')
    return parseFloat(val)
  }

  async getMax(): Promise<number> {
    const val = await this.slider.getAttribute('aria-valuemax')
    return parseFloat(val)
  }

  async setValue(value: number): Promise<void> {
    // Use keyboard arrows to adjust value
    const current = await this.getValue()
    const diff = value - current

    await this.slider.focus()
    const key = diff >= 0 ? 'ArrowRight' : 'ArrowLeft'
    for (let i = 0; i < Math.abs(diff); i++) {
      await this.page.keyboard.press(key)
      await this.page.waitForTimeout(30)
    }
  }

  async expectValue(value: number): Promise<void> {
    await expect(this.slider).toHaveAttribute('aria-valuenow', String(value))
  }
}

// ---------------------------------------------------------------------------
// Checkbox Page Object
// ---------------------------------------------------------------------------

export class CheckboxPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : '[type="checkbox"], [role="checkbox"]'
  }

  get checkbox(): Locator {
    return this.locator(this.baseSelector).first()
  }

  get label(): Locator {
    return this.checkbox.locator('+ label, + span, + [class*="Label"]').first()
  }

  async toggle(): Promise<void> {
    await this.checkbox.click()
    await this.page.waitForTimeout(100)
  }

  async isChecked(): Promise<boolean> {
    return this.checkbox.isChecked()
  }

  async expectChecked(): Promise<void> {
    await expect(this.checkbox).toBeChecked()
  }

  async expectUnchecked(): Promise<void> {
    await expect(this.checkbox).not.toBeChecked()
  }

  async expectIndeterminate(): Promise<void> {
    await expect(this.checkbox).toHaveAttribute('data-state', 'indeterminate')
  }

  async expectDisabled(): Promise<void> {
    await expect(this.checkbox).toBeDisabled()
  }
}

// ---------------------------------------------------------------------------
// Switch Page Object
// ---------------------------------------------------------------------------

export class SwitchPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : '[role="switch"]'
  }

  get switch(): Locator {
    return this.locator(this.baseSelector).first()
  }

  async toggle(): Promise<void> {
    await this.switch.click()
    await this.page.waitForTimeout(100)
  }

  async expectChecked(): Promise<void> {
    await expect(this.switch).toBeChecked()
  }

  async expectUnchecked(): Promise<void> {
    await expect(this.switch).not.toBeChecked()
  }

  async expectDisabled(): Promise<void> {
    await expect(this.switch).toBeDisabled()
  }
}

// ---------------------------------------------------------------------------
// Select Page Object
// ---------------------------------------------------------------------------

export class SelectPageObject extends BasePageObject {
  private triggerSelector: string

  constructor(page: Page, triggerTestId?: string) {
    super(page)
    this.triggerSelector = triggerTestId
      ? `[data-testid="${triggerTestId}"]`
      : '[role="combobox"]'
  }

  get trigger(): Locator {
    return this.locator(this.triggerSelector).first()
  }

  get content(): Locator {
    return this.page.locator('[role="listbox"]').first()
  }

  get options(): Locator {
    return this.page.locator('[role="option"]')
  }

  getOption(text: string): Locator {
    return this.page.getByRole('option', { name: text })
  }

  async open(): Promise<void> {
    await this.trigger.click()
    await this.page.waitForTimeout(300)
    await expect(this.content).toBeVisible()
  }

  async close(): Promise<void> {
    await this.page.keyboard.press('Escape')
    await this.page.waitForTimeout(200)
  }

  async selectOption(text: string): Promise<void> {
    await this.open()
    await this.getOption(text).click()
    await this.page.waitForTimeout(200)
  }

  async expectOpen(): Promise<void> {
    await expect(this.content).toBeVisible()
  }

  async expectClosed(): Promise<void> {
    await expect(this.content).not.toBeVisible()
  }
}

// ---------------------------------------------------------------------------
// Toast/Notification Page Object
// ---------------------------------------------------------------------------

export class NotificationPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get notifications(): Locator {
    return this.page.locator('[role="status"], [role="alert"], [class*="Notification"], [class*="Toast"]').first()
  }

  getNotification(type: string): Locator {
    return this.page.locator(`[data-type="${type}"], [class*="${type}"]`).first()
  }

  getDismissButton(notification: Locator): Locator {
    return notification.locator('button[aria-label*="Dismiss"], button[aria-label*="Close"], [class*="dismiss"]').first()
  }

  async dismiss(type: string): Promise<void> {
    const notification = this.getNotification(type)
    const dismissBtn = this.getDismissButton(notification)
    await dismissBtn.click()
    await this.page.waitForTimeout(300)
  }

  async expectVisible(type: string): Promise<void> {
    await expect(this.getNotification(type)).toBeVisible()
  }

  async expectNotVisible(type: string): Promise<void> {
    await expect(this.getNotification(type)).not.toBeVisible()
  }
}

// ---------------------------------------------------------------------------
// Graph Viewer Page Object
// ---------------------------------------------------------------------------

export class GraphViewerPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get graphContainer(): Locator {
    return this.page.locator('[class*="GraphViewer"], [class*="graph-viewer"], svg').first()
  }

  get nodes(): Locator {
    return this.page.locator('[class*="GraphNode"], [class*="graph-node"], circle')
  }

  get edges(): Locator {
    return this.page.locator('[class*="GraphEdge"], [class*="graph-edge"], line, path')
  }

  getNode(index: number): Locator {
    return this.nodes.nth(index)
  }

  async expectNodeCount(count: number): Promise<void> {
    await expect(this.nodes).toHaveCount(count)
  }

  async selectNode(index: number): Promise<void> {
    await this.getNode(index).click()
    await this.page.waitForTimeout(200)
  }

  async expectHasGrid(): Promise<void> {
    const hasGrid = await this.graphContainer.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.backgroundImage?.includes('gradient') || style.backgroundImage?.includes('linear')
    })
    expect(hasGrid).toBe(true)
  }
}

// ---------------------------------------------------------------------------
// Sidebar Page Object
// ---------------------------------------------------------------------------

export class SidebarPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get sidebar(): Locator {
    return this.page.locator('[class*="Sidebar"], [class*="sidebar"], aside').first()
  }

  get navItems(): Locator {
    return this.sidebar.locator('[role="treeitem"], [role="menuitem"], a, button')
  }

  getNavItem(text: string): Locator {
    return this.sidebar.getByRole('link', { name: text }).or(
      this.sidebar.getByRole('button', { name: text })
    )
  }

  async toggle(): Promise<void> {
    const toggleBtn = this.page.locator('[class*="SidebarToggle"], [class*="sidebar-toggle"], button').first()
    await toggleBtn.click()
    await this.page.waitForTimeout(300)
  }

  async navigateTo(text: string): Promise<void> {
    await this.getNavItem(text).click()
    await this.page.waitForTimeout(200)
  }

  async expectOpen(): Promise<void> {
    await expect(this.sidebar).toBeVisible()
  }

  async expectClosed(): Promise<void> {
    await expect(this.sidebar).not.toBeVisible()
  }

  async expectActiveItem(text: string): Promise<void> {
    const item = this.getNavItem(text)
    await expect(item).toHaveAttribute('aria-current', 'page').or(
      expect(item).toHaveClass(/active|current/)
    )
  }
}

// ---------------------------------------------------------------------------
// Tooltip Page Object
// ---------------------------------------------------------------------------

export class TooltipPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get tooltip(): Locator {
    return this.page.locator('[role="tooltip"], [class*="TooltipContent"], [class*="tooltip"]').first()
  }

  async showOnHover(triggerSelector: string): Promise<void> {
    await this.page.locator(triggerSelector).hover()
    await this.page.waitForTimeout(500) // Wait for delay
    await expect(this.tooltip).toBeVisible()
  }

  async hideOnMouseLeave(triggerSelector: string): Promise<void> {
    await this.page.locator(triggerSelector).hover()
    await this.page.waitForTimeout(500)
    await this.page.mouse.move(0, 0)
    await this.page.waitForTimeout(300)
    await expect(this.tooltip).not.toBeVisible()
  }

  async expectContent(text: string): Promise<void> {
    await expect(this.tooltip).toContainText(text)
  }
}

// ---------------------------------------------------------------------------
// Accordion Page Object
// ---------------------------------------------------------------------------

export class AccordionPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get items(): Locator {
    return this.page.locator('[class*="AccordionItem"], [class*="accordion-item"]').first()
  }

  get triggers(): Locator {
    return this.page.locator('[class*="AccordionTrigger"], [class*="accordion-trigger"]')
  }

  get contents(): Locator {
    return this.page.locator('[class*="AccordionContent"], [class*="accordion-content"]')
  }

  getTrigger(index: number): Locator {
    return this.triggers.nth(index)
  }

  getContent(index: number): Locator {
    return this.contents.nth(index)
  }

  async toggleItem(index: number): Promise<void> {
    await this.getTrigger(index).click()
    await this.page.waitForTimeout(300)
  }

  async expectExpanded(index: number): Promise<void> {
    await expect(this.getTrigger(index)).toHaveAttribute('aria-expanded', 'true')
  }

  async expectCollapsed(index: number): Promise<void> {
    await expect(this.getTrigger(index)).toHaveAttribute('aria-expanded', 'false')
  }
}

// ---------------------------------------------------------------------------
// Table Page Object
// ---------------------------------------------------------------------------

export class TablePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get table(): Locator {
    return this.page.locator('table, [class*="DataTable"], [class*="data-table"]').first()
  }

  get headers(): Locator {
    return this.table.locator('th')
  }

  get rows(): Locator {
    return this.table.locator('tbody tr')
  }

  getRow(index: number): Locator {
    return this.rows.nth(index)
  }

  getCell(rowIndex: number, colIndex: number): Locator {
    return this.rows.nth(rowIndex).locator('td').nth(colIndex)
  }

  async expectRowCount(count: number): Promise<void> {
    await expect(this.rows).toHaveCount(count)
  }

  async expectHeaderCount(count: number): Promise<void> {
    await expect(this.headers).toHaveCount(count)
  }

  async expectCellText(rowIndex: number, colIndex: number, text: string): Promise<void> {
    await expect(this.getCell(rowIndex, colIndex)).toContainText(text)
  }

  async sortColumn(colIndex: number): Promise<void> {
    await this.headers.nth(colIndex).click()
    await this.page.waitForTimeout(200)
  }

  async hoverRow(index: number): Promise<void> {
    await this.getRow(index).hover()
    await this.page.waitForTimeout(300)
  }
}

// ---------------------------------------------------------------------------
// Calendar Page Object
// ---------------------------------------------------------------------------

export class CalendarPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get calendar(): Locator {
    return this.page.locator('[role="grid"], [class*="Calendar"]').first()
  }

  get days(): Locator {
    return this.page.locator('[role="gridcell"], button[aria-label*="202"], button[aria-label*="2025"], button[aria-label*="2026"]')
  }

  get today(): Locator {
    return this.page.locator('[aria-label*="today"], [class*="today"]').first()
  }

  get prevMonthBtn(): Locator {
    return this.page.locator('button[aria-label*="Previous"], button:has-text("<")').first()
  }

  get nextMonthBtn(): Locator {
    return this.page.locator('button[aria-label*="Next"], button:has-text(">")').first()
  }

  async selectDate(dateText: string): Promise<void> {
    await this.page.getByRole('gridcell', { name: dateText }).or(
      this.page.locator(`button:has-text("${dateText}")`).first()
    ).click()
    await this.page.waitForTimeout(200)
  }

  async navigatePrevMonth(): Promise<void> {
    await this.prevMonthBtn.click()
    await this.page.waitForTimeout(200)
  }

  async navigateNextMonth(): Promise<void> {
    await this.nextMonthBtn.click()
    await this.page.waitForTimeout(200)
  }
}

// ---------------------------------------------------------------------------
// Breadcrumb Page Object
// ---------------------------------------------------------------------------

export class BreadcrumbPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get breadcrumb(): Locator {
    return this.page.locator('[aria-label="Breadcrumb"], [class*="Breadcrumb"], nav').first()
  }

  get items(): Locator {
    return this.breadcrumb.locator('a, [role="link"], li')
  }

  get separators(): Locator {
    return this.breadcrumb.locator('[class*="separator"], svg, span:has-text("/")')
  }

  getItem(index: number): Locator {
    return this.items.nth(index)
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.items).toHaveCount(count)
  }

  async clickItem(index: number): Promise<void> {
    const item = this.getItem(index).locator('a').or(this.getItem(index))
    await item.click()
    await this.page.waitForTimeout(200)
  }
}

// ---------------------------------------------------------------------------
// Pagination Page Object
// ---------------------------------------------------------------------------

export class PaginationPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get pagination(): Locator {
    return this.page.locator('[class*="Pagination"], nav[aria-label*="Pagination"]').first()
  }

  get pages(): Locator {
    return this.page.locator('[role="link"], [class*="PaginationLink"], button')
  }

  get prevBtn(): Locator {
    return this.page.locator('button[aria-label*="Previous"], [class*="prev"]').first()
  }

  get nextBtn(): Locator {
    return this.page.locator('button[aria-label*="Next"], [class*="next"]').first()
  }

  async goToPage(pageNum: number): Promise<void> {
    await this.page.getByRole('link', { name: String(pageNum) }).or(
      this.page.locator(`button:has-text("${pageNum}")`).or(
        this.page.locator(`a:has-text("${pageNum}")`)
      )
    ).first().click()
    await this.page.waitForTimeout(200)
  }

  async goPrev(): Promise<void> {
    await this.prevBtn.click()
    await this.page.waitForTimeout(200)
  }

  async goNext(): Promise<void> {
    await this.nextBtn.click()
    await this.page.waitForTimeout(200)
  }

  async expectActivePage(pageNum: number): Promise<void> {
    const activeLink = this.page.getByRole('link', { name: String(pageNum) }).or(
      this.page.locator(`[aria-current="page"]`)
    )
    await expect(activeLink).toBeVisible()
  }
}

// ---------------------------------------------------------------------------
// Context Menu Page Object
// ---------------------------------------------------------------------------

export class ContextMenuPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get menu(): Locator {
    return this.page.locator('[role="menu"], [class*="ContextMenuContent"]').first()
  }

  get items(): Locator {
    return this.menu.locator('[role="menuitem"]')
  }

  getItem(text: string): Locator {
    return this.page.getByRole('menuitem', { name: text })
  }

  async openAt(x: number, y: number): Promise<void> {
    await this.page.mouse.move(x, y)
    await this.page.mouse.click(x, y, { button: 'right' })
    await this.page.waitForTimeout(300)
    await expect(this.menu).toBeVisible()
  }

  async selectItem(text: string): Promise<void> {
    await this.getItem(text).click()
    await this.page.waitForTimeout(200)
  }

  async close(): Promise<void> {
    await this.page.keyboard.press('Escape')
    await this.page.waitForTimeout(200)
  }

  async expectOpen(): Promise<void> {
    await expect(this.menu).toBeVisible()
  }

  async expectClosed(): Promise<void> {
    await expect(this.menu).not.toBeVisible()
  }
}

// ---------------------------------------------------------------------------
// Popover Page Object
// ---------------------------------------------------------------------------

export class PopoverPageObject extends BasePageObject {
  private triggerSelector: string

  constructor(page: Page, triggerTestId?: string) {
    super(page)
    this.triggerSelector = triggerTestId
      ? `[data-testid="${triggerTestId}"]`
      : '[class*="PopoverTrigger"], button'
  }

  get trigger(): Locator {
    return this.locator(this.triggerSelector).first()
  }

  get content(): Locator {
    return this.page.locator('[role="dialog"], [class*="PopoverContent"]').first()
  }

  async open(): Promise<void> {
    await this.trigger.click()
    await this.page.waitForTimeout(300)
    await expect(this.content).toBeVisible()
  }

  async close(): Promise<void> {
    await this.page.keyboard.press('Escape')
    await this.page.waitForTimeout(200)
  }

  async closeWithOutsideClick(): Promise<void> {
    await this.page.locator('body').click({ position: { x: 10, y: 10 } })
    await this.page.waitForTimeout(200)
  }

  async expectOpen(): Promise<void> {
    await expect(this.content).toBeVisible()
  }

  async expectClosed(): Promise<void> {
    await expect(this.content).not.toBeVisible()
  }
}

// ---------------------------------------------------------------------------
// Sheet Page Object
// ---------------------------------------------------------------------------

export class SheetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get sheet(): Locator {
    return this.page.locator('[class*="SheetContent"], [role="dialog"]').first()
  }

  get overlay(): Locator {
    return this.page.locator('[class*="SheetOverlay"], [class*="overlay"]').first()
  }

  async open(triggerSelector: string): Promise<void> {
    await this.page.locator(triggerSelector).click()
    await this.page.waitForTimeout(300)
    await expect(this.sheet).toBeVisible()
  }

  async close(): Promise<void> {
    await this.page.keyboard.press('Escape')
    await this.page.waitForTimeout(200)
  }

  async closeWithBackdrop(): Promise<void> {
    await this.overlay.click()
    await this.page.waitForTimeout(200)
  }

  async expectOpen(): Promise<void> {
    await expect(this.sheet).toBeVisible()
  }

  async expectClosed(): Promise<void> {
    await expect(this.sheet).not.toBeVisible()
  }
}

// ---------------------------------------------------------------------------
// Command Palette Page Object
// ---------------------------------------------------------------------------

export class CommandPalettePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get dialog(): Locator {
    return this.page.locator('[role="dialog"], [class*="CommandDialog"]').first()
  }

  get input(): Locator {
    return this.page.locator('[placeholder], input[type="text"]').first()
  }

  get items(): Locator {
    return this.page.locator('[role="option"], [cmdk-item], [class*="CommandItem"]')
  }

  async open(): Promise<void> {
    await this.page.keyboard.press('Control+K')
    await this.page.waitForTimeout(300)
    await expect(this.dialog).toBeVisible()
  }

  async close(): Promise<void> {
    await this.page.keyboard.press('Escape')
    await this.page.waitForTimeout(200)
  }

  async search(query: string): Promise<void> {
    await this.input.fill(query)
    await this.page.waitForTimeout(300)
  }

  async selectFirstItem(): Promise<void> {
    await this.page.keyboard.press('Enter')
    await this.page.waitForTimeout(200)
  }

  async navigateDown(count: number = 1): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.page.keyboard.press('ArrowDown')
      await this.page.waitForTimeout(50)
    }
  }

  async expectOpen(): Promise<void> {
    await expect(this.dialog).toBeVisible()
  }

  async expectClosed(): Promise<void> {
    await expect(this.dialog).not.toBeVisible()
  }

  async expectResultCount(count: number): Promise<void> {
    await expect(this.items).toHaveCount(count)
  }
}

// ---------------------------------------------------------------------------
// Radio Group Page Object
// ---------------------------------------------------------------------------

export class RadioGroupPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get group(): Locator {
    return this.page.locator('[role="radiogroup"]').first()
  }

  get options(): Locator {
    return this.page.locator('[role="radio"]')
  }

  getOption(label: string): Locator {
    return this.page.locator(`label:has-text("${label}")`).or(
      this.page.getByRole('radio', { name: label })
    )
  }

  async selectOption(label: string): Promise<void> {
    await this.getOption(label).click()
    await this.page.waitForTimeout(100)
  }

  async expectSelected(label: string): Promise<void> {
    await expect(this.getOption(label)).toBeChecked()
  }

  async expectDisabled(label: string): Promise<void> {
    await expect(this.getOption(label)).toBeDisabled()
  }
}

// ---------------------------------------------------------------------------
// Toggle Group Page Object
// ---------------------------------------------------------------------------

export class ToggleGroupPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get group(): Locator {
    return this.page.locator('[role="group"], [class*="ToggleGroup"]').first()
  }

  get toggles(): Locator {
    return this.group.locator('[role="switch"], [class*="Toggle"], button')
  }

  getToggle(label: string): Locator {
    return this.page.getByRole('button', { name: label })
  }

  async toggleItem(label: string): Promise<void> {
    await this.getToggle(label).click()
    await this.page.waitForTimeout(100)
  }

  async expectPressed(label: string): Promise<void> {
    await expect(this.getToggle(label)).toHaveAttribute('aria-pressed', 'true')
  }

  async expectNotPressed(label: string): Promise<void> {
    await expect(this.getToggle(label)).toHaveAttribute('aria-pressed', 'false')
  }
}

// ---------------------------------------------------------------------------
// Progress Bar Page Object
// ---------------------------------------------------------------------------

export class ProgressBarPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : '[role="progressbar"]'
  }

  get progressBar(): Locator {
    return this.locator(this.baseSelector).first()
  }

  async getValue(): Promise<number> {
    const val = await this.progressBar.getAttribute('aria-valuenow')
    return parseFloat(val || '0')
  }

  async expectValue(value: number): Promise<void> {
    await expect(this.progressBar).toHaveAttribute('aria-valuenow', String(value))
  }

  async expectLabel(label: string): Promise<void> {
    await expect(this.progressBar).toContainText(label)
  }
}

// ---------------------------------------------------------------------------
// Skeleton Page Object
// ---------------------------------------------------------------------------

export class SkeletonPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : '[class*="Skeleton"], [class*="skeleton"]'
  }

  get skeleton(): Locator {
    return this.locator(this.baseSelector).first()
  }

  async expectVisible(): Promise<void> {
    await expect(this.skeleton).toBeVisible()
  }

  async expectHasPulseAnimation(): Promise<void> {
    const hasAnimation = await this.skeleton.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return (
        style.animationName?.includes('pulse') ||
        style.animationName?.includes('shimmer') ||
        style.animation !== 'none'
      )
    })
    expect(hasAnimation).toBe(true)
  }

  async expectRounded(): Promise<void> {
    const borderRadius = await this.skeleton.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius
    })
    expect(borderRadius).not.toBe('0px')
  }
}

// ---------------------------------------------------------------------------
// Badge Page Object
// ---------------------------------------------------------------------------

export class BadgePageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : '[class*="Badge"], [class*="badge"]'
  }

  get badge(): Locator {
    return this.locator(this.baseSelector).first()
  }

  async expectVisible(): Promise<void> {
    await expect(this.badge).toBeVisible()
  }

  async expectText(text: string): Promise<void> {
    await expect(this.badge).toHaveText(text)
  }

  async expectHasColor(colorClass: string): Promise<void> {
    await expect(this.badge).toHaveClass(new RegExp(colorClass))
  }
}

// ---------------------------------------------------------------------------
// Spinner Page Object
// ---------------------------------------------------------------------------

export class SpinnerPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : '[class*="Spinner"], [class*="spinner"], svg[class*="animate-spin"]'
  }

  get spinner(): Locator {
    return this.locator(this.baseSelector).first()
  }

  async expectVisible(): Promise<void> {
    await expect(this.spinner).toBeVisible()
  }

  async expectHasAnimation(): Promise<void> {
    const hasAnimation = await this.spinner.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return (
        style.animationName?.includes('spin') ||
        style.animation !== 'none'
      )
    })
    expect(hasAnimation).toBe(true)
  }
}

// ---------------------------------------------------------------------------
// Status Dot Page Object
// ---------------------------------------------------------------------------

export class StatusDotPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : '[class*="StatusDot"], [class*="status-dot"], [class*="GlowDot"]'
  }

  get dot(): Locator {
    return this.locator(this.baseSelector).first()
  }

  async expectVisible(): Promise<void> {
    await expect(this.dot).toBeVisible()
  }

  async expectColor(color: string): Promise<void> {
    await expect(this.dot).toHaveClass(new RegExp(color))
  }

  async expectPulse(): Promise<void> {
    const hasAnimation = await this.dot.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return (
        style.animationName?.includes('pulse') ||
        style.animation?.includes('pulse') ||
        style.animation !== 'none'
      )
    })
    expect(hasAnimation).toBe(true)
  }
}

// ---------------------------------------------------------------------------
// Alert Page Object
// ---------------------------------------------------------------------------

export class AlertPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : '[role="alert"], [class*="Alert"]'
  }

  get alert(): Locator {
    return this.locator(this.baseSelector).first()
  }

  get title(): Locator {
    return this.alert.locator('[class*="AlertTitle"], [class*="alert-title"], strong').first()
  }

  get dismissBtn(): Locator {
    return this.alert.locator('button[aria-label*="Dismiss"], button[aria-label*="Close"]').first()
  }

  async dismiss(): Promise<void> {
    await this.dismissBtn.click()
    await this.page.waitForTimeout(300)
  }

  async expectVisible(): Promise<void> {
    await expect(this.alert).toBeVisible()
  }

  async expectNotVisible(): Promise<void> {
    await expect(this.alert).not.toBeVisible()
  }

  async expectTitle(text: string): Promise<void> {
    await expect(this.title).toContainText(text)
  }

  async expectVariant(variant: string): Promise<void> {
    await expect(this.alert).toHaveClass(new RegExp(variant))
  }
}

// ---------------------------------------------------------------------------
// Textarea Page Object
// ---------------------------------------------------------------------------

export class TextareaPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : 'textarea'
  }

  get textarea(): Locator {
    return this.locator(this.baseSelector).first()
  }

  async fill(value: string): Promise<void> {
    await this.textarea.fill(value)
  }

  async clear(): Promise<void> {
    await this.textarea.clear()
  }

  async focus(): Promise<void> {
    await this.textarea.focus()
  }

  async expectHasValue(value: string): Promise<void> {
    await expect(this.textarea).toHaveValue(value)
  }

  async expectDisabled(): Promise<void> {
    await expect(this.textarea).toBeDisabled()
  }
}

// ---------------------------------------------------------------------------
// Form Field Page Object
// ---------------------------------------------------------------------------

export class FormFieldPageObject extends BasePageObject {
  private baseSelector: string

  constructor(page: Page, testId?: string) {
    super(page)
    this.baseSelector = testId ? `[data-testid="${testId}"]` : '[class*="FormField"], [class*="form-field"]'
  }

  get field(): Locator {
    return this.locator(this.baseSelector).first()
  }

  get label(): Locator {
    return this.field.locator('label, [class*="Label"]').first()
  }

  get errorMessage(): Locator {
    return this.field.locator('[class*="error"], [class*="Error"], [role="alert"]').first()
  }

  get helpText(): Locator {
    return this.field.locator('[class*="help"], [class*="Help"], [class*="description"]').first()
  }

  async expectHasLabel(text: string): Promise<void> {
    await expect(this.label).toContainText(text)
  }

  async expectHasError(text: string): Promise<void> {
    await expect(this.errorMessage).toContainText(text)
  }

  async expectHasHelpText(text: string): Promise<void> {
    await expect(this.helpText).toContainText(text)
  }

  async expectRequired(): Promise<void> {
    const input = this.field.locator('input, select, textarea').first()
    await expect(input).toHaveAttribute('required')
  }
}

// ---------------------------------------------------------------------------
// Navigation Menu Page Object
// ---------------------------------------------------------------------------

export class NavigationMenuPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get menu(): Locator {
    return this.page.locator('[role="menubar"], [role="navigation"], [class*="NavMenu"]').first()
  }

  get items(): Locator {
    return this.page.locator('[role="menuitem"], [role="menuitemradio"], [class*="NavItem"]')
  }

  getItem(text: string): Locator {
    return this.page.getByRole('menuitem', { name: text })
  }

  async hoverItem(text: string): Promise<void> {
    await this.getItem(text).hover()
    await this.page.waitForTimeout(300)
  }

  async clickItem(text: string): Promise<void> {
    await this.getItem(text).click()
    await this.page.waitForTimeout(200)
  }

  async expectActiveItem(text: string): Promise<void> {
    const item = this.getItem(text)
    await expect(item).toHaveAttribute('aria-current', 'page').or(
      expect(item).toHaveClass(/active/)
    )
  }
}

// ---------------------------------------------------------------------------
// Hover Card Page Object
// ---------------------------------------------------------------------------

export class HoverCardPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page)
  }

  get content(): Locator {
    return this.page.locator('[class*="HoverCardContent"], [class*="hover-card"]').first()
  }

  async showOnHover(triggerSelector: string): Promise<void> {
    await this.page.locator(triggerSelector).hover()
    await this.page.waitForTimeout(700) // Wait for hover delay
    await expect(this.content).toBeVisible()
  }

  async hideOnMouseLeave(triggerSelector: string): Promise<void> {
    await this.page.locator(triggerSelector).hover()
    await this.page.waitForTimeout(700)
    await this.page.mouse.move(0, 0)
    await this.page.waitForTimeout(300)
    await expect(this.content).not.toBeVisible()
  }

  async expectContent(text: string): Promise<void> {
    await expect(this.content).toContainText(text)
  }
}
