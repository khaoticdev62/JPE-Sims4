import { useState } from 'react'
import { StudioHomeDashboard } from "./components/StudioHomeDashboard";
import EditorLayout from "@/components/layout/EditorLayout";

export default function App() {
  const [activeView, setActiveView] = useState('home')

  return (
    <>
      {activeView === 'home' && <StudioHomeDashboard onNavigate={setActiveView} />}
      {activeView === 'studio' && <EditorLayout onNavigate={setActiveView} />}
      {/* Projects and Settings views can be added later */}
    </>
  )
}