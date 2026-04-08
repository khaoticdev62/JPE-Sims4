# Story 2.2: JPE-to-XML Translation Engine

**ID:** 2.2  
**Epic:** 2 (Core JPE Translation & Editing)  
**Status:** done

## User Story

As a Modder,  
I want my JPE code to be converted into Sims 4 XML tuning files,  
So that I can see the result in-game.

## Acceptance Criteria

### 🏗️ AST Generation
- [x] **Given** a stream of tokens from the JPELexer
- [x] **When** the JPELogicParser is executed
- [x] **Then** it produces a structured Abstract Syntax Tree (AST) representing the mod logic
- [x] **And** it handles nested blocks (WHEN, DO, ONLY_IF) correctly

### 🔢 ID Generation (FnV-64)
- [x] **Given** a named element or interaction
- [x] **When** the translation engine processes the name
- [x] **Then** it generates a collision-free 64-bit decimal ID based on the Sims 4 FnV-64 hashing standard
- [x] **And** this ID remains consistent across compilations for the same name

### 📄 XML Mapping & Preserving Logic
- [x] **Given** a valid AST
- [x] **When** the JPETranslator is executed
- [x] **Then** it maps JPE constructs to Sims 4 XML tuning templates (e.g., `<I c="..." n="..." s="...">` for interactions)
- [x] **And** it translates `ONLY_IF` tests into valid Sims 4 `<test>` or `<V t="sim_info">` structures
- [x] **And** it translates `DO` actions into corresponding `<L n="basic_extras">` or loot references

## Developer Context

- **Source Location**: `src/services/translation/`
- **Output Files**: 
  - `parser.ts`: Recursive descent parser to build AST.
  - `translator.ts`: Logic to convert AST to XML strings.
  - `types.ts`: Update with `AstNode` and `AstNodeType` interfaces.
- **Critical Specs**:
  - Refer to [JPE Master Bible](file:///c:/Users/thecr/Desktop/JPE_Mod_Translator_2.0/docs/JPE_MASTER_BIBLE.md) for keyword intent.
  - Refer to [Architecture Design](file:///c:/Users/thecr/Desktop/JPE_Mod_Translator_2.0/docs/ARCHITECTURE_DESIGN_PRD01_03.md) for component structure.
- **Implementation Strategy**:
  - Use a recursive descent parsing pattern.
  - For ID generation, implement a pure TypeScript FnV-64 hash function that returns a string representation of the 64-bit decimal (avoid JS `Number` overflow).

## Technical Requirements

- **Language**: TypeScript
- **Testing**: Extend `lexer.test.ts` or create `translator.test.ts` with end-to-end JPE -> XML samples.
- **Dependencies**: Use `BigInt` for 64-bit ID calculations.

## Implementation Progress

- [x] Define AST Node types in `types.ts`
- [x] Implement `JPELogicParser` (Tokens -> AST)
- [x] Implement `FnV64` hashing utility
- [x] Implement `JPETranslator` (AST -> XML String)
- [x] Create unit tests for full translation flow

### Review Findings (2026-04-02)

- [x] [Review][Decision] Interaction Class Defaulting — Switched to `Interaction` generic base.
- [x] [Review][Decision] XML ID Format — Switched to Hex (`s="0x..."`) for modder readability.
- [x] [Review][Patch] Lexer: International Character Support — Support Latin-1 extended (é, ü, etc.).
- [x] [Review][Patch] Lexer: skip UTF-8 BOM — Robust processing for files with BOM.
- [x] [Review][Patch] Parser: Keyword guards for unquoted localization.
- [x] [Review][Patch] Parser: Duplicate locale entry prevention.
- [x] [Review][Patch] STBL: Buffer safety checks against `MAX_LENGTH`.
- [x] [Review][Patch] Hashing: fnv32/fnv32ia standardization.
- [x] [Review][Patch] Sanitization: Collapsing sequences and stripping trailing dots.
- [x] [Review][Defer] Empty Logic Blocks — Generating empty <L> tags for empty blocks.
- [x] [Review][Defer] STBL Key Collisions — Theoretical 32-bit risk for massive mods.
