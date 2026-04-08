# Story 1.4: Mod Elements Browser

Status: review

## Story

As a Modder,
I want to see a categorized list of my mod components,
So that I can quickly jump to specific game logic elements.

## Acceptance Criteria

1. **Given** a project containing Sims 4 mod files, **When** I switch to the Mod Elements sub-view, **Then** I see files grouped by "Interactions," "Buffs," and "Traits."
2. **Given** the categorized list, **When** I add or remove files in the project, **Then** the category counts update automatically.
3. **Given** the Elements sub-view, **When** I use the search bar, **Then** only elements (Interactions/Buffs/Traits) matching the search term (by name) remain visible.
4. **Given** an element in the browser, **When** I click it, **Then** it opens/activates in the Multi-Tab Editor.

## Tasks / Subtasks

- [x] Task 1: Initialize Mod Elements Store
  - [x] Create `src/stores/elementsStore.ts` with Zustand to handle the `activeSubView` ('explorer' | 'elements') and `elementSearchQuery`.
- [x] Task 2: Implement Element Discovery Logic
  - [x] Create a utility to traverse `projectStore.files` and extract elements based on naming heuristics (files containing "Buff", "Interaction", or "Trait").
- [x] Task 3: Build Navigation Header for Sidebar
  - [x] Add a toggle bar to the top of the Sidebar to switch between "Files" and "Logic Elements."
- [x] Task 4: Implement ModElementsBrowser Component
  - [x] Render categorized Accordion-style lists for each type.
  - [x] Display child counts in each heading.
  - [x] Add a search input with clear-on-esc behavior.
- [x] Task 5: Integration
  - [x] Connect clicks in the Elements Browser to `editorStore.openTab`.
  - [x] Ensure automatic updates when the project file tree changes.

## Dev Notes

**Guardrails:**
- 🚫 **DO NOT** perform deep XML parsing yet (Epic 2 scope). Use simple path/filename heuristics for this story.
- 🚫 **DO NOT** duplicate content state. Reference files from `projectStore` by their ID (path).
- **Icons**: Use `Box` for Elements and `Layers` or `Search` for the category headings from `lucide-react`.

## Architecture Compliance:
- **State**: Keep `elementsStore` minimal. Primary project data stays in `projectStore`.
- **UI**: Maintain the Slate/Dark-Blue aesthetic established in 1.1 (#1e293b).

### Project Structure Changes:
- Create `src/stores/elementsStore.ts`
- Create `src/components/layout/ModElementsBrowser.tsx`
- Modify Sidebar parent component (or create it if it's integrated).

## Dev Agent Record

### Agent Model Used
Gemini 3 Flash

### Debug Log References
- `npm test src/__tests__/discoverElements.test.ts` PASSED (14 tests)
- `npm test src/__tests__/elementsStore.test.ts` PASSED (5 tests)
- `npm test src/__tests__/editorStore.test.ts` PASSED (Regression check, 6 tests)

### Completion Notes List
- Implemented `elementsStore` to manage sidebar sub-view state and search query.
- Created `discoverElements` utility for naming-heuristic based categorization of mod files.
- Refactored `Sidebar.tsx` into a multi-tabbed component with premium SVG icons from `lucide-react`.
- Developed `ModElementsBrowser.tsx` with high-fidelity effects, collapsible categories, and real-time counts.
- Connected elements browser to `editorStore` for seamless file opening and `projectStore` for live project observation.

### File List
- `src/stores/elementsStore.ts`
- `src/utils/discoverElements.ts`
- `src/components/layout/ModElementsBrowser.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/__tests__/discoverElements.test.ts`
- `src/__tests__/elementsStore.test.ts`

### Change Log
- 2026-04-02: Initial implementation of Mod Elements Browser and sidebar navigation tabs.

---
*Created by Antigravity Context Engine.*
