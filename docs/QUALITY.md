# Testing & Quality Gates

## Test suites

- Fast unit suite: `python -m pytest -q`
- End-to-end (zip import → extract → build): included in `tests/test_e2e_zip_import_extract_build.py`
- UI smoke (best-effort): included in `tests/test_ui_smoke.py` and automatically skips when Tk is unavailable/headless.

## Coverage targets (core)

Initial goal: keep **core engine** (`jpe_sims4/`) at **70–85%** line coverage, increasing as features stabilize.

Run locally:

- `python -m pytest -q --cov=jpe_sims4 --cov-report=term-missing`
- Suggested gate (start): `python -m pytest -q --cov=jpe_sims4 --cov-fail-under=70`

Notes:
- Keep UI coverage optional; prioritize deterministic core logic.
- Prefer adding tests alongside bugs/fixes (regression-first).

## Static typing (optional later)

- Current code uses type hints in key places; a future gate can add `pyright` or `mypy`.
- Recommendation: start with `jpe_sims4/` only, then expand once APIs settle.

