/**
 * useProjectStore unit tests
 * Tests project and file state management
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from './useProjectStore'
import type { Project, ModFile } from '@/types/index'

describe('useProjectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({
      currentProject: null,
      recentProjects: [],
      isLoading: false,
      error: null,
    })
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const store = useProjectStore.getState()
      expect(store.currentProject).toBeNull()
      expect(store.recentProjects).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('project management', () => {
    it('should create a new project', async () => {
      let store = useProjectStore.getState()
      await store.createProject('Test Project', '/path/to/project')
      store = useProjectStore.getState()

      expect(store.currentProject).not.toBeNull()
      expect(store.currentProject?.name).toBe('Test Project')
      expect(store.currentProject?.rootPath).toBe('/path/to/project')
    })

    it('should set current project', () => {
      let store = useProjectStore.getState()
      const mockProject: Project = {
        id: 'test-1',
        name: 'Test Project',
        rootPath: '/test',
        files: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      }

      store.setCurrentProject(mockProject)
      store = useProjectStore.getState()
      expect(store.currentProject).toEqual(mockProject)
    })

    it('should add project to recent projects when set', () => {
      let store = useProjectStore.getState()
      const mockProject: Project = {
        id: 'test-1',
        name: 'Test Project',
        rootPath: '/test',
        files: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      }

      store.setCurrentProject(mockProject)
      store = useProjectStore.getState()
      expect(store.recentProjects).toContain(mockProject)
    })

    it('should clear error when setting current project', () => {
      let store = useProjectStore.getState()
      store.setError('Some error')
      store = useProjectStore.getState()
      expect(store.error).toBe('Some error')

      const mockProject: Project = {
        id: 'test-1',
        name: 'Test Project',
        rootPath: '/test',
        files: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      }

      store.setCurrentProject(mockProject)
      store = useProjectStore.getState()
      expect(store.error).toBeNull()
    })
  })

  describe('file management', () => {
    beforeEach(() => {
      const store = useProjectStore.getState()
      const project: Project = {
        id: 'test-proj',
        name: 'Test Project',
        rootPath: '/test',
        files: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      }
      store.setCurrentProject(project)
    })

    it('should add a file to current project', () => {
      let store = useProjectStore.getState()
      const file: ModFile = {
        id: 'file-1',
        name: 'test.xml',
        path: '/test.xml',
        type: 'xml',
        content: 'content',
        isDirty: false,
        size: 7,
        lastModified: new Date(),
      }

      store.addFile(file)
      store = useProjectStore.getState()
      expect(store.currentProject?.files).toHaveLength(1)
      expect(store.currentProject?.files[0].id).toBe('file-1')
    })

    it('should get file by ID', () => {
      let store = useProjectStore.getState()
      const file: ModFile = {
        id: 'file-1',
        name: 'test.xml',
        path: '/test.xml',
        type: 'xml',
        content: 'content',
        isDirty: false,
        size: 7,
        lastModified: new Date(),
      }

      store.addFile(file)
      store = useProjectStore.getState()
      const retrieved = store.getFile('file-1')
      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe('file-1')
    })

    it('should return undefined for non-existent file', () => {
      const store = useProjectStore.getState()
      const file = store.getFile('nonexistent')
      expect(file).toBeUndefined()
    })

    it('should update file content and mark as dirty', () => {
      let store = useProjectStore.getState()
      const file: ModFile = {
        id: 'file-1',
        name: 'test.xml',
        path: '/test.xml',
        type: 'xml',
        content: 'original',
        isDirty: false,
        size: 8,
        lastModified: new Date(),
      }

      store.addFile(file)
      store = useProjectStore.getState()
      store.updateFile('file-1', { content: 'updated' })
      store = useProjectStore.getState()

      const updated = store.getFile('file-1')
      expect(updated?.content).toBe('updated')
      expect(updated?.isDirty).toBe(true)
    })

    it('should remove file from project', () => {
      let store = useProjectStore.getState()
      const file: ModFile = {
        id: 'file-1',
        name: 'test.xml',
        path: '/test.xml',
        type: 'xml',
        content: 'content',
        isDirty: false,
        size: 7,
        lastModified: new Date(),
      }

      store.addFile(file)
      store = useProjectStore.getState()
      expect(store.currentProject?.files).toHaveLength(1)

      store.removeFile('file-1')
      store = useProjectStore.getState()
      expect(store.currentProject?.files).toHaveLength(0)
    })

    it('should handle multiple files', () => {
      let store = useProjectStore.getState()

      for (let i = 0; i < 3; i++) {
        const file: ModFile = {
          id: `file-${i}`,
          name: `test${i}.xml`,
          path: `/test${i}.xml`,
          type: 'xml',
          content: `content${i}`,
          isDirty: false,
          size: 7,
          lastModified: new Date(),
        }
        store.addFile(file)
        store = useProjectStore.getState()
      }

      expect(store.currentProject?.files).toHaveLength(3)
    })
  })

  describe('error handling', () => {
    it('should set error message', () => {
      let store = useProjectStore.getState()
      const errorMsg = 'Test error'

      store.setError(errorMsg)
      store = useProjectStore.getState()
      expect(store.error).toBe(errorMsg)
    })

    it('should clear error when set to null', () => {
      let store = useProjectStore.getState()
      store.setError('Error')
      store = useProjectStore.getState()
      expect(store.error).toBe('Error')

      store.setError(null)
      store = useProjectStore.getState()
      expect(store.error).toBeNull()
    })
  })
})
