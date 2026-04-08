import { useEffect, useCallback } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { FileService } from '@/services/FileService'
import { XMLParser } from '@/engine/parsers/XMLParser'
import { xmlToJpe } from '@/engine/translators'
import { STBLParser } from '@/engine/parsers/STBLParser'
import { PythonService } from '@/services/PythonService'
import { ConfigParser } from '@/engine/parsers/ConfigParser'

/**
 * Hook to load and display file content when a tab is activated.
 *
 * Enhancements (Story 1.4/2.1.1):
 * - For XML files: translates XML → JPE before displaying in editor
 * - For STBL files: parses binary STBL → JPE text for display
 * - For JPE files: displays as-is
 * - For other types: displays raw content
 * - Stores original binary/XML for compile-back
 */
export const useFileLoader = (tabId: string | null, fileId: string | null) => {
  const { getFile, updateFile } = useProjectStore()
  const { updateTabContent, editorContent, setPreviewContent } = useEditorStore()

  const loadFile = useCallback(async () => {
    if (!tabId || !fileId) return

    try {
      const file = getFile(fileId)
      if (!file) return

      // Check if already loaded in editor
      const cachedContent = editorContent[tabId]
      if (cachedContent) {
        return
      }

      // Handle STBL files — read as binary buffer
      if (file.type === 'stbl') {
        const bufferResult = await FileService.readFileBuffer(file.path)
        if (bufferResult) {
          try {
            const stblData = STBLParser.parse(bufferResult)
            if (stblData) {
              // Convert STBL to JPE text for display
              const jpeText = stblToJpe(stblData)
              updateTabContent(tabId, jpeText)
              // Store original binary for compile-back
              ;(file as any)._originalBinary = bufferResult
              updateFile(fileId, {
                content: jpeText,
                size: bufferResult.byteLength,
              })
            } else {
              updateTabContent(tabId, '// Failed to parse STBL file')
            }
          } catch (parseError) {
            updateTabContent(tabId, `// Error parsing STBL: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
          }
        } else {
          updateTabContent(tabId, '// Failed to read STBL file')
        }
        return
      }

      // Handle Python/TS4Script files — decompile to JPE for display
      if (file.type === 'py' || file.type === 'ts4script') {
        const result = await FileService.readFile(file.path)
        if (result.success && result.content) {
          // Store original Python source for round-trip
          ;(file as any)._originalSource = result.content

          // Decompile to JPE for display
          const jpeText = PythonService.decompileToJpe(result.content, file.name)
          updateTabContent(tabId, jpeText)
          updateFile(fileId, {
            content: result.content,
            size: result.size || 0,
          })
        } else {
          updateTabContent(tabId, `// Failed to read script file: ${result.error}`)
        }
        return
      }

      // Handle JSON files — parse and display as formatted JPE
      if (file.type === 'json') {
        const result = await FileService.readFile(file.path)
        if (result.success && result.content) {
          // Store original JSON for round-trip
          ;(file as any)._originalContent = result.content

          try {
            // Try to parse and re-format as pretty JPE
            const parsed = JSON.parse(result.content)
            // Display as pretty-printed JSON (readable format)
            const jpeText = `// JSON Config File\n// Source: ${file.name}\n\n${JSON.stringify(parsed, null, 2)}`
            updateTabContent(tabId, jpeText)
          } catch {
            // If not valid JSON, show raw content
            updateTabContent(tabId, result.content)
          }

          updateFile(fileId, {
            content: result.content,
            size: result.size || 0,
          })
        } else {
          updateTabContent(tabId, `// Failed to read JSON file: ${result.error}`)
        }
        return
      }

      // Handle CFG files — parse and display as JPE key-value pairs
      if (file.type === 'cfg') {
        const result = await FileService.readFile(file.path)
        if (result.success && result.content) {
          // Store original CFG for round-trip
          ;(file as any)._originalContent = result.content

          try {
            // Parse CFG and display as JPE
            const parsed = ConfigParser.parse(result.content)
            const jpeText = configToJpe(parsed as unknown as Record<string, unknown>, file.name)
            updateTabContent(tabId, jpeText)
          } catch {
            // If parse fails, show raw content
            updateTabContent(tabId, result.content)
          }

          updateFile(fileId, {
            content: result.content,
            size: result.size || 0,
          })
        } else {
          updateTabContent(tabId, `// Failed to read CFG file: ${result.error}`)
        }
        return
      }

      // Load text content for other file types
      const result = await FileService.readFile(file.path)

      if (result.success && result.content) {
        let displayContent = result.content
        let originalXml = result.content

        // For XML files: translate to JPE for display
        if (file.type === 'xml') {
          try {
            const xmlElement = XMLParser.parseXML(result.content)
            if (xmlElement) {
              displayContent = xmlToJpe(xmlElement)
              // Store original XML for compile-back
              originalXml = result.content
              setPreviewContent(originalXml)
            } else {
              displayContent = `// Failed to parse XML: ${result.content.substring(0, 200)}`
            }
          } catch (parseError) {
            displayContent = `// Error translating XML to JPE: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
          }
        }

        updateTabContent(tabId, displayContent)
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
  }, [tabId, fileId, getFile, updateTabContent, updateFile, editorContent, setPreviewContent])

  useEffect(() => {
    if (tabId && fileId) {
      loadFile()
    }
  }, [tabId, fileId, loadFile])
}

/**
 * Convert parsed STBL data to JPE text format for display in editor.
 */
function stblToJpe(stblData: ReturnType<typeof STBLParser.parse>): string {
  if (!stblData) return '// Invalid STBL data'

  let jpe = `// STBL File\n`
  jpe += `// Version: ${stblData.version}\n`
  jpe += `// Flags: 0x${stblData.flags.toString(16).toUpperCase().padStart(4, '0')}\n`
  jpe += `// Entries: ${stblData.metadata.entryCount}\n`
  jpe += `// File Size: ${stblData.metadata.fileSize} bytes\n`
  jpe += `\n`

  for (const entry of stblData.entries) {
    const hexKey = `0x${entry.key.toString(16).toUpperCase().padStart(8, '0')}`
    const escapedValue = entry.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    jpe += `String ${hexKey}: "${escapedValue}"\n`
  }

  return jpe
}

/**
 * Convert parsed config data to JPE text format for display in editor.
 */
function configToJpe(config: Record<string, unknown>, fileName: string): string {
  let jpe = `// Config File\n`
  jpe += `// Source: ${fileName}\n\n`

  function flatten(obj: Record<string, unknown>, prefix = ''): string {
    const lines: string[] = []
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        lines.push(flatten(value as Record<string, unknown>, fullPath))
      } else {
        const formattedValue = typeof value === 'string' ? `"${value}"` : String(value)
        lines.push(`${fullPath}: ${formattedValue}`)
      }
    }
    return lines.join('\n')
  }

  jpe += flatten(config)
  return jpe
}
