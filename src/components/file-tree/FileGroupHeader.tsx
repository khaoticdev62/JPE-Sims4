"use client";

import { useState, useId } from 'react'
import FileContextMenu from './FileContextMenu'

interface FileGroupHeaderProps {
  name: string
  icon: string
  fileCount: number
  errorCount: number
  warningCount: number
  children: React.ReactNode
  onAddFile?: () => void
}

/**
 * Displays a collapsible file group header
 * Shows group name, file count, and error/warning counts
 */
export default function FileGroupHeader({
  name,
  icon,
  fileCount,
  errorCount,
  warningCount,
  children,
  onAddFile,
}: FileGroupHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const groupId = useId()
  const panelId = `${groupId}-panel`

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <div className="space-y-1" role="treeitem" aria-expanded={isExpanded}>
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        onContextMenu={handleContextMenu}
        id={groupId}
        aria-controls={panelId}
        aria-expanded={isExpanded}
        aria-label={`${name}, ${fileCount} files${errorCount > 0 ? `, ${errorCount} errors` : ''}${warningCount > 0 ? `, ${warningCount} warnings` : ''}`}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary hover:bg-background-tertiary rounded transition-colors"
      >
        {/* Expand/Collapse Arrow */}
        <span className={`text-base leading-none transition-transform ${isExpanded ? '' : '-rotate-90'}`}>
          ▼
        </span>

        {/* Group Icon */}
        <span className="text-base leading-none">{icon}</span>

        {/* Group Name */}
        <span>{name}</span>

        {/* File Count */}
        <span className="text-xs text-text-secondary ml-auto">
          ({fileCount})
        </span>

        {/* Error/Warning Badges */}
        <div className="flex gap-1 ml-2">
          {errorCount > 0 && (
            <span
              className="text-xs bg-state-error/20 text-state-error px-2 py-0.5 rounded"
              title={`${errorCount} error${errorCount !== 1 ? 's' : ''}`}
            >
              {errorCount}
            </span>
          )}
          {warningCount > 0 && (
            <span
              className="text-xs bg-state-warning/20 text-state-warning px-2 py-0.5 rounded"
              title={`${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
            >
              {warningCount}
            </span>
          )}
        </div>
      </button>

      {/* Group Content */}
      {isExpanded && (
        <div id={panelId} role="group" aria-labelledby={groupId} className="space-y-0.5 pl-4">
          {children}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <FileContextMenu
          isGroupHeader
          position={contextMenu}
          onClose={() => setContextMenu(null)}
          onAddFile={() => {
            setContextMenu(null)
            onAddFile?.()
          }}
        />
      )}
    </div>
  )
}
