/**
 * useProjectStore unit tests
 * Tests project state management
 */

import { renderHook, act } from '@testing-library/react'
import { useProjectStore } from './useProjectStore'
import type { ModFile } from '@types/index'

describe('useProjectStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useProjectStore.setState({
      projectId: null,
      projectPath: null,
      projectName: null,
      files: [],
      isDirty: false,
    })
  })

  describe('project management', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useProjectStore())
      expect(result.current.projectId).toBeNull()
      expect(result.current.files).toEqual([])
      expect(result.current.isDirty).toBe(false)
    })

    it('should create a new project', () => {
      const { result } = renderHook(() => useProjectStore())
      const projectId = 'proj-1'
      const projectPath = '/path/to/project'
      const projectName = 'Test Project'

      act(() => {
        result.current.createProject(projectId, projectPath, projectName)
      })

      expect(result.current.projectId).toBe(projectId)
      expect(result.current.projectPath).toBe(projectPath)
      expect(result.current.projectName).toBe(projectName)
    })

    it('should open an existing project', () => {
      const { result } = renderHook(() => useProjectStore())
      const projectId = 'proj-2'

      act(() => {
        result.current.openProject(projectId)
      })

      expect(result.current.projectId).toBe(projectId)
    })

    it('should close current project', () => {
      const { result } = renderHook(() => useProjectStore())

      act(() => {
        result.current.createProject('proj-1', '/path', 'Test')
        result.current.closeProject()
      })

      expect(result.current.projectId).toBeNull()
      expect(result.current.projectPath).toBeNull()
      expect(result.current.projectName).toBeNull()
    })
  })

  describe('file management', () => {
    const sampleFile: ModFile = {
      id: 'file-1',
      name: 'test.xml',
      path: '/test/test.xml',
      type: 'xml',
      content: 'content',
      isDirty: false,
      size: 7,
      lastModified: new Date(),
    }

    it('should add a file', () => {
      const { result } = renderHook(() => useProjectStore())

      act(() => {
        result.current.addFile(sampleFile)
      })

      expect(result.current.files).toHaveLength(1)
      expect(result.current.files[0].id).toBe('file-1')
    })

    it('should add multiple files', () => {
      const { result } = renderHook(() => useProjectStore())

      act(() => {
        result.current.addFile(sampleFile)
        result.current.addFile({ ...sampleFile, id: 'file-2', name: 'test2.xml' })
      })

      expect(result.current.files).toHaveLength(2)
    })

    it('should get file by ID', () => {
      const { result } = renderHook(() => useProjectStore())

      act(() => {
        result.current.addFile(sampleFile)
      })

      const file = result.current.getFile('file-1')
      expect(file).not.toBeNull()
      expect(file?.id).toBe('file-1')
    })

    it('should return null for non-existent file', () => {
      const { result } = renderHook(() => useProjectStore())
      const file = result.current.getFile('nonexistent')
      expect(file).toBeNull()
    })

    it('should update file content', () => {
      const { result } = renderHook(() => useProjectStore())

      act(() => {
        result.current.addFile(sampleFile)
        result.current.updateFile('file-1', { content: 'new content', isDirty: true })
      })

      const file = result.current.getFile('file-1')
      expect(file?.content).toBe('new content')
      expect(file?.isDirty).toBe(true)
    })

    it('should remove file', () => {
      const { result } = renderHook(() => useProjectStore())

      act(() => {
        result.current.addFile(sampleFile)
        result.current.removeFile('file-1')
      })

      expect(result.current.files).toHaveLength(0)
    })

    it('should not error when removing non-existent file', () => {
      const { result } = renderHook(() => useProjectStore())

      expect(() => {
        act(() => {
          result.current.removeFile('nonexistent')
        })
      }).not.toThrow()
    })
  })

  describe('project dirty state', () => {
    it('should mark project as dirty when file is updated', () => {
      const { result } = renderHook(() => useProjectStore())
      const sampleFile: ModFile = {
        id: 'file-1',
        name: 'test.xml',
        path: '/test/test.xml',
        type: 'xml',
        content: 'content',
        isDirty: false,
        size: 7,
        lastModified: new Date(),
      }

      act(() => {
        result.current.addFile(sampleFile)
        result.current.updateFile('file-1', { isDirty: true })
      })

      const hasDirtyFile = result.current.files.some((f) => f.isDirty)
      expect(hasDirtyFile).toBe(true)
    })

    it('should clear dirty state', () => {
      const { result } = renderHook(() => useProjectStore())
      const sampleFile: ModFile = {
        id: 'file-1',
        name: 'test.xml',
        path: '/test/test.xml',
        type: 'xml',
        content: 'content',
        isDirty: true,
        size: 7,
        lastModified: new Date(),
      }

      act(() => {
        result.current.addFile(sampleFile)
        result.current.updateFile('file-1', { isDirty: false })
      })

      const file = result.current.getFile('file-1')
      expect(file?.isDirty).toBe(false)
    })
  })

  describe('file filtering', () => {
    it('should filter files by type', () => {
      const { result } = renderHook(() => useProjectStore())

      act(() => {
        result.current.addFile({
          id: 'file-1',
          name: 'test.xml',
          path: '/test.xml',
          type: 'xml',
          content: 'content',
          isDirty: false,
          size: 7,
          lastModified: new Date(),
        })
        result.current.addFile({
          id: 'file-2',
          name: 'test.txt',
          path: '/test.txt',
          type: 'txt',
          content: 'content',
          isDirty: false,
          size: 7,
          lastModified: new Date(),
        })
      })

      const xmlFiles = result.current.files.filter((f) => f.type === 'xml')
      expect(xmlFiles).toHaveLength(1)
      expect(xmlFiles[0].id).toBe('file-1')
    })
  })

  describe('batch operations', () => {
    it('should handle multiple updates', () => {
      const { result } = renderHook(() => useProjectStore())

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.addFile({
            id: `file-${i}`,
            name: `test${i}.xml`,
            path: `/test${i}.xml`,
            type: 'xml',
            content: `content${i}`,
            isDirty: false,
            size: 7,
            lastModified: new Date(),
          })
        }
      })

      expect(result.current.files).toHaveLength(5)

      act(() => {
        result.current.files.forEach((f) => {
          result.current.updateFile(f.id, { isDirty: true })
        })
      })

      const dirtyCount = result.current.files.filter((f) => f.isDirty).length
      expect(dirtyCount).toBe(5)
    })
  })
})
