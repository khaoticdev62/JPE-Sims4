import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
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
  const baseClasses = 'font-medium rounded transition-colors duration-200'

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400',
    secondary:
      'bg-slate-700 hover:bg-slate-600 text-slate-100 disabled:bg-slate-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400',
  }

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
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
