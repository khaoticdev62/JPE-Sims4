"use client";

import React, { useEffect } from 'react'
import { GamepadService } from '@/services/input/GamepadService'
import { useGamepadNavigation } from '@/hooks/useGamepadNavigation'
import { useGamepadEditing } from '@/hooks/useGamepadEditing'
import ControllerIndicator from './ControllerIndicator'
import ControllerHelp from './ControllerHelp'

interface ControllerManagerProps {
  children: React.ReactNode
}

export function ControllerManager({ children }: ControllerManagerProps) {
  // Initialize navigation and editing hooks
  const { showHelp, setShowHelp } = useGamepadNavigation()
  const { cursorController: _cursorController, textInputHandler: _textInputHandler } = useGamepadEditing()

  useEffect(() => {
    const gamepadService = GamepadService.getInstance()
    gamepadService.start()

    return () => {
      gamepadService.stop()
    }
  }, [])

  return (
    <>
      {children}
      <ControllerIndicator />
      {showHelp && <ControllerHelp visible={showHelp} onClose={() => setShowHelp(false)} />}
    </>
  )
}
