import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GamepadService } from './GamepadService'

describe('GamepadService', () => {
  let service: GamepadService
  
  beforeEach(() => {
    // Reset singleton instance (if possible, or just get it)
    // Since it's a singleton, we might need to rely on state reset
    service = GamepadService.getInstance()
    service.stop()
    
    // Mock navigator.getGamepads
    global.navigator.getGamepads = vi.fn(() => [])
  })

  afterEach(() => {
    service.stop()
    vi.restoreAllMocks()
  })

  it('should be a singleton', () => {
    const service2 = GamepadService.getInstance()
    expect(service).toBe(service2)
  })

  it('should start and stop polling', () => {
    const setIntervalSpy = vi.spyOn(window, 'setInterval')
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')

    service.start()
    expect(setIntervalSpy).toHaveBeenCalled()
    expect(global.navigator.getGamepads).not.toHaveBeenCalled() // Only called inside interval

    service.stop()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('should emit events on button press', () => {
    vi.useFakeTimers()
    service.start()

    const buttonListener = vi.fn()
    service.on('button_down_0', buttonListener)

    // Mock first poll: Button 0 pressed
    const gamepads = [
      {
        buttons: [{ pressed: true }],
        axes: []
      }
    ] as any
    (global.navigator.getGamepads as any).mockReturnValue(gamepads)

    // Advance timer to trigger poll
    vi.advanceTimersByTime(16)

    expect(buttonListener).toHaveBeenCalledWith({ gamepad: 0, button: 0 })

    vi.useRealTimers()
  })
})
