/**
 * PythonEngineService — Python runtime discovery, health checks, and process management.
 *
 * Handles:
 * - Python executable discovery across platforms
 * - Version detection and minimum version validation
 * - Engine readiness check (import TranslationEngine)
 * - Process spawning with timeout and cleanup
 * - Concurrent process pool management
 *
 * Note: This is separate from PythonService which handles .ts4script decompilation.
 */

import { execSync } from 'child_process'
import { spawn, ChildProcess } from 'child_process'
import type { PythonStatus, PythonProcessResult } from '@/types/python-engine'

// ─── Configuration ───────────────────────────────────────────────────────────

const MIN_PYTHON_MAJOR = 3
const MIN_PYTHON_MINOR = 10
const DEFAULT_TIMEOUT_MS = 30_000
const MAX_CONCURRENT_PROCESSES = 4

const REQUIRED_DEPENDENCIES = [
  'pydantic',
  'lxml',
] as const

/** Platform-specific Python command candidates (tried in order) */
const PYTHON_COMMANDS: Record<string, string[]> = {
  win32: ['python', 'py', 'python3'],
  darwin: ['python3', 'python'],
  linux: ['python3', 'python'],
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface PythonVersion {
  major: number
  minor: number
  patch: number
  raw: string
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class PythonEngineService {
  private static instance: PythonEngineService | null = null

  private _cachedStatus: PythonStatus | null = null
  private _cachedAt = 0
  private _statusCacheTtlMs = 30_000

  private _activeProcesses = new Set<ChildProcess>()

  private constructor() {}

  static getInstance(): PythonEngineService {
    if (!this.instance) {
      this.instance = new PythonEngineService()
    }
    return this.instance
  }

  /** Reset singleton (for testing) */
  static reset(): void {
    if (this.instance) {
      try {
        this.instance._activeProcesses.forEach((p) => {
          try {
            if (!p.killed) p.kill('SIGKILL')
          } catch {
            // Process may already be dead
          }
        })
      } catch {
        // Ignore cleanup errors during reset
      }
      this.instance._activeProcesses.clear()
      this.instance._cachedStatus = null
      this.instance._cachedAt = 0
      this.instance = null
    }
  }

  // ─── Python Discovery ────────────────────────────────────────────────────

  /**
   * Discover the Python executable on this system.
   * Tries platform-specific commands in order.
   */
  findPython(): string | null {
    const platform = process.platform as keyof typeof PYTHON_COMMANDS
    const candidates = PYTHON_COMMANDS[platform] ?? PYTHON_COMMANDS.linux

    for (const cmd of candidates) {
      try {
        execSync(`${cmd} --version`, { stdio: 'ignore', timeout: 5000 })
        return cmd
      } catch {
        // Not available, try next
      }
    }
    return null
  }

  /**
   * Parse Python version string from `python --version` output.
   * E.g. "Python 3.11.4" → { major: 3, minor: 11, patch: 4, raw: "3.11.4" }
   */
  parseVersion(raw: string): PythonVersion | null {
    const match = raw.match(/Python\s+(\d+)\.(\d+)\.(\d+)/i)
    if (!match) return null
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      raw: `${match[1]}.${match[2]}.${match[3]}`,
    }
  }

  /**
   * Check if a parsed version meets the minimum requirement.
   */
  isVersionSufficient(version: PythonVersion | null): boolean {
    if (!version) return false
    if (version.major > MIN_PYTHON_MAJOR) return true
    if (version.major === MIN_PYTHON_MAJOR && version.minor >= MIN_PYTHON_MINOR) return true
    return false
  }

  // ─── Health Checks ───────────────────────────────────────────────────────

  /**
   * Subtask 1.1: Full Python health check — discovery, version, minimum check.
   */
  async healthCheck(): Promise<PythonStatus> {
    const pythonCmd = this.findPython()

    if (!pythonCmd) {
      return {
        available: false,
        version: null,
        pythonPath: null,
        engineReady: false,
        engineErrors: [
          'Python not found. Install Python 3.10+ to use transformation features.',
        ],
        dependencies: REQUIRED_DEPENDENCIES.map((d) => ({
          name: d,
          installed: false,
        })),
      }
    }

    // Get version
    let versionRaw: string
    try {
      versionRaw = execSync(`${pythonCmd} --version`, { encoding: 'utf-8', timeout: 5000 }).trim()
    } catch {
      return {
        available: false,
        version: null,
        pythonPath: pythonCmd,
        engineReady: false,
        engineErrors: ['Failed to execute python --version'],
        dependencies: REQUIRED_DEPENDENCIES.map((d) => ({
          name: d,
          installed: false,
        })),
      }
    }

    const version = this.parseVersion(versionRaw)
    const versionOk = this.isVersionSufficient(version)

    if (!versionOk) {
      return {
        available: true,
        version: version?.raw ?? versionRaw,
        pythonPath: pythonCmd,
        engineReady: false,
        engineErrors: [
          `Python ${version?.raw ?? 'unknown'} is too old. Minimum required: ${MIN_PYTHON_MAJOR}.${MIN_PYTHON_MINOR}.`,
        ],
        dependencies: REQUIRED_DEPENDENCIES.map((d) => ({
          name: d,
          installed: false,
        })),
      }
    }

    // Check dependencies
    const deps = await this.checkDependencies(pythonCmd)

    return {
      available: true,
      version: version?.raw ?? null,
      pythonPath: pythonCmd,
      engineReady: false, // engineHealthCheck() sets this
      engineErrors: [],
      dependencies: deps,
    }
  }

  /**
   * Subtask 1.2: Engine health check — can we import TranslationEngine?
   */
  async engineHealthCheck(baseStatus?: PythonStatus): Promise<PythonStatus> {
    const status = baseStatus ?? (await this.healthCheck())

    if (!status.available) {
      return status
    }

    const pythonCmd = status.pythonPath!

    // Test importing the engine
    const script = `
import sys
sys.path.insert(0, '${process.cwd().replace(/\\/g, '/')}')
try:
    from engine.engine import TranslationEngine
    from engine.ir import ProjectIR
    print("ENGINE_OK")
except ImportError as e:
    print(f"ENGINE_ERROR: {e}")
except Exception as e:
    print(f"ENGINE_ERROR: {e}")
`.trim()

    try {
      const result = await this.spawnProcess(pythonCmd, ['-c', script], 10_000)

      if (result.stdout.trim() === 'ENGINE_OK' && result.exitCode === 0) {
        status.engineReady = true
        status.engineErrors = []
      } else {
        const error = result.stderr.trim() || result.stdout.trim() || 'Unknown engine import error'
        status.engineReady = false
        status.engineErrors = [`Engine import failed: ${error}`]
      }
    } catch (err) {
      status.engineReady = false
      status.engineErrors = [
        `Engine health check failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      ]
    }

    return status
  }

  /**
   * Check if required Python packages are installed.
   */
  async checkDependencies(pythonCmd: string): Promise<Array<{ name: string; installed: boolean }>> {
    const results: Array<{ name: string; installed: boolean }> = []

    for (const dep of REQUIRED_DEPENDENCIES) {
      try {
        const result = await this.spawnProcess(pythonCmd, ['-c', `import ${dep}`], 5000)
        results.push({ name: dep, installed: result.exitCode === 0 })
      } catch {
        results.push({ name: dep, installed: false })
      }
    }

    return results
  }

  // ─── Process Management ──────────────────────────────────────────────────

  /**
   * Spawn a Python process with timeout, tracking, and cleanup.
   */
  spawnProcess(
    command: string,
    args: string[],
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<PythonProcessResult> {
    return new Promise((resolve, reject) => {
      // Check concurrent limit
      if (this._activeProcesses.size >= MAX_CONCURRENT_PROCESSES) {
        reject(
          new Error(
            `Maximum concurrent Python processes (${MAX_CONCURRENT_PROCESSES}) reached. Try again later.`
          )
        )
        return
      }

      const proc = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      })

      this._activeProcesses.add(proc)

      let stdout = ''
      let stderr = ''
      let killed = false

      const timer = setTimeout(() => {
        killed = true
        proc.kill('SIGKILL')
        this._activeProcesses.delete(proc)
        reject(new Error(`Python process timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      proc.on('close', (code) => {
        clearTimeout(timer)
        this._activeProcesses.delete(proc)
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 1,
          duration: 0, // caller can measure externally
          killed,
        })
      })

      proc.on('error', (err) => {
        clearTimeout(timer)
        this._activeProcesses.delete(proc)
        reject(err)
      })
    })
  }

  /**
   * Kill all active Python processes.
   */
  killAll(): void {
    this._activeProcesses.forEach((p) => {
      try {
        if (!p.killed) p.kill('SIGKILL')
      } catch {
        // Process may already be dead
      }
    })
    this._activeProcesses.clear()
  }

  /**
   * Get the number of currently active Python processes.
   */
  get activeProcessCount(): number {
    return this._activeProcesses.size
  }

  // ─── Cached Status ────────────────────────────────────────────────────────

  /**
   * Get full status with caching (avoids repeated engine import checks).
   */
  async getCachedStatus(): Promise<PythonStatus> {
    const now = Date.now()
    if (this._cachedStatus && now - this._cachedAt < this._statusCacheTtlMs) {
      return this._cachedStatus
    }

    const status = await this.engineHealthCheck()
    this._cachedStatus = status
    this._cachedAt = now
    return status
  }

  /**
   * Clear the cached status.
   */
  clearCache(): void {
    this._cachedStatus = null
    this._cachedAt = 0
  }
}

// ─── Export singleton factory ─────────────────────────────────────────────────

export function getPythonEngineService(): PythonEngineService {
  return PythonEngineService.getInstance()
}
