/**
 * Health Check API Route
 *
 * GET /api/health
 * Returns Python runtime status and engine readiness.
 * Response time < 2 seconds.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPythonEngineService } from '@/services/PythonEngineService'
import type { HealthResponse } from '@/types/python-engine'

export async function GET(_request: NextRequest) {
  const start = Date.now()
  const service = getPythonEngineService()

  try {
    const status = await service.engineHealthCheck()
    const responseTime = Date.now() - start

    // Determine overall status
    let overallStatus: 'ok' | 'degraded' | 'error' = 'ok'
    if (!status.available) {
      overallStatus = 'error'
    } else if (!status.engineReady || status.dependencies.some((d) => !d.installed)) {
      overallStatus = 'degraded'
    }

    const response: HealthResponse = {
      python: {
        available: status.available,
        version: status.version,
        path: status.pythonPath,
      },
      engine: {
        ready: status.engineReady,
        errors: status.engineErrors,
      },
      status: overallStatus,
      responseTime,
    }

    return NextResponse.json(response)
  } catch (error) {
    const responseTime = Date.now() - start
    const message = error instanceof Error ? error.message : 'Health check failed'

    return NextResponse.json(
      {
        python: { available: false, version: null, path: null },
        engine: { ready: false, errors: [message] },
        status: 'error' as const,
        responseTime,
      },
      { status: 500 }
    )
  }
}
