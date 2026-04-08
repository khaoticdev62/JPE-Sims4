"use client";

/**
 * Keyboard Shortcuts Settings
 * Allow users to customize keyboard shortcuts
 */

import { useState, useMemo } from 'react'
import { useShortcutStore } from '@/stores/useShortcutStore'
import ShortcutEditor from './ShortcutEditor'

export default function KeyboardShortcutsSettings() {
  const { shortcuts, resetAllShortcuts } = useShortcutStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const categories = useMemo(() => {
    const cats = new Set(shortcuts.map((s) => s.category))
    return Array.from(cats)
  }, [shortcuts])

  const filteredShortcuts = useMemo(() => {
    if (!searchTerm) return shortcuts

    const term = searchTerm.toLowerCase()
    return shortcuts.filter(
      (s) =>
        s.label.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.currentKeys.toLowerCase().includes(term)
    )
  }, [searchTerm, shortcuts])

  const groupedShortcuts = useMemo(() => {
    const grouped: Record<string, typeof shortcuts> = {}

    filteredShortcuts.forEach((shortcut) => {
      if (!grouped[shortcut.category]) {
        grouped[shortcut.category] = []
      }
      grouped[shortcut.category].push(shortcut)
    })

    return grouped
  }, [filteredShortcuts])

  const handleResetAll = () => {
    if (confirm('Reset all shortcuts to defaults? This cannot be undone.')) {
      resetAllShortcuts()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background-primary">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Keyboard Shortcuts</h2>
        <p className="text-sm text-text-secondary">
          Customize keyboard shortcuts for common actions
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Search and Actions */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-background-secondary border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary outline-none focus:border-accent-primary"
            />
          </div>

          <button
            onClick={handleResetAll}
            className="px-4 py-2 bg-background-secondary hover:bg-background-tertiary text-text-secondary rounded-lg transition-colors text-sm"
          >
            Reset All
          </button>
        </div>

        {/* Shortcuts by Category */}
        <div className="space-y-6">
          {categories
            .filter((cat) => groupedShortcuts[cat]?.length > 0)
            .map((category) => (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <h3 className="text-lg font-semibold text-text-primary">{category}</h3>

                {/* Shortcut Items */}
                <div className="space-y-2 bg-background-secondary rounded-lg border border-border-subtle overflow-hidden">
                  {groupedShortcuts[category].map((shortcut, idx) => (
                    <div
                      key={shortcut.id}
                      className={`
                        flex items-center justify-between p-4 transition-colors
                        ${idx !== groupedShortcuts[category].length - 1 ? 'border-b border-border-subtle' : ''}
                        hover:bg-background-tertiary
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">{shortcut.label}</p>
                        <p className="text-xs text-text-tertiary mt-1">{shortcut.description}</p>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        <code className="px-3 py-1 bg-background-tertiary text-accent-primary rounded text-sm font-mono whitespace-nowrap">
                          {shortcut.currentKeys}
                        </code>

                        <button
                          onClick={() => setEditingId(shortcut.id)}
                          className="px-3 py-1 bg-accent-primary hover:bg-accent-focus text-text-primary rounded text-sm transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary">No shortcuts found matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-state-info/10 border border-state-info/30 rounded-lg p-4">
          <p className="text-sm text-state-info">
            <span className="font-semibold">💡 Tips:</span>
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
              <li>Use Ctrl, Shift, Alt, or Cmd (Mac) as modifiers</li>
              <li>Examples: Ctrl+N, Shift+F5, Alt+Enter</li>
              <li>Conflicting shortcuts will be prevented</li>
              <li>Changes are saved automatically</li>
            </ul>
          </p>
        </div>
      </div>

      {/* Editor Modal */}
      {editingId && (
        <ShortcutEditor
          shortcutId={editingId}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}
