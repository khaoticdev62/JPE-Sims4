# Editor Workspace Assembly Prompt

## Context
Assemble the "Project Editor Workspace" for JPE Mod Translator 2.0. This screen is the primary work area, composed of atomic components defined previously. It requires a precise layout to maximize coding space while keeping tools accessible.

## Screen Layout (Grid System)

### 1. Sidebar (Left, 20% width)
- **Component:** Sidebar (from `layout-components.md`).
- **Content:** File Tree.
- **Visuals:** `border-r` separator.

### 2. Editor Pane (Center, 60% width)
- **Top Bar:** Tab Bar (horizontal scroll).
- **Main Area:** Code Area.
  - Gutter (Line numbers).
  - CodeMirror instance (Text).
  - Minimap (Right edge overlay).
- **Bottom Bar:** Status Bar (see `editor-components.md`).

### 3. Right Panel (Right, 20% width)
- **Component:** Diagnostics Panel / Properties Panel.
- **State:** Toggled between "Diagnostics" and "Properties".
- **Visuals:** `border-l` separator.

## Apple TV UX Details
- **Focus:** The "Active Tab" has a subtle top-border glow (`accent-primary`).
- **Depth:** Panels (Sidebar, Right Panel) sit on a slightly lower Z-plane (darker background) than the Editor Pane.
- **Fluidity:** Collapsing the Right Panel should smoothly expand the Editor Pane.

## Assembly Instructions
1. Place Sidebar on Left.
2. Place Right Panel on Right.
3. Fill remaining center space with Editor Pane.
4. Ensure Status Bar spans the full width of the Editor Pane.
