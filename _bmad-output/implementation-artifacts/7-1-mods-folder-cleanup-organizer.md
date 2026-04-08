# Story 7.1: Mods Folder Cleanup & Organizer Utility

## Overview
**Story ID**: 7.1
**Epic**: Epic 7: Mod Management & Workspace Utilities
**Status**: done

As a Modder,
I want a professional tool to deduplicate and organize my Sims 4 Mods folder,
So that I can maintain a clean, high-performance mod environment.

## Acceptance Criteria
- [x] **Given** a set path to the local "Mods" directory.
- [x] **When** the "Cleanup Scan" is executed.
- [x] **Then** the utility identifies duplicate files using MD5 hashing and Instance ID comparison.
- [x] **And** it provides a categorized report of "Duplicates," "Broken Links," and "Orphaned Files."
- [x] **And** I can perform a "Safe Move" to relocate identified files to a backup directory.

## Developer Context
### Goals
- Implement a scanning engine for the Mods folder.
- Provide a clear, actionable report UI.
- Ensure file system safety during cleanup (never delete, only move).

### Technical Requirements
- **Service**: Create `ModCleanupService.ts` for file system traversal and checksum calculation.
- **Deduplication Logic**:
  - Phase 1: **MD5 Hashing** for identical file detection.
  - Phase 2: **Resource Instance Sampling** (if .package) to detect different files with the same Mod IDs.
- **Action**: Use `fs-extra.move` to relocate files to a `_JPE_Backup` subfolder.

### Dependencies
- Story 4.3 (Mod Folder Indexing) - Leverage existing indexing logic for initial scanning.

## Technical Guardrails
- **Performance**: Use a background worker (re-using `WorkerPool`) for hashing large folders to keep UI at 60fps.
- **Safety**: Always create a JSON log of all moves for potential undo/restore.

## Testing Requirements
- Unit tests for MD5 hashing and Instance collision detection.
- Mock FS integration tests for the "Safe Move" operation.

### Review Findings
- [ ] [Review][Patch] MD5 Hash Performance [ModCleanupService.ts:112]
- [ ] [Review][Patch] Safe Move missing "undo" logic [ModCleanupService.ts:150]
