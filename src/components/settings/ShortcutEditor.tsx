/**
 * Shortcut Editor
 * Dialog for editing individual keyboard shortcuts
 */

import { useState, useCallback } from 'react'
import { useShortcutStore } from '@/stores/useShortcutStore'

interface ShortcutEditorProps {
  shortcutId: string
  onClose: () => void
}

export default function ShortcutEditor({ shortcutId, onClose }: ShortcutEditorProps) {
  const { getShortcut, updateShortcut, resetShortcut } = useShortcutStore()
  const shortcut = getShortcut(shortcutId)

  const [recordedKeys, setRecordedKeys] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!shortcut) return null

  const handleStartRecording = () => {
    setRecordedKeys([])
    setError(null)
    setSuccess(false)
    setIsRecording(true)
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isRecording) return

      e.preventDefault()
      const keys: string[] = []

      if (e.ctrlKey) keys.push('Ctrl')
      if (e.shiftKey) keys.push('Shift')
      if (e.altKey) keys.push('Alt')
      if (e.metaKey) keys.push('Cmd')

      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        keys.push(key)
      }

      const keyCombo = keys.join('+')
      setRecordedKeys(keys)

      if (keyCombo.split('+').length >= 2) {
        // We have at least a modifier + a key
        handleSaveShortcut(keyCombo)
      }
    },
    [isRecording]
  )

  const handleSaveShortcut = (keys: string) => {
    if (!keys) {
      setError('Please press a key combination')
      return
    }

    const success = updateShortcut(shortcutId, keys)

    if (!success) {
      setError(`Shortcut "${keys}" is already in use`)
      setIsRecording(false)
      return
    }

    setSuccess(true)
    setIsRecording(false)

    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const handleCancel = () => {
    setIsRecording(false)
    setRecordedKeys([])
    setError(null)
    onClose()
  }

  const handleReset = () => {
    resetShortcut(shortcutId)
    setSuccess(true)
    setIsRecording(false)

    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const displayKeys = recordedKeys.length > 0 ? recordedKeys.join(' + ') : 'Press keys...'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-secondary rounded-lg shadow-2xl max-w-md w-full mx-4 space-y-6">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-xl font-bold text-text-primary mb-1">Edit Shortcut</h2>
          <p className="text-sm text-text-secondary">{shortcut.label}</p>
        </div>

        {/* Content */}
        <div className="px-6 space-y-4" onKeyDown={handleKeyDown}>
          {/* Current Shortcut */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Current Shortcut
            </label>
            <code className="block w-full px-4 py-3 bg-background-tertiary border border-border-subtle rounded-lg text-accent-primary font-mono text-lg text-center">
              {shortcut.currentKeys}
            </code>
          </div>

          {/* Recording Area */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Record New Shortcut
            </label>

            {isRecording ? (
              <div className="w-full px-4 py-8 bg-state-info/10 border-2 border-state-info rounded-lg text-center">
                <p className="text-state-info font-mono text-lg mb-2">{displayKeys}</p>
                <p className="text-xs text-state-info">Press key combination...</p>
              </div>
            ) : (
              <button
                onClick={handleStartRecording}
                className="w-full px-4 py-3 bg-accent-primary hover:bg-accent-focus text-text-primary rounded-lg font-medium transition-colors"
              >
                {success ? '✓ Recorded' : 'Record Keys'}
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-state-error/10 border border-state-error rounded-lg">
              <p className="text-sm text-state-error">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-state-info/10 border border-state-info/30 rounded-lg p-3">
            <p className="text-xs text-state-info">
              <strong>💡 Tip:</strong> Press a modifier key (Ctrl, Shift, Alt) and a letter/number key
              together. For example: Ctrl+G, Shift+F7, Alt+X
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-text-primary mb-1">Description</p>
            <p className="text-sm text-text-secondary">{shortcut.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          {isRecording ? (
            <button
              onClick={() => {
                setIsRecording(false)
                setRecordedKeys([])
              }}
              className="w-full px-4 py-2 bg-background-tertiary hover:bg-background-secondary text-text-primary rounded-lg font-medium transition-colors"
            >
              Cancel Recording
            </button>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-background-tertiary hover:bg-background-secondary text-text-secondary rounded-lg font-medium transition-colors"
              >
                Reset to Default
              </button>

              <button
                onClick={handleCancel}
                className="w-full px-4 py-2 bg-background-tertiary hover:bg-background-secondary text-text-secondary rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
