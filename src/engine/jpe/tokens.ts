/**
 * JPE Language Token Definitions
 *
 * Defines all token types used by the JPE lexer and parser.
 * Tokens are the smallest meaningful units in the JPE language.
 *
 * Example tokens from "[Module]key = value":
 * - SECTION_OPEN: "["
 * - IDENTIFIER: "Module"
 * - SECTION_CLOSE: "]"
 * - IDENTIFIER: "key"
 * - EQUALS: "="
 * - STRING: "value"
 */

/**
 * All possible token types in JPE language
 */
export enum TokenType {
  // Structural tokens
  SECTION_OPEN = 'SECTION_OPEN',           // [
  SECTION_CLOSE = 'SECTION_CLOSE',         // ]
  EQUALS = 'EQUALS',                       // =
  DOT = 'DOT',                             // .

  // Literal tokens
  STRING = 'STRING',                       // "value" or 'value'
  NUMBER = 'NUMBER',                       // 123, 45.67
  BOOLEAN = 'BOOLEAN',                     // true, false
  IDENTIFIER = 'IDENTIFIER',               // variableName, ModuleName

  // Special tokens
  REFERENCE = 'REFERENCE',                 // ref:TuningId
  COMMENT = 'COMMENT',                     // # comment text
  NEWLINE = 'NEWLINE',                     // \n
  WHITESPACE = 'WHITESPACE',               // spaces, tabs
  EOF = 'EOF',                             // End of file

  // Error token
  UNKNOWN = 'UNKNOWN',                     // Unknown character
}

/**
 * A token represents a lexical unit in the JPE source
 *
 * Example:
 * Input: "[Metadata]"
 * Tokens:
 *   { type: TokenType.SECTION_OPEN, value: "[", line: 1, column: 1 }
 *   { type: TokenType.IDENTIFIER, value: "Metadata", line: 1, column: 2 }
 *   { type: TokenType.SECTION_CLOSE, value: "]", line: 1, column: 10 }
 */
export interface Token {
  type: TokenType
  value: string
  line: number
  column: number
}

/**
 * Token patterns for regex-based recognition
 * Used by the lexer to identify token types
 */
export const TokenPatterns = {
  // Whitespace (not including newlines)
  WHITESPACE: /[ \t]+/,

  // Comments (from # to end of line)
  COMMENT: /#.*/,

  // Strings (double-quoted with escape support)
  STRING_DOUBLE: /"(?:\\.|[^"\\])*"/,

  // Strings (single-quoted with escape support)
  STRING_SINGLE: /'(?:\\.|[^'\\])*'/,

  // Numbers (integer or decimal)
  NUMBER: /(\d+\.\d+|\d+)/,

  // Booleans
  BOOLEAN: /\b(true|false)\b/i,

  // References (ref:identifier)
  REFERENCE: /ref:([a-zA-Z_][a-zA-Z0-9_]*)/,

  // Identifiers (variable or section names)
  IDENTIFIER: /[a-zA-Z_][a-zA-Z0-9_]*/,
}

/**
 * Helper function to get token type name for display
 */
export function getTokenTypeName(type: TokenType): string {
  const names: Record<TokenType, string> = {
    [TokenType.SECTION_OPEN]: 'section open [',
    [TokenType.SECTION_CLOSE]: 'section close ]',
    [TokenType.EQUALS]: 'equals =',
    [TokenType.DOT]: 'dot .',
    [TokenType.STRING]: 'string',
    [TokenType.NUMBER]: 'number',
    [TokenType.BOOLEAN]: 'boolean',
    [TokenType.IDENTIFIER]: 'identifier',
    [TokenType.REFERENCE]: 'reference',
    [TokenType.COMMENT]: 'comment',
    [TokenType.NEWLINE]: 'newline',
    [TokenType.WHITESPACE]: 'whitespace',
    [TokenType.EOF]: 'end of file',
    [TokenType.UNKNOWN]: 'unknown',
  }
  return names[type] || 'unknown'
}

/**
 * Helper to create a token
 */
export function createToken(
  type: TokenType,
  value: string,
  line: number,
  column: number
): Token {
  return { type, value, line, column }
}
