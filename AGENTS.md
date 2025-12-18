# Repository Guidelines

## Project Structure & Module Organization

- `pyproject.toml`: Python packaging config (Python `>=3.11`) and CLI entry points.
- Repository root currently contains product/spec PDFs and a few `.txt` notes; prefer placing new long-form docs under `docs/` going forward (e.g., `docs/prd/`, `docs/sop/`).
- Source code is expected to be importable from the repo root (see `[tool.setuptools.packages.find] where = ["."]`). Keep Python modules/packages in a dedicated folder such as `jpe_sims4/` and keep CLI entry points in `cli.py` and `studio.py` to match `[project.scripts]`.
- Tests should live in `tests/` (new folder) and mirror package layout.

## Build, Test, and Development Commands

- Create a venv: `python -m venv .venv` then activate it (`.venv\\Scripts\\Activate.ps1` on Windows).
- Install editable + dev deps: `python -m pip install -e ".[dev]"` (installs `pytest`, `pytest-cov`).
- Run CLI entry points (after install): `jpe-sims4 --help` and `jpe-studio --help`.
- Run tests: `pytest` (or `pytest -q`).
- Coverage (if used): `pytest --cov --cov-report=term-missing`.

## Coding Style & Naming Conventions

- Python: 4-space indentation, PEP 8 naming (`snake_case` functions, `PascalCase` classes), and type hints for public APIs.
- Prefer small, testable modules; keep UI code (Tk/`ttkbootstrap`) separated from core translation/IO logic.
- No formatter/linter is configured in this snapshot; avoid reformat-only diffs and keep changes consistent with surrounding code.

## Testing Guidelines

- Framework: `pytest` (declared in `.[dev]`).
- Naming: `tests/test_*.py`; prefer unit tests for pure functions and minimal integration tests for file/zip IO.

## Commit & Pull Request Guidelines

- No Git history is present in this workspace snapshot; use a simple Conventional Commits style: `feat: …`, `fix: …`, `docs: …`, `refactor: …`, `test: …`, `chore: …`.
- PRs: describe scope, list how to run tests, link issues/PRDs where applicable, and include screenshots/GIFs for UI changes.

## Security & Configuration Tips

- Do not commit secrets or credentials; use environment variables and keep `.env` local (already ignored by `.gitignore`).
- For network/file operations, set timeouts and validate paths/archives before processing.
