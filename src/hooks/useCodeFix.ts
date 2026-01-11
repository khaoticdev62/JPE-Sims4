import { useState, useCallback } from 'react'
import { ClaudeService } from '@/services/ai/ClaudeService'
import { useEditorStore } from '@/stores/useEditorStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { toast } from 'sonner'

export function useCodeFix() {
  const { updateTabContent, activeTabId, tabs, editorContent } = useEditorStore()
  const { getFile, updateFile } = useProjectStore()
  
  const [isFixing, setIsCompiling] = useState(false)
  const [diffData, setDiffData] = useState<{ 
    original: string
    modified: string
    explanation: string
    fileName: string
  } | null>(null)

  const activeTab = tabs.find(t => t.id === activeTabId)
  const activeFile = activeTab ? getFile(activeTab.fileId) : null

  const requestFix = useCallback(async (errorMessage: string, errorLine: number) => {
    if (!activeTab || !activeFile) return

    const currentContent = editorContent.get(activeTab.id) || ''
    
    // Extract context around error (5 lines before and after)
    const lines = currentContent.split('\n')
    const start = Math.max(0, errorLine - 5)
    const end = Math.min(lines.length, errorLine + 5)
    const context = lines.slice(start, end).join('\n')

    setIsCompiling(true)
    try {
      const claude = ClaudeService.getInstance()
      const result = await claude.suggestFix(
        currentContent,
        activeFile.name,
        errorMessage,
        context
      )

      if (result.success && result.fixedCode) {
        setDiffData({
          original: currentContent,
          modified: result.fixedCode,
          explanation: result.explanation || 'No explanation provided',
          fileName: activeFile.name
        })
      } else {
        toast.error(result.error || 'Failed to generate fix')
      }
    } catch (error) {
      toast.error('An error occurred while requesting fix')
    } finally {
      setIsCompiling(false)
    }
  }, [activeTab, activeFile, editorContent])

  const applyFix = useCallback(() => {
    if (!diffData || !activeTab || !activeFile) return

    updateTabContent(activeTab.id, diffData.modified)
    updateFile(activeFile.id, {
      content: diffData.modified,
      isDirty: true
    })
    
    setDiffData(null)
    toast.success('Fix applied successfully')
  }, [diffData, activeTab, activeFile, updateTabContent, updateFile])

  return {
    isFixing,
    diffData,
    setDiffData,
    requestFix,
    applyFix
  }
}
