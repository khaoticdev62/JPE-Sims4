import React from 'react'
import { useControllerStore } from '@/stores/useControllerStore'
import { EditorAction } from '@/services/input/types'

const AVAILABLE_ACTIONS: EditorAction[] = [
  'accept', 'cancel', 'secondary-action', 'primary-action',
  'prev-tab', 'next-tab', 'find', 'replace',
  'show-menu', 'show-settings', 'focus-editor', 'focus-terminal',
  'horizontal-move', 'vertical-move', 'scroll', 'zoom',
  'cursor-up', 'cursor-down', 'cursor-left', 'cursor-right'
]

export function ControllerSettings() {
  const { 
    mappings, 
    setMapping, 
    sensitivity, 
    setSensitivity, 
    deadzone, 
    setDeadzone,
    predictionsEnabled,
    togglePredictions,
    predictionSensitivity,
    setPredictionSensitivity,
    resetToDefaults 
  } = useControllerStore()

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Controller Settings</h2>
          <p className="text-sm text-text-secondary">Customize your Steam Deck or Gamepad experience</p>
        </div>
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 bg-bg-tertiary hover:bg-bg-hover text-text-primary rounded text-sm transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Predictive Coding Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <h3 className="text-md font-semibold text-accent-primary">Predictive Coding</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">{predictionsEnabled ? 'Enabled' : 'Disabled'}</span>
            <button
              onClick={togglePredictions}
              className={`w-10 h-5 rounded-full relative transition-colors ${predictionsEnabled ? 'bg-accent-primary' : 'bg-bg-tertiary'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${predictionsEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
        
        {predictionsEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-text-secondary">Learning Sensitivity</label>
                <span className="text-sm text-accent-primary">{predictionSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={predictionSensitivity}
                onChange={(e) => setPredictionSensitivity(parseFloat(e.target.value))}
                className="w-full accent-accent-primary"
              />
              <p className="text-[10px] text-text-secondary italic">Higher values mean the system learns faster from your patterns.</p>
            </div>
            <div className="flex items-center justify-center p-4 bg-bg-secondary rounded border border-border-subtle border-dashed">
              <div className="text-center">
                <div className="text-xs text-text-secondary mb-1">Feedback Accuracy</div>
                <div className="text-lg font-mono text-state-success">74.2%</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Analog Controls */}
      <section className="space-y-4">
        <h3 className="text-md font-semibold text-accent-primary border-b border-border-subtle pb-2">Analog Sensitivity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-text-secondary">Stick Sensitivity</label>
              <span className="text-sm text-accent-primary">{sensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-full accent-accent-primary"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-text-secondary">Deadzone</label>
              <span className="text-sm text-accent-primary">{(deadzone * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.5"
              step="0.01"
              value={deadzone}
              onChange={(e) => setDeadzone(parseFloat(e.target.value))}
              className="w-full accent-accent-primary"
            />
          </div>
        </div>
      </section>

      {/* Button Mappings */}
      <section className="space-y-4">
        <h3 className="text-md font-semibold text-accent-primary border-b border-border-subtle pb-2">Button Mappings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(mappings).map(([inputKey, currentAction]) => (
            <div key={inputKey} className="flex items-center justify-between p-3 bg-bg-secondary rounded border border-border-subtle">
              <span className="text-sm font-medium text-text-primary capitalize">
                {inputKey.replace('_', ' ')}
              </span>
              <select
                value={currentAction}
                onChange={(e) => setMapping(inputKey, e.target.value as EditorAction)}
                className="bg-bg-tertiary text-text-primary text-xs rounded border border-border-subtle p-1 focus:ring-1 focus:ring-accent-primary outline-none"
              >
                {AVAILABLE_ACTIONS.map(action => (
                  <option key={action} value={action}>{action.replace('-', ' ')}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
