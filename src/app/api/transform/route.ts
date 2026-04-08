/**
 * Transform API — JPE to XML transformation
 *
 * Hardened (Story 1.2):
 * - Input validation (max 1MB, supported extensions)
 * - 30s timeout with zombie process cleanup
 * - Concurrent process pool (max 4 parallel)
 * - Structured error parsing from Python stderr
 * - LRU response caching (max 50 entries)
 * - Performance logging
 *
 * POST /api/transform
 * Body: { source: string, fileName?: string, force?: boolean }
 * Response: { xml: string, errors: Array, success: boolean, duration: number, mode: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'
import { tmpdir } from 'os'
import { writeFile, readFile, unlink, mkdir } from 'fs/promises'
import { createHash } from 'crypto'
import { LRUCache } from 'lru-cache'
import type { TransformError } from '@/types/python-engine'

// ─── Configuration ───────────────────────────────────────────────────────────

const MAX_SOURCE_SIZE = 1_000_000 // 1MB
const TRANSFORM_TIMEOUT_MS = 30_000 // 30 seconds
const MAX_CONCURRENT_TRANSFORMS = 4

const SUPPORTED_EXTENSIONS = ['.jpe', '.xml', '.txt']

// ─── LRU Cache ───────────────────────────────────────────────────────────────

interface CacheEntry {
  xml: string
  errors: TransformError[]
  cachedAt: number
}

const transformCache = new LRUCache<string, CacheEntry>({
  max: 50,
  ttl: 1000 * 60 * 15, // 15 minutes
})

// ─── Concurrent process limiter ──────────────────────────────────────────────

let activeTransforms = 0
const transformQueue: Array<{
  resolve: (value: TransformResult) => void
  reject: (reason: Error) => void
  source: string
  fileName: string
}> = []

function processQueue(): void {
  while (transformQueue.length > 0 && activeTransforms < MAX_CONCURRENT_TRANSFORMS) {
    const item = transformQueue.shift()!
    activeTransforms++
    runTransform(item.source, item.fileName)
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        activeTransforms--
        processQueue()
      })
  }
}

interface TransformResult {
  xml: string
  errors: TransformError[]
  success: boolean
  duration: number
}

function runTransform(source: string, fileName: string): Promise<TransformResult> {
  return new Promise((resolve, reject) => {
    void (async () => {
      const startTime = Date.now()
      const tempDir = join(tmpdir(), `jpe-transform-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      const inputFile = join(tempDir, fileName)
      const outputFile = join(tempDir, 'output.xml')

      let proc: ChildProcess | null = null
      let killed = false

      // Create temp dir
      try {
        await mkdir(tempDir, { recursive: true })
      } catch (err) {
        reject(new Error(`Failed to create temp directory: ${err}`))
        return
      }

      try {
        // Write JPE source
        await writeFile(inputFile, source, 'utf-8')

        // Find Python executable
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3'
        const engineScript = join(process.cwd(), 'scripts', 'transform_jpe.py')

        const args = [engineScript, inputFile, '-o', outputFile]

        proc = spawn(pythonCmd, args, {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        })

        let _stdout = ''
        let stderr = ''

        const timer = setTimeout(() => {
          killed = true
          if (proc && !proc.killed) {
            proc.kill('SIGKILL')
          }
        }, TRANSFORM_TIMEOUT_MS)

        proc.stdout!.on('data', (data) => {
          _stdout += data.toString()
        })

        proc.stderr!.on('data', (data) => {
          stderr += data.toString()
        })

        proc.on('close', async (code) => {
          clearTimeout(timer)
          const _duration = Date.now() - startTime

          try {
            if (code === 0 && !killed) {
              try {
                const xml = await readFile(outputFile, 'utf-8')
                const errors = parsePythonErrors(stderr)

                // Performance log
                logPerformance({
                  duration: _duration,
                  inputSize: source.length,
                  outputSize: xml.length,
                  errorCount: errors.length,
                  exitCode: code ?? 1,
                })

                resolve({ xml, errors, success: true, duration: _duration })
              } catch {
                // Output file not found — treat as failure
                const errors = parsePythonErrors(stderr)
                errors.push({
                  message: 'Transformation completed but output file was not found',
                  severity: 'error',
                  code: 'OUTPUT_MISSING',
                })
                resolve({
                  xml: '<!-- Transformation completed but output file was not found -->',
                  errors,
                  success: false,
                  duration: _duration,
                })
              }
            } else {
              const errors = parsePythonErrors(stderr)
              if (killed) {
                errors.push({
                  message: `Process timed out after ${TRANSFORM_TIMEOUT_MS}ms`,
                  severity: 'error',
                  code: 'TIMEOUT',
                })
              }
              resolve({
                xml: `<!-- Transformation failed (exit code: ${code ?? 'unknown'}) -->`,
                errors,
                success: false,
                duration: _duration,
              })
            }
          } finally {
            // Cleanup temp files
            await cleanupTempFiles(tempDir, inputFile, outputFile)
          }
        })

        proc.on('error', async (err) => {
          const _duration = Date.now() - startTime
          reject(
            new Error(`Python process error: ${err.message}`)
          )
          await cleanupTempFiles(tempDir, inputFile, outputFile)
        })
      } catch (err) {
        const _duration = Date.now() - startTime
        reject(
          new Error(`Transform preparation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        )
        await cleanupTempFiles(tempDir, inputFile, outputFile).catch(() => {})
      }
    })()
  })
}

async function cleanupTempFiles(tempDir: string, inputFile: string, outputFile: string): Promise<void> {
  try {
    await unlink(inputFile).catch(() => {})
    await unlink(outputFile).catch(() => {})
    // Temp dir cleanup (best effort)
    const { rmdir } = await import('fs/promises')
    await rmdir(tempDir).catch(() => {})
  } catch {
    // Best effort cleanup — ignore failures
  }
}

// ─── Input Validation ────────────────────────────────────────────────────────

function validateInput(source: unknown, fileName: unknown): { valid: boolean; error?: string } {
  // Source must be a non-empty string
  if (typeof source !== 'string' || source.trim().length === 0) {
    return { valid: false, error: 'source is required and must be a non-empty string' }
  }

  // Size limit
  if (source.length > MAX_SOURCE_SIZE) {
    return {
      valid: false,
      error: `Source too large (${(source.length / 1024).toFixed(0)}KB). Maximum: ${(MAX_SOURCE_SIZE / 1024).toFixed(0)}KB`,
    }
  }

  // File extension validation
  if (typeof fileName === 'string' && fileName.trim().length > 0) {
    const ext = '.' + fileName.split('.').pop()?.toLowerCase()
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `Unsupported file extension: ${ext}. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`,
      }
    }
  }

  return { valid: true }
}

// ─── Input Sanitization ──────────────────────────────────────────────────────

function sanitizeInput(source: string): string {
  // Strip BOM
  if (source.charCodeAt(0) === 0xfeff) {
    source = source.slice(1)
  }
  // Normalize line endings
  source = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  return source
}

// ─── Error Parsing ───────────────────────────────────────────────────────────

function parsePythonErrors(stderr: string): TransformError[] {
  const errors: TransformError[] = []

  if (!stderr.trim()) return errors

  const lines = stderr.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Try to parse structured error patterns
    // Pattern: "Line 42: ERROR: message"
    const lineMatch = trimmed.match(/^Line\s+(\d+):\s*(.*?):\s*(.*)/i)
    if (lineMatch) {
      errors.push({
        message: lineMatch[3].trim(),
        line: parseInt(lineMatch[1], 10),
        severity: lineMatch[2].toLowerCase().includes('error') ? 'error' : 'warning',
      })
      continue
    }

    // Pattern: "ERROR: ..." or "WARNING: ..."
    const levelMatch = trimmed.match(/^(ERROR|WARNING|FATAL|INFO):\s*(.*)/i)
    if (levelMatch) {
      errors.push({
        message: levelMatch[2].trim(),
        severity: levelMatch[1].toLowerCase() === 'warning' ? 'warning' : 'error',
      })
      continue
    }

    // Pattern: "Line 42: message"
    const simpleLineMatch = trimmed.match(/^Line\s+(\d+):\s*(.*)/i)
    if (simpleLineMatch) {
      errors.push({
        message: simpleLineMatch[2].trim(),
        line: parseInt(simpleLineMatch[1], 10),
        severity: 'error',
      })
      continue
    }

    // Fallback: raw line
    if (trimmed.length > 0 && !trimmed.startsWith('Traceback') && !trimmed.startsWith('  File ')) {
      errors.push({
        message: trimmed,
        severity: 'error',
      })
    }
  }

  return errors
}

// ─── Performance Logging ─────────────────────────────────────────────────────

interface PerfData {
  duration: number
  inputSize: number
  outputSize: number
  errorCount: number
  exitCode: number
}

function logPerformance(data: PerfData): void {
  const isProd = process.env.NODE_ENV === 'production'
  const prefix = '[Transform API]'

  if (!isProd) {
    console.log(
      `${prefix} ${data.duration}ms | in:${data.inputSize}B out:${data.outputSize}B | errors:${data.errorCount} | exit:${data.exitCode}`
    )
  }
  // In production, this would log to analytics service
}

// ─── API Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source, fileName = 'input.jpe', force = false } = body

    // Subtask 2.1: Input validation
    const validation = validateInput(source, fileName)
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error,
          xml: null,
          errors: [{ message: validation.error, severity: 'error' as const }],
          success: false,
        },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedSource = sanitizeInput(source as string)
    const safeFileName = fileName as string

    // Check cache (skip if force=true)
    if (!force) {
      const cacheKey = createHash('sha256').update(sanitizedSource).digest('hex').slice(0, 16)
      const cached = transformCache.get(cacheKey)
      if (cached) {
        return NextResponse.json(
          {
            xml: cached.xml,
            errors: cached.errors,
            success: cached.errors.filter((e) => e.severity === 'error').length === 0,
            duration: 0,
            cacheHit: true,
          },
          {
            headers: { 'X-Cache': 'HIT' },
          }
        )
      }
    }

    // Queue the transform
    const result = await new Promise<TransformResult>((resolve, reject) => {
      transformQueue.push({ resolve, reject, source: sanitizedSource, fileName: safeFileName })
      processQueue()
    })

    // Cache the result
    const cacheKey = createHash('sha256').update(sanitizedSource).digest('hex').slice(0, 16)
    transformCache.set(cacheKey, {
      xml: result.xml,
      errors: result.errors,
      cachedAt: Date.now(),
    })

    return NextResponse.json(
      {
        xml: result.xml,
        errors: result.errors,
        success: result.success,
        duration: result.duration,
        mode: 'python',
        inputSize: sanitizedSource.length,
        outputSize: result.xml.length,
      },
      {
        headers: { 'X-Cache': 'MISS' },
      }
    )
  } catch (error) {
    console.error('[Transform API] Error:', error)
    const message = error instanceof Error ? error.message : 'Transformation failed'
    return NextResponse.json(
      {
        error: message,
        xml: '<!-- Transformation failed -->',
        errors: [{ message, severity: 'error' as const }],
        success: false,
      },
      { status: 500 }
    )
  }
}
