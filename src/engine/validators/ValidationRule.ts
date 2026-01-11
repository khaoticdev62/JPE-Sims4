import type { ValidationResult } from '@/types/index'

export interface ValidationRule {
  id: string
  name: string
  check: (content: string) => ValidationResult
  severity: 'error' | 'warning' | 'info'
}
