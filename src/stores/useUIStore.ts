import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/utils/storage'
import { WorkspaceMode } from '@/components/robust/jpe-theme'

interface UIState {
  theme: 'dark' | 'light' | 'high-contrast'
  sidebarCollapsed: boolean
  rightPanelCollapsed: boolean
  showDiagnostics: boolean
  fontSize: number
  showLineNumbers: boolean
  sidebarTab: 'explorer' | 'ai' | 'dictionary' | 'health'
  rightPanelTab: 'diagnostics' | 'preview' | 'docs' | 'copilot'
  focusedPane: 'sidebar' | 'editor' | 'right-panel' | 'diagnostics' | 'app-nav'
  immersionMode: 'normal' | 'zen' | 'focus' | 'handheld'
  workspaceMode: WorkspaceMode
  
  // Actions
  setWorkspaceMode: (mode: WorkspaceMode) => void
  setImmersionMode: (mode: 'normal' | 'zen' | 'focus' | 'handheld') => void
  setSidebarTab: (tab: 'explorer' | 'ai' | 'dictionary' | 'health') => void
  setFocusedPane: (pane: 'sidebar' | 'editor' | 'right-panel' | 'diagnostics' | 'app-nav') => void
  setRightPanelTab: (tab: 'diagnostics' | 'preview' | 'docs' | 'copilot') => void
  setTheme: (theme: 'dark' | 'light' | 'high-contrast') => void
  toggleSidebar: () => void
  toggleRightPanel: () => void
  toggleDiagnostics: () => void
  setFontSize: (size: number) => void
  setShowLineNumbers: (show: boolean) => void
  
  // Command Palette (Story 6.3)
  isCommandPaletteOpen: boolean
  commandPaletteQuery: string
  setCommandPaletteOpen: (open: boolean, query?: string) => void
  toggleCommandPalette: (query?: string) => void
  
  // Onboarding Tour
  isTourOpen: boolean
  setTourOpen: (open: boolean) => void
  toggleTour: () => void
  hasCompletedTour: boolean
  setHasCompletedTour: (completed: boolean) => void
  
  // Interactive Tutorial (Story 5.1)
  tutorialStep: number
  isTutorialActive: boolean
  setTutorialStep: (step: number) => void
  setTutorialActive: (active: boolean) => void
  
  // Mod Indexing
  modsFolderPath: string | null
  setModsFolderPath: (path: string | null) => void

  // Wizards (Story 7.1)
  isBuffWizardOpen: boolean
  setBuffWizardOpen: (open: boolean) => void
  isInteractionWizardOpen: boolean
  setInteractionWizardOpen: (open: boolean) => void
  isTraitWizardOpen: boolean
  setTraitWizardOpen: (open: boolean) => void

  // AI Tools (Story 6.2)
  isPromptToJPEOpen: boolean
  setPromptToJPEOpen: (open: boolean) => void

  // Help Center (Story 5.2)
  isHelpCenterOpen: boolean
  setHelpCenterOpen: (open: boolean) => void

  // Sensory Studio (Epic 10)
  audioEnabled: boolean
  setAudioEnabled: (enabled: boolean) => void
  hapticEnabled: boolean
  setHapticEnabled: (enabled: boolean) => void
  visualEnabled: boolean
  setVisualEnabled: (enabled: boolean) => void
  masterSensoryVolume: number
  setMasterSensoryVolume: (volume: number) => void

  // Batch STBL Editor
  isBatchSTBLOpen: boolean
  setBatchSTBLOpen: (open: boolean) => void

  // Mod Publishing
  isPublishModOpen: boolean
  setPublishModOpen: (open: boolean) => void

  // Project Export
  isProjectExportOpen: boolean
  setProjectExportOpen: (open: boolean) => void

  // Mod Distribution Data
  publishBuffer: ArrayBuffer | undefined
  setPublishBuffer: (buffer: ArrayBuffer | undefined) => void
  publishProjectName: string
  setPublishProjectName: (name: string) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'dark',
        sidebarCollapsed: false,
        rightPanelCollapsed: false,
        showDiagnostics: true,
        fontSize: 13,
        showLineNumbers: true,
        rightPanelTab: 'diagnostics',
        sidebarTab: 'explorer',
        focusedPane: 'editor',
        immersionMode: 'normal',
        workspaceMode: 'dashboard',

        setWorkspaceMode: (mode) => {
          set({ workspaceMode: mode })
          
          // Auto-adjust layout for specific major modes
          if (mode === 'dashboard' || mode === 'manual' || mode === 'settings') {
            set({ sidebarCollapsed: true, rightPanelCollapsed: true })
          } else if (mode === 'code' || mode === 'translation' || mode === 'jpe') {
            set({ sidebarCollapsed: false, rightPanelCollapsed: false })
          }
        },

