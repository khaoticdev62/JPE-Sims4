"use client";

import { useEffect, useRef } from 'react'
import { getEditorInstance } from '@/components/editor/MonacoEditor'
import { useEditorStore } from '@/stores/useEditorStore'

/**
 * useScrollSync
 * 
 * Synchronizes the scroll position between two Monaco Editor instances
 * using percentage-based mapping.
 * 
 * @param sourceId ID of the source editor (e.g., 'source')
 * @param targetId ID of the target editor (e.g., 'preview')
 * @param enabled Whether synchronization is active
 */
export function useScrollSync(sourceId: string, targetId: string, enabled: boolean) {
  const isSyncing = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const sourceEditor = getEditorInstance(sourceId)
    const targetEditor = getEditorInstance(targetId)

    if (!sourceEditor || !targetEditor) return

    const handleScroll = (master: any, slave: any) => {
      if (isSyncing.current) return
      
      isSyncing.current = true
      
      try {
        const masterInfo = master.getScrollTop()
        const masterHeight = master.getScrollHeight() - master.getLayoutInfo().height
        
        if (masterHeight <= 0) {
           isSyncing.current = false
           return
        }

        const percentage = masterInfo / masterHeight
        
        const slaveHeight = slave.getScrollHeight() - slave.getLayoutInfo().height
        slave.setScrollTop(percentage * slaveHeight)
      } finally {
        // Use a small timeout to let the event loop settle
        setTimeout(() => {
          isSyncing.current = false
        }, 10)
      }
    }

    const disposableSource = sourceEditor.onDidScrollChange(() => {
      handleScroll(sourceEditor, targetEditor)
    })

    const disposableTarget = targetEditor.onDidScrollChange(() => {
      handleScroll(targetEditor, sourceEditor)
    })

    return () => {
      disposableSource.dispose()
      disposableTarget.dispose()
    }
  }, [sourceId, targetId, enabled])
}
