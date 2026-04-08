## Deferred from: code review (2026-04-02)

- [Review][Defer] Performance: Substring Slicing is Arbitrary — In `QwenService.ts`, truncation of fileContent to 3,000 characters is arbitrary and could miss critical trailing data. Deferred (pre-existing/standard constraint approach).

## Deferred from: code review of story-2.3 (2026-04-02)

- [Review][Defer] Empty Logic Blocks — Generating empty `<L>` tags for empty `DO:` blocks. Harmless but suboptimal.
- [Review][Defer] STBL Key Collisions — Theoretical 32-bit risk for massive mods. Needs multi-bucketing.

## Deferred from: Epic 1 Retrospective (2026-04-02)

- [Shell][Defer] Stacking Contexts — Resolve z-index conflicts between Sidebar and Footer in `main-layout.tsx` (Level: Low).
- [Service][Defer] AI Context Truncation — Increase `QwenService` 3,000 character limit to handle larger JPE/XML translations (Level: Medium).
- [Engine][Defer] Interaction Base Defaults — Refactor `translator.ts` to allow dynamic class selection instead of hardcoded `Interaction` (Level: Low).
