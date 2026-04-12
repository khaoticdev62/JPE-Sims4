"use client"

import * as React from "react"
import { useUIStore } from "@/stores/useUIStore"
import { CommandPalette } from "@/components/CommandPalette"
import { OnboardingTour } from "@/components/OnboardingTour"
import BuffWizard from "@/components/wizards/BuffWizard"
import InteractionWizard from "@/components/wizards/InteractionWizard"
import TraitWizard from "@/components/wizards/TraitWizard"
import PromptToJPEDialog from "@/components/ai/PromptToJPEDialog"
import HelpCenter from "@/components/help/HelpCenter"
import BatchSTBLEditor from "@/components/editor/BatchSTBLEditor"
import ModPublishDialog from "@/components/modals/ModPublishDialog"
import { ProjectExportDialog } from "@/components/modals/ProjectExportDialog"
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
    isPromptToJPEOpen,
    setPromptToJPEOpen,
    isHelpCenterOpen,
    setHelpCenterOpen,
    isBatchSTBLOpen,
    setBatchSTBLOpen,
    isPublishModOpen,
    setPublishModOpen,
    isProjectExportOpen,
    setProjectExportOpen,
    isTutorialActive,
    setTutorialActive,
    setTutorialStep
  } = useUIStore()

  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)

    // Auto-open tour if not completed and not explicitly disabled
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    const skipTour = typeof window !== 'undefined' && 
      (window.location.search.includes('skipTour') || 
       window.localStorage.getItem('jpe-skip-onboarding') === 'true' ||
       process.env.NEXT_PUBLIC_SKIP_ONBOARDING === 'true' ||
       isDev);

    if (!hasCompletedTour && !skipTour) {
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
      <PromptToJPEDialog
        isOpen={isPromptToJPEOpen}
        onClose={() => setPromptToJPEOpen(false)}
      />
      <HelpCenter
        isOpen={isHelpCenterOpen}
        onClose={() => setHelpCenterOpen(false)}
      />
      <BatchSTBLEditor
        isOpen={isBatchSTBLOpen}
        onClose={() => setBatchSTBLOpen(false)}
      />
      <ProjectExportDialog
        isOpen={isProjectExportOpen}
        onClose={() => setProjectExportOpen(false)}
      />
    </>
  )
}
