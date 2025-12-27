# Dashboard Screen Assembly Prompt

## Context
Assemble the full "Studio Home Dashboard" for "JPE Mod Translator 2.0" using an atomic approach. This screen is the main hub, optimized for a high-end desktop experience with fluid animations.

## Screen Layout (Atomic assembly)

### 1. Navigation Shell
- **Component:** Sidebar (see `layout-components.md`).
- **Icons:** Use Lucide-style icons for Dashboard, Folder, Settings, User.
- **State:** "Dashboard" icon is in Focused state.

### 2. Header Section
- **Content:** Large typography "Welcome back, [User Name]".
- **Tokens:** `text-primary`, `3xl` font size.
- **Visuals:** Top-left aligned with standard `16` (64px) padding from sidebar.

### 3. Active Projects Row
- **Title:** "Active Projects" (`2xl` font size, `text-secondary`).
- **Container:** Horizontal scroll group.
- **Atomic Items:** 3-4 instances of the "Project Card" (see `layout-components.md`).
- **Assembly:**
  - Card 1: "The Sims 4: Better Exceptions" (Completion: 85%).
  - Card 2: "Medieval Mod Pack" (Completion: 12%).
  - Card 3: "Translation Helper" (Completion: 100%).
- **Interactive:** The first card is in Focused state (Scaled + Glowing).

### 4. Recent Activity List
- **Title:** "Recent Activity" (`xl` font size, `text-secondary`).
- **Container:** Vertical stack.
- **Items:** 5 instances of "Activity List Item".
- **Assembly:**
  - Item 1: `strings.xml` translated (2m ago).
  - Item 2: New project created (1h ago).
  - Item 3: Compilation successful (3h ago).

## Apple TV UX Details
- **Depth:** The active project card should appear to "float" higher than the rest of the UI.
- **Focus:** Soft blue outer glow (`accent-focus` token) around the active card.
- **Fluidity:** Specify that all state transitions use the `cubic-bezier` timing from `studio-home-ux.md`.
