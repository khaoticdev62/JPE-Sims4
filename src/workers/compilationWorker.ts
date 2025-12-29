/**
 * Web Worker for running compilation in background thread
 * Prevents UI blocking during project compilation
 */

// Message types
interface CompileMessage {
  type: 'compile'
  payload: {
    fileId: string
    fileContent: string
    fileName: string
    fileType: 'xml' | 'jpe'
  }
}

interface CompileResult {
  type: 'compile-complete'
  result: {
    fileId: string
    success: boolean
    outputFormat: string
    compiledContent: string
    duration: number
  }
}

interface ErrorMessage {
  type: 'compile-error'
  error: string
  fileId: string
}

type WorkerMessage = CompileMessage

// Mock compilation function
function compileContent(
  content: string,
  format: string,
  targetFormat: string
): {
  success: boolean
  output: string
  format: string
} {
  const startTime = performance.now()

  try {
    // Simulate compilation delay based on content size
    const delay = Math.min(content.length / 100, 500)

    if (targetFormat === 'jpe') {
      // XML to JPE conversion simulation
      const lines = content.split('\n')
      const jpeLines: string[] = []
      let inTag = false
      let currentTag = ''

      lines.forEach((line) => {
        const trimmed = line.trim()

        if (trimmed.startsWith('<I ')) {
          const match = trimmed.match(/i="([^"]+)"/)
          if (match) {
            jpeLines.push(`[${match[1].split(':')[1] || 'Unknown'}]`)
          }
        } else if (trimmed.startsWith('<T ')) {
          const nameMatch = trimmed.match(/n="([^"]+)"/)
          const content = trimmed.match(/>([^<]+)</)
          if (nameMatch && content) {
            jpeLines.push(`${nameMatch[1]} = ${content[1]}`)
          }
        }
      })

      return {
        success: true,
        output: jpeLines.join('\n'),
        format: 'jpe'
      }
    } else {
      // JPE to XML conversion simulation
      const lines = content.split('\n')
      const xmlLines = ['<?xml version="1.0"?>']
      let inSection = false
      let sectionName = ''

      lines.forEach((line) => {
        const trimmed = line.trim()

        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          if (inSection) {
            xmlLines.push('</I>')
          }
          sectionName = trimmed.slice(1, -1)
          xmlLines.push(`<I c="${sectionName}" i="${sectionName}">`)
          inSection = true
        } else if (trimmed.includes(' = ')) {
          const [key, value] = trimmed.split(' = ')
          xmlLines.push(`  <T n="${key}">${value}</T>`)
        }
      })

      if (inSection) {
        xmlLines.push('</I>')
      }

      return {
        success: true,
        output: xmlLines.join('\n'),
        format: 'xml'
      }
    }
  } catch (error) {
    return {
      success: false,
      output: '',
      format: ''
    }
  }
}

// Handle incoming messages
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data

  if (type === 'compile') {
    try {
      const startTime = performance.now()
      const targetFormat = payload.fileType === 'xml' ? 'jpe' : 'xml'

      const result = compileContent(payload.fileContent, payload.fileType, targetFormat)

      const duration = performance.now() - startTime

      if (result.success) {
        const message: CompileResult = {
          type: 'compile-complete',
          result: {
            fileId: payload.fileId,
            success: true,
            outputFormat: result.format,
            compiledContent: result.output,
            duration
          }
        }

        self.postMessage(message)
      } else {
        const errorMsg: ErrorMessage = {
          type: 'compile-error',
          error: 'Compilation failed',
          fileId: payload.fileId
        }
        self.postMessage(errorMsg)
      }
    } catch (error) {
      const errorMsg: ErrorMessage = {
        type: 'compile-error',
        error: error instanceof Error ? error.message : 'Unknown compilation error',
        fileId: payload.fileId
      }
      self.postMessage(errorMsg)
    }
  }
}

// Export for TypeScript
export type {}
