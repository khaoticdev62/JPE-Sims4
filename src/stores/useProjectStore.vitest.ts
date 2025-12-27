import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useProjectStore } from './useProjectStore'
import type { Project, ModFile } from '@/types/index'

describe('useProjectStore', () => {
  beforeEach(() => {
    // Clear store before each test
    const store = useProjectStore.getState()
    store.setCurrentProject(null)
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const store = useProjectStore.getState()
      expect(store.currentProject).toBeNull()
      expect(store.recentProjects).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should have initializeStore action', () => {
      const store = useProjectStore.getState()
      expect(typeof store.initializeStore).toBe('function')
    })
  })

  describe('setCurrentProject', () => {
    it('should set current project', () => {
      const store = useProjectStore.getState()
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
      expect(store.currentProject).toEqual(mockProject)
    })

    it('should clear error when setting project', () => {
      const store = useProjectStore.getState()
      store.setError('Some error')
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
      expect(store.error).toBeNull()
    })

    it('should add to recent projects', () => {
      const store = useProjectStore.getState()
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
      expect(store.recentProjects).toContain(mockProject)
    })
  })

  describe('createProject', () => {
    it('should create a new project', async () => {
      const store = useProjectStore.getState()
      await store.createProject('New Project', '/new/path')

      expect(store.currentProject).not.toBeNull()
      expect(store.currentProject?.name).toBe('New Project')
      expect(store.currentProject?.rootPath).toBe('/new/path')
    })

    it('should set loading state during creation', async () => {
      const store = useProjectStore.getState()
      const promise = store.createProject('Project', '/path')

      expect(store.isLoading).toBe(true)
      await promise
      expect(store.isLoading).toBe(false)
    })

    it('should generate unique project IDs', async () => {
      const store = useProjectStore.getState()

      await store.createProject('Project 1', '/path1')
      const id1 = store.currentProject?.id

      await new Promise(resolve => setTimeout(resolve, 10))

      await store.createProject('Project 2', '/path2')
      const id2 = store.currentProject?.id

      expect(id1).not.toEqual(id2)
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      const store = useProjectStore.getState()
      const errorMsg = 'Test error message'

      store.setError(errorMsg)
      expect(store.error).toBe(errorMsg)
    })

    it('should clear error when set to null', () => {
      const store = useProjectStore.getState()
      store.setError('Error')
      expect(store.error).toBe('Error')

      store.setError(null)
      expect(store.error).toBeNull()
    })
  })
})
