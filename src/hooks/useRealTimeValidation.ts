import { useEffect, useRef, useCallback } from 'react'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { ValidationEngine } from '@/engine/validators/ValidationEngine'
import { XMLParser } from '@/engine/parsers/XMLParser'

const VALIDATION_DEBOUNCE_MS = 500

/**
 * Hook for real-time validation of file content
 * Validates as user types with debouncing
 */
export const useRealTimeValidation = (fileId: string | null, content: string | null) => {
  const { setDiagnostics, getDiagnosticsForFile } = useDiagnosticStore()
  const { getFile } = useProjectStore()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const validate = useCallback(() => {
    if (!fileId || !content) {
      if (fileId) {
        setDiagnostics([])
      }
      return
    }

    const file = getFile(fileId)
    if (!file) return

    // Run appropriate validator based on file type
    let validationResult = { valid: true, diagnostics: [], warnings: [] }

    if (file.type === 'xml') {
      // Use specialized XML validation
      validationResult = ValidationEngine.validate(content)

      // Also check XML parsing
      const parseResult = XMLParser.validate(content)
      if (!parseResult.valid) {
        validationResult.diagnostics.push(...parseResult.diagnostics)
        validationResult.warnings.push(...parseResult.warnings)
      }
    } else {
      // Generic validation
      validationResult = ValidationEngine.validate(content)
    }

    // Update diagnostics for this file
    const updatedDiagnostics = validationResult.diagnostics.map((diag) => ({
      ...diag,
      fileId,
    }))

    // Keep diagnostics from other files
    const otherDiagnostics = getDiagnosticsForFile(fileId)
      .filter((d) => !updatedDiagnostics.find((ud) => ud.id === d.id))

    // Set all diagnostics
    setDiagnostics([...updatedDiagnostics, ...otherDiagnostics])
  }, [fileId, content, getFile, setDiagnostics, getDiagnosticsForFile])

  // Debounce validation
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      validate()
    }, VALIDATION_DEBOUNCE_MS)

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [content, validate])

  return {
    validate,
    setDebounce: (ms: number) => {
      // Could be extended to allow dynamic debounce setting
    },
  }
}
