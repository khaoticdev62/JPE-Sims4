import { useRef, useCallback, useMemo } from 'react'
import { useGamepadButtonDown, useGamepadAxisMove } from './useGamepadInput'
import { CursorController } from '@/services/input/CursorController'
import { TextInputHandler } from '@/services/input/TextInputHandler'
import { ControllerMapper } from '@/services/input/ControllerMapper'
import { useUIStore } from '@/stores/useUIStore'

/**
 * useGamepadEditing
 * 
 * Hook to handle text editing actions via gamepad.
 * Maps buttons to actions like delete, undo, redo, indent, etc.
 * Uses Right Stick for fine cursor control.
 */
export function useGamepadEditing() {
  const { focusedPane } = useUIStore()
  
  const cursorController = useMemo(() => CursorController.getInstance(), [])
  const textInputHandler = useMemo(() => TextInputHandler.getInstance(), [])
  const mapper = useMemo(() => new ControllerMapper(), [])
  
  // Stick movement thresholds and repeat rates
  const lastMoveTime = useRef<number>(0)
  const MOVE_REPEAT_DELAY = 100 // ms
  const STICK_THRESHOLD = 0.5

  const handleAxisMove = useCallback((axis: number, value: number) => {
    // Only handle editing when editor is focused
    if (focusedPane !== 'editor') return

    const now = Date.now()
    if (now - lastMoveTime.current < MOVE_REPEAT_DELAY) return

    // In Phase 6 planning:
    // axis_0: horizontal-move (L Stick X)
    // axis_1: vertical-move (L Stick Y)
    // axis_2: zoom (R Stick X) -> We'll use for Left/Right cursor move
    // axis_3: scroll (R Stick Y) -> We'll use for Up/Down cursor move
    
    if (axis === 3) { // R Stick Y -> Move cursor up/down
      if (Math.abs(value) > STICK_THRESHOLD) {
        cursorController.moveCursorBy(value > 0 ? 1 : -1, 0)
        lastMoveTime.current = now
      }
    } else if (axis === 2) { // R Stick X -> Move cursor left/right
      if (Math.abs(value) > STICK_THRESHOLD) {
        cursorController.moveCursorBy(0, value > 0 ? 1 : -1)
        lastMoveTime.current = now
      }
    }
  }, [focusedPane, cursorController])

  const handleButtonAction = useCallback((action: string) => {
    if (focusedPane !== 'editor') return

    switch (action) {
      case 'accept':
        // A button usually accepts or inserts
        break
      case 'cancel': // B button -> Backspace
        cursorController.deleteCharacter()
        break
      case 'secondary-action': // X button -> Delete Word
        cursorController.deleteWord()
        break
      case 'primary-action': // Y button -> Undo
        cursorController.undo()
        break
      case 'find': // LT -> Outdent
        cursorController.outdent()
        break
      case 'replace': // RT -> Indent
        cursorController.indent()
        break
    }
  }, [focusedPane, cursorController])

  // Bind axes (2 and 3 are Right Stick)
  useGamepadAxisMove(2, (data) => handleAxisMove(2, data.value!))
  useGamepadAxisMove(3, (data) => handleAxisMove(3, data.value!))

  // Bind buttons based on mapper
  useGamepadButtonDown(0, () => handleButtonAction(mapper.getAction('button_0')!)) // A
  useGamepadButtonDown(1, () => handleButtonAction(mapper.getAction('button_1')!)) // B
  useGamepadButtonDown(2, () => handleButtonAction(mapper.getAction('button_2')!)) // X
  useGamepadButtonDown(3, () => handleButtonAction(mapper.getAction('button_3')!)) // Y
  useGamepadButtonDown(6, () => handleButtonAction(mapper.getAction('button_6')!)) // LT
  useGamepadButtonDown(7, () => handleButtonAction(mapper.getAction('button_7')!)) // RT

  return {
    cursorController,
    textInputHandler
  }
}
