/**
 * HapticHeartbeat Service
 *
 * Provides tactile feedback via Gamepad API, Steam Input, and vibration patterns.
 * Used for background telemetry, compile completion, and error notifications.
 *
 * Supported platforms:
 * - Steam Deck (via Gamepad API)
 * - Game Controllers (Xbox/PS via Gamepad API)
 * - Mobile devices (via Vibration API)
 * - Desktop (fallback to visual pulse)
 */

export type HapticPattern =
  | 'heartbeat'      // Single pulse: compile complete
  | 'double-tap'     // Two pulses: warning
  | 'triple-tap'     // Three pulses: error
  | 'long-press'     // Sustained: loading
  | 'spectral-pulse' // Custom: bioluminescent sync

export interface HapticConfig {
  pattern: HapticPattern
  intensity: number  // 0.0 - 1.0
  duration: number   // ms
}

/**
 * HapticHeartbeat Service
 */
export class HapticHeartbeat {
  private static instance: HapticHeartbeat | null = null
  private gamepadIndex: number | null = null
  private isEnabled: boolean = true
  private intensity: number = 0.5

  private constructor() {
    this.detectGamepad()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): HapticHeartbeat {
    if (!this.instance) {
      this.instance = new HapticHeartbeat()
    }
    return this.instance
  }

  /**
   * Detect connected gamepads
   */
  private detectGamepad(): void {
    if (typeof navigator === 'undefined') return

    const gamepads = navigator.getGamepads?.() || []
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.gamepadIndex = i
        console.log(`[HapticHeartbeat] Gamepad detected: ${gamepads[i]?.id}`)
        break
      }
    }
  }

  /**
   * Enable/disable haptic feedback
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  /**
   * Set haptic intensity (0.0 - 1.0)
   */
  setIntensity(value: number): void {
    this.intensity = Math.max(0, Math.min(1, value))
  }

  /**
   * Trigger a haptic pattern
   */
  trigger(pattern: HapticPattern = 'heartbeat', config?: Partial<HapticConfig>): void {
    if (!this.isEnabled) return

    const finalConfig: HapticConfig = {
      pattern,
      intensity: this.intensity,
      duration: 100,
      ...config,
    }

    // Try Gamepad API first (Steam Deck, controllers)
    if (this.gamepadIndex !== null) {
      this.triggerGamepadHaptic(finalConfig)
      return
    }

    // Fallback to Vibration API (mobile)
    if (typeof navigator.vibrate === 'function') {
      this.triggerVibration(finalConfig)
      return
    }

    // Desktop fallback: console log for debugging
    console.log(`[HapticHeartbeat] ${pattern} (intensity: ${finalConfig.intensity})`)
  }

  /**
   * Trigger gamepad haptic feedback (dual-rumble)
   */
  private triggerGamepadHaptic(config: HapticConfig): void {
    const gamepads = navigator.getGamepads()
    const gamepad = gamepads[this.gamepadIndex!]
    if (!gamepad) return

    const actuators = (gamepad as any).hapticActuators
    if (!actuators || actuators.length === 0) return

    // Use first actuator (typically left motor for low-frequency rumble)
    const actuator = actuators[0]

    switch (config.pattern) {
      case 'heartbeat':
        actuator.playEffect?.('dual-rumble', {
          startDelay: 0,
          duration: config.duration,
          weakMagnitude: config.intensity,
          strongMagnitude: config.intensity * 0.5,
        })
        break

      case 'double-tap':
        actuator.playEffect?.('dual-rumble', {
          startDelay: 0,
          duration: 50,
          weakMagnitude: config.intensity,
          strongMagnitude: config.intensity,
        })
        setTimeout(() => {
          actuator.playEffect?.('dual-rumble', {
            startDelay: 0,
            duration: 50,
            weakMagnitude: config.intensity,
            strongMagnitude: config.intensity,
          })
        }, 100)
        break

      case 'triple-tap':
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            actuator.playEffect?.('dual-rumble', {
              startDelay: 0,
              duration: 40,
              weakMagnitude: config.intensity,
              strongMagnitude: config.intensity,
            })
          }, i * 80)
        }
        break

      case 'long-press':
        actuator.playEffect?.('dual-rumble', {
          startDelay: 0,
          duration: config.duration * 3,
          weakMagnitude: config.intensity * 0.7,
          strongMagnitude: config.intensity * 0.3,
        })
        break

      case 'spectral-pulse':
        // Rising intensity pulse
        actuator.playEffect?.('dual-rumble', {
          startDelay: 0,
          duration: 200,
          weakMagnitude: 0,
          strongMagnitude: 0,
        })
        break
    }
  }

  /**
   * Trigger vibration API (mobile fallback)
   */
  private triggerVibration(config: HapticConfig): void {
    switch (config.pattern) {
      case 'heartbeat':
        navigator.vibrate(config.duration)
        break

      case 'double-tap':
        navigator.vibrate([50, 100, 50])
        break

      case 'triple-tap':
        navigator.vibrate([40, 80, 40, 80, 40])
        break

      case 'long-press':
        navigator.vibrate(config.duration * 3)
        break

      case 'spectral-pulse':
        navigator.vibrate([30, 50, 60, 50, 90])
        break
    }
  }

  /**
   * Convenience: Success heartbeat
   */
  success(): void {
    this.trigger('heartbeat', { intensity: this.intensity, duration: 80 })
  }

  /**
   * Convenience: Warning alert
   */
  warning(): void {
    this.trigger('double-tap', { intensity: this.intensity * 0.7 })
  }

  /**
   * Convenience: Error alert
   */
  error(): void {
    this.trigger('triple-tap', { intensity: this.intensity })
  }

  /**
   * Convenience: Loading indicator
   */
  loading(): void {
    this.trigger('long-press', { duration: 200 })
  }
}
