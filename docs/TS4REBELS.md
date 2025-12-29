# TS4Rebels Integration

## Overview

TS4Rebels support is implemented as:

- A plugin (`plugins/ts4rebels.py`) for extracting/applying segments from TS4Rebels-style `*.json`/`*.csv` metadata.
- A network client (`jpe_sims4/ts4rebels/`) for **optional** in-app browsing and downloading (Studio/CLI).

The integration is **offline-first**: network operations are disabled unless explicitly enabled.

## Authentication (recommended)

`ts4rebels.cc` is a phpBB site. The practical auth mechanism is a **cookie-based session** obtained by submitting the phpBB login form (`ucp.php?mode=login`).

Storage guidance:

- Store **session cookies only** in the OS credential store via `keyring` (no passwords).
- Keep only a `keyring_id` reference inside `project.jpe.json` under `remote_sources`.

## Network Safety Model

- Network must be explicitly enabled:
  - Studio: TS4Rebels tab → “Enable network” = `on`
  - CLI: `jpe-sims4 ts4rebels --enable-network ...`
- Hosts are allowlisted:
  - `--allowed-hosts` controls the base URL host
  - `--allowed-download-hosts` controls download link hosts
- HTTPS is required by default; `--allow-insecure-http` exists for localhost tests only.

## Download + Import

The “download/import” flow:

1) Fetch topic links (Browse tab / CLI `ts4rebels topic`)
2) Select a `.zip` link
3) Download → verify allowlist/TLS → safe extract (zip-slip blocked) → open as project

CLI example:

`jpe-sims4 ts4rebels --enable-network --allowed-hosts ts4rebels.cc --allowed-download-hosts ts4rebels.cc download-import <url>`

## Tokens & Validation Rules

Base validation applies placeholder parity (`E_PLACEHOLDER_MISMATCH`). TS4Rebels adds:

- BBCode tag parity
- `:emoji:` token parity

To apply a default token-rules preset into the project:

`jpe-sims4 ts4rebels preset-validation --project project.jpe.json --in-place`

## Real-World Sample Corpus (local only)

Put real sample files under `tests/fixtures/ts4rebels_real/` (ignored by Git) and run:

`python scripts/ts4rebels_analyze_samples.py tests/fixtures/ts4rebels_real`

If you already downloaded/imported mods via Studio/CLI, you can harvest likely TS4Rebels `*.json`/`*.csv` files into the sample folder:

`jpe-sims4 ts4rebels harvest-samples --from ~/.jpe_studio/ts4rebels/imports --to tests/fixtures/ts4rebels_real --max-files 35`

Then analyze:

`jpe-sims4 ts4rebels analyze-samples tests/fixtures/ts4rebels_real`
