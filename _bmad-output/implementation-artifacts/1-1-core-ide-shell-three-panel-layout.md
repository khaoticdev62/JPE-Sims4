# Story 1.1: Core IDE Shell & Three-Panel Layout

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Modder,
I want a structured three-panel interface,
So that I can manage projects, edit files, and see previews simultaneously.

## Acceptance Criteria

1. **Given** an Electron window environment, **When** the application is launched, **Then** I see the primary three-panel grid (Sidebar, Editor, Preview).
2. **Given** the primary layout, **When** I drag panel borders, **Then** each panel is horizontally resizable.
3. **Given** the application window, **When** I resize the window, **Then** the layout adapts without breaking or overflowing components.
4. **Given** initial launch, **Then** typography strictly uses `Fira Code` (14px) for code and `Inter` (13px) for UI.
5. **Given** initial launch, **Then** the dark theme applies Primary `#1e293b` (dark slate), Secondary `#334155`, Surface `#0f172a`, and Accent `#2563eb`.
6. **Given** any UI interaction, **Then** transitions/hover effects use a 200ms-400ms ease animation (Apple TV aesthetic).

## Tasks / Subtasks

- [x] Task 1: Scaffold Layout Components (AC: 1)
  - [x] Create `src/components/layout/App.tsx` as the grid container root
  - [x] Create empty placeholders for `TitleBar.tsx`, `Sidebar.tsx`, `EditorPane.tsx`, `RightPanel.tsx`, and `StatusBar.tsx` in `src/components/layout/`
- [x] Task 2: Implement Grid Layout & Resizable Panels (AC: 1, 2, 3)
  - [x] Install and integrate `react-resizable-panels` to avoid building custom drag infrastructure
  - [x] Wrap `Sidebar`, `EditorPane`, and `RightPanel` inside resizable PanelGroups
- [x] Task 3: Establish Design System & Theming (AC: 4, 5, 6)
  - [x] Update `tailwind.config.js` to define specific CSS variables for project colors (`primary`, `secondary`, `surface`, `accent`)
  - [x] Link Google Fonts (`Inter` and `Fira Code`) in HTML and configure Tailwind to utilize them
  - [x] Update `src/styles/globals.css` with dark theme variables
- [x] Task 4: Setup IPC Scaffolding (AC: 1)
  - [x] Ensure `main.ts` correctly creates the Electron window with a frameless/custom TitleBar setting
  - [x] Scaffold `preload.ts` to expose `window.ipc` bridge securely via `contextBridge`

### Review Findings

**Patch:**

- [x] [Review][Patch] `title-bar-drag` CSS class undefined — added `-webkit-app-region: drag` + `no-drag` overrides for interactive children to `globals.css`. [`globals.css`]
- [x] [Review][Patch] `fontFamily.sans` not extended to `Inter` — added `sans: ["var(--font-inter)", ...]` to `tailwind.config.ts`. [`tailwind.config.ts:84`]
- [x] [Review][Patch] Tailwind `mono` used literal `"Fira Code"` string — changed to `var(--font-fira-code)` CSS variable via next/font pipeline. [`tailwind.config.ts:85`]
- [x] [Review][Patch] `--surface` missing from `:root` — added with dark-mode matching fallback value to prevent transparent flash. [`globals.css:6`]
- [x] [Review][Patch] `jest.config.ts` coverage excluded `src/main.tsx` (non-existent) — corrected to `src/main.ts`. [`jest.config.ts:17`]

**Deferred (pre-existing / out-of-scope):**

- [x] [Review][Defer] SSR hydration flash: `:root` light-mode values briefly visible before `next-themes` applies `.dark` class. Standard next-themes trade-off. [`globals.css:6`] — deferred, pre-existing
- [x] [Review][Defer] `autoSaveId` localStorage panel corruption could hide panels with no recovery path. [`App.tsx:15`] — deferred, track in follow-up
- [x] [Review][Defer] `h-screen` may produce 1-2px DPI overflow on Windows with custom scaling. [`App.tsx:11`] — deferred, cosmetic


## Dev Notes

**Anti-Pattern Prevention:**
- 🚫 **DO NOT** reinvent the wheel for resizable panels. Use `react-resizable-panels`.
- 🚫 **DO NOT** write raw CSS for colors/spacing. Use standard `<div className="bg-primary text-slate-100">` Tailwind utility classes.
- 🚫 **DO NOT** bypass Electron security. Always communicate via `preload.ts` `contextBridge`.

**Architecture Constraints:**
- **Layer 0 (Electron IPC):** `main.ts` and `preload.ts`.
- **Layer 1 (React UI):** `src/components/layout/`.
- Must adhere strictly to React 18+ strict-mode rendering practices.
- State management (`uiStore.ts`) is *not* required for this story but prepare for Future integration by keeping standard React props minimal.

### Project Structure Notes

- **Required Scaffold:**
  - `src/components/layout/TitleBar.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/EditorPane.tsx`
  - `src/components/layout/RightPanel.tsx`
  - `src/components/layout/StatusBar.tsx`
  - `src/components/layout/App.tsx`
  - `src/styles/globals.css`

### References

- [Source: docs/ARCHITECTURE_DESIGN_PRD01_03.md#2.1 Module Structure]
- [Source: docs/ARCHITECTURE_DESIGN_PRD01_03.md#2.2 Core Components Diagram]
- [Source: docs/JPE_STUDIO_EDITOR_FRONTEND_SPEC.md#3.1 Main Layout]

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (High)

### Debug Log References
- Next/Jest migration: Migrated the jest config from strict ts-jest to next/jest to handle React 18 JSX correctly alongside the App Router font integrations.
- Electron tests: Mocked electron via virtual jest module logic to decoupled testing.
- UI Testing: Validated all 3 resizable panes rendering using standard DOM queries.

### Completion Notes List
- ✅ Task 1: Created `src/components/layout/App.tsx` and all layout placeholders (`TitleBar.tsx`, etc). Adjusted `page.tsx` to render the newly created `AppShell`.
- ✅ Task 2: Built out 3-panel split utilizing `react-resizable-panels`, exposing standard window drag points.
- ✅ Task 3: Established base design aesthetics incorporating `Fira Code` & `Inter`, integrating custom dark theme attributes for `.dark` and Next.js layout parameters.
- ✅ Task 4: Bootstrapped `main.ts` and `preload.ts` satisfying Electron Layer-0 architecture safely.
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List
- src/components/layout/App.tsx
- src/components/layout/TitleBar.tsx
- src/components/layout/Sidebar.tsx
- src/components/layout/EditorPane.tsx
- src/components/layout/RightPanel.tsx
- src/components/layout/StatusBar.tsx
- src/app/page.tsx
- src/app/layout.tsx
- src/main.ts
- src/preload.ts
- tailwind.config.ts
- src/app/globals.css
- jest.config.ts
- jest.setup.ts
- src/__tests__/layout.test.tsx
