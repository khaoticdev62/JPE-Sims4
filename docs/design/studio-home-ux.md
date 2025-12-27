# UX Flow & Wireframe: Studio Home Dashboard

## Overview
The Studio Home Dashboard is the primary entry point for users. It provides a high-level overview of their mod translation projects, recent activity, and quick access to essential tools.

## User Flow
1. **Entry:** User launches JPE Studio.
2. **Dashboard Load:** The system loads the list of active projects and recent changes.
3. **Selection:** User navigates through project cards using keyboard (arrow keys) or mouse.
4. **Focus:** Hovering/Focusing on a project card triggers a scale animation and glow effect (Apple TV UX).
5. **Action:** Clicking/Pressing Enter on a project card opens the Mod Editor for that project.

## Wireframe Structure (Low-Fidelity)

### Layout:
- **Left Sidebar:** Navigation Icons (Dashboard, Projects, Settings, Help).
- **Main Area:**
  - **Top:** "Good [Morning/Afternoon], [User Name]" greeting.
  - **Middle:** "Active Projects" horizontal scrolling list (Apple TV style row).
  - **Bottom:** "Recent Activity" vertical list showing file changes and translation status.

## Component Breakdowns

### Project Overview (Active Projects)
- **Component:** Card Row.
- **Card Content:** Project Icon, Name, Completion Percentage, Last Modified Date.
- **Interaction:** Horizontal scroll focus.

### Recent Activity
- **Component:** List Item.
- **Content:** File Name, Change Type (Added, Modified, Translated), Time Ago.
- **Visuals:** Subtle separators, clear status icons.

## Apple TV UX Enhancements
- **Spatial Depth:** Background is `background-primary`, Cards are `background-secondary`, Modals are `background-tertiary` with blur.
- **Focus Engine:** High contrast on focused elements with a soft outer glow.
- **Fluidity:** All state transitions (Hover -> Focus) use `cubic-bezier(0.4, 0, 0.2, 1)` for 200ms.
