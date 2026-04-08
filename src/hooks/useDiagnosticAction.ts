import { useCallback, useState } from 'react'
import { AIServiceFactory } from '@/services/ai/AIServiceFactory'
import { useAIStore } from '@/stores/useAIStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useCodeFix } from './useCodeFix'
import type { Diagnostic } from '@/types/index'
import { toast } from 'sonner'

export function useDiagnosticAction() {
  const { activeProvider } = useAIStore()
  const { getFile } = useProjectStore()
  const { editorContent } = useEditorStore()
  const { requestFix, isFixing, diffData, setDiffData, applyFix } = useCodeFix()

  const [isExplaining, setIsExplaining] = useState(false)

  /**
   * Explain a specific diagnostic using AI
   */
  const explainDiagnostic = useCallback(async (diagnostic: Diagnostic) => {
    const file = getFile(diagnostic.fileId)
    if (!file) return

    const content = editorContent[diagnostic.fileId] || file.content || ''
    
    setIsExplaining(true)
    try {
      const service = AIServiceFactory.getService(activeProvider)
      const result = await service.explainDiagnostic(content, file.name, diagnostic)
      
      if (result.success && result.text) {
        // We broadcast the explanation to the Assistant panel via a custom event or store update
        // For now, we'll use a custom event that the Assistant panel listens to
        window.dispatchEvent(new CustomEvent('jpe:ai-explain', { 
          detail: { 
            text: result.text,
            title: `Explanation: ${diagnostic.code || 'Diagnostic'}`,
            diagnostic 
          } 
        }))
        toast.info("Explanation generated in Assistant panel.")
      } else {
        toast.error(result.error || "Failed to generate explanation.")
      }
    } catch (err: any) {
      toast.error(`Explanation Failed: ${err.message}`)
    } finally {
      setIsExplaining(false)
    }
  }, [activeProvider, getFile, editorContent])

  /**
   * Trigger the Fix flow for a specific diagnostic
   */
  const fixDiagnostic = useCallback(async (diagnostic: Diagnostic) => {
    await requestFix(diagnostic)
  }, [requestFix])

  return {
    explainDiagnostic,
    fixDiagnostic,
    isExplaining,
    isFixing,
    diffData,
    setDiffData,
    applyFix
  }
}
