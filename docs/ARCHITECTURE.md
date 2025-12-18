# Architecture

## Goals

- Deterministic, testable core engine (`jpe_sims4/`) with no UI dependencies.
- UI orchestration only (`jpe_studio/`): it calls the engine, but never parses/modifies file formats directly.
- Stable entrypoints: root `cli.py` and `studio.py` remain thin wrappers for packaging/scripts.

## Layers

### Core (`jpe_sims4/`)

- **Scan & IO:** `jpe_sims4/scanner.py`, `jpe_sims4/storage.py`, `jpe_sims4/build.py`
- **Formats:** extraction in `jpe_sims4/extractors.py`, applying in `jpe_sims4/apply.py`
- **Pipeline:** `jpe_sims4/workflow.py` coordinates scan → extract → merge
- **Language aids:** `jpe_sims4/tm/`, `jpe_sims4/glossary/`
- **QA:** `jpe_sims4/validate/` (placeholder and rule-based validation)
- **Reporting:** `jpe_sims4/reporting/`

Core modules should expose pure functions and data-in/data-out APIs (dicts/dataclasses), enabling unit tests in `tests/`.

### UI (`jpe_studio/`)

- `jpe_studio/app.py` contains the Tk UI. It reads/writes `Project` via `jpe_sims4/storage.py` and uses pipeline helpers.
- UI-specific logic should live in view-model-like helpers (prefer pure functions), not in the core.

## Storage

- Project file is JSON (`Project.to_dict()` / `load_project()`).
- Translation Memory is currently derived from translated segments; a future milestone may add a SQLite-backed TM store.

