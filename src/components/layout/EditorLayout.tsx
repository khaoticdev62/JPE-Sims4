import { useState, useEffect } from 'react'
import TitleBar from './TitleBar'
import Sidebar from './Sidebar'
import EditorPane from './EditorPane'
import RightPanel from './RightPanel'
import DiagnosticsPanel from '@/components/editor/DiagnosticsPanel'
import { AppNavigation } from '@/components/AppNavigation'
import { useUIStore } from '@/stores/useUIStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useAutoSave } from '@/hooks/useAutoSave'

/**
 * EditorLayout - Main three-pane editor layout with navigation
 *
 * ┌──────────┬─────────────────────────────────────────┐
 * │          │           TitleBar                      │
 * │ AppNav   ├──────────────┬───────────┬──────────────┤
 * │          │   Sidebar    │ EditorPane│  RightPanel  │
 * │(Home,    │  (Projects)  │(Monaco)   │(Diagnostics) │
 * │Studio,   │              │           │              │
 * │Settings) ├──────────────┴───────────┴──────────────┤
 * │          │    DiagnosticsPanel                     │
 * └──────────┴─────────────────────────────────────────┘
 */

interface EditorLayoutProps {
  onNavigate?: (view: string) => void
}

import { VirtualKeyboard } from '@/components/input/VirtualKeyboard'
import { InputMethodSelector } from '@/components/input/InputMethodSelector'
import { TextInputHandler } from '@/services/input/TextInputHandler'

export default function EditorLayout({ onNavigate }: EditorLayoutProps = {}) {
  const [activeNav, setActiveNav] = useState('studio')
  const [inputMethod, setInputMethod] = useState<'physical' | 'virtual'>('physical')
  const [showKeyboard, setShowKeyboard] = useState(false)
  const { showDiagnostics } = useUIStore()
  const { diagnostics } = useDiagnosticStore()
  const { currentProject } = useProjectStore()
  const { closeAllTabs } = useEditorStore()
  const { clearDiagnostics } = useDiagnosticStore()

  // Initialize auto-save logic
  useAutoSave()

  const textInputHandler = TextInputHandler.getInstance()

  const handleNavigate = (item: string) => {
    setActiveNav(item)
    onNavigate?.(item)
  }

  const handleVirtualInput = (text: string) => {
    if (text === '\b') {
      // Handle backspace via trigger
      // Note: We'd need to expose this more cleanly
    } else {
      textInputHandler.insertText(text)
    }
  }

  // Sync state when project changes
  // Close all editor tabs and clear diagnostics when switching projects
  useEffect(() => {
    closeAllTabs()
    clearDiagnostics()
  }, [currentProject?.id, closeAllTabs, clearDiagnostics])

  return (
    <div data-testid="editor-layout" className="h-screen w-screen flex bg-bg-primary overflow-hidden">
      {/* Left Navigation */}
      <AppNavigation activeItem={activeNav} onNavigate={handleNavigate} />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Title Bar */}
        <div className="flex justify-between items-center bg-bg-secondary pr-4">
          <TitleBar />
          <div className="flex items-center gap-4">
            <InputMethodSelector 
              currentMethod={inputMethod} 
              onMethodChange={(method) => {
                setInputMethod(method)
                if (method === 'virtual') setShowKeyboard(true)
                else setShowKeyboard(false)
              }}
            />
            {inputMethod === 'virtual' && (
              <button 
                onClick={() => setShowKeyboard(!showKeyboard)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  showKeyboard ? 'bg-accent-primary text-text-primary' : 'bg-bg-tertiary text-text-secondary'
                }`}
              >
                Keyboard
              </button>
            )}
          </div>
        </div>

import { PredictionOverlay } from '@/components/editor/PredictionOverlay'

        {/* Main Content Area: Three-Pane Layout */}
        <div data-testid="editor-three-pane" className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar: Project Explorer */}
          <Sidebar />

          {/* Center: Editor Pane */}
          <div className="flex-1 relative overflow-hidden">
            <EditorPane />
            <PredictionOverlay />
          </div>

          {/* Right Panel: Diagnostics/Preview */}
          <RightPanel />
        </div>

        {/* Bottom Diagnostics Panel */}
        {showDiagnostics && diagnostics.length > 0 && (
          <div className="h-40 border-t border-border-subtle overflow-hidden">
            <DiagnosticsPanel
              diagnostics={diagnostics.map((d) => ({
                line: d.line,
                severity: d.severity as 'error' | 'warning' | 'info',
                message: d.message,
                code: d.code,
              }))}
              isOpen={showDiagnostics}
              className="h-full"
            />
          </div>
        )}

        {/* Virtual Keyboard Overlay */}
        <VirtualKeyboard 
          visible={showKeyboard && inputMethod === 'virtual'}
          onInput={handleVirtualInput}
          onClose={() => setShowKeyboard(false)}
        />
      </div>
    </div>
  )
}
