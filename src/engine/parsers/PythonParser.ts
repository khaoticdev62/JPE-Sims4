/**
 * Python Parser
 *
 * Analyzes Python scripts from Sims 4 mods without executing them.
 * Extracts function definitions, class definitions, decorators, and imports.
 * Useful for identifying tuning injectors and mod structure.
 *
 * Note: This is AST analysis only, not actual Python execution.
 * Uses regex-based parsing for robustness.
 */

/**
 * Python function definition
 */
export interface PythonFunction {
  name: string
  line: number
  decorators: string[]
  parameters: string[]
  docstring?: string
  isAsync: boolean
}

/**
 * Python class definition
 */
export interface PythonClass {
  name: string
  line: number
  baseClasses: string[]
  methods: PythonFunction[]
  docstring?: string
}

/**
 * Python import statement
 */
export interface PythonImport {
  type: 'import' | 'from'
  module: string
  names: string[] // For 'from X import A, B'
  line: number
}

/**
 * Parsed Python script analysis
 */
export interface PythonScript {
  encoding: string
  imports: PythonImport[]
  functions: PythonFunction[]
  classes: PythonClass[]
  decorators: string[] // Top-level decorators
  docstring?: string
  metadata: {
    lineCount: number
    hasAsync: boolean
    hasTuningInjector: boolean
    parseTime: number
  }
}

/**
 * Python parser
 */
export class PythonParser {
  /**
   * Parse Python script from text
   */
  static parse(source: string): PythonScript {
    const startTime = performance.now()
    const lines = source.split('\n')

    // Extract encoding if present
    let encoding = 'utf-8'
    if (lines[0]?.includes('coding:') || lines[1]?.includes('coding:')) {
      const encodingMatch = source.match(/coding[:=]\s*([-\w.]+)/i)
      if (encodingMatch) {
        encoding = encodingMatch[1]
      }
    }

    // Extract docstring
    const docstring = this.extractDocstring(source)

    // Parse imports
    const imports = this.extractImports(source)

    // Parse decorators and functions
    const decorators: string[] = []
    const functions = this.extractFunctions(source, decorators)

    // Parse classes
    const classes = this.extractClasses(source)

    // Detect tuning injectors
    const hasTuningInjector = this.hasTuningInjector(source, decorators, functions)

    const parseTime = performance.now() - startTime

    return {
      encoding,
      imports,
      functions,
      classes,
      decorators,
      docstring,
      metadata: {
        lineCount: lines.length,
        hasAsync: source.includes('async def'),
        hasTuningInjector,
        parseTime,
      },
    }
  }

  /**
   * Extract docstring (module-level documentation)
   */
  private static extractDocstring(source: string): string | undefined {
    // Look for module docstring
    const tripleQuoteMatch = source.match(/^(\"{3}|'{3})([\s\S]*?)\1/m)
    if (tripleQuoteMatch) {
      return tripleQuoteMatch[2].trim()
    }

    return undefined
  }

  /**
   * Extract all import statements
   */
  private static extractImports(source: string): PythonImport[] {
    const imports: PythonImport[] = []
    const lines = source.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip comments and blank lines
      if (!line || line.startsWith('#')) {
        continue
      }

      // Stop at first non-import statement
      if (!line.startsWith('import ') && !line.startsWith('from ')) {
        if (!line.startsWith('@') && !line.startsWith('def ') && !line.startsWith('class ')) {
          continue
        }
        break
      }

      // Parse 'import X, Y, Z'
      const importMatch = line.match(/^import\s+([\w., ]+)/)
      if (importMatch) {
        const names = importMatch[1].split(',').map(n => n.trim())
        imports.push({
          type: 'import',
          module: names[0],
          names,
          line: i + 1,
        })
        continue
      }

      // Parse 'from X import Y, Z'
      const fromMatch = line.match(/^from\s+([\w.]+)\s+import\s+([\w\s*,]+)/)
      if (fromMatch) {
        const names = fromMatch[2]
          .split(',')
          .map(n => n.trim())
          .filter(n => n !== '*')
        imports.push({
          type: 'from',
          module: fromMatch[1],
          names: fromMatch[2].includes('*') ? ['*'] : names,
          line: i + 1,
        })
      }
    }

    return imports
  }

  /**
   * Extract function definitions
   */
  private static extractFunctions(source: string, decorators: string[]): PythonFunction[] {
    const functions: PythonFunction[] = []
    const lines = source.split('\n')

    let currentDecorators: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Track decorators
      if (line.startsWith('@')) {
        currentDecorators.push(line)
        continue
      }

      // Match function definition
      const funcMatch = line.match(/^(async\s+)?def\s+(\w+)\s*\((.*?)\)/)
      if (funcMatch) {
        const name = funcMatch[2]
        const params = this.parseParameters(funcMatch[3])
        const isAsync = !!funcMatch[1]

        // Extract docstring
        const docstring = this.extractFunctionDocstring(lines, i + 1)

        functions.push({
          name,
          line: i + 1,
          decorators: currentDecorators,
          parameters: params,
          docstring,
          isAsync,
        })

        // Top-level decorators (no indentation)
        if (!line.startsWith('    ') && currentDecorators.length > 0) {
          decorators.push(...currentDecorators)
        }

        currentDecorators = []
      } else if (line && !line.startsWith('@') && !line.startsWith('#')) {
        // Reset decorators if we hit non-decorator, non-function code
        currentDecorators = []
      }
    }

    return functions
  }

