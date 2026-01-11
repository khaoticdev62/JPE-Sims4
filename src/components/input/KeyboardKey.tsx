import React from 'react'

interface KeyboardKeyProps {
  label: string
  onClick: () => void
  active?: boolean
  className?: string
  width?: string
}

export function KeyboardKey({ 
  label, 
  onClick, 
  active = false, 
  className = '',
  width = 'w-10'
}: KeyboardKeyProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      className={`
        h-10 ${width} flex items-center justify-center rounded 
        text-sm font-medium transition-all
        ${active 
          ? 'bg-accent-primary text-text-primary shadow-lg scale-105' 
          : 'bg-bg-tertiary text-text-secondary hover:bg-bg-hover hover:text-text-primary'}
        ${className}
      `}
    >
      {label}
    </button>
  )
}
