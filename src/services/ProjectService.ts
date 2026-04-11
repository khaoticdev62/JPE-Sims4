/**
 * ProjectService handles project-level operations
 * Uses the file service for file system operations
 */

import { FileService } from './FileService'
import { BrowserFileService } from './BrowserFileService'
import { FileType, Project, ModFile } from '@/types/index'
import { PythonService } from './PythonService'

interface ProjectMetadata {
  id: string
  name: string
  metadata: Project['metadata']
  fileCount: number
}

export class ProjectService {
  /**
   * Read file as binary buffer
   */
  static async readFileBuffer(path: string): Promise<ArrayBuffer | null> {
    return await FileService.readFileBuffer(path)
  }

  /**
   * Create a new project structure
   */
  static async createProject(name: string, rootPath: string): Promise<Project | null> {
    try {
      // 1. Create project directories
      const dirs = ['', '/mods', '/.jpe_history']
      for (const dir of dirs) {
        const fullPath = `${rootPath}${dir}`
        const exists = await FileService.fileExists(fullPath)
        if (!exists) {
          const success = await FileService.createDirectory(fullPath)
          if (!success) {
            throw new Error(`Failed to create directory: ${fullPath}`)
          }
        }
      }

      const newProject: Project = {
        id: `project-${Date.now()}`,
        name,
        rootPath,
        files: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      }

      // 2. Write initial project metadata
      const metadataPath = `${rootPath}/.jpe-project.json`
      const metadataContent = JSON.stringify({
        id: newProject.id,
        name: newProject.name,
        metadata: newProject.metadata,
        fileCount: 0,
      }, null, 2)

      const result = await FileService.writeFile(metadataPath, metadataContent)
      if (!result.success) {
        throw new Error(`Failed to write project metadata: ${result.error}`)
      }

      return newProject
    } catch (error) {
      console.error('Failed to create project', error)
      return null
    }
  }

