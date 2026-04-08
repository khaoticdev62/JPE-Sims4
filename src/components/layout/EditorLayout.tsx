"use client";
import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import TitleBar from './TitleBar'
import EditorPane from './EditorPane'
import RightPanel from './RightPanel'
import { AppNavigation } from '@/components/AppNavigation'
import { JpePlaygroundView } from "../playground/JpePlaygroundView";
import { VisualJpeEditor } from "../visual/VisualJpeEditor";
import { JpeManualView } from "../manual/JpeManualView";
import { DashboardView } from '@/components/DashboardView'
import { ProjectsPage } from '@/components/ProjectsPage'
import { SettingsPage } from '@/components/SettingsPage'
import { TS4RebelsPortal } from '@/components/rebels/TS4RebelsPortal'
import { BuildProgressModal } from '@/components/modals/BuildProgressModal'
import { SplashScreen } from '@/components/SplashScreen'
import { useUIStore } from '@/stores/useUIStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Sidebar } from '@/components/sidebar/Sidebar'
import DiagnosticsPanel from '@/components/editor/DiagnosticsPanel'
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
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('jpe-splash-dismissed')
    }
    return true
  })
  
  const { workspaceMode, showDiagnostics, immersionMode, setImmersionMode, setWorkspaceMode } = useUIStore()
  const { diagnostics } = useDiagnosticStore()
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false)
  const { focusMode } = useGamepadNavigation()
  const { currentProject } = useProjectStore()
  const { closeAllTabs } = useEditorStore()
  const { clearDiagnostics } = useDiagnosticStore()

  // ── URL-TO-STATE SYNCHRONIZATION ──
  useEffect(() => {
    if (pathname === '/studio' && workspaceMode === 'dashboard') {
       // Deep link into the studio should trigger industrial coding mode
       setWorkspaceMode('code')
    } else if (pathname === '/manual' && workspaceMode !== 'manual') {
       setWorkspaceMode('manual')
    } else if (pathname === '/' && workspaceMode !== 'dashboard') {
       setWorkspaceMode('dashboard')
    }
  }, [pathname, workspaceMode, setWorkspaceMode])

  useEffect(() => {
    setImmersionMode(focusMode ? 'zen' : 'normal')
  }, [focusMode, setImmersionMode])

  useEffect(() => {
    const handleGlobalBuild = () => setIsBuildModalOpen(true)
    window.addEventListener('jpe:build', handleGlobalBuild)
    return () => window.removeEventListener('jpe:build', handleGlobalBuild)
  }, [])

  useAutoSave()

  const handleNavigate = (item: string) => {
    if (item === 'build') {
      setIsBuildModalOpen(true)
      return
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
  const isZenOrPlayground = immersionMode === 'zen' || isPlayground

  return (
    <div data-testid="app-root" className="h-screen w-screen flex overflow-hidden" style={{ background: T.bg }}>
      {showSplash && <SplashScreen onDismiss={handleSplashDismiss} />}

      {!isZenOrPlayground && (
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

        <BuildProgressModal
          isOpen={isBuildModalOpen}
          onClose={() => setIsBuildModalOpen(false)}
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
    <div className="flex justify-between items-center bg-bg-secondary pr-4 shrink-0 border-b border-white/5 h-12">
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

function DiagnosticsSection({ showDiagnostics, diagnostics }: {
  showDiagnostics: boolean;
  diagnostics: Diagnostic[];
}) {
  if (!showDiagnostics || diagnostics.length === 0) return null
  
  return (
    <div className="h-40 border-t border-border-subtle overflow-hidden flex-shrink-0 bg-bg-panel">
      <DiagnosticsPanel
        diagnostics={diagnostics}
        isOpen={showDiagnostics}
        className="h-full"
      />
    </div>
  )
}
