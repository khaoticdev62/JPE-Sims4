/**
 * LiveBridgeToggle Component (Epic 9)
 *
 * Toggle switch for enabling/disabling JPE-Live sync bridge.
 * Shows connection status with animated indicator.
 */

"use client"

import { useState, useEffect } from 'react'
import { Zap, ZapOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { liveService } from '@/services/JpeLiveService'
import { LiveBridgeDeployer } from '@/services/live-bridge/LiveBridgeDeployer'
import type { BridgeStatus } from '@/services/live-bridge/types/bridge'
import { useUIStore } from '@/stores/useUIStore'

interface LiveBridgeToggleProps {
  modsPath: string
  className?: string
}

const STATUS_CONFIG: Record<BridgeStatus, { icon: any; color: string; label: string }> = {
  disconnected: { icon: ZapOff, color: 'text-slate-500', label: 'Disconnected' },
  connecting: { icon: Loader2, color: 'text-amber-400', label: 'Connecting...' },
  connected: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Connected' },
  error: { icon: AlertCircle, color: 'text-state-error', label: 'Error' },
  damped: { icon: ZapOff, color: 'text-slate-400', label: 'Link Severed' },
}

export default function LiveBridgeToggle({ modsPath, className = '' }: LiveBridgeToggleProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [status, setStatus] = useState<BridgeStatus>('disconnected')
  const [isDeploying, setIsDeploying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const { audioEnabled: _audioEnabled } = useUIStore()

  // Handle toggle
  const handleToggle = async () => {
    if (isEnabled) {
      // Disable bridge
      liveService.disconnect()
      setIsEnabled(false)
      setStatus('disconnected')
      setMessage('JPE-Live bridge disabled')
    } else {
      // Enable bridge: deploy script then connect
      setIsDeploying(true)
      setStatus('connecting')
      setMessage('Deploying bridge script...')

      try {
        // Deploy script to Mods folder
        const deployResult = await LiveBridgeDeployer.deploy(modsPath)

        if (deployResult.success) {
          setMessage(deployResult.message)

          // Attempt connection
          const connected = await liveService.connect()

          if (connected) {
            setIsEnabled(true)
            setStatus('connected')
            setMessage('Connected to Sims 4 engine')
          } else {
            setStatus('error')
            setMessage('Failed to connect to game (is Sims 4 running?)')
          }
        } else {
          setStatus('error')
          setMessage(`Deploy failed: ${deployResult.message}`)
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        setStatus('error')
        setMessage(`Error: ${msg}`)
      } finally {
        setIsDeploying(false)
      }
    }
  }

  // Clear message after delay
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const statusConfig = STATUS_CONFIG[status]
  const StatusIcon = statusConfig.icon

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Status Indicator */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <StatusIcon
                className={`w-4 h-4 ${statusConfig.color} ${
                  status === 'connecting' ? 'animate-spin' : ''
                }`}
              />
              <span className="text-xs text-slate-400">{statusConfig.label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">JPE-Live Bridge Status</p>
            <p className="text-[10px] text-slate-500">{message || 'Click toggle to enable'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Toggle Button */}
      <Button
        variant={isEnabled ? 'default' : 'outline'}
        size="sm"
        onClick={handleToggle}
        disabled={isDeploying}
        className="min-w-[8rem]"
      >
        {isDeploying ? (
          <>
            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            Deploying...
          </>
        ) : isEnabled ? (
          <>
            <Zap className="w-3 h-3 mr-2" />
            Disable JPE-Live
          </>
        ) : (
          <>
            <ZapOff className="w-3 h-3 mr-2" />
            Enable JPE-Live
          </>
        )}
      </Button>

      {/* Status Badge (optional) */}
      {message && (
        <Badge
          variant="outline"
          className={`text-[10px] ${
            status === 'error'
              ? 'border-state-error/40 text-state-error'
              : status === 'connected'
              ? 'border-emerald-400/40 text-emerald-400'
              : 'border-slate-600 text-slate-400'
          }`}
        >
          {message}
        </Badge>
      )}
    </div>
  )
}
