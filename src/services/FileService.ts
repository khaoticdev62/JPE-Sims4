/**
 * FileService handles all file I/O operations
 * Bridges the gap between Electron IPC and the application logic
 */

export interface FileReadResult {
  success: boolean
  content?: string
  size?: number
  modified?: number
  error?: string
}

export interface FileWriteResult {
  success: boolean
  size?: number
  modified?: number
  error?: string
}

export interface FileListResult {
  success: boolean
  files?: Array<{
    name: string
    isDirectory: boolean
    isFile: boolean
  }>
  error?: string
}

export interface FileExistsResult {
  success: boolean
  exists?: boolean
  error?: string
}

export class FileService {
  /**
   * Open a folder dialog and return the selected path
   */
  static async openFolder(): Promise<string | null> {
    try {
      return await window.electron.file.openFolder()
    } catch (error) {
      console.error('Failed to open folder dialog', error)
      return null
    }
  }

  /**
   * Open file dialog and return selected file paths
   */
  static async openFile(): Promise<string[]> {
    try {
      return await window.electron.file.openFile()
    } catch (error) {
      console.error('Failed to open file dialog', error)
      return []
    }
  }

  /**
   * Save file dialog and return the selected path
   */
  static async saveFile(): Promise<string | null> {
    try {
      return await window.electron.file.saveFile()
    } catch (error) {
      console.error('Failed to open save dialog', error)
      return null
    }
  }

  /**
   * Check if a file path exists
   */
  static async fileExists(path: string): Promise<boolean> {
    try {
      const result = (await window.electron.file.exists(path)) as FileExistsResult
      return result.success ? result.exists ?? false : false
    } catch (error) {
      console.error('Failed to check file existence', error)
      return false
    }
  }

  /**
   * Read file content as text
   */
  static async readFile(path: string): Promise<FileReadResult> {
    try {
      return (await window.electron.file.readFile(path)) as FileReadResult
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Write content to file
   */
  static async writeFile(path: string, content: string): Promise<FileWriteResult> {
    try {
      return (await window.electron.file.writeFile(path, content)) as FileWriteResult
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Delete a file
   */
  static async deleteFile(_path: string): Promise<boolean> {
    try {
      // This will be implemented with Electron fs access
      // For now, return false as deletion is a destructive operation
      console.warn('File deletion not yet implemented')
      return false
    } catch (error) {
      console.error('Failed to delete file', error)
      return false
    }
  }

  /**
   * List files in a directory
   */
  static async listDirectory(path: string): Promise<FileListResult> {
    try {
      return (await window.electron.file.listDirectory(path)) as FileListResult
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
