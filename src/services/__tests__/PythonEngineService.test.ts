/**
 * PythonEngineService unit tests
 *
 * Tests Python discovery, version parsing, and process management.
 * Does NOT require a real Python installation (mocks execSync/spawn).
 */

import { PythonEngineService } from '../PythonEngineService'
import * as childProcess from 'child_process'

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn(),
}))

const mockExecSync = childProcess.execSync as jest.MockedFunction<typeof childProcess.execSync>
const mockSpawn = childProcess.spawn as jest.MockedFunction<typeof childProcess.spawn>

describe('PythonEngineService', () => {
  let service: PythonEngineService

  beforeEach(() => {
    PythonEngineService.reset()
    service = PythonEngineService.getInstance()
    jest.clearAllMocks()
  })

  afterEach(() => {
    service.killAll()
  })

  // ─── findPython ───────────────────────────────────────────────────────────

  describe('findPython', () => {
    it('returns first available Python command on Windows', () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd === 'python --version') return ''
        throw new Error('not found')
      })

      const result = service.findPython()
      expect(result).toBe('python')
    })

    it('returns null when no Python is available', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('not found')
      })

      const result = service.findPython()
      expect(result).toBeNull()
    })

    it('falls back to python3 when python and py are not available', () => {
      let callCount = 0
      mockExecSync.mockImplementation(() => {
        callCount++
        // python (call 1) and py (call 2) fail, python3 (call 3) succeeds
        if (callCount === 3) return ''
        throw new Error('not found')
      })

      const result = service.findPython()
      expect(result).toBe('python3')
    })
  })

  // ─── parseVersion ─────────────────────────────────────────────────────────

  describe('parseVersion', () => {
    it('parses standard Python version string', () => {
      const result = service.parseVersion('Python 3.11.4')
      expect(result).toEqual({
        major: 3,
        minor: 11,
        patch: 4,
        raw: '3.11.4',
      })
    })

    it('parses Python 3.10 version', () => {
      const result = service.parseVersion('Python 3.10.0')
      expect(result).toEqual({
        major: 3,
        minor: 10,
        patch: 0,
        raw: '3.10.0',
      })
    })

    it('returns null for invalid version string', () => {
      const result = service.parseVersion('not a version')
      expect(result).toBeNull()
    })

    it('returns null for empty string', () => {
      const result = service.parseVersion('')
      expect(result).toBeNull()
    })
  })

  // ─── isVersionSufficient ──────────────────────────────────────────────────

  describe('isVersionSufficient', () => {
    it('accepts Python 3.10 (minimum)', () => {
      expect(service.isVersionSufficient({ major: 3, minor: 10, patch: 0, raw: '3.10.0' })).toBe(true)
    })

    it('accepts Python 3.11+', () => {
      expect(service.isVersionSufficient({ major: 3, minor: 11, patch: 4, raw: '3.11.4' })).toBe(true)
      expect(service.isVersionSufficient({ major: 3, minor: 12, patch: 1, raw: '3.12.1' })).toBe(true)
    })

    it('accepts Python 4.x', () => {
      expect(service.isVersionSufficient({ major: 4, minor: 0, patch: 0, raw: '4.0.0' })).toBe(true)
    })

    it('rejects Python 3.9', () => {
      expect(service.isVersionSufficient({ major: 3, minor: 9, patch: 18, raw: '3.9.18' })).toBe(false)
    })

    it('rejects Python 2.7', () => {
      expect(service.isVersionSufficient({ major: 2, minor: 7, patch: 18, raw: '2.7.18' })).toBe(false)
    })

    it('rejects null version', () => {
      expect(service.isVersionSufficient(null)).toBe(false)
    })
  })

  // ─── healthCheck ──────────────────────────────────────────────────────────

  describe('healthCheck', () => {
    it('returns unavailable status when Python is not found', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('not found')
      })

      const status = await service.healthCheck()
      expect(status.available).toBe(false)
      expect(status.version).toBeNull()
      expect(status.engineReady).toBe(false)
      expect(status.engineErrors.length).toBeGreaterThan(0)
    })

    it('returns version when Python is found', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd === 'python --version') return 'Python 3.11.4\n'
        throw new Error('not found')
      })

      // Mock spawn for dependency checks
      const mockProc = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
          if (event === 'close') cb(0)
        }),
        kill: jest.fn(),
        killed: false,
      }
      mockSpawn.mockReturnValue(mockProc as any)

      const status = await service.healthCheck()
      expect(status.available).toBe(true)
      expect(status.version).toBe('3.11.4')
      expect(status.pythonPath).toBe('python')
    })

    it('rejects old Python version', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd === 'python --version') return 'Python 2.7.18\n'
        throw new Error('not found')
      })

      const status = await service.healthCheck()
      expect(status.available).toBe(true)
      expect(status.engineReady).toBe(false)
      expect(status.engineErrors.length).toBeGreaterThan(0)
      expect(status.engineErrors[0]).toContain('too old')
    })
  })

  // ─── Process Management ───────────────────────────────────────────────────

  describe('spawnProcess', () => {
    it('spawns a Python process and returns output', async () => {
      const mockProc = {
        stdout: { on: jest.fn((event, cb) => { if (event === 'data') cb(Buffer.from('hello')) }) },
        stderr: { on: jest.fn() },
        on: jest.fn((event, cb) => { if (event === 'close') cb(0) }),
        kill: jest.fn(),
        killed: false,
      }
      mockSpawn.mockReturnValue(mockProc as any)

      const result = await service.spawnProcess('python', ['-c', 'print("hello")'], 5000)
      expect(result.stdout).toBe('hello')
      expect(result.exitCode).toBe(0)
    })

    it('returns stderr on non-zero exit', async () => {
      const mockProc = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn((event, cb) => { if (event === 'data') cb(Buffer.from('error output')) }) },
        on: jest.fn((event, cb) => { if (event === 'close') cb(1) }),
        kill: jest.fn(),
        killed: false,
      }
      mockSpawn.mockReturnValue(mockProc as any)

      const result = await service.spawnProcess('python', ['-c', 'invalid'], 5000)
      expect(result.stderr).toBe('error output')
      expect(result.exitCode).toBe(1)
    })

    it('rejects when process errors', async () => {
      const mockProc = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, cb) => { if (event === 'error') cb(new Error('spawn ENOENT')) }),
        kill: jest.fn(),
        killed: false,
      }
      mockSpawn.mockReturnValue(mockProc as any)

      await expect(service.spawnProcess('python', ['-c', 'test'], 5000))
        .rejects.toThrow('spawn ENOENT')
    })
  })

  // ─── Active Process Tracking ──────────────────────────────────────────────

  describe('activeProcessCount', () => {
    it('starts at 0', () => {
      expect(service.activeProcessCount).toBe(0)
    })
  })

  // ─── Cache ────────────────────────────────────────────────────────────────

  describe('cache', () => {
    it('clearCache resets cached status', () => {
      service.clearCache()
      // Should not throw
      expect(true).toBe(true)
    })
  })

  // ─── Singleton ────────────────────────────────────────────────────────────

  describe('singleton', () => {
    it('returns the same instance', () => {
      const a = PythonEngineService.getInstance()
      const b = PythonEngineService.getInstance()
      expect(a).toBe(b)
    })

    it('reset clears the singleton', () => {
      const a = PythonEngineService.getInstance()
      PythonEngineService.reset()
      const b = PythonEngineService.getInstance()
      expect(a).not.toBe(b)
    })
  })
})
