"use client";

import React, { useState} from 'react'
import { KeyboardKey } from './KeyboardKey'

interface VirtualKeyboardProps {
  onInput: (text: string) => void
  onClose: () => void
  visible: boolean
  _context?: 'default' | 'xml' | 'jpe'
}

export function VirtualKeyboard({
  onInput,
  onClose,
  visible,
  _context = 'default'
}: VirtualKeyboardProps) {
  const [layout, setLayout] = useState<'qwerty' | 'symbols'>('qwerty')
  const [shift, setShift] = useState(false)

  const layouts = {
    qwerty: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    ],
    symbols: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
      ['-', '=', '[', ']', '{', '}', '|', ';', ':', "'"],
      [',', '.', '/', '\\', '?', '`', '~'],
    ]
  }

  const handleKeyClick = (key: string) => {
    if (key === 'SHIFT') {
      setShift(!shift)
      return
    }
    if (key === '123' || key === 'ABC') {
      setLayout(layout === 'qwerty' ? 'symbols' : 'qwerty')
      return
    }
    if (key === 'SPACE') {
      onInput(' ')
      return
    }
    if (key === 'BACK') {
      onInput('\b')
      return
    }
    if (key === 'ENTER') {
      onInput('\n')
      return
    }

    const output = shift ? key.toUpperCase() : key.toLowerCase()
    onInput(output)
    if (shift) setShift(false) // Auto-lowercase after one uppercase letter
  }

  if (!visible) return null

  const currentLayout = layouts[layout]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-bg-secondary border-t border-border-subtle shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-xs font-bold text-accent-primary uppercase tracking-widest">
            {layout.toUpperCase()} Keyboard
          </span>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-lg"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {currentLayout.map((row, i) => (
            <div key={i} className="flex justify-center gap-1.5">
              {row.map((key) => (
                <KeyboardKey
                  key={key}
                  label={key}
                  onClick={() => handleKeyClick(key)}
                />
              ))}
            </div>
          ))}

          {/* Bottom Row */}
          <div className="flex justify-center gap-1.5 pt-1">
            <KeyboardKey 
              label={layout === 'qwerty' ? '123' : 'ABC'} 
              onClick={() => handleKeyClick(layout === 'qwerty' ? '123' : 'ABC')}
              width="w-16"
              className="bg-bg-tertiary"
            />
            <KeyboardKey 
              label="SHIFT" 
              onClick={() => handleKeyClick('SHIFT')}
              active={shift}
              width="w-16"
            />
            <KeyboardKey 
              label="SPACE" 
              onClick={() => handleKeyClick('SPACE')}
              width="w-64"
            />
            <KeyboardKey 
              label="ENTER" 
              onClick={() => handleKeyClick('ENTER')}
              width="w-20"
              className="bg-accent-primary/20 text-accent-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
