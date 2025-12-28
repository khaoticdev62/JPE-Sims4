import { useState } from 'react'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { StudioHomeDashboard } from "./components/StudioHomeDashboard";
import EditorLayout from "@/components/layout/EditorLayout";
import { ProjectsPage } from "@/components/ProjectsPage";
import { SettingsPage } from "@/components/SettingsPage";

function AppContent({ activeView, setActiveView }: { activeView: string; setActiveView: (view: string) => void }) {
  return (
    <div data-testid="app-root">
      {activeView === 'home' && <StudioHomeDashboard onNavigate={setActiveView} />}
      {activeView === 'studio' && <EditorLayout onNavigate={setActiveView} />}
      {activeView === 'projects' && <ProjectsPage onNavigate={setActiveView} />}
      {activeView === 'settings' && <SettingsPage onNavigate={setActiveView} />}
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