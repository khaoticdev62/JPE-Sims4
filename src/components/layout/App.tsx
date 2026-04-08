"use client";

import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import TitleBar from './TitleBar';
import { Sidebar } from './Sidebar';
import EditorPane from './EditorPane';
import RightPanel from './RightPanel';
import { StatusBar } from './StatusBar';
import { TutorialOverlay } from '../guides/TutorialOverlay';
import { CommandPalette } from '../CommandPalette';
import { AppNavigation } from '../AppNavigation';
import { JustPlainManual } from '../manual/JustPlainManual';
import { useManualStore } from '../../stores/useManualStore';
import { toast } from 'sonner';

import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useSentinelStore } from '../../stores/useSentinelStore';
import { useUIStore } from '../../stores/useUIStore';

export const AppShell: React.FC = () => {
  const { workspaceMode, setWorkspaceMode } = useUIStore();
  const { startWatcher, stopWatcher, performScan } = useSentinelStore();
  
  // Activate Keyboard-Only Navigation (Story 5.3)
  useKeyboardNavigation();

  // Initialize Background Sentinel (Story 9.1)
  React.useEffect(() => {
    startWatcher();

    // Session Recovery Notification (Story 9.3)
    const store = JSON.parse(localStorage.getItem('editor-store') || '{}');
    if (store.state?.tabs?.length > 0) {
      toast.info('Session Restored', {
        description: `Successfully recovered ${store.state.tabs.length} open workspace protocols.`,
        icon: '🔄',
      });
    }

    // Background polling every 5 minutes
    const interval = setInterval(() => {
      performScan();
    }, 5 * 60 * 1000);

    return () => {
      stopWatcher();
      clearInterval(interval);
    };
  }, [startWatcher, stopWatcher, performScan]);

  const handleNavigate = (item: string) => {
    setWorkspaceMode(item as any);
    if (item === 'manual' || item === 'jpe') {
      useManualStore.getState().toggleHelp(true);
    } else {
      useManualStore.getState().toggleHelp(false);
    }
  };

  return (
    <div data-testid="app-root" className="h-screen w-screen flex bg-jpe-bg overflow-hidden font-sans text-jpe-text">
      {/* Skip to Content for A11y */}
      <a href="#main-content" className="skip-to-content">Skip to Editor (Alt+2)</a>
      
      {/* Global Navigation Bar */}
      {workspaceMode !== 'playground' && (
        <div className="z-[40]">
          <AppNavigation activeItem={workspaceMode} onNavigate={handleNavigate} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {workspaceMode !== 'playground' && (
          <header>
            <TitleBar />
          </header>
        )}
        
        <div className="flex-1 overflow-hidden">
          {workspaceMode === 'manual' || workspaceMode === 'jpe' ? (
            <JustPlainManual />
          ) : (
            <PanelGroup direction="horizontal" autoSaveId="layout-persistence">
              
              <Panel defaultSize={20} minSize={10} maxSize={40} className="bg-surface border-r border-secondary z-[30]" id="sidebar-panel">
                <nav aria-label="Main Navigation">
                  <Sidebar />
                </nav>
              </Panel>
              
              <PanelResizeHandle className="w-1 bg-secondary hover:bg-accent transition-colors duration-300 ease-[var(--default-transition-timing-function)] cursor-col-resize active:bg-accent delay-75" />
              
              <Panel defaultSize={60} minSize={30} id="editor-pane">
                <main id="main-content" tabIndex={-1} className="h-full focus:outline-none" aria-label="Editor">
                  <EditorPane />
                </main>
              </Panel>
              
              <PanelResizeHandle className="w-1 bg-secondary hover:bg-accent transition-colors duration-200 cursor-col-resize active:bg-accent delay-100" />
              
              <Panel defaultSize={20} minSize={15} maxSize={40} className="bg-surface border-l border-secondary" id="right-panel">
                <aside aria-label="Contextual Panels">
                  <RightPanel />
                </aside>
              </Panel>
              
            </PanelGroup>
          )}
        </div>

        <footer className="relative z-[50]">
          <StatusBar />
        </footer>
      </div>

      <TutorialOverlay />
      <CommandPalette 
        isOpen={useUIStore(s => s.isCommandPaletteOpen)} 
        onClose={() => useUIStore.getState().setCommandPaletteOpen(false)}
        onSwitchMode={handleNavigate}
        currentMode={workspaceMode}
      />
    </div>
  );
};

export default AppShell;
