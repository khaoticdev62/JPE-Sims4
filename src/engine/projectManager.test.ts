/**
 * PROJECT MANAGER TESTS
 *
 * Tests for the complete project workflow:
 * - Project creation and opening
 * - File operations (open, save, add, remove)
 * - Compilation workflow
 * - Undo/Redo functionality
 * - State management
 *
 * Uses mock FileService backend for testing
 */

import { ProjectManager } from './projectManager'
import { FileServiceBackend } from './fileService'

/**
 * Mock File Service Backend for testing
 */
class MockBackend implements FileServiceBackend {
  private files: Map<string, string> = new Map()
  private directories: Set<string> = new Set()

  async readFile(path: string): Promise<string> {
    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`)
    }
    return this.files.get(path)!
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content)
  }

  async fileExists(path: string): Promise<boolean> {
    return this.files.has(path)
  }

  async mkdir(path: string): Promise<void> {
    this.directories.add(path)
  }

  async rmdir(path: string): Promise<void> {
    this.directories.delete(path)
    const prefix = `${path}/`
    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(prefix)) {
        this.files.delete(filePath)
      }
    }
  }

  async readdir(path: string): Promise<string[]> {
    const prefix = `${path}/`
    const files = new Set<string>()
    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(prefix)) {
        const relative = filePath.substring(prefix.length)
        const fileName = relative.split('/')[0]
        files.add(fileName)
      }
    }
    return Array.from(files)
  }
}

describe('Project Manager', () => {
  let manager: ProjectManager
  let backend: MockBackend

  beforeEach(() => {
    backend = new MockBackend()
    manager = new ProjectManager(backend)
  })

  // ============================================================
  // PROJECT LIFECYCLE
  // ============================================================

  test('Create project should initialize project state', async () => {
    const project = await manager.createProject('/projects/test', 'Test Project')

    expect(project.name).toBe('Test Project')
    expect(project.files).toEqual([])
    expect(manager.getProject()).toEqual(project)
  })

  test('Open project should load all files', async () => {
    // Create and add files
    await manager.createProject('/projects/load', 'Load Test')
    await manager.addFile('test1.xml')
    await manager.addFile('test2.xml')
    await manager.saveProject()

    // Create new manager and open project
    const newManager = new ProjectManager(backend)
    const project = await newManager.openProject('/projects/load')

    expect(project.files.length).toBe(2)
    expect(newManager.getFiles().length).toBe(2)
  })

  test('Close project should clear state', async () => {
    await manager.createProject('/projects/close', 'Close Test')
    manager.closeProject()

    expect(manager.getProject()).toBeNull()
    expect(manager.getFiles()).toEqual([])
  })

  // ============================================================
  // FILE OPERATIONS
  // ============================================================

  test('Open file should set current file', async () => {
    await manager.createProject('/projects/open', 'Open Test')
    const file = await manager.addFile('test.xml')

    const content = await manager.openFile(file.id)

    expect(manager.getCurrentFileId()).toBe(file.id)
    expect(manager.getCurrentFile()).toEqual(file)
  })

  test('Update file content should mark as dirty', async () => {
    await manager.createProject('/projects/dirty', 'Dirty Test')
    const file = await manager.addFile('test.xml')
    await manager.openFile(file.id)

    manager.updateFileContent('new content')

    expect(manager.isFileDirty(file.id)).toBe(true)
    expect(manager.hasUnsavedChanges()).toBe(true)
  })

  test('Save project should clear dirty flag', async () => {
    await manager.createProject('/projects/save', 'Save Test')
    const file = await manager.addFile('test.xml')
    await manager.openFile(file.id)

    manager.updateFileContent('content')
    await manager.saveProject()

    expect(manager.isFileDirty(file.id)).toBe(false)
  })

  test('Add file should create new file in project', async () => {
    await manager.createProject('/projects/add', 'Add Test')

    const file = await manager.addFile('newfile.xml')

    expect(file.name).toContain('.xml')
    expect(manager.getFiles().length).toBe(1)
    expect(manager.getFiles()[0]).toEqual(file)
  })

  test('Remove file should delete from project', async () => {
    await manager.createProject('/projects/remove', 'Remove Test')
    const file = await manager.addFile('test.xml')

    await manager.removeFile(file.id)

    expect(manager.getFiles().length).toBe(0)
    expect(manager.getFile(file.id)).toBeUndefined()
  })

  test('Get file by ID should return correct file', async () => {
    await manager.createProject('/projects/get', 'Get Test')
    const file1 = await manager.addFile('file1.xml')
    const file2 = await manager.addFile('file2.xml')

    expect(manager.getFile(file1.id)).toEqual(file1)
    expect(manager.getFile(file2.id)).toEqual(file2)
  })

  // ============================================================
  // COMPILATION
  // ============================================================

  test('Compile valid JPE should succeed', async () => {
    await manager.createProject('/projects/compile', 'Compile Test')
    const file = await manager.addFile('test.xml')
    await manager.openFile(file.id)

    manager.updateFileContent('MODULE: TestMod\nDESCRIPTION: "Test"')

    const result = manager.compileCurrentFile()

    expect(result.success).toBe(true)
    expect(result.xml).toBeDefined()
    expect(result.xml).toContain('TestMod')
  })

  test('Compile invalid JPE should fail', async () => {
    await manager.createProject('/projects/invalid', 'Invalid Test')
    const file = await manager.addFile('test.xml')
    await manager.openFile(file.id)

    manager.updateFileContent('BADKEYWORD: value')

    const result = manager.compileCurrentFile()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  test('Get diagnostics should return validation results', async () => {
    await manager.createProject('/projects/diag', 'Diag Test')
    const file = await manager.addFile('test.xml')
    await manager.openFile(file.id)

    manager.updateFileContent('MODULE: Test')

    const diag = manager.getDiagnosticsForCurrentFile()

    expect(diag.canCompile).toBe(true)
    expect(Array.isArray(diag.errors)).toBe(true)
  })

  // ============================================================
  // CONVERSIONS
  // ============================================================

  test('Convert XML to JPE should work', async () => {
    await manager.createProject('/projects/convert', 'Convert Test')

    const xml = '<ModPackage><Name>TestMod</Name></ModPackage>'
    const result = manager.convertXmlToJpe(xml)

    expect(result.success).toBe(true)
    expect(result.jpe).toBeDefined()
    expect(result.jpe).toContain('TestMod')
  })

  test('Invalid XML conversion should fail', async () => {
    await manager.createProject('/projects/badxml', 'Bad XML Test')

    const result = manager.convertXmlToJpe('not valid xml {]')

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  // ============================================================
  // UNDO/REDO
  // ============================================================

  test('Undo should restore previous content', async () => {
    await manager.createProject('/projects/undo', 'Undo Test')
    const file = await manager.addFile('test.xml')
    await manager.openFile(file.id)

    manager.updateFileContent('version 1')
    manager.updateFileContent('version 2')

    manager.undo()
    const content = manager.getCurrentFileContent()

    expect(content).toBe('version 1')
  })

  test('Redo should restore undone content', async () => {
    await manager.createProject('/projects/redo', 'Redo Test')
    const file = await manager.addFile('test.xml')
    await manager.openFile(file.id)

    manager.updateFileContent('version 1')
    manager.updateFileContent('version 2')

    manager.undo()
    manager.redo()
    const content = manager.getCurrentFileContent()

    expect(content).toBe('version 2')
  })

  test('canUndo should report correctly', async () => {
    await manager.createProject('/projects/candound', 'Can Undo Test')
    const file = await manager.addFile('test.xml')
    await manager.openFile(file.id)

    expect(manager.canUndo()).toBe(false)

    manager.updateFileContent('content')
    expect(manager.canUndo()).toBe(true)
  })

  test('canRedo should report correctly', async () => {
    await manager.createProject('/projects/canredo', 'Can Redo Test')
    const file = await manager.addFile('test.xml')
    await manager.openFile(file.id)

    manager.updateFileContent('content1')
    manager.updateFileContent('content2')

    expect(manager.canRedo()).toBe(false)

    manager.undo()
    expect(manager.canRedo()).toBe(true)
  })

  test('Redo history should clear on edit', async () => {
    await manager.createProject('/projects/redoclear', 'Redo Clear Test')
    const file = await manager.addFile('test.xml')
    await manager.openFile(file.id)

    manager.updateFileContent('v1')
    manager.updateFileContent('v2')
    manager.undo()

    expect(manager.canRedo()).toBe(true)

    manager.updateFileContent('v3')

    expect(manager.canRedo()).toBe(false)
  })

  // ============================================================
  // STATE CHECKS
  // ============================================================

  test('hasUnsavedChanges should track all files', async () => {
    await manager.createProject('/projects/unsaved', 'Unsaved Test')
    const file1 = await manager.addFile('file1.xml')
    const file2 = await manager.addFile('file2.xml')

    await manager.openFile(file1.id)
    manager.updateFileContent('content1')

    expect(manager.hasUnsavedChanges()).toBe(true)

    await manager.saveProject()

    expect(manager.hasUnsavedChanges()).toBe(false)

    await manager.openFile(file2.id)
    manager.updateFileContent('content2')

    expect(manager.hasUnsavedChanges()).toBe(true)
  })

  test('getCurrentFileContent should return correct content', async () => {
    await manager.createProject('/projects/getcontent', 'Get Content Test')
    const file = await manager.addFile('test.xml')
    await manager.openFile(file.id)

    manager.updateFileContent('test content')

    expect(manager.getCurrentFileContent()).toBe('test content')
  })

  // ============================================================
  // COMPLETE WORKFLOW
  // ============================================================

  test('Full workflow: create, add, edit, compile, save', async () => {
    // Create project
    const project = await manager.createProject(
      '/projects/workflow',
      'Workflow Test'
    )
    expect(project.name).toBe('Workflow Test')

    // Add file
    const file = await manager.addFile('outfit.xml')
    expect(manager.getFiles().length).toBe(1)

    // Open and edit
    await manager.openFile(file.id)
    manager.updateFileContent('MODULE: MyOutfit\nDESCRIPTION: "My outfit"')
    expect(manager.isFileDirty(file.id)).toBe(true)

    // Compile
    const compiled = manager.compileCurrentFile()
    expect(compiled.success).toBe(true)

    // Save
    await manager.saveProject()
    expect(manager.isFileDirty(file.id)).toBe(false)

    // Verify
    expect(manager.hasUnsavedChanges()).toBe(false)
  })

  test('Multi-file workflow', async () => {
    await manager.createProject('/projects/multi', 'Multi File Test')

    // Create multiple files
    const file1 = await manager.addFile('outfit.xml')
    const file2 = await manager.addFile('traits.xml')

    // Edit file1
    await manager.openFile(file1.id)
    manager.updateFileContent('MODULE: Outfit')

    // Switch to file2
    await manager.openFile(file2.id)
    manager.updateFileContent('MODULE: Traits')

    // Verify both are dirty
    expect(manager.isFileDirty(file1.id)).toBe(true)
    expect(manager.isFileDirty(file2.id)).toBe(true)

    // Save all
    await manager.saveProject()

    // Verify both saved
    expect(manager.isFileDirty(file1.id)).toBe(false)
    expect(manager.isFileDirty(file2.id)).toBe(false)
  })
})
