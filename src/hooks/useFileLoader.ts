import { useEffect, useCallback } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { FileService } from '@/services/FileService'

/**
 * Hook to load and display file content when a tab is activated
 */
export const useFileLoader = (tabId: string | null, fileId: string | null) => {
  const { getFile, updateFile } = useProjectStore()
  const { updateTabContent, editorContent } = useEditorStore()

  const loadFile = useCallback(async () => {
    if (!tabId || !fileId) return

    try {
      const file = getFile(fileId)
      if (!file) return

      // Check if already loaded in editor
      const cachedContent = editorContent.get(tabId)
      if (cachedContent) {
        return
      }

      // Load from disk
      const result = await FileService.readFile(file.path)

      if (result.success && result.content) {
        updateTabContent(tabId, result.content)
        updateFile(fileId, {
          content: result.content,
          size: result.size || 0,
        })
      } else if (result.error) {
        console.error('Failed to load file:', result.error)
        updateTabContent(tabId, `// Error loading file: ${result.error}`)
      }
    } catch (error) {
      console.error('File loader error:', error)
    }
  }, [tabId, fileId, getFile, updateTabContent, updateFile, editorContent])

  useEffect(() => {
    if (tabId && fileId) {
      loadFile()
    }
  }, [tabId, fileId, loadFile])
}
