import { useEffect } from 'react'
import { useUIStore } from '@/stores/useUIStore'

/**
 * Universal Keyboard Navigation Hook
 * Implements IDE-standard shortcuts for pane switching and common actions.
 */
export function useKeyboardNavigation() {
  const { setFocusedPane, toggleRightPanel, toggleSidebar, toggleCommandPalette } = useUIStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Pane Switching (Alt + 1/2/3)
      if (e.altKey && e.key === '1') {
        e.preventDefault()
        const el = document.getElementById('sidebar-panel')
        if (el) {
          el.focus()
          setFocusedPane('sidebar')
        }
      }
      
      if (e.altKey && e.key === '2') {
        e.preventDefault()
        const el = document.getElementById('main-content')
        if (el) {
          el.focus()
          setFocusedPane('editor')
        }
      }

      if (e.altKey && e.key === '3') {
        e.preventDefault()
        const el = document.getElementById('right-panel')
        if (el) {
          el.focus()
          setFocusedPane('right-panel')
        }
      }

      // 2. Quick Toggles
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }

      if (e.ctrlKey && e.key === 'j') {
        e.preventDefault()
        toggleRightPanel()
      }

      // 3. Command Palette (Story 6.3)
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        toggleCommandPalette()
      }

      // 4. legacy p support
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault()
        toggleCommandPalette()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setFocusedPane, toggleRightPanel, toggleSidebar, toggleCommandPalette])
}
