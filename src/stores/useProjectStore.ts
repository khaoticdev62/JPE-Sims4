import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import type { Project, ModFile } from '@/types/index'
import { FileService } from '@/services/FileService'
import { SymbolService } from '@/services/SymbolService'
import { ProjectService } from '@/services/ProjectService'
import { PackageService } from '@/services/PackageService'
import { DBPF_RESOURCE_TYPES } from '@/engine/parsers/types/package'
import { XMLParser } from '@/engine/parsers/XMLParser'
import { XMLToJPETranslator } from '@/engine/translators/xmlToJpe'
import { parseSTBL } from '@/engine/parsers/STBLParser'
import type { STBLEntry } from '@/engine/parsers/types/stbl'
import { useActivityStore } from './useActivityStore'
import { ConflictAnalyzer } from '@/services/ai/ConflictAnalyzer'
import { AIServiceFactory } from '@/services/ai/AIServiceFactory'
import { safeStorage } from '@/utils/storage'
import { createJSONStorage } from 'zustand/middleware'

import type { PackageData } from '@/engine/parsers/types/package'

interface ProjectState {
  currentProject: Project | null
  recentProjects: Project[]
  isLoading: boolean
  error: string | null
  
  // Package Browser State (Story 4.2)
  activePackageData: PackageData | null
  activePackagePath: string | null
  activePackageBuffer: ArrayBuffer | null

  // Actions
  initializeStore: () => void
  setCurrentProject: (project: Project | null) => void
  createProject: (name: string, rootPath: string) => Promise<void>
  openProject: (projectPath: string) => Promise<void>
  saveProject: () => Promise<void>
  saveFile: (fileId: string) => Promise<void>
  addFile: (sourcePath: string) => Promise<ModFile | null>
  createFile: (path: string, content: string) => Promise<ModFile | null>
  removeFile: (fileId: string) => Promise<void>
  renameFile: (fileId: string, newName: string) => Promise<void>
  updateFile: (fileId: string, updates: Partial<ModFile>) => void
  loadContent: (fileId: string) => Promise<void>
  getFile: (fileId: string) => ModFile | undefined
  setError: (error: string | null) => void
  
  // Package Browser Actions (Story 4.2)
  openPackage: (packagePath: string) => Promise<void>
  closePackage: () => void

  // AI Scanning State (Story 6.4)
  isAiScanning: boolean
  setAiScanning: (isScanning: boolean) => void
}

