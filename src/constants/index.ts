// File type definitions
export const SUPPORTED_FILE_TYPES = {
  XML: 'xml',
  STBL: 'stbl',
  TYPESCRIPT: 'ts4script',
  PACKAGE: 'package',
  JSON: 'json',
  CONFIG: 'cfg',
  PYTHON: 'py',
} as const

export const FILE_TYPE_DESCRIPTIONS: Record<string, string> = {
  xml: 'XML Tuning File',
  stbl: 'String Table',
  ts4script: 'TypeScript/Python Script',
  package: 'Package File',
  json: 'JSON Configuration',
  cfg: 'Config File',
  py: 'Python Script',
}

export const FILE_EXTENSIONS = {
  xml: ['.xml'],
  stbl: ['.stbl'],
  ts4script: ['.ts4script'],
  package: ['.package'],
  json: ['.json'],
  cfg: ['.cfg'],
  py: ['.py'],
} as const

// Diagnostic severity levels
export const DIAGNOSTIC_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const

// UI dimensions
export const UI_DIMENSIONS = {
  TITLE_BAR_HEIGHT: 48,
  EDITOR_TABS_HEIGHT: 40,
  GUTTER_WIDTH: 60,
  SIDEBAR_WIDTH: 256,
  RIGHT_PANEL_WIDTH: 320,
} as const

// Editor defaults
export const EDITOR_DEFAULTS = {
  FONT_SIZE: 13,
  LINE_HEIGHT: 1.5,
  TAB_SIZE: 2,
  USE_SPACES: true,
} as const

// Timeouts (ms)
export const TIMEOUTS = {
  DEBOUNCE_VALIDATION: 500,
  DEBOUNCE_COMPILE: 1000,
  PARSE_TIMEOUT: 5000,
  COMPILE_TIMEOUT: 10000,
} as const

// Storage keys
export const STORAGE_KEYS = {
  RECENT_PROJECTS: 'jpe-recent-projects',
  USER_SETTINGS: 'jpe-user-settings',
  EDITOR_STATE: 'jpe-editor-state',
} as const
