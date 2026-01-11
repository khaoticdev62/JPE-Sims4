/**
 * PII Sanitizer
 * Removes personally identifiable information and sensitive data from telemetry
 */

export class PIISanitizer {
  // List of sensitive keys that should never be sent
  private static readonly SENSITIVE_KEYS = [
    'password',
    'apikey',
    'api_key',
    'token',
    'secret',
    'authorization',
    'auth',
    'email',
    'username',
    'name',
    'phone',
    'address',
    'ssn',
    'creditcard',
    'apitoken',
  ]

  // File path patterns to redact
  private static readonly PATH_PATTERNS = [
    /[A-Z]:\\[^/\\]+(\\[^/\\]+)*/g, // Windows paths
    /\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_.-]+)+/g, // Unix paths
    /Users\/[^/]+\//g, // macOS user paths
    /home\/[^/]+\//g, // Linux user paths
  ]

  /**
   * Sanitize any data structure for telemetry
   */
  static sanitize(data: any): any {
    if (data === null || data === undefined) {
      return data
    }

    if (typeof data === 'string') {
      return this.sanitizeString(data)
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item))
    }

    if (typeof data === 'object') {
      const sanitized: any = {}

      for (const [key, value] of Object.entries(data)) {
        // Skip sensitive keys entirely
        if (this.isSensitiveKey(key)) {
          continue
        }

        // Recursively sanitize values
        sanitized[key] = this.sanitize(value)
      }

      return sanitized
    }

    return data
  }

  /**
   * Sanitize a string for telemetry
   */
  private static sanitizeString(str: string): string {
    let sanitized = str

    // Remove file paths
    this.PATH_PATTERNS.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '<path>')
    })

    // Remove email addresses
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '<email>')

    // Remove common PII patterns
    sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '<ssn>') // SSN
    sanitized = sanitized.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '<credit_card>') // Credit card

    // Remove long consecutive hex strings (like API keys)
    sanitized = sanitized.replace(/\b[a-f0-9]{32,}\b/gi, '<key>')

    // Remove tokens/keys (sk-... pattern)
    sanitized = sanitized.replace(/\bsk-[a-zA-Z0-9]{20,}\b/g, '<token>')

    // Truncate long strings (likely contain sensitive data)
    if (sanitized.length > 200) {
      sanitized = sanitized.substring(0, 200) + '...'
    }

    return sanitized
  }

  /**
   * Check if a key is sensitive
   */
  private static isSensitiveKey(key: string): boolean {
    const keyLower = key.toLowerCase()

    return this.SENSITIVE_KEYS.some(
      (sensitive) =>
        keyLower.includes(sensitive) ||
        keyLower === sensitive ||
        keyLower.startsWith(sensitive)
    )
  }

  /**
   * Filter metadata for error stack traces
   */
  static sanitizeStackTrace(stack: string | undefined): string | undefined {
    if (!stack) return undefined

    // Truncate to prevent sending large amounts of data
    const truncated = stack.split('\n').slice(0, 5).join('\n')

    // Remove file paths
    return this.sanitizeString(truncated)
  }

  /**
   * Create an anonymous event from raw data
   */
  static anonymizeEvent(data: any): any {
    const sanitized = this.sanitize(data)

    // Remove any timestamp or specific timing info that could identify user
    if (sanitized.timestamp) {
      // Keep only the day, not exact time
      const date = new Date(sanitized.timestamp)
      sanitized.timestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    }

    return sanitized
  }

  /**
   * Validate that data contains no obvious PII
   */
  static validate(data: any): { clean: boolean; issues: string[] } {
    const issues: string[] = []
    this.validateRecursive(data, issues, '')

    return {
      clean: issues.length === 0,
      issues,
    }
  }

  /**
   * Recursively validate data for PII
   */
  private static validateRecursive(data: any, issues: string[], path: string): void {
    if (!data || typeof data !== 'object') {
      return
    }

    for (const [key, value] of Object.entries(data)) {
      const currentPath = path ? `${path}.${key}` : key

      // Check for sensitive keys
      if (this.isSensitiveKey(key)) {
        issues.push(`Sensitive key found: ${currentPath}`)
        continue
      }

      // Check string values for PII patterns
      if (typeof value === 'string') {
        if (value.includes('@') && value.includes('.')) {
          issues.push(`Possible email in: ${currentPath}`)
        }

        if (/[A-Z]:\\|^\//.test(value)) {
          issues.push(`Possible file path in: ${currentPath}`)
        }

        if (/\b\d{3}-\d{2}-\d{4}\b/.test(value)) {
          issues.push(`Possible SSN in: ${currentPath}`)
        }
      }

      // Recursively check nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.validateRecursive(value, issues, currentPath)
      }
    }
  }
}
