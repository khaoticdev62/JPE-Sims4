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

import { useEffect, useRef, useState } from 'react'
import tokens from '@design-system/tokens.json'
import type { Editor, IMarker } from 'monaco-editor'

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  theme?: 'light' | 'dark'
  readOnly?: boolean
  markers?: Array<{
    line: number
    column?: number
    severity: 'error' | 'warning' | 'info'
    message: string
  }>
  className?: string
}

let monacoInstance: typeof import('monaco-editor') | null = null
let editorInstances: Map<string, Editor> = new Map()

/**
 * Initialize Monaco Editor library
 * Dynamically loads from CDN on first use
 */
async function initMonaco() {
  if (monacoInstance) {
    return monacoInstance
  }

  // Load from Monaco CDN
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.50.0/min/vs/loader.min.js'
  document.head.appendChild(script)

  return new Promise((resolve) => {
    script.onload = () => {
      const loader = (window as any).require
      loader.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.50.0/min/vs' } })

      loader(['vs/editor/editor.main'], () => {
        monacoInstance = (window as any).monaco
        resolve(monacoInstance)
      })
    }
  })
}

/**
 * Register JPE language syntax
 */
function registerJpeLanguage(monaco: any) {
  // Check if already registered
  if (monaco.languages.getLanguages().find((l: any) => l.id === 'jpe')) {
    return
  }

  // Define JPE language
  monaco.languages.register({ id: 'jpe' })

  // Define syntax highlighting rules
  monaco.languages.setMonarchTokensProvider('jpe', {
    tokenizer: {
      root: [
        // Keywords (uppercase)
        [
          /\b(MODULE|DESCRIPTION|VERSION|AUTHOR|ITEMS|ITEM|COMPATIBILITY|LOCALIZATION|WHEN|DO|ONLY_IF|CONDITIONS)\b:/,
          'keyword',
        ],

        // Quoted strings
        [/"[^"]*"/, 'string'],
        [/'[^']*'/, 'string'],

        // Comments
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],

        // Block start (colon at end of line)
        [/:$/, 'keyword'],

        // Attribute names (before colon)
        [/([a-z]+)(\s*):/, ['attribute', 'keyword']],

        // List items
        [/^\s*-\s/, 'operator'],

        // Numbers
        [/\b\d+(\.\d+)?\b/, 'number'],

        // Whitespace
        [/\s+/, 'white'],
      ],
      comment: [[/[^*/]+/, 'comment'], [/\*\//, 'comment', '@pop'], [/[*/]/, 'comment']],
    },

    tokenizer: {
      root: [
        [/^(MODULE):/, 'keyword'],
        [/^(DESCRIPTION|VERSION|AUTHOR|ITEMS|COMPATIBILITY|LOCALIZATION|WHEN|DO|ONLY_IF):/, 'keyword'],
        [/"(?:\\.|[^"\\])*"/, 'string'],
        [/^\s+-\s+/, 'operator'],
        [/([a-z_]+)(\s*):/, ['attribute', 'operator']],
        [/^\s+/, 'white'],
        [/./, 'text'],
      ],
    },
  })

  // Define theme for JPE using design tokens
  // Colors come from src/design-system/tokens.json
  monaco.editor.defineTheme('jpe-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: tokens.colors['accent-primary'].replace('#', ''), fontStyle: 'bold' },
      { token: 'string', foreground: tokens.colors['state-success'].replace('#', '') },
      { token: 'attribute', foreground: '5AC8FA' }, // Light blue for attributes
      { token: 'operator', foreground: tokens.colors['state-warning'].replace('#', '') },
      { token: 'comment', foreground: tokens.colors['text-secondary'].replace('#', ''), fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': tokens.colors['background-primary'],
      'editor.foreground': tokens.colors['text-primary'],
      'editor.lineNumbersColumn.background': tokens.colors['background-secondary'],
      'editor.selectionBackground': tokens.colors['accent-primary'] + '40', // 40 = 25% opacity
      'editor.lineHighlightBackground': tokens.colors['background-tertiary'],
      'editor.cursorForeground': tokens.colors['accent-primary'],
      'editor.border': tokens.colors['border-subtle'],
      'editor.findMatchBackground': tokens.colors['accent-primary'] + '30',
      'editor.findMatchHighlightBackground': tokens.colors['state-warning'] + '20',
      'editorError.foreground': tokens.colors['state-error'],
      'editorWarning.foreground': tokens.colors['state-warning'],
      'editorInfo.foreground': tokens.colors['accent-primary'],
    },
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
}: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<Editor | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Initialize Monaco Editor
  useEffect(() => {
    if (!containerRef.current) return

    const setupEditor = async () => {
      try {
        const monaco = await initMonaco()
        registerJpeLanguage(monaco)

        // Create editor instance
        if (!editorRef.current) {
          const editor = monaco.editor.create(containerRef.current!, {
            value,
            language,
            theme: theme === 'dark' ? 'jpe-dark' : 'vs',
            readOnly,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: '"Fira Code", "Consolas", monospace',
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
          })

          editorRef.current = editor

          // Handle content changes
          editor.onDidChangeModelContent(() => {
            const newValue = editor.getValue()
            onChange(newValue)
          })

          // Store instance for reference
          editorInstances.set(containerRef.current?.id || 'default', editor)
        }

        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize Monaco Editor:', error)
      }
    }

    setupEditor()

    return () => {
      // Cleanup on unmount
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = null
      }
    }
  }, [])

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
      const monacoMarkers: IMarker[] = markers.map((m) => ({
        startLineNumber: m.line,
        endLineNumber: m.line,
        startColumn: m.column || 1,
        endColumn: m.column || 1,
        message: m.message,
        severity: m.severity === 'error' ? 8 : m.severity === 'warning' ? 4 : 1,
        code: m.severity,
      }))

      monacoInstance.editor.setModelMarkers(
        editorRef.current.getModel(),
        'jpe-validator',
        monacoMarkers
      )
    }
  }, [markers, isReady])

  // Handle theme changes
  useEffect(() => {
    if (isReady && monacoInstance) {
      const themeName = theme === 'dark' ? 'jpe-dark' : 'vs'
      monacoInstance.editor.setTheme(themeName)
    }
  }, [theme, isReady])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{
        background: theme === 'dark'
          ? tokens.colors['background-primary']
          : tokens.colors['background-primary'], // Light mode uses same for now
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
