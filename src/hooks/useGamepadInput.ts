import { useEffect, useMemo } from 'react';
import { GamepadService } from '../services/input/GamepadService';
import { GamepadEventData } from '../services/input/types';

export function useGamepadInput() {
  const gamepadService = useMemo(() => GamepadService.getInstance(), []);

  useEffect(() => {
    gamepadService.start();
  }, [gamepadService]);

  return {
    gamepadService
  };
}

export function useGamepadButtonDown(buttonIndex: number, callback: (data: GamepadEventData) => void) {
  const { gamepadService } = useGamepadInput();

  useEffect(() => {
    const eventName = `button_down_${buttonIndex}`;
    gamepadService.on(eventName, callback);
    return () => {
      gamepadService.off(eventName, callback);
    };
  }, [gamepadService, buttonIndex, callback]);
}

export function useGamepadButtonUp(buttonIndex: number, callback: (data: GamepadEventData) => void) {
  const { gamepadService } = useGamepadInput();

  useEffect(() => {
    const eventName = `button_up_${buttonIndex}`;
    gamepadService.on(eventName, callback);
    return () => {
      gamepadService.off(eventName, callback);
    };
  }, [gamepadService, buttonIndex, callback]);
}

export function useGamepadAxisMove(axisIndex: number, callback: (data: GamepadEventData) => void) {
  const { gamepadService } = useGamepadInput();

  useEffect(() => {
    const eventName = `axis_move_${axisIndex}`;
    gamepadService.on(eventName, callback);
    return () => {
      gamepadService.off(eventName, callback);
    };
  }, [gamepadService, axisIndex, callback]);
}
