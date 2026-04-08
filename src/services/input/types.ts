
export type GamepadButtonName = 
  | 'button_0' | 'button_1' | 'button_2' | 'button_3'  // Face buttons (A, B, X, Y)
  | 'button_4' | 'button_5'                      // Shoulder buttons (LB, RB)
  | 'button_6' | 'button_7'                      // Triggers (LT, RT)
  | 'button_8' | 'button_9'                      // Menu/Options
  | 'button_10' | 'button_11'                    // Stick buttons (L3, R3)
  | 'button_12' | 'button_13' | 'button_14' | 'button_15' // D-pad
  | 'button_16' | 'button_17' | 'button_18' | 'button_19'; // Steam Deck L4, R4, L5, R5

export type GamepadAxisName = 
  | 'axis_0' | 'axis_1'  // Left Stick (X, Y)
  | 'axis_2' | 'axis_3'; // Right Stick (X, Y)

export type EditorAction = 
  | 'accept' 
  | 'cancel' 
  | 'secondary-action' 
  | 'primary-action'
  | 'prev-tab' 
  | 'next-tab' 
  | 'find' 
  | 'replace'
  | 'show-menu' 
  | 'show-settings'
  | 'focus-editor' 
  | 'focus-terminal'
  | 'horizontal-move' 
  | 'vertical-move' 
  | 'scroll' 
  | 'zoom'
  | 'cursor-up'
  | 'cursor-down'
  | 'cursor-left'
  | 'cursor-right'
  | 'ignite'
  | 'build'
  | 'copilot'
  | 'manual'
  | 'focus-mode'
  | 'undo'
  | 'redo';

export interface GamepadState {
  [key: string]: boolean | number;
}

export interface GamepadEventData {
  gamepad: number;
  value?: number; // For axes
  button?: number; // For buttons
  chord?: boolean; // For industrial chorded actions
}

export type GamepadEventHandler = (data: GamepadEventData) => void;
