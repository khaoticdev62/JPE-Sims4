
export type GamepadButtonName = 
  | 'button_0' | 'button_1' | 'button_2' | 'button_3'  // Face buttons (A, B, X, Y)
  | 'button_4' | 'button_5'                      // Shoulder buttons (LB, RB)
  | 'button_6' | 'button_7'                      // Triggers (LT, RT) - often analog but mapped as buttons here
  | 'button_8' | 'button_9'                      // Menu/Options
  | 'button_10' | 'button_11'                    // Stick buttons (L3, R3)
  | 'button_12' | 'button_13' | 'button_14' | 'button_15'; // D-pad (Up, Down, Left, Right)

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
  | 'cursor-right';

export interface GamepadState {
  [key: string]: boolean;
}

export interface GamepadEventData {
  gamepad: number;
  value?: number; // For axes
  button?: number; // For buttons
}

export type GamepadEventHandler = (data: GamepadEventData) => void;
