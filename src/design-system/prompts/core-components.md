# Core Components Prompt

## Context
Design a set of atomic UI components for the "JPE Mod Translator 2.0" desktop application. The aesthetic is "Modern Dark Mode" with heavy "Apple TV UX" influences (Focus, Depth, Fluidity).

## Components to Design

### 1. Button
- **Styles:** Primary, Secondary, Ghost, Destructive.
- **States:** Default, Hover, Active, Focused (critical for Apple TV feel), Disabled.
- **Visuals:** 
  - Subtle gradients or glassmorphism on backgrounds.
  - Smooth scale transformation on Focus state (1.02x scale).
  - Glow effect on Focus state.
  - Rounded corners (match Apple TV/iOS rounded rects).

### 2. Input
- **Types:** Text, Search, Number.
- **States:** Default, Focus, Error, Disabled.
- **Visuals:**
  - Deep dark background (darker than surface).
  - Subtle border that brightens/glows on Focus.
  - Clear label and placeholder typography.

## Technical Constraints
- All colors must reference the Core Style Tokens (e.g., `background-primary`, `accent-focus`).
- Typography must use the standard font stack.
- Export as independent Figma components.