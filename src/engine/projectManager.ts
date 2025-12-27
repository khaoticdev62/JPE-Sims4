/**
 * PROJECT MANAGER
 *
 * Coordinates the entire compilation pipeline:
 * - Manages project state (current file, unsaved changes, etc.)
 * - Orchestrates file operations
 * - Handles open/save/compile workflow
 * - Tracks file history and undo/redo
 *
 * This is the application's main command center for all project operations.
 */

import type { Project, ProjectFile } from './types'
import { FileService, FileServiceBackend } from './fileService'
import { parseXml } from './xmlParser'
import { astToJpe } from './jpeTranslator'
import { validateJpe } from './validator'
import { compileJpeToXml, getCompilationDiagnostics } from './compiler'

/**
 * Project state tracked in memory
 */
export interface ProjectState {
  project: Project | null
  currentFileId: string | null
  files: Map<string, { content: string; originalContent: string; isDirty: boolean }>
  history: { undo: string[]; redo: string[] }
}

/**
 * Project Manager class
 *
 * Central orchestrator for all project operations
 * Coordinates FileService, Parser, Translator, Validator, and Compiler
 */
export class ProjectManager {
  private fileService: FileService
  private state: ProjectState = {
    project: null,
    currentFileId: null,
    files: new Map(),
    history: { undo: [], redo: [] },
  }

  constructor(backend: FileServiceBackend) {
    this.fileService = new FileService(backend)
  }

  // ============================================================
  // PROJECT LIFECYCLE
  // ============================================================

  /**
   * Create and open a new project
   */
  async createProject(projectPath: string, projectName: string): Promise<Project> {
    const project = await this.fileService.createProject(projectPath, projectName)
    this.state.project = project
    this.state.currentFileId = null
    this.state.files.clear()
    return project
  }

  /**
   * Load an existing project
   */
  async openProject(projectPath: string): Promise<Project> {
    const project = await this.fileService.loadProject(projectPath)
    this.state.project = project

    // Load all file contents
    const contents = await this.fileService.loadProjectFilesContent(
      projectPath,
      project.files
    )

    for (const file of project.files) {
      const content = contents.get(file.id) || ''
      this.state.files.set(file.id, {
        content,
        originalContent: content,
        isDirty: false,
      })
    }

    // Set first file as current
    if (project.files.length > 0) {
      this.state.currentFileId = project.files[0].id
    }

    return project
  }

  /**
   * Save current project to disk
   */
  async saveProject(): Promise<void> {
    if (!this.state.project) {
      throw new Error('No project open')
    }

    for (const file of this.state.project.files) {
      const fileState = this.state.files.get(file.id)
      if (fileState && fileState.isDirty) {
        await this.fileService.writeXmlFile(file.path, fileState.content)
        fileState.isDirty = false
        fileState.originalContent = fileState.content
      }
    }
  }

  /**
   * Close current project
   */
  closeProject(): void {
    this.state.project = null
    this.state.currentFileId = null
    this.state.files.clear()
    this.state.history = { undo: [], redo: [] }
  }

  // ============================================================
  // FILE OPERATIONS
  // ============================================================

  /**
   * Open a file in the editor
   */
  async openFile(fileId: string): Promise<string> {
    const file = this.state.project?.files.find((f) => f.id === fileId)
    if (!file) {
      throw new Error('File not found')
    }

    this.state.currentFileId = fileId

    const fileState = this.state.files.get(fileId)
    return fileState?.content || ''
  }

  /**
   * Get current file ID
   */
  getCurrentFileId(): string | null {
    return this.state.currentFileId
  }

  /**
   * Get current file content
   */
  getCurrentFileContent(): string {
    if (!this.state.currentFileId) {
      return ''
    }

    const fileState = this.state.files.get(this.state.currentFileId)
    return fileState?.content || ''
  }

  /**
   * Update current file content (JPE text)
   *
   * This is called when user types in the editor
   * Marks file as dirty and clears redo history
   */
  updateFileContent(content: string): void {
    if (!this.state.currentFileId) {
      return
    }

    let fileState = this.state.files.get(this.state.currentFileId)
    if (!fileState) {
      fileState = {
        content,
        originalContent: '',
        isDirty: true,
      }
      this.state.files.set(this.state.currentFileId, fileState)
    } else {
      fileState.content = content
      fileState.isDirty =
        fileState.content !== fileState.originalContent
    }

    // Clear redo when user edits
    this.state.history.redo = []
  }

