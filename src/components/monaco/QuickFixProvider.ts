/**
 * Monaco Quick Fix Provider (Prototype/Stub)
 *
 * Integrates FixSuggestionEngine with Monaco Editor's code action system.
 * Shows lightbulb icon for fixable errors and provides one-click fix application.
 *
 * NOTE: This is a prototype stub. Full integration pending Diagnostic type alignment.
 * Current Diagnostic type uses `line`/`column` instead of `startLine`/`startColumn`.
 */

import type { editor, IDisposable } from 'monaco-editor'
import type { Diagnostic } from '@/types/index'

let codeActionProviderDisposable: IDisposable | null = null

/**
 * Register Monaco Quick Fix Provider (stub - pending type alignment)
 */
export function registerQuickFixProvider(
  _monaco: typeof import('monaco-editor'),
  _editorInstance: editor.IStandaloneCodeEditor,
  _getDiagnostics: () => Diagnostic[],
  _getDocumentContent: () => string,
  _onContentChange: (newContent: string) => void,
  _fileType: 'jpe' | 'xml' = 'jpe',
): void {
  // TODO: Implement full Quick Fix provider once Diagnostic types align
  console.log('[QuickFixProvider] Registration stub - pending type alignment')
}

/**
 * Dispose quick fix provider
 */
export function disposeQuickFixProvider(): void {
  if (codeActionProviderDisposable) {
    codeActionProviderDisposable.dispose()
    codeActionProviderDisposable = null
  }
}
