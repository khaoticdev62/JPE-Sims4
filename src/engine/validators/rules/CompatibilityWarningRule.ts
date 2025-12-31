import type { ValidationRule } from '../ValidationRule'

export const CompatibilityWarningRule: ValidationRule = {
  id: 'jpe-compatibility-warning',
  name: 'Compatibility Warning',
  severity: 'info',
  check: (content: string) => {
    // Info: "Consider adding ONLY_IF to prevent conflicts"
    if (content.includes('WHEN:') && !content.includes('ONLY_IF:')) {
      return {
        valid: false, // Rule failed (info)
        diagnostics: [
          {
            id: 'comp-001',
            fileId: '',
            line: 1,
            column: 1,
            severity: 'info',
            message: 'Consider adding ONLY_IF to prevent conflicts',
            code: 'JPECOMP001',
            suggestion: 'Add ONLY_IF: block to restrict when this mod triggers',
          },
        ],
        warnings: [],
      }
    }
    return { valid: true, diagnostics: [], warnings: [] }
  },
}
