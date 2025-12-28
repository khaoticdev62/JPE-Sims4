import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { EditorTab } from '@/types/index'

interface EditorState {
  tabs: EditorTab[]
  activeTabId: string | null
  editorContent: Map<string, string>
  cursorPosition: Map<string, { line: number; column: number }>

  // Actions
  openTab: (tab: EditorTab) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabContent: (tabId: string, content: string) => void
  markTabClean: (tabId: string) => void
  setCursorPosition: (tabId: string, line: number, column: number) => void
  getCursorPosition: (tabId: string) => { line: number; column: number }
  closeAllTabs: () => void
}

export const useEditorStore = create<EditorState>()(
  devtools((set, get) => ({
    tabs: [],
    activeTabId: null,
    editorContent: new Map(),
    cursorPosition: new Map(),

    openTab: (tab) => {
      set((state) => {
        const exists = state.tabs.find((t) => t.id === tab.id)
        if (exists) {
          return { activeTabId: tab.id }
        }
        return {
          tabs: [...state.tabs, tab],
          activeTabId: tab.id,
        }
      })
    },

    closeTab: (tabId) => {
      set((state) => {
        const filtered = state.tabs.filter((t) => t.id !== tabId)
        const newActiveId =
          state.activeTabId === tabId ? filtered[0]?.id ?? null : state.activeTabId

        // Cleanup
        const content = new Map(state.editorContent)
        content.delete(tabId)
        const position = new Map(state.cursorPosition)
        position.delete(tabId)

        return {
          tabs: filtered,
          activeTabId: newActiveId,
          editorContent: content,
          cursorPosition: position,
        }
      })
    },

    setActiveTab: (tabId) => {
      set({ activeTabId: tabId })
    },

    updateTabContent: (tabId, content) => {
      set((state) => {
        const updated = new Map(state.editorContent)
        updated.set(tabId, content)
        return { editorContent: updated }
      })
    },

    markTabClean: (tabId) => {
      set((state) => ({
        tabs: state.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, isDirty: false } : tab
        ),
      }))
    },

    setCursorPosition: (tabId, line, column) => {
      set((state) => {
        const updated = new Map(state.cursorPosition)
        updated.set(tabId, { line, column })
        return { cursorPosition: updated }
      })
    },

    getCursorPosition: (tabId) => {
      const position = get().cursorPosition.get(tabId)
      return position ?? { line: 0, column: 0 }
    },

    closeAllTabs: () => {
      set({
        tabs: [],
        activeTabId: null,
        editorContent: new Map(),
        cursorPosition: new Map(),
      })
    },
  }))
)
