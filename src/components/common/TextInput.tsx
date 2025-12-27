import { InputHTMLAttributes } from 'react'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export default function TextInput({
  label,
  error,
  helperText,
  className = '',
  ...props
}: TextInputProps) {
  return (
    <div className="mb-4 last:mb-0">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full px-3 py-2 bg-bg-tertiary border border-border-subtle rounded
          text-text-primary placeholder-text-secondary
          focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary
          disabled:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50
          transition-colors duration-200
          ${error ? 'border-state-error focus:ring-state-error' : ''}
          ${className}
        `}
      />
      {error && <div className="text-sm text-state-error mt-1">{error}</div>}
      {helperText && !error && (
        <div className="text-sm text-text-secondary mt-1">{helperText}</div>
      )}
    </div>
  )
}
