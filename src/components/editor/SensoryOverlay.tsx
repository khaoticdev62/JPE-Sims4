"use client";

import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/useUIStore'
import { motion, AnimatePresence } from 'framer-motion'

interface SyncEvent {
  type: string
  payload: any
  timestamp: number
}

/**
 * SensoryOverlay - "Spectral" visual HUD for engine synchronization events.
 * Displays real-time pulses and diagnostic data over the editor.
 */
export const SensoryOverlay = () => {
  const { immersionMode } = useUIStore()
  const [pulses, setPulses] = useState<SyncEvent[]>([])

  useEffect(() => {
    if (!window.ipc) return

    window.ipc.on('sync:event', (event: any) => {
      const syncEvent = event as SyncEvent

      // Add pulse to stack
      setPulses((prev) => [...prev, { ...syncEvent, timestamp: Date.now() }])

      // Auto-remove pulse after 2 seconds
      setTimeout(() => {
        setPulses((prev) => prev.filter((p) => p.timestamp !== syncEvent.timestamp))
      }, 2000)
    })
  }, [])

  if (immersionMode === 'normal') return null

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pulses.map((pulse) => (
          <motion.div
            key={pulse.timestamp}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className={`absolute bottom-8 right-8 flex items-center gap-3 p-4 rounded-lg border backdrop-blur-md shadow-glow-lg ${
              pulse.type === 'error' 
                ? 'bg-state-error/20 border-state-error/40 text-state-error shadow-glow-red' 
                : pulse.type === 'warning'
                ? 'bg-state-warning/20 border-state-warning/40 text-state-warning shadow-glow-amber'
                : 'bg-accent-primary/20 border-accent-primary/40 text-accent-primary shadow-glow-cyan'
            }`}
          >
            <div className={`w-2 h-2 rounded-full animate-ping ${
              pulse.type === 'error' ? 'bg-state-error' : pulse.type === 'warning' ? 'bg-state-warning' : 'bg-accent-primary'
            }`} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                Spectral Sync: {pulse.type}
              </span>
              <span className="text-xs font-medium max-w-xs truncate">
                {pulse.payload?.message || 'Engine pulse detected'}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Persistence Bloom (Focus Mode only) */}
      {immersionMode === 'focus' && pulses.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-accent-primary pointer-events-none mix-blend-screen transition-colors duration-1000"
          style={{
            backgroundColor: pulses[0].type === 'error' ? 'var(--state-error)' : 'var(--accent-primary)'
          }}
        />
      )}
    </div>
  )
}
