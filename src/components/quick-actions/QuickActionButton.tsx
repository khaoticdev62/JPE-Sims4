interface QuickActionButtonProps {
  icon: string
  label: string
  shortcut?: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  isLoading?: boolean
  disabled?: boolean
}

/**
 * Individual quick action button
 */
export default function QuickActionButton({
  icon,
  label,
  shortcut,
  onClick,
  variant = 'secondary',
  isLoading,
  disabled,
}: QuickActionButtonProps) {
  const variantClasses = {
    primary:
      'bg-accent-primary hover:bg-accent-focus text-text-primary border-accent-primary',
    secondary:
      'bg-background-tertiary hover:bg-background-secondary text-text-primary border-border-subtle',
    danger:
      'bg-state-error/20 hover:bg-state-error/30 text-state-error border-state-error/50',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full px-3 py-2 flex items-center gap-2 text-sm font-medium rounded-lg border transition-colors ${
        variantClasses[variant]
      } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <span className="text-base leading-none">
        {isLoading ? '⏳' : icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="text-xs text-text-secondary whitespace-nowrap">
          {shortcut}
        </span>
      )}
    </button>
  )
}
