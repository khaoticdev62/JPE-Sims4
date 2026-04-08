# Story 2.5: High-Fidelity Round-Trip Validation

Status: ready-for-dev

## Story

As a Modder,
I want a validation suite that ensures no data loss during conversion,
so that I can confidently edit existing mods without breaking game logic.

## Acceptance Criteria

1. [x] **Functionally Identical XML**: Given a Sims 4 XML, decompiling to JPE and recompiling to XML must result in a functionally identical file (namespaces, hashing, logic blocks preserved).
2. [x] **Symbolic Logic Fidelity**: Handle symbolic mod interaction names (hashed identifiers) without ambiguity (e.g., `#LogicName` vs comments).
3. [x] **Multi-Item Collection Support**: Preserve order and content of multi-item lists (Loot, Trait, Interaction lists) in mixed-content blocks.
4. [ ] **Batch Validation Utility**: A central service/command to run round-trip validation over a set of tuning files and report deviations as critical errors.

## Tasks / Subtasks

- [x] Integrate `fast-xml-parser` for robust XML-to-JPE traversal (AC: 1)
- [x] Implement Strict Column 1 Comment Rule in Lexer (AC: 2)
  - [x] Fix `#` ambiguity for symbolic interaction names
- [x] Hardened `JPEDecompiler` for mixed-content blocks (AC: 3)
  - [x] Support `L` (List) and `V` (Variant) flattening
- [ ] Implement `ProjectValidator` service (AC: 4)
  - [ ] Add `RoundTripValidator.validateFile(xmlPath)` logic
- [ ] Add `npm run validate:roundtrip` CLI script (AC: 4)

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
- Focus shifted to the Project-wide validation utility for AC 4.

## File List
- src/services/translation/decompiler.ts
- src/services/translation/lexer.ts
- src/__tests__/roundtrip.test.ts
- src/__tests__/decompiler_adversarial.test.ts
