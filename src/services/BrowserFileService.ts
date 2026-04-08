/**
 * BrowserFileService — Browser-compatible file save utility.
 *
 * Uses the server-side /api/files/save route when in browser context.
 * Falls back to Electron IPC when running in Electron environment.
 *
 * This allows the web app to save files without requiring Electron.
 */

export interface SaveResult {
  success: boolean
  size?: number
  backupPath?: string
  error?: string
}

export class BrowserFileService {
  /**
   * Save content to file.
   * Uses Electron IPC if available, otherwise falls back to server API.
   */
  static async saveFile(
    path: string,
    content: string,
    options?: { createBackup?: boolean }
  ): Promise<SaveResult> {
    const { createBackup = true } = options ?? {}

    // Try Electron IPC first
    if (typeof window !== 'undefined' && (window as any).electron?.file?.writeFile) {
      try {
        await (window as any).electron.file.writeFile(path, content)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Electron save failed',
        }
      }
    }

    // Fall back to server-side save
    try {
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content, createBackup }),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Server save failed',
        }
      }

      return {
        success: true,
        size: result.size,
        backupPath: result.backupPath,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network save failed',
      }
    }
  }

  /**
   * Check if we're running in Electron environment.
   */
  static isElectron(): boolean {
    return typeof window !== 'undefined' && !!(window as any).electron
  }
}
