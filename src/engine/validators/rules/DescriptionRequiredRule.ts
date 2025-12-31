import type { ValidationRule } from '../ValidationRule'

export const DescriptionRequiredRule: ValidationRule = {
  id: 'jpe-description-required',
  name: 'Description Required',
  severity: 'warning',
  check: (content: string) => {
    if (!content.includes('DESCRIPTION:')) {
      return {
        valid: false,
        diagnostics: [
          {
            id: 'jpe-desc-001',
            fileId: '',
            line: 2, // Usually after MODULE
            column: 1,
            severity: 'warning',
            message: 'Missing DESCRIPTION (recommended)',
            code: 'JPEDESC001',
            suggestion: 'Add DESCRIPTION: "A brief description of your mod"',
          },
        ],
        warnings: [],
      }
    }
    return { valid: true, diagnostics: [], warnings: [] }
  },
}
