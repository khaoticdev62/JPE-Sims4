/**
 * XML Namespace Validator
 *
 * Validates and auto-fixes namespace declarations in Sims 4 XML tuning files.
 * Ensures all required namespaces are present and correctly formatted.
 *
 * Sims 4 XML Tuning Namespace Standards:
 * - t: Base tuning namespace (required)
 * - c: CAS (Create-A-Sim) namespace
 * - a: Animation namespace
 * - l: Localization namespace
 */

export interface NamespaceDeclaration {
  prefix: string
  uri: string
}

export interface NamespaceValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** Missing namespaces */
  missing: NamespaceDeclaration[]
  /** Malformed namespaces */
  malformed: Array<{ namespace: string; issue: string }>
  /** Auto-fixed XML string (if fixes applied) */
  fixedXml?: string
  /** Summary of fixes applied */
  fixesApplied: string[]
}

export interface NamespaceRegistry {
  [prefix: string]: string
}

/**
 * Standard Sims 4 tuning namespaces
 */
export const SIMS4_STANDARD_NAMESPACES: NamespaceRegistry = {
  t: 'http://schemas.ea.com/sims4/tuning',
  c: 'http://schemas.ea.com/sims4/cas',
  a: 'http://schemas.ea.com/sims4/animation',
  l: 'http://schemas.ea.com/sims4/localization',
  i: 'http://schemas.ea.com/sims4/instance',
}

/**
 * Required namespaces for all Sims 4 tuning files
 */
export const SIMS4_REQUIRED_NAMESPACES: string[] = ['t']

export class XMLNamespaceValidator {
  private readonly standardNamespaces: NamespaceRegistry
  private readonly requiredNamespaces: string[]

  constructor(
    standardNamespaces: NamespaceRegistry = SIMS4_STANDARD_NAMESPACES,
    requiredNamespaces: string[] = SIMS4_REQUIRED_NAMESPACES,
  ) {
    this.standardNamespaces = standardNamespaces
    this.requiredNamespaces = requiredNamespaces
  }

  /**
   * Validate namespace declarations in XML
   */
  validate(xml: string): NamespaceValidationResult {
    const missing: NamespaceDeclaration[] = []
    const malformed: Array<{ namespace: string; issue: string }> = []
    const fixesApplied: string[] = []

    // Extract root element
    const rootMatch = xml.match(/<(\w+)([\s\S]*?)>/)
    if (!rootMatch) {
      return {
        valid: false,
        missing: [],
        malformed: [{ namespace: 'root', issue: 'No root element found' }],
        fixesApplied: [],
      }
    }

    const [, _rootTag, rootAttributes] = rootMatch
    const existingNamespaces = this.parseNamespaces(rootAttributes)

    // Check for required namespaces
    for (const prefix of this.requiredNamespaces) {
      if (!existingNamespaces.has(prefix)) {
        missing.push({
          prefix,
          uri: this.standardNamespaces[prefix],
        })
      }
    }

    // Check for malformed namespaces
    for (const [prefix, uri] of existingNamespaces.entries()) {
      if (!uri || uri.trim() === '') {
        malformed.push({
          namespace: `xmlns:${prefix}`,
          issue: 'Empty namespace URI',
        })
      } else if (!this.isValidUri(uri)) {
        malformed.push({
          namespace: `xmlns:${prefix}`,
          issue: `Invalid URI format: ${uri}`,
        })
      }
    }

    let fixedXml: string | undefined
    const isValid = missing.length === 0 && malformed.length === 0

    // Auto-fix missing namespaces
    if (missing.length > 0) {
      const namespaceAttrs = missing
        .map((ns) => `xmlns:${ns.prefix}="${ns.uri}"`)
        .join(' ')

      const fixedRoot = rootMatch[0].replace(
        '>',
        ` ${namespaceAttrs}>`,
      )
      fixedXml = xml.replace(rootMatch[0], fixedRoot)
      fixesApplied.push(
        `Added missing namespaces: ${missing.map((ns) => ns.prefix).join(', ')}`,
      )
    }

    return {
      valid: isValid,
      missing,
      malformed,
      fixedXml,
      fixesApplied,
    }
  }

  /**
   * Validate and auto-fix namespaces in one operation
   * Returns the fixed XML if issues were found and fixed
   */
  validateAndFix(xml: string): string {
    const result = this.validate(xml)

    if (result.fixedXml) {
      return result.fixedXml
    }

    return xml
  }

  /**
   * Get all namespace declarations from root element attributes
   */
  private parseNamespaces(attributes: string): Map<string, string> {
    const namespaces = new Map<string, string>()
    const namespaceRegex = /xmlns:(\w+)="([^"]*)"/g
    let match

    while ((match = namespaceRegex.exec(attributes)) !== null) {
      namespaces.set(match[1], match[2])
    }

    return namespaces
  }

  /**
   * Validate URI format
   */
  private isValidUri(uri: string): boolean {
    try {
      new URL(uri)
      return true
    } catch {
      // Accept relative URIs for Sims 4 (some use custom schemes)
      return uri.includes(':') || uri.startsWith('http')
    }
  }

  /**
   * Add a custom namespace to the registry
   */
  addNamespace(prefix: string, uri: string): void {
    this.standardNamespaces[prefix] = uri
  }

  /**
   * Get all registered namespaces
   */
  getRegisteredNamespaces(): NamespaceRegistry {
    return { ...this.standardNamespaces }
  }

  /**
   * Check if a specific namespace is registered
   */
  isNamespaceRegistered(prefix: string): boolean {
    return prefix in this.standardNamespaces
  }
}

/**
 * Convenience function for quick validation
 */
export function validateXmlNamespaces(
  xml: string,
): NamespaceValidationResult {
  const validator = new XMLNamespaceValidator()
  return validator.validate(xml)
}

/**
 * Convenience function for validation and auto-fix
 */
export function validateAndFixNamespaces(xml: string): string {
  const validator = new XMLNamespaceValidator()
  return validator.validateAndFix(xml)
}
