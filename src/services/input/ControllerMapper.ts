import { EditorAction } from './types';

export class ControllerMapper {
  private mappings: Map<string, EditorAction> = new Map();

  // Default Steam Deck / Xbox Controller mapping
  private defaultMapping: Record<string, EditorAction> = {
    // Action buttons
    'button_0': 'accept',          // A
    'button_1': 'cancel',           // B
    'button_2': 'secondary-action', // X
    'button_3': 'primary-action',   // Y

    // Shoulder buttons
    'button_4': 'prev-tab',         // LB
    'button_5': 'next-tab',         // RB
    
    // Triggers (treated as buttons for simple actions, though usually axes)
    // Note: The Gamepad API usually maps triggers to buttons 6 and 7 as well as axes.
    'button_6': 'find',             // LT
    'button_7': 'replace',          // RT

    // Menu buttons
    'button_8': 'show-menu',        // Select/View
    'button_9': 'show-settings',    // Start/Menu

    // Stick buttons
    'button_10': 'focus-editor',    // L3
    'button_11': 'focus-terminal',  // R3
    
    // D-pad
    'button_12': 'cursor-up',       // Up
    'button_13': 'cursor-down',     // Down
    'button_14': 'cursor-left',     // Left
    'button_15': 'cursor-right',    // Right

    // Analog sticks (mapped by axis index)
    'axis_0': 'horizontal-move',    // L Stick X
    'axis_1': 'vertical-move',      // L Stick Y
    'axis_2': 'zoom',               // R Stick X
    'axis_3': 'scroll',             // R Stick Y
  };

  constructor() {
    this.resetToDefaults();
  }

  getAction(inputKey: string): EditorAction | null {
    return this.mappings.get(inputKey) || null;
  }

  remapInput(inputKey: string, action: EditorAction): void {
    this.mappings.set(inputKey, action);
  }

  resetToDefaults(): void {
    this.mappings.clear();
    Object.entries(this.defaultMapping).forEach(([key, action]) => {
      this.mappings.set(key, action);
    });
  }

  exportMapping(): Record<string, EditorAction> {
    const result: Record<string, EditorAction> = {};
    this.mappings.forEach((value, key) => {
        result[key] = value;
    });
    return result;
  }

  importMapping(mapping: Record<string, EditorAction>): void {
    this.mappings.clear();
    Object.entries(mapping).forEach(([key, action]) => {
      this.mappings.set(key, action);
    });
  }
}
