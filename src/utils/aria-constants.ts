/**
 * ARIA Constants
 *
 * Centralized accessibility constants for consistent ARIA implementation.
 */

// Common ARIA roles
export const ARIA_ROLES = {
  BUTTON: 'button',
  SWITCH: 'switch',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  SEARCH: 'search',
  STATUS: 'status',
  LOG: 'log',
  ALERT: 'alert',
  PROGRESSBAR: 'progressbar',
  TOOLTIP: 'tooltip',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  TREE: 'tree',
  TREEITEM: 'treeitem',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  COMPLEMENTARY: 'complementary',
  FORM: 'form',
  REGION: 'region',
} as const

// Common ARIA labels
export const ARIA_LABELS = {
  // Navigation
  MAIN_NAV: 'Main navigation',
  SIDEBAR: 'Sidebar navigation',
  FILE_TREE: 'Project file tree',
  COMMAND_PALETTE: 'Command palette (Ctrl+K)',

  // Editor
  CODE_EDITOR: 'Code editor',
  PREVIEW_PANEL: 'XML preview panel',
  DIAGNOSTICS_PANEL: 'Diagnostics panel',
  STATUS_BAR: 'Status bar',

  // Actions
  SAVE_FILE: 'Save file (Ctrl+S)',
  COMPILE_FILE: 'Compile file (Ctrl+Shift+B)',
  SEARCH_REPLACE: 'Search and replace (Ctrl+H)',
  UNDO: 'Undo (Ctrl+Z)',
  REDO: 'Redo (Ctrl+Shift+Z)',

  // Wizards
  BUFF_WIZARD: 'Buff creation wizard',
  INTERACTION_WIZARD: 'Interaction creation wizard',
  TRAIT_WIZARD: 'Trait creation wizard',

  // AI Features
  AI_ASSISTANT: 'AI assistant panel',
  PROMPT_TO_JPE: 'Prompt to JPE dialog',
  AI_EXPLANATION: 'AI explanation modal',

  // Bridge
  JPE_LIVE_BRIDGE: 'JPE-Live bridge connection',
  BRIDGE_TOGGLE: 'Enable/disable JPE-Live bridge',

  // Sensory
  SENSORY_PREFERENCES: 'Sensory preferences panel',
  HIGH_CONTRAST_TOGGLE: 'Toggle high contrast mode',

  // Help
  HELP_CENTER: 'Help center',
  ONBOARDING_TOUR: 'Onboarding tour',

  // Settings
  SETTINGS_PAGE: 'Settings page',
  MODS_FOLDER_PATH: 'Mods folder path',
  REINDEX_MODS: 'Re-index mods folder',
} as const

// Keyboard shortcuts map
export const KEYBOARD_SHORTCUTS = {
  SAVE: { key: 's', ctrlKey: true },
  COMPILE: { key: 'B', ctrlKey: true, shiftKey: true },
  SEARCH: { key: 'f', ctrlKey: true },
  REPLACE: { key: 'h', ctrlKey: true },
  COMMAND_PALETTE: { key: 'k', ctrlKey: true },
  UNDO: { key: 'z', ctrlKey: true },
  REDO: { key: 'z', ctrlKey: true, shiftKey: true },
  GO_TO_LINE: { key: 'g', ctrlKey: true },
  FIND_FILE: { key: 'p', ctrlKey: true },
  HELP: { key: 'F1' },
  TOGGLE_SIDEBAR: { key: 'b', ctrlKey: true },
  TOGGLE_PREVIEW: { key: 'p', ctrlKey: true, shiftKey: true },
} as const
