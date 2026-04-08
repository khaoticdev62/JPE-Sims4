# Story 1.2: Project Explorer & File System Integration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Modder,
I want to browse my project files in a collapsible tree view,
So that I can easily find and open the mod files I'm working on.

## Acceptance Criteria

1. **Given** a selected local project folder, **When** the Project Explorer is active, **Then** I see a nested tree of all supported files (`.xml`, `.stbl`, `.jpe`).
2. **Given** the file tree, **When** I click on a folder, **Then** it expands/collapses to reveal/hide its children.
3. **Given** the file tree, **When** I view a file, **Then** the icon represents its type (JPE for logic, XML for results, STBL for strings).
4. **Given** the Project Explorer, **When** the user resizes the sidebar (Story 1.1), **Then** the tree view adapts cleanly without content truncation or layout breaks.
5. **Given** any directory change, **Then** the tree view updates efficiently using virtualization (supporting 1000+ files).
6. **Given** a file in the tree, **When** I right-click it, **Then** a context menu appears with options: "Rename", "Delete", "Reveal in Explorer".

## Tasks / Subtasks

- [x] Task 1: Initialize Project State & Store
  - [x] Create `src/types/project.ts` for file/folder tree abstractions.
  - [x] Create `src/stores/projectStore.ts` using Zustand to manage current project path and file tree.
- [x] Task 2: Implement Filesystem Scanning (IPC Layer)
  - [x] Update `main.ts` to include IPC handlers for `project:open` (using `dialog.showOpenDialog`) and recursive directory scanning.
  - [x] Update `preload.ts` to expose these functions to the renderer.
- [x] Task 3: Build the Project Explorer Component
  - [x] Install and integrate `react-arborist` for the core tree view logic.
  - [x] Create `src/components/layout/ProjectExplorer.tsx` utilizing `useProjectStore`.
  - [x] Integrate `ProjectExplorer` into `src/components/layout/Sidebar.tsx`.
- [x] Task 4: UI Polishing & Aesthetics
  - [x] Use `lucide-react` icons and Tailwind for consistent "Apple TV" theme.
  - [x] Implement hover states and smooth transition ease-in/out for collapse/expand.

### Review Findings

**Decision-Needed:**

- [x] [Review][Decision] Fixed `height={500}` breaks AC4 — **Resolved via A:** ResizeObserver measures container height dynamically; `treeHeight` state passed to `<Tree>`. [`ProjectExplorer.tsx:94`]
- [x] [Review][Decision] AC6 not implemented — **Resolved via A:** Full right-click context menu (Rename, Delete, Reveal) implemented with IPC handlers. [`ProjectExplorer.tsx:35`]

**Patch:**

- [x] [Review][Patch] Symlink loop causes infinite recursion in `buildFileTree` — skip symlinks via `entry.isSymbolicLink()` check. [`main.ts:72`]
- [x] [Review][Patch] `buildFileTree` return type is `Promise<any[]>` — now typed as `Promise<ProjectFile[]>` with `FileType` import. [`main.ts:73`]
- [x] [Review][Patch] `(window as any).ipc` bypasses `electron.d.ts` Window augmentation — removed cast; `src/types/**` added to `tsconfig.json` includes. [`ProjectExplorer.tsx:61`]
- [x] [Review][Patch] `loadProject` does not atomically clear stale `files` — now includes `files: []` in the same `set()` call. [`projectStore.ts:17`]
- [x] [Review][Patch] Dangling `file:open` IPC exposure — removed from `preload.ts`. [`preload.ts:12`]
- [x] [Review][Patch] Single unreadable subdirectory rejects entire `project:open` call — per-entry try/catch in `buildFileTree`; unreadable dirs logged and skipped. [`main.ts:133`]
- [x] [Review][Patch] No user-facing error feedback on `handleOpenProject` failure — error banner component added to `ProjectExplorer`. [`ProjectExplorer.tsx:66`]

**Deferred (pre-existing / out-of-scope):**

- [x] [Review][Defer] `updateFile` silent no-op for unknown `fileId` — no error thrown when ID not found. Deferred; not a regression from this story. [`projectStore.ts:32`] — deferred, pre-existing
- [x] [Review][Defer] Full tree loaded into memory upfront for 1000+ files — AC5 is partially satisfied (rendering is virtualized), but the IPC payload itself is not chunked/lazy-loaded. Deferred to a performance story. [`main.ts:72`] — deferred, pre-existing

## Dev Notes

**Anti-Pattern Prevention:**
- 🚫 **DO NOT** use a standard recursive DOM mapping for large projects. Use `react-arborist` (virtualized) to prevent performance lag.
- 🚫 **DO NOT** block the UI thread with synchronous filesystem reads. Use `fs.promises` and IPC async handlers.
- 🚫 **DO NOT** hardcode icons; use a central lookup or utility based on file extensions.

**Architecture Constraints:**
- **Store First**: All tree state (expansion, selection) should ideally live in the store or `react-arborist`'s internal controller bridged with Zustand.
- **Security**: Filesystem absolute paths must be handled carefully. The UI should mostly work with project-relative paths.

### Project Structure Notes

- **New Files:**
  - `src/stores/projectStore.ts`
  - `src/types/project.ts`
  - `src/components/layout/ProjectExplorer.tsx`
  - `src/services/projectService.ts`

### References

- [Source: docs/ARCHITECTURE_DESIGN_PRD01_03.md#2.1 Module Structure]
- [Source: docs/JPE_STUDIO_EDITOR_FRONTEND_SPEC.md#3.2.1 Project Explorer]
- [Source: docs/ARCHITECTURE_DESIGN_PRD01_03.md#3.1 Read Mod File Flow]

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash (Performance)

### Debug Log References

### Completion Notes List
- Successfully integrated react-arborist for virtualized, high-performance file tree rendering for Mod projects with potentially thousands of items.
- Implemented node.js/fs tree builder within main.ts IPC process to maintain backend separation and security.
- Defined Electron IPC typed interface ensuring strict type safety for backend bridging.
- Zustand store handles ProjectState cleanly.
- Updated jest layout tests to reflect removal of sidebar placeholder content.

### File List
- `src/types/project.ts`
- `src/types/electron.d.ts`
- `src/stores/projectStore.ts`
- `src/components/layout/ProjectExplorer.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/main.ts`
- `src/preload.ts`
- `src/__tests__/projectStore.test.ts`
- `src/__tests__/layout.test.tsx`
