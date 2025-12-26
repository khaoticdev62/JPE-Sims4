import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Diagnostic } from '@types/index'

interface DiagnosticState {
  diagnostics: Diagnostic[]
  activeSeverityFilter: 'all' | 'error' | 'warning' | 'info'
  activeFileFilter: string | null

  // Actions
  addDiagnostic: (diagnostic: Diagnostic) => void
  removeDiagnostic: (diagnosticId: string) => void
  setDiagnostics: (diagnostics: Diagnostic[]) => void
  clearDiagnostics: (fileId?: string) => void
  setSeverityFilter: (severity: 'all' | 'error' | 'warning' | 'info') => void
  setFileFilter: (fileId: string | null) => void
  getFilteredDiagnostics: () => Diagnostic[]
  getDiagnosticsForFile: (fileId: string) => Diagnostic[]
}

export const useDiagnosticStore = create<DiagnosticState>()(
  devtools((set, get) => ({
    diagnostics: [],
    activeSeverityFilter: 'all',
    activeFileFilter: null,

    addDiagnostic: (diagnostic) => {
      set((state) => ({
        diagnostics: [...state.diagnostics, diagnostic],
      }))
    },

    removeDiagnostic: (diagnosticId) => {
      set((state) => ({
        diagnostics: state.diagnostics.filter((d) => d.id !== diagnosticId),
      }))
    },

    setDiagnostics: (diagnostics) => {
      set({ diagnostics })
    },

    clearDiagnostics: (fileId) => {
      set((state) => ({
        diagnostics: fileId
          ? state.diagnostics.filter((d) => d.fileId !== fileId)
          : [],
      }))
    },

    setSeverityFilter: (severity) => {
      set({ activeSeverityFilter: severity })
    },

    setFileFilter: (fileId) => {
      set({ activeFileFilter: fileId })
    },

    getFilteredDiagnostics: () => {
      const state = get()
      return state.diagnostics.filter((d) => {
        const matchesSeverity =
          state.activeSeverityFilter === 'all' ||
          d.severity === state.activeSeverityFilter
        const matchesFile =
          state.activeFileFilter === null || d.fileId === state.activeFileFilter
        return matchesSeverity && matchesFile
      })
    },

    getDiagnosticsForFile: (fileId) => {
      return get().diagnostics.filter((d) => d.fileId === fileId)
    },
  }))
)
