import { useEffect, useRef, useState, useMemo } from 'react'
import { useCommandStore, type Command } from '@/stores/useCommandStore'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Command palette with fuzzy search and keyboard navigation
 * Open with Ctrl+Shift+P
 */
export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { searchCommands, executeCommand, getRecentCommands } = useCommandStore()

  // Get results based on search
  const results = useMemo(
    () => (search ? searchCommands(search) : getRecentCommands(10)),
    [search, searchCommands, getRecentCommands]
  )

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    results.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = []
      }
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [results])

  // Get flat list for keyboard navigation
  const flatResults = useMemo(() => results, [results])

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSearch('')
    }
  }, [isOpen])

  // Keyboard handlers
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0))
          break
        case 'Enter':
          e.preventDefault()
          if (flatResults[selectedIndex]) {
            executeCommand(flatResults[selectedIndex].id)
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, flatResults, executeCommand, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-background-secondary rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="px-4 py-3 border-b border-border-subtle">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search for commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-text-primary placeholder-text-tertiary outline-none text-base"
          />
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto">
          {flatResults.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              {search ? 'No commands found' : 'No recent commands'}
            </div>
          ) : (
            <div className="py-2">
              {!search ? (
                // Recent commands view
                <>
                  {flatResults.map((cmd, index) => (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        executeCommand(cmd.id)
                        onClose()
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors ${
                        selectedIndex === index
                          ? 'bg-accent-primary/20 text-accent-primary'
                          : 'text-text-primary hover:bg-background-tertiary'
                      }`}
                    >
                      <span>{cmd.label}</span>
                      {cmd.shortcut && (
                        <span className="text-xs text-text-secondary ml-auto">
                          {cmd.shortcut}
                        </span>
                      )}
                    </button>
                  ))}
                </>
              ) : (
                // Search results grouped by category
                <>
                  {Object.entries(groupedResults).map(([category, commands]) => (
                    <div key={category}>
                      {/* Category Header */}
                      <div className="px-4 py-2 text-xs font-semibold text-text-secondary bg-background-tertiary sticky top-0">
                        {category}
                      </div>

                      {/* Commands in category */}
                      {commands.map((cmd) => {
                        const isSelected =
                          selectedIndex === flatResults.indexOf(cmd)
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => {
                              executeCommand(cmd.id)
                              onClose()
                            }}
                            className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-accent-primary/20 text-accent-primary'
                                : 'text-text-primary hover:bg-background-tertiary'
                            }`}
                          >
                            <span>{cmd.label}</span>
                            {cmd.shortcut && (
                              <span className="text-xs text-text-secondary ml-auto">
                                {cmd.shortcut}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Help Text */}
        <div className="px-4 py-2 border-t border-border-subtle bg-background-tertiary text-xs text-text-secondary flex gap-4">
          <span>↑↓ Navigate</span>
          <span>⏎ Execute</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
