import { create } from 'zustand'
import { devtools, persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware'
import { safeStorage } from '@/utils/storage'
import { AIProvider, AIMessage } from '@/services/ai/types'
import type { EditorTab, ModFile } from '@/types/index'

interface CursorPosition {
  line: number
  column: number
}

interface AIState {
  selectedProvider: AIProvider
  isProcessing: boolean
  messages: AIMessage[]
}

interface EditorState {
  tabs: EditorTab[]
  activeTabId: string | null
  editorContent: Record<string, string>
  cursorPosition: Record<string, CursorPosition>
  
  // AI Session State
  aiState: AIState
  
  // Story 6.4: Diagnostic AI Action state
  diagnosticAction: {
    activeId: string | null
    isProcessing: boolean
    explanation: any | null
    fix: { original: string, modified: string } | null
  }
  
  // File Buffer (for syncing with tabs)
  files: ModFile[]
  activeFileId: string | null
  
  // Preview State
  previewContent: string
  previewOutOfDate: boolean
  setPreviewContent: (content: string) => void
  setPreviewOutOfDate: (outOfDate: boolean) => void
  
  // Actions
  openTab: (tab: EditorTab) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabContent: (tabId: string, content: string) => void
  updateFileContent: (id: string, content: string) => void
  markTabClean: (tabId: string) => void
  setCursorPosition: (tabId: string, line: number, column: number) => void
  getCursorPosition: (tabId: string) => CursorPosition
  closeAllTabs: () => void
  
  // AI Actions
  setAIProvider: (provider: AIProvider) => void
  setAIProcessing: (isProcessing: boolean) => void
  setAIHistory: (messages: AIMessage[]) => void
  addAIMessage: (message: AIMessage) => void
  clearAIHistory: () => void
  setAIConfigured: (configured: boolean) => void
  insertCodeToActiveTab: (code: string) => void
}

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector(
    devtools(
    persist(
      (set, get) => ({
        tabs: [],
        activeTabId: null,
        editorContent: {},
        cursorPosition: {},
        files: [],
        activeFileId: null,
        aiState: {
          selectedProvider: AIProvider.CLAUDE,
          isProcessing: false,
          messages: []
        },
        diagnosticAction: {
          activeId: null,
          isProcessing: false,
          explanation: null,
          fix: null
        },
        previewContent: '',
        previewOutOfDate: false,
        setPreviewContent: (content) => set({ previewContent: content }),
        setPreviewOutOfDate: (outOfDate) => set({ previewOutOfDate: outOfDate }),

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
          const state = get()
          const tab = state.tabs.find((t) => t.id === tabId)
          
          // Check for unsaved changes
          if (tab?.isDirty) {
            const confirmed = window.confirm(
              `"${tab.name}" has unsaved changes. Close anyway?`
            )
            if (!confirmed) return
          }
          
          set((state) => {
            const filtered = state.tabs.filter((t) => t.id !== tabId)
            const newActiveId =
              state.activeTabId === tabId ? filtered[0]?.id ?? null : state.activeTabId

            // Cleanup
            const { [tabId]: __contentDeleted, ...content } = state.editorContent
            const { [tabId]: __positionDeleted, ...position } = state.cursorPosition

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

        updateFileContent: (id, content) => {
          set((state) => ({
            files: state.files.map(f => f.id === id ? { ...f, content } : f)
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

        // AI Actions
        setAIProvider: (provider) => {
          set((state) => ({
            aiState: { ...state.aiState, selectedProvider: provider }
          }))
        },

        setAIProcessing: (isProcessing) => {
          set((state) => ({
            aiState: { ...state.aiState, isProcessing }
          }))
        },

        setAIHistory: (messages) => {
          set((state) => ({
            aiState: { ...state.aiState, messages }
          }))
        },

        addAIMessage: (message) => {
          set((state) => ({
            aiState: { ...state.aiState, messages: [...state.aiState.messages, message] }
          }))
        },

        clearAIHistory: () => {
          set((state) => ({
            aiState: { ...state.aiState, messages: [] }
          }))
        },

        setAIConfigured: (configured) => {
          console.debug('AI Configured set to:', configured)
        },

        insertCodeToActiveTab: (code) => {
          const { activeTabId, editorContent } = get()
          if (!activeTabId) return

          const currentContent = editorContent[activeTabId] || ""
          const isCurrentlyEmpty = currentContent.trim().length === 0

          let newContent = ""
          if (isCurrentlyEmpty) {
            newContent = code
          } else {
            // Append with spacing
            newContent = `${currentContent}\n\n${code}`
          }

          set((state) => ({
            editorContent: {
              ...state.editorContent,
              [activeTabId]: newContent
            }
          }))
        }
      }),
      {
        name: 'editor-store',
        storage: createJSONStorage(() => safeStorage),
      }
    )
  )
)
)
