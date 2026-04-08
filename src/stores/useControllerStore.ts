import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/utils/storage'
import { EditorAction } from '@/services/input/types'

interface ControllerState {
  mappings: Record<string, EditorAction>
  sensitivity: number
  deadzone: number
  vibration: boolean
  predictionsEnabled: boolean
  predictionSensitivity: number // How much user feedback affects ranking
  
  // Actions
  setMapping: (inputKey: string, action: EditorAction) => void
  setSensitivity: (value: number) => void
  setDeadzone: (value: number) => void
  toggleVibration: () => void
  togglePredictions: () => void
  setPredictionSensitivity: (value: number) => void
  resetToDefaults: () => void
}

const DEFAULT_MAPPINGS: Record<string, EditorAction> = {
  'button_0': 'accept',
  'button_1': 'cancel',
  'button_2': 'secondary-action',
  'button_3': 'primary-action',
  'button_4': 'prev-tab',
  'button_5': 'next-tab',
  'button_6': 'find',
  'button_7': 'replace',
  'button_8': 'show-menu',
  'button_9': 'show-settings',
  'button_10': 'focus-editor',
  'button_11': 'focus-terminal',
  'button_12': 'cursor-up',
  'button_13': 'cursor-down',
  'button_14': 'cursor-left',
  'button_15': 'cursor-right',
  'axis_0': 'horizontal-move',
  'axis_1': 'vertical-move',
  'axis_2': 'zoom',
  'axis_3': 'scroll',
}

export const useControllerStore = create<ControllerState>()(
  persist(
    (set) => ({
      mappings: DEFAULT_MAPPINGS,
      sensitivity: 1.0,
      deadzone: 0.1,
      vibration: true,
      predictionsEnabled: true,
      predictionSensitivity: 1.0,

      setMapping: (inputKey, action) => 
        set((state) => ({
          mappings: { ...state.mappings, [inputKey]: action }
        })),

      setSensitivity: (sensitivity) => set({ sensitivity }),
      
      setDeadzone: (deadzone) => set({ deadzone }),
      
      toggleVibration: () => set((state) => ({ vibration: !state.vibration })),

      togglePredictions: () => set((state) => ({ predictionsEnabled: !state.predictionsEnabled })),

      setPredictionSensitivity: (predictionSensitivity) => set({ predictionSensitivity }),

      resetToDefaults: () => set({ 
        mappings: DEFAULT_MAPPINGS, 
        sensitivity: 1.0, 
        deadzone: 0.1, 
        vibration: true,
        predictionsEnabled: true,
        predictionSensitivity: 1.0
      }),
    }),
    {
      name: 'jpe-controller-settings',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)
