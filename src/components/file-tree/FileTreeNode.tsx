import { useState, useMemo } from 'react'
import type { ModFile, Diagnostic } from '@/types/index'
import FileStatusIcon from './FileStatusIcon'
import FileContextMenu from './FileContextMenu'

interface FileTreeNodeProps {
  file: ModFile
  diagnostics: Diagnostic[]
  onOpenFile?: (file: ModFile) => void
  onValidateFile?: (file: ModFile) => void
  onDeleteFile?: (file: ModFile) => void
  onRenameFile?: (file: ModFile) => void
  isSelected?: boolean
}

/**
 * Individual file tree node with status indicators and context menu
 */
export default function FileTreeNode({
  file,
  diagnostics,
  onOpenFile,
  onValidateFile,
  onDeleteFile,
  onRenameFile,
  isSelected,
}: FileTreeNodeProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  // Calculate status from diagnostics
  const { hasErrors, hasWarnings } = useMemo(() => {
    return {
      hasErrors: diagnostics.some((d) => d.severity === 'error'),
      hasWarnings: diagnostics.some((d) => d.severity === 'warning'),
    }
  }, [diagnostics])

  // Get file type icon
  const getFileIcon = (name: string): string => {
    if (name.endsWith('.xml')) return '📄'
    if (name.endsWith('.jpe')) return '📝'
    if (name.endsWith('.stbl')) return '🔤'
    if (name.endsWith('.package')) return '📦'
    return '📋'
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <button
        onClick={() => onOpenFile?.(file)}
        onContextMenu={handleContextMenu}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary rounded transition-colors ${
          isSelected
            ? 'bg-accent-primary/20 hover:bg-accent-primary/30'
            : 'hover:bg-background-secondary'
        }`}
      >
        {/* Status Icon */}
        <FileStatusIcon
          hasErrors={hasErrors}
          hasWarnings={hasWarnings}
          isDirty={file.isDirty}
        />

        {/* File Type Icon */}
        <span className="text-base leading-none">{getFileIcon(file.name)}</span>

        {/* File Name */}
        <span className="flex-1 truncate text-left">{file.name}</span>

        {/* Diagnostic Count */}
        {diagnostics.length > 0 && (
          <span className="text-xs text-text-secondary whitespace-nowrap">
            ({diagnostics.length})
          </span>
        )}
      </button>

      {/* Context Menu */}
      {contextMenu && (
        <FileContextMenu
          file={file}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
          onOpen={onOpenFile}
          onValidate={onValidateFile}
          onDelete={onDeleteFile}
          onRename={onRenameFile}
        />
      )}
    </>
  )
}
