# Claude Code Configuration for JPE Sims 4 Mod Translation Suite

## Project Overview

JPE Sims 4 Mod Translation Suite — A professional AAAA-quality developer platform for Sims 4 mod developers. Users write mod logic in Just Plain English (JPE), translate between JPE/XML formats, run diagnostics, manage plugins, and build mod outputs.

**Current architecture**: Electron + React + Vite + TypeScript + Zustand + Framer Motion

---

## Architecture

### 3-Layer Shell Navigation

```
Layer 1 — src/components/layout/Shell.tsx
  - 60px primary icon rail (PRIMARY_NAV + BOTTOM_NAV)
  - Driven by useAppStore.activeView

Layer 2 — Contextual Secondary Nav (220px, animated slide-in)
  - SECONDARY_NAV: Record<string, {id, label}[]>
  - Driven by useAppStore.activeSubView

Layer 3 — Main Content (src/App.tsx > WorkspaceRouter)
  - AnimatePresence fade transition on activeView change
```

### State Management (`src/stores/`)

```typescript
// useAppStore.ts
interface AppState {
  activeView: string // 'dashboard' | 'studio' | 'diagnostics' | 'builds' | 'plugins' | 'projects' | 'bible' | 'settings' | 'mis' | 'sentinel'
  activeSubView: string | null // e.g. 'errors' | 'warnings' | 'marketplace' | 'library'
  sims4ModPath: string
  hasCompletedOnboarding: boolean
  setActiveView: (v: string) => void
  setActiveSubView: (v: string | null) => void
  setSims4ModPath: (p: string) => void
  setHasCompletedOnboarding: (v: boolean) => void
}

// useProjectStore.ts — project/file state
// useEditorStore.ts  — editor tabs and active file
// useUIStore.ts      — theme (dark/light)
```

### WorkspaceRouter (App.tsx)

```
'dashboard'   → StudioHomeDashboard
'studio'      → EditorLayout
'diagnostics' → DiagnosticsPage
'builds'      → BuildsPage
'plugins'     → PluginsPage
'projects'    → ProjectsPage
'bible'       → DocumentationPage
'settings'    → SettingsPage
'mis'         → ModAtlasPage
'sentinel'    → ModSentinelPage
```

---

## Design System

### Critical: CSS Variable Tokens (NOT Tailwind tokens)

All new UI uses CSS custom properties defined in `src/styles/design-system.css`.
**Do NOT use the old Tailwind token names** like `bg-background-primary` or `text-accent-focus`. Use `var(--token)` or the design-system utility classes.

#### Color Tokens

```css
/* Backgrounds */
--bg-primary: #060810 /* Deep space black — root bg */ --bg-secondary: #0d1017
  /* Panel bg */ --bg-tertiary: #131825 /* Card / input surface */
  --bg-quaternary: #1a2030 /* Tertiary raised surface */ /* Accent */
  --accent-primary: #8b5cf6 /* Neon violet — primary CTA, active state */
  --accent-secondary: #06b6d4 /* Cyan — secondary accent */ /* Text */
  --text-primary: #f1f5f9 --text-secondary: #94a3b8 --text-tertiary: #64748b
  --text-muted: #475569 /* Borders */ --border-subtle: rgba(255, 255, 255, 0.06)
  --border-highlight: rgba(139, 92, 246, 0.25) --border-muted: rgba(255, 255, 255, 0.04);
```

#### CSS Utility Classes (use these, never raw Tailwind colors)

```
Containers:    glass-panel, glass-card
Buttons:       btn-primary, btn-secondary, btn-ghost
Badges:        badge, badge-success, badge-warning, badge-error, badge-accent
Typography:    eyebrow, eyebrow-accent, page-title, neon-text
Effects:       neon-border, custom-scrollbar
```

#### Typography Pattern

```tsx
// eyebrow label
<p className="eyebrow">Label text</p>
<p className="eyebrow-accent">Accented label</p>
// page heading
<h1 className="page-title">Workspace Title</h1>
```

---

## Component Conventions

### Path Aliases

```typescript
// ✅ CORRECT — use @/ aliases
import { useProjectStore } from '@/stores/useProjectStore'
import { cn } from '@/utils/cn'
import Shell from '@/components/layout/Shell'

// ❌ WRONG — no bare relative imports
import Shell from '../../../components/layout/Shell'
```

### New Component Template

```tsx
import { useState } from 'react'
import { SomeIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/useAppStore'

export default function MyWorkspace() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden font-sans">
      {/* Topbar — 44px, consistent across all workspaces */}
      <header className="h-11 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 gap-4">
        <div className="flex items-center gap-2">
          <SomeIcon size={13} className="text-[var(--accent-primary)]" />
          <span className="eyebrow-accent">Workspace Name</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1200px] mx-auto space-y-8">
          <h1 className="page-title">
            Title <span className="text-[var(--text-tertiary)] font-light">Subtitle</span>
          </h1>
          {/* content */}
        </div>
      </main>
    </div>
  )
}
```