        setSidebarTab: (tab) => set({ sidebarTab: tab }),

        setFocusedPane: (pane) => set({ focusedPane: pane }),

        setRightPanelTab: (tab) => set({ rightPanelTab: tab }),

        setImmersionMode: (mode) => {
          set({ immersionMode: mode })
          
          // Auto-adjust layout based on mode
          if (mode === 'zen') {
            set({ sidebarCollapsed: true, rightPanelCollapsed: true, showDiagnostics: false })
          } else if (mode === 'focus') {
            set({ sidebarCollapsed: true, rightPanelCollapsed: false, rightPanelTab: 'diagnostics' })
          } else if (mode === 'normal') {
            set({ sidebarCollapsed: false, rightPanelCollapsed: false })
          }
        },

        setTheme: (theme) => {
          set({ theme })
          const root = document.documentElement
          root.classList.remove('dark', 'light', 'theme-high-contrast')
          
          if (theme === 'high-contrast') {
            root.classList.add('theme-high-contrast')
          } else {
            root.classList.add(theme)
          }
        },

        toggleSidebar: () => {
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
        },

        toggleRightPanel: () => {
          set((state) => ({
            rightPanelCollapsed: !state.rightPanelCollapsed,
          }))
        },

        toggleDiagnostics: () => {
          set((state) => ({
            showDiagnostics: !state.showDiagnostics,
          }))
        },

        setFontSize: (size) => {
          set({ fontSize: Math.max(10, Math.min(20, size)) })
        },

        setShowLineNumbers: (show) => {
          set({ showLineNumbers: show })
        },

        isCommandPaletteOpen: false,
        commandPaletteQuery: ">",
        setCommandPaletteOpen: (open, query) => set({ 
          isCommandPaletteOpen: open, 
          commandPaletteQuery: query !== undefined ? query : (open ? ">" : "") 
        }),
        toggleCommandPalette: (query) => set((state) => ({ 
          isCommandPaletteOpen: !state.isCommandPaletteOpen,
          commandPaletteQuery: query !== undefined ? query : (!state.isCommandPaletteOpen ? ">" : "")
        })),

        isTourOpen: false,
        setTourOpen: (open) => set({ isTourOpen: open }),
        toggleTour: () => set((state) => ({ isTourOpen: !state.isTourOpen })),
        hasCompletedTour: false,
        setHasCompletedTour: (completed) => set({ hasCompletedTour: completed }),

        tutorialStep: 0,
        isTutorialActive: false,
        setTutorialStep: (step) => set({ tutorialStep: step }),
        setTutorialActive: (active) => set({ isTutorialActive: active }),

        modsFolderPath: null,
        setModsFolderPath: (path) => set({ modsFolderPath: path }),

        // Wizards
        isBuffWizardOpen: false,
        setBuffWizardOpen: (open) => set({ isBuffWizardOpen: open }),
        isInteractionWizardOpen: false,
        setInteractionWizardOpen: (open) => set({ isInteractionWizardOpen: open }),
        isTraitWizardOpen: false,
        setTraitWizardOpen: (open) => set({ isTraitWizardOpen: open }),

        // AI Tools (Story 6.2)
        isPromptToJPEOpen: false,
        setPromptToJPEOpen: (open) => set({ isPromptToJPEOpen: open }),

        // Help Center (Story 5.2)
        isHelpCenterOpen: false,
        setHelpCenterOpen: (open) => set({ isHelpCenterOpen: open }),

        // Sensory Studio (Epic 10)
        audioEnabled: true,
        setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
        hapticEnabled: true,
        setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
        visualEnabled: true,
        setVisualEnabled: (enabled) => set({ visualEnabled: enabled }),
        masterSensoryVolume: 50,
        setMasterSensoryVolume: (volume) => set({ masterSensoryVolume: volume }),

        // Batch STBL Editor
        isBatchSTBLOpen: false,
        setBatchSTBLOpen: (open) => set({ isBatchSTBLOpen: open }),

        // Mod Publishing
        isPublishModOpen: false,
        setPublishModOpen: (open) => set({ isPublishModOpen: open }),

        // Project Export
        isProjectExportOpen: false,
        setProjectExportOpen: (open) => set({ isProjectExportOpen: open }),

        // Mod Distribution Data
        publishBuffer: undefined,
        setPublishBuffer: (buffer) => set({ publishBuffer: buffer }),
        publishProjectName: 'My Mod',
        setPublishProjectName: (name) => set({ publishProjectName: name }),
      }),
      {
        name: 'jpe-ui-store',
        storage: createJSONStorage(() => safeStorage),
      }
    )
  )
)
