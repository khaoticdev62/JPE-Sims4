import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Project, ModFile } from '@/types/index'
import { useActivityStore } from './useActivityStore'

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
  saveFile: (fileId: string) => Promise<void>
  addFile: (sourcePath: string) => Promise<void>
  removeFile: (fileId: string) => Promise<void>
  renameFile: (fileId: string, newName: string) => Promise<void>
  updateFile: (fileId: string, updates: Partial<ModFile>) => void
  loadContent: (fileId: string) => Promise<void>
  getFile: (fileId: string) => ModFile | undefined
  setError: (error: string | null) => void
}

import { ProjectService } from '@/services/ProjectService'

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
            const newProject = await ProjectService.createProject(name, rootPath)
            
            if (!newProject) {
              throw new Error('Failed to create project')
            }
            
            get().setCurrentProject(newProject)

            // Log activity
            const { addActivity } = useActivityStore.getState()
            addActivity({
              type: 'created',
              fileName: 'New project created',
              projectName: name,
              projectId: newProject.id,
            })

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
            const project = await ProjectService.openProject(projectPath)
            
            if (!project) {
              throw new Error('Failed to open project')
            }

            get().setCurrentProject(project)

            // Log activity once project opens
            const { addActivity } = useActivityStore.getState()
            addActivity({
              type: 'opened',
              fileName: 'Project opened',
              projectName: project.name,
              projectId: project.id,
            })

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
            const result = await ProjectService.saveProject(project)
            
            if (result.success) {
              get().setCurrentProject(result.project)
              // Mark all tabs as clean
              const { tabs, markTabClean } = (await import('./useEditorStore')).useEditorStore.getState()
              tabs.forEach(tab => markTabClean(tab.id))
            } else {
              set({ error: 'Failed to save project' })
            }
            
            set({ isLoading: false })
          } catch (error) {
            set({
              error: `Failed to save project: ${error}`,
              isLoading: false,
            })
          }
        },

        saveFile: async (fileId) => {
          const project = get().currentProject
          if (!project) return

          const file = project.files.find((f) => f.id === fileId)
          if (!file) return

          set({ isLoading: true, error: null })
          try {
            const success = await ProjectService.saveFile(file)
            if (success) {
              // Update file in store
              get().updateFile(fileId, { isDirty: false })
              
              // Mark tab as clean if open
              const { tabs, markTabClean } = (await import('./useEditorStore')).useEditorStore.getState()
              const tab = tabs.find(t => t.fileId === fileId)
              if (tab) {
                markTabClean(tab.id)
              }
            } else {
              set({ error: 'Failed to save file' })
            }
          } catch (error) {
            console.error('Failed to save file', error)
            set({ error: 'Failed to save file' })
          } finally {
            set({ isLoading: false })
          }
        },

        addFile: async (sourcePath) => {
          const project = get().currentProject
          if (!project) return

          set({ isLoading: true })
          try {
            const newFile = await ProjectService.addFileToProject(project, sourcePath)
            if (newFile) {
              const updated = { ...project, files: [...project.files, newFile] }
              get().setCurrentProject(updated)

              // Log activity
              const { addActivity } = useActivityStore.getState()
              addActivity({
                type: 'added',
                fileName: newFile.name,
                projectName: project.name,
                projectId: project.id,
              })
            }
          } catch (error) {
            console.error('Failed to add file', error)
            set({ error: 'Failed to add file' })
          } finally {
            set({ isLoading: false })
          }
        },

        removeFile: async (fileId) => {
          const project = get().currentProject
          if (!project) return

          const file = project.files.find((f) => f.id === fileId)
          if (!file) return

          set({ isLoading: true })
          try {
            const success = await ProjectService.deleteFileFromProject(file)
            if (success) {
              const updated = {
                ...project,
                files: project.files.filter((f) => f.id !== fileId),
              }
              get().setCurrentProject(updated)
            }
          } catch (error) {
            console.error('Failed to remove file', error)
            set({ error: 'Failed to remove file' })
          } finally {
            set({ isLoading: false })
          }
        },

        renameFile: async (fileId, newName) => {
          const project = get().currentProject
          if (!project) return

          const file = project.files.find((f) => f.id === fileId)
          if (!file) return

          set({ isLoading: true })
          try {
            const newPath = await ProjectService.renameFileInProject(file, newName)
            if (newPath) {
              const updated = {
                ...project,
                files: project.files.map((f) =>
                  f.id === fileId ? { ...f, name: newName, path: newPath } : f
                ),
              }
              get().setCurrentProject(updated)
            }
          } catch (error) {
            console.error('Failed to rename file', error)
            set({ error: 'Failed to rename file' })
          } finally {
            set({ isLoading: false })
          }
        },

        updateFile: (fileId, updates) => {
          const project = get().currentProject
          if (!project) return

          const fileBeingUpdated = project.files.find((f) => f.id === fileId)
          if (!fileBeingUpdated) return

          const updated = {
            ...project,
            files: project.files.map((f) =>
              f.id === fileId ? { ...f, ...updates, isDirty: true } : f
            ),
          }
          get().setCurrentProject(updated)

          // Log activity for file modifications (with debounce to avoid spam)
          // Only log if content or significant metadata changed
          if (updates.content !== undefined || updates.isDirty === true) {
            const { addActivity } = useActivityStore.getState()
            addActivity({
              type: 'modified',
              fileName: fileBeingUpdated.name,
              projectName: project.name,
              projectId: project.id,
            })
          }
        },

        loadContent: async (fileId) => {
          const project = get().currentProject
          if (!project) return

          const file = project.files.find((f) => f.id === fileId)
          if (!file) return

          // If content is already loaded (and not empty), skip
          if (file.content && file.content.length > 0) return

          set({ isLoading: true })
          try {
            const content = await ProjectService.loadFileContent(file)
            if (content !== null) {
              get().updateFile(fileId, { content })
            }
          } catch (e) {
            console.error('Failed to load content', e)
            set({ error: 'Failed to load file content' })
          } finally {
            set({ isLoading: false })
          }
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
