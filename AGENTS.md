# Repository Guidelines

## Project Structure & Module Organization
Core translation code sits in `engine/`, with supporting services in `cloud/`, `diagnostics/`, `plugins/`, and `security/`. UI pipelines live in `cli.py`, `studio.py`, `studio_app.py`, plus assets inside `ui/` and `templates/`. Configuration resides in `config/`, automation scripts in `asset_generator/` and `installer/`, and generated artifacts should stay inside `build/`, `generated_assets/`, or `screenshots/`. Place unit tests in `tests/`; scenario runners such as `FINAL_INTEGRATION_TEST.py` remain at the repository root.

## Build, Test, and Development Commands
- `python -m venv .venv && .venv\Scripts\activate` - create the Python 3.11 environment.
- `pip install -e ".[dev]"` - install runtime code plus pytest and coverage extras.
- `python build.py` - run import smoke checks, execute tests, and install the editable package.
- `python run_tests.py` or `python -m pytest tests/ --cov=jpe_sims4 -k parsers` - run full or targeted suites; adjust the filter per module.
- `jpe-sims4 build . --build-id demo_001` / `jpe-studio` - verify CLI builds and the desktop studio locally.

## Coding Style & Naming Conventions
Follow PEP 8 with 4 space indentation, roughly 100 character lines, and short module docstrings. Group imports (standard library, third party, local), order modules as constants, classes, helpers, and end with the usual `if __name__ == "__main__":` guard when needed. Use PascalCase classes, snake_case functions, UPPER_SNAKE_CASE constants, and pair type hints plus Google style docstrings with dependency injection so parsers and generators stay testable.

## Testing Guidelines
Maintain at least 80 percent coverage overall and treat engine parsers, generators, and validators as 100 percent targets. Keep new suites in `tests/` using `test_<topic>.py` naming and record reproduction commands such as `python -m pytest tests/test_ir.py::test_interaction_creation -v` inside pull requests.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat(engine):`, `docs:`), keep subjects under 50 characters, wrap bodies at 72, and cite issues with `Fixes #123`. Before each pull request, run `python build.py`, the focused pytest commands relevant to your change, and update README, docs, or the changelog when user facing behavior moves. PR descriptions should outline scope, list tests, link issues, and include screenshots or CLI transcripts for UI or Studio updates.

## Security & Configuration Tips
Do not store secrets in git; load them via environment variables consumed by helpers in `security/` and `cloud/`. Use the provided path validation utilities before touching user directories, keep installers and screenshots inside `build/` or `installer/`, and rerun diagnostics scripts whenever security sensitive code changes.
