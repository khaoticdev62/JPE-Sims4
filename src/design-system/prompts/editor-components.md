# Editor Components Prompt

## Context
Design the atomic UI components for the "JPE Mod Translator 2.0" Editor Workspace. This is the core area where users translate strings and edit code.

## Components to Design

### 1. Editor Tab
- **Visuals:**
  - `background-secondary` (inactive) vs `background-primary` (active).
  - Top border highlight or distinct text color for active state.
  - Close button (X) visible on hover or always on active tab.
  - Dirty State indicator (small dot or modified icon color).
- **Interaction:**
  - Click to activate.
  - Drag to reorder (future proofing).

### 2. Gutter (Line Numbers)
- **Visuals:**
  - `background-tertiary` or subtle separation from code area.
  - Text color: `text-muted` (low contrast).
  - Current line number highlighted (`text-primary`).
- **Functionality:**
  - Space for folding arrows.
  - Space for diagnostic icons (red dot for errors).

### 3. Status Bar
- **Location:** Bottom of the editor pane.
- **Content:**
  - Cursor position (Ln 12, Col 4).
  - File encoding (UTF-8).
  - Language mode (JPE/XML).
  - Indentation (Spaces: 4).
- **Visuals:**
  - Low height (24px - 32px).
  - `text-small`, `text-muted`.

## Typography
- **Code Font:** Use a high-legibility Monospace font (JetBrains Mono, Fira Code, or system mono).
- **Ligatures:** Enabled if supported.

## Technical Constraints
- Must integrate with `CodeMirror` theming structure.
- Colors must reference Core Style Tokens.
