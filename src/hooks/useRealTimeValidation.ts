import { useEffect, useRef, useCallback } from 'react'
import type { ValidationResult } from '@/types/index'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { ValidationEngine } from '@/engine/validators/ValidationEngine'
import { XMLParser } from '@/engine/parsers/XMLParser'
import { JPELexer } from '@/services/translation/lexer'
import { JPELogicParser } from '@/services/translation/parser'
import { JPETranslator } from '@/services/translation/translator'

const VALIDATION_DEBOUNCE_MS = 300

/**
 * Hook for real-time validation of file content
 * Validates as user types with debouncing
 */
export const useRealTimeValidation = (fileId: string | null, content: string | null) => {
  const { setDiagnostics } = useDiagnosticStore()
  const { setPreviewContent, setPreviewOutOfDate } = useEditorStore()
  const { getFile } = useProjectStore()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const validate = useCallback(() => {
    if (!fileId || !content) {
      if (fileId) {
        setDiagnostics([])
        setPreviewContent('')
        setPreviewOutOfDate(false)
      }
      return
    }

    const file = getFile(fileId)
    if (!file) return

    // Immediately mark as out-of-date when starting validation cycle
    if (file.type === 'jpe') {
      setPreviewOutOfDate(true)
    }

    // Run appropriate validator based on file type
    let validationResult: ValidationResult = { valid: true, diagnostics: [], warnings: [] }

    if (file.type === 'xml') {
      // Use specialized XML validation
      validationResult = ValidationEngine.validate(content, 'xml')
      setPreviewOutOfDate(false) // XML has no derived preview

      // Also check XML parsing
      const parseResult = XMLParser.validate(content)
      if (!parseResult.valid) {
        validationResult.diagnostics.push(...parseResult.diagnostics)
        validationResult.warnings.push(...parseResult.warnings)
      }
    } else if (file.type === 'jpe') {
      // JPE-specific validation
      validationResult = ValidationEngine.validate(content, 'jpe')

      // If valid, perform real-time translation for preview (Story 3.2)
      if (validationResult.valid) {
        try {
          const lexer = new JPELexer(content)
          const tokens = lexer.tokenize()
          const parser = new JPELogicParser(tokens)
          const ast = parser.parse()
          
          if (ast) {
            const translator = new JPETranslator()
            const result = translator.translate(ast)
            
            // Get the first generated XML for the preview
            const firstXmlKey = Object.keys(result).find(k => k.endsWith('.xml'))
            if (firstXmlKey) {
              setPreviewContent(result[firstXmlKey] as string)
              setPreviewOutOfDate(false) // Sync complete
            }
          }
        } catch (e) {
          // If translation fails (logic bug/edge case), keep outOfDate flag
          console.error('Live translation failed:', e)
          setPreviewOutOfDate(true)
        }
      } else {
        // Validation errors exist
        setPreviewOutOfDate(true)
      }
    } else {
      // Generic validation (default to XML rules if unsure)
      validationResult = ValidationEngine.validate(content, 'xml')
      setPreviewOutOfDate(false)
    }

    // Update diagnostics for this file
    const updatedDiagnostics = validationResult.diagnostics.map((diag: any) => ({
      ...diag,
      fileId,
    }))

    // Get ALL diagnostics from store and keep only those from OTHER files
    const allStoredDiagnostics = useDiagnosticStore.getState().diagnostics || []
    const otherDiagnostics = allStoredDiagnostics.filter((d) => d.fileId !== fileId)

    // Set all diagnostics: updated for current file + diagnostics from other files
    setDiagnostics([...updatedDiagnostics, ...otherDiagnostics])
  }, [fileId, content, getFile, setDiagnostics])

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
    setDebounce: (_ms: number) => {
      // Could be extended to allow dynamic debounce setting
    },
  }
}
