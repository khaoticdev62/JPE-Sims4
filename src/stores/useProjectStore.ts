import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Project, ModFile } from '@/types/index'

interface ProjectState {
  currentProject: Project | null
  recentProjects: Project[]
  isLoading: boolean
  error: string | null

  // Actions
  initializeStore: () => void
  setCurrentProject: (project: Project | null) => void
  createProject: (name: string, rootPath: string) => Promise<void>
  openProject: (projectPath: string) => Promise<void>
  saveProject: () => Promise<void>
  addFile: (file: ModFile) => void
  removeFile: (fileId: string) => void
  updateFile: (fileId: string, updates: Partial<ModFile>) => void
  getFile: (fileId: string) => ModFile | undefined
  setError: (error: string | null) => void
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        currentProject: null,
        recentProjects: [],
        isLoading: false,
        error: null,

        initializeStore: () => {
          // Load recent projects from localStorage
          const stored = localStorage.getItem('recentProjects')
          if (stored) {
            try {
              const recent = JSON.parse(stored)
              set({ recentProjects: recent })
            } catch (e) {
              console.error('Failed to load recent projects', e)
            }
          }
        },

        setCurrentProject: (project) => {
          set({ currentProject: project, error: null })
          if (project) {
            // Add to recent projects
            set((state) => {
              const updated = [
                project,
                ...state.recentProjects.filter((p) => p.id !== project.id),
              ].slice(0, 10)
              return { recentProjects: updated }
            })
          }
        },

        createProject: async (name, rootPath) => {
          set({ isLoading: true, error: null })
          try {
            const newProject: Project = {
              id: `project-${Date.now()}`,
              name,
              rootPath,
              files: [],
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                version: '1.0.0',
              },
            }
            get().setCurrentProject(newProject)
            set({ isLoading: false })
          } catch (error) {
            set({
              error: `Failed to create project: ${error}`,
              isLoading: false,
            })
          }
        },

        openProject: async (projectPath) => {
          set({ isLoading: true, error: null })
          try {
            // This will be implemented with file system access
            // For now, just simulate loading
            await new Promise((resolve) => setTimeout(resolve, 500))
            set({ isLoading: false })
          } catch (error) {
            set({
              error: `Failed to open project: ${error}`,
              isLoading: false,
            })
          }
        },

        saveProject: async () => {
          const project = get().currentProject
          if (!project) {
            set({ error: 'No project loaded' })
            return
          }
          set({ isLoading: true, error: null })
          try {
            // This will be implemented with file system access
            project.metadata.updatedAt = Date.now()
            get().setCurrentProject(project)
            set({ isLoading: false })
          } catch (error) {
            set({
              error: `Failed to save project: ${error}`,
              isLoading: false,
            })
          }
        },

        addFile: (file) => {
          const project = get().currentProject
          if (!project) return

          const updated = { ...project, files: [...project.files, file] }
          get().setCurrentProject(updated)
        },

        removeFile: (fileId) => {
          const project = get().currentProject
          if (!project) return

          const updated = {
            ...project,
            files: project.files.filter((f) => f.id !== fileId),
          }
          get().setCurrentProject(updated)
        },

        updateFile: (fileId, updates) => {
          const project = get().currentProject
          if (!project) return

          const updated = {
            ...project,
            files: project.files.map((f) =>
              f.id === fileId ? { ...f, ...updates, isDirty: true } : f
            ),
          }
          get().setCurrentProject(updated)
        },

        getFile: (fileId) => {
          return get().currentProject?.files.find((f) => f.id === fileId)
        },

        setError: (error) => {
          set({ error })
        },
      }),
      {
        name: 'jpe-project-store',
        partialize: (state) => ({
          recentProjects: state.recentProjects,
        }),
      }
    )
  )
)
