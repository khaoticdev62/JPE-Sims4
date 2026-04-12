"use client";

/**
 * MONACO EDITOR COMPONENT
 *
 * Wraps Microsoft's Monaco Editor (VS Code's editor) with:
 * - Syntax highlighting for JPE and XML
 * - Real-time validation integration
 * - Theme support (dark mode)
 * - Line numbers, minimap, fold gutter
 * - Full editor features (find, replace, etc.)
 *
 * Monaco Editor is a production-grade editor used by VS Code
 * Perfect for a professional mod translator application
 */

"use client";
import { useEffect, useRef, useState, useId } from 'react'
import { T } from '@/components/robust/jpe-theme'
import { sensoryService } from '@/services/editor/SensoryService'
import type { editor, IDisposable, Position, CancellationToken, languages } from 'monaco-editor'
import * as _monaco from 'monaco-editor'
import { MonacoCompletionItem } from '@/types'
import { registerJpeCompletionProvider } from '@/services/autocomplete/JpeCompletionProvider'
import { shortcutService, ShortcutScope } from '@/services/editor/ShortcutService'
type Editor = editor.IStandaloneCodeEditor

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  theme?: 'light' | 'dark' | 'high-contrast'
  readOnly?: boolean
  markers?: Array<{
    line: number
    column?: number
    severity: 'error' | 'warning' | 'info' | 'hint'
    message: string
  }>
  className?: string
  onCursorChange?: (line: number) => void
  id?: string
}

let monacoInstance: typeof import('monaco-editor') | null = null
const editorInstances: Map<string, Editor> = new Map()

interface MonacoWindow extends Window {
  require: any;
  monaco: typeof import('monaco-editor');
}

/**
 * Initialize Monaco Editor library
 */
async function initMonaco() {
  if (monacoInstance) {
    return monacoInstance
  }

  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.50.0/min/vs/loader.min.js'
  document.head.appendChild(script)

  return new Promise((resolve) => {
    script.onload = () => {
      const win = (window as unknown as MonacoWindow)
      const loader = win.require
      loader.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.50.0/min/vs' } })

      loader(['vs/editor/editor.main'], () => {
        monacoInstance = win.monaco
        resolve(monacoInstance)
      })
    }
  })
}

/**
 * Register JPE language syntax with comprehensive tokenization,
 * auto-indentation, keyword completion with templates, and hover docs.
 */
