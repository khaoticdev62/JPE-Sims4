"use client";
import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import TitleBar from './TitleBar'
import EditorPane from './EditorPane'
import RightPanel from './RightPanel'
import { AppNavigation } from '@/components/AppNavigation'

// Code splitting for large view components
const JpePlaygroundView = dynamic(() => import("../playground/JpePlaygroundView").then(mod => mod.JpePlaygroundView), { ssr: false })
const VisualJpeEditor = dynamic(() => import("../visual/VisualJpeEditor").then(mod => mod.VisualJpeEditor), { ssr: false })
const JpeManualView = dynamic(() => import("../manual/JpeManualView").then(mod => mod.JpeManualView), { ssr: false })
const DashboardView = dynamic(() => import('@/components/DashboardView').then(mod => mod.DashboardView), { ssr: false })
const ProjectsPage = dynamic(() => import('@/components/ProjectsPage').then(mod => mod.ProjectsPage), { ssr: false })
const SettingsPage = dynamic(() => import('@/components/SettingsPage').then(mod => mod.SettingsPage), { ssr: false })
const TS4RebelsPortal = dynamic(() => import('@/components/rebels/TS4RebelsPortal').then(mod => mod.TS4RebelsPortal), { ssr: false })
import { ExportWizard } from '@/components/ExportWizard'

import { BuildProgressModal } from '@/components/BuildProgressModal'
import { SplashScreen } from '@/components/SplashScreen'
import { useUIStore } from '@/stores/useUIStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Sidebar } from '@/components/sidebar/Sidebar'
import DiagnosticsPanel from '@/components/diagnostics/DiagnosticsPanel'
import { PredictionOverlay } from '@/components/editor/PredictionOverlay'
import { VirtualKeyboard } from '@/components/input/VirtualKeyboard'
import { InputMethodSelector } from '@/components/input/InputMethodSelector'
import { TextInputHandler } from '@/services/input/TextInputHandler'
import { useGamepadNavigation } from '@/hooks/useGamepadNavigation'
import { hub } from '@/services/HubService'
import type { Diagnostic } from '@/types/index'
import type { WorkspaceMode } from '@/components/robust/jpe-theme'

import { JpeButton } from '../jpe-design-system'
import { T } from '../robust/jpe-theme'

/**
 * EditorLayout - Main three-pane editor layout with navigation
 */

interface EditorLayoutProps {
  onNavigate?: (view: string) => void
}

