# Handoff Plan: Qwen

## Mission: Verify, Generate, and Polish

**Objective:** Validate the implementation of the new font/icon system and use Google Stitch strategies to generate missing high-fidelity assets.

### Context
Claude is implementing the core font loading and icon replacement. Your role is to ensure it looks perfect and fill in the gaps with AI-generated assets where standard icons fail.

### Phase 1: Validation
1.  **Font Verification:**
    *   After Claude's changes, run `test_fonts.py`. Ensure "Roboto" and "Material Symbols Outlined" are listed.
    *   Check `DEBUGGING_REPORT.md` if issues arise.
2.  **Visual QA:**
    *   Launch `studio.py`.
    *   Check all 10 Themes (Cyberpunk, Sunset, etc.).
    *   **Pass Criteria:**
        *   Text is legible (Roboto).
        *   Code is monospaced (Roboto Mono).
        *   Icons are sharp and aligned.
        *   No "tofu" (missing character boxes).

### Phase 2: Asset Generation (Google Stitch)
1.  **Identify Gaps:**
    *   Look for empty spaces or places where a simple icon isn't enough (e.g., the "Welcome" screen banner, or a complex "Mod Dependency Graph" background).
2.  **Generate:**
    *   Use the **Google Stitch** methodology (described in `MATERIAL_SYMBOLS_AND_FONTS_GUIDE.md`).
    *   Create prompt-based assets for these gaps.
    *   *Simulate:* If you cannot access the tool directly, define the exact prompts and expected SVG structure for a developer to insert.
3.  **Integration:**
    *   Place generated assets in `ui/assets/images/`.
    *   Update `UI_UX_ASSET_CHECKLIST.md` to mark them as "Enhanced".

### Phase 3: Documentation
1.  **Update Master Records:**
    *   Once verified, update `JPE_MASTER_BIBLE.md` to reflect the transition from "Unicode Placeholders" to "Material Symbols".
    *   Update `UI_UX_ASSET_CHECKLIST.md` status.

### Resources
*   `MATERIAL_SYMBOLS_AND_FONTS_GUIDE.md`
*   `UI_UX_ASSET_CHECKLIST.md`
