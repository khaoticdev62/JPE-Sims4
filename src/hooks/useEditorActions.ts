import { useCallback } from 'react'
import { getEditorInstance } from '@/components/editor/MonacoEditor'
import { toast } from 'sonner'

/**
 * Hook for performing actions on the Monaco Editor
 */
export function useEditorActions() {
  const undo = useCallback(() => {
    const editor = getEditorInstance('current')
    if (editor) {
      editor.trigger('toolbar', 'undo', null)
    }
  }, [])

  const redo = useCallback(() => {
    const editor = getEditorInstance('current')
    if (editor) {
      editor.trigger('toolbar', 'redo', null)
    }
  }, [])

  const format = useCallback(() => {
    const editor = getEditorInstance('current')
    if (editor) {
      editor.getAction('editor.action.formatDocument')?.run()
      toast.info('Document formatted')
    }
  }, [])

  const find = useCallback(() => {
    const editor = getEditorInstance('current')
    if (editor) {
      editor.getAction('actions.find')?.run()
    }
  }, [])

  const replace = useCallback(() => {
    const editor = getEditorInstance('current')
    if (editor) {
      editor.getAction('editor.action.startFindReplaceAction')?.run()
    }
  }, [])

  return {
    undo,
    redo,
    format,
    find,
    replace
  }
}
