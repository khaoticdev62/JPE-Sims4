# Right Panel Components Prompt

## Context
Design the atomic UI components for the "Right Panel" of JPE Mod Translator 2.0. This panel houses context-sensitive tools like real-time diagnostics (errors/warnings) and file properties.

## Components to Design

### 1. Diagnostics Panel
- **Layout:** Vertical list of diagnostic items.
- **Filter Bar:** Toggle buttons for "Error", "Warning", "Info".
- **Item Visuals:**
  - **Error:** Red accent/icon.
  - **Warning:** Yellow/Orange accent/icon.
  - **Info:** Blue/Gray accent/icon.
  - **Interaction:** Click jumps to line in editor. Hover shows detailed tooltip.

### 2. Properties Panel
- **Layout:** Key-Value pair list or Form inputs.
- **Component:** Accordion (collapsible sections).
- **Visuals:**
  - Compact text (`text-small`).
  - `background-secondary` for headers.
  - Clear separation between fields.

## Visual Style (Atomic)
- **Container:** `background-secondary` with left border.
- **Headers:** Uppercase, tracked out, `text-muted`.
- **Scrollbar:** Thin, custom styled to match theme.
