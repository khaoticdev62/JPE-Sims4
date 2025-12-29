# TS4Rebels Real-World Samples (Local Only)

Place **real TS4Rebels files** here for local E2E testing and token/placeholder discovery.

This folder is ignored by Git (only this README is tracked).

## What to collect (goal: 35 files)

- Mix of **small/large** and **edge-cases** (non-ASCII, long descriptions, heavy BBCode, lots of links).
- Prefer text formats the plugin supports:
  - `*.json` (manifests / metadata)
  - `*.csv` (metadata exports / translation packs)

## Suggested layout

- `tests/fixtures/ts4rebels_real/manifests/*.json`
- `tests/fixtures/ts4rebels_real/meta/*.csv`
- `tests/fixtures/ts4rebels_real/packs/*.csv`

## Next step (after you add files)

Run:

`python -m pytest -q`

Then we can add a deterministic fixture subset under `tests/fixtures/ts4rebels/` once you approve which files are safe to commit.

