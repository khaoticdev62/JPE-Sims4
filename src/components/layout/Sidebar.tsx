import { useProjectStore } from '@stores/useProjectStore'
import { useUIStore } from '@stores/useUIStore'

export default function Sidebar() {
  const { currentProject } = useProjectStore()
  const { sidebarCollapsed } = useUIStore()

  if (sidebarCollapsed) {
    return (
      <div className="w-12 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4">
        <div className="text-xs text-slate-400">Files</div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
      <div className="h-12 border-b border-slate-800 flex items-center px-4">
        <h2 className="text-sm font-semibold text-slate-100">
          {currentProject?.name ? 'Project Files' : 'No Project'}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {currentProject?.files && currentProject.files.length > 0 ? (
          <div className="p-2">
            {currentProject.files.map((file) => (
              <div
                key={file.id}
                className="px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded cursor-pointer truncate"
              >
                {file.name}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-xs text-slate-500 text-center">
            No files loaded
          </div>
        )}
      </div>
    </div>
  )
}