  /**
   * Open an existing project and discover files (Lazy Loading)
   */
  static async openProject(projectPath: string): Promise<Project | null> {
    try {
      const projectName = projectPath.split(/[/\\]/).pop() || 'Untitled'

      // Try to load project metadata from .jpe-project.json
      const metadataPath = `${projectPath}/.jpe-project.json`
      let projectMetadata: ProjectMetadata | null = null

      const metadataExists = await FileService.fileExists(metadataPath)
      if (metadataExists) {
        const metadataResult = await FileService.readFile(metadataPath)
        if (metadataResult.success && metadataResult.content) {
          try {
            projectMetadata = JSON.parse(metadataResult.content)
          } catch (e) {
            console.warn('Failed to parse project metadata', e)
          }
        }
      }

      // Create project with loaded metadata or defaults
      const newProject: Project = {
        id: projectMetadata?.id || `project-${Date.now()}`,
        name: projectName,
        rootPath: projectPath,
        files: [],
        metadata: projectMetadata?.metadata || {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      }

      // Discover supported files in the project directory
      const dirResult = await FileService.listDirectory(projectPath)
      if (dirResult.success && dirResult.files) {
        // Updated supported extensions map
        const supportedExtensions = {
          '.xml': 'xml',
          '.jpe': 'jpe',
          '.stbl': 'stbl',
          '.ts4script': 'ts4script',
          '.py': 'py',
          '.json': 'json',
          '.cfg': 'cfg',
          '.package': 'package'
        }

        for (const file of dirResult.files) {
          if (!file.isFile) continue

          // Robust extension detection
          const ext = '.' + file.name.split('.').pop()?.toLowerCase()
          if (ext in supportedExtensions) {
            const filePath = `${projectPath}/${file.name}`
            
            // Get file stats via separate call if listDirectory doesn't provide them
            // For now assuming we can get size/modified from a stat call or file service
            // Note: In a real lazy-load scenario, we avoid reading content here.
            
            // We'll treat content as empty string initially to save memory
            // The Editor or specific service will call loadFileContent when needed
            
            const newFile: ModFile = {
              id: `file-${Date.now()}-${Math.random()}`,
              projectId: newProject.id,
              name: file.name,
              path: filePath,
              type: (supportedExtensions[ext as keyof typeof supportedExtensions] || 'xml') as FileType,
              content: '', // Lazy load: content is empty initially
              isDirty: false,
              size: 0, // Should be populated by actual stat if possible
              lastModified: Date.now(),
            }
            
            // Optional: Quick stat to get actual size/modified without reading content
            // const stats = await FileService.getFileStats(filePath)
            // if (stats) { newFile.size = stats.size; newFile.lastModified = stats.modified }

            newProject.files.push(newFile)

            // Story 4.4: If it's a .ts4script, peek inside and add internal files as virtual project files
            if (newFile.type === 'ts4script') {
              try {
                const buffer = await this.readFileBuffer(newFile.path)
                if (buffer) {
                  const zipFiles = await PythonService.extractFromArchive(buffer)
                  zipFiles.forEach((data: Uint8Array, relativePath: string) => {
                    if (relativePath.endsWith('.py') || relativePath.endsWith('.pyc')) {
                      const virtualFile: ModFile = {
                        id: `file-${Date.now()}-${Math.random()}`,
                        projectId: newProject.id,
                        name: relativePath,
                        path: `${newFile.path}::${relativePath}`, // Protocol for virtual files
                        type: relativePath.endsWith('.pyc') ? 'py' : 'py', // Treat pyc as py for now
                        content: '', // Lazy load
                        isDirty: false,
                        size: data.byteLength,
                        lastModified: newFile.lastModified,
                      }
                      newProject.files.push(virtualFile)
                    }
                  })
                }
              } catch (err) {
                console.error(`Failed to peek into .ts4script: ${newFile.name}`, err)
              }
            }
          }
        }
      }

      return newProject
    } catch (error) {
      console.error('Failed to open project', error)
      return null
    }
  }

  /**
   * Load content for a specific file on demand (Supports Virtual Archive Files)
   */
  static async loadFileContent(file: ModFile): Promise<string | null> {
    try {
      // Story 4.4: Handle virtual files from archives (e.g. mod.ts4script::main.py)
      if (file.path.includes('::')) {
        const [archivePath, internalPath] = file.path.split('::')
        
        const buffer = await this.readFileBuffer(archivePath)
        if (!buffer) return null
        
        const zipFiles = await PythonService.extractFromArchive(buffer)
        const fileData = zipFiles.get(internalPath)
        
        if (fileData) {
          // If it's a Python file, decompile to JPE for translation
          if (internalPath.endsWith('.py') || internalPath.endsWith('.pyc')) {
            const decoder = new TextDecoder()
            const source = decoder.decode(fileData)
            return PythonService.decompileToJpe(source, internalPath)
          }
          
          // Fallback for other files inside archives
          return new TextDecoder().decode(fileData)
        }
        return null
      }

      // Standard file loading
      const result = await FileService.readFile(file.path)
      if (result.success && result.content !== undefined) {
        return result.content
      }
      return null
    } catch (error) {
      console.error(`Failed to load content for file ${file.name}`, error)
      return null
    }
  }

  /**
   * Save current project and all modified files to disk
   */
  static async saveProject(project: Project): Promise<{ success: boolean; project: Project }> {
    try {
      let allSuccess = true

      // Save all files that have been modified
      for (const file of project.files) {
        if (file.isDirty || file.content) {
          const result = await FileService.writeFile(file.path, file.content)
          if (!result.success) {
            console.error(`Failed to save file ${file.name}:`, result.error)
            allSuccess = false
          }
        }
      }

      // Update project metadata
      const updatedProject = {
        ...project,
        metadata: {
          ...project.metadata,
          updatedAt: Date.now(),
        },
      }

      // Save project metadata to .jpe-project.json
      const metadataPath = `${updatedProject.rootPath}/.jpe-project.json`
      const metadataContent = JSON.stringify({
        id: updatedProject.id,
        name: updatedProject.name,
        metadata: updatedProject.metadata,
        fileCount: updatedProject.files.length,
      }, null, 2)

      const metadataResult = await FileService.writeFile(metadataPath, metadataContent)
      if (!metadataResult.success) {
        console.error('Failed to save project metadata:', metadataResult.error)
        allSuccess = false
      }

      return { success: allSuccess, project: updatedProject }
    } catch (error) {
      console.error('Failed to save project', error)
      return { success: false, project }
    }
  }

  /**
   * Create a new file in a project
   */
  static async createFile(path: string, content: string, projectId: string): Promise<ModFile | null> {
    try {
      const fileName = path.split(/[/\\]/).pop() || 'unknown'
      const writeResult = await FileService.writeFile(path, content)
      if (!writeResult.success) {
        throw new Error(`Failed to write file: ${writeResult.error}`)
      }

      const ext = '.' + fileName.split('.').pop()?.toLowerCase()
      const newFile: ModFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        projectId,
        name: fileName,
        path,
        type: this.getFileTypeFromExtension(ext),
        content,
        isDirty: false,
        size: writeResult.size || content.length,
        lastModified: Date.now(),
      }

      return newFile
    } catch (error) {
      console.error('Failed to create file', error)
      return null
    }
  }

