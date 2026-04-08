"use client";
import React, { useEffect } from 'react'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import EditorLayout from "@/components/layout/EditorLayout";
import { useUIStore } from '@/stores/useUIStore'
import { ModIndexingService } from '@/services/ModIndexingService'
import { ControllerManager } from '@/components/controller/ControllerManager'
import { BuildProgressOverlay } from '@/components/build/BuildProgressOverlay'

/**
 * AppContent - Main entry point selector.
 * Simplified to use EditorLayout as the primary Spectral shell.
 */
function AppContent() {
  const { modsFolderPath } = useUIStore()

  useEffect(() => {
    if (modsFolderPath) {
      ModIndexingService.indexModsFolder(modsFolderPath)
    }
  }, [modsFolderPath])

  return (
    <div data-testid="app-root">
      <BuildProgressOverlay />
      <ControllerManager>
        <ErrorBoundary>
          {/* EditorLayout is now the universal Spectral container (Home, Projects, etc.) */}
          <EditorLayout />
        </ErrorBoundary>
      </ControllerManager>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}