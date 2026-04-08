# Story 1.3: Multi-Tab Editor System

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Modder,
I want to open multiple files in tabs,
So that I can switch between different parts of my mod without losing my place.

## Acceptance Criteria

1. **Given** the Editor Pane is active, **When** I double-click or select a file from the Project Explorer, **Then** the file opens in a new tab if not already open, and becomes the active tab.
2. **Given** multiple open tabs, **When** I click a tab header, **Then** that tab becomes active and displays its content.
3. **Given** an active tab with simulated changes, **Then** a visible indicator (e.g., a dot) appears on the tab.
4. **Given** an open tab, **When** I click the close [x] button, **Then** the tab closes and the next logical tab becomes active (or the editor clears if no tabs remain).
5. **Given** file content, **When** switching tabs, **Then** the active tab displays the correct corresponding file content.

## Tasks / Subtasks

- [x] Task 1: Initialize Editor & Tab State Store
  - [x] Create `src/types/editor.ts` to define tab state structures (`Tab`, `EditorState`).
  - [x] Create `src/stores/editorStore.ts` using Zustand to manage `tabs` (array), `activeTabId`, and store actions (`openTab`, `closeTab`, `setActiveTab`, `updateTabContent`).
- [x] Task 2: Implement File Reading via IPC
  - [x] Add a `project:readFile` handler in `main.ts` using `fs/promises.readFile`.
  - [x] Expose `project.readFile(path)` in `preload.ts` and `src/types/electron.d.ts`.
- [x] Task 3: Implement Multi-Tab UI Components
  - [x] Build a horizontal Tab Bar at the top of the `EditorPane`.
  - [x] Design individual `TabItem` components matching the dark aesthetic (slate backgrounds for inactive, slightly lighter for active).
  - [x] Include a close `X` icon button (`lucide-react`) and an unsaved circle indicator on the tabs.
- [x] Task 4: Connect Project Explorer
  - [x] Update `ProjectExplorer` click behavior: when a file node (not folder) is clicked, dispatch it to `editorStore`, triggering the IPC read and creating/activating the tab.
- [x] Task 5: Editor Content Area
  - [x] Render the active tab's content in a simple `<textarea>` within `EditorPane.tsx`.
  - [x] Add a temporary `onChange` handler to the textarea that updates the tab content and marks it `isDirty: true` to test the unsaved indicator.
  - [x] Show an empty/blank state message when no tabs are open.

## Dev Notes

**Anti-Pattern Prevention:**
- 🚫 **DO NOT** store massive file content strings directly in the DOM tree for all files at once. Render only the active tab's content.
- 🚫 **DO NOT** mutate React state directly. Use Zustand's immutable updates for adding, removing, or setting the active tab.
- 🚫 **DO NOT** implement a fully-fledged Monaco/CodeMirror text editor yet! A simple styled `<textarea>` is sufficient to prove the multi-tab state logic works. The real code editor integration belongs to a future Epic 2 story.

**Architecture Constraints:**
- **State Management**: `editorStore` is the source of truth for open files and editing state. It is a sibling to `projectStore` (which manages the filesystem tree).
- **Icons**: Utilize `lucide-react` for standard UI elements like the close icon.

**Previous Story Intelligence (Story 1.1 & 1.2):**
- **Layout Config**: You are working inside the center `<Panel>` established in Story 1.1.
- **Tree Integration**: `ProjectExplorer` uses `react-arborist` and has an internal `onToggle` behavior for folders. You need to implement an action when leaf nodes (type !== 'folder') are clicked or double-clicked.
- **Strict Types**: The IPC bridge is strictly typed via `electron.d.ts`. Ensure new file reading capabilities follow this pattern.

### Project Structure Notes

- **Required Scaffolding/Changes:**
  - Modify `src/main.ts` & `src/preload.ts`
  - Modify `src/types/electron.d.ts`
  - Create `src/types/editor.ts`
  - Create `src/stores/editorStore.ts`
  - Modify `src/components/layout/EditorPane.tsx`
  - Modify `src/components/layout/ProjectExplorer.tsx`

### References

- [Source: epics.md#Story 1.3]

## Dev Agent Record

### Agent Model Used
Gemini 3 Flash

### Debug Log References
- `npm test src/__tests__/editorStore.test.ts` passed (6/6).

### Completion Notes List
- Implemented `editorStore` (Zustand) for tab lifecycle management (open, switch, close, dirty-tracking).
- Added `project:readFile` IPC handler in `main.ts` and exposed it in `preload.ts` with strict TypeScript definitions.
- Rewrote `EditorPane.tsx` with a premium scrolling Tab Bar, active-state highlighting, and "No file open" landing page.
- Connected `ProjectExplorer.tsx` to the editor system: clicking a file node now reads its content and opens/activates a tab.
- Implemented unsaved changes indicator (blue dot) and tab content persistence in state.
- Fixed `package.json` by adding the `test: jest` script for CI/CD readiness.

### File List
- `src/types/editor.ts`
- `src/stores/editorStore.ts`
- `src/__tests__/editorStore.test.ts`
- `src/main.ts`
- `src/preload.ts`
- `src/types/electron.d.ts`
- `src/components/layout/EditorPane.tsx`
- `src/components/layout/ProjectExplorer.tsx`
- `package.json`

### Change Log
- 2026-04-02: Initial implementation of multi-tab editor system and IPC file reading.

### Review Findings

- [x] [Review][Patch] Raw error re-thrown from readFile — sanitized; `throw new Error(message)` now used. [main.ts:195-215]
- [x] [Review][Patch] `handleFileClick` not memoized — wrapped with `useCallback([openTab])`. [ProjectExplorer.tsx:153]
- [x] [Review][Patch] `setActiveTab` allows dangling ID — guard added via `tabs.some()` check. [editorStore.ts:51]
- [x] [Review][Patch] Unused lucide-react imports — removed `Plus`, `Search`, `ExternalLink`, `Edit2`, `Trash2`, `MoreVertical`, `TriangleAlert`. [ProjectExplorer.tsx:6]
- [x] [Review][Patch] No file size / binary type guard in readFile — added `BINARY_EXTENSIONS` blocklist and `MAX_FILE_SIZE_BYTES` (5 MB) guard. [main.ts:195]
- [x] [Review][Patch] Error banner not cleared on successful file open — `setError(null)` added to success path. [ProjectExplorer.tsx:153]
- [x] [Review][Defer] `Tab.type` is loosely typed as `string` — deferred, pre-existing. [editor.ts:5]
- [x] [Review][Defer] `textarea h-full` height inheritance — deferred, low risk for Electron. [EditorPane.tsx:64]
