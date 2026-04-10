/**
 * JPE Completion Provider for Monaco Editor
 *
 * Integrates SmartAutocompleteService with Monaco's completion API
 * to provide intelligent, context-aware autocomplete suggestions.
 */

import { languages, editor, IDisposable, Position } from 'monaco-editor'
import { SmartAutocompleteService } from '@/services/editor/SmartAutocompleteService'
import type { Completion } from '@/services/editor/SmartAutocompleteService'

let completionProviderDisposable: IDisposable | null = null

/**
 * Map completion type to Monaco completion item kind
 */
function getCompletionKind(type: Completion['type']): languages.CompletionItemKind {
  switch (type) {
    case 'tuning':
      return languages.CompletionItemKind.Reference
    case 'enum':
      return languages.CompletionItemKind.Enum
    case 'pattern':
      return languages.CompletionItemKind.Snippet
    case 'keyword':
      return languages.CompletionItemKind.Keyword
    default:
      return languages.CompletionItemKind.Text
  }
}

/**
 * Map confidence score to Monaco completion item detail
 */
function getCompletionDetail(completion: Completion): string {
  const parts: string[] = []

  if (completion.source === 'learned') {
    parts.push('Learned pattern')
  } else if (completion.source === 'registry') {
    parts.push('Registry')
  }

  if (completion.frequency) {
    parts.push(`Used ${completion.frequency}x`)
  }

  if (completion.description) {
    parts.push(completion.description)
  }

  return parts.join(' • ')
}

/**
 * Register JPE completion provider with Monaco
 */
export function registerJpeCompletionProvider(
  monaco: typeof import('monaco-editor'),
  editor: editor.IStandaloneCodeEditor,
  getModel: () => editor.ITextModel | null,
): void {
  // Dispose existing provider if any
  if (completionProviderDisposable) {
    completionProviderDisposable.dispose()
    completionProviderDisposable = null
  }

  completionProviderDisposable = monaco.languages.registerCompletionItemProvider('jpe', {
    triggerCharacters: [' ', ':', '"', '<', 'W', 'D', 'O', 'I', 'C', 'L', 'N'],
    provideCompletionItems: (
      model: editor.ITextModel,
      position: Position,
    ): languages.ProviderResult<languages.CompletionList> => {
      // Get text up to cursor position
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })

      // Get word being typed (last word before cursor)
      const lineContent = model.getLineContent(position.lineNumber)
      const textBeforeCursor = lineContent.substring(0, position.column - 1)
      const wordMatch = textBeforeCursor.match(/([a-zA-Z_]*)$/)
      const prefix = wordMatch ? wordMatch[1] : ''

      // Calculate range for replacement
      const wordLength = prefix.length
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column - wordLength,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      }

      // Get completions from SmartAutocompleteService
      const context = {
        fileContent: model.getValue(),
        position: model.getOffsetAt(position),
        fileName: model.uri.path.split('/').pop() || 'untitled.jpe',
        prefix,
      }

      const completions = SmartAutocompleteService.getCompletions(context)

      // Convert to Monaco completion items
      const suggestions: languages.CompletionItem[] = completions.map((completion) => ({
        label: completion.label,
        kind: getCompletionKind(completion.type),
        detail: getCompletionDetail(completion),
        insertText: completion.value,
        range,
        sortText: String(Math.floor(completion.confidence * 1000)).padStart(4, '0'),
      }))

      return {
        suggestions,
      }
    },
  })
}

/**
 * Dispose completion provider
 */
export function disposeJpeCompletionProvider(): void {
  if (completionProviderDisposable) {
    completionProviderDisposable.dispose()
    completionProviderDisposable = null
  }
}
