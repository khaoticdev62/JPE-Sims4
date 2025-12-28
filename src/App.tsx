import { useState } from 'react'
import { StudioHomeDashboard } from "./components/StudioHomeDashboard";
import EditorLayout from "@/components/layout/EditorLayout";
import { ProjectsPage } from "@/components/ProjectsPage";
import { SettingsPage } from "@/components/SettingsPage";

export default function App() {
  const [activeView, setActiveView] = useState('home')

  return (
    <div data-testid="app-root">
      {activeView === 'home' && <StudioHomeDashboard onNavigate={setActiveView} />}
      {activeView === 'studio' && <EditorLayout onNavigate={setActiveView} />}
      {activeView === 'projects' && <ProjectsPage onNavigate={setActiveView} />}
      {activeView === 'settings' && <SettingsPage onNavigate={setActiveView} />}
    </div>
  )
}