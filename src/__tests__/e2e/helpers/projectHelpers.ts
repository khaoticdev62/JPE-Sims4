import { Page } from '@playwright/test'
import { readFileSync } from 'fs'
import path from 'path'
import os from 'os'
import { existsSync, mkdirSync, rmSync } from 'fs'

/**
 * Project Helpers
 * Utilities for creating, managing, and cleaning up test projects
 */
export class ProjectHelpers {
  /**
   * Create a temporary test directory
   */
  static createTempDirectory(): string {
    const tempDir = path.join(os.tmpdir(), `jpe-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    mkdirSync(tempDir, { recursive: true })
    return tempDir
  }

  /**
   * Clean up a temporary directory
   */
  static cleanupDirectory(dirPath: string): void {
    if (existsSync(dirPath)) {
      rmSync(dirPath, { recursive: true, force: true })
    }
  }

  /**
   * Create a new project via UI
   */
  static async createNewProject(page: Page, projectName: string, projectPath: string): Promise<void> {
    // Click "New Project" button or card
    const newProjectCard = page.locator('[data-testid="new-project-card"]')
    await newProjectCard.click()

    // Wait for projects page to load
    await page.waitForSelector('[data-testid="nav-projects"]')

    // Fill in project name (assuming there's an input field)
    // This would depend on the actual ProjectsPage implementation
    // For now, we'll assume a dialog or form appears
    await page.fill('input[placeholder*="name" i]', projectName)
    await page.fill('input[placeholder*="path" i]', projectPath)

    // Click create button
    await page.click('button:has-text("Create")')

    // Wait for project to be created
    await page.waitForTimeout(1000)
  }

  /**
   * Open a project
   */
  static async openProject(page: Page, projectPath: string): Promise<void> {
    // Navigate to projects page
    await page.click('[data-testid="nav-projects"]')

    // Wait for projects list
    await page.waitForSelector('[data-testid*="project-card"]')

    // Click on the project (this would depend on actual implementation)
    // For now, we'll assume the project is visible
    const projectCard = page.locator('[data-testid*="project-card"]').first()
    await projectCard.click()

    // Wait for studio to load
    await page.waitForSelector('[data-testid="editor-layout"]')
  }

  /**
   * Add a file to the current project
   */
  static async addFileToProject(page: Page, filePath: string): Promise<void> {
    // Look for "Add File" button in sidebar
    const addFileButton = page.locator('[data-testid="add-file-button"]')

    if (await addFileButton.isVisible()) {
      await addFileButton.click()
    } else {
      // Fallback: use keyboard shortcut or menu
      await page.keyboard.press('Control+O') // or Cmd+O on Mac
    }

    // Wait for file dialog
    await page.waitForTimeout(500)

    // Set file path in dialog
    // This assumes electron's file dialog is being mocked or intercepted
    await page.evaluate((fPath) => {
      // This would need to be implemented based on how file dialogs are handled
      console.log(`Adding file: ${fPath}`)
    }, filePath)
  }

  /**
   * Get sample XML fixture
   */
  static getSampleXML(): string {
    try {
      const fixturePath = path.join(__dirname, '../fixtures/sample-xml/valid-tuning.xml')
      return readFileSync(fixturePath, 'utf-8')
    } catch (error) {
      // Return minimal valid XML if fixture not found
      return `<?xml version="1.0" encoding="utf-8"?>
<Root schemaVersion="0">
  <Tuning name="Sample" class="SimData" instance="0" />
</Root>`
    }
  }

  /**
   * Get invalid XML fixture
   */
  static getInvalidXML(): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<Root schemaVersion="0">
  <Tuning name="Sample" class="SimData" instance="0"
</Root>`
  }

  /**
   * Wait for project to be available in recent projects
   */
  static async waitForProjectInRecents(page: Page, projectName: string, maxWait = 10000): Promise<void> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWait) {
      const projectCards = await page.locator('[data-testid*="project-card"]').count()
      if (projectCards > 0) {
        const projectText = await page.locator('[data-testid*="project-card"]').first().textContent()
        if (projectText?.includes(projectName)) {
          return
        }
      }

      await page.waitForTimeout(500)
    }

    throw new Error(`Project "${projectName}" not found in recent projects after ${maxWait}ms`)
  }
}
