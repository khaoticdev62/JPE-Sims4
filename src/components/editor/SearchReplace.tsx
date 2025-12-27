/**
 * SEARCH & REPLACE COMPONENT
 *
 * Find and replace functionality for the editor:
 * - Search for text/patterns
 * - Replace single or all occurrences
 * - Case-sensitive toggle
 * - Regex support
 * - Match count
 */

import { useState } from 'react'
import Button from '@components/common/Button'
import TextInput from '@components/common/TextInput'

interface SearchReplaceProps {
  onFind: (query: string, options: { caseSensitive: boolean; regex: boolean }) => number
  onReplace: (query: string, replacement: string) => number
  onReplaceAll: (query: string, replacement: string) => number
  onClose: () => void
}

export default function SearchReplace({
  onFind,
  onReplace,
  onReplaceAll,
  onClose,
}: SearchReplaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const [showReplace, setShowReplace] = useState(false)

  const handleSearch = () => {
    if (searchQuery) {
      const count = onFind(searchQuery, { caseSensitive, regex: useRegex })
      setMatchCount(count)
    }
  }

  const handleReplace = () => {
    if (searchQuery && replaceQuery !== undefined) {
      onReplace(searchQuery, replaceQuery)
      handleSearch() // Update match count
    }
  }

  const handleReplaceAll = () => {
    if (searchQuery && replaceQuery !== undefined) {
      onReplaceAll(searchQuery, replaceQuery)
      handleSearch() // Update match count
    }
  }

  return (
    <div className="bg-bg-secondary border-b border-border-subtle p-3 space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <TextInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
              if (e.key === 'Escape') onClose()
            }}
          />
        </div>

        {/* Match count */}
        {matchCount > 0 && (
          <span className="text-xs text-text-secondary px-2 whitespace-nowrap">
            {matchCount} match{matchCount > 1 ? 'es' : ''}
          </span>
        )}

        {/* Search options */}
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          className={`px-2 py-1 text-xs rounded border ${
            caseSensitive
              ? 'bg-accent-primary border-accent-primary text-text-primary'
              : 'border-border-subtle text-text-secondary hover:border-text-secondary'
          }`}
          title="Match case"
        >
          Aa
        </button>

        <button
          onClick={() => setUseRegex(!useRegex)}
          className={`px-2 py-1 text-xs rounded border ${
            useRegex
              ? 'bg-accent-primary border-accent-primary text-text-primary'
              : 'border-border-subtle text-text-secondary hover:border-text-secondary'
          }`}
          title="Use regex"
        >
          .*
        </button>

        {/* Toggle replace */}
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="px-2 py-1 text-xs border border-border-subtle rounded text-text-secondary hover:border-text-secondary"
          title="Toggle replace"
        >
          ↔️
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="px-2 py-1 text-xs border border-border-subtle rounded text-text-secondary hover:border-text-secondary"
          title="Close (Esc)"
        >
          ✕
        </button>
      </div>

      {/* Replace bar */}
      {showReplace && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <TextInput
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replace..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleReplace()
              }}
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReplace}
            disabled={!searchQuery}
            title="Replace next"
          >
            Replace
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReplaceAll}
            disabled={!searchQuery}
            title="Replace all"
          >
            Replace All
          </Button>
        </div>
      )}
    </div>
  )
}
