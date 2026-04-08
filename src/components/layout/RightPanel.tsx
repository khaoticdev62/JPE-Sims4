"use client";

import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useUIStore } from '@/stores/useUIStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { memo, useCallback } from 'react'
import PreviewPane from '@/components/editor/PreviewPane'
import DiagnosticsPanel from '@/components/editor/DiagnosticsPanel'
import { revealInMonaco } from '@/utils/editor'
import { useCodeFix } from '@/hooks/useCodeFix'

import { DocumentationPanel } from '@/components/editor/DocumentationPanel'
import { JpeCopilotPane } from '@/components/copilot/JpeCopilotPane'

function RightPanelComponent() {
  const { getFilteredDiagnostics } = useDiagnosticStore()
  const { rightPanelCollapsed, rightPanelTab, setRightPanelTab } = useUIStore()
  const { activeFileId: _activeFileId } = useEditorStore()
  const { isFixing, requestFix } = useCodeFix()

  const diagnostics = getFilteredDiagnostics()

  const handleSelectDiagnostic = useCallback((diag: any) => {
    revealInMonaco(diag)
  }, [])

  if (rightPanelCollapsed) {
    const tabLabel = rightPanelTab === 'diagnostics' 
      ? `Diagnostics (${diagnostics.length})` 
      : rightPanelTab === 'preview' 
        ? 'XML Preview'
        : rightPanelTab === 'docs'
          ? 'Documentation'
          : 'AI Copilot'

    return (
      <div className="w-12 bg-bg-secondary border-l border-border-subtle flex flex-col items-center py-8 gap-12 cursor-pointer hover:bg-bg-tertiary transition-colors" onClick={() => useUIStore.getState().toggleRightPanel()}>
        <div className="vertical-text text-[10px] font-bold uppercase tracking-widest text-text-secondary rotate-180" style={{ writingMode: 'vertical-lr' }}>
          {tabLabel}
        </div>
      </div>
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const tabs: ('diagnostics' | 'preview' | 'docs' | 'copilot')[] = ['diagnostics', 'preview', 'docs', 'copilot']
    const currentIndex = tabs.indexOf(rightPanelTab)
    
    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % tabs.length
      setRightPanelTab(tabs[nextIndex])
      document.getElementById(`tab-${tabs[nextIndex]}`)?.focus()
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
      setRightPanelTab(tabs[prevIndex])
      document.getElementById(`tab-${tabs[prevIndex]}`)?.focus()
    }
  }

  return (
    <div 
      id="right-panel" 
      data-testid="right-panel" 
      data-tutorial="right-panel-root"
      tabIndex={0}
      className="w-80 bg-bg-secondary border-l border-border-subtle flex flex-col overflow-hidden focus:outline-none"
    >
      {/* Tab Header */}
      <div 
        className="h-10 flex border-b border-border-subtle bg-bg-primary"
        role="tablist"
        aria-label="Panel Navigation"
        onKeyDown={handleKeyDown}
      >
        <button
          id="tab-diagnostics"
          role="tab"
          aria-selected={rightPanelTab === 'diagnostics'}
          aria-controls="panel-diagnostics"
          onClick={() => setRightPanelTab('diagnostics')}
          className={`flex-1 text-[9px] font-bold uppercase tracking-wider transition-all border-b-2 px-1 focus-ring ${
            rightPanelTab === 'diagnostics'
              ? 'border-accent-primary text-text-primary bg-bg-secondary shadow-inner'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Diag ({diagnostics.length})
        </button>
        <button
          id="tab-preview"
          role="tab"
          aria-selected={rightPanelTab === 'preview'}
          aria-controls="panel-preview"
          onClick={() => setRightPanelTab('preview')}
          className={`flex-1 text-[9px] font-bold uppercase tracking-wider transition-all border-b-2 px-1 focus-ring ${
            rightPanelTab === 'preview'
              ? 'border-accent-primary text-text-primary bg-bg-secondary shadow-inner'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          XML
        </button>
        <button
          id="tab-docs"
          role="tab"
          aria-selected={rightPanelTab === 'docs'}
          aria-controls="panel-docs"
          onClick={() => setRightPanelTab('docs')}
          className={`flex-1 text-[9px] font-bold uppercase tracking-wider transition-all border-b-2 px-1 focus-ring ${
            rightPanelTab === 'docs'
              ? 'border-accent-primary text-text-primary bg-bg-secondary shadow-inner'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Docs
        </button>
        <button
          id="tab-copilot"
          role="tab"
          aria-selected={rightPanelTab === 'copilot'}
          aria-controls="panel-copilot"
          onClick={() => setRightPanelTab('copilot')}
          className={`flex-1 text-[9px] font-bold uppercase tracking-wider transition-all border-b-2 px-1 focus-ring ${
            rightPanelTab === 'copilot'
              ? 'border-accent-primary text-text-primary bg-bg-secondary shadow-inner'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          AI
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div 
          id="panel-diagnostics" 
          role="tabpanel" 
          aria-labelledby="tab-diagnostics" 
          className={`h-full ${rightPanelTab !== 'diagnostics' ? 'hidden' : ''}`}
        >
          <DiagnosticsPanel
            diagnostics={diagnostics}
            onSelectDiagnostic={handleSelectDiagnostic}
            onFix={(diag) => requestFix(diag)}
            isFixing={isFixing}
            isOpen={true}
          />
        </div>
        <div 
          id="panel-preview" 
          role="tabpanel" 
          aria-labelledby="tab-preview" 
          className={`h-full ${rightPanelTab !== 'preview' ? 'hidden' : ''}`}
        >
          <PreviewPane />
        </div>
        <div 
          id="panel-docs" 
          role="tabpanel" 
          aria-labelledby="tab-docs" 
          className={`h-full ${rightPanelTab !== 'docs' ? 'hidden' : ''}`}
        >
          <DocumentationPanel />
        </div>
        <div 
          id="panel-copilot" 
          role="tabpanel" 
          aria-labelledby="tab-copilot" 
          className={`h-full ${rightPanelTab !== 'copilot' ? 'hidden' : ''}`}
        >
          <JpeCopilotPane />
        </div>
      </div>
    </div>
  );
}

export default memo(RightPanelComponent)
