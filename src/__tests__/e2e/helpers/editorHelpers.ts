import { Page } from '@playwright/test'

/**
 * Editor Helpers
 * Utilities for interacting with the Monaco editor
 */
export class EditorHelpers {
  /**
   * Wait for Monaco editor to be ready
   */
  static async waitForEditorReady(page: Page, timeout = 10000): Promise<void> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        const editorElement = await page.$('[data-testid="monaco-editor"]')
        if (editorElement) {
          // Editor element exists, now check if Monaco is actually loaded
          const isReady = await page.evaluate(() => {
            return (window as any).monaco !== undefined
          })

          if (isReady) {
            return
          }
        }
      } catch (error) {
        // Ignore errors during polling
      }

      await page.waitForTimeout(500)
    }

    throw new Error('Monaco editor failed to load within timeout')
  }

  /**
   * Get editor content
   */
  static async getEditorContent(page: Page): Promise<string> {
    await this.waitForEditorReady(page)

    const content = await page.evaluate(() => {
      const editors = (window as any).monaco?.editor?.getEditors?.()
      if (editors && editors.length > 0) {
        return editors[0].getValue()
      }
      return ''
    })

    return content || ''
  }

  /**
   * Set editor content
   */
  static async setEditorContent(page: Page, content: string): Promise<void> {
    await this.waitForEditorReady(page)

    await page.evaluate((newContent) => {
      const editors = (window as any).monaco?.editor?.getEditors?.()
      if (editors && editors.length > 0) {
        editors[0].setValue(newContent)
      }
    }, content)

    // Wait for validation to run (500ms debounce + some buffer)
    await page.waitForTimeout(600)
  }

  /**
   * Type content into editor
   */
  static async typeInEditor(page: Page, text: string): Promise<void> {
    await this.waitForEditorReady(page)

    const editorContainer = page.locator('[data-testid="monaco-editor"]')
    await editorContainer.click()

    // Select all existing content
    await page.keyboard.press('Control+A')

    // Type new content
    await page.keyboard.type(text, { delay: 10 })

    // Wait for validation
    await page.waitForTimeout(600)
  }

  /**
   * Clear editor content
   */
  static async clearEditor(page: Page): Promise<void> {
    await this.waitForEditorReady(page)

    const editorContainer = page.locator('[data-testid="monaco-editor"]')
    await editorContainer.click()

    await page.keyboard.press('Control+A')
    await page.keyboard.press('Delete')

    await page.waitForTimeout(600)
  }

  /**
   * Get current line count
   */
  static async getLineCount(page: Page): Promise<number> {
    const content = await this.getEditorContent(page)
    return content.split('\n').length
  }

  /**
   * Get diagnostics (errors/warnings)
   */
  static async getDiagnostics(page: Page): Promise<Array<{ severity: string; message: string; line: number }>> {
    const diagnostics = await page.evaluate(() => {
      const markers = (window as any).monaco?.editor?.getModelMarkers?.({})
      return (
        markers?.map((marker: any) => ({
          severity: marker.severity === 8 ? 'error' : marker.severity === 4 ? 'warning' : 'info',
          message: marker.message,
          line: marker.startLineNumber,
        })) || []
      )
    })

    return diagnostics || []
  }

  /**
   * Get error count from status bar
   */
  static async getErrorCount(page: Page): Promise<number> {
    const statusBar = await page.locator('[data-testid="editor-status-bar"]')

    if (!(await statusBar.isVisible())) {
      return 0
    }

    const text = await statusBar.textContent()
    const match = text?.match(/(\d+)\s+error/)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Get warning count from status bar
   */
  static async getWarningCount(page: Page): Promise<number> {
    const statusBar = await page.locator('[data-testid="editor-status-bar"]')

    if (!(await statusBar.isVisible())) {
      return 0
    }

    const text = await statusBar.textContent()
    const match = text?.match(/(\d+)\s+warning/)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Save file
   */
  static async saveFile(page: Page): Promise<void> {
    // Use Ctrl+S keyboard shortcut
    await page.keyboard.press('Control+S')

    // Wait for save to complete
    await page.waitForTimeout(500)
  }

  /**
   * Compile current file
   */
  static async compileFile(page: Page): Promise<void> {
    // Look for compile button
    const compileButton = page.locator('[data-testid="compile-button"]')

    if (await compileButton.isVisible()) {
      await compileButton.click()
    } else {
      // Fallback: use keyboard shortcut if available
      await page.keyboard.press('Control+Shift+B')
    }

    // Wait for compilation
    await page.waitForTimeout(1000)
  }

  /**
   * Check if compilation was successful
   */
  static async isCompilationSuccessful(page: Page): Promise<boolean> {
    const successMessage = page.locator('[data-testid="compilation-success"]')
    return await successMessage.isVisible()
  }

  /**
   * Wait for editor to have focus
   */
  static async waitForEditorFocus(page: Page): Promise<void> {
    const editorContainer = page.locator('[data-testid="monaco-editor"]')
    await editorContainer.click()
    await page.waitForTimeout(500)
  }
}
