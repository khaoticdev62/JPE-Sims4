/**
 * JPE Studio — SensoryService (Epic 10)
 * Reactive audio and haptic feedback engine for the "Living Brand" experience.
 */

interface WebkitWindow extends Window {
  webkitAudioContext: typeof AudioContext;
}

interface VibrationActuator {
  playEffect(type: "dual-rumble", options: {
    startDelay: number;
    duration: number;
    weakMagnitude: number;
    strongMagnitude: number;
  }): Promise<void>;
}

// Using global ElectronIPC from types/electron.d.ts for IPC-based sensory triggers

class SensoryService {
  private static instance: SensoryService;
  private audioCtx: AudioContext | null = null;
  private masterVolume: number = 0.5;

  private constructor() {}

  public static getInstance(): SensoryService {
    if (!SensoryService.instance) {
      SensoryService.instance = new SensoryService();
    }
    return SensoryService.instance;
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
  }

  public setMasterVolume(value: number) {
    this.masterVolume = Math.max(0, Math.min(1, value));
  }

  /**
   * Play a synthesized "Spectral Success Chord"
   */
  public triggerSuccess() {
    this.initAudio();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 (Spectral Major)
    
    frequencies.forEach((freq, i) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1 * this.masterVolume, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5 + i * 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx!.destination);

      osc.start(now);
      osc.stop(now + 2);
    });

    this.triggerHaptic(50, 0.4);
  }

  /**
   * Play a low-frequency alert pulse
   */
  public triggerAlert(severity: "warn" | "error" | "critical") {
    this.initAudio();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const freq = severity === "critical" ? 80 : severity === "error" ? 120 : 180;
    
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2 * this.masterVolume, now + 0.05);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.3);

    this.triggerHaptic(200, severity === "critical" ? 0.8 : 0.4);
  }

  /**
   * Play a high-frequency "Audio Scrub" for data ingestion feedback.
   */
  public triggerScrub() {
    this.initAudio();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.05);
    
    gain.gain.setValueAtTime(0.05 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.05);

    // Subtle trackpad-style click haptic
    this.triggerHaptic(10, 0.2);
  }

  /**
   * Play a subtle "Notification Bloom" for tutorial progress.
   */
  public triggerNotification() {
    this.initAudio();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(660, now); // E5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05 * this.masterVolume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.5);

    this.triggerHaptic(30, 0.2);
  }

  /**
   * Play a low-frequency "Haptic Heartbeat" pulse for background services.
   */
  public triggerHeartbeat(intensity: number = 0.3) {
    this.initAudio();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(60, now);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1 * this.masterVolume, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.4);

    this.triggerHaptic(150, intensity);
  }

  /**
   * Trigger haptic feedback via Gamepad API
   */
  private async triggerHaptic(duration: number, intensity: number) {
    if (typeof navigator !== "undefined" && navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        const extendedGp = gp as any;
        if (extendedGp?.vibrationActuator) {
          extendedGp.vibrationActuator.playEffect("dual-rumble", {
            startDelay: 0,
            duration: duration,
            weakMagnitude: intensity,
            strongMagnitude: intensity,
          });
        }
      }
    }
  }
}

export const sensory = SensoryService.getInstance();
