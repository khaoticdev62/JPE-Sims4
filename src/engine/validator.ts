/**
 * JPE VALIDATOR
 *
 * Validates JPE text against 7 core rules:
 * TIER 1 (Errors - Block Compilation):
 *   1. Module Declaration Required
 *   2. Valid Keywords Only
 *   3. Required Structure (WHEN→DO)
 *
 * TIER 2 (Warnings - Best Practices):
 *   4. Description Recommended
 *   5. Proper Indentation
 *   6. Localization Completeness
 *
 * TIER 3 (Info - Suggestions):
 *   7. Compatibility Patterns
 */

import { ValidationResult, ValidationError } from './types'

/**
 * MAIN FUNCTION: Validate JPE text
 *
 * Input: JPE text string
 * Output: ValidationResult with array of errors, warnings, and info messages
 *
 * Example:
 * const result = validateJpe("MODULE: MyMod\nDESCRIPTION: \"My mod\"")
 * if (!result.success) {
 *   console.log(result.errors) // Array of ValidationError
 * }
 */
export function validateJpe(jpeText: string): ValidationResult {
  const errors: ValidationError[] = []

  // Parse into lines with line numbers
  const lines = jpeText.split('\n').map((line, index) => ({
    content: line,
    number: index + 1,
    trimmed: line.trim(),
    indent: getIndentLevel(line),
  }))

  // RULE 1: Module Declaration Required (ERROR)
  checkModuleDeclaration(lines, errors)

  // RULE 2: Valid Keywords Only (ERROR)
  checkValidKeywords(lines, errors)

  // RULE 3: Required Structure - WHEN→DO (ERROR)
  checkRequiredStructure(lines, errors)

  // RULE 4: Description Recommended (WARNING)
  checkDescription(lines, errors)

  // RULE 5: Proper Indentation (WARNING)
  checkIndentation(lines, errors)

  // RULE 6: Localization Completeness (WARNING)
  checkLocalization(lines, errors)

  // RULE 7: Compatibility Patterns (INFO)
  checkCompatibilityPatterns(lines, errors)

  return {
    success: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  }
}

/**
 * RULE 1: Module Declaration Required
 *
 * JPE must start with MODULE: declaration
 * Error if missing or appears after other content
 */
function checkModuleDeclaration(
  lines: { content: string; number: number; trimmed: string }[],
  errors: ValidationError[]
): void {
  // Find first non-empty line
  const firstContentLine = lines.find((line) => line.trimmed)

  if (!firstContentLine) {
    errors.push({
      line: 1,
      severity: 'error',
      message: 'Empty file. JPE must start with MODULE: <name>',
    })
    return
  }

  if (!firstContentLine.trimmed.startsWith('MODULE:')) {
    errors.push({
      line: firstContentLine.number,
      severity: 'error',
      message:
        'Missing MODULE declaration. JPE must start with MODULE: <name>',
    })
  }

  // Also check that MODULE appears exactly once (or warn if duplicated)
  const moduleLines = lines.filter((line) => line.trimmed.startsWith('MODULE:'))
  if (moduleLines.length > 1) {
    for (let i = 1; i < moduleLines.length; i++) {
      errors.push({
        line: moduleLines[i].number,
        severity: 'warning',
        message: 'Duplicate MODULE declaration (only first will be used)',
      })
    }
  }
}

/**
 * RULE 2: Valid Keywords Only
 *
 * Only these keywords are allowed at block level:
 * MODULE, DESCRIPTION, VERSION, AUTHOR, ITEMS, COMPATIBILITY, LOCALIZATION
 */
function checkValidKeywords(
  lines: { content: string; number: number; trimmed: string; indent: number }[],
  errors: ValidationError[]
): void {
  const validKeywords = [
    'MODULE',
    'DESCRIPTION',
    'VERSION',
    'AUTHOR',
    'ITEMS',
    'ITEM',
    'COMPATIBILITY',
    'LOCALIZATION',
    'WHEN',
    'DO',
    'ONLY_IF',
    'CONDITIONS',
  ]

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trimmed || line.trimmed.startsWith('//')) {
      continue
    }

    // Check if line starts with a keyword (colon-terminated or block start)
    const match = line.trimmed.match(/^([A-Z_]+)[\s:]/i)
    if (match) {
      const keyword = match[1].toUpperCase()

      if (!validKeywords.includes(keyword)) {
        errors.push({
          line: line.number,
          severity: 'error',
          message: `Unknown keyword: '${keyword}'. Valid keywords: ${validKeywords.join(', ')}`,
        })
      }
    }
  }
}

/**
 * RULE 3: Required Structure - WHEN→DO
 *
 * If WHEN block exists, it must be followed by DO block
 * DO block must have at least one action
 */
