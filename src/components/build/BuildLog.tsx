"use client";

import { useEffect, useRef } from 'react'
import type { BuildLogEntry } from '@/stores/useBuildStore'

interface BuildLogProps {
  log: BuildLogEntry[]
}

/**
 * Detailed build log with timestamps and color-coded levels
 */
export default function BuildLog({ log }: BuildLogProps) {
  const endRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-state-error'
      case 'warning':
        return 'text-state-warning'
      case 'success':
        return 'text-state-success'
      default:
        return 'text-text-secondary'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return '✗'
      case 'warning':
        return '⚠️'
      case 'success':
        return '✓'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className="space-y-2 p-4 bg-background-tertiary rounded-lg border border-border-subtle">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Build Log</h3>
        <span className="text-xs text-text-secondary">{log.length} entries</span>
      </div>

      {/* Log Container */}
      <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-xs bg-background-secondary rounded p-3">
        {log.length === 0 ? (
          <div className="text-text-secondary">No build logs yet</div>
        ) : (
          <>
            {log.map((entry, index) => (
              <div
                key={index}
                className={`flex gap-2 ${getLevelColor(entry.level)}`}
              >
                {/* Timestamp */}
                <span className="text-text-tertiary flex-shrink-0 w-12">
                  [{entry.timestamp.toLocaleTimeString()}]
                </span>

                {/* Icon */}
                <span className="flex-shrink-0">{getLevelIcon(entry.level)}</span>

                {/* Message */}
                <span className="flex-1 truncate">{entry.message}</span>
              </div>
            ))}
            <div ref={endRef} />
          </>
        )}
      </div>
    </div>
  )
}
