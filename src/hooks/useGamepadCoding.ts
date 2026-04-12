import { useEffect, useCallback, useRef } from 'react';
import { useUIStore } from '../stores/useUIStore';
import { sensory } from '../services/SensoryService';
import { GamepadService } from '../services/input/GamepadService';
import { hub } from '../services/HubService';

/**
 * Epic 11: Handheld & Controller Productivity
 * Hook to manage the Spectral Radial Menu and JPE logic chords.
 */
export function useGamepadCoding(onInsert: (keyword: string) => void) {
  const { 
    setGamepadRadialOpen, 
    setGamepadRadialAngle, 
    gamepadRadialAngle 
  } = useUIStore();
  
  const gamepadService = GamepadService.getInstance();
  const lbHeld = useRef(false);
  const lastNotch = useRef(-1);

  const SLICES = ['WHEN', 'DO', 'ONLY_IF', 'STOP', 'CONDITION'];
  const SLICE_ANGLE = 360 / SLICES.length;

  const handleStickMove = useCallback((_data: { value: number; controller: number; axis: number }) => {
    if (!lbHeld.current) return;

    // Industrial Gamepad Discovery: Search for the active controller
    const gps = navigator.getGamepads();
    let gp = null;
    let x = 0;
    let y = 0;

    for (const g of gps) {
      if (g && (Math.abs(g.axes[0]) > 0.1 || Math.abs(g.axes[1]) > 0.1)) {
        gp = g;
        x = g.axes[0];
        y = g.axes[1];
        break;
      }
    }

    if (!gp) return;
    
    // Check deadzone (Secondary confirmation)
    if (Math.abs(x) < 0.2 && Math.abs(y) < 0.2) return;

    // Calculate angle in degrees (0 to 360)
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90; // Offset by 90 to make North = 0
    if (angle < 0) angle += 360;

    setGamepadRadialAngle(angle);

    // Haptic notch feedback
    const sliceIndex = Math.floor(angle / SLICE_ANGLE);
    if (sliceIndex !== lastNotch.current) {
      sensory.triggerTactilePattern('notch');
      lastNotch.current = sliceIndex;
    }
  }, [setGamepadRadialAngle, SLICE_ANGLE]);

  const handleLBDown = useCallback(() => {
    lbHeld.current = true;
    setGamepadRadialOpen(true);
    sensory.triggerTactilePattern('bloom');
  }, [setGamepadRadialOpen]);

  const handleLBUp = useCallback(() => {
    if (!lbHeld.current) return;
    
    lbHeld.current = false;
    setGamepadRadialOpen(false);
    
    // Commit selection
    const sliceIndex = Math.floor((gamepadRadialAngle || 0) / SLICE_ANGLE) % SLICES.length;
    const keyword = SLICES[sliceIndex];
    
    if (keyword) {
      onInsert(keyword);
      sensory.triggerTactilePattern('double-tap');
    }
    
    lastNotch.current = -1;
  }, [gamepadRadialAngle, onInsert, SLICE_ANGLE, SLICES, setGamepadRadialOpen]);

  const handleSuggestionNav = useCallback((direction: 'up' | 'down') => {
    hub.emit('editor:navigate-suggestions', direction);
    sensory.triggerTactilePattern('notch');
  }, []);

  useEffect(() => {
    // Radial Triggers (LB or Y)
    gamepadService.on('button_down_4', handleLBDown); // LB
    gamepadService.on('button_up_4', handleLBUp);
    gamepadService.on('button_down_3', handleLBDown); // Y
    gamepadService.on('button_up_3', handleLBUp);

    // Suggestion Navigation (D-Pad Up/Down)
    gamepadService.on('button_down_12', () => handleSuggestionNav('up'));
    gamepadService.on('button_down_13', () => handleSuggestionNav('down'));

    gamepadService.on('axis_move_0', handleStickMove as any);
    gamepadService.on('axis_move_1', handleStickMove as any);

    return () => {
      gamepadService.off('button_down_4', handleLBDown);
      gamepadService.off('button_up_4', handleLBUp);
      gamepadService.off('button_down_3', handleLBDown);
      gamepadService.off('button_up_3', handleLBUp);
      gamepadService.off('button_down_12', () => handleSuggestionNav('up'));
      gamepadService.off('button_down_13', () => handleSuggestionNav('down'));
      gamepadService.off('axis_move_0', handleStickMove as any);
      gamepadService.off('axis_move_1', handleStickMove as any);
    };
  }, [gamepadService, handleLBDown, handleLBUp, handleStickMove, handleSuggestionNav]);
}
