import { GamepadState, GamepadEventHandler } from './types';

export class GamepadService {
  private static instance: GamepadService;
  private pollIntervalId: number | null = null;
  private previousState: GamepadState = {};
  private listeners: Map<string, GamepadEventHandler[]> = new Map();
  private isPolling: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): GamepadService {
    if (!GamepadService.instance) {
      GamepadService.instance = new GamepadService();
    }
    return GamepadService.instance;
  }

  start(): void {
    if (this.isPolling) return;
    
    // Check if Gamepad API is supported
    if (typeof navigator === 'undefined' || !navigator.getGamepads) {
      console.warn('Gamepad API not supported in this environment');
      return;
    }

    this.isPolling = true;
    // Poll at ~60fps
    this.pollIntervalId = window.setInterval(() => {
      this.pollGamepads();
    }, 16);
    
    console.log('GamepadService started');
  }

  stop(): void {
    if (this.pollIntervalId !== null) {
      window.clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
    this.isPolling = false;
    this.previousState = {};
    console.log('GamepadService stopped');
  }

  private pollGamepads(): void {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;

      // Check buttons (Standard gamepad mapping has ~17 buttons)
      gamepad.buttons.forEach((button, buttonIndex) => {
        const key = `button_${buttonIndex}`;
        const wasPressed = this.previousState[`gp${i}_${key}`];
        const isPressed = button.pressed;

        if (isPressed && !wasPressed) {
          this.emit(`button_down_${buttonIndex}`, { gamepad: i, button: buttonIndex });
        } else if (!isPressed && wasPressed) {
          this.emit(`button_up_${buttonIndex}`, { gamepad: i, button: buttonIndex });
        }

        this.previousState[`gp${i}_${key}`] = isPressed;
      });

      // Check axes
      gamepad.axes.forEach((axis, axisIndex) => {
        // Apply deadzone
        const deadzone = 0.1;
        const value = Math.abs(axis) < deadzone ? 0 : axis;
        
        // We only emit if there's significant movement or it returns to 0
        // Optimizing to avoid spamming events every frame if value hasn't changed much could be done here,
        // but for now we emit every frame to ensure smooth continuous movement.
        // A better approach for continuous axes might be letting the consumer poll the current state,
        // but the event based approach requested in the plan is `axis_move`.
        if (Math.abs(value) > 0) {
             this.emit(`axis_move_${axisIndex}`, { gamepad: i, value });
        }
      });
    }
  }

  on(event: string, callback: GamepadEventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: GamepadEventHandler): void {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event)!;
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}