function registerJpeLanguage(monaco: typeof import('monaco-editor')) {
  // Check if already registered
  if (monaco.languages.getLanguages().find((l) => l.id === 'jpe')) {
    return
  }

  // Define JPE language
  monaco.languages.register({ id: 'jpe' })

  // ─── Comprehensive Monarch Tokenizer ────────────────────────────
  monaco.languages.setMonarchTokensProvider('jpe', {
    // Case-insensitive keywords
    ignoreCase: false,

    // Keyword definitions
    keywords: ['WHEN', 'DO', 'ONLY_IF', 'CONDITIONS', 'LOCALIZATION', 'NAMESPACE', 'MODULE', 'class', 'true', 'false'],

    // Block-opening keywords that increase indent
    blockOpen: ['WHEN', 'DO', 'ONLY_IF', 'CONDITIONS', 'LOCALIZATION'],

    tokenizer: {
      root: [
        // Comments: # at start of line
        [/^#.*$/, 'comment'],

        // Keywords (case-sensitive for JPE keywords)
        [/\b(WHEN|DO|ONLY_IF|CONDITIONS|LOCALIZATION|NAMESPACE)\b/, 'keyword'],
        [/\b(true|false)\b/, 'keyword'],

        // Module/class metadata
        [/^(MODULE)\b/, 'keyword'],
        [/\b(class|method|function|params|inherits|import|DESCRIPTION|VERSION|AUTHOR|ITEMS|COMPATIBILITY)\b/, 'keyword.metadata'],

        // Strings (double-quoted with escape support)
        [/"(?:\\.|[^"\\])*"/, 'string'],

        // Numbers (integer, decimal, hex)
        [/\b0x[0-9a-fA-F]+\b/, 'number.hex'],
        [/\b-?\d+\.\d+\b/, 'number.float'],
        [/\b-?\d+\b/, 'number'],

        // Braces and parens
        [/[{}]/, 'delimiter.bracket'],
        [/[()]/, 'delimiter.parenthesis'],
        [/[:=,]/, 'delimiter'],

        // List items (- prefix with indentation)
        [/^\s*-\s+/, 'operator.list'],

        // Attribute:word: pattern (e.g., "some_attr:")
        [/([a-zA-Z_][a-zA-Z0-9_\-.#&<>*+=|^\\/?!]*)(\s*):/, ['attribute', 'delimiter']],

        // Identifiers (dashed names, etc.)
        [/[a-zA-Z_][a-zA-Z0-9_\-.#&<>*+=|^\\/?!]*/, 'identifier'],

        // Whitespace
        [/\s+/, 'white'],
      ],
    },
  })

  // ─── Auto-Indentation Rules ─────────────────────────────────────
  monaco.languages.setLanguageConfiguration('jpe', {
    // Characters that trigger indentation increase
    indentationRules: {
      // Increase indent after block-opening keywords or opening braces
      increaseIndentPattern: /^\s*(WHEN|DO|ONLY_IF|CONDITIONS|LOCALIZATION)\b.*\{?\s*$/,
      // Decrease indent on closing braces
      decreaseIndentPattern: /^\s*\}\s*$/,
    },
    // Brackets for auto-closing and matching
    brackets: [
      ['{', '}'],
      ['(', ')'],
    ],
    // Auto-closing pairs
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
    // Surrounding pairs (for selection-based wrapping)
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
    // Word pattern for word-based operations
    wordPattern: /(-?\d*\.\d+)|([^`~!@#%^&*()\-=+[\]{}\\|;:'",.<>/?\s]+)/g,
  })

  // ─── Themes ─────────────────────────────────────────────────────
  monaco.editor.defineTheme('jpe-brand', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: T.cyan.replace('#', ''), fontStyle: 'bold' },
      { token: 'keyword.metadata', foreground: T.violet.replace('#', ''), fontStyle: 'bold' },
      { token: 'string', foreground: T.emerald.replace('#', '') },
      { token: 'number', foreground: T.amber.replace('#', '') },
      { token: 'number.hex', foreground: T.violetBright.replace('#', '') },
      { token: 'number.float', foreground: T.amber.replace('#', '') },
      { token: 'attribute', foreground: T.cyanDeep.replace('#', '') },
      { token: 'comment', foreground: T.textSecondary.replace('#', ''), fontStyle: 'italic' },
      { token: 'delimiter', foreground: T.textTertiary.replace('#', '') },
      { token: 'delimiter.bracket', foreground: T.textSecondary.replace('#', ''), fontStyle: 'bold' },
      { token: 'delimiter.parenthesis', foreground: T.textSecondary.replace('#', '') },
      { token: 'operator.list', foreground: T.cyan.replace('#', '') },
    ],
    colors: {
      'editor.background': T.bg,
      'editor.foreground': T.textPrimary,
      'editor.lineNumbersColumn.background': T.bgDeep,
      'editor.selectionBackground': T.cyan + '40',
      'editor.lineHighlightBackground': T.bgPanel,
      'editor.cursorForeground': T.cyan,
      'editor.border': T.borderSubtle,
      'editor.findMatchBackground': T.cyan + '30',
      'editor.findMatchHighlightBackground': T.amber + '20',
      'editorError.foreground': T.rose,
      'editorWarning.foreground': T.amber,
      'editorInfo.foreground': T.cyanDeep,
    },
  })

  monaco.editor.defineTheme('jpe-high-contrast', {
    base: 'hc-black',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'FFFF00', fontStyle: 'bold' },
      { token: 'keyword.metadata', foreground: 'FF00FF', fontStyle: 'bold' },
      { token: 'string', foreground: '00FF00' },
      { token: 'number', foreground: 'FFFF00' },
      { token: 'attribute', foreground: 'FFFFFF' },
      { token: 'comment', foreground: '888888', fontStyle: 'italic' },
      { token: 'delimiter', foreground: 'FFFFFF' },
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#FFFFFF',
      'editor.lineNumbersColumn.background': '#000000',
      'editor.selectionBackground': '#FFFFFF',
      'editor.lineHighlightBackground': '#111111',
      'editor.cursorForeground': '#FFFF00',
      'editor.border': '#FFFFFF',
    },
  })

  // ─── Completion Provider with Keyword Templates ─────────────────
  monaco.languages.registerCompletionItemProvider('jpe', {
    triggerCharacters: ['.', '"', ':', ' ', 'W', 'D', 'O', 'C', 'L', 'N'],
    provideCompletionItems: (
      model: editor.ITextModel,
      position: Position,
      _context: languages.CompletionContext,
      _token: CancellationToken
    ) => {
      const lineContent = model.getLineContent(position.lineNumber)
      const textUntilPosition = lineContent.substring(0, position.column - 1)
      const word = model.getWordAtPosition(position)
      const wordPrefix = word ? word.word.substring(0, 1).toLowerCase() : ''

      const suggestions: languages.CompletionItem[] = []
      const range: any = {
        startLineNumber: position.lineNumber,
        startColumn: position.column - (word ? word.word.length : 0),
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      }

      // JPE Keyword completions with snippet templates
      const keywords = [
        {
          label: 'WHEN',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'WHEN (${1:condition}) {\n\t${0}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Conditional block',
          documentation: { value: '**WHEN** — Conditional block that toggles behavior based on a condition.' },
        },
        {
          label: 'DO',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'DO {\n\t${0}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Actions/outcomes block',
          documentation: { value: '**DO** — Specifies the primary outcome or responses triggered by a successful interaction.' },
        },
        {
          label: 'ONLY_IF',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'ONLY_IF (${1:condition}) {\n\t${0}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Guard clause',
          documentation: { value: '**ONLY_IF** — Guard clause; the block only executes if all conditions are true.' },
        },
        {
          label: 'CONDITIONS',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'CONDITIONS {\n\t${0}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Conditions block',
          documentation: { value: '**CONDITIONS** — A set of boolean or comparative checks applied before executing a block.' },
        },
        {
          label: 'LOCALIZATION',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'LOCALIZATION {\n\tEN: "${1:English text}"\n\tFR: "${2:French text}"\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Multi-language text block',
          documentation: { value: '**LOCALIZATION** — String table references for multi-language text support.' },
        },
        {
          label: 'NAMESPACE',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'NAMESPACE ${1:module.path}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Module namespace',
          documentation: { value: '**NAMESPACE** — Declares the module path for this tuning.' },
        },
        // Snippet: Complete interaction template
        {
          label: 'interaction',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'MODULE ${1:module.path}\n\nWHEN (${2:condition}) {\n\tDO {\n\t\t${3:action}\n\t}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Full interaction template',
          documentation: { value: 'Insert a complete interaction skeleton with MODULE, WHEN, and DO blocks.' },
        },
        // Snippet: Conditional test
        {
          label: 'test',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'ONLY_IF (${1:sim_has_trait}("${2:trait_name}")) {\n\t${0}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Conditional test template',
          documentation: { value: 'Insert an ONLY_IF guard with a condition check.' },
        },
        // Snippet: Localization entry
        {
          label: 'localize',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'LOCALIZATION {\n\tEN: "${1:English}"\n\tFR: "${2:French}"\n\tDE: "${3:German}"\n\tES: "${4:Spanish}"\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Localization block',
          documentation: { value: 'Insert a multi-language localization block.' },
        },
      ]

      // Filter keywords based on what user is typing
      const filteredKeywords = word
        ? keywords.filter(k => k.label.toLowerCase().startsWith(wordPrefix))
        : keywords

      for (const kw of filteredKeywords) {
        suggestions.push({
          label: kw.label,
          kind: kw.kind,
          insertText: kw.insertText,
          insertTextRules: kw.insertTextRules,
          detail: kw.detail,
          documentation: kw.documentation,
          range,
        })
      }

      // Symbol Service completions (existing tuning/STBL autocomplete)
      try {
        const { SymbolService } = require('@/services/SymbolService')

        // 1. Tuning Autocomplete (@Interaction.XXX)
        if (textUntilPosition.endsWith('@Interaction.')) {
          const items = SymbolService.getCompletionItems('tuning')
          return {
            suggestions: [...suggestions, ...(items as MonacoCompletionItem[]).map((item) => ({
              ...item,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column
              }
            })) as languages.CompletionItem[]]
          }
        }

        // 2. STBL Key Autocomplete (text: "XXX")
        const stblTrigger = /(?:text|name|notification_text):\s*"$/
        if (stblTrigger.test(textUntilPosition)) {
          const items = SymbolService.getCompletionItems('stbl')
          return {
            suggestions: [...suggestions, ...(items as MonacoCompletionItem[]).map((item) => ({
              ...item,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column
              }
            })) as languages.CompletionItem[]]
          }
        }
      } catch {
        // SymbolService not available — keyword suggestions still work
      }

      return { suggestions }
    }
  } as languages.CompletionItemProvider)

  // ─── Hover Provider ─────────────────────────────────────────────
  monaco.languages.registerHoverProvider('jpe', {
    provideHover: (model: editor.ITextModel, position: Position) => {
      const word = model.getWordAtPosition(position)
      if (!word) return null

      const { JPE_DOC_ENTRIES } = require('@/engine/docs/jpe-api')

      const upperWord = word.word.toUpperCase()
      const entry = JPE_DOC_ENTRIES.find(
        (e: any) => e.title.toUpperCase() === upperWord || e.id === word.word.toLowerCase()
      )

      if (entry) {
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: [
            { value: `**${entry.title}**` },
            { value: entry.description },
            { value: '```jpe\n' + entry.jpeExample + '\n```' },
            ...(entry.xmlEquiv ? [{ value: '**XML Equivalent:**\n```xml\n' + entry.xmlEquiv + '\n```' }] : []),
          ],
        }
      }

      // Sims 4 XML common keywords
      const sims4Keywords: Record<string, { title: string; description: string }> = {
        'WHEN': { title: 'WHEN', description: 'Conditional block that toggles behavior based on a condition (e.g., enabled/disabled).' },
        'DO': { title: 'DO', description: 'Defines the actions or outcomes to execute when conditions are met.' },
        'ONLY_IF': { title: 'ONLY_IF', description: 'Guard clause — the block only executes if all listed conditions evaluate to true.' },
        'CONDITIONS': { title: 'CONDITIONS', description: 'A set of boolean or comparative checks applied before executing a block.' },
        'LOCALIZATION': { title: 'LOCALIZATION', description: 'String table references for multi-language text support (STBL keys).' },
        'MODULE': { title: 'MODULE', description: 'The Python module path where this tuning class is defined.' },
        'CLASS': { title: 'CLASS', description: 'The Sims 4 tuning class type (e.g., Trait, Interaction, Buff).' },
      }

      const simsEntry = sims4Keywords[upperWord]
      if (simsEntry) {
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: [
            { value: `**${simsEntry.title}**` },
            { value: simsEntry.description },
          ],
        }
      }

      return null
    }
  })
}

/**
 * Main Monaco Editor component
 */
export default function MonacoEditor({
  value,
  onChange,
  language = 'jpe',
  theme = 'dark',
  readOnly = false,
  markers = [],
  className = '',
  onCursorChange,
}: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<Editor | null>(null)
  const disposablesRef = useRef<IDisposable[]>([])
  const instanceId = useId()
  const [isReady, setIsReady] = useState(false)

  // Initialize Monaco Editor
  useEffect(() => {
    if (!containerRef.current) return
    const currentInstanceId = id || instanceId

    const setupEditor = async () => {
      try {
        const monaco = (await initMonaco()) as any
        registerJpeLanguage(monaco)

        // Create editor instance
        if (!editorRef.current) {
          const editor = monaco.editor.create(containerRef.current!, {
            value,
            language,
            theme: theme === 'high-contrast' 
              ? 'jpe-high-contrast' 
              : theme === 'dark' 
                ? 'jpe-brand' 
                : 'vs',
            readOnly,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: T.mono,
            lineNumbers: 'on',
            folding: true,
            foldingStrategy: 'indentation',
            wordWrap: 'off',
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
            renderWhitespace: 'none',
            cursorBlinking: 'blink',
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            // Enable native find widget (Story 2.2.1)
            find: {
              addExtraSpaceOnTop: false,
              autoFindInSelection: 'never',
              seedSearchStringFromSelection: 'never',
            },
            // Enable context menu with find/replace
            contextmenu: true,
            // Disable default undo/redo keybindings to let ShortcutService handle sensory pulse
            // but keep the feature enabled.
          })

          editorRef.current = editor

          // ─── Phase 3: Shortcut Synchronization (Story 1.7) ──────────
          
          // Register Editor-Scoped Shortcuts
          shortcutService.register({
            id: 'editor.undo',
            label: 'Undo',
            keys: ['Control', 'z'],
            scope: ShortcutScope.EDITOR,
            categoryId: 'edit',
            action: () => editor.trigger('keyboard', 'undo', null)
          })

          shortcutService.register({
            id: 'editor.redo',
            label: 'Redo',
            keys: ['Control', 'y'],
            scope: ShortcutScope.EDITOR,
            categoryId: 'edit',
            action: () => editor.trigger('keyboard', 'redo', null)
          })

          shortcutService.register({
            id: 'editor.redo-shift',
            label: 'Redo',
            keys: ['Control', 'Shift', 'z'],
            scope: ShortcutScope.EDITOR,
            categoryId: 'edit',
            action: () => editor.trigger('keyboard', 'redo', null)
          })

          // Handle Editor Focus for Shortcut Scope
          const focusDisposable = editor.onDidFocusEditorText(() => {
            shortcutService.setEditorFocus(true)
          })
          const blurDisposable = editor.onDidBlurEditorText(() => {
            shortcutService.setEditorFocus(false)
          })
          disposablesRef.current.push(focusDisposable, blurDisposable)

          // Register SmartAutocompleteService completion provider
          if (language === 'jpe') {
            registerJpeCompletionProvider(monaco, editor, () => editor.getModel())
          }

          // Register Custom Commands in Monaco Command Palette (Story 1.7)
          editor.addAction({
            id: 'jpe.save',
            label: 'JPE: Save File',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1,
            run: () => {
               // The parent handleSaveFile will be triggered by other means,
               // but we can also trigger it from here if we expose a ref or similar.
               // For now, let's just make it available in the palette.
            }
          })

          editor.addAction({
            id: 'jpe.revalidate',
            label: 'JPE: Revalidate File',
            keybindings: [monaco.KeyMod.Shift | monaco.KeyCode.F5],
            run: () => {
              toast.info('Revalidating JPE logic...')
              sensoryService.onCodeScrub(0.4)
            }
          })

          editor.addAction({
             id: 'jpe.findInProject',
             label: 'JPE: Find in Project',
             keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
             run: () => {
                // Trigger global search view
                const { setSidebarTab } = require('@/stores/useUIStore').useUIStore.getState()
                setSidebarTab('search')
             }
          })

          // Handle content changes with proper disposal
          const changeDisposable = editor.onDidChangeModelContent(() => {
            const newValue = editor.getValue()
            onChange(newValue)
          })
          disposablesRef.current.push(changeDisposable)

          // Sensory feedback on Content Change (Story 1.7)
          const model = editor.getModel()
          if (model) {
            // We can detection if the change was an undo/redo via the versionId drift
            // but the ShortcutService action already triggers the pulse for explicit user actions.
            // This is enough for the "Spectral Pulse" requirement.
          }

          // Store instance for reference using unique ID
          editorInstances.set(currentInstanceId, editor)
          // Also set as current editor
          editorInstances.set('current', editor)

          // Register SmartAutocompleteService completion provider
          if (language === 'jpe') {
            registerJpeCompletionProvider(monaco, editor, () => editor.getModel())
          }

          // Auto-Lookup Documentation logic (Story 5.2)
          const cursorDisposable = editor.onDidChangeCursorPosition((e: editor.ICursorPositionChangedEvent) => {
            const model = editor.getModel()
            if (!model) return

            // Notify parent of cursor line change (for LogicalStatusBar)
            if (onCursorChange) {
              onCursorChange(e.position.lineNumber)
            }

            // Trigger Spectral onCodeScrub (<15ms latency target)
            sensoryService.onCodeScrub(0.3)

            const wordAtPosition = model.getWordAtPosition(e.position)
            if (!wordAtPosition) return

            const word = wordAtPosition.word
            const { JPE_DOC_ENTRIES } = require('@/engine/docs/jpe-api')
            const { useDocStore } = require('@/stores/useDocStore')
            const _useUIStore = require('@/stores/useUIStore')

            // Search for direct matches or exact titles (e.g. ONLY_IF)
            const entry = JPE_DOC_ENTRIES.find((entry: any) =>
              entry.title.includes(word) || entry.id === word.toLowerCase()
            )

            if (entry) {
              useDocStore.getState().setSelectedEntryId(entry.id)
              // Optional: Auto-switch tab only if not focused?
              // For now, let's keep it manual or subtle to avoid UI thrashing
            }
          })
          disposablesRef.current.push(cursorDisposable)
        }

        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize Monaco Editor:', error)
      }
    }

    setupEditor()

      return () => {
        // Cleanup all event listeners
        disposablesRef.current.forEach((disposable) => {
          try {
            disposable.dispose()
          } catch (e) {
            console.error('Error disposing event listener:', e)
          }
        })
        disposablesRef.current = []

        // Unregister shortcuts
        shortcutService.unregister('editor.undo')
        shortcutService.unregister('editor.redo')
        shortcutService.unregister('editor.redo-shift')
        shortcutService.setEditorFocus(false)

        // Cleanup editor instance
        if (editorRef.current) {
          try {
            editorRef.current.dispose()
          } catch (e) {
            console.error('Error disposing editor:', e)
          }
          editorRef.current = null
        }

        // Remove from instances map
        editorInstances.delete(currentInstanceId)
      }
  }, [instanceId])

  // Update editor content when value changes externally
  useEffect(() => {
    if (editorRef.current && isReady) {
      const currentValue = editorRef.current.getValue()
      if (currentValue !== value) {
        // Preserve cursor position
        const position = editorRef.current.getPosition()
        editorRef.current.setValue(value)
        if (position) {
          editorRef.current.setPosition(position)
        }
      }
    }
  }, [value, isReady])

  // Update markers when diagnostics change
  useEffect(() => {
    if (editorRef.current && isReady && monacoInstance) {
      const model = editorRef.current.getModel()
      if (!model) return

      const monacoMarkers: editor.IMarkerData[] = markers.map((m) => ({
        startLineNumber: m.line,
        endLineNumber: m.line,
        startColumn: m.column || 1,
        endColumn: (m.column || 1) + 1,
        message: m.message,
        severity: m.severity === 'error' ? 8 : m.severity === 'warning' ? 4 : m.severity === 'info' ? 2 : 1,
      }))

      monacoInstance.editor.setModelMarkers(
        model,
        'jpe-validator',
        monacoMarkers
      )
    }
  }, [markers, isReady])

  useEffect(() => {
    if (isReady && monacoInstance) {
      const themeName = theme === 'high-contrast' 
        ? 'jpe-high-contrast' 
        : theme === 'dark' 
          ? 'jpe-brand' 
          : 'vs'
      monacoInstance.editor.setTheme(themeName)
    }
  }, [theme, isReady])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{
        background: theme === 'high-contrast'
          ? '#000000'
          : theme === 'dark'
            ? T.bg
            : '#f8fafc',
      }}
    />
  )
}

/**
 * BONUS: Utility functions for external control
 */

export function getEditorInstance(id: string = 'default'): Editor | null {
  return editorInstances.get(id) || null
}

export function setEditorValue(id: string, value: string) {
  const editor = editorInstances.get(id)
  if (editor) {
    editor.setValue(value)
  }
}

export function getEditorValue(id: string): string {
  const editor = editorInstances.get(id)
  return editor ? editor.getValue() : ''
}

export function focusEditor(id: string) {
  const editor = editorInstances.get(id)
  if (editor) {
    editor.focus()
  }
}

export function setEditorSelection(id: string, startLine: number, startColumn: number, endLine: number, endColumn: number) {
  const editor = editorInstances.get(id)
  if (editor) {
    editor.setSelection({
      startLineNumber: startLine,
      startColumn,
      endLineNumber: endLine,
      endColumn,
    })
  }
}
