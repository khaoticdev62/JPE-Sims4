import { useMemo } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useEditorStore } from '@/stores/useEditorStore'
import FileGroupHeader from './FileGroupHeader'
import FileTreeNode from './FileTreeNode'
import type { ModFile } from '@/types/index'

interface FileTreeProps {
  onOpenFile?: (file: ModFile) => void
  onValidateFile?: (file: ModFile) => void
  onDeleteFile?: (file: ModFile) => void
  onRenameFile?: (file: ModFile) => void
}

interface FileGroup {
  name: string
  icon: string
  pattern: (name: string) => boolean
  files: ModFile[]
}

/**
 * Enhanced file tree with grouping, status indicators, and context menu
 * Groups files by type: Tuning, String Tables, Scripts, Other
 */
export default function FileTree({
  onOpenFile,
  onValidateFile,
  onDeleteFile,
  onRenameFile,
}: FileTreeProps) {
  const { currentProject } = useProjectStore()
  const { getDiagnosticsForFile } = useDiagnosticStore()
  const { activeFileId } = useEditorStore()

  // Define file groups by type
  const fileGroups = useMemo((): FileGroup[] => {
    return [
      {
        name: 'Tuning Files',
        icon: '⚙️',
        pattern: (name) => name.endsWith('.xml') && !name.endsWith('.config.xml'),
        files: [],
      },
      {
        name: 'String Tables',
        icon: '🔤',
        pattern: (name) => name.endsWith('.stbl'),
        files: [],
      },
      {
        name: 'Scripts',
        icon: '📜',
        pattern: (name) => name.endsWith('.py') || name.endsWith('.ts4script'),
        files: [],
      },
      {
        name: 'Other Files',
        icon: '📁',
        pattern: () => true, // Catch-all for remaining files
        files: [],
      },
    ]
  }, [])

  // Organize files into groups
  const organizedGroups = useMemo(() => {
    if (!currentProject) return []

    const groups = fileGroups.map((group) => ({
      ...group,
      files: currentProject.files.filter(
        (file) =>
          group.pattern(file.name) &&
          !fileGroups.some(
            (g, i) =>
              i < fileGroups.indexOf(group) && g.pattern(file.name)
          )
      ),
    }))

    // Filter out empty groups
    return groups.filter((group) => group.files.length > 0)
  }, [currentProject, fileGroups])

  // Calculate error/warning counts for groups
  const getGroupStats = (files: ModFile[]) => {
    let errorCount = 0
    let warningCount = 0

    files.forEach((file) => {
      const diagnostics = getDiagnosticsForFile(file.id)
      if (diagnostics.some((d) => d.severity === 'error')) {
        errorCount++
      }
      if (diagnostics.some((d) => d.severity === 'warning')) {
        warningCount++
      }
    })

    return { errorCount, warningCount }
  }

  if (!currentProject) {
    return (
      <div className="p-4 text-center text-text-secondary text-sm">
        No project loaded
      </div>
    )
  }

  if (currentProject.files.length === 0) {
    return (
      <div className="p-4 text-center text-text-secondary text-sm">
        No files in project
      </div>
    )
  }

  return (
    <div className="space-y-2 p-2">
      {organizedGroups.map((group) => {
        const stats = getGroupStats(group.files)
        return (
          <FileGroupHeader
            key={group.name}
            name={group.name}
            icon={group.icon}
            fileCount={group.files.length}
            errorCount={stats.errorCount}
            warningCount={stats.warningCount}
          >
            {group.files.map((file) => (
              <FileTreeNode
                key={file.id}
                file={file}
                diagnostics={getDiagnosticsForFile(file.id)}
                onOpenFile={onOpenFile}
                onValidateFile={onValidateFile}
                onDeleteFile={onDeleteFile}
                onRenameFile={onRenameFile}
                isSelected={file.id === activeFileId}
              />
            ))}
          </FileGroupHeader>
        )
      })}
    </div>
  )
}
