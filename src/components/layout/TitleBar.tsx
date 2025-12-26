import { useProjectStore } from '@stores/useProjectStore'

export default function TitleBar() {
  const { currentProject } = useProjectStore()
  const projectName = currentProject?.name || 'JPE Mod Translator'

  return (
    <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4">
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-slate-100">
          {projectName}
        </h1>
      </div>
      <div className="text-xs text-slate-400">
        v1.0.0
      </div>
    </div>
  )
}