  /**
   * Extract class definitions
   */
  private static extractClasses(source: string): PythonClass[] {
    const classes: PythonClass[] = []
    const lines = source.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Match class definition
      const classMatch = line.match(/^class\s+(\w+)(?:\s*\((.*?)\))?:/)
      if (classMatch) {
        const name = classMatch[1]
        const baseClasses = classMatch[2]
          ? classMatch[2]
              .split(',')
              .map(b => b.trim())
              .filter(b => b)
          : []

        // Extract docstring
        const docstring = this.extractFunctionDocstring(lines, i + 1)

        // Extract methods (simplified - just find def statements in the class)
        const methods: PythonFunction[] = []
        for (let j = i + 1; j < lines.length && j < i + 100; j++) {
          const methodLine = lines[j]
          // Stop at next class or unindented code
          if (methodLine && !methodLine.startsWith('    ') && !methodLine.startsWith('\t')) {
            break
          }

          const methodMatch = methodLine.match(/^\s*(async\s+)?def\s+(\w+)\s*\((.*?)\)/)
          if (methodMatch) {
            methods.push({
              name: methodMatch[2],
              line: j + 1,
              decorators: [],
              parameters: this.parseParameters(methodMatch[3]),
              isAsync: !!methodMatch[1],
            })
          }
        }

        classes.push({
          name,
          line: i + 1,
          baseClasses,
          methods,
          docstring,
        })
      }
    }

    return classes
  }

  /**
   * Extract function/method docstring
   */
  private static extractFunctionDocstring(lines: string[], startLine: number): string | undefined {
    for (let i = startLine; i < Math.min(startLine + 10, lines.length); i++) {
      const line = lines[i].trim()

      if (line.startsWith('"""') || line.startsWith("'''")) {
        const quote = line.startsWith('"""') ? '"""' : "'''"
        let docstring = line.substring(3)

        if (docstring.endsWith(quote)) {
          return docstring.substring(0, docstring.length - 3).trim()
        }

        // Multi-line docstring
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j]
          if (nextLine.includes(quote)) {
            docstring += '\n' + nextLine.substring(0, nextLine.indexOf(quote))
            return docstring.trim()
          }
          docstring += '\n' + nextLine
        }

        return docstring.trim()
      }
    }

    return undefined
  }

  /**
   * Parse function parameters
   */
  private static parseParameters(paramString: string): string[] {
    if (!paramString.trim()) {
      return []
    }

    return paramString
      .split(',')
      .map(p => p.trim().split('=')[0].split(':')[0]) // Remove defaults and type hints
      .filter(p => p && p !== 'self' && p !== 'cls')
  }

  /**
   * Check if script has tuning injector decorator
   */
  private static hasTuningInjector(source: string, decorators: string[], functions: PythonFunction[]): boolean {
    // Look for common tuning injector patterns
    const injectorPatterns = [
      '@tuning.Tuning.start', // Common Sims 4 pattern
      '@tuning_instance',
      '@tuning_class',
      'tuning_injection',
      'inject_into',
    ]

    // Check decorators
    for (const decorator of decorators) {
      for (const pattern of injectorPatterns) {
        if (decorator.includes(pattern)) {
          return true
        }
      }
    }

    // Check function decorators
    for (const func of functions) {
      for (const decorator of func.decorators) {
        for (const pattern of injectorPatterns) {
          if (decorator.includes(pattern)) {
            return true
          }
        }
      }
    }

    // Check for common injection keywords
    if (source.includes('injections') || source.includes('tuning_injection')) {
      return true
    }

    return false
  }
}

/**
 * Quick helper function to parse Python script
 */
export function parsePython(source: string): PythonScript {
  return PythonParser.parse(source)
}
