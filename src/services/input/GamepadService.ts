import { GamepadState, GamepadEventHandler, EditorAction } from './types';
import { sensory } from '../SensoryService';

export class GamepadService {
  private static instance: GamepadService;
  private animFrameId: number | null = null;
  private previousState: GamepadState = {};
  private listeners: Map<string, GamepadEventHandler[]> = new Map();
  private isPolling: boolean = false;
  private deadzone: number = 0.15;

  private constructor() {}

  static getInstance(): GamepadService {
    if (!GamepadService.instance) {
      GamepadService.instance = new GamepadService();
    }
    return GamepadService.instance;
  }

  start(): void {
    if (this.isPolling) return;
    if (typeof window === 'undefined' || !navigator.getGamepads) return;

    this.isPolling = true;
    this.poll();
    
    // Industrial Handheld Link Established
    sensory.triggerHeartbeat(0.2);
    console.log('JPE Industrial Controller Engine: Operational');
  }

  stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.isPolling = false;
    this.previousState = {};
  }

  private poll(): void {
    const gamepads = navigator.getGamepads();
    
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;

      // 1. Modifier Detection (Handheld Chords)
      const lb = gp.buttons[4].pressed;
      const rb = gp.buttons[5].pressed;

      // 2. Button Processing
      gp.buttons.forEach((button, idx) => {
        const wasPressed = this.previousState[`gp${i}_btn${idx}`];
        const isPressed = button.pressed;

        if (isPressed && !wasPressed) {
          this.handleButtonDown(i, idx, lb, rb);
        } else if (!isPressed && wasPressed) {
          this.emit(`button_up_${idx}`, { gamepad: i, button: idx });
        }

        this.previousState[`gp${i}_btn${idx}`] = isPressed;
      });

      // 3. Axis Processing (Handheld Navigation)
      gp.axes.forEach((axis, idx) => {
        const value = Math.abs(axis) < this.deadzone ? 0 : axis;
        if (value !== 0) {
          this.emit(`axis_move_${idx}`, { gamepad: i, value });
          
          // Audio Scrubbing for threshold crossing
          const prevVal = this.previousState[`gp${i}_axis${idx}`];
          const prevAbs = typeof prevVal === 'number' ? Math.abs(prevVal) : 0;
          if (prevAbs < 0.5 && Math.abs(value) >= 0.5) {
            sensory.triggerScrub();
          }
        }
        this.previousState[`gp${i}_axis${idx}`] = value;
      });
    }

    if (this.isPolling) {
      this.animFrameId = requestAnimationFrame(() => this.poll());
    }
  }

  private handleButtonDown(gamepad: number, index: number, lb: boolean, rb: boolean): void {
    let action: EditorAction | null = null;
    let isChord = false;

    // Industrial Chord Table (FR20)
    if (rb) {
      isChord = true;
      if (index === 1) action = 'ignite';      // RB + B
      if (index === 2) action = 'build';       // RB + X
      if (index === 3) action = 'focus-mode';  // RB + Y
      
      if (isChord && action) {
        sensory.triggerTactilePattern('double-tap');
      }
    } else if (lb) {
      isChord = true;
      if (index === 14) action = 'undo';  // LB + D-Pad Left
      if (index === 15) action = 'redo';  // LB + D-Pad Right
      if (index === 9) action = 'show-settings'; // LB + Start
      
      if (isChord && action) {
        sensory.triggerTactilePattern('notch');
      }
    } else {
      // Extended Handheld Buttons (L4/R4/L5/R5)
      // Standard XInput indices for Steam Deck back paddles
      if (index === 16) action = 'jump-to-definition'; // L4
      if (index === 17) action = 'copilot';            // R4
      if (index === 18) action = 'manual';             // L5
      if (index === 19) action = 'quick-fix';          // R5
      
      if (action) {
        sensory.triggerTactilePattern('notch');
      }
      
      // Standard UX Actions
      if (index === 0) action = 'accept';
      if (index === 1) action = 'cancel';
      if (index === 8) action = 'prev-tab';
      if (index === 9) action = 'next-tab';
    }

    if (action) {
      this.emit(action, { gamepad, button: index, chord: isChord });
      this.emit('action', { gamepad, button: index, chord: isChord, action });
      
      // Only scrub for non-industrial standard UX actions to avoid haptic mud
      if (index < 16) {
        sensory.triggerScrub();
      }
    }

    // Always emit raw button down for standard focus navigation
    this.emit(`button_down_${index}`, { gamepad, button: index });
  }

  on(event: string, callback: GamepadEventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: GamepadEventHandler): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

export const gamepad = GamepadService.getInstance();
