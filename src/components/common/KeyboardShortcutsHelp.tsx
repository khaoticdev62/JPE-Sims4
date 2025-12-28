import { getAvailableShortcuts } from '@/hooks/useKeyboardShortcuts'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null

  const shortcuts = getAvailableShortcuts()
  const entries = Object.entries(shortcuts)

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary border border-border-subtle rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-bg-secondary border-b border-border-subtle p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          {entries.map(([shortcut, description]) => (
            <div key={shortcut} className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">{description}</span>
              <kbd className="px-2 py-1 bg-bg-tertiary border border-border-subtle rounded text-xs font-mono text-text-primary">
                {shortcut}
              </kbd>
            </div>
          ))}
        </div>

        <div className="border-t border-border-subtle p-4 bg-bg-primary text-xs text-text-secondary">
          <p>Press <kbd className="px-1 bg-bg-tertiary rounded">?</kbd> anytime to show this help.</p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsHelp
