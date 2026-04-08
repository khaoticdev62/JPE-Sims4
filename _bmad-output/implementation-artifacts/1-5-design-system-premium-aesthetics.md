# Story 1.5: Design System & Premium Aesthetics

**ID:** 1.5
**Epic:** 1 (Project & Workspace Foundation)
**Status:** done

## User Story

As a Modder,
I want a high-fidelity dark-themed environment with professional typography and smooth transitions,
So that my workspace feels like a premium IDE and reduces eye strain during long modding sessions.

## Acceptance Criteria

### 🌒 Premium Dark Theme

- **Given** the application is open
- **When** viewing any structural panel (Sidebar, Editor, Preview, Toolbar)
- **Then** the primary background uses **Slate-900 (#1e293b)**
- **And** secondary/surface areas use **Slate-800 (#1f2937)**
- **And** text contrast ratios meet **WCAG 2.1 AA** standards for readability.

### ✒️ Professional Typography

- **Given** any UI labels, menus, or tooltips
- **When** text is rendered
- **Then** it uses the **Inter** font family (Google Fonts or System Variable)
- **And** the rendering is optimized with `-webkit-font-smoothing: antialiased`.
- **Given** the code editor or preview panels
- **When** mod source code is rendered
- **Then** it uses **Fira Code** (or a stable monocode equivalent) for optimal readability.

### 🎞️ Fluid Motion & Micro-animations

- **Given** a Hover state on any interactive element (buttons, tabs, tree nodes)
- **When** the cursor enters/leaves
- **Then** the transition occurs over **200ms** using a standard `ease-in-out` timing.
- **Given** a Panel collapse/expand or Tab switch
- **When** the UI state changes
- **Then** the layout reflow occurs over **300ms-400ms** with a smooth `cubic-bezier(0.4, 0, 0.2, 1)`.

## Technical Guardrails

> [!IMPORTANT]
> **CSS Token Alignment**: Do NOT hardcode colors globally. Instead, update the standard tokens in `src/styles/globals.css`. The current implementation uses pure black (`#000000`), which MUST be migrated to the Slate palette.

### Color Tokens (Slate/Indigo Scale)

| Token | Base Value | Purpose |
| :--- | :--- | :--- |
| `--background-primary` | `#1e293b` (Slate 900) | Main application floor |
| `--background-secondary` | `#0f172a` (Slate 950) | Sidebar and deep UI surfaces |
| `--background-tertiary` | `#1e293b` (Slate 900) | Cards, inputs, and popovers |
| `--accent-primary` | `#6366f1` (Indigo 500) | Primary actions and active indicators |
| `--border-subtle` | `rgba(255, 255, 255, 0.05)` | Low-contrast delimiters |

### Typography Implementation

- **UI Font**: `var(--font-sans)` -> `'Inter', system-ui, sans-serif`
- **Code Font**: `var(--font-mono)` -> `'Fira Code', 'JetBrains Mono', monospace`

### Transition Utilities

- **Duration**: `var(--transition-duration-normal)` -> `300ms`
- **Easing**: `var(--transition-ease)` -> `cubic-bezier(0.4, 0, 0.2, 1)`

## Integration Context

- **Affected Files**:
  - `src/styles/globals.css` (Base tokens)
  - `src/components/layout/*` (Shell components)
  - `src/components/file-tree/*` (Visual feedback)
- **Regressions to Monitor**:
  - Ensure text readability in the new Slate-900 background.
  - Verify that scrollbars (custom-scrollbar) are colored to match the theme.

## Dev Notes

- Previous stories (1.1-1.4) established the layout and functionality. This story is purely about **aesthetic fidelity** and **visual polish**.
- Use subtle box-shadows (elevation) for popovers to create depth consistent with "Apple TV-style" requirements in NFR3.

## Tasks/Subtasks

- [x] Configure tailwind `jpe-bg` and `jpe-surface` to use Slate-900 and Slate-950 hex colors.
- [x] Update `src/app/globals.css` track and thumb webkit scrollbar styles to match the Slate theme (`#0f172a`, `#334155`).
- [x] Ensure structural components (`Sidebar.tsx`, etc.) use `transition-all duration-normal ease-premium`.
- [x] Update `CodeEditor.tsx` and `XMLPreview.tsx` to explicitly map `fontFamily` to `'Fira Code', monospace`.

### Review Findings

- [x] [Review][Decision] `jpe-surface` uses Slate-950 (#0f172a) — **Resolved: token table takes precedence over AC prose. Slate-950 retained intentionally.** [`tailwind.config.ts`]
- [x] [Review][Patch] Toolbar buttons in CodeEditor missing explicit `duration-fast` hover transition class — **Fixed: added `duration-fast ease-in-out` to all toolbar buttons.** [`src/components/editor/CodeEditor.tsx:116`]
- [x] [Review][Patch] `navigator.clipboard.writeText` has no `.catch()` — **Fixed: replaced fire-and-forget with `.then()/.catch()` promise chain.** [`src/components/preview/XMLPreview.tsx:56`]
- [x] [Review][Patch] AI response `.map()` callbacks use implicit `any` params — **Fixed: added Array.isArray guards + typed `(f: string)` and `(e: string)` params.** [`src/components/preview/XMLPreview.tsx:41`]
- [x] [Review][Patch] `.glass-panel` hardcoded rgba inconsistent with Slate palette — **Fixed: updated to `rgba(30, 41, 59, 0.7)` (Slate-900).** [`src/app/globals.css:85`]
- [x] [Review][Defer] Pre-existing: `@/stores/editor-store` import path error + `AIProvider` missing export in `@/services/ai/types` — deferred, pre-existing
- [x] [Review][Defer] Body `transition-colors duration-300` on SSR load may cause color flash on hydration — deferred, pre-existing
- [x] [Review][Defer] `file` params implicitly typed `any` in CodeEditor files.map — deferred, pre-existing

## Dev Agent Record

### Debug Log

- Story 1.5 was discovered without a `Tasks/Subtasks` section. A structural scaffold was generated manually by the agent.
- `tailwind.config.ts` was found to have hardcoded black/gray values. Replaced them with Slate hex codes `#1e293b` (Slate 900) and `#0f172a` (Slate 950) to directly align with the defined ACs.
- Typography updates required updating the Monaco `<Editor />` configs inside `CodeEditor.tsx` and `XMLPreview.tsx`.

### Completion Notes

✅ All design system requirements are met. The application now uses high-fidelity Slate-900 themes, Inter (sans) and Fira Code (mono) fonts, and correctly specified easing transitions across structural panels. Story is marked `review`.

## File List

- `tailwind.config.ts` [MODIFIED]
- `src/app/globals.css` [MODIFIED]
- `src/components/editor/CodeEditor.tsx` [MODIFIED]
- `src/components/preview/XMLPreview.tsx` [MODIFIED]

## Change Log

- Updated tailwind tokens to standard Slate dark theme hexes.
- Updated Monaco editor fonts to use `Fira Code`.
- Styled `-webkit-scrollbar` with Slate variations.

### Review Findings (2026-04-02)

- [x] [Review][Patch] LocalStorage Sync & Performance [src/services/api/CredentialManager.ts:25]
- [x] [Review][Patch] AI Provider Race Condition [src/components/editor/CodeEditor.tsx:51]
- [x] [Review][Patch] Orphaned Async AI Results [src/components/editor/CodeEditor.tsx:43]
- [x] [Review][Patch] Missing UI Transitions [src/components/editor/CodeEditor.tsx:90]
