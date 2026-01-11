/**
 * Configuration File Type Definitions
 *
 * Supports JSON and YAML configuration files for Sims 4 mod projects.
 * Used for project metadata, build settings, and validation rules.
 */

/**
 * Build configuration settings
 */
export interface BuildConfig {
  outputDir?: string // Output directory for compiled mods
  packageName?: string // Package file name
  compress?: boolean // Whether to compress resources
  includeSources?: boolean // Include source files
}

/**
 * File configuration
 */
export interface FileConfig {
  tuning?: string[] // Tuning XML file patterns
  strings?: string[] // String table (STBL) file patterns
  scripts?: string[] // Python script file patterns
  other?: string[] // Other file patterns
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  strictMode?: boolean // Strict validation mode
  checkReferences?: boolean // Check cross-file references
  validateEnums?: boolean // Validate enum values
  reportWarnings?: boolean // Report warnings in addition to errors
}

/**
 * Project metadata
 */
export interface ProjectMetadata {
  name: string // Project name
  version: string // Project version (e.g., "1.0.0")
  author?: string // Author name
  description?: string // Project description
  license?: string // License type
  homepage?: string // Project homepage URL
  repository?: string // Repository URL
  keywords?: string[] // Search keywords
}

/**
 * Complete project configuration
 */
export interface ProjectConfig {
  metadata: ProjectMetadata
  files?: FileConfig
  build?: BuildConfig
  validation?: ValidationConfig
  customFields?: Record<string, any> // Allow custom fields
}

/**
 * Config parsing result
 */
export interface ConfigParseResult {
  success: boolean
  config?: ProjectConfig
  errors: ConfigError[]
  warnings: ConfigWarning[]
  metadata: {
    format: 'json' | 'yaml'
    parseTime: number
  }
}

/**
 * Config validation error
 */
export interface ConfigError {
  field: string // Field that caused error
  message: string // Error message
  type: 'missing' | 'invalid' | 'type_error'
  value?: any // Actual value that caused error
}

/**
 * Config validation warning
 */
export interface ConfigWarning {
  field: string
  message: string
  suggestion?: string // Suggestion for fixing
}

/**
 * Default project configuration values
 */
export const DEFAULT_CONFIG: ProjectConfig = {
  metadata: {
    name: 'Untitled Mod',
    version: '1.0.0',
  },
  files: {
    tuning: ['**/*.xml'],
    strings: ['**/*.stbl'],
    scripts: ['**/*.py'],
  },
  build: {
    outputDir: './build',
    packageName: 'mod.package',
    compress: false,
    includeSources: false,
  },
  validation: {
    strictMode: false,
    checkReferences: true,
    validateEnums: true,
    reportWarnings: true,
  },
}

/**
 * Detect config file format
 */
export function detectConfigFormat(content: string): 'json' | 'yaml' {
  const trimmed = content.trim()

  // Check for JSON (starts with { or [)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json'
  }

  // Default to YAML (more lenient)
  return 'yaml'
}

/**
 * Parse JSON config (simple JSON without external library)
 */
export function parseJSON(content: string): any {
  try {
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Simple YAML parser (limited subset support)
 * For full YAML support, use the yaml package
 */
export function parseYAML(content: string): any {
  const lines = content.split('\n')
  const result: any = {}
  let currentObj = result
  const stack: any[] = [result]
  let currentIndent = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      continue
    }

    // Calculate indentation
    const indent = line.length - line.trimLeft().length
    const trimmed = line.trim()

    // Handle indentation changes
    if (indent < currentIndent) {
      // Pop stack to match indentation
      while (stack.length > 1 && indent < currentIndent) {
        stack.pop()
        currentIndent -= 2
      }
      currentObj = stack[stack.length - 1]
    }

    // Parse key-value pairs
    if (trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':')
      const keyTrimmed = key.trim()
      const valueTrimmed = valueParts.join(':').trim()

      // Parse value
      let value: any
      let isNestedObject = false
      if (!valueTrimmed) {
        // Next line might be an object or array
        value = {}
        stack.push(value)
        currentIndent = indent + 2
        isNestedObject = true
      } else if (valueTrimmed.startsWith('[')) {
        // Array
        value = parseYAMLArray(valueTrimmed)
      } else if (valueTrimmed === 'true') {
        value = true
      } else if (valueTrimmed === 'false') {
        value = false
      } else if (valueTrimmed === 'null' || valueTrimmed === 'nil') {
        value = null
      } else if (/^\d+$/.test(valueTrimmed)) {
        value = parseInt(valueTrimmed, 10)
      } else if (/^\d+\.\d+$/.test(valueTrimmed)) {
        value = parseFloat(valueTrimmed)
      } else if (valueTrimmed.startsWith('"') && valueTrimmed.endsWith('"')) {
        value = valueTrimmed.slice(1, -1)
      } else if (valueTrimmed.startsWith("'") && valueTrimmed.endsWith("'")) {
        value = valueTrimmed.slice(1, -1)
      } else {
        value = valueTrimmed
      }

      currentObj[keyTrimmed] = value

      // Update currentObj for nested objects (after assignment)
      if (isNestedObject) {
        currentObj = value
      }
    } else if (trimmed.startsWith('- ')) {
      // Array item
      const itemValue = trimmed.substring(2)
      if (!Array.isArray(currentObj)) {
        const arr: any[] = []
        stack[stack.length - 1] = arr
        currentObj = arr
      }
      currentObj.push(itemValue)
    }
  }

  return result
}

/**
 * Parse simple YAML array
 */
function parseYAMLArray(arrayStr: string): any[] {
  const str = arrayStr.trim()
  if (!str.startsWith('[') || !str.endsWith(']')) {
    return []
  }

  const content = str.slice(1, -1)
  if (!content.trim()) {
    return []
  }

  return content
    .split(',')
    .map(item => {
      const trimmed = item.trim()
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1)
      }
      if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        return trimmed.slice(1, -1)
      }
      if (trimmed === 'true') return true
      if (trimmed === 'false') return false
      if (trimmed === 'null') return null
      if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10)
      if (/^\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed)
      return trimmed
    })
}
