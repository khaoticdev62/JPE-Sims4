/**
 * Python Engine types — runtime discovery, health checks, process management
 */

/** Status of the Python runtime environment */
export interface PythonStatus {
  available: boolean
  version: string | null
  pythonPath: string | null
  engineReady: boolean
  engineErrors: string[]
  dependencies: Array<{ name: string; installed: boolean }>
}

/** Response from GET /api/health */
export interface HealthResponse {
  python: {
    available: boolean
    version: string | null
    path: string | null
  }
  engine: {
    ready: boolean
    errors: string[]
  }
  status: 'ok' | 'degraded' | 'error'
  responseTime: number
}

/** Result of spawning a Python subprocess */
export interface PythonProcessResult {
  stdout: string
  stderr: string
  exitCode: number
  duration: number
  killed: boolean
}

/** Structured transform error from Python engine */
export interface TransformError {
  message: string
  line?: number
  column?: number
  severity?: 'error' | 'warning' | 'info'
  code?: string
}

/** Enhanced transform result */
export interface TransformResult {
  xml: string
  errors: TransformError[]
  success: boolean
  mode: 'python' | 'typescript'
  duration: number
  inputSize: number
  outputSize: number
}

/** Compilation result */
export interface CompilationResult {
  success: boolean
  xml?: string
  errors: TransformError[]
  duration: number
  filesProcessed?: number
  totalFiles?: number
}

/** Batch compilation result */
export interface BatchCompilationResult {
  success: boolean
  results: Array<{
    fileName: string
    success: boolean
    errors: TransformError[]
    duration: number
  }>
  successCount: number
  failCount: number
  totalDuration: number
}
