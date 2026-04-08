import { create } from 'zustand'
import { CleanupReport } from '@/services/ModCleanupService'

interface CleanupState {
  isScanning: boolean
  progress: { current: number; total: number }
  scanResults: CleanupReport | null
  selectedIds: string[]
  isExecuting: boolean

  // Actions
  setScanning: (scanning: boolean) => void
  setProgress: (current: number, total: number) => void
  setScanResults: (results: CleanupReport | null) => void
  toggleSelectId: (id: string) => void
  setSelectedIds: (ids: string[]) => void
  setExecuting: (executing: boolean) => void
  reset: () => void
}

export const useCleanupStore = create<CleanupState>((set) => ({
  isScanning: false,
  progress: { current: 0, total: 0 },
  scanResults: null,
  selectedIds: [],
  isExecuting: false,

  setScanning: (scanning) => set({ isScanning: scanning }),
  setProgress: (current, total) => set({ progress: { current, total } }),
  setScanResults: (results) => set({ scanResults: results, selectedIds: results?.findings.map(f => f.id) || [] }),
  toggleSelectId: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id) 
      ? state.selectedIds.filter(i => i !== id) 
      : [...state.selectedIds, id]
  })),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  setExecuting: (executing) => set({ isExecuting: executing }),
  reset: () => set({ isScanning: false, scanResults: null, selectedIds: [], isExecuting: false, progress: { current: 0, total: 0 } })
}))
