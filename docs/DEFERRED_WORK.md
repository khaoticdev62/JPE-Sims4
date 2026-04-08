# Deferred Work & Technical Debt

This document tracks technical debt and architectural conflicts identified during the development of JPE Mod Translator 2.0.

## IDE Shell & Layout

### ⚙️ TD-01: Z-Index Stacking Context Conflict
- **Status**: Open
- **Discovery**: Epic 1 Retrospective
- **Description**: The Sidebar navigation and Footer components have overlapping stacking contexts in `main-layout.tsx`. Current workaround uses manual `z-[1000]` values, which will lead to fragility as the diagnostics panel is integrated.
- **Remedy**: Refactor the root shell to use a standardized z-index scale (e.g., UI Layer tokens).

## AI Service Layer

### ⚙️ TD-02: QwenService Token Truncation
- **Status**: Open
- **Discovery**: Story 2.6 (Nested Logic Spike)
- **Description**: The current `QwenService` implementation truncates outputs at 3,000 characters to prevent timeout. This is insufficient for "Mega-Mods" with 1,000+ line XML files.
- **Remedy**: Implement a streaming response handler or a multi-pass translation strategy for large Tuning files.

- [ ] **TD-06**: Extend Semantic XML Comparison to support non-standard Tuning Tags (U, P, V-nested) in Epic 4.
- [ ] **TD-07**: Increase `JPEDecompiler` coverage for esoteric mod tuning buffers in Epic 4.

---
*Last Updated: 2026-04-02*
