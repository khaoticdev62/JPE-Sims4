import { useCallback } from 'react'
import { useProjectStore } from '@stores/useProjectStore'
import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcuts'
import { ProjectService } from '@services/ProjectService'
import TitleBar from '@components/layout/TitleBar'
import Sidebar from '@components/layout/Sidebar'
import EditorPane from '@components/layout/EditorPane'
import RightPanel from '@components/layout/RightPanel'

function App() {
  const { initializeStore } = useProjectStore()

  // Initialize store on mount
  const handleInitialize = useCallback(() => {
    initializeStore()
  }, [initializeStore])

  // Handle save project (Ctrl+S)
  const handleSaveProject = useCallback(async () => {
    const success = await ProjectService.saveProject()
    if (success) {
      console.log('Project saved successfully')
    } else {
      console.error('Failed to save project')
    }
  }, [])

  // Setup keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 's',
      ctrlKey: true,
      handler: handleSaveProject,
    },
  ])

  // Initialize on mount
  if (typeof window !== 'undefined') {
    handleInitialize()
  }

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <EditorPane />
        <RightPanel />
      </div>
    </div>
  )
}

export default App
