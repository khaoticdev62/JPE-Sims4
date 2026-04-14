# Story 14.1: Electron Consolidation & Mock Removal (with Ollama Bundling)

**Status:** In Progress
**Epic:** 14 - Industrial Release & Packaging
**Assignee:** Amelia (Dev) / Barry (Quick Flow)

## Goal
Transition JPE Studio from a development-centric web server architecture to a high-performance, fully bundled native Electron application ("Gold" status). This includes removing all hardcoded mocks, implementing a sustainable "Mock Mode" for testing, and embedding external dependencies like Ollama directly into the application installer.

## User Persona
As a **Power Modder**,
I want to run JPE Studio as a standalone native application with all its AI capabilities included,
so that I can work offline without managing external servers or seeing development placeholders.

## Technical Requirements

### 1. Mock Extraction & Flagging
- **Global Mock Toggle**: Implement a `NEXT_PUBLIC_USE_MOCK` boolean in `.env.production` (set to `false`) and `.env.development` (set to `true`).
- **Conditional Loading**: Wrap all remaining mock data constants in a conditional check that defaults to live services in production.
- **Affected Files**:
  - `src/services/TuningSearchService.ts`: Replace `EA_TUNING_MOCK` with real tuning index queries.
  - `src/components/ConflictResolutionWizard.tsx`: Replace `MOCK_CONFLICTS` with results from `ModValidationService`.
  - `src/components/DiagnosticNexusView.tsx`: Replace timeline mocks with real project history.

### 2. Electron Production Hardening
- **Build Optimization**: Transition from `next dev` (live server) to `next build` + `next export` (or efficient custom serving) within the Electron environment.
- **Service Bridge**: Ensure all `IPC` handlers in `main.ts` are hardened for production (zero `require` usage at runtime, explicit imports).
- **Resource Management**: Configure `electron-builder.yml` to bundle all assets from `public/` and `_bmad-output/` required for the "Gold" release.

### 3. Ollama Dependency Bundling
- **Binary Embedding**: Place OS-specific Ollama binaries into the Electron `resources` folder.
- **Lifecycle Management**:
  - **Launch**: The Electron `main` process must detect if Ollama is running; if not, it should launch the embedded binary in a hidden background process.
  - **Shutdown**: Ensure the Ollama process terminates cleanly when JPE Studio is closed.
- **Internal API**: Configure `BaseAIService` to point to `localhost:11434` (Ollama's default) by default, relative to the spawned process.

## Tasks/Subtasks

### 1. Mock Extraction & Flagging
- [ ] Implement `NEXT_PUBLIC_USE_MOCK` in `.env.production` and `.env.development`.
- [ ] Replace `EA_TUNING_MOCK` in `src/services/TuningSearchService.ts` with real queries.
- [ ] Replace `MOCK_CONFLICTS` in `src/components/ConflictResolutionWizard.tsx` with `ModValidationService` results.
- [ ] Replace timeline mocks in `src/components/DiagnosticNexusView.tsx` with real project history.

### 2. Electron Production Hardening
- [ ] Verify `next build` + `next export` compatibility.
- [ ] Harden IPC handlers in `src/main/main.ts` for production security.
- [ ] Update `electron-builder.yml` to bundle required assets.

### 3. Ollama Dependency Bundling
- [ ] Implement binary embedding in `resources/`.
- [ ] Add Ollama lifecycle management (Launch/Shutdown) to `main.ts`.
- [ ] Point `BaseAIService` to the local Ollama instance.

## Dev Agent Record (Amelia)

### Implementation Plan
- **Primary Goal**: Transition to "Gold" status by removing mocks and bundling Ollama.
- **Approach**: We will use a feature flag for mocks to allow for future testing while ensuring production is "clean". Ollama will be managed as a sidecar process.

### Debug Log
- [2026-04-14] Starting story implementation. Initializing task list.

### Completion Notes
- (Pending)

## Acceptance Criteria

### Given a "Gold" distribution build
- [ ] No hardcoded mock data is visible in the UI by default.
- [ ] The application launches as a standalone `.exe` or `.app` without requiring `npm run dev`.
- [ ] Ollama initializes automatically in the background on first launch without user intervention.
- [ ] Setting `USE_MOCK=true` correctly restores development placeholders for testing.

### Performance
- [ ] Cold start time (App Open -> Dashboard) is under 3 seconds.
- [ ] Ollama background process consumes < 1% CPU when idle.

## Verification Plan

### Automated
- `npm run electron:dist`: Must complete without errors and produce a valid installer.
- `npm run test:e2e`: All tests must pass against the production bundle.

### Manual
- Launch the packaged app on a machine without Node.js or Ollama installed.
- Verify AI features (Copilot/Translation) function immediately.
