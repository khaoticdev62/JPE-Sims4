/**
 * ProjectService handles project-level operations
 * Uses the project store and file service
 */

import { useProjectStore } from '@stores/useProjectStore'
import { FileService } from './FileService'
import type { Project, ModFile } from '@types/index'

export class ProjectService {
  /**
   * Create a new project
   */
  static async createProject(name: string, rootPath: string): Promise<Project | null> {
    try {
      const { createProject } = useProjectStore.getState()
      await createProject(name, rootPath)
      return useProjectStore.getState().currentProject
    } catch (error) {
      console.error('Failed to create project', error)
      return null
    }
  }

  /**
   * Open an existing project
   */
  static async openProject(projectPath: string): Promise<Project | null> {
    try {
      const { openProject, setCurrentProject } = useProjectStore.getState()
      await openProject(projectPath)

      // Attempt to load project metadata
      const files = await FileService.listDirectory(projectPath)
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: projectPath.split('/').pop() || 'Untitled',
        rootPath: projectPath,
        files: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      }

      setCurrentProject(newProject)
      return newProject
    } catch (error) {
      console.error('Failed to open project', error)
      return null
    }
  }

  /**
   * Save current project
   */
  static async saveProject(): Promise<boolean> {
    try {
      const { saveProject } = useProjectStore.getState()
      await saveProject()
      return true
    } catch (error) {
      console.error('Failed to save project', error)
      return false
    }
  }

  /**
   * Add file to current project
   */
  static async addFileToProject(filePath: string, content: string): Promise<ModFile | null> {
    try {
      const { addFile, currentProject } = useProjectStore.getState()
      if (!currentProject) return null

      const fileName = filePath.split('/').pop() || 'unknown'
      const fileType = fileName.split('.').pop() || 'txt'

      const newFile: ModFile = {
        id: `file-${Date.now()}`,
        projectId: currentProject.id,
        name: fileName,
        path: filePath,
        type: fileType as any,
        content,
        isDirty: false,
        size: content.length,
        lastModified: Date.now(),
      }

      addFile(newFile)
      return newFile
    } catch (error) {
      console.error('Failed to add file to project', error)
      return null
    }
  }

  /**
   * Remove file from current project
   */
  static removeFileFromProject(fileId: string): void {
    const { removeFile } = useProjectStore.getState()
    removeFile(fileId)
  }

  /**
   * Get current project
   */
  static getCurrentProject(): Project | null {
    return useProjectStore.getState().currentProject
  }

  /**
   * Get file from current project
   */
  static getFile(fileId: string): ModFile | undefined {
    return useProjectStore.getState().getFile(fileId)
  }
}
