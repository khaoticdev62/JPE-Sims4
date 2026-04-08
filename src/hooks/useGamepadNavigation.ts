import { useState, useCallback, useEffect } from 'react'
import { gamepad } from '@/services/input/GamepadService'
import { useUIStore } from '@/stores/useUIStore'
import { useEditorStore } from '@/stores/useEditorStore'

export function useGamepadNavigation() {
  const { focusedPane, setFocusedPane, toggleSidebar } = useUIStore()
  const { tabs, activeTabId, setActiveTab } = useEditorStore()
  
  const [showHelp, setShowHelp] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [focusedActionIndex, setFocusedActionIndex] = useState(0)
  
  const handleAction = useCallback((data: any) => {
    const action = data.action;
    
    switch (action) {
      case 'ignite':
        window.dispatchEvent(new CustomEvent('jpe:ignite'));
        break;

      case 'build':
        window.dispatchEvent(new CustomEvent('jpe:build'));
        break;

      case 'focus-mode':
        setFocusMode(prev => !prev);
        break;

      case 'cursor-up':
        setFocusedActionIndex(prev => Math.max(0, prev - 3));
        break;
        
      case 'cursor-down':
        setFocusedActionIndex(prev => Math.min(5, prev + 3));
        break;
        
      case 'cursor-left':
        if (focusedPane === 'editor') {
          setFocusedPane('sidebar');
        } else {
          setFocusedActionIndex(prev => Math.max(0, prev - 1));
        }
        break;
        
      case 'cursor-right':
        if (focusedPane === 'sidebar') {
          setFocusedPane('editor');
        } else {
          setFocusedActionIndex(prev => Math.min(5, prev + 1));
        }
        break;

      case 'confirm':
        // Trigger generic confirm action
        window.dispatchEvent(new CustomEvent('jpe:confirm', { detail: { index: focusedActionIndex } }));
        break;

      case 'prev-tab': {
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id)
        break
      }
      
      case 'next-tab': {
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id)
        break
      }
      
      case 'show-menu':
        toggleSidebar()
        break
        
      case 'show-settings':
        setShowHelp(prev => !prev)
        break
    }
  }, [tabs, activeTabId, focusedPane, setActiveTab, setFocusedPane, toggleSidebar, focusedActionIndex])

  useEffect(() => {
    gamepad.on('action', handleAction);
    return () => gamepad.off('action', handleAction);
  }, [handleAction]);

  return {
    focusedPane,
    showHelp,
    setShowHelp,
    focusMode,
    focusedActionIndex
  }
}
