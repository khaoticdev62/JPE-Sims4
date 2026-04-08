/**
 * Python Engine Integration Tests
 *
 * Tests that run against the REAL Python engine (no mocks).
 * Skipped gracefully if Python is not available.
 *
 * Run: npm test -- --testPathPattern="python-engine.integration"
 *
 * @jest-environment node
 */

import { PythonEngineService } from '../../PythonEngineService'

/**
 * Check if Python is available before running tests.
 * Returns true if Python 3.10+ is found on this system.
 */
function isPythonAvailable(): boolean {
  try {
    const { execSync } = require('child_process')
    const output = execSync('python --version 2>&1 || python3 --version 2>&1 || py --version 2>&1', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000,
    })
    const match = output.match(/Python\s+(\d+)\.(\d+)/i)
    if (!match) return false
    const major = parseInt(match[1], 10)
    const minor = parseInt(match[2], 10)
    return major > 3 || (major === 3 && minor >= 10)
  } catch {
    return false
  }
}

const pythonAvailable = isPythonAvailable()
const runIf = (condition: boolean) => (condition ? describe : describe.skip)

runIf(pythonAvailable)('Python Engine Integration', () => {
  let service: PythonEngineService

  beforeAll(() => {
    PythonEngineService.reset()
    service = PythonEngineService.getInstance()
  })

  afterAll(() => {
    service.killAll()
    PythonEngineService.reset()
  })

  // ─── Subtask 6.1: Engine Health Check Tests ────────────────────────────

  describe('healthCheck', () => {
    it('detects Python and reports version', async () => {
      const status = await service.healthCheck()
      expect(status.available).toBe(true)
      expect(status.version).not.toBeNull()
      expect(status.pythonPath).not.toBeNull()
      expect(status.version).toMatch(/^\d+\.\d+\.\d+$/)
    })

    it('reports Python 3.10+ as sufficient', async () => {
      const status = await service.healthCheck()
      expect(status.available).toBe(true)
      // If we got here, Python 3.10+ was found (isPythonAvailable check)
      expect(status.engineErrors).toEqual([])
    })

    it('checks dependencies', async () => {
      const status = await service.healthCheck()
      expect(status.dependencies).toBeDefined()
      expect(status.dependencies.length).toBeGreaterThan(0)
      expect(status.dependencies[0]).toHaveProperty('name')
      expect(status.dependencies[0]).toHaveProperty('installed')
    })
  })

  describe('engineHealthCheck', () => {
    it('checks if TranslationEngine can be imported', async () => {
      const status = await service.engineHealthCheck()
      // engineReady depends on whether engine package is importable
      expect(status.available).toBe(true)
      // engineReady may be true or false depending on installation
      expect(typeof status.engineReady).toBe('boolean')
    })

    it('returns error messages if engine is not ready', async () => {
      const status = await service.engineHealthCheck()
      if (!status.engineReady) {
        expect(status.engineErrors.length).toBeGreaterThan(0)
      } else {
        expect(status.engineErrors).toEqual([])
      }
    })
  })

  // ─── Process Management ─────────────────────────────────────────────────

  describe('spawnProcess', () => {
    it('executes a simple Python command', async () => {
      const result = await service.spawnProcess(
        process.platform === 'win32' ? 'python' : 'python3',
        ['-c', 'print("hello from python")'],
        10_000
      )
      expect(result.stdout).toContain('hello from python')
      expect(result.exitCode).toBe(0)
      expect(result.killed).toBe(false)
    })

    it('captures stderr on Python errors', async () => {
      const result = await service.spawnProcess(
        process.platform === 'win32' ? 'python' : 'python3',
        ['-c', 'import sys; print("error", file=sys.stderr)'],
        10_000
      )
      expect(result.stderr).toContain('error')
    })

    it('respects timeout', async () => {
      await expect(
        service.spawnProcess(
          process.platform === 'win32' ? 'python' : 'python3',
          ['-c', 'import time; time.sleep(10)'],
          1000 // 1 second timeout
        )
      ).rejects.toThrow(/timed out/i)
    })

    it('tracks active process count', async () => {
      const countBefore = service.activeProcessCount

      const promise = service.spawnProcess(
        process.platform === 'win32' ? 'python' : 'python3',
        ['-c', 'import time; time.sleep(0.5)'],
        5000
      )

      // Process should be running
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(service.activeProcessCount).toBe(countBefore + 1)

      await promise
      expect(service.activeProcessCount).toBe(countBefore)
    })
  })

  // ─── Cached Status ──────────────────────────────────────────────────────

  describe('cachedStatus', () => {
    it('caches the status for subsequent calls', async () => {
      service.clearCache()
      const status1 = await service.getCachedStatus()
      const status2 = await service.getCachedStatus()
      // Should be the same object reference (cached)
      expect(status1).toBe(status2)
    })

    it('clears cache and fetches fresh status', async () => {
      const status1 = await service.getCachedStatus()
      service.clearCache()
      const status2 = await service.getCachedStatus()
      // Should be a new object
      expect(status1).not.toBe(status2)
    })
  })
})

runIf(!pythonAvailable)('Python Engine Integration (skipped — Python not available)', () => {
  it('skips all tests when Python is not available', () => {
    // This test always passes — it just confirms we skipped
    expect(true).toBe(true)
  })
})