export const useProjectStore = create<ProjectState>()(
  subscribeWithSelector(
    devtools(
    persist(
      (set, get) => ({
        currentProject: null,
        recentProjects: [],
        isLoading: false,
        error: null,
        
        // Package Browser State (Story 4.2)
        activePackageData: null,
        activePackagePath: null,
        activePackageBuffer: null,

        initializeStore: () => {
          // Load recent projects from safeStorage
          const stored = safeStorage.getItem('recentProjects')
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

            // 3. Build global symbol index for semantic intelligence
            SymbolService.indexProject(project.files)

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

              // 🚀 TRIGGER AUTO-SCAN (Story 6.4)
              set((_state) => ({ isAiScanning: true })) // Visual indicator "Scanning..."

              const elementMap = ConflictAnalyzer.extractSummaryMap(result.project)
              const { activeProvider } = (await import('./useAIStore')).useAIStore.getState()
              const aiService = AIServiceFactory.getService(activeProvider)
              const { addDiagnostics, clearDiagnosticsBySource } = (await import('./useDiagnosticStore')).useDiagnosticStore.getState()

              // 1. Clear previous AI/Community findings
              clearDiagnosticsBySource('ai')
              clearDiagnosticsBySource('community')

              // 2. Local check first (Fast/Free)
              const localDuplicates = ConflictAnalyzer.findDuplicateIds(result.project)
              if (localDuplicates.length > 0) {
                addDiagnostics(localDuplicates)
              }

              // 3. AI Semantic Check (Parallel)
              aiService.analyzeProjectConflicts(elementMap).then(res => {
                if (res.success && res.diagnostics) {
                  // Mark as AI-sourced for Brain icon + Robust Color Coding
                  const aiDiagnostics = res.diagnostics.map((d: any) => ({
                    ...d,
                    source: 'ai',
                    severity: d.severity || 'error'
                  }))
                  addDiagnostics(aiDiagnostics)
                }
              }).finally(() => {
                set((_state) => ({ isAiScanning: false }))
              })

              // 4. Scarlet's Realm / Better Exceptions Manifest Lookup (Story 6.4)
              const communityDiagnostics = (await import('@/services/ai/BetterExceptionsJPE')).BetterExceptionsJPE.runManifestLookup(result.project)
              const heuristicDiagnostics = (await import('@/services/ai/BetterExceptionsJPE')).BetterExceptionsJPE.runHeuristicLogicCheck(result.project)
              
              if (communityDiagnostics.length > 0) addDiagnostics(communityDiagnostics)
              if (heuristicDiagnostics.length > 0) addDiagnostics(heuristicDiagnostics)

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
              get().updateFile(fileId, { isDirty: false, content: file.content })
              
              // 4. Update symbol index for semantic intelligence
              SymbolService.updateFileIndex(file)
              
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
          if (!project) return null

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
              
              return newFile
            }
            return null
          } catch (error) {
            console.error('Failed to add file', error)
            set({ error: 'Failed to add file' })
            return null
          } finally {
            set({ isLoading: false })
          }
        },

        createFile: async (path, content) => {
          const project = get().currentProject
          if (!project) return null

          set({ isLoading: true })
          try {
            const newFile = await ProjectService.createFile(path, content, project.id)
            if (newFile) {
              const updated = { ...project, files: [...project.files, newFile] }
              get().setCurrentProject(updated)

              // Log activity
              const { addActivity } = useActivityStore.getState()
              addActivity({
                type: 'created',
                fileName: newFile.name,
                projectName: project.name,
                projectId: project.id,
              })
              
              return newFile
            }
            return null
          } catch (error) {
            console.error('Failed to create file', error)
            set({ error: 'Failed to create file' })
            return null
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
            // 1. Check if this is a virtual resource in a package
            // Virtual IDs look like "type-group-instance"
            const isVirtual = /^[0-9a-f]+-[0-9a-f]+-[0-9a-f]+$/i.test(fileId)
            
            let content: string | null = null

            if (isVirtual) {
              // Extract from package
              // Path is stored as "path/to/mod.package/type-group-instance"
              const packagePath = file.path.substring(0, file.path.lastIndexOf('/'))
              
              // Load the package buffer
              const buffer = await FileService.readFileBuffer(packagePath)
              if (buffer) {
                const pkgData = await PackageService.loadPackage(packagePath, buffer)
                if (pkgData) {
                  const [typeHex, groupHex, instanceHex] = fileId.split('-')
                  const type = parseInt(typeHex, 16)
                  const group = parseInt(groupHex, 16)
                  const instance = BigInt(`0x${instanceHex}`)
                  
                  const resource = pkgData.resources.find(r => r.type === type && r.group === group && r.instance === instance)
                  if (resource) {
                    const resourceBuffer = await PackageService.extractResourceFast(packagePath, resource, buffer)
                    if (resourceBuffer) {
                      // Handle Tuning (XML) -> JPE
                      if (type === DBPF_RESOURCE_TYPES.TuningInstance || 
                          type === DBPF_RESOURCE_TYPES.Buff || 
                          type === DBPF_RESOURCE_TYPES.Trait || 
                          type === DBPF_RESOURCE_TYPES.GameplayData) {
                        const decoder = new TextDecoder('utf-8')
                        const xmlString = decoder.decode(resourceBuffer)
                        try {
                          const xmlAST = XMLParser.parseXML(xmlString)
                          if (xmlAST) {
                            content = XMLToJPETranslator.translate(xmlAST)
                          }
                        } catch (e) {
                          console.warn('Failed to decompile XML to JPE, falling back to raw XML', e)
                          content = xmlString
                        }
                      } else if (type === DBPF_RESOURCE_TYPES.STBL) {
                        const stblData = parseSTBL(resourceBuffer)
                        if (stblData) {
                          content = stblData.entries.map((e: STBLEntry) => `[String]\nid = "0x${e.key.toString(16).toUpperCase()}"\nvalue = "${e.value}"`).join('\n\n')
                        }
                      } else if (type === DBPF_RESOURCE_TYPES.PNG || type === DBPF_RESOURCE_TYPES.DDS || type === DBPF_RESOURCE_TYPES.LRLE || type === DBPF_RESOURCE_TYPES.THUM) {
                        // Extract as Base64 for visual preview (Story 4.6)
                        const b64 = await PackageService.extractResourceAsBase64(packagePath, resource, buffer)
                        if (b64) {
                          content = b64
                        }
                      } else {
                        const decoder = new TextDecoder('utf-8')
                        content = decoder.decode(resourceBuffer)
                      }
                    }
                  }
                }
              }
            } else {
              // Standard file load
              content = await ProjectService.loadFileContent(file)
            }

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
          const file = get().currentProject?.files.find((f) => f.id === fileId)
          if (file) return file

          // Handle Virtual Files (Story 4.2)
          if (/^[0-9a-f]+-[0-9a-f]+-[0-9a-f]+$/i.test(fileId)) {
            const [typeHex] = fileId.split('-')
            const type = parseInt(typeHex, 16)
            
            return {
              id: fileId,
              name: `Resource 0x${fileId}`,
              path: `${get().activePackagePath}/${fileId}`,
              type: (type === DBPF_RESOURCE_TYPES.STBL) ? 'stbl' : 
                    (type === DBPF_RESOURCE_TYPES.TuningInstance || 
                     type === DBPF_RESOURCE_TYPES.Buff || 
                     type === DBPF_RESOURCE_TYPES.Trait || 
                     type === DBPF_RESOURCE_TYPES.GameplayData) ? 'xml' : 
                    (type === DBPF_RESOURCE_TYPES.PNG || 
                     type === DBPF_RESOURCE_TYPES.DDS || 
                     type === DBPF_RESOURCE_TYPES.LRLE ||
                     type === DBPF_RESOURCE_TYPES.THUM) ? 'image' : 'binary',
              isDirty: false,
              lastModified: Date.now(),
              content: ''
            } as ModFile
          }

          return undefined
        },

        setError: (error) => {
          set({ error })
        },

        openPackage: async (packagePath) => {
          set({ isLoading: true, error: null })
          try {
            const buffer = await FileService.readFileBuffer(packagePath)
            if (!buffer) throw new Error('Could not read package file')

            const data = await PackageService.loadPackage(packagePath, buffer)
            if (!data) throw new Error('Failed to parse package')

            set({ 
              activePackageData: data, 
              activePackagePath: packagePath,
              activePackageBuffer: buffer
            })
          } catch (e) {
            console.error('Failed to open package', e)
            set({ error: `Failed to open package: ${e instanceof Error ? e.message : String(e)}` })
          } finally {
            set({ isLoading: false })
          }
        },

        closePackage: () => {
          set({ activePackageData: null, activePackagePath: null, activePackageBuffer: null })
        },

        isAiScanning: false,
        setAiScanning: (isScanning) => set({ isAiScanning: isScanning }),
      }),
      {
        name: 'jpe-project-store',
        partialize: (_state) => ({
          recentProjects: _state.recentProjects,
        }),
        storage: createJSONStorage(() => safeStorage),
      }
    )
  )
)
)
