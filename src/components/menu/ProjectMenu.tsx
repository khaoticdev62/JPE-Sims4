"use client";

import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useProjectStore } from '@/stores/useProjectStore'
import { CompilerService } from '@/services/CompilerService'
import { useActivityStore } from '@/stores/useActivityStore'
import AddFileDialog from '@/components/modals/AddFileDialog'

interface ProjectMenuProps {
  disabled?: boolean
}

function ProjectMenu({ disabled = false }: ProjectMenuProps) {
  const { currentProject } = useProjectStore()
  const { addActivity } = useActivityStore()
  const [isAddFileOpen, setIsAddFileOpen] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)

  const handleAddFiles = () => {
    setIsAddFileOpen(true)
  }

  const handleBuildProject = async () => {
    if (!currentProject) return

    try {
      setIsBuilding(true)

      // Compile the project
      const result = await CompilerService.compileProject(currentProject.files)

      if (result.success) {
        addActivity({
          type: 'completed',
          fileName: `${currentProject.name} project`,
          projectName: currentProject.name,
          projectId: currentProject.id,
        })
        console.warn('✓ Build successful')
      } else {
        console.warn('✗ Build failed')
      }
    } catch (error) {
      console.error('Build error:', error)
    } finally {
      setIsBuilding(false)
    }
  }

  const handleValidateAll = async () => {
    if (!currentProject) return

    try {
      // Validate all files in project
      const validationResults = await Promise.all(
        currentProject.files.map((file) =>
          CompilerService.validateFile(file)
        )
      )

      const errorCount = validationResults.filter(
        (result) => !result.valid
      ).length
      console.warn(`✓ Validation complete - ${errorCount} files with errors`)
    } catch (error) {
      console.error('Validation error:', error)
    }
  }

  const handleCleanBuild = () => {
    console.warn('Clean build action')
    // Clear cache and rebuild
    CompilerService.clearCache()
  }

  const handleExportPackage = () => {
    console.warn('Export to package action')
    // Will open export dialog
  }

  const handleProjectSettings = () => {
    console.warn('Project settings action')
    // Will open project settings dialog
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            disabled={disabled}
            className="px-3 py-2 text-sm font-medium text-text-primary hover:text-accent-primary hover:bg-background-tertiary rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed data-[state=open]:bg-background-tertiary data-[state=open]:text-accent-primary"
          >
            Project
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-56 bg-background-tertiary border border-border-subtle rounded-lg shadow-lg z-50 overflow-hidden"
            sideOffset={8}
          >
            {/* Add Files */}
            <DropdownMenu.Item asChild>
              <button
                onClick={handleAddFiles}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
              >
                <span>Add Files</span>
                <span className="text-xs text-text-secondary">Ctrl+Shift+A</span>
              </button>
            </DropdownMenu.Item>

            {/* Separator */}
            <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

            {/* Build Project */}
            <DropdownMenu.Item asChild>
              <button
                onClick={handleBuildProject}
                disabled={isBuilding}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isBuilding ? 'Building...' : 'Build Project'}</span>
                <span className="text-xs text-text-secondary">Ctrl+Shift+B</span>
              </button>
            </DropdownMenu.Item>

            {/* Validate All */}
            <DropdownMenu.Item asChild>
              <button
                onClick={handleValidateAll}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
              >
                <span>Validate All</span>
                <span className="text-xs text-text-secondary">Ctrl+Shift+V</span>
              </button>
            </DropdownMenu.Item>

            {/* Clean Build */}
            <DropdownMenu.Item asChild>
              <button
                onClick={handleCleanBuild}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors"
              >
                Clean Build
              </button>
            </DropdownMenu.Item>

            {/* Separator */}
            <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

            {/* Export to Package */}
            <DropdownMenu.Item asChild>
              <button
                onClick={handleExportPackage}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors"
              >
                Export to Package
              </button>
            </DropdownMenu.Item>

            {/* Separator */}
            <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

            {/* Project Settings */}
            <DropdownMenu.Item asChild>
              <button
                onClick={handleProjectSettings}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors"
              >
                Project Settings
              </button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Add File Dialog */}
      <AddFileDialog
        isOpen={isAddFileOpen}
        onClose={() => setIsAddFileOpen(false)}
      />
    </>
  )
}

export default ProjectMenu
