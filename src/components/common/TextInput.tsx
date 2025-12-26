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
        <label className="block text-sm font-medium text-slate-100 mb-1.5">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded
          text-slate-100 placeholder-slate-500
          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
          disabled:bg-slate-700 disabled:cursor-not-allowed
          transition-colors duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
      />
      {error && <div className="text-sm text-red-400 mt-1">{error}</div>}
      {helperText && !error && (
        <div className="text-sm text-slate-400 mt-1">{helperText}</div>
      )}
    </div>
  )
}