  /**
   * Save a single file
   */
  static async saveFile(file: ModFile): Promise<boolean> {
    try {
      const result = await BrowserFileService.saveFile(file.path, file.content, { createBackup: true })
      return result.success
    } catch (error) {
      console.error('Failed to save file', error)
      return false
    }
  }

  /**
   * Add a file to the project (copies it to /mods folder)
   */
  static async addFileToProject(project: Project, sourcePath: string): Promise<ModFile | null> {
    try {
      const fileName = sourcePath.split(/[/\\]/).pop() || 'unknown'
      const destPath = `${project.rootPath}/mods/${fileName}`

      // 1. Read source file
      const readResult = await FileService.readFile(sourcePath)
      if (!readResult.success || readResult.content === undefined) {
        throw new Error(`Failed to read source file: ${readResult.error}`)
      }

      // 2. Write to project mods folder
      const writeResult = await FileService.writeFile(destPath, readResult.content)
      if (!writeResult.success) {
        throw new Error(`Failed to copy file to project: ${writeResult.error}`)
      }

      // 3. Create ModFile object
      const ext = '.' + fileName.split('.').pop()?.toLowerCase()
      const newFile: ModFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        projectId: project.id,
        name: fileName,
        path: destPath,
        type: this.getFileTypeFromExtension(ext),
        content: readResult.content,
        isDirty: false,
        size: writeResult.size || readResult.content.length,
        lastModified: Date.now(),
      }

      return newFile
    } catch (error) {
      console.error('Failed to add file to project', error)
      return null
    }
  }

  /**
   * Rename a file in the project
   */
  static async renameFileInProject(file: ModFile, newName: string): Promise<string | null> {
    try {
      const oldPath = file.path
      const pathParts = oldPath.split(/[/\\]/)
      pathParts.pop() // Remove old filename
      const newPath = [...pathParts, newName].join('/')

      // In a real Electron app, we might use a dedicated move/rename IPC
      // Since we don't have it, we'll read then write then delete
      // Actually, let's assume we can just write to the new path and delete the old one
      
      const readResult = await FileService.readFile(oldPath)
      if (!readResult.success || readResult.content === undefined) {
        throw new Error(`Failed to read file for rename: ${readResult.error}`)
      }

      const writeResult = await FileService.writeFile(newPath, readResult.content)
      if (!writeResult.success) {
        throw new Error(`Failed to write renamed file: ${writeResult.error}`)
      }

      await FileService.deleteFile(oldPath)

      return newPath
    } catch (error) {
      console.error('Failed to rename file', error)
      return null
    }
  }

  /**
   * Delete a file from the project
   */
  static async deleteFileFromProject(file: ModFile): Promise<boolean> {
    try {
      const result = await FileService.deleteFile(file.path)
      return result.success
    } catch (error) {
      console.error('Failed to delete file', error)
      return false
    }
  }

  /**
   * Helper to get file type from extension
   */
  private static getFileTypeFromExtension(ext: string): FileType {
    const map: Record<string, string> = {
      '.xml': 'xml',
      '.jpe': 'jpe',
      '.stbl': 'stbl',
      '.ts4script': 'ts4script',
      '.py': 'py',
      '.json': 'json',
      '.cfg': 'cfg',
      '.package': 'package'
    }
    return (map[ext] || 'xml') as FileType
  }
}