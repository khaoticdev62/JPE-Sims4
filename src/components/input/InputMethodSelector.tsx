import React from 'react'

interface InputMethodSelectorProps {
  currentMethod: 'physical' | 'virtual'
  onMethodChange: (method: 'physical' | 'virtual') => void
}

export function InputMethodSelector({
  currentMethod,
  onMethodChange
}: InputMethodSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-bg-tertiary rounded-lg border border-border-subtle">
      <button
        onClick={() => onMethodChange('physical')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          currentMethod === 'physical'
            ? 'bg-accent-primary text-text-primary shadow-sm'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Keyboard
      </button>
      <button
        onClick={() => onMethodChange('virtual')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          currentMethod === 'virtual'
            ? 'bg-accent-primary text-text-primary shadow-sm'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Virtual
      </button>
    </div>
  )
}
