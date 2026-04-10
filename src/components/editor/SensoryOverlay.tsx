"use client";

import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/useUIStore'
import { motion, AnimatePresence, type Transition } from 'framer-motion'

interface SyncEvent {
  type: string
  payload: any
  timestamp: number
}

// Bioluminescent keyframe styles
const PULSE_ANIMATIONS: Record<string, { initial: any; animate: any; transition: Transition<any> }> = {
  success: {
    initial: { opacity: 0, scale: 0.5, filter: 'blur(20px)' },
    animate: {
      opacity: [0, 0.6, 0.3, 0.8, 0],
      scale: [0.5, 1.2, 0.9, 1.3, 1],
      filter: ['blur(20px)', 'blur(8px)', 'blur(4px)', 'blur(2px)', 'blur(10px)'],
    },
    transition: { duration: 1.5, ease: 'easeInOut' as const },
  },
  warning: {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: [0, 0.8, 0.5, 0.9, 0],
      x: [-20, 10, -5, 5, 0],
    },
    transition: { duration: 1.2, ease: 'easeOut' as const },
  },
  error: {
    initial: { opacity: 0, scale: 1.5 },
    animate: {
      opacity: [0, 1, 0.7, 1, 0],
      scale: [1.5, 0.8, 1.1, 0.9, 1],
    },
    transition: { duration: 0.8, ease: 'easeInOut' as const },
  },
}

/**
 * SensoryOverlay - "Spectral" visual HUD for engine synchronization events.
 * Displays real-time bioluminescent pulses and diagnostic data over the editor.
 */
export const SensoryOverlay = () => {
  const { immersionMode, visualEnabled, masterSensoryVolume } = useUIStore()
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

  if (immersionMode === 'normal' || !visualEnabled) return null

  // Map master volume to animation intensity (0-100 → 0.3-1.0)
  const intensityFactor = 0.3 + (masterSensoryVolume / 100) * 0.7

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pulses.map((pulse) => {
          const animConfig = PULSE_ANIMATIONS[pulse.type as keyof typeof PULSE_ANIMATIONS] || PULSE_ANIMATIONS.success

          return (
            <motion.div
              key={pulse.timestamp}
              initial={animConfig.initial}
              animate={animConfig.animate}
              transition={{
                ...animConfig.transition,
                duration: (animConfig.transition.duration || 1) * (2 - intensityFactor),
              }}
              className={`absolute bottom-8 right-8 flex items-center gap-3 p-4 rounded-lg border backdrop-blur-md shadow-glow-lg ${
                pulse.type === 'error'
                  ? 'bg-state-error/20 border-state-error/40 text-state-error shadow-glow-red'
                  : pulse.type === 'warning'
                  ? 'bg-state-warning/20 border-state-warning/40 text-state-warning shadow-glow-amber'
                  : 'bg-accent-primary/20 border-accent-primary/40 text-accent-primary shadow-glow-cyan'
              }`}
              style={{
                opacity: intensityFactor,
              }}
            >
              {/* Bioluminescent ping dot */}
              <motion.div
                animate={{
                  scale: [1, 1.5 * intensityFactor, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5 / intensityFactor,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`w-2 h-2 rounded-full ${
                  pulse.type === 'error' ? 'bg-state-error' : pulse.type === 'warning' ? 'bg-state-warning' : 'bg-accent-primary'
                }`}
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                  Spectral Sync: {pulse.type}
                </span>
                <span className="text-xs font-medium max-w-xs truncate">
                  {pulse.payload?.message || 'Engine pulse detected'}
                </span>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Bioluminescent Bloom (Focus Mode only) */}
      {immersionMode === 'focus' && pulses.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.15 * intensityFactor, 0.08 * intensityFactor, 0.2 * intensityFactor, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            background: `radial-gradient(circle at center, ${
              pulses[0].type === 'error'
                ? `rgba(255, 68, 68, ${0.2 * intensityFactor})`
                : `rgba(56, 189, 248, ${0.15 * intensityFactor})`
            } 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Ambient Glow (always present in focus mode) */}
      {immersionMode === 'focus' && visualEnabled && (
        <motion.div
          animate={{
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{
            duration: 4 / intensityFactor,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top right, rgba(56, 189, 248, ${0.05 * intensityFactor}) 0%, transparent 60%)`,
          }}
        />
      )}
    </div>
  )
}
