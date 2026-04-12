/**
 * SensoryService - Renderer-side interface for "Living Brand" sensory feedback.
 * Maps high-level IDE events to low-latency IPC triggers for Audio, Haptics, and Bioluminescence.
 */

export enum SensoryEvent {
  CODE_SCRUB = 'code-scrub',
  SUCCESS_SAVE = 'success-save',
  ERROR_FAIL = 'error-fail',
  ENGINE_LINK = 'engine-link',
  LINK_SEVERED = 'link-severed',
  HISTORY_STEP = 'history-step',
}

class SensoryService {
  /**
   * Trigger a sensory event with optional metadata
   * @param event The type of sensory feedback to produce
   * @param data Optional payload (e.g. intensity, position)
   */
  public trigger(event: SensoryEvent, data?: unknown): void {
    if (window.electron && window.electron.sensory) {
      window.electron.sensory.trigger(event, data)
    } else {
      console.warn(`[SensoryService] Electron sensory IPC not available for event: ${event}`)
    }
  }

  /**
   * Shorthand for code scrubbing (pulsing cursor/bloom)
   */
  public onCodeScrub(intensity: number = 0.5): void {
    this.trigger(SensoryEvent.CODE_SCRUB, { intensity })
  }

  /**
   * Shorthand for successful operations (Teal bloom + Chord)
   */
  public onSuccess(): void {
    this.trigger(SensoryEvent.SUCCESS_SAVE)
  }

  /**
   * Shorthand for failed operations (Red pulse + Dissonance)
   */
  public onError(message?: string): void {
    this.trigger(SensoryEvent.ERROR_FAIL, { message })
  }

  /**
   * Updates the engine connection status sensory layer
   */
  public onLinkUpdate(connected: boolean): void {
    this.trigger(connected ? SensoryEvent.ENGINE_LINK : SensoryEvent.LINK_SEVERED)
  }

  /**
   * Shorthand for "Spectral Pulse" on undo/redo
   */
  public onHistoryStep(): void {
    this.trigger(SensoryEvent.HISTORY_STEP, { intensity: 0.8, color: 'spectral' })
  }
}

export const sensoryService = new SensoryService()
