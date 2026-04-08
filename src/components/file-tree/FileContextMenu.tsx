"use client";

import { useEffect, useRef } from 'react'
import type { ModFile } from '@/types/index'

interface FileContextMenuProps {
  file?: ModFile
  isGroupHeader?: boolean
  position: { x: number; y: number }
  onClose: () => void
  onOpen?: (file: ModFile) => void
  onValidate?: (file: ModFile) => void
  onDelete?: (file: ModFile) => void
  onRename?: (file: ModFile) => void
  onAddFile?: () => void
}

/**
 * Context menu that appears on right-click of file tree nodes
 */
export default function FileContextMenu({
  file,
  isGroupHeader = false,
  position,
  onClose,
  onOpen,
  onValidate,
  onDelete,
  onRename,
  onAddFile,
}: FileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const menuItems = [
    // Add File option (only for group headers)
    ...(isGroupHeader && onAddFile ? [
      {
        id: 'add-file',
        label: 'Add File',
        icon: '📎',
        action: onAddFile,
        divider: true,
      },
    ] : []),
    // File-specific actions (only when file is provided)
    ...(file ? [
      {
        id: 'open',
        label: 'Open',
        icon: '📂',
        action: onOpen,
        divider: true,
      },
      {
        id: 'validate',
        label: 'Validate File',
        icon: '✅',
        action: onValidate,
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: '✏️',
        action: onRename,
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: '🗑️',
        action: onDelete,
        divider: true,
        className: 'text-state-error',
      },
    ] : []),
  ].filter((item) => item.action)

  return (
    <div
      ref={menuRef}
      className="fixed bg-background-tertiary border border-border-subtle rounded-lg shadow-lg z-50 min-w-48 overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="py-1">
        {menuItems.map((item, index) => (
          <div key={item.id}>
            <button
              onClick={() => {
                if (file) (item.action as (f: ModFile) => void)?.(file)
                else (item.action as () => void)?.()
                onClose()
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-background-secondary transition-colors ${
                item.className || 'text-text-primary'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </button>

            {item.divider && index < menuItems.length - 1 && (
              <div className="my-1 h-px bg-border-subtle" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
