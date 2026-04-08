/**
 * useProjectStore Tests - Story 1.1: Create a New Mod Project
 * 
 * Tests for AC 5, 6: Success message and project opens in editor
 */

import { useProjectStore } from '@/stores/useProjectStore'
import { ProjectService } from '@/services/ProjectService'
import { useActivityStore } from '@/stores/useActivityStore'

// Mock dependencies
jest.mock('@/services/ProjectService', () => ({
  ProjectService: {
    createProject: jest.fn(),
    openProject: jest.fn(),
    saveProject: jest.fn(),
  },
}))

jest.mock('@/stores/useActivityStore', () => ({
  useActivityStore: {
    getState: jest.fn(() => ({
      addActivity: jest.fn(),
    })),
  },
}))

jest.mock('@/utils/storage', () => ({
  safeStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}))

jest.mock('zustand/middleware', () => {
  const actual = jest.requireActual('zustand/middleware')
  return {
    ...actual,
    persist: (config: any) => config,
    devtools: (config: any) => config,
    createJSONStorage: () => ({}),
  }
})

describe('useProjectStore - Story 1.1', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store to initial state
    useProjectStore.setState({
      currentProject: null,
      recentProjects: [],
      isLoading: false,
      error: null,
      activePackageData: null,
      activePackagePath: null,
      activePackageBuffer: null,
      isAiScanning: false,
    })
  })

  describe('createProject action', () => {
    it('should start with loading state', async () => {
      const mockProject = {
        id: 'project-123',
        name: 'TestProject',
        rootPath: '/test/path',
        files: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      }
      ;(ProjectService.createProject as jest.Mock).mockResolvedValue(mockProject)

      useProjectStore.getState().createProject('TestProject', '/test/path')

      expect(useProjectStore.getState().isLoading).toBe(true)
      expect(useProjectStore.getState().error).toBeNull()

      // Wait for async completion
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    it('should create project successfully', async () => {
      const mockProject = {
        id: 'project-123',
        name: 'TestProject',
        rootPath: '/test/path',
        files: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      }
      ;(ProjectService.createProject as jest.Mock).mockResolvedValue(mockProject)

      await useProjectStore.getState().createProject('TestProject', '/test/path')

      // Wait for async
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(useProjectStore.getState().currentProject).toEqual(mockProject)
      expect(useProjectStore.getState().isLoading).toBe(false)
      expect(useProjectStore.getState().error).toBeNull()
    })

    it('should add project to recent projects', async () => {
      const mockProject = {
        id: 'project-123',
        name: 'TestProject',
        rootPath: '/test/path',
        files: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      }
      ;(ProjectService.createProject as jest.Mock).mockResolvedValue(mockProject)

      await useProjectStore.getState().createProject('TestProject', '/test/path')
      await new Promise((resolve) => setTimeout(resolve, 100))

      const state = useProjectStore.getState()
      expect(state.recentProjects).toContainEqual(mockProject)
      expect(state.recentProjects.length).toBeLessThanOrEqual(10) // Max 10 recent
    })

    it('should log activity on project creation', async () => {
      const mockProject = {
        id: 'project-123',
        name: 'TestProject',
        rootPath: '/test/path',
        files: [],
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
      }
      ;(ProjectService.createProject as jest.Mock).mockResolvedValue(mockProject)
      const mockAddActivity = jest.fn()
      ;(useActivityStore.getState as jest.Mock).mockReturnValue({ addActivity: mockAddActivity })

      await useProjectStore.getState().createProject('TestProject', '/test/path')
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(mockAddActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'created',
          fileName: 'New project created',
          projectName: 'TestProject',
          projectId: 'project-123',
        })
      )
    })

    it('should handle project creation failure', async () => {
      const _errorMessage = 'Failed to create directory'
      ;(ProjectService.createProject as jest.Mock).mockResolvedValue(null)

      await useProjectStore.getState().createProject('FailProject', '/invalid/path')
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(useProjectStore.getState().isLoading).toBe(false)
      expect(useProjectStore.getState().error).toContain('Failed to create project')
      expect(useProjectStore.getState().currentProject).toBeNull()
    })

    it('should handle project creation error', async () => {
      const errorMessage = 'Disk full'
      ;(ProjectService.createProject as jest.Mock).mockRejectedValue(new Error(errorMessage))

      await useProjectStore.getState().createProject('ErrorProject', '/test/path')
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(useProjectStore.getState().isLoading).toBe(false)
      expect(useProjectStore.getState().error).toContain(errorMessage)
    })
  })

  describe('setCurrentProject action', () => {
    it('should set current project', () => {
      const mockProject = {
        id: 'project-456',
        name: 'MockProject',
        rootPath: '/mock/path',
        files: [],
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
      }

      useProjectStore.getState().setCurrentProject(mockProject)

      expect(useProjectStore.getState().currentProject).toEqual(mockProject)
      expect(useProjectStore.getState().error).toBeNull()
    })

    it('should add to recent projects when set', () => {
      const mockProject = {
        id: 'project-789',
        name: 'RecentProject',
        rootPath: '/recent/path',
        files: [],
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
      }

      useProjectStore.getState().setCurrentProject(mockProject)

      const state = useProjectStore.getState()
      expect(state.recentProjects).toContainEqual(mockProject)
    })

    it('should not duplicate project in recent list', () => {
      const mockProject = {
        id: 'project-duplicate',
        name: 'DuplicateProject',
        rootPath: '/duplicate/path',
        files: [],
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
      }

      // Set twice
      useProjectStore.getState().setCurrentProject(mockProject)
      useProjectStore.getState().setCurrentProject(mockProject)

      const state = useProjectStore.getState()
      const count = state.recentProjects.filter((p) => p.id === mockProject.id).length
      expect(count).toBe(1) // Should only appear once
    })

    it('should limit recent projects to 10', () => {
      for (let i = 0; i < 15; i++) {
        const mockProject = {
          id: `project-${i}`,
          name: `Project ${i}`,
          rootPath: `/path/${i}`,
          files: [],
          metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
        }
        useProjectStore.getState().setCurrentProject(mockProject)
      }

      const state = useProjectStore.getState()
      expect(state.recentProjects.length).toBeLessThanOrEqual(10)
    })
  })

  describe('initial state', () => {
    it('should have null currentProject', () => {
      expect(useProjectStore.getState().currentProject).toBeNull()
    })

    it('should have empty recentProjects array', () => {
      expect(useProjectStore.getState().recentProjects).toEqual([])
    })

    it('should have isLoading false', () => {
      expect(useProjectStore.getState().isLoading).toBe(false)
    })

    it('should have null error', () => {
      expect(useProjectStore.getState().error).toBeNull()
    })
  })

  describe('setError action', () => {
    it('should set error message', () => {
      useProjectStore.getState().setError('Test error message')

      expect(useProjectStore.getState().error).toBe('Test error message')
    })

    it('should clear error when set to null', () => {
      useProjectStore.getState().setError('Previous error')
      useProjectStore.getState().setError(null)

      expect(useProjectStore.getState().error).toBeNull()
    })
  })
})
