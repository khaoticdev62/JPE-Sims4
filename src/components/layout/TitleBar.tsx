import { useState, useCallback, useEffect, memo } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { CompilerService } from '@/services/CompilerService'
import { useActivityStore } from '@/stores/useActivityStore'
import NewProjectDialog from '@/components/modals/NewProjectDialog'
import OpenProjectDialog from '@/components/modals/OpenProjectDialog'
import AddFileDialog from '@/components/modals/AddFileDialog'

function TitleBarComponent() {
  const { currentProject } = useProjectStore()
  const { addActivity } = useActivityStore()
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [isOpenProjectOpen, setIsOpenProjectOpen] = useState(false)
  const [isAddFileOpen, setIsAddFileOpen] = useState(false)
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false)
  const [isCompiling, setIsCompiling] = useState(false)
  const [compileMessage, setCompileMessage] = useState<string | null>(null)

  const projectName = currentProject?.name || 'JPE Mod Translator'

  const handleCompile = useCallback(async () => {
    if (!currentProject) return

    try {
      setIsCompiling(true)
      setCompileMessage(null)

      // Compile the current project
      const result = await CompilerService.compileProject(currentProject)

      if (result.success) {
        setCompileMessage(`✓ Compiled successfully (${result.filesProcessed} files)`)

        // Log activity
        addActivity({
          type: 'completed',
          fileName: `${currentProject.name} project`,
          projectName: currentProject.name,
          projectId: currentProject.id,
        })

        setTimeout(() => setCompileMessage(null), 3000)
      } else {
        setCompileMessage(`✗ Compilation failed: ${result.error}`)
        setTimeout(() => setCompileMessage(null), 4000)
      }
    } catch (error) {
      setCompileMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setCompileMessage(null), 4000)
    } finally {
      setIsCompiling(false)
    }
  }, [currentProject, addActivity])

  // Handle Ctrl+Shift+B keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault()
        handleCompile()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCompile])

  return (
    <>
      <div className="h-12 bg-bg-secondary border-b border-border-subtle flex items-center px-4 shadow-apple-md">
        {/* Menu Bar */}
        <div className="flex gap-4 flex-1">
          <div className="relative">
            <button
              onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
              className="text-sm text-text-primary hover:text-accent-primary hover:bg-bg-tertiary px-3 py-1 rounded transition-colors"
            >
              File
            </button>

            {/* File Menu Dropdown */}
            {isFileMenuOpen && (
              <div className="absolute top-full left-0 mt-0 bg-bg-tertiary border border-border-subtle rounded shadow-apple-lg min-w-48 z-40">
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false)
                    setIsNewProjectOpen(true)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary hover:text-accent-primary first:rounded-t transition-colors"
                >
                  New Project
                </button>
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false)
                    setIsOpenProjectOpen(true)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary hover:text-accent-primary transition-colors"
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
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary hover:text-accent-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add File
                </button>
                <hr className="my-1 border-border-subtle" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary hover:text-accent-primary last:rounded-b transition-colors"
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
          <h1 className="text-sm font-semibold text-text-primary">
            {projectName}
          </h1>
        </div>

        {/* Compile Button & Status */}
        <div className="flex items-center gap-3">
          {compileMessage && (
            <span className={`text-xs font-medium ${
              compileMessage.includes('✓')
                ? 'text-state-success'
                : 'text-state-error'
            }`}>
              {compileMessage}
            </span>
          )}

          <button
            onClick={handleCompile}
            disabled={!currentProject || isCompiling}
            title={!currentProject ? 'Load a project first' : 'Compile project (Ctrl+Shift+B)'}
            className="px-3 py-1 text-xs font-medium bg-accent-primary hover:bg-accent-focus text-text-primary rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompiling ? 'Compiling...' : 'Compile'}
          </button>

          {/* Version */}
          <div className="text-xs text-text-secondary">
            v1.0.0
          </div>
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

export default memo(TitleBarComponent)
