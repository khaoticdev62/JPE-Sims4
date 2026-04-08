import { getEditorInstance } from '@/components/editor/MonacoEditor'
import { Diagnostic } from '@/types'

/**
 * Standardized navigation to a specific coordinate in the active Monaco instance
 * Converts 0-indexed store coordinates to 1-indexed editor coordinates
 */
export const revealInMonaco = (diagnostic: Partial<Diagnostic>) => {
  const line = (diagnostic.line ?? 0) + 1
  const column = (diagnostic.column ?? 0) + 1
  
  const editor = getEditorInstance('current')
  if (editor) {
    editor.revealLineInCenter(line)
    editor.setPosition({ lineNumber: line, column })
    editor.focus()
  }
}
