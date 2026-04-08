# Implementation Plan - Story 2.1: JPE Language Lexer & Tokenizer

Implement the core lexical analysis engine for the "Just Plain English" (JPE) language to enable syntax highlighting and error detection in the JPE Studio Editor.

## User Review Required

> [!IMPORTANT]
> This story focuses strictly on **Lexical Analysis** (tokenization). Full semantic parsing (Story 2.2) and validation (Epic 3) will follow. The immediate benefit will be significantly improved syntax highlighting and basic character-level error reporting.

## Proposed Changes

### Core Translation Service

#### [NEW] [lexer.ts](file:///c:/Users/thecr/Desktop/JPE_Mod_Translator_2.0/src/services/translation/lexer.ts)
- Implement `JPELexer` class.
- Support keywords: `WHEN`, `DO`, `ONLY_IF`, `CONDITIONS`, `LOCALIZATION`.
- Support literals: Strings (quoted), Numbers, Booleans (`true`/`false`).
- Support identifiers: Element names and paths.
- Support operators/symbols: `:`, `(`, `)`, `,`.

#### [NEW] [types.ts](file:///c:/Users/thecr/Desktop/JPE_Mod_Translator_2.0/src/services/translation/types.ts)
- Define `TokenType` enum.
- Define `Token` interface (type, value, start/end position).

---

### Monaco Integration

#### [MODIFY] [monaco-config.ts](file:///c:/Users/thecr/Desktop/JPE_Mod_Translator_2.0/src/utils/monaco-config.ts)
- Enhance the `registerJPELanguage` function.
- Update `monarch` tokens provider to accurately reflect the JPE keyword list and literal patterns.
- Ensure proper coloring for the premium IDE aesthetics.

---

### Testing

#### [NEW] [lexer.test.ts](file:///c:/Users/thecr/Desktop/JPE_Mod_Translator_2.0/src/__tests__/lexer.test.ts)
- Unit tests for keyword identification.
- Tests for malformed tokens and error reporting.
- Tests for complex JPE snippets (e.g., nested conditions).

## Verification Plan

### Automated Tests
- Run `npm test src/__tests__/lexer.test.ts` to verify tokenization accuracy.

### Manual Verification
- Open the JPE Editor in the IDE.
- Type various JPE constructs (`WHEN SIM_HAS_BUFF...`).
- Verify that keywords are highlighted correctly according to the premium design system.
- Verify that invalid characters trigger a visual indicator (if integrated with Monaco markers).
