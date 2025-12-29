import { useState, useCallback, useEffect, memo } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { CompilerService } from '@/services/CompilerService'
import { useActivityStore } from '@/stores/useActivityStore'
import MenuBar from '@/components/menu/MenuBar'
import NewProjectDialog from '@/components/modals/NewProjectDialog'
import OpenProjectDialog from '@/components/modals/OpenProjectDialog'
import AddFileDialog from '@/components/modals/AddFileDialog'

function TitleBarComponent() {
  const { currentProject } = useProjectStore()
  const { addActivity } = useActivityStore()
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
      <div className="h-12 bg-background-secondary border-b border-border-subtle flex items-center px-2 shadow-apple-md">
        {/* Menu Bar */}
        <MenuBar />

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
    </>
  )
}

export default memo(TitleBarComponent)
