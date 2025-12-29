# Handoff Plan: Claude

## Mission: Implement Font and Icon System

**Objective:** Replace system fonts and placeholder unicode characters with the official **Roboto** font family and **Material Symbols** icon system.

### Context
We have established a new design standard in `MATERIAL_SYMBOLS_AND_FONTS_GUIDE.md`. Your task is to implement the technical infrastructure to load and display these assets in the Python/Qt desktop application.

### Phase 1: Asset Acquisition
1.  **Download Fonts:**
    *   Get `Roboto` (Regular, Medium, Bold) and `Roboto Mono` from Google Fonts.
    *   Get `Material Symbols Outlined` (Variable Font TTF) from Google Fonts.
2.  **Organize:**
    *   Ensure the directory `ui/assets/fonts/` exists.
    *   Place all `.ttf` files there.

### Phase 2: Code Implementation
1.  **Update Font Loader:**
    *   Locate `jpe_studio_qt/fonts.py` (or creating it if missing).
    *   Implement `load_bundled_fonts()` to recursively load all `.ttf` files from `ui/assets/fonts/`.
    *   Ensure it returns a success/failure report.
2.  **Create Icon Helper:**
    *   Create a class or module `ui/icon_manager.py`.
    *   Implement a function `get_icon_char(name: str) -> str` that maps icon names (e.g., "save") to their Material Symbols codepoint (e.g., `\ue161`). *Note: You may need a mapping dictionary.*
    *   Alternatively, if Qt supports ligatures for the font, configure it to use string names.
3.  **Refactor UI:**
    *   Search for hardcoded unicode placeholders (like `➜`, `💾`).
    *   Replace them with the new `Material Symbols` font and the correct codepoint.

### Phase 3: Verification
*   Run `test_fonts.py` to confirm the new fonts are detected by Qt.
*   Run the app (`studio.py`) and verify icons appear correctly (not as squares or tofu).

### Resources
*   `MATERIAL_SYMBOLS_AND_FONTS_GUIDE.md`
*   `ui/theme_manager.py` (Ensure colors match the new icons)
