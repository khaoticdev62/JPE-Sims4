import { useState, useCallback } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useSymbolStore } from '@/stores/useSymbolStore'
import { useAIStore } from '@/stores/useAIStore'
import { AIServiceFactory } from '@/services/ai/AIServiceFactory'
import { toast } from 'sonner'
import { Diagnostic } from '@/types'
import { Explanation } from '@/services/ai/types'

export function useCodeFix() {
  const { updateTabContent, activeTabId, tabs, editorContent } = useEditorStore()
  const { getFile, updateFile } = useProjectStore()
  const _symbols = useSymbolStore.getState()

  const { activeProvider: _activeProvider } = useAIStore()
  
  const [isFixing, setIsFixing] = useState(false)
  const [isExplaining, setIsExplaining] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  const [diffData, setDiffData] = useState<{ 
    original: string
    modified: string
    explanation: string
    fileName: string
  } | null>(null)

  const [explanationData, setExplanationData] = useState<{
    explanation: Explanation
    diagnostic: Diagnostic
  } | null>(null)

  const activeTab = tabs.find(t => t.id === activeTabId)
  const activeFile = activeTab ? getFile(activeTab.fileId) : null

  const requestExplanation = useCallback(async (diagnostic: Diagnostic) => {
    if (!activeTab || !activeFile) return
    const currentContent = editorContent[activeTab.id] || ''
    const originalTabId = activeTabId // Capture for stale check
    
    // Improved processingId for collision avoidance (Line-Column-Code)
    const diagId = `${diagnostic.line}-${diagnostic.column}-${diagnostic.code || 'err'}`
    setProcessingId(diagId)
    setIsExplaining(true)
    
    try {
      const service = AIServiceFactory.getActiveService()
      if (!service) throw new Error('No active AI service')
      const result = await service.explainDiagnostic(currentContent, activeFile.name, diagnostic)
      
      // STALE CHECK: Ensure user hasn't switched tabs or closed the file
      if (useEditorStore.getState().activeTabId !== originalTabId) return

      if (result.success && result.explanation) {
        setExplanationData({
          explanation: result.explanation,
          diagnostic
        })
      } else {
        toast.error(result.error || 'Failed to explain error')
      }
    } catch (error) {
      console.error('Explanation error:', error)
      toast.error('An error occurred during AI analysis')
    } finally {
      setIsExplaining(false)
      setProcessingId(null)
    }
  }, [activeTab, activeFile, editorContent])

  const requestFix = useCallback(async (diagnostic: Diagnostic) => {
    if (!activeTab || !activeFile) return

    const currentContent = editorContent[activeTab.id] || ''
    const originalTabId = activeTabId
    const errorLine = diagnostic.line
    
    const diagId = `${diagnostic.line}-${diagnostic.column}-${diagnostic.code || 'err'}`
    setProcessingId(diagId)
    setIsFixing(true)
    
    try {
      const lines = currentContent.split('\n')
      const start = Math.max(0, errorLine - 10)
      const end = Math.min(lines.length, errorLine + 20) 
      const contextLines = lines.slice(start, end).join('\n')

      const service = AIServiceFactory.getActiveService()
      if (!service) throw new Error('No active AI service')
      
      const result = await service.fixDiagnostic(
        currentContent,
        activeFile.name,
        diagnostic,
        contextLines
      )

      // STALE CHECK
      if (useEditorStore.getState().activeTabId !== originalTabId) return

      if (result.success && result.fixedCode) {
        setDiffData({
          original: currentContent,
          modified: result.fixedCode,
          explanation: result.explanation?.overview || 'Fix generated',
          fileName: activeFile.name
        })
      } else {
        toast.error(result.error || 'Failed to generate fix')
      }
    } catch (error) {
      console.error('Code fix error:', error)
      toast.error('An error occurred while requesting fix')
    } finally {
      setIsFixing(false)
      setProcessingId(null)
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
    isExplaining,
    processingId,
    diffData,
    explanationData,
    setDiffData,
    setExplanationData,
    requestFix,
    requestExplanation,
    applyFix
  }
}
