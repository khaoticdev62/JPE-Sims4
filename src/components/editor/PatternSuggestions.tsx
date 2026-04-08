"use client";

/**
 * Pattern Suggestions Component
 * Displays detected patterns and insights for the current project
 */

import { useState, useEffect } from 'react'
import { PatternStore } from '@engine/ml/PatternStore'
import PatternInsight from './PatternInsight'
import type { ProjectPatterns } from '@engine/ml/types'

interface PatternSuggestionsProps {
  projectName?: string
  onAnalyze?: () => void
  className?: string
}

export default function PatternSuggestions({
  projectName = 'default',
  onAnalyze,
  className = '',
}: PatternSuggestionsProps) {
  const [patterns, setPatterns] = useState<ProjectPatterns | null>(null)
  const [loading, setLoading] = useState(false)

  const loadPatterns = () => {
    setLoading(true)
    try {
      const loaded = PatternStore.loadPatterns(projectName)
      setPatterns(loaded)
    } finally {
      setLoading(false)
    }
  }

  // Load patterns on mount or when project changes
  useEffect(() => {
    loadPatterns()
  }, [projectName])

  const topTuningPatterns = patterns?.tuningPatterns.slice(0, 5) || []
  const topEnumPatterns = patterns?.enumPatterns.slice(0, 5) || []
  const topNamingPatterns = patterns?.namingPatterns.slice(0, 3) || []

  const totalPatterns =
    (patterns?.tuningPatterns.length || 0) +
    (patterns?.enumPatterns.length || 0) +
    (patterns?.namingPatterns.length || 0)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-text-primary">Detected Patterns</h3>
        {patterns && (
          <div className="text-xs text-text-tertiary space-y-1">
            <p>Total patterns: {totalPatterns}</p>
            <p>Analysis time: {patterns.analysisTime}ms</p>
            <p>Files analyzed: {patterns.filesAnalyzed}</p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-4 bg-background-tertiary rounded-lg border border-border-subtle text-center">
          <p className="text-sm text-text-secondary">Analyzing patterns...</p>
        </div>
      )}

      {/* No Patterns */}
      {!loading && !patterns && (
        <div className="p-4 bg-background-tertiary rounded-lg border border-border-subtle text-center space-y-3">
          <p className="text-sm text-text-secondary">
            No patterns detected yet. Add more files to your project to enable pattern analysis.
          </p>
          {onAnalyze && (
            <button
              onClick={onAnalyze}
              className="px-3 py-2 text-sm bg-accent-primary hover:bg-accent-focus text-text-primary rounded transition-colors"
            >
              Analyze Now
            </button>
          )}
        </div>
      )}

      {/* Tuning Patterns */}
      {patterns && topTuningPatterns.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text-primary flex items-center gap-2">
            <span className="text-accent-primary">🔗</span>
            Tuning Patterns ({patterns.tuningPatterns.length})
          </h4>
          <div className="space-y-2">
            {topTuningPatterns.map((pattern) => (
              <PatternInsight
                key={pattern.id}
                pattern={{
                  id: pattern.id,
                  type: 'tuning',
                  label: pattern.tuningId,
                  frequency: pattern.frequency,
                  confidence: pattern.confidence,
                  metadata: `Used in ${pattern.files.length} files`,
                }}
              />
            ))}
            {patterns.tuningPatterns.length > 5 && (
              <p className="text-xs text-text-tertiary p-2">
                +{patterns.tuningPatterns.length - 5} more patterns
              </p>
            )}
          </div>
        </div>
      )}

      {/* Enum Patterns */}
      {patterns && topEnumPatterns.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text-primary flex items-center gap-2">
            <span className="text-state-info">📝</span>
            Enum Patterns ({patterns.enumPatterns.length})
          </h4>
          <div className="space-y-2">
            {topEnumPatterns.map((pattern) => (
              <PatternInsight
                key={pattern.id}
                pattern={{
                  id: pattern.id,
                  type: 'enum',
                  label: pattern.value,
                  frequency: pattern.frequency,
                  confidence: pattern.confidence,
                  metadata: `Type: ${pattern.type}`,
                }}
              />
            ))}
            {patterns.enumPatterns.length > 5 && (
              <p className="text-xs text-text-tertiary p-2">
                +{patterns.enumPatterns.length - 5} more patterns
              </p>
            )}
          </div>
        </div>
      )}

      {/* Naming Patterns */}
      {patterns && topNamingPatterns.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text-primary flex items-center gap-2">
            <span className="text-state-success">📛</span>
            Naming Patterns ({patterns.namingPatterns.length})
          </h4>
          <div className="space-y-2">
            {topNamingPatterns.map((pattern) => (
              <PatternInsight
                key={pattern.id}
                pattern={{
                  id: pattern.id,
                  type: 'naming',
                  label: pattern.prefix || pattern.suffix || 'custom',
                  frequency: pattern.frequency,
                  confidence: pattern.confidence,
                  metadata: `${pattern.examples.slice(0, 2).join(', ')}`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="text-xs text-text-tertiary bg-background-tertiary p-3 rounded border border-border-subtle">
        <p className="mb-2 font-medium">💡 Tips</p>
        <ul className="space-y-1 text-xs">
          <li>• Use detected patterns to maintain consistency across your project</li>
          <li>• High-confidence patterns appear in multiple files</li>
          <li>• Pattern analysis runs automatically in the background</li>
        </ul>
      </div>
    </div>
  )
}
