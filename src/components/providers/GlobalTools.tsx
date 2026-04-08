"use client"

import * as React from "react"
import { useUIStore } from "@/stores/useUIStore"
import { CommandPalette } from "@/components/CommandPalette"
import { OnboardingTour } from "@/components/OnboardingTour"
import BuffWizard from "@/components/wizards/BuffWizard"
import InteractionWizard from "@/components/wizards/InteractionWizard"
import TraitWizard from "@/components/wizards/TraitWizard"
import { useEffect } from "react"
import { TutorialEngine } from "@/services/tutorial/TutorialEngine"

/**
 * GlobalTools - Manages global UI components like Command Palette and Onboarding
 * Ensures they are only rendered on the client and wired to the UI store.
 */
export function GlobalTools() {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen,
    isTourOpen,
    setTourOpen,
    hasCompletedTour,
    setHasCompletedTour,
    isBuffWizardOpen,
    setBuffWizardOpen,
    isInteractionWizardOpen,
    setInteractionWizardOpen,
    isTraitWizardOpen,
    setTraitWizardOpen,
    isTutorialActive,
    setTutorialActive,
    setTutorialStep
  } = useUIStore()

  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Auto-open tour if not completed
    if (!hasCompletedTour) {
      setTourOpen(true)
      setTutorialActive(true)
      setTutorialStep(0)
    }
  }, [hasCompletedTour, setTourOpen, setTutorialActive, setTutorialStep])

  // Sync TutorialEngine lifecycle
  useEffect(() => {
    const engine = TutorialEngine.getInstance()
    if (isTutorialActive && isTourOpen) {
      engine.start()
    } else {
      engine.stop()
    }
    return () => engine.stop()
  }, [isTutorialActive, isTourOpen])

  if (!mounted) return null

  return (
    <>
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
      <OnboardingTour 
        isOpen={isTourOpen} 
        onClose={() => {
          setTourOpen(false)
          setHasCompletedTour(true)
        }} 
      />
      <BuffWizard 
        isOpen={isBuffWizardOpen} 
        onClose={() => setBuffWizardOpen(false)} 
      />
      <InteractionWizard 
        isOpen={isInteractionWizardOpen} 
        onClose={() => setInteractionWizardOpen(false)} 
      />
      <TraitWizard 
        isOpen={isTraitWizardOpen} 
        onClose={() => setTraitWizardOpen(false)} 
      />
    </>
  )
}
