# Story 2.5: High-Fidelity Round-Trip Validation

Status: done
Last Updated: 2026-04-11

## Story

As a Modder,
I want a validation suite that ensures no data loss during conversion,
so that I can confidently edit existing mods without breaking game logic.

## Acceptance Criteria

1. [x] **Functionally Identical XML**: Given a Sims 4 XML, decompiling to JPE and recompiling to XML must result in a functionally identical file (namespaces, hashing, logic blocks preserved).
2. [x] **Symbolic Logic Fidelity**: Handle symbolic mod interaction names (hashed identifiers) without ambiguity (e.g., `#LogicName` vs comments).
3. [x] **Multi-Item Collection Support**: Preserve order and content of multi-item lists (Loot, Trait, Interaction lists) in mixed-content blocks.
4. [x] **Batch Validation Utility**: A central service/command to run round-trip validation over a set of tuning files and report deviations as critical errors.

## Tasks / Subtasks

- [x] Integrate `fast-xml-parser` for robust XML-to-JPE traversal (AC: 1)
- [x] Implement Strict Column 1 Comment Rule in Lexer (AC: 2)
  - [x] Fix `#` ambiguity for symbolic interaction names
- [x] Hardened `JPEDecompiler` for mixed-content blocks (AC: 3)
  - [x] Support `L` (List) and `V` (Variant) flattening
- [x] Implement `ProjectValidator` service (AC: 4)
  - [x] Add `RoundTripValidator.validateFile(xmlPath)` logic
- [x] Add `npm run validate:roundtrip` CLI script (AC: 4)

## Dev Notes

- **Decompiler Architecture**: Uses tree-based traversal rather than regex to handle Sims 4 Tuning complexity.
- **Lexer Hardening**: Comment detection is now absolute Column 1 only to allow `#Id` labels in mod content.
- **Validation Standard**: functional identity is required, not literal byte-parity (whitespace/formatting differences are acceptable).

## Dev Agent Record

### Agent Model Used
Antigravity v1.0 (Claude 3.5 Sonnet)

### Debug Log References
- [Epic 1 Retrospective](file:///C:/Users/thecr/.gemini/antigravity/brain/1f64b9b0-572e-4572-9004-4176a4986e87/walkthrough_retro_1.md)

### Completion Notes List
- Existing tests `roundtrip.test.ts` and `decompiler_adversarial.test.ts` confirm 100% current success.
- Implemented `ProjectValidator` with parallel processing support for industrial-scale mods.
- Created `validate:roundtrip` CLI with premium telemetry and error reporting.
- Verified 100% pass rate on integration test suite.

## File List
- src/__tests__/decompiler_adversarial.test.ts

### Review Findings

- [x] [Review][Decision] XML Order Sensitivity — preserveOrder: true implemented
- [x] [Review][Patch] Unbounded Concurrency Risk [ProjectValidator.ts:25]
- [x] [Review][Patch] Synchronous Loop Blocking [RoundTripValidator.ts:148]
- [x] [Review][Patch] Inefficient Counter [ProjectValidator.ts:36]
- [x] [Review][Patch] BigInt Parsing Risks [RoundTripValidator.ts:29]
- [x] [Review][Patch] Namespace Extraction logic [RoundTripValidator.ts:155]
- [x] [Review][Patch] Error Diagnostics enhancement [validate-roundtrip.ts:30]
- [x] [Review][Defer] Terminal Color Compatibility [validate-roundtrip.ts:19] — deferred, pre-existing
- [x] [Review][Defer] Redundant XML Logic [RoundTripValidator.ts:54] — deferred, pre-existing
