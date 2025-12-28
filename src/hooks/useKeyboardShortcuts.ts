import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  keys: string[]
  description: string
  handler: () => void
  enabled?: boolean
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
}

/**
 * Hook for managing keyboard shortcuts globally
 * Supports combinations like Ctrl+S, Ctrl+Shift+B, etc.
 */
export function useKeyboardShortcuts({ shortcuts }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input
      const target = event.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'

      // Allow Ctrl+S and Ctrl+Shift+B even in inputs/textareas
      const allowInInput = ['s', 'b'].includes(event.key.toLowerCase())

      if (isInput && !allowInInput && (event.ctrlKey || event.metaKey || event.shiftKey)) {
        return
      }

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue

        const matchesKeys = shortcut.keys.every((key) => {
          const lower = key.toLowerCase()
          if (lower === 'ctrl' || lower === 'cmd') {
            return event.ctrlKey || event.metaKey
          }
          if (lower === 'shift') {
            return event.shiftKey
          }
          if (lower === 'alt') {
            return event.altKey
          }
          return event.key.toLowerCase() === lower
        })

        if (matchesKeys) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Get all available keyboard shortcuts
 * Used for displaying keyboard shortcut help
 */
export function getAvailableShortcuts(): Record<string, string> {
  return {
    'Ctrl+S (Cmd+S)': 'Save file',
    'Ctrl+Shift+B (Cmd+Shift+B)': 'Compile project',
    'Ctrl+N (Cmd+N)': 'New project',
    'Ctrl+O (Cmd+O)': 'Open project',
    'Tab': 'Switch to next tab',
    'Shift+Tab': 'Switch to previous tab',
    'Ctrl+W (Cmd+W)': 'Close current tab',
    'Escape': 'Close dialog/menu',
  }
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(keys: string[]): string {
  return keys.map((key) => {
    const lower = key.toLowerCase()
    if (lower === 'cmd') return '⌘'
    if (lower === 'ctrl') return 'Ctrl'
    if (lower === 'shift') return 'Shift'
    if (lower === 'alt') return 'Alt'
    return key.toUpperCase()
  }).join('+')
}
