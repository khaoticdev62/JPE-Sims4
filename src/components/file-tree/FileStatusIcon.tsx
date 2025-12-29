interface FileStatusIconProps {
  hasErrors: boolean
  hasWarnings: boolean
  isDirty: boolean
  isBuilding?: boolean
}

/**
 * Displays a visual status indicator for a file
 * Priority: Errors > Warnings > Unsaved > Saved
 */
export default function FileStatusIcon({
  hasErrors,
  hasWarnings,
  isDirty,
  isBuilding,
}: FileStatusIconProps) {
  if (isBuilding) {
    return (
      <div className="text-base leading-none" title="Building...">
        🔄
      </div>
    )
  }

  if (hasErrors) {
    return (
      <div className="text-base leading-none text-state-error" title="File has errors">
        🔴
      </div>
    )
  }

  if (hasWarnings) {
    return (
      <div className="text-base leading-none text-state-warning" title="File has warnings">
        ⚠️
      </div>
    )
  }

  if (isDirty) {
    return (
      <div className="text-base leading-none text-text-secondary" title="File has unsaved changes">
        💾
      </div>
    )
  }

  return (
    <div className="text-base leading-none text-state-success" title="File is valid">
      ✅
    </div>
  )
}
