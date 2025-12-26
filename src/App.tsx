import { useEffect } from 'react'
import { useProjectStore } from '@stores/useProjectStore'
import TitleBar from '@components/layout/TitleBar'
import Sidebar from '@components/layout/Sidebar'
import EditorPane from '@components/layout/EditorPane'
import RightPanel from '@components/layout/RightPanel'

function App() {
  const { initializeStore } = useProjectStore()

  useEffect(() => {
    initializeStore()
  }, [initializeStore])

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
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
