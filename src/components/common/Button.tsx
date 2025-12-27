import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  isLoading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    primary: 'bg-accent-primary hover:bg-accent-focus text-bg-primary disabled:opacity-50 focus:ring-accent-primary',
    secondary:
      'bg-bg-secondary hover:bg-bg-tertiary text-text-primary border border-border-subtle disabled:opacity-50 focus:ring-accent-primary',
    danger: 'bg-state-error hover:opacity-90 text-text-primary disabled:opacity-50 focus:ring-state-error',
    ghost: 'text-text-primary hover:bg-bg-tertiary disabled:opacity-50 focus:ring-accent-primary',
  }

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${className}
      `}
    >
      {isLoading ? '⏳ Loading...' : children}
    </button>
  )
}
