import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UIState {
  theme: 'dark' | 'light'
  sidebarCollapsed: boolean
  rightPanelCollapsed: boolean
  showDiagnostics: boolean
  fontSize: number
  showLineNumbers: boolean

  // Actions
  setTheme: (theme: 'dark' | 'light') => void
  toggleSidebar: () => void
  toggleRightPanel: () => void
  toggleDiagnostics: () => void
  setFontSize: (size: number) => void
  setShowLineNumbers: (show: boolean) => void
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

        setTheme: (theme) => {
          set({ theme })
          document.documentElement.classList.toggle('dark', theme === 'dark')
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
      }),
      {
        name: 'jpe-ui-store',
      }
    )
  )
)