### Secondary Nav Wiring Pattern

When a workspace should respond to the Shell's secondary nav:

```tsx
import { useAppStore } from '@/stores/useAppStore'

// Pure derived state — no useEffect needed
const { activeSubView } = useAppStore()
const SUBVIEW_MAP: Record<string, MyFilterType> = {
  'sub-id-1': 'filter-value-1',
  'sub-id-2': 'filter-value-2',
}
const shellFilter = SUBVIEW_MAP[activeSubView ?? '']
const [localFilter, setLocalFilter] = useState<MyFilterType>('all')
const filter = shellFilter ?? localFilter
```

---

## Secondary Nav Configuration (Shell.tsx)

To add subView items to a workspace, add to `SECONDARY_NAV` in `Shell.tsx`:

```typescript
const SECONDARY_NAV: Record<string, { id: string; label: string }[]> = {
  studio:      [{ id: 'entities', label: 'Entities' }, { id: 'editor', label: 'JPE Editor' }, ...],
  diagnostics: [{ id: 'all', label: 'All Issues' }, { id: 'errors', label: 'Errors' }, ...],
  builds:      [...],
  plugins:     [{ id: 'library', label: 'Library' }, { id: 'marketplace', label: 'Marketplace' }],
};
```

---

## File Structure

```
src/
├── App.tsx                          # WorkspaceRouter — wires views
├── stores/
│   ├── useAppStore.ts               # activeView, activeSubView, sims4ModPath
│   ├── useProjectStore.ts
│   ├── useEditorStore.ts
│   └── useUIStore.ts
├── components/
│   ├── layout/
│   │   ├── Shell.tsx                # 3-layer nav shell
│   │   └── EditorLayout.tsx         # Studio multi-pane editor
│   ├── onboarding/
│   │   └── OnboardingWizard.tsx     # 4-step setup wizard (cinematic)
│   ├── modals/
│   │   ├── NewProjectDialog.tsx
│   │   └── AboutDialog.tsx
│   ├── StudioHomeDashboard.tsx      # dashboard
│   ├── DiagnosticsPage.tsx          # diagnostics (activeSubView wired)
│   ├── BuildsPage.tsx               # builds
│   ├── PluginsPage.tsx              # plugins (activeSubView wired)
│   ├── ProjectsPage.tsx             # projects (stat strip, grid/list)
│   ├── DocumentationPage.tsx        # bible/docs
│   ├── SettingsPage.tsx             # settings (6-section sidebar)
│   ├── MobileShell.tsx              # mobile 5-tab companion
│   └── CommandPalette.tsx           # Ctrl+K raycast-style palette
├── styles/
│   ├── design-system.css            # CSS variable tokens + utility classes
│   └── index.css
├── services/                        # FileService, CredentialManager, etc.
├── engine/                          # Parser, Compiler, Validator
├── hooks/                           # useGlobalShortcuts, etc.
└── types/
```

---

## Workspace Implementation Rules

### Topbar (required on all workspaces)

```tsx
<header className="h-11 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 gap-4">
```

### Glass Panels (for cards / panels)

```tsx
<div className="glass-panel rounded-xl border-[var(--border-subtle)] p-5">
<div className="glass-card p-5">  {/* elevated: used for project cards etc. */}
```

### Animation

- Use `framer-motion` `motion.div` for list items, page transitions, and animated state
- AnimatePresence `mode="wait"` on route-level transitions
- Transition preset: `{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }`

---

## Commands

```bash
npm run dev           # Vite dev server (currently running on :5173)
npm run lint          # ESLint check
npm run type-check    # tsc --noEmit
npm run build         # Production bundle
```

---

## Design Rules

1. **Never hardcode hex colors** — use `var(--token-name)`
2. **Accent = neon violet** `var(--accent-primary)` = `#8B5CF6` — NOT brand teal
3. **All surfaces** use translucent glass: `glass-panel` / `glass-card` or inline `bg-[var(--bg-*)]`
4. **Typography scale**: `page-title` → `text-sm font-semibold` → `eyebrow` → `eyebrow-accent`
5. **Icons**: `lucide-react` at `size={13-18}` depending on context
6. **Scrollbars**: always add `custom-scrollbar` to scrollable containers
7. **Secondary nav wiring**: use derived state pattern (never `setState` inside `useEffect`)

---

## Version

- **Platform**: AAAA Next-Gen v2 (redesigned March 2025)
- **Engine**: v2.4.0_alpha
- **Last Updated**: 2026-03-08
