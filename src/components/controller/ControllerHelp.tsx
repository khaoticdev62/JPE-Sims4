"use client";

import { XIcon } from 'lucide-react'
import { ControllerMapper } from '@/services/input/ControllerMapper'
import { useMemo } from 'react'

interface ControllerHelpProps {
  visible: boolean
  onClose: () => void
}

export default function ControllerHelp({ visible, onClose }: ControllerHelpProps) {
  const mapper = useMemo(() => new ControllerMapper(), [])
  const mapping = mapper.exportMapping()

  if (!visible) return null

  // Group mappings for display
  const groups = {
    Navigation: ['prev-tab', 'next-tab', 'focus-editor', 'focus-terminal', 'show-menu', 'show-settings'],
    Actions: ['accept', 'cancel', 'primary-action', 'secondary-action', 'find', 'replace'],
    Movement: ['cursor-up', 'cursor-down', 'cursor-left', 'cursor-right', 'horizontal-move', 'vertical-move', 'scroll', 'zoom']
  }

  const getButtonLabel = (key: string) => {
    const labels: Record<string, string> = {
      'button_0': 'A', 'button_1': 'B', 'button_2': 'X', 'button_3': 'Y',
      'button_4': 'LB', 'button_5': 'RB', 'button_6': 'LT', 'button_7': 'RT',
      'button_8': 'Select', 'button_9': 'Start',
      'button_10': 'L3', 'button_11': 'R3',
      'button_12': 'Up', 'button_13': 'Down', 'button_14': 'Left', 'button_15': 'Right',
      'axis_0': 'L Stick H', 'axis_1': 'L Stick V',
      'axis_2': 'R Stick H', 'axis_3': 'R Stick V'
    }
    return labels[key] || key
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-background-secondary border border-border-subtle rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-text-primary">Controller Shortcuts</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
          {Object.entries(groups).map(([groupName, actions]) => (
            <div key={groupName}>
              <h3 className="text-sm font-semibold text-accent-primary mb-3 uppercase tracking-wider">{groupName}</h3>
              <div className="space-y-2">
                {actions.map(action => {
                  const inputKey = Object.entries(mapping).find(([_, a]) => a === action)?.[0]
                  if (!inputKey) return null
                  
                  return (
                    <div key={action} className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary capitalize">{action.replace(/-/g, ' ')}</span>
                      <kbd className="px-2 py-1 bg-background-tertiary border border-border-subtle rounded text-text-primary font-mono text-xs font-bold min-w-[32px] text-center">
                        {getButtonLabel(inputKey)}
                      </kbd>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-background-tertiary border-t border-border-subtle text-xs text-text-secondary text-center">
          Press <kbd className="font-bold text-text-primary">Start</kbd> to toggle this help overlay
        </div>
      </div>
    </div>
  )
}
