/**
 * JPE Language Grammar Definition
 *
 * Formal specification of the JPE (Just Plain English) language syntax.
 * Uses EBNF (Extended Backus-Naur Form) notation.
 *
 * JPE is a human-readable format for Sims 4 mod configuration.
 * It translates to/from XML tuning files.
 */

/**
 * JPE Grammar Rules (EBNF Notation)
 *
 * Terminal symbols (in lowercase): keywords, operators, literals
 * Non-terminal symbols (in PascalCase): grammar rules
 *
 * Operators:
 *   |   = alternation (choice)
 *   *   = zero or more
 *   +   = one or more
 *   ?   = optional (zero or one)
 *   {}  = grouping
 */

/**
 * Grammar specification as a string reference document
 *
 * This is a human-readable specification that can be used for:
 * - Understanding JPE syntax
 * - Validating implementations
 * - Documenting the language
 */
export const JPEGrammarText = `
JPE Grammar Specification
==========================

1. DOCUMENT
   Document = Section+

   A JPE document consists of one or more sections.
   Each section groups related configuration data.

2. SECTION
   Section = SectionHeader Line*
   SectionHeader = "[" Identifier "]"

   Sections start with a header in square brackets and are followed by lines.
   Example: [Metadata]

3. LINE
   Line = Assignment | Comment | BlankLine

   A line is either an assignment, a comment, or blank.
   Comments and blank lines are ignored by the parser.

4. ASSIGNMENT
   Assignment = Key "=" Value

   Assigns a value to a key. The key can be nested with dots.
   Example: type = "tuning"
   Example: metadata.author = "John"

5. KEY
   Key = Identifier ("." Identifier)*

   Keys can be simple identifiers or nested with dot notation.
   Example: simple_key
   Example: parent.child.grandchild

6. VALUE
   Value = String | Number | Boolean | Reference | List | Tuple

   Values can be strings, numbers, booleans, references, or nested structures.

7. STRING
   String = '"' Character* '"'
   Character = EscapedChar | RegularChar
   EscapedChar = '\\' ('n' | 't' | 'r' | '\\' | '"')

   Strings are enclosed in double quotes.
   Supports escape sequences: \\n, \\t, \\r, \\\\, \\"

8. NUMBER
   Number = Integer | Decimal
   Integer = Digit+
   Decimal = Digit+ "." Digit+
   Digit = "0" | "1" | ... | "9"

   Numbers can be integers or decimals.
   Examples: 42, 3.14, 100

9. BOOLEAN
   Boolean = "true" | "false"

   Case-sensitive boolean literals.

10. REFERENCE
    Reference = "ref:" Identifier

    References to other tuning IDs by name.
    Example: ref:CookingSkill

11. COMMENT
    Comment = "#" Character*

    Comments start with # and extend to end of line.
    Example: # This is a comment

12. BLANK_LINE
    BlankLine = Whitespace? Newline

    Empty lines are allowed between sections and assignments.

13. WHITESPACE
    Whitespace = Space | Tab
    Space = " "
    Tab = "\\t"

14. IDENTIFIER
    Identifier = (Letter | "_") (Letter | Digit | "_")*
    Letter = "a" | ... | "z" | "A" | ... | "Z"

    Identifiers start with a letter or underscore,
    followed by letters, digits, or underscores.
    Examples: MyVariable, _private, myVar123

15. NEWLINE
    Newline = "\\n"
`

/**
 * Grammar specification as TypeScript interface
 * Can be used programmatically for grammar validation
 */
export interface GrammarRule {
  name: string
  description: string
  examples: string[]
  pattern?: RegExp
}

/**
 * Grammar rules as data structures
 * Useful for generating parsers or documentation
 */
export const GrammarRules: Record<string, GrammarRule> = {
  Document: {
    name: 'Document',
    description: 'A JPE document consisting of one or more sections',
    examples: [
      '[Metadata]\ntype = "tuning"',
      '[Section1]\nkey1 = "value1"\n[Section2]\nkey2 = "value2"',
    ],
  },

  Section: {
    name: 'Section',
    description: 'A section with header and content lines',
    examples: ['[Metadata]\ntype = "tuning"', '[Items]\ncount = 42'],
  },

  SectionHeader: {
    name: 'SectionHeader',
    description: 'Section name in square brackets',
    examples: ['[Metadata]', '[Items]', '[MySection]'],
    pattern: /^\[([a-zA-Z_][a-zA-Z0-9_]*)\]$/,
  },

  Line: {
    name: 'Line',
    description: 'Assignment, comment, or blank line',
    examples: ['key = "value"', '# this is a comment', ''],
  },

  Assignment: {
    name: 'Assignment',
    description: 'Key-value pair separated by equals sign',
    examples: ['name = "MyValue"', 'parent.child = 123', 'enabled = true'],
  },

  Key: {
    name: 'Key',
    description: 'Identifier or nested identifier path',
    examples: ['simple', 'nested.key', 'a.b.c.d'],
    pattern: /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/,
  },

  Value: {
    name: 'Value',
    description: 'String, number, boolean, or reference',
    examples: ['"text"', '42', '3.14', 'true', 'ref:TuningId'],
  },

  String: {
    name: 'String',
    description: 'Double-quoted text with optional escape sequences',
    examples: ['"simple"', '"with spaces"', '"escaped \\"quotes\\""', '"newline \\n"'],
    pattern: /"(?:\\.|[^"\\])*"/,
  },

  Number: {
    name: 'Number',
    description: 'Integer or decimal number',
    examples: ['0', '42', '-100', '3.14', '-2.5'],
    pattern: /^-?(\d+|\d+\.\d+)$/,
  },

  Boolean: {
    name: 'Boolean',
    description: 'true or false',
    examples: ['true', 'false'],
    pattern: /^(true|false)$/i,
  },

  Reference: {
    name: 'Reference',
    description: 'Reference to another tuning by ID',
    examples: ['ref:CookingSkill', 'ref:MyTuning', 'ref:ID_12345'],
    pattern: /^ref:([a-zA-Z_][a-zA-Z0-9_]*)$/,
  },

  Comment: {
    name: 'Comment',
    description: 'Comment from # to end of line',
    examples: ['# simple comment', '# another comment with details'],
    pattern: /#.*/,
  },

  Identifier: {
    name: 'Identifier',
    description: 'Name for variable or section',
    examples: ['myVar', '_private', 'MyClass', 'id123'],
    pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
  },
}

/**
 * Helper function to validate if a string matches a grammar rule
 */
export function validateGrammarRule(ruleName: string, value: string): boolean {
  const rule = GrammarRules[ruleName]
  if (!rule || !rule.pattern) {
    return false
  }
  return rule.pattern.test(value)
}

/**
 * Get rule description for error messages
 */
export function getGrammarRuleDescription(ruleName: string): string {
  const rule = GrammarRules[ruleName]
  return rule ? rule.description : 'Unknown rule'
}

/**
 * Get rule examples for help/documentation
 */
export function getGrammarRuleExamples(ruleName: string): string[] {
  const rule = GrammarRules[ruleName]
  return rule ? rule.examples : []
}
