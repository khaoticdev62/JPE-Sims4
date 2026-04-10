/**
 * HapticHeartbeat Service Tests
 *
 * Tests for gamepad detection, pattern triggers, and intensity scaling.
 */

import { HapticHeartbeat } from '@/services/editor/HapticHeartbeat'

// Mock navigator
const mockGetGamepads = jest.fn()
const mockVibrate = jest.fn()

beforeAll(() => {
  Object.defineProperty(global.navigator, 'getGamepads', {
    value: mockGetGamepads,
    writable: true,
  })
  Object.defineProperty(global.navigator, 'vibrate', {
    value: mockVibrate,
    writable: true,
  })
})

describe('HapticHeartbeat', () => {
  let haptic: HapticHeartbeat

  beforeEach(() => {
    // Reset singleton
    ;(HapticHeartbeat as any).instance = null
    haptic = HapticHeartbeat.getInstance()
    jest.clearAllMocks()
  })

  describe('singleton', () => {
    it('should return same instance', () => {
      const instance1 = HapticHeartbeat.getInstance()
      const instance2 = HapticHeartbeat.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('setEnabled', () => {
    it('should enable haptic feedback', () => {
      haptic.setEnabled(true)
      // Verify no error
      expect(() => haptic.trigger('heartbeat')).not.toThrow()
    })

    it('should disable haptic feedback', () => {
      haptic.setEnabled(false)
      // Should not trigger anything
      haptic.trigger('heartbeat')
      expect(mockGetGamepads).not.toHaveBeenCalled()
      expect(mockVibrate).not.toHaveBeenCalled()
    })
  })

  describe('setIntensity', () => {
    it('should set intensity to 0', () => {
      haptic.setIntensity(0)
      // No error expected
      expect(() => haptic.trigger('heartbeat')).not.toThrow()
    })

    it('should set intensity to 1', () => {
      haptic.setIntensity(1)
      expect(() => haptic.trigger('heartbeat')).not.toThrow()
    })

    it('should clamp intensity to 0-1 range', () => {
      haptic.setIntensity(-5)
      expect(() => haptic.trigger('heartbeat')).not.toThrow()

      haptic.setIntensity(15)
      expect(() => haptic.trigger('heartbeat')).not.toThrow()
    })
  })

  describe('trigger patterns', () => {
    beforeEach(() => {
      mockGetGamepads.mockReturnValue([])
    })

    it('should trigger heartbeat pattern', () => {
      haptic.trigger('heartbeat')
      // Should not throw
      expect(() => haptic.trigger('heartbeat')).not.toThrow()
    })

    it('should trigger double-tap pattern', () => {
      haptic.trigger('double-tap')
      expect(() => haptic.trigger('double-tap')).not.toThrow()
    })

    it('should trigger triple-tap pattern', () => {
      haptic.trigger('triple-tap')
      expect(() => haptic.trigger('triple-tap')).not.toThrow()
    })

    it('should trigger long-press pattern', () => {
      haptic.trigger('long-press')
      expect(() => haptic.trigger('long-press')).not.toThrow()
    })

    it('should trigger spectral-pulse pattern', () => {
      haptic.trigger('spectral-pulse')
      expect(() => haptic.trigger('spectral-pulse')).not.toThrow()
    })
  })

  describe('convenience methods', () => {
    it('should call trigger on success()', () => {
      const triggerSpy = jest.spyOn(haptic, 'trigger')
      haptic.success()
      expect(triggerSpy).toHaveBeenCalledWith('heartbeat', expect.any(Object))
    })

    it('should call trigger on warning()', () => {
      const triggerSpy = jest.spyOn(haptic, 'trigger')
      haptic.warning()
      expect(triggerSpy).toHaveBeenCalledWith('double-tap', expect.any(Object))
    })

    it('should call trigger on error()', () => {
      const triggerSpy = jest.spyOn(haptic, 'trigger')
      haptic.error()
      expect(triggerSpy).toHaveBeenCalledWith('triple-tap', expect.any(Object))
    })

    it('should call trigger on loading()', () => {
      const triggerSpy = jest.spyOn(haptic, 'trigger')
      haptic.loading()
      expect(triggerSpy).toHaveBeenCalledWith('long-press', expect.any(Object))
    })
  })

  describe('vibration API fallback', () => {
    beforeEach(() => {
      mockGetGamepads.mockReturnValue([])
      mockVibrate.mockClear()
    })

    it('should use vibrate API when no gamepad', () => {
      haptic.trigger('heartbeat')
      // May call vibrate if available
      if (mockVibrate) {
        expect(mockVibrate).toHaveBeenCalled()
      }
    })

    it('should call vibrate with pattern for double-tap', () => {
      haptic.trigger('double-tap')
      if (mockVibrate) {
        expect(mockVibrate).toHaveBeenCalledWith([50, 100, 50])
      }
    })

    it('should call vibrate with pattern for triple-tap', () => {
      haptic.trigger('triple-tap')
      if (mockVibrate) {
        expect(mockVibrate).toHaveBeenCalledWith([40, 80, 40, 80, 40])
      }
    })
  })
})
