import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProjectService } from './ProjectService'
import { FileService } from './FileService'

vi.mock('./FileService', () => ({
  FileService: {
    createDirectory: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    fileExists: vi.fn(),
    listDirectory: vi.fn(),
    deleteFile: vi.fn(),
  },
}))

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createProject', () => {
    it('should create directory structure and metadata file', async () => {
      vi.mocked(FileService.fileExists).mockResolvedValue(false)
      vi.mocked(FileService.createDirectory).mockResolvedValue(true)
      vi.mocked(FileService.writeFile).mockResolvedValue({ success: true })

      const project = await ProjectService.createProject('TestMod', '/path/to/project')

      expect(project).not.toBeNull()
      expect(project?.name).toBe('TestMod')
      expect(FileService.createDirectory).toHaveBeenCalledTimes(3) // root, /mods, /.jpe_history
      expect(FileService.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.jpe-project.json'),
        expect.stringContaining('"name": "TestMod"')
      )
    })

    it('should return null if directory creation fails', async () => {
      vi.mocked(FileService.fileExists).mockResolvedValue(false)
      vi.mocked(FileService.createDirectory).mockResolvedValue(false)

      const project = await ProjectService.createProject('TestMod', '/path/to/project')

      expect(project).toBeNull()
    })
  })

  describe('openProject', () => {
    it('should load metadata and discover files', async () => {
      const mockMetadata = JSON.stringify({
        id: 'project-123',
        name: 'TestMod',
        metadata: { version: '1.0.0' },
      })

      vi.mocked(FileService.fileExists).mockResolvedValue(true)
      vi.mocked(FileService.readFile).mockResolvedValue({
        success: true,
        content: mockMetadata,
      })
      vi.mocked(FileService.listDirectory).mockResolvedValue({
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
      vi.mocked(FileService.readFile).mockResolvedValue({ success: true, content: 'xml content' })
      vi.mocked(FileService.writeFile).mockResolvedValue({ success: true, size: 11 })

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
      vi.mocked(FileService.readFile).mockResolvedValue({ success: true, content: 'content' })
      vi.mocked(FileService.writeFile).mockResolvedValue({ success: true })
      vi.mocked(FileService.deleteFile).mockResolvedValue(true)

      const newPath = await ProjectService.renameFileInProject(mockFile, 'new.xml')

      expect(newPath).toBe('/root/mods/new.xml')
      expect(FileService.writeFile).toHaveBeenCalledWith('/root/mods/new.xml', 'content')
      expect(FileService.deleteFile).toHaveBeenCalledWith('/root/mods/old.xml')
    })
  })

  describe('deleteFileFromProject', () => {
    it('should call deleteFile on FileService', async () => {
      const mockFile = { path: '/root/mods/mod.xml' } as any
      vi.mocked(FileService.deleteFile).mockResolvedValue(true)

      const success = await ProjectService.deleteFileFromProject(mockFile)

      expect(success).toBe(true)
      expect(FileService.deleteFile).toHaveBeenCalledWith('/root/mods/mod.xml')
    })
  })
})
