"use client";

/**
 * ProjectExplorer — Sidebar file tree component
 *
 * Displays the current project's files in a FileTree.
 * Wires FileTree.onOpenFile to the editor store: clicking a file opens it in the Monaco editor.
 */

import { useCallback } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import FileTree from '@/components/file-tree/FileTree'
import { FolderOpen, FilePlus, Inbox } from 'lucide-react'
import type { ModFile } from '@/types/index'

interface ProjectExplorerProps {
  onOpenProject?: () => void
  onAddFile?: () => void
}

export default function ProjectExplorer({ onOpenProject, onAddFile }: ProjectExplorerProps) {
  const { currentProject } = useProjectStore()
  const { tabs, openTab, setActiveTab } = useEditorStore()

  const files = currentProject?.files ?? []

  /**
   * Handle file click: open or activate existing tab
   */
  const handleOpenFile = useCallback(
    (file: ModFile) => {
      // Check if tab already exists for this file
      const existingTab = tabs.find((t) => t.fileId === file.id)

      if (existingTab) {
        // Activate existing tab
        setActiveTab(existingTab.id)
      } else {
        // Open new tab
        openTab({
          id: `tab-${file.id}-${Date.now()}`,
          fileId: file.id,
          name: file.name,
          isDirty: false,
        })
      }
    },
    [tabs, openTab, setActiveTab]
  )

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Inbox className="w-8 h-8 text-slate-500 mb-3" />
        <p className="text-xs text-slate-400 mb-2">No project loaded</p>
        {onOpenProject && (
          <button
            onClick={onOpenProject}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FolderOpen className="w-3 h-3" />
            Open Project
          </button>
        )}
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="h-full flex flex-col p-3">
        {/* Project Header */}
        <div className="mb-3 pb-3 border-b border-slate-700/50">
          <h3 className="text-xs font-semibold text-slate-200 truncate" title={currentProject.name}>
            {currentProject.name}
          </h3>
          <p className="text-[10px] text-slate-500 truncate mt-0.5" title={currentProject.rootPath}>
            {currentProject.rootPath}
          </p>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Inbox className="w-6 h-6 text-slate-600 mb-2" />
          <p className="text-xs text-slate-400 mb-3">No files in project</p>
          {onAddFile && (
            <button
              onClick={onAddFile}
              data-tutorial="add-file-btn"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FilePlus className="w-3 h-3" />
              Add Files
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div data-testid="project-explorer" data-tutorial="explorer-root" className="h-full flex flex-col">
      {/* Project Header */}
      <div className="px-3 py-2 border-b border-slate-700/50 flex-shrink-0">
        <h3 className="text-xs font-semibold text-slate-200 truncate" title={currentProject.name}>
          {currentProject.name}
        </h3>
        <p className="text-[10px] text-slate-500 truncate mt-0.5" title={currentProject.rootPath}>
          {currentProject.rootPath}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">{files.length} file{files.length !== 1 ? 's' : ''}</p>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <FileTree
          onOpenFile={handleOpenFile}
          onAddFile={onAddFile}
        />
      </div>
    </div>
  )
}
