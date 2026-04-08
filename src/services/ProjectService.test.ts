// Vitest not available - using Jest
import { describe, it, expect, beforeEach } from '@jest/globals'
import { ProjectService } from './ProjectService'
import { FileService } from './FileService'

jest.mock('./FileService', () => ({
  FileService: {
    createDirectory: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    fileExists: jest.fn(),
    listDirectory: jest.fn(),
    deleteFile: jest.fn(),
  },
}))

describe('ProjectService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createProject', () => {
    it('should create directory structure and metadata file', async () => {
      jest.mocked(FileService.fileExists).mockResolvedValue(false)
      jest.mocked(FileService.createDirectory).mockResolvedValue({ success: true, path: 'test.xml' } as any)
      jest.mocked(FileService.writeFile).mockResolvedValue({ success: true })

      const project = await ProjectService.createProject('TestMod', '/path/to/project')

      expect(project).not.toBeNull()
      expect(project?.name).toBe('TestMod')
      expect(FileService.createDirectory).toHaveBeenCalledTimes(3) // root, /mods, /.jpe_history
      expect(FileService.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.jpe-project.json'),
        expect.stringContaining('"name": "TestMod"')
      )
    })

    it('should create correct directory structure', async () => {
      jest.mocked(FileService.fileExists).mockResolvedValue(false)
      jest.mocked(FileService.createDirectory).mockResolvedValue({ success: true, path: 'test.xml' } as any)
      jest.mocked(FileService.writeFile).mockResolvedValue({ success: true })

      await ProjectService.createProject('TestMod', '/path/to/project')

      // Verify the three directories are created
      expect(FileService.createDirectory).toHaveBeenCalledWith('/path/to/project')
      expect(FileService.createDirectory).toHaveBeenCalledWith('/path/to/project/mods')
      expect(FileService.createDirectory).toHaveBeenCalledWith('/path/to/project/.jpe_history')
    })

    it('should return null if directory creation fails', async () => {
      jest.mocked(FileService.fileExists).mockResolvedValue(false)
      jest.mocked(FileService.createDirectory).mockResolvedValue(false)

      const project = await ProjectService.createProject('TestMod', '/path/to/project')

      expect(project).toBeNull()
    })

    it('should create valid project object with metadata', async () => {
      jest.mocked(FileService.fileExists).mockResolvedValue(false)
      jest.mocked(FileService.createDirectory).mockResolvedValue({ success: true, path: 'test.xml' } as any)
      jest.mocked(FileService.writeFile).mockResolvedValue({ success: true })

      const project = await ProjectService.createProject('MyMod', '/projects/mymod')

      expect(project).toBeDefined()
      expect(project?.id).toBeDefined()
      expect(project?.name).toBe('MyMod')
      expect(project?.rootPath).toBe('/projects/mymod')
      expect(project?.files).toEqual([])
      expect(project?.metadata).toBeDefined()
      expect(project?.metadata.version).toBe('1.0.0')
      expect(project?.metadata.createdAt).toBeDefined()
      expect(project?.metadata.updatedAt).toBeDefined()
    })

    it('should handle existing directories gracefully', async () => {
      jest.mocked(FileService.fileExists).mockResolvedValue(true)
      jest.mocked(FileService.writeFile).mockResolvedValue({ success: true })

      const project = await ProjectService.createProject('ExistingMod', '/existing/path')

      expect(project).not.toBeNull()
      expect(project?.name).toBe('ExistingMod')
      // Should skip directory creation if they exist
      expect(FileService.createDirectory).not.toHaveBeenCalled()
    })

    it('should handle project names with special characters', async () => {
      jest.mocked(FileService.fileExists).mockResolvedValue(false)
      jest.mocked(FileService.createDirectory).mockResolvedValue({ success: true, path: 'test.xml' } as any)
      jest.mocked(FileService.writeFile).mockResolvedValue({ success: true })

      // ProjectService doesn't validate names - it accepts any string
      // Validation is done in the UI component (NewProjectDialog)
      const project = await ProjectService.createProject('My Mod Project!', '/path/to/project')

      expect(project).not.toBeNull()
      expect(project?.name).toBe('My Mod Project!')
      // Service should still create the project even with special chars
      expect(FileService.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.jpe-project.json'),
        expect.stringContaining('"name": "My Mod Project!"')
      )
    })
  })

  describe('openProject', () => {
    it('should load metadata and discover files', async () => {
      const mockMetadata = JSON.stringify({
        id: 'project-123',
        name: 'TestMod',
        metadata: { version: '1.0.0' },
      })

      jest.mocked(FileService.fileExists).mockResolvedValue({ success: true, path: 'test.xml' } as any)
      jest.mocked(FileService.readFile).mockResolvedValue({
        success: true,
        content: mockMetadata,
      })
      jest.mocked(FileService.listDirectory).mockResolvedValue({
        success: true,
        files: [
          { name: 'mod1.xml', isFile: true, isDirectory: false },
          { name: 'mod2.jpe', isFile: true, isDirectory: false },
          { name: 'readme.txt', isFile: true, isDirectory: false },
        ],
      })

      const project = await ProjectService.openProject('/path/to/project')

      expect(project).not.toBeNull()
      expect(project?.id).toBe('project-123')
      expect(project?.files).toHaveLength(2) // xml and jpe, txt is not in supportedExtensions
      expect(project?.files[0].name).toBe('mod1.xml')
      expect(project?.files[1].name).toBe('mod2.jpe')
    })
  })

  describe('addFileToProject', () => {
    it('should copy file to mods folder and return ModFile', async () => {
      const mockProject = { id: 'p1', name: 'Test', rootPath: '/root', files: [], metadata: {} } as any
      jest.mocked(FileService.readFile).mockResolvedValue({ success: true, content: 'xml content' })
      jest.mocked(FileService.writeFile).mockResolvedValue({ success: true, size: 11 })

      const file = await ProjectService.addFileToProject(mockProject, '/source/mod.xml')

      expect(file).not.toBeNull()
      expect(file?.name).toBe('mod.xml')
      expect(file?.path).toBe('/root/mods/mod.xml')
      expect(FileService.writeFile).toHaveBeenCalledWith('/root/mods/mod.xml', 'xml content')
    })
  })

  describe('renameFileInProject', () => {
    it('should write to new path and delete old file', async () => {
      const mockFile = { id: 'f1', name: 'old.xml', path: '/root/mods/old.xml' } as any
      jest.mocked(FileService.readFile).mockResolvedValue({ success: true, content: 'content' })
      jest.mocked(FileService.writeFile).mockResolvedValue({ success: true })
      jest.mocked(FileService.deleteFile).mockResolvedValue({ success: true, path: 'test.xml' } as any)

      const newPath = await ProjectService.renameFileInProject(mockFile, 'new.xml')

      expect(newPath).toBe('/root/mods/new.xml')
      expect(FileService.writeFile).toHaveBeenCalledWith('/root/mods/new.xml', 'content')
      expect(FileService.deleteFile).toHaveBeenCalledWith('/root/mods/old.xml')
    })
  })

  describe('deleteFileFromProject', () => {
    it('should call deleteFile on FileService', async () => {
      const mockFile = { path: '/root/mods/mod.xml' } as any
      jest.mocked(FileService.deleteFile).mockResolvedValue({ success: true, path: 'test.xml' } as any)

      const success = await ProjectService.deleteFileFromProject(mockFile)

      expect(success).toBe(true)
      expect(FileService.deleteFile).toHaveBeenCalledWith('/root/mods/mod.xml')
    })
  })
})
