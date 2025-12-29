import { create } from 'zustand'

export interface Command {
  id: string
  label: string
  category: 'File' | 'Edit' | 'View' | 'Project' | 'Help'
  shortcut?: string
  action: () => void
}

export interface CommandState {
  commands: Command[]
  recentCommands: string[]

  registerCommands: (commands: Command[]) => void
  executeCommand: (id: string) => void
  addRecentCommand: (id: string) => void
  getRecentCommands: (limit?: number) => Command[]
  searchCommands: (query: string) => Command[]
}

// Default application commands
export const DEFAULT_COMMANDS: Command[] = [
  // File Commands
  { id: 'new-project', label: 'New Project', category: 'File', shortcut: 'Ctrl+N', action: () => {} },
  { id: 'open-project', label: 'Open Project', category: 'File', shortcut: 'Ctrl+O', action: () => {} },
  { id: 'save', label: 'Save', category: 'File', shortcut: 'Ctrl+S', action: () => {} },
  { id: 'save-all', label: 'Save All', category: 'File', shortcut: 'Ctrl+Shift+S', action: () => {} },
  { id: 'close-project', label: 'Close Project', category: 'File', action: () => {} },
  { id: 'exit', label: 'Exit', category: 'File', shortcut: 'Alt+F4', action: () => {} },

  // Edit Commands
  { id: 'undo', label: 'Undo', category: 'Edit', shortcut: 'Ctrl+Z', action: () => {} },
  { id: 'redo', label: 'Redo', category: 'Edit', shortcut: 'Ctrl+Y', action: () => {} },
  { id: 'cut', label: 'Cut', category: 'Edit', shortcut: 'Ctrl+X', action: () => {} },
  { id: 'copy', label: 'Copy', category: 'Edit', shortcut: 'Ctrl+C', action: () => {} },
  { id: 'paste', label: 'Paste', category: 'Edit', shortcut: 'Ctrl+V', action: () => {} },
  { id: 'find', label: 'Find', category: 'Edit', shortcut: 'Ctrl+F', action: () => {} },
  { id: 'replace', label: 'Replace', category: 'Edit', shortcut: 'Ctrl+H', action: () => {} },
  { id: 'find-in-files', label: 'Find in Files', category: 'Edit', shortcut: 'Ctrl+Shift+F', action: () => {} },

  // View Commands
  { id: 'command-palette', label: 'Command Palette', category: 'View', shortcut: 'Ctrl+Shift+P', action: () => {} },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', category: 'View', shortcut: 'Ctrl+B', action: () => {} },
  { id: 'toggle-context-pane', label: 'Toggle Context Pane', category: 'View', shortcut: 'Ctrl+Alt+P', action: () => {} },
  { id: 'toggle-diagnostics', label: 'Toggle Diagnostics', category: 'View', shortcut: 'Ctrl+`', action: () => {} },
  { id: 'zoom-in', label: 'Zoom In', category: 'View', shortcut: 'Ctrl++', action: () => {} },
  { id: 'zoom-out', label: 'Zoom Out', category: 'View', shortcut: 'Ctrl+-', action: () => {} },
  { id: 'reset-zoom', label: 'Reset Zoom', category: 'View', shortcut: 'Ctrl+0', action: () => {} },

  // Project Commands
  { id: 'add-files', label: 'Add Files', category: 'Project', shortcut: 'Ctrl+Shift+A', action: () => {} },
  { id: 'build-project', label: 'Build Project', category: 'Project', shortcut: 'Ctrl+Shift+B', action: () => {} },
  { id: 'validate-all', label: 'Validate All', category: 'Project', shortcut: 'Ctrl+Shift+V', action: () => {} },
  { id: 'clean-build', label: 'Clean Build', category: 'Project', action: () => {} },
  { id: 'export-package', label: 'Export to Package', category: 'Project', action: () => {} },
  { id: 'project-settings', label: 'Project Settings', category: 'Project', action: () => {} },

  // Help Commands
  { id: 'documentation', label: 'Documentation', category: 'Help', shortcut: 'F1', action: () => {} },
  { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', category: 'Help', shortcut: 'Ctrl+?', action: () => {} },
  { id: 'report-issue', label: 'Report Issue', category: 'Help', action: () => {} },
  { id: 'about', label: 'About JPE Translator', category: 'Help', action: () => {} },
]

export const useCommandStore = create<CommandState>((set, get) => ({
  commands: DEFAULT_COMMANDS,
  recentCommands: [],

  registerCommands: (commands) => {
    set({ commands })
  },

  executeCommand: (id) => {
    const command = get().commands.find((c) => c.id === id)
    if (command) {
      command.action()
      get().addRecentCommand(id)
    }
  },

  addRecentCommand: (id) => {
    set((state) => {
      const recent = [id, ...state.recentCommands.filter((c) => c !== id)].slice(0, 10)
      return { recentCommands: recent }
    })
  },

  getRecentCommands: (limit = 5) => {
    const { commands, recentCommands } = get()
    return recentCommands
      .slice(0, limit)
      .map((id) => commands.find((c) => c.id === id))
      .filter((cmd): cmd is Command => Boolean(cmd))
  },

  searchCommands: (query) => {
    if (!query) return get().getRecentCommands()

    const { commands } = get()
    const lowerQuery = query.toLowerCase()

    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    )
  },
}))
