import { create } from 'zustand'

export interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

interface TutorialState {
  isActive: boolean
  currentStepIndex: number
  steps: TutorialStep[]
  
  // Actions
  startTutorial: () => void
  nextStep: () => void
  previousStep: () => void
  skipTutorial: () => void
  setStep: (index: number) => void
}

export const useTutorialStore = create<TutorialState>((set) => ({
  isActive: false,
  currentStepIndex: 0,
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to JPE Studio!',
      description: 'Your premium environment for creating Sims 4 mods using "Just Plain English". Let\'s take a quick tour.',
      targetSelector: 'body',
      position: 'center'
    },
    {
      id: 'explorer',
      title: 'Mod Project Explorer',
      description: 'Manage your JPE source files here. You can add new mod elements or explore indexed Sims 4 tuning.',
      targetSelector: '#sidebar-nav-explorer',
      position: 'right'
    },
    {
      id: 'editor',
      title: 'Semantic Editor',
      description: 'The real-time workspace where JPE comes to life. Features deep autocomplete and reference checking.',
      targetSelector: '#editor-pane',
      position: 'right'
    },
    {
      id: 'preview',
      title: 'Live XML Preview',
      description: 'Watch your English code transform into valid Sims 4 XML tuning instantly. Perfect for debugging.',
      targetSelector: '#right-panel',
      position: 'left'
    },
    {
      id: 'status',
      title: 'Intelligent Status Bar',
      description: 'Real-time diagnostics and mod intelligence stats. Click the "Help" icon here to restart this tour anytime.',
      targetSelector: '#status-bar',
      position: 'top'
    }
  ],

  startTutorial: () => set({ isActive: true, currentStepIndex: 0 }),
  nextStep: () => set((state) => ({ 
    currentStepIndex: Math.min(state.currentStepIndex + 1, state.steps.length - 1) 
  })),
  previousStep: () => set((state) => ({ 
    currentStepIndex: Math.max(state.currentStepIndex - 1, 0) 
  })),
  skipTutorial: () => set({ isActive: false }),
  setStep: (index: number) => set({ currentStepIndex: index })
}))
