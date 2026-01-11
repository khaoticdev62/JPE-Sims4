# Delivery Milestones

This repo is already shipping beyond “M0” in several areas; use this file as a release-oriented checklist to keep scope tight and measurable.

## M0 (Week 1) — Scaffolding + Import/Scan + Minimal CLI

**Goal:** a developer can install, scan a mod folder/zip, and produce a project JSON.

- Repo layout exists: `jpe_sims4/` (core), `jpe_studio/` (UI), `cli.py`, `studio.py`, `tests/`, `docs/`.
- Core import/scan works for folder/zip and emits diagnostics (including zip safety).
- Minimal CLI works end-to-end:
  - `python cli.py scan <path>`
  - `python cli.py extract <path> --out project.jpe.json`
- Definition of done: `python -m pytest -q` passes.

## M3 (Weeks 7–8) — QA + Build/Export + Reports

**Goal:** translators can fix issues quickly and export safely.

- ✅ **Phase 7: Code Diff Preview** (Implemented Dec 30, 2025)
  - Side-by-side diff viewer for code comparison.
  - High-fidelity preview modal for AI-suggested changes.
  - AI-powered "Fix with AI" integration in Diagnostics Panel.
  - One-click apply workflow with diff verification.
- QA dashboard: view/filter diagnostics by severity; “Fix Next” navigation to the next actionable segment.
- Validation: placeholder parity and extendable rules; blank targets don’t error.
- Build/Export: writes to user-selected output folder/zip; never overwrites source; records `build_history[]`.
- Reports: JSON outputs from CLI (`report --json`), plus build `manifest.jpe.json` and `diff_report.md`.
- Definition of done: e2e fixture tests cover `import → extract → build (folder+zip)` and pass.

## M4 (Weeks 9–10) – Polish + Accessibility + Performance + Docs + Release Packaging

**Goal:** “ship-ready” UX with clear docs and repeatable release steps.

- v1 definition of done: see `docs/RELEASE.md` (“Release Gates (v1 “Done”)”).
- Accessibility pass: focus indicators, font scaling, contrast-checked severity/status colors.
- Performance: debounce search, chunked/virtual list rendering, background indexing/build with progress.
- Docs: keep `docs/ARCHITECTURE.md`, `docs/QUALITY.md`, `docs/SECURITY.md` current; add release checklist.
- Release packaging (Windows-first): document build artifacts, versioning, and smoke-test steps (see `docs/RELEASE.md`).
