import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useUIStore } from '@/stores/useUIStore'

export default function Sidebar() {
  const { currentProject } = useProjectStore()
  const { openTab } = useEditorStore()
  const { sidebarCollapsed } = useUIStore()

  if (sidebarCollapsed) {
    return (
      <div className="w-12 bg-bg-secondary border-r border-border-subtle flex flex-col items-center py-4">
        <div className="text-xs text-text-secondary">Files</div>
      </div>
    )
  }

  const handleFileClick = (fileId: string, fileName: string) => {
    openTab({
      id: `tab-${fileId}`,
      fileId,
      name: fileName,
      isDirty: false,
    })
  }

  return (
    <div className="w-64 bg-bg-secondary border-r border-border-subtle flex flex-col overflow-hidden">
      <div className="h-12 border-b border-border-subtle flex items-center px-4">
        <h2 className="text-sm font-semibold text-text-primary">
          {currentProject?.name ? 'Project Files' : 'No Project'}
        </h2>
        {currentProject?.files && currentProject.files.length > 0 && (
          <span className="ml-auto text-xs bg-bg-tertiary text-text-secondary px-2 py-1 rounded">
            {currentProject.files.length}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {currentProject?.files && currentProject.files.length > 0 ? (
          <div className="p-2 space-y-1">
            {currentProject.files.map((file) => (
              <div
                key={file.id}
                data-testid={`file-${file.name}`}
                onClick={() => handleFileClick(file.id, file.name)}
                className="px-3 py-2 text-xs text-text-secondary hover:bg-bg-tertiary hover:text-text-primary bg-bg-tertiary rounded cursor-pointer truncate transition-colors group flex items-center justify-between"
                title={file.path}
              >
                <span className="truncate flex-1">
                  {file.name}
                  {file.isDirty && <span className="ml-1 text-state-warning">●</span>}
                </span>
                <span className="ml-1 text-text-secondary text-xs opacity-0 group-hover:opacity-100">
                  {file.type}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-xs text-text-secondary text-center">
            {currentProject
              ? 'No files in project\nUse File → Add File to add mods'
              : 'No project loaded\nUse File → New Project to start'}
          </div>
        )}
      </div>
    </div>
  )
}
