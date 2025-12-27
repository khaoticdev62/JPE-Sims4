import { useState } from 'react'
import TitleBar from './TitleBar'
import Sidebar from './Sidebar'
import EditorPane from './EditorPane'
import RightPanel from './RightPanel'
import DiagnosticsPanel from '@/components/editor/DiagnosticsPanel'
import { AppNavigation } from '@/components/AppNavigation'
import { useUIStore } from '@/stores/useUIStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'

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

export default function EditorLayout({ onNavigate }: EditorLayoutProps = {}) {
  const [activeNav, setActiveNav] = useState('studio')
  const { showDiagnostics } = useUIStore()
  const { diagnostics } = useDiagnosticStore()

  const handleNavigate = (item: string) => {
    setActiveNav(item)
    onNavigate?.(item)
  }

  return (
    <div className="h-screen w-screen flex bg-bg-primary overflow-hidden">
      {/* Left Navigation */}
      <AppNavigation activeItem={activeNav} onNavigate={handleNavigate} />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Title Bar */}
        <TitleBar />

        {/* Main Content Area: Three-Pane Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Project Explorer */}
          <Sidebar />

          {/* Center: Editor Pane */}
          <EditorPane />

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
      </div>
    </div>
  )
}
