/**
 * Monaco Quick Fix Provider
 *
 * Integrates FixSuggestionEngine with Monaco Editor's code action system.
 * Shows lightbulb icon for fixable errors and provides one-click fix application.
 */

import type { editor, languages, CancellationToken, IDisposable } from 'monaco-editor'
import {
  FixSuggestionEngine,
  generateFixes,
  type FixSuggestion,
  type FixContext,
} from '@/services/fixes/FixSuggestionEngine'
import { fixApplier } from '@/services/fixes/FixApplier'
import type { Diagnostic } from '@/types/index'

let codeActionProviderDisposable: IDisposable | null = null

/**
 * Map fix category to Monaco code action kind
 */
function getMonacoActionKind(category: string): string {
  switch (category) {
    case 'typo':
      return 'quickfix.typo'
    case 'missing_keyword':
      return 'quickfix.keyword'
    case 'missing_end':
      return 'quickfix.missingEnd'
    case 'invalid_reference':
      return 'quickfix.reference'
    case 'syntax_error':
      return 'quickfix.syntax'
    default:
      return 'quickfix'
  }
}

/**
 * Register Monaco Quick Fix Provider
 */
export function registerQuickFixProvider(
  monaco: typeof import('monaco-editor'),
  editorInstance: editor.IStandaloneCodeEditor,
  getDiagnostics: () => Diagnostic[],
  getDocumentContent: () => string,
  onContentChange: (newContent: string) => void,
  fileType: 'jpe' | 'xml' = 'jpe',
): void {
  // Dispose existing provider if any
  if (codeActionProviderDisposable) {
    codeActionProviderDisposable.dispose()
    codeActionProviderDisposable = null
  }

  // Set up fix applier callback
  fixApplier.setOnFixApplied(() => {
    // Trigger re-validation after fix application
    // The editor will automatically re-run validation
  })

  // Register code action provider
  codeActionProviderDisposable = monaco.languages.registerCodeActionProvider(
    'jpe',
    {
      provideCodeActions: (
        model: editor.ITextModel,
        range: languages.Range,
        context: languages.CodeActionContext,
        _token: CancellationToken,
      ): languages.ProviderResult<languages.CodeActionList> => {
        const actions: languages.CodeAction[] = []

        // Get diagnostics for this range
        const diagnostics = getDiagnostics()
        const lineDiagnostics = diagnostics.filter(
          (d) =>
            d.startLine >= range.startLineNumber &&
            d.endLine <= range.endLineNumber,
        )

        if (lineDiagnostics.length === 0) {
          return { actions: [], dispose: () => {} }
        }

        // Generate fixes for each diagnostic
        const documentContent = getDocumentContent()
        const fixEngine = new FixSuggestionEngine()

        for (const diagnostic of lineDiagnostics) {
          const fixContext: FixContext = {
            document: documentContent,
            fileType,
          }

          const fixes = fixEngine.generateFixes(diagnostic, fixContext)

          // Convert fixes to Monaco code actions
          for (const fix of fixes) {
            const edit: languages.WorkspaceEdit = {
              edits: [
                {
                  resource: model.uri,
                  versionId: undefined,
                  textEdit: {
                    range: {
                      startLineNumber: fix.range.startLine,
                      startColumn: fix.range.startColumn,
                      endLineNumber: fix.range.endLine,
                      endColumn: fix.range.endColumn,
                    },
                    text: fix.replacementText,
                  },
                },
              ],
            }

            actions.push({
              title: fix.description,
              kind: getMonacoActionKind(fix.category),
              diagnostics: [
                {
                  severity:
                    diagnostic.severity === 'error'
                      ? monaco.MarkerSeverity.Error
                      : diagnostic.severity === 'warning'
                        ? monaco.MarkerSeverity.Warning
                        : monaco.MarkerSeverity.Info,
                  message: diagnostic.message,
                  startLineNumber: diagnostic.startLine,
                  startColumn: diagnostic.startColumn,
                  endLineNumber: diagnostic.endLine || diagnostic.startLine,
                  endColumn: diagnostic.endColumn || diagnostic.startColumn + 1,
                },
              ],
              edit,
              isPreferred: fix.confidence > 0.8,
            })
          }
        }

        return { actions, dispose: () => {} }
      },
    },
    {
      providedCodeActionKinds: [
        'quickfix',
        'quickfix.typo',
        'quickfix.keyword',
        'quickfix.missingEnd',
        'quickfix.reference',
        'quickfix.syntax',
      ],
    },
  )
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

/**
 * Apply a fix directly to the editor
 */
export function applyFixToEditor(
  editorInstance: editor.IStandaloneCodeEditor,
  fix: FixSuggestion,
): boolean {
  const model = editorInstance.getModel()
  if (!model) return false

  const range = {
    startLineNumber: fix.range.startLine,
    startColumn: fix.range.startColumn,
    endLineNumber: fix.range.endLine,
    endColumn: fix.range.endColumn,
  }

  // Apply edit
  editorInstance.executeEdits('fix-application', [
    {
      range,
      text: fix.replacementText,
      forceMoveMarkers: true,
    },
  ])

  // Trigger re-validation
  const newContent = model.getValue()
  fixApplier.setOnFixApplied(() => {
    // Re-validation will be triggered automatically
  })

  return true
}
