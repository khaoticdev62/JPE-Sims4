import { useState, useCallback, useRef } from 'react'
import { useGamepadButtonDown } from './useGamepadInput'
import { useUIStore } from '@/stores/useUIStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { ControllerMapper } from '@/services/input/ControllerMapper'

export function useGamepadNavigation() {
  const { focusedPane, setFocusedPane, toggleSidebar } = useUIStore()
  const { tabs, activeTabId, setActiveTab } = useEditorStore()
  
  const [showHelp, setShowHelp] = useState(false)
  const mapper = useRef(new ControllerMapper())
  
  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'prev-tab': {
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        if (currentIndex > 0) {
          setActiveTab(tabs[currentIndex - 1].id)
        } else if (tabs.length > 0) {
          setActiveTab(tabs[tabs.length - 1].id) // Cycle to last
        }
        break
      }
      
      case 'next-tab': {
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        if (currentIndex < tabs.length - 1) {
          setActiveTab(tabs[currentIndex + 1].id)
        } else if (tabs.length > 0) {
          setActiveTab(tabs[0].id) // Cycle to first
        }
        break
      }
      
      case 'focus-editor':
        setFocusedPane('editor')
        break
        
      case 'focus-terminal': // Mapping to diagnostics for now
        setFocusedPane('diagnostics')
        break
        
      case 'show-menu':
        toggleSidebar()
        break
        
      case 'show-settings':
        setShowHelp(prev => !prev)
        break

      // Pane cycling with D-Pad
      case 'cursor-left':
        if (focusedPane === 'editor') setFocusedPane('sidebar')
        else if (focusedPane === 'right-panel') setFocusedPane('editor')
        break
        
      case 'cursor-right':
        if (focusedPane === 'sidebar') setFocusedPane('editor')
        else if (focusedPane === 'editor') setFocusedPane('right-panel')
        break
        
      case 'cursor-down':
        if (focusedPane !== 'diagnostics') setFocusedPane('diagnostics')
        break
        
      case 'cursor-up':
        if (focusedPane === 'diagnostics') setFocusedPane('editor')
        break
    }
  }, [tabs, activeTabId, focusedPane, setActiveTab, setFocusedPane, toggleSidebar])

  // Navigation Buttons
  useGamepadButtonDown(4, () => handleAction(mapper.current.getAction('button_4')!)) // LB
  useGamepadButtonDown(5, () => handleAction(mapper.current.getAction('button_5')!)) // RB
  
  // Pane Focus / Shortcuts
  useGamepadButtonDown(10, () => handleAction(mapper.current.getAction('button_10')!)) // L3
  useGamepadButtonDown(11, () => handleAction(mapper.current.getAction('button_11')!)) // R3
  useGamepadButtonDown(8, () => handleAction(mapper.current.getAction('button_8')!))   // Select
  useGamepadButtonDown(9, () => handleAction(mapper.current.getAction('button_9')!))   // Start
  
  // D-Pad Navigation
  useGamepadButtonDown(12, () => handleAction(mapper.current.getAction('button_12')!)) // Up
  useGamepadButtonDown(13, () => handleAction(mapper.current.getAction('button_13')!)) // Down
  useGamepadButtonDown(14, () => handleAction(mapper.current.getAction('button_14')!)) // Left
  useGamepadButtonDown(15, () => handleAction(mapper.current.getAction('button_15')!)) // Right

  return {
    focusedPane,
    showHelp,
    setShowHelp
  }
}
