# Story 2.1: JPE Language Lexer & Tokenizer

**ID:** 2.1
**Epic:** 2 (Core JPE Translation & Editing)
**Status:** done

## User Story

As a Modder,
I want the editor to understand the WHEN/DO/ONLY_IF syntax,
So that I can see my errors accurately.

## Acceptance Criteria

### 🔍 Token Identification

- **Given** a JPE source string in the editor
- **When** the lexer processes the input
- **Then** it correctly identifies JPE keywords (WHEN, DO, ONLY_IF, CONDITIONS, LOCALIZATION)
- **And** it tokenizes strings, numbers, and identifiers for the parser

### ❗ Error Reporting

- **Given** malformed JPE source code
- **When** the lexer encounters invalid characters or unclosed strings
- **Then** it reports lexical errors with precise column and line positions

## Developer Context

- **Lexer Location**: `src/services/translation/lexer.ts`
- **Token Types**: `src/services/translation/types.ts`
- **Grammar Reference**:
  - Keywords are case-sensitive (uppercase).
  - Strings use double quotes.
  - Numbers are standard integers or decimals.
  - Comments are prefixed with `#` (standard Sims 4 modding convention).

- [x] Define JPE Token Types
- [x] Implement JPELexer core engine
- [x] Implement error reporting for malformed tokens
- [x] Update Monaco language definition for JPE
- [x] Create unit test suite for Lexer

## Code Review Findings

- [x] [Review][Patch] Multi-line String Column [lexer.ts:100] - Resolved: captured start pos.
- [x] [Review][Patch] Missing String Escapes [lexer.ts:108] - Resolved: added `\` check.
- [x] [Review][Patch] Multi-byte Support [lexer.ts:4] - Resolved: refactored to character array spread.
- [ ] [Review][Decision] Boolean Case Consistency - Deferred: kept as per initial plan.
- [ ] [Review][Defer] 64-bit ID Precision - Deferred: will handle in parser (Story 2.2).
