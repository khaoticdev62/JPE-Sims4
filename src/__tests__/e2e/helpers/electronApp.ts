import { Page, Browser } from '@playwright/test'

/**
 * Electron App Helper (Web Version)
 * Tests the React app through the Vite dev server
 * The web server is configured in playwright.config.ts
 */
export class ElectronApp {
  private page: Page | null = null
  private isReady = false

  /**
   * Launch the application (connects to running dev server)
   */
  async launch(): Promise<Page> {
    // Page is provided by Playwright test context
    // We get it through the test fixture
    console.log('Waiting for application to be available...')

    // Note: In actual test execution, the page is passed through test fixtures
    // For now, we'll wait for the page to be available
    await new Promise((resolve) => {
      setTimeout(resolve, 500)
    })

    this.isReady = true
    console.log('Application is ready')

    if (!this.page) {
      throw new Error('Application page not available')
    }

    return this.page
  }

  /**
   * Set the page (called from test context)
   */
  setPage(page: Page): void {
    this.page = page
  }

  /**
   * Get the current page
   */
  getPage(): Page {
    if (!this.page) {
      throw new Error('Application not launched')
    }
    return this.page
  }

  /**
   * Close the application
   */
  async close(): Promise<void> {
    if (this.page) {
      try {
        await this.page.close()
      } catch (error) {
        // Page might already be closed
      }
    }

    this.page = null
    this.isReady = false

    console.log('Application closed')
  }
}
