"use client";

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'enum': return 'text-indigo-400'
      case 'tuning': return 'text-amber-400'
      case 'tag': return 'text-purple-400'
      case 'keyword': return 'text-emerald-400'
      case 'logic': return 'text-cyan-400'
      default: return 'text-text-secondary'
    }
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'enum': return 'border-indigo-500/50'
      case 'tuning': return 'border-amber-500/50'
      case 'tag': return 'border-purple-500/50'
      case 'keyword': return 'border-emerald-500/50'
      case 'logic': return 'border-cyan-500/50'
      default: return 'border-border-subtle'
    }
  }

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
        <div className={`mt-6 p-1 bg-bg-tertiary border-t-2 ${getBorderColor(activePrediction.type)} border-x border-b border-border-subtle rounded shadow-xl min-w-[180px] pointer-events-auto backdrop-blur-md bg-opacity-90`}>
          {predictions.map((p, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-all ${
                i === selectedIndex 
                  ? 'bg-white/10 text-white shadow-inner scale-[1.02]' 
                  : 'text-text-secondary hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`${getTypeColor(p.type)} font-medium`}>{p.token}</span>
                {p.source === 'ai' && (
                  <span className="px-1 py-0.5 rounded-[2px] bg-cyan-500/20 text-cyan-400 text-[8px] font-bold uppercase tracking-wider animate-pulse">
                    AI
                  </span>
                )}
              </div>
              <span className="opacity-40 text-[9px] uppercase font-mono ml-4">{p.type}</span>
            </div>
          ))}
          <div className="mt-1 pt-1.5 border-t border-border-subtle flex justify-between px-2 text-[10px] text-text-secondary font-mono">
            <span>[TAB] ACCEPT</span>
            <span className="opacity-50">{selectedIndex + 1}/{predictions.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