export default function EditorLayout({ onNavigate }: EditorLayoutProps = {}) {
  const pathname = usePathname()
  const [inputMethod, setInputMethod] = useState<'physical' | 'virtual'>('physical')
  const [showKeyboard, setShowKeyboard] = useState(false)
  // Fix hydration hazard: Initialize showSplash to false, only set true after mount
  const [showSplash, setShowSplash] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Fix hydration hazard: Only access localStorage after mount
  useEffect(() => {
    setIsClient(true)
    try {
      const dismissed = localStorage.getItem('jpe-splash-dismissed')
      if (!dismissed) {
        setShowSplash(true)
      }
    } catch {
      // localStorage may be unavailable
    }
  }, [])
  
  const { workspaceMode, showDiagnostics, immersionMode, setImmersionMode, setWorkspaceMode } = useUIStore()
  const { diagnostics } = useDiagnosticStore()
  const [isExportWizardOpen, setIsExportWizardOpen] = useState(false)
  const { focusMode } = useGamepadNavigation()
  const { currentProject } = useProjectStore()
  const { closeAllTabs } = useEditorStore()
  const { clearDiagnostics } = useDiagnosticStore()

  // ── URL-TO-STATE SYNCHRONIZATION (Fix redirect loop) ──
  useEffect(() => {
    if (!isClient) return // Prevent running during hydration

    const isStudioPath = pathname === '/studio'
    const isManualPath = pathname === '/manual'
    const isRootPath = pathname === '/'
    const isInternalNav = typeof window !== 'undefined' && window.sessionStorage.getItem('jpe-internal-nav')

    // Only redirect on initial mount or external navigation
    if (isStudioPath && workspaceMode === 'dashboard' && !isInternalNav) {
      setWorkspaceMode('code')
    } else if (isManualPath && workspaceMode !== 'manual') {
      setWorkspaceMode('manual')
    } else if (isRootPath && workspaceMode !== 'dashboard') {
      setWorkspaceMode('dashboard')
    }

    // Clear internal nav flag after processing
    if (isInternalNav) {
      window.sessionStorage.removeItem('jpe-internal-nav')
    }
  }, [pathname, workspaceMode, setWorkspaceMode, isClient])

  useEffect(() => {
    setImmersionMode(focusMode ? 'zen' : 'normal')
  }, [focusMode, setImmersionMode])

  useEffect(() => {
    const handleGlobalExport = () => setIsExportWizardOpen(true)
    window.addEventListener('jpe:export', handleGlobalExport)
    window.addEventListener('jpe:build', handleGlobalExport) // Legacy fallback
    return () => {
      window.removeEventListener('jpe:export', handleGlobalExport)
      window.removeEventListener('jpe:build', handleGlobalExport)
    }
  }, [])

  useAutoSave()

  const handleNavigate = (item: string) => {
    if (item === 'build' || item === 'export') {
      setIsExportWizardOpen(true)
      return
    }
    
    // Mark as internal navigation to prevent automatic 'code' mode redirect if going to dashboard
    if (item === 'dashboard') {
      window.sessionStorage.setItem('jpe-internal-nav', 'true')
    } else {
      window.sessionStorage.removeItem('jpe-internal-nav')
    }

    hub.navigate(item as WorkspaceMode)
    onNavigate?.(item)
  }

  const handleSplashDismiss = () => {
    localStorage.setItem('jpe-splash-dismissed', 'true')
    setShowSplash(false)
  }

  useEffect(() => {
    closeAllTabs()
    clearDiagnostics()
  }, [currentProject?.id, closeAllTabs, clearDiagnostics])

  const isPlayground = workspaceMode === 'playground'
  const isDeepMode = isPlayground || workspaceMode === 'manual' || workspaceMode === 'rebels'
  const isZenOrDeep = immersionMode === 'zen' || isDeepMode

  return (
    <div data-testid="app-root" className="h-screen w-screen flex overflow-hidden" style={{ background: T.bg }}>
      {showSplash && <SplashScreen onDismiss={handleSplashDismiss} />}

      {!isZenOrDeep && (
        <AppNavigation activeItem={workspaceMode} onNavigate={handleNavigate} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {!isPlayground && (
          <TitleSection 
            inputMethod={inputMethod}
            setInputMethod={setInputMethod}
            showKeyboard={showKeyboard}
            setShowKeyboard={setShowKeyboard}
          />
        )}

        <StudioViewport 
          workspaceMode={workspaceMode} 
          immersionMode={immersionMode} 
          handleNavigate={handleNavigate}
        />

        <DiagnosticsSection 
          showDiagnostics={showDiagnostics}
          diagnostics={diagnostics}
        />

        <VirtualKeyboard 
          visible={showKeyboard && inputMethod === 'virtual'}
          onInput={(text) => TextInputHandler.getInstance().insertText(text)}
          onClose={() => setShowKeyboard(false)}
        />

        <ExportWizard
          isOpen={isExportWizardOpen}
          onClose={() => setIsExportWizardOpen(false)}
        />
      </div>
    </div>
  )
}

interface TitleSectionProps {
  inputMethod: 'physical' | 'virtual'
  setInputMethod: (method: 'physical' | 'virtual') => void
  showKeyboard: boolean
  setShowKeyboard: (show: boolean) => void
}

function TitleSection({ inputMethod, setInputMethod, showKeyboard, setShowKeyboard }: TitleSectionProps) {
  return (
    <div className="flex justify-between items-center bg-background-secondary pr-4 shrink-0 border-b border-white/5 h-12">
      <TitleBar />
      <div className="flex items-center gap-4">
        <InputMethodSelector 
          currentMethod={inputMethod} 
          onMethodChange={(method) => {
            setInputMethod(method)
            setShowKeyboard(method === 'virtual')
          }}
        />
        {inputMethod === 'virtual' && (
          <JpeButton 
            variant={showKeyboard ? "primary" : "secondary"}
            size="xs"
            onClick={() => setShowKeyboard(!showKeyboard)}
          >
            Keyboard
          </JpeButton>
        )}
      </div>
    </div>
  )
}

function StudioViewport({ workspaceMode, immersionMode, handleNavigate }: {
  workspaceMode: string;
  immersionMode: string;
  handleNavigate: (i: string) => void;
}) {
  const renderView = () => {
    switch (workspaceMode) {
      case 'dashboard': return <DashboardView onNavigate={(mode) => handleNavigate(mode as string)} />
      case 'projects': return <ProjectsPage onNavigate={handleNavigate} />
      case 'manual': return <JpeManualView />
      case 'settings': return <SettingsPage />
      case 'rebels': return <TS4RebelsPortal />
      case 'playground': return <JpePlaygroundView />
      case 'visual': return <VisualJpeEditor />
      default: return (
        <div className="flex-1 flex overflow-hidden relative transition-all duration-300">
          {immersionMode === 'normal' && (
            <div className="w-64 border-r border-border-subtle bg-bg-secondary overflow-y-auto flex-shrink-0">
              <Sidebar />
            </div>
          )}
          <div className={`flex-1 relative overflow-hidden ${immersionMode === 'zen' ? 'm-0' : ''}`}>
            <EditorPane />
            <PredictionOverlay />
          </div>
          {immersionMode !== 'zen' && <RightPanel />}
        </div>
      )
    }
  }

  return (
    <div data-testid="editor-main-viewport" className="flex-1 flex overflow-hidden relative">
      {renderView()}
    </div>
  )
}

function DiagnosticsSection({ showDiagnostics }: {
  showDiagnostics: boolean;
}) {
  if (!showDiagnostics) return null
  
  return (
    <div className="h-48 border-t border-white/5 overflow-hidden flex-shrink-0 bg-[#0a0a0a] relative">
      <DiagnosticsPanel />
    </div>
  )
}
