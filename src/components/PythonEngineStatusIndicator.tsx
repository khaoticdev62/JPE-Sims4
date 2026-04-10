'use client'

import React, { useEffect, useState } from 'react'
import { AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react'
import type { HealthResponse } from '@/types/python-engine'

/**
 * PythonEngineStatusIndicator — shows Python engine health in the status bar.
 * Green dot = ok, yellow dot = degraded, red dot = error.
 * Tooltip provides detailed status information.
 */
export const PythonEngineStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Native IPC health probe (Zero-Server)
    if (typeof window !== 'undefined' && window.electron?.transform) {
      window.electron.transform.run('', '__health_check__.jpe')
        .then(() => {
          setStatus({
            status: 'ok',
            python: { available: true, version: '3.x', path: 'system' },
            engine: { ready: true, errors: [] },
            responseTime: 0,
          } as HealthResponse)
          setLoading(false)
        })
        .catch(() => {
          setStatus({
            status: 'error',
            python: { available: false, version: '', path: '' },
            engine: { ready: false, errors: ['Python engine not available'] },
            responseTime: 0,
          } as HealthResponse)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-1 opacity-60" title="Checking Python engine...">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
        <span className="text-[9px] font-medium">Python: checking...</span>
      </div>
    )
  }

  if (!status) {
    return (
      <div
        className="flex items-center gap-1 opacity-60 cursor-help"
        title="Unable to check Python engine status"
      >
        <XCircle className="w-3 h-3 text-gray-400" />
        <span className="text-[9px] font-medium">Python: unknown</span>
      </div>
    )
  }

  const isOk = status.status === 'ok'
  const isDegraded = status.status === 'degraded'
  const isError = status.status === 'error'

  const dotColor = isOk
    ? 'bg-emerald-400'
    : isDegraded
      ? 'bg-yellow-400'
      : 'bg-red-400'

  const Icon = isOk ? CheckCircle2 : isDegraded ? AlertTriangle : XCircle

  const statusText = isOk
    ? `Python ${status.python.version}`
    : isDegraded
      ? 'Python: degraded'
      : 'Python: unavailable'

  const tooltipText = isOk
    ? `Python ${status.python.version} — Engine ready`
    : isError
      ? 'Python engine is not available. Install Python 3.10+ to use transformation features.'
      : [
          status.engine.errors.length > 0 ? status.engine.errors[0] : '',
          status.python.available && !status.engine.ready
            ? 'Engine not ready — check dependencies'
            : '',
        ]
          .filter(Boolean)
          .join('\n')

  return (
    <div
      className="relative flex items-center gap-1 cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isOk ? 'animate-pulse' : ''}`} />
      <Icon className="w-3 h-3" />
      <span className="text-[9px] font-medium">{statusText}</span>

      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-gray-100 text-xs rounded-md shadow-lg whitespace-pre-wrap min-w-[240px] max-w-[360px] z-50 pointer-events-none">
          <div className="font-semibold mb-1">Python Engine Status</div>
          <div>Status: {tooltipText}</div>
          {status.python.available && (
            <div className="mt-1 opacity-70">
              Python: {status.python.version} at {status.python.path}
            </div>
          )}
          <div className="mt-1 opacity-70">Response: {status.responseTime}ms</div>
        </div>
      )}
    </div>
  )
}
