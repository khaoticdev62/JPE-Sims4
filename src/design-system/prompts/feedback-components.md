# Feedback Components Prompt

## Context
Design the auxiliary feedback components for JPE Mod Translator 2.0. These provide crucial information and context without disrupting the main user flow.

## Components to Design

### 1. Tooltip
- **Visuals:**
  - `background-tertiary` (Dark, high contrast).
  - Rounded corners (`radius-small`).
  - Subtle drop shadow.
  - White or `text-primary` typography (`text-small`).
- **Interaction:**
  - Trigger on Hover.
  - Delay: 500ms before appearing.
  - Position: Preferred top/center of trigger.
  - **Z-index:** High (`z-tooltip`).

### 2. Global Status Bar (Application Level)
- **Location:** Absolute bottom of the entire application window.
- **Content:**
  - Application version.
  - Background process status (e.g., "Indexing files...").
  - Connectivity status (if applicable).
  - Quick access to logs.
- **Visuals:**
  - Darker than `background-primary`.
  - Border-top for separation.
  - Non-intrusive, compact height.

## Design Philosophy
- **Information over Attention:** Tooltips should be helpful but not distracting.
- **Consistency:** Use the same typography and spacing tokens as the rest of the app.
