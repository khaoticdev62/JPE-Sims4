# Story 7.4: Industrial Project Export & Validation

**As a** Sims 4 Modder,  
**I want** granular feedback during the project export process and automated verification of the final package,  
**So that** I can ensure my mods are built correctly and ready for production without manual binary inspection.

## Acceptance Criteria

1. **Given** a JPE Studio project with multiple resource types (JPE, STBL, XML)
2. **When** the "Export Full Project" action is triggered
3. **Then** a dedicated "Project Export" dialog is displayed with a real-time progress bar
4. **And** the dialog shows live-scrolling logs from the `JpeBundlerService`
5. **And** the `JpeBundlerService` correctly transpiles all JPE files and packs them into a DBPF v2.1 binary
6. **And** the system provides a comprehensive automated test suite to verify export integrity.

## Status: done

## Tasks / Subtasks

- [x] **Task 1: Build Orchestration Hardening (AC: 2, 3, 5)**
  - [x] Add `onProgress` callback support to `JpeBundlerService.buildProject`
  - [x] Implement granular build stages (TRANSPILLING, PACKING_STBL, FINALIZING_DBPF)
  - [x] Add detailed telemetry logging during the build process
- [x] **Task 2: Industrial Progress UI (AC: 3, 4)**
  - [x] Create `src/components/modals/ProjectExportDialog.tsx`
  - [x] Implement live log terminal view within the dialog
  - [x] Bind progress bar state to `JpeBundlerService` callbacks
- [x] **Task 3: Export Menu Integration (AC: 2)**
  - [x] Update `ExportMenu.tsx` to trigger the new dialog
  - [x] Remove legacy `toast.loading` logic for full project exports
- [x] **Task 4: Automated Verification Suite (AC: 6)**
  - [x] Implement `src/services/__tests__/JpeBundlerService.test.ts`
  - [x] Verify DBPF v2.1 binary integrity after export
  - [x] Verify correct locale-to-instance mapping for STBLs

## Dev Notes

- **Design System**: Use Spectral design tokens (glassmorphism, `T.cyanBright`, `T.bgPanel`).
- **Progress Logic**: Steps should be weighted by the number of files being processed.
- **Verification**: Use `PackageParser` in tests to re-read the generated buffer and assert contents.

## Dev Agent Record

### Agent Model Used
Antigravity (Omni)

### Debug Log
- Story 7.4 Initialized.
- Mapped implementation plan to BMAD tasks.
- Task 1: Implemented BuildProgress and onProgress in JpeBundlerService.
- Task 2: Created ProjectExportDialog with Spectral theme and progress bar.
- Task 3: Integrated ExportMenu with the new dialog and removed inline build logic.
- Task 4: Created and verified Jest test suite for JpeBundlerService.

### Completion Notes
- **All tests passing 100%**.
- Industrial export pipeline is now the standard for project packaging.

## File List
- src/services/JpeBundlerService.ts
- src/components/modals/ProjectExportDialog.tsx
- src/components/editor/ExportMenu.tsx
- src/services/__tests__/JpeBundlerService.test.ts

## Change Log
- 2026-04-11: Story 7.4 completed and verified.
