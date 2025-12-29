import { useMemo } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { CompilerService } from '@/services/CompilerService'
import QuickActionButton from './QuickActionButton'
import type { ModFile } from '@/types/index'

interface QuickActionsPanelProps {
  file?: ModFile
  onBuildFile?: (file: ModFile) => void
  onValidateFile?: (file: ModFile) => void
  onCompareFile?: (file: ModFile) => void
}

/**
 * Context-aware quick actions panel
 * Shows relevant actions based on current file state
 */
export default function QuickActionsPanel({
  file,
  onBuildFile,
  onValidateFile,
  onCompareFile,
}: QuickActionsPanelProps) {
  const { getDiagnosticsForFile } = useDiagnosticStore()

  const diagnostics = useMemo(
    () => (file ? getDiagnosticsForFile(file.id) : []),
    [file, getDiagnosticsForFile]
  )

  const hasErrors = useMemo(
    () => diagnostics.some((d) => d.severity === 'error'),
    [diagnostics]
  )

  const hasWarnings = useMemo(
    () => diagnostics.some((d) => d.severity === 'warning'),
    [diagnostics]
  )

  // Generate context-aware actions
  const actions = useMemo(() => {
    if (!file) {
      return []
    }

    const baseActions = [
      {
        id: 'build',
        icon: '🔨',
        label: 'Build File',
        shortcut: 'Ctrl+B',
        variant: 'primary' as const,
        onClick: () => onBuildFile?.(file),
      },
      {
        id: 'validate',
        icon: '✅',
        label: 'Validate File',
        shortcut: 'Ctrl+Shift+V',
        variant: 'secondary' as const,
        onClick: () => onValidateFile?.(file),
      },
      {
        id: 'compare',
        icon: '📋',
        label: 'Compare with JPE',
        shortcut: 'Ctrl+Alt+D',
        variant: 'secondary' as const,
        onClick: () => onCompareFile?.(file),
      },
    ]

    // Add context-specific actions
    if (hasErrors) {
      baseActions.unshift({
        id: 'fix-errors',
        icon: '🔧',
        label: `Fix Errors (${diagnostics.filter((d) => d.severity === 'error').length})`,
        shortcut: 'Ctrl+.',
        variant: 'danger' as const,
        onClick: () => {
          // Open first error location
          const firstError = diagnostics.find((d) => d.severity === 'error')
          if (firstError) {
            console.log('Navigate to error at line', firstError.line)
          }
        },
      })
    }

    // Add file type specific actions
    if (file.type === 'xml') {
      baseActions.push({
        id: 'compile-jpe',
        icon: '📝',
        label: 'Compile to JPE',
        shortcut: 'Ctrl+J',
        variant: 'secondary' as const,
        onClick: async () => {
          try {
            const result = await CompilerService.validateFile(file)
            console.log('Compiled to JPE:', result)
          } catch (error) {
            console.error('Failed to compile:', error)
          }
        },
      })
    }

    return baseActions
  }, [file, hasErrors, diagnostics, onBuildFile, onValidateFile, onCompareFile])

  if (!file) {
    return (
      <div className="p-4 text-center text-text-secondary text-sm">
        <div>No file selected</div>
        <div className="text-xs mt-2">Open a file to see available actions</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="px-4 pt-4">
        <h2 className="text-sm font-semibold text-text-primary">
          Quick Actions
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          {file.name}
        </p>
      </div>

      {/* Status Summary */}
      {(hasErrors || hasWarnings || file.isDirty) && (
        <div className="px-4 py-3 bg-background-tertiary rounded-lg space-y-1 text-xs">
          {hasErrors && (
            <div className="text-state-error flex items-center gap-2">
              <span>🔴 {diagnostics.filter((d) => d.severity === 'error').length} error{diagnostics.filter((d) => d.severity === 'error').length !== 1 ? 's' : ''}</span>
            </div>
          )}
          {hasWarnings && (
            <div className="text-state-warning flex items-center gap-2">
              <span>⚠️ {diagnostics.filter((d) => d.severity === 'warning').length} warning{diagnostics.filter((d) => d.severity === 'warning').length !== 1 ? 's' : ''}</span>
            </div>
          )}
          {file.isDirty && (
            <div className="text-text-secondary flex items-center gap-2">
              <span>💾 Unsaved changes</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 space-y-2 flex-1 overflow-y-auto">
        {actions.map((action) => (
          <QuickActionButton
            key={action.id}
            icon={action.icon}
            label={action.label}
            shortcut={action.shortcut}
            onClick={action.onClick}
            variant={action.variant}
          />
        ))}
      </div>

      {/* File Info */}
      <div className="px-4 pb-4 border-t border-border-subtle pt-4 text-xs text-text-secondary space-y-1">
        <div>Type: {file.type.toUpperCase()}</div>
        <div>Lines: {file.content?.split('\n').length || 0}</div>
        {file.path && <div className="truncate" title={file.path}>Path: {file.path}</div>}
      </div>
    </div>
  )
}
