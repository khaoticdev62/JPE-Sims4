import { create } from 'zustand'

interface DocState {
  selectedEntryId: string | null
  setSelectedEntryId: (id: string | null) => void
}

export const useDocStore = create<DocState>((set) => ({
  selectedEntryId: null,
  setSelectedEntryId: (id) => set({ selectedEntryId: id })
}))
