"use client"

import * as React from "react"
import { useUIStore } from "@/stores/useUIStore"

/**
 * ShortcutProvider - Global Keyboard Event Listener
 * Story 6.3: Command Dictionary & Global Shortcut (Ctrl+K)
 */
export function ShortcutProvider({ children }: { children: React.ReactNode }) {
  const { setCommandPaletteOpen, isCommandPaletteOpen } = useUIStore()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K (or Cmd+K on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!isCommandPaletteOpen)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setCommandPaletteOpen, isCommandPaletteOpen])

  return <>{children}</>
}
