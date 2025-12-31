import { useEffect, useRef } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'

const AUTO_SAVE_INTERVAL_MS = 30000 // 30 seconds

/**
 * Hook for automatic saving of dirty files
 */
export function useAutoSave() {
  const { currentProject, saveProject } = useProjectStore()
  const { tabs } = useEditorStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only run if there's a project and dirty tabs
    const hasDirtyTabs = tabs.some(tab => tab.isDirty)
    
    if (currentProject && hasDirtyTabs) {
      if (!timerRef.current) {
        timerRef.current = setInterval(async () => {
          try {
            await saveProject()
            console.warn('[AutoSave] Project saved automatically')
          } catch (error) {
            console.error('[AutoSave] Failed to auto-save:', error)
          }
        }, AUTO_SAVE_INTERVAL_MS)
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentProject, tabs, saveProject])
}
