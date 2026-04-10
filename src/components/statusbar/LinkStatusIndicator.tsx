/**
 * LinkStatusIndicator Component (Epic 9)
 *
 * Status bar widget showing JPE-Live bridge connection state.
 * Displays animated glow for active connections, damped gray for disconnected.
 */

"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, ZapOff, Loader2, AlertTriangle, Activity } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { BridgeStatus, BridgeMetrics } from '@/services/live-bridge/types/bridge'

interface LinkStatusIndicatorProps {
  status: BridgeStatus
  metrics?: Partial<BridgeMetrics>
  onClick?: () => void
  className?: string
}

const STATUS_COLORS: Record<BridgeStatus, string> = {
  disconnected: 'bg-slate-600',
  connecting: 'bg-amber-400',
  connected: 'bg-emerald-400',
  error: 'bg-state-error',
  damped: 'bg-slate-400',
}

const STATUS_ICONS: Record<BridgeStatus, React.ElementType> = {
  disconnected: ZapOff,
  connecting: Loader2,
  connected: Zap,
  error: AlertTriangle,
  damped: Activity,
}

/**
 * LinkStatusIndicator - Status bar widget for JPE-Live bridge
 */
export default function LinkStatusIndicator({
  status,
  metrics,
  onClick,
  className = '',
}: LinkStatusIndicatorProps) {
  const [pulsePhase, setPulsePhase] = useState(0)
  const Icon = STATUS_ICONS[status]

  // Animate pulse when connected
  useEffect(() => {
    if (status === 'connected') {
      const interval = setInterval(() => {
        setPulsePhase((prev) => (prev + 1) % 4)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [status])

  const latency = metrics?.latency ?? 0
  const cpu = metrics?.cpu ?? 0

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${className}`}
            aria-label={`JPE-Live bridge status: ${status}`}
          >
            {/* Animated Status Icon */}
            <div className="relative">
              <Icon
                className={`w-3.5 h-3.5 ${
                  status === 'connected'
                    ? 'text-emerald-400'
                    : status === 'error'
                    ? 'text-state-error'
                    : status === 'connecting'
                    ? 'text-amber-400 animate-spin'
                    : 'text-slate-500'
                }`}
              />

              {/* Bioluminescent Pulse (connected only) */}
              {status === 'connected' && (
                <motion.div
                  animate={{
                    scale: pulsePhase % 2 === 0 ? 1 : 1.5,
                    opacity: pulsePhase % 2 === 0 ? 0.8 : 0.2,
                  }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  className="absolute -inset-1 bg-emerald-400/30 rounded-full blur-sm pointer-events-none"
                />
              )}
            </div>

            {/* Status Label */}
            <span
              className={`text-[10px] font-medium uppercase tracking-wider ${
                status === 'connected'
                  ? 'text-emerald-400'
                  : status === 'error'
                  ? 'text-state-error'
                  : 'text-slate-500'
              }`}
            >
              {status === 'connected' ? 'Live' : status === 'damped' ? 'Damped' : status}
            </span>

            {/* Metrics (connected only) */}
            {status === 'connected' && metrics && (
              <div className="flex items-center gap-1 text-[9px] text-slate-400">
                <span>{latency}ms</span>
                <span>·</span>
                <span>{cpu}%</span>
              </div>
            )}
          </button>
        </TooltipTrigger>

        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            <p className="font-medium">JPE-Live Bridge</p>
            <p className="text-slate-400">Status: {status}</p>
            {status === 'connected' && metrics && (
              <>
                <p className="text-slate-400">Latency: {metrics.latency}ms</p>
                <p className="text-slate-400">CPU: {metrics.cpu}%</p>
                <p className="text-slate-400">Memory: {metrics.memory}MB</p>
              </>
            )}
            <p className="text-[10px] text-slate-500">Click to toggle bridge</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
