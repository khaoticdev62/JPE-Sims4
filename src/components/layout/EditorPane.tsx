import { useEditorStore } from '@stores/useEditorStore'

export default function EditorPane() {
  const { tabs, activeTabId } = useEditorStore()

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Editor Tabs */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-2 overflow-x-auto">
        {tabs.length > 0 ? (
          tabs.map((tab) => (
            <div
              key={tab.id}
              className={`px-3 py-2 text-xs cursor-pointer border-r border-slate-800 whitespace-nowrap ${
                tab.id === activeTabId
                  ? 'bg-slate-800 text-slate-100'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {tab.name}
              {tab.isDirty && <span className="ml-1">●</span>}
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-500 px-4">No files open</div>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center text-slate-400">
        {activeTabId && tabs.find((t) => t.id === activeTabId) ? (
          <div className="w-full h-full flex flex-col">
            {/* CodeMirror or text editor will go here */}
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Editor implementation in progress
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-sm mb-2">No file selected</div>
            <div className="text-xs">Open a file to begin editing</div>
          </div>
        )}
      </div>
    </div>
  )
}
