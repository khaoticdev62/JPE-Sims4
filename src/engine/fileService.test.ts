/**
 * FILE SERVICE TESTS
 *
 * Tests for file I/O and project management:
 * - Project creation and deletion
 * - File reading and writing
 * - Project metadata
 * - Batch operations
 *
 * Uses mock backend for testing
 */

import { FileService, FileServiceBackend } from './fileService'

/**
 * Mock File Service Backend for testing
 * Simulates file operations without touching disk
 */
class MockFileServiceBackend implements FileServiceBackend {
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
    // Remove all files in this directory
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

  // Helpers for testing
  getAllFiles(): Map<string, string> {
    return this.files
  }
}

describe('File Service', () => {
  let backend: MockFileServiceBackend
  let service: FileService

  beforeEach(() => {
    backend = new MockFileServiceBackend()
    service = new FileService(backend)
  })

  // ============================================================
  // PROJECT CREATION
  // ============================================================

  test('Create project should create directory structure', async () => {
    const project = await service.createProject('/projects/myproj', 'My Project')

    expect(project.name).toBe('My Project')
    expect(project.path).toBe('/projects/myproj')
    expect(project.files).toEqual([])
    expect(project.id).toBeDefined()
  })

  test('Create project should create project.json metadata', async () => {
    await service.createProject('/projects/test', 'Test Project')

    const files = backend.getAllFiles()
    expect(files.has('/projects/test/project.json')).toBe(true)
  })

  test('Project metadata should include timestamps', async () => {
    const project = await service.createProject('/projects/timed', 'Timed Project')

    expect(project.createdAt).toBeDefined()
    expect(project.updatedAt).toBeDefined()
    expect(new Date(project.createdAt).getTime()).toBeGreaterThan(0)
  })

  // ============================================================
  // PROJECT LOADING
  // ============================================================

  test('Load existing project should read metadata', async () => {
    // Create a project first
    await service.createProject('/projects/load', 'Load Test')

    // Load it back
    const loaded = await service.loadProject('/projects/load')

    expect(loaded.name).toBe('Load Test')
    expect(loaded.path).toBe('/projects/load')
  })

  test('Load project with files should list all files', async () => {
    const project = await service.createProject('/projects/withfiles', 'With Files')

    // Add files
    await service.addFileToProject('/projects/withfiles', 'test1.xml')
    await service.addFileToProject('/projects/withfiles', 'test2.xml')

    // Load project
    const loaded = await service.loadProject('/projects/withfiles')

    expect(loaded.files.length).toBe(2)
    expect(loaded.files.some((f) => f.name === 'test1.xml')).toBe(true)
    expect(loaded.files.some((f) => f.name === 'test2.xml')).toBe(true)
  })

  test('Load non-existent project should error', async () => {
    await expect(service.loadProject('/projects/nonexistent')).rejects.toThrow()
  })

  // ============================================================
  // FILE OPERATIONS
  // ============================================================

  test('Add file to project should create XML file', async () => {
    const project = await service.createProject('/projects/addfile', 'Add File Test')

    const file = await service.addFileToProject('/projects/addfile', 'newfile.xml', '<test/>')

    expect(file.name).toBe('newfile.xml')
    expect(file.path).toContain('/projects/addfile/files')
  })

  test('Add file without .xml extension should add it', async () => {
    await service.createProject('/projects/ext', 'Ext Test')

    const file = await service.addFileToProject('/projects/ext', 'noext', '<test/>')

    expect(file.name).toBe('noext.xml')
  })

  test('Read XML file should return content', async () => {
    const project = await service.createProject('/projects/read', 'Read Test')

    const file = await service.addFileToProject('/projects/read', 'content.xml', '<content>Test Data</content>')

    const content = await service.readXmlFile(file.path)

    expect(content).toBe('<content>Test Data</content>')
  })

  test('Write XML file should update content', async () => {
    const project = await service.createProject('/projects/write', 'Write Test')

    const file = await service.addFileToProject('/projects/write', 'test.xml', '<old/>')

    await service.writeXmlFile(file.path, '<new/>')

    const content = await service.readXmlFile(file.path)

    expect(content).toBe('<new/>')
  })

  test('File exists check should work correctly', async () => {
    const project = await service.createProject('/projects/exists', 'Exists Test')

    const file = await service.addFileToProject('/projects/exists', 'test.xml', '<test/>')

    expect(await service.fileExists(file.path)).toBe(true)
    expect(await service.fileExists('/projects/exists/files/nonexistent.xml')).toBe(false)
  })

  // ============================================================
  // PROJECT DELETION
  // ============================================================

  test('Delete project should remove all files', async () => {
    const project = await service.createProject('/projects/delete', 'Delete Test')

    await service.addFileToProject('/projects/delete', 'file1.xml')
    await service.addFileToProject('/projects/delete', 'file2.xml')

    await service.deleteProject('/projects/delete')

    // All files should be gone
    const files = backend.getAllFiles()
    const projectFiles = Array.from(files.keys()).filter((p) =>
      p.startsWith('/projects/delete')
    )
    expect(projectFiles.length).toBe(0)
  })

  // ============================================================
  // BATCH OPERATIONS
  // ============================================================

  test('Load project files content should return map', async () => {
    const project = await service.createProject('/projects/batch', 'Batch Test')

    const file1 = await service.addFileToProject('/projects/batch', 'file1.xml', '<data1/>')
    const file2 = await service.addFileToProject('/projects/batch', 'file2.xml', '<data2/>')

    const contents = await service.loadProjectFilesContent('/projects/batch', [file1, file2])

    expect(contents.size).toBe(2)
    expect(contents.get(file1.id)).toBe('<data1/>')
    expect(contents.get(file2.id)).toBe('<data2/>')
  })

  // ============================================================
  // INTEGRATION TESTS
  // ============================================================

  test('Complete workflow: create, add files, modify, load', async () => {
    // Create
    await service.createProject('/projects/workflow', 'Workflow Test')

    // Add files
    const file1 = await service.addFileToProject('/projects/workflow', 'outfit.xml', '<outfit/>')
    const file2 = await service.addFileToProject('/projects/workflow', 'traits.xml', '<traits/>')

    // Modify
    await service.writeXmlFile(file1.path, '<outfit updated/>')

    // Load
    const loaded = await service.loadProject('/projects/workflow')

    expect(loaded.files.length).toBe(2)
    const content = await service.readXmlFile(file1.path)
    expect(content).toBe('<outfit updated/>')
  })

  test('Multiple projects should not interfere', async () => {
    const proj1 = await service.createProject('/projects/proj1', 'Project 1')
    const proj2 = await service.createProject('/projects/proj2', 'Project 2')

    await service.addFileToProject('/projects/proj1', 'file.xml', 'proj1 data')
    await service.addFileToProject('/projects/proj2', 'file.xml', 'proj2 data')

    const loaded1 = await service.loadProject('/projects/proj1')
    const loaded2 = await service.loadProject('/projects/proj2')

    expect(loaded1.name).toBe('Project 1')
    expect(loaded2.name).toBe('Project 2')

    const content1 = await service.readXmlFile(loaded1.files[0].path)
    const content2 = await service.readXmlFile(loaded2.files[0].path)

    expect(content1).toBe('proj1 data')
    expect(content2).toBe('proj2 data')
  })

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  test('Read non-existent file should error', async () => {
    await expect(service.readXmlFile('/projects/none/file.xml')).rejects.toThrow()
  })

  test('Remove file from non-existent project should error', async () => {
    await expect(
      service.removeFileFromProject('/projects/none', 'file.xml')
    ).rejects.toThrow()
  })

  // ============================================================
  // FILE METADATA
  // ============================================================

  test('Added file should have metadata', async () => {
    await service.createProject('/projects/meta', 'Meta Test')

    const file = await service.addFileToProject('/projects/meta', 'test.xml', '<test/>')

    expect(file.id).toBeDefined()
    expect(file.name).toBe('test.xml')
    expect(file.type).toBe('xml')
    expect(file.createdAt).toBeDefined()
    expect(file.modifiedAt).toBeDefined()
  })
})
