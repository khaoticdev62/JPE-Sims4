import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Diagnostic } from '@/types/index'

interface DiagnosticState {
  diagnostics: Diagnostic[]
  searchQuery: string
  activeSeverityFilter: 'all' | 'error' | 'warning' | 'info'
  activeFileFilter: string | null
  isAiScanning: boolean
  selectedDiagnosticId: string | null

  // Actions
  addDiagnostic: (diagnostic: Diagnostic) => void
  addDiagnostics: (diagnostics: Diagnostic[]) => void
  removeDiagnostic: (diagnosticId: string) => void
  setDiagnostics: (diagnostics: Diagnostic[]) => void
  setSearchQuery: (query: string) => void
  setSelectedDiagnostic: (id: string | null) => void
  clearDiagnostics: (fileId?: string) => void
  clearDiagnosticsBySource: (source: 'ai' | 'community' | 'syntax') => void
  setDiagnosticsForFile: (fileId: string, diagnostics: Diagnostic[]) => void
  setSeverityFilter: (severity: 'all' | 'error' | 'warning' | 'info') => void
  setFileFilter: (fileId: string | null) => void
  getFilteredDiagnostics: () => Diagnostic[]
  getDiagnosticsForFile: (fileId: string) => Diagnostic[]
  setIsAiScanning: (scanning: boolean) => void
}

export const useDiagnosticStore = create<DiagnosticState>()(
  devtools((set, get) => ({
    diagnostics: [],
    searchQuery: '',
    activeSeverityFilter: 'all',
    activeFileFilter: null,
    isAiScanning: false,
    selectedDiagnosticId: null,

    addDiagnostic: (diagnostic) => {
      set((state) => ({
        diagnostics: [...state.diagnostics, diagnostic],
      }))
    },

    addDiagnostics: (newDiagnostics) => {
      set((state) => ({
        diagnostics: [...state.diagnostics, ...newDiagnostics],
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

    setSearchQuery: (query) => {
      set({ searchQuery: query })
    },

    setSelectedDiagnostic: (id) => {
      set({ selectedDiagnosticId: id })
    },

    clearDiagnostics: (fileId) => {
      set((state) => ({
        diagnostics: fileId
          ? state.diagnostics.filter((d) => d.fileId !== fileId)
          : [],
      }))
    },

    clearDiagnosticsBySource: (source) => {
      set((state) => ({
        diagnostics: state.diagnostics.filter((d) => d.source !== source),
      }))
    },

    setDiagnosticsForFile: (fileId, newDiagnostics) => {
      set((state) => ({
        diagnostics: [
          ...state.diagnostics.filter((d) => d.fileId !== fileId),
          ...newDiagnostics,
        ],
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
      const query = state.searchQuery.toLowerCase().trim()
      
      return state.diagnostics.filter((d) => {
        const matchesSeverity =
          state.activeSeverityFilter === 'all' ||
          d.severity === state.activeSeverityFilter
        
        const matchesFile =
          state.activeFileFilter === null || d.fileId === state.activeFileFilter
        
        const matchesSearch = query === '' || 
          d.message.toLowerCase().includes(query) ||
          d.code.toLowerCase().includes(query) ||
          (d.fileId && d.fileId.toLowerCase().includes(query))

        return matchesSeverity && matchesFile && matchesSearch
      })
    },

    getDiagnosticsForFile: (fileId) => {
      return get().diagnostics.filter((d) => d.fileId === fileId)
    },

    setIsAiScanning: (scanning) => {
      set({ isAiScanning: scanning })
    },
  }))
)
