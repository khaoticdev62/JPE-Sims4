/**
 * JPE Language Module
 *
 * Provides lexical analysis and parsing for JPE (Just Plain English) format.
 *
 * Main components:
 * - Token definitions (tokens.ts)
 * - Grammar specification (grammar.ts)
 * - Lexer for tokenization (lexer.ts)
 * - Parser for AST generation (parser.ts)
 *
 * Usage:
 * ```
 * import { tokenize } from '@/engine/jpe/lexer'
 * import { parse } from '@/engine/jpe/parser'
 *
 * const jpeCode = "[Metadata]\\ntype = \\"tuning\\""
 * const tokens = tokenize(jpeCode)
 * const ast = parse(tokens)
 * ```
 */

export * from './tokens'
export * from './grammar'
export * from './lexer'
export * from './parser'

// Re-export common functions
export { tokenize } from './lexer'
export { parse } from './parser'
