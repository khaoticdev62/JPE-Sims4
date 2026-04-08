"use client";

import { useState, useCallback, useEffect } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { FileService } from '@/services/FileService'
import NewProjectDialog from '@/components/modals/NewProjectDialog'
import OpenProjectDialog from '@/components/modals/OpenProjectDialog'
import { toast } from 'sonner'

function FileMenu() {
  const { currentProject, recentProjects, openProject, addFile, saveFile, saveProject, setCurrentProject } = useProjectStore()
  const { tabs, activeTabId } = useEditorStore()
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [isOpenProjectOpen, setIsOpenProjectOpen] = useState(false)

  const handleAddFile = useCallback(async () => {
    if (!currentProject) return
    const paths = await FileService.openFile()
    if (paths && paths.length > 0) {
      for (const path of paths) {
        await addFile(path)
      }
      toast.success(`Added ${paths.length} file(s)`)
    }
  }, [currentProject, addFile])

  const handleSave = useCallback(async () => {
    const activeTab = tabs.find(t => t.id === activeTabId)
    if (activeTab) {
      await saveFile(activeTab.fileId)
      toast.success(`Saved ${activeTab.name}`)
    }
  }, [tabs, activeTabId, saveFile])

  const handleSaveAll = useCallback(async () => {
    if (currentProject) {
      await saveProject()
      toast.success('Project saved')
    }
  }, [currentProject, saveProject])

  const handleCloseProject = useCallback(() => {
    if (currentProject) {
      setCurrentProject(null)
      toast.info('Project closed')
    }
  }, [currentProject, setCurrentProject])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N for new project
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setIsNewProjectOpen(true)
      }
      // Ctrl+O for open project
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault()
        setIsOpenProjectOpen(true)
      }
      // Ctrl+S for save
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // Ctrl+Shift+S for save all
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault()
        handleSaveAll()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, handleSaveAll])

  const handleExit = useCallback(() => {
    const win = window as any
    if (win.electron && win.electron.app) {
      win.electron.app.quit()
    }
  }, [])

  // Get recent projects (last 5)
  const recentList = recentProjects.slice(0, 5)

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="px-3 py-2 text-sm font-medium text-text-primary hover:text-accent-primary hover:bg-background-tertiary rounded transition-colors data-[state=open]:bg-background-tertiary data-[state=open]:text-accent-primary">
            File
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-56 bg-background-tertiary border border-border-subtle rounded-lg shadow-lg z-50 overflow-hidden"
            sideOffset={8}
          >
            {/* New Project */}
            <DropdownMenu.Item asChild>
              <button
                onClick={() => setIsNewProjectOpen(true)}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
              >
                <span>New Project</span>
                <span className="text-xs text-text-secondary">Ctrl+N</span>
              </button>
            </DropdownMenu.Item>

            {/* Open Project */}
            <DropdownMenu.Item asChild>
              <button
                onClick={() => setIsOpenProjectOpen(true)}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
              >
                <span>Open Project</span>
                <span className="text-xs text-text-secondary">Ctrl+O</span>
              </button>
            </DropdownMenu.Item>

            {/* Add File */}
            <DropdownMenu.Item asChild>
              <button
                onClick={handleAddFile}
                disabled={!currentProject}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Add File</span>
              </button>
            </DropdownMenu.Item>

            {/* Separator */}
            <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

            {/* Save */}
            <DropdownMenu.Item asChild>
              <button
                onClick={handleSave}
                disabled={!currentProject || !activeTabId}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-primary"
              >
                <span>Save</span>
                <span className="text-xs text-text-secondary">Ctrl+S</span>
              </button>
            </DropdownMenu.Item>

            {/* Save All */}
            <DropdownMenu.Item asChild>
              <button
                onClick={handleSaveAll}
                disabled={!currentProject}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-primary"
              >
                <span>Save All</span>
                <span className="text-xs text-text-secondary">Ctrl+Shift+S</span>
              </button>
            </DropdownMenu.Item>

            {/* Separator */}
            <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

            {/* Close Project */}
            <DropdownMenu.Item asChild>
              <button
                onClick={handleCloseProject}
                disabled={!currentProject}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-primary"
              >
                Close Project
              </button>
            </DropdownMenu.Item>

            {/* Recent Projects Submenu */}
            {recentList.length > 0 && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger asChild>
                    <button className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center">
                      <span>Recent Projects</span>
                      <span className="text-xs">›</span>
                    </button>
                  </DropdownMenu.SubTrigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent
                      className="min-w-48 bg-background-tertiary border border-border-subtle rounded-lg shadow-lg z-50"
                      sideOffset={8}
                    >
                      {recentList.map((project) => (
                        <DropdownMenu.Item key={project.id} asChild>
                          <button
                            onClick={async () => {
                              try {
                                await openProject(project.rootPath)
                              } catch (error) {
                                console.error('Failed to open project:', error)
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors"
                          >
                            {project.name}
                          </button>
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
              </>
            )}

            {/* Separator */}
            <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

            {/* Exit */}
            <DropdownMenu.Item asChild>
              <button
                onClick={handleExit}
                className="w-full text-left px-4 py-2 text-sm text-state-error hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary transition-colors flex justify-between items-center"
              >
                <span>Exit</span>
                <span className="text-xs text-text-secondary">Alt+F4</span>
              </button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Dialogs */}
      <NewProjectDialog
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />
      <OpenProjectDialog
        isOpen={isOpenProjectOpen}
        onClose={() => setIsOpenProjectOpen(false)}
      />
    </>
  )
}

export default FileMenu
