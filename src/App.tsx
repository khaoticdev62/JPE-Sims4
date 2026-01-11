import { useState } from 'react'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { StudioHomeDashboard } from "./components/StudioHomeDashboard";
import EditorLayout from "@/components/layout/EditorLayout";
import { ProjectsPage } from "@/components/ProjectsPage";
import { SettingsPage } from "@/components/SettingsPage";

import { ControllerManager } from '@/components/controller/ControllerManager'

function AppContent({ activeView, setActiveView }: { activeView: string; setActiveView: (view: string) => void }) {
  return (
    <div data-testid="app-root">
      <ControllerManager>
        {activeView === 'home' && (
          <ErrorBoundary>
            <StudioHomeDashboard onNavigate={setActiveView} />
          </ErrorBoundary>
        )}
        {activeView === 'studio' && (
          <ErrorBoundary>
            <EditorLayout onNavigate={setActiveView} />
          </ErrorBoundary>
        )}
        {activeView === 'projects' && (
          <ErrorBoundary>
            <ProjectsPage onNavigate={setActiveView} />
          </ErrorBoundary>
        )}
        {activeView === 'settings' && (
          <ErrorBoundary>
            <SettingsPage onNavigate={setActiveView} />
          </ErrorBoundary>
        )}
      </ControllerManager>
    </div>
  )
}

export default function App() {
  const [activeView, setActiveView] = useState('home')

  return (
    <ErrorBoundary>
      <AppContent activeView={activeView} setActiveView={setActiveView} />
    </ErrorBoundary>
  )
}