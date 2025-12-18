# JPE Sims 4 Mod Translator (M9)

This repository contains the packaging and early scaffolding for the JPE Sims 4 mod translation toolchain.

## Quick Start (Local)

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
```

## CLI

- Scan a mod folder or zip and print JSON:
  - `jpe-sims4 scan .\SomeModFolder --json`
  - `jpe-sims4 scan .\mod.zip --write project.jpe.json`
- Extract translation segments (XML/JSON/INI/CFG/JPE-quoted strings):
  - `jpe-sims4 extract .\SomeModFolder --write project.jpe.json`
- Build an output folder/zip from a translated project JSON:
  - `jpe-sims4 build .\project.jpe.json --out-dir .\.build\MyMod`
  - `jpe-sims4 build .\project.jpe.json --out-zip .\.build\MyMod.zip --report .\.build\build_report.md`
- Export a diagnostics report:
  - `jpe-sims4 report .\project.jpe.json --write .\report.md`
- Export/import segments as CSV (for external translation workflows):
  - `jpe-sims4 export-csv .\project.jpe.json --out .\segments.csv`
  - `jpe-sims4 import-csv .\project.jpe.json --csv .\segments.csv --in-place`

## Studio (Desktop)

- Launch the desktop shell:
  - `jpe-studio`

M4 adds translator workflow features: segment status (`new/in_progress/reviewed`), search/filter + progress in the Editor, and CSV import/export.

M5 adds bulk productivity actions (apply best TM, propagate identical source translations) and quick find/replace for scoped edits.

M6 adds a plugin system for extensibility (custom extractors/appliers/validators) with a `Plugins` tab in Studio and `jpe-sims4 plugins` in the CLI.

M7 adds filesystem-backed sync (simulated cloud): configure a shared sync root and use push/pull/status from Studio Settings or `jpe-sims4 sync`.

M8 adds predictive editing assistance: local TM-based predictions that update while you type in Studio, plus `jpe-sims4 predict` for segment-level suggestions.

M9 improves sync with conflict detection (local/remote ahead) and a deterministic merge workflow (CLI: `jpe-sims4 sync ... merge`, Studio: Settings → Sync → Merge).
