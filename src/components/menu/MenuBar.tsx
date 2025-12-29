import { memo } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import FileMenu from './FileMenu'
import EditMenu from './EditMenu'
import ViewMenu from './ViewMenu'
import ProjectMenu from './ProjectMenu'
import HelpMenu from './HelpMenu'

function MenuBar() {
  const { currentProject } = useProjectStore()

  return (
    <div className="flex items-center gap-1 bg-background-secondary px-2">
      <FileMenu />
      <EditMenu />
      <ViewMenu />
      <ProjectMenu disabled={!currentProject} />
      <HelpMenu />
    </div>
  )
}

export default memo(MenuBar)
