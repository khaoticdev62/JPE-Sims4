# E2E Codebase Audit Findings — April 11, 2026

## Critical Issues Found

### ESLint Errors: ~100+ violations

**By Category:**

#### 1. Unused Variables/Imports (Most Common ~80%)
- Import statements define symbols never used
- Function parameters never referenced
- Destructured values not consumed
- State setters obtained but never called

**Hotspot Files:**
- `src/components/DashboardView.tsx` — 20+ unused Lucide icons
- `src/main.ts` — unused catch vars, empty blocks, unused assignments
- `src/components/jpe-error-handling.tsx` — catch vars `err`, `e` not prefixed with `_`
- Various components — unused imports from recent refactors

#### 2. React Hooks Rule Violation (1 instance)
- Line 52:17: `React.useMemo` called after early return
- Risk: Runtime crashes in production

#### 3. Code Quality Issues
- Unnecessary escape `\?` (no-useless-escape)
- Empty catch block (no-empty)
- `let` used where `const` suffices (prefer-const)

#### 4. Unused State/Setters
- Multiple components define `setXxx` but never call them
- Wizard open states declared but toggles unused
- Dialog open states managed but not wired

### Architecture Findings

**Service Layer (70+ classes):**
- ✅ Well-organized, clear separation of concerns
- ⚠️ `OllamaService.ts` — 1,073 lines (should be split)
- ⚠️ `CompilerService` — depends on 12+ other services
- ✅ AI services properly extend `BaseAIService`

**State Management (23 stores):**
- ⚠️ Store sprawl — related stores should merge
- ✅ Zustand patterns correct (immutable updates)
- ⚠️ Cross-store dependencies complex

**Testing Coverage:**
- ✅ Jest: ~50 tests passing
- ✅ Playwright: ~20 E2E tests
- ✅ Pytest: ~45 Python tests
- ❌ Missing tests for: OllamaService, ExportWizard, SearchService, ShortcutService, StblBatchService

### Security Audit
- ✅ TS4Rebels IPC hardened (22/22 tests)
- ✅ No exposed API keys
- ✅ Input sanitization implemented
- ✅ Credential protection via env vars
- ⚠️ Missing: rate limiting on IPC, process cleanup on exit

### Performance Concerns
- ⚠️ `ProjectValidator` loads files synchronously
- ⚠️ `StblBatchService` processes sequentially
- ⚠️ `SearchService` no result caching
- ⚠️ `LiveMonitor` potential file handle leak

### Python Engine
- ✅ Type hints throughout
- ✅ Docstrings present
- ⚠️ 6 TODOs in `sims4_file_support.py`
- ⚠️ No error recovery for malformed XML

### Rust Core
- ✅ 6 crates compiling
- ✅ Proper error handling (thiserror)
- ✅ Serialization (serde)
- ⚠️ Missing integration tests for round-trip

## Untracked Files (Should Be Committed or .gitignored)
- `src/services/main/ModelSetupService.ts`
- `src/services/main/OllamaManager.ts`
- `src/services/main/SecureStore.ts`
- `src/services/main/SecurityEngine.ts`
- `src/components/controller/GamepadRadialMenu.tsx`
- `src/components/layout/HandheldFocusOverlay.tsx`
- `src/hooks/useGamepadCoding.ts`
- `scratch/` (dev artifacts — should gitignore)
- `core/target/` (Rust build — should gitignore)
- `target/` (rust-analyzer — should gitignore)

## Modified But Uncommitted
- `_bmad-output/` (planning artifacts)
- `electron-builder.yml`
- `package-lock.json`
- `src/components/SettingsView.tsx`
- `src/components/jpe-settings-context.tsx`
- `src/components/layout/EditorLayout.tsx`
- `src/main.ts`
- `src/preload.ts`
- `src/services/SensoryService.ts`
- `src/services/ai/OllamaService.ts`
- `src/services/api/CredentialManager.ts`
- `src/services/input/GamepadService.ts`
- `src/services/input/types.ts`
- `src/stores/useUIStore.ts`