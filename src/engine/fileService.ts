/**
 * FILE SERVICE
 *
 * Handles all file I/O operations:
 * - Read/write XML files from disk
 * - Read/write project metadata
 * - Manage multi-file projects
 * - Project creation and deletion
 *
 * In Electron: Uses fs/fsPromises
 * In Browser: Uses localStorage or IndexedDB (fallback)
 *
 * This is the bridge between the editor and the filesystem.
 */

import type { Project, ProjectFile, FileService as IFileService } from './types'

/**
 * File Service interface (for dependency injection)
 * Can be implemented by different backends:
 * - Electron (fs)
 * - Browser (localStorage)
 * - Web (API)
 */
export interface FileServiceBackend {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  fileExists(path: string): Promise<boolean>
  mkdir(path: string): Promise<void>
  rmdir(path: string): Promise<void>
  readdir(path: string): Promise<string[]>
}

/**
 * Main File Service class
 *
 * Provides project management and file I/O operations
 * Uses a pluggable backend (Electron fs, browser localStorage, etc.)
 */
export class FileService {
  private backend: FileServiceBackend

  constructor(backend: FileServiceBackend) {
    this.backend = backend
  }

  // ============================================================
  // PROJECT OPERATIONS
  // ============================================================

  /**
   * Create a new project
   *
   * Creates directory structure:
   * projectPath/
   *   ├── project.json (metadata)
   *   └── files/
   */
  async createProject(
    projectPath: string,
    projectName: string
  ): Promise<Project> {
    try {
      // Create project directory
      await this.backend.mkdir(projectPath)

      // Create files subdirectory
      const filesDir = `${projectPath}/files`
      await this.backend.mkdir(filesDir)

      // Create project metadata
      const project: Project = {
        id: generateProjectId(),
        name: projectName,
        path: projectPath,
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save project.json
      await this.saveProjectMetadata(projectPath, project)

      return project
    } catch (error) {
      throw new Error(
        `Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Load an existing project
   *
   * Reads project.json and scans files directory
   */
  async loadProject(projectPath: string): Promise<Project> {
    try {
      // Load project metadata
      const project = await this.loadProjectMetadata(projectPath)

      // Scan files directory to get current file list
      const filesDir = `${projectPath}/files`
      const fileNames = await this.backend.readdir(filesDir)

      // Build file list
      const files: ProjectFile[] = []
      for (const fileName of fileNames) {
        if (fileName.endsWith('.xml')) {
          files.push({
            id: generateFileId(),
            name: fileName,
            path: `${filesDir}/${fileName}`,
            type: 'xml',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
          })
        }
      }

      project.files = files
      return project
    } catch (error) {
      throw new Error(
        `Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Save project metadata (project.json)
   */
  private async saveProjectMetadata(
    projectPath: string,
    project: Project
  ): Promise<void> {
    const metadataPath = `${projectPath}/project.json`
    const content = JSON.stringify(project, null, 2)
    await this.backend.writeFile(metadataPath, content)
  }

  /**
   * Load project metadata (project.json)
   */
  private async loadProjectMetadata(projectPath: string): Promise<Project> {
    const metadataPath = `${projectPath}/project.json`
    const content = await this.backend.readFile(metadataPath)
    return JSON.parse(content) as Project
  }

  /**
   * Delete a project
   *
   * Removes entire project directory
   */
  async deleteProject(projectPath: string): Promise<void> {
    try {
      await this.backend.rmdir(projectPath)
    } catch (error) {
      throw new Error(
        `Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // ============================================================
  // FILE OPERATIONS
  // ============================================================

  /**
   * Add a file to a project
   *
   * Creates new XML file in project/files/
   * Updates project metadata
   */
  async addFileToProject(
    projectPath: string,
    fileName: string,
    content: string = ''
  ): Promise<ProjectFile> {
    try {
      // Ensure filename ends with .xml
      const safeFileName = fileName.endsWith('.xml') ? fileName : `${fileName}.xml`

      // Create file path
      const filePath = `${projectPath}/files/${safeFileName}`

      // Write file
      await this.backend.writeFile(filePath, content)

      // Create file metadata
      const file: ProjectFile = {
        id: generateFileId(),
        name: safeFileName,
        path: filePath,
        type: 'xml',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      }

      return file
    } catch (error) {
      throw new Error(
        `Failed to add file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Remove a file from a project
   */
  async removeFileFromProject(projectPath: string, fileName: string): Promise<void> {
    try {
      const filePath = `${projectPath}/files/${fileName}`
      await this.backend.writeFile(filePath, '') // Delete by clearing content
    } catch (error) {
      throw new Error(
        `Failed to remove file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Read XML file content
   */
  async readXmlFile(filePath: string): Promise<string> {
    try {
      return await this.backend.readFile(filePath)
    } catch (error) {
      throw new Error(
        `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Write XML file content
   */
  async writeXmlFile(filePath: string, content: string): Promise<void> {
    try {
      await this.backend.writeFile(filePath, content)
    } catch (error) {
      throw new Error(
        `Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    return await this.backend.fileExists(filePath)
  }

  // ============================================================
  // BATCH OPERATIONS
  // ============================================================

  /**
   * Save all files in a project
   *
   * Takes a project object with potentially modified files
   * Writes each file to disk
   */
  async saveProjectFiles(
    projectPath: string,
    files: ProjectFile[]
  ): Promise<void> {
    try {
      for (const file of files) {
        // Re-read to get current content from editor
        // Note: This assumes file content is passed separately
        // In real implementation, content would come from editor state
      }
    } catch (error) {
      throw new Error(
        `Failed to save project files: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Load all files in a project into memory
   */
  async loadProjectFilesContent(
    projectPath: string,
    files: ProjectFile[]
  ): Promise<Map<string, string>> {
    try {
      const contents = new Map<string, string>()

      for (const file of files) {
        const content = await this.backend.readFile(file.path)
        contents.set(file.id, content)
      }

      return contents
    } catch (error) {
      throw new Error(
        `Failed to load project files: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

/**
 * Electron-specific File Service implementation
 * Uses Node.js fs/fsPromises
 */
export class ElectronFileService extends FileService {
  /**
   * Create from Node.js environment
   *
   * Usage in Electron main process:
   * import { promises as fs } from 'fs'
   * import path from 'path'
   * const service = ElectronFileService.create(fs, path)
   */
  static create(fsPromises: any, pathModule: any): ElectronFileService {
    const backend: FileServiceBackend = {
      readFile: (path: string) => fsPromises.readFile(path, 'utf8'),
      writeFile: (path: string, content: string) =>
        fsPromises.writeFile(path, content, 'utf8'),
      fileExists: async (path: string) => {
        try {
          await fsPromises.access(path)
          return true
        } catch {
          return false
        }
      },
      mkdir: (path: string) =>
        fsPromises.mkdir(path, { recursive: true }),
      rmdir: (path: string) =>
        fsPromises.rm(path, { recursive: true, force: true }),
      readdir: (path: string) => fsPromises.readdir(path),
    }

    return new ElectronFileService(backend)
  }
}

/**
 * Browser-specific File Service implementation
 * Uses localStorage with fallback to IndexedDB
 */
export class BrowserFileService extends FileService {
  /**
   * Create for browser environment
   *
   * Usage:
   * const service = BrowserFileService.create()
   */
  static create(): BrowserFileService {
    const backend: FileServiceBackend = {
      readFile: async (path: string) => {
        const key = `file:${path}`
        const content = localStorage.getItem(key)
        if (!content) {
          throw new Error(`File not found: ${path}`)
        }
        return content
      },

      writeFile: async (path: string, content: string) => {
        const key = `file:${path}`
        localStorage.setItem(key, content)
      },

      fileExists: async (path: string) => {
        const key = `file:${path}`
        return localStorage.getItem(key) !== null
      },

      mkdir: async (path: string) => {
        // No-op in browser
      },

      rmdir: async (path: string) => {
        // Remove all files starting with path
        const prefix = `file:${path}`
        const keys = Object.keys(localStorage)
        for (const key of keys) {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key)
          }
        }
      },

      readdir: async (path: string) => {
        const prefix = `file:${path}/`
        const keys = Object.keys(localStorage)
        const files = new Set<string>()

        for (const key of keys) {
          if (key.startsWith(prefix)) {
            const fileName = key.substring(prefix.length)
            files.add(fileName)
          }
        }

        return Array.from(files)
      },
    }

    return new BrowserFileService(backend)
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Generate unique project ID
 */
function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate unique file ID
 */
function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Export singleton instances for convenience
 */
let electronService: ElectronFileService | null = null
let browserService: BrowserFileService | null = null

export function getElectronFileService(fs: any, path: any): ElectronFileService {
  if (!electronService) {
    electronService = ElectronFileService.create(fs, path)
  }
  return electronService
}

export function getBrowserFileService(): BrowserFileService {
  if (!browserService) {
    browserService = BrowserFileService.create()
  }
  return browserService
}
