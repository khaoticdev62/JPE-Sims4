/**
 * INTEGRATED EDITOR COMPONENT
 *
 * Combines all editor features into one cohesive package:
 * - Monaco Editor (main editing)
 * - Toolbar (save, compile, undo/redo)
 * - Search & Replace (find, replace with options)
 * - Diagnostics Panel (errors, warnings, info)
 *
 * This is what users interact with - a complete IDE-like editor
 */

import { useState, useCallback } from 'react'
import MonacoEditor, { getEditorInstance } from './MonacoEditor'
import EditorToolbar from './EditorToolbar'
import SearchReplace from './SearchReplace'
import DiagnosticsPanel from './DiagnosticsPanel'
import { DiffPreviewModal } from '../modals/DiffPreviewModal'
import { useCodeFix } from '@/hooks/useCodeFix'
import { t } from '@/constants/locales'

interface EditorDiagnostic {
  line: number
  severity: 'error' | 'warning' | 'info'
  message: string
  code?: string
}

interface IntegratedEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  diagnostics?: EditorDiagnostic[]
  onSave?: () => Promise<void>
  onCompile?: () => Promise<{ success: boolean; error?: string }>
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  onFormat?: () => void
  isDirty?: boolean
  className?: string
}

export default function IntegratedEditor({
  value,
  onChange,
  language = 'jpe',
  diagnostics = [],
  onSave,
  onCompile,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onFormat,
  isDirty = false,
  className = '',
}: IntegratedEditorProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCompiling, setIsCompiling] = useState(false)

  const { isFixing, diffData, setDiffData, requestFix, applyFix } = useCodeFix()

  // Handle save
  const handleSave = useCallback(async () => {
    if (onSave) {
      setIsSaving(true)
      try {
        await onSave()
      } finally {
        setIsSaving(false)
      }
    }
  }, [onSave])

  // Handle compile
  const handleCompile = useCallback(async () => {
    if (onCompile) {
      setIsCompiling(true)
      try {
        const result = await onCompile()
        if (!result.success) {
          console.error(t('editor.compilation_failed'), result.error)
        }
      } finally {
        setIsCompiling(false)
      }
    }
  }, [onCompile])

  // Search and replace stubs (would connect to Monaco API)
  const handleFind = useCallback(
    (query: string, options: { caseSensitive: boolean; regex: boolean }) => {
      // This would be connected to Monaco's find widget
      // For now, simple text search
      const flags = options.caseSensitive ? 'g' : 'gi'
      try {
        const regex = options.regex
          ? new RegExp(query, flags)
          : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
        const matches = value.match(regex) || []
        return matches.length
      } catch {
        return 0
      }
    },
    [value]
  )

  const handleReplace = useCallback(
    (query: string, replacement: string) => {
      try {
        const regex = new RegExp(query, 'i')
        const newValue = value.replace(regex, replacement)
        onChange(newValue)
        return 1
      } catch {
        return 0
      }
    },
    [value, onChange]
  )

  const handleReplaceAll = useCallback(
    (query: string, replacement: string) => {
      try {
        const regex = new RegExp(query, 'gi')
        const newValue = value.replace(regex, replacement)
        const count = (value.match(regex) || []).length
        onChange(newValue)
        return count
      } catch {
        return 0
      }
    },
    [value, onChange]
  )

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S or Cmd+S: Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
      return
    }

    // Ctrl+Shift+B or Cmd+Shift+B: Compile
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'b') {
      e.preventDefault()
      handleCompile()
      return
    }

    // Ctrl+H or Cmd+H: Toggle Search/Replace
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault()
      setShowSearch(!showSearch)
      return
    }

    // Ctrl+J or Cmd+J: Toggle Diagnostics
    if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
      e.preventDefault()
      setShowDiagnostics(!showDiagnostics)
      return
    }
  }

  return (
    <div className={`flex flex-col h-full bg-bg-primary overflow-hidden ${className}`} onKeyDown={handleKeyDown}>
      {/* Toolbar */}
      <EditorToolbar
        onSave={handleSave}
        onCompile={handleCompile}
        onUndo={onUndo}
        onRedo={onRedo}
        onFormat={onFormat}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaving={isSaving}
        isCompiling={isCompiling}
        isDirty={isDirty}
      />

      {/* Search & Replace (optional) */}
      {showSearch && (
        <SearchReplace
          onFind={handleFind}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Main editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          value={value}
          onChange={onChange}
          language={language}
          theme="dark"
          markers={diagnostics.map((d) => ({
            line: d.line || 1,
            column: 1,
            severity: d.severity,
            message: d.message,
          }))}
        />
      </div>

      {/* Diagnostics panel (optional) */}
      {showDiagnostics && diagnostics.length > 0 && (
        <div className="h-48 border-t border-border-subtle overflow-hidden">
          <DiagnosticsPanel
            diagnostics={diagnostics}
            onSelectDiagnostic={(diag) => {
              // Navigate to line in editor
              const editor = getEditorInstance('current')
              if (editor) {
                editor.revealLineInCenter(diag.line)
                editor.setPosition({ lineNumber: diag.line, column: 1 })
                editor.focus()
              }
            }}
            onFix={(diag) => requestFix(diag.message, diag.line)}
            isFixing={isFixing}
            isOpen={true}
          />
        </div>
      )}

      {/* Diff Preview Modal */}
      {diffData && (
        <DiffPreviewModal
          isOpen={!!diffData}
          onClose={() => setDiffData(null)}
          onApply={applyFix}
          originalCode={diffData.original}
          modifiedCode={diffData.modified}
          title={t('editor.ai_suggested_fix')}
          description={diffData.explanation}
          fileName={diffData.fileName}
        />
      )}
    </div>
  )
}

/**
 * Keyboard Shortcuts:
 * - Ctrl+S / Cmd+S: Save
 * - Ctrl+Shift+B / Cmd+Shift+B: Compile
 * - Ctrl+H / Cmd+H: Toggle Find/Replace
 * - Ctrl+J / Cmd+J: Toggle Diagnostics
 * - Standard editor shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+X, Ctrl+C, Ctrl+V, etc.)
 */
