/**
 * FileService handles all file I/O operations
 * Bridges the gap between Electron IPC and the application logic
 */

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
      // This will be implemented with Electron fs access
      return false
    } catch (error) {
      console.error('Failed to check file existence', error)
      return false
    }
  }

  /**
   * Read file content as text
   */
  static async readFile(path: string): Promise<string | null> {
    try {
      // This will be implemented with Electron fs access
      return null
    } catch (error) {
      console.error('Failed to read file', error)
      return null
    }
  }

  /**
   * Write content to file
   */
  static async writeFile(path: string, content: string): Promise<boolean> {
    try {
      // This will be implemented with Electron fs access
      return true
    } catch (error) {
      console.error('Failed to write file', error)
      return false
    }
  }

  /**
   * Delete a file
   */
  static async deleteFile(path: string): Promise<boolean> {
    try {
      // This will be implemented with Electron fs access
      return true
    } catch (error) {
      console.error('Failed to delete file', error)
      return false
    }
  }

  /**
   * List files in a directory
   */
  static async listDirectory(path: string): Promise<string[]> {
    try {
      // This will be implemented with Electron fs access
      return []
    } catch (error) {
      console.error('Failed to list directory', error)
      return []
    }
  }
}
