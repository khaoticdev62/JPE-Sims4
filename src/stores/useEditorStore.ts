import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { EditorTab } from '@/types/index'

interface CursorPosition {
  line: number
  column: number
}

interface EditorState {
  tabs: EditorTab[]
  activeTabId: string | null
  editorContent: Record<string, string>
  cursorPosition: Record<string, CursorPosition>

  // Actions
  openTab: (tab: EditorTab) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabContent: (tabId: string, content: string) => void
  markTabClean: (tabId: string) => void
  setCursorPosition: (tabId: string, line: number, column: number) => void
  getCursorPosition: (tabId: string) => CursorPosition
  closeAllTabs: () => void
}

export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set, get) => ({
        tabs: [],
        activeTabId: null,
        editorContent: {},
        cursorPosition: {},

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
        const { [tabId]: _contentDeleted, ...content } = state.editorContent
        const { [tabId]: _positionDeleted, ...position } = state.cursorPosition

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
      set((state) => ({
        editorContent: {
          ...state.editorContent,
          [tabId]: content,
        },
      }))
    },

    markTabClean: (tabId) => {
      set((state) => ({
        tabs: state.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, isDirty: false } : tab
        ),
      }))
    },

    setCursorPosition: (tabId, line, column) => {
      set((state) => ({
        cursorPosition: {
          ...state.cursorPosition,
          [tabId]: { line, column },
        },
      }))
    },

    getCursorPosition: (tabId) => {
      const position = get().cursorPosition[tabId]
      return position ?? { line: 0, column: 0 }
    },

    closeAllTabs: () => {
      set({
        tabs: [],
        activeTabId: null,
        editorContent: {},
        cursorPosition: {},
      })
    },
  }),
      {
        name: 'editor-store',
      }
    )
  )
)
