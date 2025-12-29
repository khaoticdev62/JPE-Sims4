# Release Packaging

## v1 Scope (Frozen)

v1 ships the end-to-end **local translator workflow** with a Windows-first packaged app:

- Core engine: scan/import (folder/zip) → extract segments (xml/json/ini/cfg/jpe-quoted) → validate → build/export (folder/zip) without overwriting source inputs.
- Studio: import wizard, workspace editor (search/filter/status + next/prev/next-untranslated), QA view for diagnostics, build/export UI.
- Plugins: load `plugins/` and expose plugin diagnostics (baseline extensibility).
- TS4Rebels: **offline vault** workflows + optional **explicitly gated** downloads from allowlisted hosts (default allowlist starts with `ts4rebels.cc`).

Anything outside this list is v2+ unless explicitly tracked in `docs/MILESTONES.md`.

## Release Gates (v1 “Done”)

All gates must be satisfied for a tagged build:

- Tests green: `python -m pytest -q` (no skips added to “make it pass”).
- No data-loss paths:
  - Zip safety prevents traversal/bombs and never writes outside the chosen output folder.
  - Build/export never overwrites the source input; unsafe output paths are refused with diagnostics.
  - Project save/re-extract preserves user edits when segment IDs are unchanged.
- Reproducible Windows build:
  - A clean venv can build both artifacts using `scripts/build_windows.ps1`.
  - Artifacts launch and pass the “First-run Smoke Checklist” below.
- Docs complete:
  - `docs/ARCHITECTURE.md`, `docs/QUALITY.md`, `docs/SECURITY.md`, and this file are current.
  - “First-run Smoke Checklist” is executed once per release candidate.

## Scope

- Core library: `jpe_sims4/` must remain UI-free and fully testable.
- Desktop app: `jpe_studio/` + `studio.py` (Tk/ttkbootstrap).
- CLI: `cli.py` (automation-friendly JSON reports and exit codes).

## Pre-flight Checklist

- Run tests: `python -m pytest -q`
- Smoke run:
  - CLI: `python cli.py --help`
  - Studio: `python studio.py --help` then launch and open a small fixture project.
- Packaging dry run (if building installers): run `scripts/build_windows.ps1` in a clean build venv.

## First-run Smoke Checklist (Packaged App)

Use a small mod zip with at least one supported text file (e.g., `xml`/`json`/`ini`).

- Launch `JPE-Studio.exe` (no console window, app opens).
- Home → Import Wizard → select zip → verify warnings show if archive is unsafe.
- Import/Extract → open Workspace → search/filter works and segment navigation shortcuts work (`F6`, `F7`).
- Edit one segment target → confirm status becomes `in_progress`, then mark reviewed.
- QA tab → confirm issues list renders; “Fix Next” jumps to the right segment when issues exist.
- Build/Export → build to a new output folder and to a new output zip:
  - Output contains `manifest.jpe.json` and `diff_report.md`.
  - Translated targets are applied for non-empty targets.
- Re-open the saved `project.jpe.json` and confirm targets/statuses persist.
- Review diagnostics stability: no new `FATAL`/`ERROR` on known-good fixtures.

## Versioning

- Update the version string in `jpe_sims4/project.py` only when the on-disk `project.jpe.json` schema changes.
- If packaging metadata exists, align package/app versions with the milestone tag (e.g., `m9` → `0.9.x`).

## Artifacts (recommended)

- `project.jpe.json` example in `docs/` or `tests/fixtures/` (small, non-copyrighted).
- Build outputs include `manifest.jpe.json` and `diff_report.md` for traceability.
- Packaged builds write `dist/build_info.txt` (Python/pip versions + `pip freeze`) to help reproduce issues.

## Windows Packaging (planned)

This repo includes a PyInstaller-based packaging path (Windows-first).

### Build (PyInstaller)

1) Create/activate a clean build venv and install deps (example):

- `python -m venv .venv-build`
- `.venv-build\\Scripts\\Activate.ps1`
- `python -m pip install -e ".[dev]"`
- `python -m pip install pyinstaller`

2) Build:

- `powershell -ExecutionPolicy Bypass -File scripts/build_windows.ps1`

3) Outputs:

- `dist/JPE-Studio/JPE-Studio.exe`
- `dist/jpe-sims4/jpe-sims4.exe`
