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
import { ProjectExportDialog } from "@/components/modals/ProjectExportDialog"
import { useEffect } from "react"
import { TutorialEngine } from "@/services/tutorial/TutorialEngine"

/**
 * GlobalTools - Manages global UI components like Command Palette and Onboarding
 * Ensures they are only rendered on the client and wired to the UI store.
 */
export function GlobalTools() {
  const isCommandPaletteOpen = useUIStore(state => state.isCommandPaletteOpen)
  const setCommandPaletteOpen = useUIStore(state => state.setCommandPaletteOpen)
  const isBuffWizardOpen = useUIStore(state => state.isBuffWizardOpen)
  const setBuffWizardOpen = useUIStore(state => state.setBuffWizardOpen)
  const isInteractionWizardOpen = useUIStore(state => state.isInteractionWizardOpen)
  const setInteractionWizardOpen = useUIStore(state => state.setInteractionWizardOpen)
  const isTraitWizardOpen = useUIStore(state => state.isTraitWizardOpen)
  const setTraitWizardOpen = useUIStore(state => state.setTraitWizardOpen)
  const isPromptToJPEOpen = useUIStore(state => state.isPromptToJPEOpen)
  const setPromptToJPEOpen = useUIStore(state => state.setPromptToJPEOpen)
  const isHelpCenterOpen = useUIStore(state => state.isHelpCenterOpen)
  const setHelpCenterOpen = useUIStore(state => state.setHelpCenterOpen)
  const isBatchSTBLOpen = useUIStore(state => state.isBatchSTBLOpen)
  const setBatchSTBLOpen = useUIStore(state => state.setBatchSTBLOpen)
  const isProjectExportOpen = useUIStore(state => state.isProjectExportOpen)
  const setProjectExportOpen = useUIStore(state => state.setProjectExportOpen)

  const isTourOpen = useUIStore(state => state.isTourOpen)
  const setTourOpen = useUIStore(state => state.setTourOpen)
  const hasCompletedTour = useUIStore(state => state.hasCompletedTour)
  const setHasCompletedTour = useUIStore(state => state.setHasCompletedTour)
  const setTutorialActive = useUIStore(state => state.setTutorialActive)
  const setTutorialStep = useUIStore(state => state.setTutorialStep)
  const isTutorialActive = useUIStore(state => state.isTutorialActive)
  const showDiagnostics = useUIStore(state => state.showDiagnostics)

  const isE2EMode = typeof window !== 'undefined' && ((window as any).JPE_E2E_MODE === '1' || window.localStorage?.getItem('jpe-e2e-mode') === 'true')

  const [mounted, setMounted] = React.useState(false)

  const skipTour = React.useMemo(() => {
    return typeof window !== 'undefined' &&
      (window.location.search.includes('skipTour') ||
       window.localStorage?.getItem('jpe-skip-onboarding') === 'true' ||
       process.env.NEXT_PUBLIC_SKIP_ONBOARDING === 'true');
  }, []);

  React.useEffect(() => {
    if (showDiagnostics) {
      // sensory.triggerStatus('diagnostic_resolved'); // Fixed: This method does not exist in SensoryService
      if (typeof window !== 'undefined' && (window as any).sensory?.triggerNotification) {
        (window as any).sensory.triggerNotification();
      }
    }
  }, [showDiagnostics]);

  useEffect(() => {
    if (isE2EMode) return
    setMounted(true)

    if (!hasCompletedTour && !skipTour && !isTourOpen) {
      setTourOpen(true)
      setTutorialActive(true)
      setTutorialStep(0)
    }
  }, [hasCompletedTour, isTourOpen, skipTour, setTourOpen, setTutorialActive, setTutorialStep])

  // Sync TutorialEngine lifecycle
  useEffect(() => {
    if (isE2EMode) return
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
