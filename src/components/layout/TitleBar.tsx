import { useState } from 'react'
import { useProjectStore } from '@stores/useProjectStore'
import NewProjectDialog from '@components/modals/NewProjectDialog'
import OpenProjectDialog from '@components/modals/OpenProjectDialog'
import AddFileDialog from '@components/modals/AddFileDialog'

export default function TitleBar() {
  const { currentProject } = useProjectStore()
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [isOpenProjectOpen, setIsOpenProjectOpen] = useState(false)
  const [isAddFileOpen, setIsAddFileOpen] = useState(false)
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false)

  const projectName = currentProject?.name || 'JPE Mod Translator'

  return (
    <>
      <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4">
        {/* Menu Bar */}
        <div className="flex gap-4 flex-1">
          <div className="relative">
            <button
              onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
              className="text-sm text-slate-100 hover:bg-slate-800 px-3 py-1 rounded transition-colors"
            >
              File
            </button>

            {/* File Menu Dropdown */}
            {isFileMenuOpen && (
              <div className="absolute top-full left-0 mt-0 bg-slate-800 border border-slate-700 rounded shadow-lg min-w-48 z-40">
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false)
                    setIsNewProjectOpen(true)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-100 hover:bg-slate-700 first:rounded-t transition-colors"
                >
                  New Project
                </button>
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false)
                    setIsOpenProjectOpen(true)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-100 hover:bg-slate-700 transition-colors"
                >
                  Open Project
                </button>
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false)
                    setIsAddFileOpen(true)
                  }}
                  disabled={!currentProject}
                  title={!currentProject ? 'Load a project first' : ''}
                  className="w-full text-left px-4 py-2 text-sm text-slate-100 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add File
                </button>
                <hr className="my-1 border-slate-700" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-slate-100 hover:bg-slate-700 last:rounded-b transition-colors"
                  disabled
                  title="Coming soon"
                >
                  Exit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Name */}
        <div className="flex-1 text-center">
          <h1 className="text-sm font-semibold text-slate-100">
            {projectName}
          </h1>
        </div>

        {/* Version */}
        <div className="text-xs text-slate-400">
          v1.0.0
        </div>
      </div>

      {/* Dialogs */}
      <NewProjectDialog
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />
      <OpenProjectDialog
        isOpen={isOpenProjectOpen}
        onClose={() => setIsOpenProjectOpen(false)}
      />
      <AddFileDialog
        isOpen={isAddFileOpen}
        onClose={() => setIsAddFileOpen(false)}
      />
    </>
  )
}
