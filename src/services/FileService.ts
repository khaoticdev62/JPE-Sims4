import { normalizePath } from '../utils/fileUtils'

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

export class FileService {
  /**
   * Open a directory picker and return the path and files
   */
  static async openDirectory(): Promise<{ path: string; name: string; files: any[] } | null> {
    if (typeof window === 'undefined' || !window.electron) return null;
    try {
      return await window.electron.project.openDirectory()
    } catch (error) {
      console.error('Failed to open directory', error)
      return null
    }
  }

  /**
   * Open a folder - alias for openDirectory but returns generic type
   * Falls back to browser Folder Picker API if not in Electron
   */
  static async openFolder(): Promise<string | null> {
    // Electron mode
    if (typeof window !== 'undefined' && (window as any).electron) {
      try {
        return await (window as any).electron.file.openFolder()
      } catch (error) {
        console.error('Failed to open folder via Electron IPC', error)
        return null
      }
    }
    
    // Browser fallback - use File System Access API (Chrome/Edge 86+)
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker()
        return dirHandle.name // Return folder name as path placeholder
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to open folder via browser API', error)
        }
        return null
      }
    }
    
    // Fallback for unsupported browsers - return mock path for testing
    if (typeof window !== 'undefined') {
      const path = prompt('Enter project folder path (browser mode - for testing only):')
      return path || null
    }
    
    return null
  }

  /**
   * Open a single file
   */
  static async openFile(): Promise<any> {
    if (typeof window === 'undefined' || !window.electron) return null;
    return await window.electron.file.openFile()
  }

  /**
   * Save current file
   */
  static async saveFile(): Promise<any> {
    if (typeof window === 'undefined' || !window.electron) return null;
    return await window.electron.file.saveFile()
  }

  /**
   * Check if file exists
   */
  static async fileExists(path: string): Promise<boolean> {
    const safePath = normalizePath(path)
    if (typeof window === 'undefined' || !window.electron) return false;
    try {
      return await window.electron.file.exists(safePath)
    } catch {
      return false
    }
  }

  /**
   * Read file content as string
   */
  static async readFile(path: string): Promise<FileReadResult> {
    const safePath = normalizePath(path)
    if (typeof window === 'undefined' || !window.electron) {
      return { success: false, error: 'Not in electron environment' };
    }
    try {
      const content = await window.electron.file.readFile(safePath)
      return { success: true, content }
    } catch (error) {
      console.error('Failed to read file', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * Read file content as ArrayBuffer
   */
  static async readFileBuffer(path: string): Promise<ArrayBuffer | null> {
    if (typeof window === 'undefined' || !window.electron) return null;
    try {
      // We assume the Electron bridge handles buffer conversion
      const result = await window.electron.file.readFileBuffer(path)
      return result
    } catch (error) {
      console.error('Failed to read file as buffer', error)
      return null
    }
  }

  /**
   * Write content to file
   */
  static async writeFile(path: string, content: string): Promise<FileWriteResult> {
    const safePath = normalizePath(path)
    if (typeof window === 'undefined' || !window.electron) {
      return { success: false, error: 'Not in electron environment' }
    }
    try {
      await window.electron.file.writeFile(safePath, content)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }
    }
  }

  /**
   * Write buffer to file
   */
  static async writeFileBuffer(path: string, buffer: ArrayBuffer): Promise<FileWriteResult> {
    if (typeof window === 'undefined' || !window.electron) {
      return { success: false, error: 'Not in electron environment' }
    }
    try {
      return (await window.electron.file.writeFileBuffer(path, buffer)) as FileWriteResult
    } catch (error) {
       return { 
         success: false, 
         error: error instanceof Error ? error.message : String(error) 
       }
    }
  }

  /**
   * Read a slice of a file
   */
  static async readSlice(path: string, offset: number, length: number): Promise<ArrayBuffer | null> {
    if (typeof window === 'undefined' || !window.electron) return null;
    try {
      return await window.electron.file.readSlice(path, offset, length)
    } catch (error) {
      console.error('Failed to read file slice', error)
      return null
    }
  }

  /**
   * Append buffer to file
   */
  static async appendFileBuffer(path: string, buffer: ArrayBuffer): Promise<FileWriteResult> {
    if (typeof window === 'undefined' || !window.electron) {
      return { success: false, error: 'Not in electron environment' }
    }
    try {
      return await window.electron.file.appendFileBuffer(path, buffer)
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }
    }
  }

  /**
   * Truncate file
   */
  static async truncateFile(path: string): Promise<FileWriteResult> {
    if (typeof window === 'undefined' || !window.electron) {
      return { success: false, error: 'Not in electron environment' }
    }
    try {
      return await window.electron.file.truncateFile(path)
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(path: string): Promise<FileWriteResult> {
    if (typeof window === 'undefined' || !window.electron) {
      return { success: false, error: 'Not in electron environment' }
    }
    try {
      return await window.electron.file.deleteFile(path)
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }
    }
  }

  /**
   * List contents of a directory
   */
  static async listDirectory(path: string): Promise<{ success: boolean; files: any[]; error?: string }> {
    if (typeof window === 'undefined' || !window.electron) {
      return { success: false, files: [], error: 'Not in electron environment' }
    }
    try {
      const files = await window.electron.file.listDirectory(path)
      return { success: true, files }
    } catch (error) {
      console.error('Failed to list directory', error)
      return { success: false, files: [], error: String(error) }
    }
  }

  /**
   * Create a directory
   */
  static async createDirectory(path: string): Promise<boolean> {
    if (typeof window === 'undefined' || !window.electron) return false;
    try {
      await window.electron.file.createDirectory(path)
      return true
    } catch (error) {
      console.error('Failed to create directory', error)
      return false
    }
  }
}
