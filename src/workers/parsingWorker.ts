/**
 * Web Worker for parsing XML content in background thread
 * Prevents UI blocking during large file parsing
 */

// Message types
interface ParseMessage {
  type: 'parse'
  payload: {
    fileId: string
    content: string
    fileName: string
  }
}

interface ParseResult {
  type: 'parse-complete'
  result: {
    fileId: string
    success: boolean
    structure: ParsedStructure
    lineCount: number
    duration: number
  }
}

interface ParsedStructure {
  rootElement?: string
  attributes: Record<string, string>
  children: Array<{
    tagName: string
    attributes: Record<string, string>
    content?: string
  }>
  depth: number
  lineCount: number
}

interface ErrorMessage {
  type: 'parse-error'
  error: string
  fileId: string
}

type WorkerMessage = ParseMessage

// Mock XML parser
function parseXML(content: string): {
  success: boolean
  structure?: ParsedStructure
  error?: string
} {
  try {
    const lines = content.split('\n')
    const structure: ParsedStructure = {
      attributes: {},
      children: [],
      depth: 0,
      lineCount: lines.length
    }

    let currentDepth = 0
    let rootElement: string | null = null

    lines.forEach((line, _idx) => {
      const trimmed = line.trim()

      if (trimmed.startsWith('<?xml')) {
        // XML declaration
        return
      }

      if (trimmed.startsWith('<I ')) {
        const match = trimmed.match(/i="([^"]+)"/)
        const cMatch = trimmed.match(/c="([^"]+)"/)

        if (!rootElement && cMatch) {
          rootElement = cMatch[1]
          structure.rootElement = rootElement
        }

        if (match) {
          structure.attributes['id'] = match[1]
        }
      }

      if (trimmed.startsWith('<T ')) {
        const nameMatch = trimmed.match(/n="([^"]+)"/)
        const contentMatch = trimmed.match(/>([^<]*)</)

        if (nameMatch) {
          structure.children.push({
            tagName: 'T',
            attributes: { name: nameMatch[1] },
            content: contentMatch ? contentMatch[1] : ''
          })
        }
      }

      // Track nesting depth
      const openTags = (line.match(/</g) || []).length
      const closeTags = (line.match(/>/g) || []).length
      currentDepth += (openTags - closeTags) / 2
      structure.depth = Math.max(structure.depth, Math.abs(currentDepth))
    })

    return {
      success: true,
      structure
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse XML'
    }
  }
}

// Handle incoming messages
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data

  if (type === 'parse') {
    try {
      const startTime = performance.now()

      const result = parseXML(payload.content)

      const duration = performance.now() - startTime

      if (result.success && result.structure) {
        const message: ParseResult = {
          type: 'parse-complete',
          result: {
            fileId: payload.fileId,
            success: true,
            structure: result.structure,
            lineCount: result.structure.lineCount,
            duration
          }
        }

        self.postMessage(message)
      } else {
        const errorMsg: ErrorMessage = {
          type: 'parse-error',
          error: result.error || 'Failed to parse XML',
          fileId: payload.fileId
        }
        self.postMessage(errorMsg)
      }
    } catch (error) {
      const errorMsg: ErrorMessage = {
        type: 'parse-error',
        error: error instanceof Error ? error.message : 'Unknown parse error',
        fileId: payload.fileId
      }
      self.postMessage(errorMsg)
    }
  }
}

// Export for TypeScript
export type {}