function checkRequiredStructure(
  lines: { content: string; number: number; trimmed: string; indent: number }[],
  errors: ValidationError[]
): void {
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Look for WHEN blocks
    if (line.trimmed.startsWith('WHEN:') || line.trimmed === 'WHEN') {
      const whenLineNum = line.number
      const whenIndent = line.indent

      // Find next non-empty line at same indent level
      let nextLineIndex = i + 1
      while (
        nextLineIndex < lines.length &&
        !lines[nextLineIndex].trimmed
      ) {
        nextLineIndex++
      }

      if (nextLineIndex >= lines.length) {
        errors.push({
          line: whenLineNum,
          severity: 'error',
          message: 'WHEN block must be followed by DO block',
        })
        i++
        continue
      }

      const nextLine = lines[nextLineIndex]

      // Check if next block is DO
      if (!nextLine.trimmed.startsWith('DO:') && nextLine.trimmed !== 'DO') {
        errors.push({
          line: whenLineNum,
          severity: 'error',
          message: 'WHEN block must be followed by DO block',
        })
      } else {
        // Check that DO has content (at least one action)
        let hasAction = false
        let checkIndex = nextLineIndex + 1
        const doIndent = nextLine.indent

        while (checkIndex < lines.length) {
          const checkLine = lines[checkIndex]

          if (!checkLine.trimmed) {
            checkIndex++
            continue
          }

          // If we've dedented below DO level, stop checking
          if (checkLine.indent <= doIndent && checkLine.trimmed) {
            break
          }

          // If this line is indented below DO, it's an action
          if (checkLine.indent > doIndent) {
            hasAction = true
            break
          }

          checkIndex++
        }

        if (!hasAction) {
          errors.push({
            line: nextLine.number,
            severity: 'error',
            message: 'DO block must have at least one action',
          })
        }
      }
    }

    i++
  }
}

/**
 * RULE 4: Description Recommended
 *
 * Warning if DESCRIPTION is missing (best practice)
 */
function checkDescription(
  lines: { content: string; number: number; trimmed: string }[],
  errors: ValidationError[]
): void {
  const hasDescription = lines.some((line) =>
    line.trimmed.startsWith('DESCRIPTION:')
  )

  if (!hasDescription) {
    errors.push({
      line: 1,
      severity: 'warning',
      message:
        'Missing DESCRIPTION (recommended). Add DESCRIPTION: "Your module description"',
    })
  }
}

/**
 * RULE 5: Proper Indentation
 *
 * Warning if indentation is inconsistent
 * Should use 2 spaces per indent level consistently
 */
function checkIndentation(
  lines: { content: string; number: number; trimmed: string; indent: number }[],
  errors: ValidationError[]
): void {
  const indents = new Set<number>()
  const indentSequence: number[] = []

  for (const line of lines) {
    if (line.trimmed && line.indent > 0) {
      indents.add(line.indent)
      indentSequence.push(line.indent)
    }
  }

  // Check if all indents are multiples of 1 (representing 2-space indentation)
  // and don't skip levels (e.g., shouldn't go 0→2→4 directly)
  let lastIndent = 0
  for (let i = 0; i < indentSequence.length; i++) {
    const currentIndent = indentSequence[i]

    // Check if indent increased by more than 1 level
    if (currentIndent > lastIndent && currentIndent - lastIndent > 1) {
      // This is a warning about skipping indent levels
      errors.push({
        line: lines.findIndex((l) => l.indent === currentIndent),
        severity: 'warning',
        message: `Inconsistent indentation: jumped from level ${lastIndent} to ${currentIndent}. Use consistent 2-space indentation.`,
      })
      break
    }

    // Only update lastIndent when we see a deeper indent
    if (currentIndent > lastIndent) {
      lastIndent = currentIndent
    }
  }
}

/**
 * RULE 6: Localization Completeness
 *
 * Warning if LOCALIZATION block exists but doesn't have EN
 * EN is required as fallback for other language strings
 */
function checkLocalization(
  lines: { content: string; number: number; trimmed: string; indent: number }[],
  errors: ValidationError[]
): void {
  let hasLocalization = false
  let localizationLine = 0
  let hasEnglish = false

  for (const line of lines) {
    if (line.trimmed.startsWith('LOCALIZATION:')) {
      hasLocalization = true
      localizationLine = line.number
    }

    // Check for EN: within localization section
    if (hasLocalization && line.trimmed.startsWith('EN:')) {
      hasEnglish = true
    }
  }

  // Warn if LOCALIZATION exists but no EN
  if (hasLocalization && !hasEnglish) {
    errors.push({
      line: localizationLine,
      severity: 'warning',
      message:
        'LOCALIZATION block should include EN: (English) as required fallback language',
    })
  }
}

/**
 * RULE 7: Compatibility Patterns
 *
 * Info message if COMPATIBILITY section exists without ONLY_IF guards
 * Suggests adding ONLY_IF conditions to prevent conflicts
 */
function checkCompatibilityPatterns(
  lines: { content: string; number: number; trimmed: string }[],
  errors: ValidationError[]
): void {
  const hasCompatibility = lines.some((line) =>
    line.trimmed.startsWith('COMPATIBILITY:')
  )
  const hasOnlyIf = lines.some((line) => line.trimmed.includes('ONLY_IF'))

  if (hasCompatibility && !hasOnlyIf) {
    const compatLine = lines.find((line) =>
      line.trimmed.startsWith('COMPATIBILITY:')
    )
    if (compatLine) {
      errors.push({
        line: compatLine.number,
        severity: 'info',
        message:
          'Consider adding ONLY_IF conditions to your mod to prevent conflicts with other mods',
      })
    }
  }
}

/**
 * HELPER: Get indentation level (count leading spaces / 2)
 */
function getIndentLevel(line: string): number {
  const match = line.match(/^(\s*)/)
  return (match?.[1]?.length || 0) / 2
}