  /**
   * Add new file to project
   */
  async addFile(fileName: string): Promise<ProjectFile> {
    if (!this.state.project) {
      throw new Error('No project open')
    }

    // Create empty file on disk
    const file = await this.fileService.addFileToProject(
      this.state.project.path,
      fileName,
      ''
    )

    // Add to project
    this.state.project.files.push(file)

    // Add to memory
    this.state.files.set(file.id, {
      content: '',
      originalContent: '',
      isDirty: true,
    })

    return file
  }

  /**
   * Remove file from project
   */
  async removeFile(fileId: string): Promise<void> {
    if (!this.state.project) {
      throw new Error('No project open')
    }

    const file = this.state.project.files.find((f) => f.id === fileId)
    if (!file) {
      throw new Error('File not found')
    }

    // Remove from disk
    await this.fileService.removeFileFromProject(
      this.state.project.path,
      file.name
    )

    // Remove from project
    this.state.project.files = this.state.project.files.filter(
      (f) => f.id !== fileId
    )

    // Remove from memory
    this.state.files.delete(fileId)

    // Switch to another file if current was removed
    if (this.state.currentFileId === fileId) {
      this.state.currentFileId = this.state.project.files[0]?.id || null
    }
  }

  // ============================================================
  // COMPILATION & VALIDATION
  // ============================================================

  /**
   * Compile current file JPE → XML
   *
   * Main workflow: User edits JPE → Clicks Compile → Gets XML
   */
  compileCurrentFile(): {
    success: boolean
    xml?: string
    error?: string
    diagnostics?: any[]
  } {
    const content = this.getCurrentFileContent()

    // Compile JPE to XML
    const result = compileJpeToXml(content)

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        diagnostics: result.diagnostics,
      }
    }

    return {
      success: true,
      xml: result.xml,
      diagnostics: result.diagnostics,
    }
  }

  /**
   * Get diagnostics for current file
   *
   * Used by editor to show real-time validation
   * Much faster than full compilation
   */
  getDiagnosticsForCurrentFile(): {
    errors: any[]
    canCompile: boolean
  } {
    const content = this.getCurrentFileContent()
    return getCompilationDiagnostics(content)
  }

  /**
   * Convert XML file to JPE format
   *
   * Used when opening XML file - converts to human-readable JPE
   */
  convertXmlToJpe(xmlContent: string): {
    success: boolean
    jpe?: string
    error?: string
  } {
    try {
      // Parse XML
      const parseResult = parseXml(xmlContent)
      if (!parseResult.success || !parseResult.ast) {
        return {
          success: false,
          error: parseResult.error,
        }
      }

      // Convert to JPE
      const jpeResult = astToJpe(parseResult.ast)
      if (!jpeResult.success) {
        return {
          success: false,
          error: jpeResult.error,
        }
      }

      return {
        success: true,
        jpe: jpeResult.jpe,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // ============================================================
  // UNDO/REDO
  // ============================================================

  /**
   * Undo last change
   */
  undo(): string {
    const current = this.getCurrentFileContent()
    this.state.history.undo.push(current)

    if (this.state.history.undo.length > 1) {
      const previous = this.state.history.undo[
        this.state.history.undo.length - 2
      ]
      this.updateFileContent(previous)
      this.state.history.redo.push(current)
      return previous
    }

    return current
  }

  /**
   * Redo last undo
   */
  redo(): string {
    if (this.state.history.redo.length === 0) {
      return this.getCurrentFileContent()
    }

    const next = this.state.history.redo.pop()!
    this.updateFileContent(next)
    this.state.history.undo.push(next)
    return next
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.state.history.undo.length > 1
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.state.history.redo.length > 0
  }

  // ============================================================
  // PROJECT STATE ACCESS
  // ============================================================

  /**
   * Get current project
   */
  getProject(): Project | null {
    return this.state.project
  }

  /**
   * Get all files in current project
   */
  getFiles(): ProjectFile[] {
    return this.state.project?.files || []
  }

  /**
   * Get file by ID
   */
  getFile(fileId: string): ProjectFile | undefined {
    return this.state.project?.files.find((f) => f.id === fileId)
  }

  /**
   * Get current file
   */
  getCurrentFile(): ProjectFile | undefined {
    if (!this.state.currentFileId) {
      return undefined
    }
    return this.getFile(this.state.currentFileId)
  }

  /**
   * Check if file has unsaved changes
   */
  isFileDirty(fileId: string): boolean {
    const fileState = this.state.files.get(fileId)
    return fileState?.isDirty || false
  }

  /**
   * Check if any file has unsaved changes
   */
  hasUnsavedChanges(): boolean {
    for (const fileState of this.state.files.values()) {
      if (fileState.isDirty) {
        return true
      }
    }
    return false
  }
}
