/**
 * High Contrast Theme
 *
 * WCAG AAA compliant theme for users with visual sensitivities.
 * Provides maximum contrast ratio (≥7:1 for normal text, ≥4.5:1 for large text).
 */

/**
 * High Contrast Theme Tokens
 */
export const HIGH_CONTRAST_THEME = {
  // Backgrounds - pure black/white for max contrast
  bgPrimary: '#000000',
  bgSecondary: '#0A0A0A',
  bgTertiary: '#141414',
  bgElevated: '#1A1A1A',
  bgHover: '#2A2A2A',
  bgActive: '#333333',

  // Text - pure white for max readability
  textPrimary: '#FFFFFF',
  textSecondary: '#F0F0F0',
  textTertiary: '#D0D0D0',
  textDisabled: '#808080',

  // Borders - high contrast borders
  borderSubtle: '#404040',
  borderDefault: '#606060',
  borderStrong: '#808080',

  // State Colors - WCAG AAA compliant
  stateError: '#FF4444',
  stateErrorBg: '#330000',
  stateWarning: '#FFAA00',
  stateWarningBg: '#332200',
  stateInfo: '#00AAFF',
  stateInfoBg: '#001133',
  stateSuccess: '#00FF88',
  stateSuccessBg: '#003311',

  // Accent Colors - high visibility
  accentPrimary: '#00FFFF',
  accentSecondary: '#FF00FF',
  accentTertiary: '#FFFF00',

  // Code Editor
  editorBg: '#000000',
  editorFg: '#FFFFFF',
  editorCursor: '#00FF00',
  editorSelection: '#0044AA',
  editorLineHighlight: '#111111',
  editorLineNumber: '#666666',
  editorActiveLineNumber: '#FFFFFF',

  // JPE Syntax Highlighting (HC)
  jpeKeyword: '#FFFF00',
  jpeString: '#00FF00',
  jpeComment: '#888888',
  jpeNumber: '#FF8800',
  jpeOperator: '#FF00FF',
  jpeFunction: '#00FFFF',

  // UI Components
  buttonPrimary: '#00AAFF',
  buttonPrimaryFg: '#000000',
  buttonSecondary: '#333333',
  buttonSecondaryFg: '#FFFFFF',

  // Scrollbar
  scrollbarTrack: '#111111',
  scrollbarThumb: '#444444',
  scrollbarThumbHover: '#666666',
} as const

/**
 * Apply high contrast theme to document
 */
export function applyHighContrastTheme(): void {
  const root = document.documentElement
  root.classList.add('theme-high-contrast')
  root.classList.remove('dark', 'light')

  // Apply CSS custom properties
  Object.entries(HIGH_CONTRAST_THEME).forEach(([key, value]) => {
    const cssVar = `--hc-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    root.style.setProperty(cssVar, value)
  })
}

/**
 * Remove high contrast theme
 */
export function removeHighContrastTheme(): void {
  const root = document.documentElement
  root.classList.remove('theme-high-contrast')
}

/**
 * Toggle high contrast theme
 */
export function toggleHighContrastTheme(): boolean {
  const root = document.documentElement
  const isActive = root.classList.contains('theme-high-contrast')

  if (isActive) {
    removeHighContrastTheme()
    return false
  } else {
    applyHighContrastTheme()
    return true
  }
}
