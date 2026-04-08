"use client";

/**
 * EDITOR TOOLBAR COMPONENT
 *
 * Action buttons for editor operations:
 * - Save file
 * - Compile to XML
 * - Undo/Redo
 * - Find/Replace
 * - Format code
 * - More...
 */

import { useState } from 'react'
import Button from '@/components/common/Button'

interface EditorToolbarProps {
  onSave?: () => void
  onCompile?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onFormat?: () => void
  canUndo?: boolean
  canRedo?: boolean
  isSaving?: boolean
  isCompiling?: boolean
  isDirty?: boolean
  className?: string
}

export default function EditorToolbar({
  onSave,
  onCompile,
  onUndo,
  onRedo,
  onFormat,
  canUndo = false,
  canRedo = false,
  isSaving = false,
  isCompiling = false,
  isDirty = false,
  className = '',
}: EditorToolbarProps) {
  const [showCompileStatus, setShowCompileStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const handleCompile = () => {
    if (onCompile) {
      onCompile()
      setShowCompileStatus({
        type: 'success',
        message: 'Compiled successfully',
      })
      setTimeout(() => setShowCompileStatus(null), 3000)
    }
  }

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-2 bg-bg-secondary border-b border-border-subtle
        ${className}
      `}
    >
      {/* Save button with dirty indicator */}
      <Button
        variant={isDirty ? 'primary' : 'secondary'}
        size="sm"
        onClick={onSave}
        disabled={!isDirty || isSaving}
        title={isDirty ? 'File has unsaved changes' : 'No unsaved changes'}
      >
        {isSaving ? '💾 Saving...' : '💾 Save'}
      </Button>

      {/* Compile button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCompile}
        disabled={isCompiling}
        title="Compile JPE to XML"
      >
        {isCompiling ? '⚙️ Compiling...' : '⚙️ Compile'}
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-border-subtle" />

      {/* Undo/Redo buttons */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        ↶ Undo
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
      >
        ↷ Redo
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-border-subtle" />

      {/* Format button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onFormat}
        title="Format document"
      >
        ✨ Format
      </Button>

      {/* Compile status message */}
      {showCompileStatus && (
        <div
          className={`ml-auto text-xs px-3 py-1 rounded ${
            showCompileStatus.type === 'success'
              ? 'bg-state-success bg-opacity-20 text-state-success'
              : 'bg-state-error bg-opacity-20 text-state-error'
          }`}
        >
          {showCompileStatus.message}
        </div>
      )}

      {/* File info */}
      <div className="ml-auto text-xs text-text-secondary">
        Ready
      </div>
    </div>
  )
}
