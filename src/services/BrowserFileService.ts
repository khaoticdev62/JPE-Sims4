/**
 * BrowserFileService — Browser-compatible file save utility.
 *
 * Uses the Electron IPC bridge to write files to disk in the
 * Zero-Server desktop architecture.
 */

export interface SaveResult {
  success: boolean
  size?: number
  backupPath?: string
  error?: string
}

export class BrowserFileService {
  /**
   * Save content to file via native Electron IPC.
   */
  static async saveFile(
    path: string,
    content: string,
    _options?: { createBackup?: boolean }
  ): Promise<SaveResult> {
    // Electron IPC — exclusive path in Zero-Server architecture
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

    return {
      success: false,
      error: 'File save not available. Ensure JPE Studio is running as a desktop application.',
    }
  }

  /**
   * Check if we're running in Electron environment.
   */
  static isElectron(): boolean {
    return typeof window !== 'undefined' && !!(window as any).electron
  }
}
