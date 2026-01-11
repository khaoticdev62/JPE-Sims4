import React, { useEffect } from 'react'
import { useCodePrediction } from '@/hooks/useCodePrediction'
import { useGamepadButtonDown } from '@/hooks/useGamepadInput'

export function PredictionOverlay() {
  const {
    predictions,
    selectedIndex,
    setSelectedIndex,
    visible,
    cursorPixelPosition,
    acceptPrediction,
    rejectPrediction
  } = useCodePrediction()

  // Accept with RB (button 5)
  useGamepadButtonDown(5, () => {
    if (visible) acceptPrediction()
  })

  // Keyboard controls
  useEffect(() => {
    if (!visible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'ArrowRight') {
        e.preventDefault()
        acceptPrediction()
      } else if (e.key === 'Escape') {
        rejectPrediction()
      } else if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => (prev + 1) % predictions.length)
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => (prev - 1 + predictions.length) % predictions.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [visible, predictions.length, acceptPrediction, rejectPrediction, setSelectedIndex])

  if (!visible || !cursorPixelPosition || predictions.length === 0) return null

  const activePrediction = predictions[selectedIndex]

  return (
    <div 
      className="absolute pointer-events-none z-50 transition-all duration-100"
      style={{ top: cursorPixelPosition.top, left: cursorPixelPosition.left }}
    >
      {/* Ghost Text */}
      <span className="text-text-secondary/40 font-mono text-[13px] whitespace-pre italic">
        {activePrediction.token}
      </span>

      {/* Suggestion Menu */}
      {predictions.length > 1 && (
        <div className="mt-6 p-1 bg-bg-tertiary border border-border-subtle rounded shadow-xl min-w-[150px] pointer-events-auto">
          {predictions.map((p, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                i === selectedIndex ? 'bg-accent-primary text-text-primary' : 'text-text-secondary'
              }`}
            >
              <span>{p.token}</span>
              <span className="opacity-50 text-[10px] uppercase ml-4">{p.type}</span>
            </div>
          ))}
          <div className="mt-1 pt-1 border-t border-border-subtle flex justify-between px-2 text-[10px] text-text-secondary">
            <span>RB to Accept</span>
            <span>{selectedIndex + 1}/{predictions.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
