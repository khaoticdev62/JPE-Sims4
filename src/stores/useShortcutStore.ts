/**
 * Keyboard Shortcuts Store
 * Manages customizable keyboard shortcuts for the application
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/utils/storage'

export interface Shortcut {
  id: string
  label: string
  category: 'File' | 'Edit' | 'View' | 'Project' | 'Help'
  defaultKeys: string
  currentKeys: string
  description: string
}

interface ShortcutState {
  shortcuts: Shortcut[]
  recentlyUsed: string[]
  initialized: boolean

  // Getters
  getShortcut: (id: string) => Shortcut | undefined
  getShortcutsByCategory: (category: string) => Shortcut[]
  getAllShortcuts: () => Shortcut[]

  // Setters
  updateShortcut: (id: string, newKeys: string) => boolean
  resetShortcut: (id: string) => void
  resetAllShortcuts: () => void
  recordShortcutUsage: (id: string) => void

  // State
  setInitialized: (value: boolean) => void
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  // File
  {
    id: 'file-new',
    label: 'New Project',
    category: 'File',
    defaultKeys: 'Ctrl+N',
    currentKeys: 'Ctrl+N',
    description: 'Create a new project'
  },
  {
    id: 'file-open',
    label: 'Open Project',
    category: 'File',
    defaultKeys: 'Ctrl+O',
    currentKeys: 'Ctrl+O',
    description: 'Open an existing project'
  },
  {
    id: 'file-save',
    label: 'Save',
    category: 'File',
    defaultKeys: 'Ctrl+S',
    currentKeys: 'Ctrl+S',
    description: 'Save current file'
  },
  {
    id: 'file-save-all',
    label: 'Save All',
    category: 'File',
    defaultKeys: 'Ctrl+Shift+S',
    currentKeys: 'Ctrl+Shift+S',
    description: 'Save all files'
  },
  {
    id: 'file-close-project',
    label: 'Close Project',
    category: 'File',
    defaultKeys: 'Ctrl+W',
    currentKeys: 'Ctrl+W',
    description: 'Close current project'
  },
  {
    id: 'file-exit',
    label: 'Exit',
    category: 'File',
    defaultKeys: 'Alt+F4',
    currentKeys: 'Alt+F4',
    description: 'Exit application'
  },

  // Edit
  {
    id: 'edit-undo',
    label: 'Undo',
    category: 'Edit',
    defaultKeys: 'Ctrl+Z',
    currentKeys: 'Ctrl+Z',
    description: 'Undo last change'
  },
  {
    id: 'edit-redo',
    label: 'Redo',
    category: 'Edit',
    defaultKeys: 'Ctrl+Y',
    currentKeys: 'Ctrl+Y',
    description: 'Redo last undone change'
  },
  {
    id: 'edit-cut',
    label: 'Cut',
    category: 'Edit',
    defaultKeys: 'Ctrl+X',
    currentKeys: 'Ctrl+X',
    description: 'Cut selection'
  },
  {
    id: 'edit-copy',
    label: 'Copy',
    category: 'Edit',
    defaultKeys: 'Ctrl+C',
    currentKeys: 'Ctrl+C',
    description: 'Copy selection'
  },
  {
    id: 'edit-paste',
    label: 'Paste',
    category: 'Edit',
    defaultKeys: 'Ctrl+V',
    currentKeys: 'Ctrl+V',
    description: 'Paste from clipboard'
  },
  {
    id: 'edit-find',
    label: 'Find',
    category: 'Edit',
    defaultKeys: 'Ctrl+F',
    currentKeys: 'Ctrl+F',
    description: 'Find text'
  },
  {
    id: 'edit-replace',
    label: 'Replace',
    category: 'Edit',
    defaultKeys: 'Ctrl+H',
    currentKeys: 'Ctrl+H',
    description: 'Find and replace'
  },
  {
    id: 'edit-find-files',
    label: 'Find in Files',
    category: 'Edit',
    defaultKeys: 'Ctrl+Shift+F',
    currentKeys: 'Ctrl+Shift+F',
    description: 'Search across all files'
  },

  // View
  {
    id: 'view-command-palette',
    label: 'Command Palette',
    category: 'View',
    defaultKeys: 'Ctrl+Shift+P',
    currentKeys: 'Ctrl+Shift+P',
    description: 'Open command palette'
  },
  {
    id: 'view-toggle-sidebar',
    label: 'Toggle Sidebar',
    category: 'View',
    defaultKeys: 'Ctrl+B',
    currentKeys: 'Ctrl+B',
    description: 'Toggle sidebar visibility'
  },
  {
    id: 'view-toggle-context-pane',
    label: 'Toggle Context Pane',
    category: 'View',
    defaultKeys: 'Ctrl+Alt+P',
    currentKeys: 'Ctrl+Alt+P',
    description: 'Toggle context pane visibility'
  },
  {
    id: 'view-toggle-diagnostics',
    label: 'Toggle Diagnostics',
    category: 'View',
    defaultKeys: 'Ctrl+`',
    currentKeys: 'Ctrl+`',
    description: 'Toggle diagnostics panel'
  },
  {
    id: 'view-zoom-in',
    label: 'Zoom In',
    category: 'View',
    defaultKeys: 'Ctrl+=',
    currentKeys: 'Ctrl+=',
    description: 'Increase zoom level'
  },
  {
    id: 'view-zoom-out',
    label: 'Zoom Out',
    category: 'View',
    defaultKeys: 'Ctrl+-',
    currentKeys: 'Ctrl+-',
    description: 'Decrease zoom level'
  },
  {
    id: 'view-zoom-reset',
    label: 'Reset Zoom',
    category: 'View',
    defaultKeys: 'Ctrl+0',
    currentKeys: 'Ctrl+0',
    description: 'Reset zoom to default'
  },

  // Project
  {
    id: 'project-add-files',
    label: 'Add Files',
    category: 'Project',
    defaultKeys: 'Ctrl+Shift+A',
    currentKeys: 'Ctrl+Shift+A',
    description: 'Add files to project'
  },
  {
    id: 'project-build',
    label: 'Build Project',
    category: 'Project',
    defaultKeys: 'Ctrl+Shift+B',
    currentKeys: 'Ctrl+Shift+B',
    description: 'Build current project'
  },
  {
    id: 'project-validate',
    label: 'Validate All',
    category: 'Project',
    defaultKeys: 'Ctrl+Shift+V',
    currentKeys: 'Ctrl+Shift+V',
    description: 'Validate all files'
  },
  {
    id: 'project-clean-build',
    label: 'Clean Build',
    category: 'Project',
    defaultKeys: 'Ctrl+Shift+C',
    currentKeys: 'Ctrl+Shift+C',
    description: 'Clean and rebuild project'
  },
  {
    id: 'project-settings',
    label: 'Project Settings',
    category: 'Project',
    defaultKeys: 'Ctrl+,',
    currentKeys: 'Ctrl+,',
    description: 'Open project settings'
  },

  // Help
  {
    id: 'help-docs',
    label: 'Documentation',
    category: 'Help',
    defaultKeys: 'F1',
    currentKeys: 'F1',
    description: 'Open documentation'
  },
  {
    id: 'help-shortcuts',
    label: 'Keyboard Shortcuts',
    category: 'Help',
    defaultKeys: 'Ctrl+?',
    currentKeys: 'Ctrl+?',
    description: 'Show keyboard shortcuts'
  },
  {
    id: 'help-about',
    label: 'About',
    category: 'Help',
    defaultKeys: 'F12',
    currentKeys: 'F12',
    description: 'About JPE Translator'
  },
  {
    id: 'help-dictionary',
    label: 'Command Dictionary',
    category: 'Help',
    defaultKeys: 'Ctrl+K',
    currentKeys: 'Ctrl+K',
    description: 'Open the JPE Command Dictionary'
  },
  {
    id: 'project-conflict-scan',
    label: 'Scan for Project Conflicts',
    category: 'Project',
    defaultKeys: 'Ctrl+Shift+L',
    currentKeys: 'Ctrl+Shift+L',
    description: 'Run project-wide AI conflict detection'
  }
]

export const useShortcutStore = create<ShortcutState>()(
  persist(
    (set, get) => ({
      shortcuts: DEFAULT_SHORTCUTS,
      recentlyUsed: [],
      initialized: false,

      getShortcut: (id: string) => {
        return get().shortcuts.find((s) => s.id === id)
      },

      getShortcutsByCategory: (category: string) => {
        return get().shortcuts.filter((s) => s.category === category)
      },

      getAllShortcuts: () => {
        return get().shortcuts
      },

      updateShortcut: (id: string, newKeys: string) => {
        const { shortcuts } = get()

        // Check for conflicts
        const conflict = shortcuts.find((s) => s.currentKeys === newKeys && s.id !== id)
        if (conflict) {
          console.warn(`Shortcut conflict: ${newKeys} is already assigned to ${conflict.label}`)
          return false
        }

        set((state) => ({
          shortcuts: state.shortcuts.map((s) =>
            s.id === id ? { ...s, currentKeys: newKeys } : s
          )
        }))

        return true
      },

      resetShortcut: (id: string) => {
        set((state) => ({
          shortcuts: state.shortcuts.map((s) =>
            s.id === id ? { ...s, currentKeys: s.defaultKeys } : s
          )
        }))
      },

      resetAllShortcuts: () => {
        set((state) => ({
          shortcuts: state.shortcuts.map((s) => ({
            ...s,
            currentKeys: s.defaultKeys
          }))
        }))
      },

      recordShortcutUsage: (id: string) => {
        set((state) => ({
          recentlyUsed: [id, ...state.recentlyUsed.filter((x) => x !== id)].slice(0, 10)
        }))
      },

      setInitialized: (value: boolean) => {
        set({ initialized: value })
      }
    }),
    {
      name: 'shortcut-store',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
    }
  )
)
