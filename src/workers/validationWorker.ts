/**
 * Web Worker for running validation in background thread
 * Prevents UI blocking during large file validation
 */

// Message types
interface ValidateMessage {
  type: 'validate'
  payload: {
    fileId: string
    fileContent: string
    fileName: string
  }
}

interface ValidateResult {
  type: 'validation-complete'
  result: {
    fileId: string
    valid: boolean
    errorCount: number
    warningCount: number
    diagnostics: any[]
  }
}

interface ErrorMessage {
  type: 'validation-error'
  error: string
  fileId: string
}

type WorkerMessage = ValidateMessage

// Mock validation function
function validateContent(content: string): {
  valid: boolean
  errorCount: number
  warningCount: number
  diagnostics: any[]
} {
  const diagnostics: any[] = []
  let errorCount = 0
  let warningCount = 0

  // Basic validation checks
  if (!content.includes('<?xml')) {
    diagnostics.push({
      severity: 'error',
      message: 'Missing XML declaration',
      line: 1,
      column: 1,
      code: 'E001',
    })
    errorCount++
  }

  const lines = content.split('\n')
  let openTags = 0

  lines.forEach((line, idx) => {
    const openCount = (line.match(/<[^/]/g) || []).length
    const closeCount = (line.match(/<\//g) || []).length

    openTags += openCount - closeCount

    // Check for unmatched quotes
    const singleQuotes = (line.match(/'/g) || []).length
    if (singleQuotes % 2 !== 0) {
      diagnostics.push({
        severity: 'warning',
        message: 'Unmatched single quote',
        line: idx + 1,
        column: line.indexOf("'"),
        code: 'W001',
      })
      warningCount++
    }
  })

  if (openTags !== 0) {
    diagnostics.push({
      severity: 'error',
      message: 'Mismatched XML tags',
      line: lines.length,
      column: 1,
      code: 'E002',
    })
    errorCount++
  }

  return {
    valid: errorCount === 0,
    errorCount,
    warningCount,
    diagnostics,
  }
}

// Handle incoming messages
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data

  if (type === 'validate') {
    try {
      const result = validateContent(payload.fileContent)

      const message: ValidateResult = {
        type: 'validation-complete',
        result: {
          fileId: payload.fileId,
          ...result,
        },
      }

      self.postMessage(message)
    } catch (error) {
      const errorMsg: ErrorMessage = {
        type: 'validation-error',
        error: error instanceof Error ? error.message : 'Unknown error',
        fileId: payload.fileId,
      }
      self.postMessage(errorMsg)
    }
  }
}

// Export for TypeScript
export type {}
