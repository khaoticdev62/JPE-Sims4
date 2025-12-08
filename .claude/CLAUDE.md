# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**JPE Sims 4 Mod Translator** enables developers to create The Sims 4 mods using simple, English-like syntax (JPE - "Just Plain English") instead of complex XML. The project is production-ready with all 8 phases completed.

**Key Capabilities:**
- Multi-format support: JPE → JPE-XML → Sims 4 XML
- Desktop Studio GUI with 10 hyper-themed UI options
- Native iOS app and cross-platform React Native mobile app
- Cloud synchronization with encrypted storage
- Extensible plugin architecture
- Comprehensive error diagnostics with color-coded severity
- Interactive onboarding system (The Codex)

## Technology Stack

- **Core Language:** Python 3.11+ (requires 3.8 minimum)
- **Desktop GUI:** Tkinter/ttk (native framework)
- **Mobile:** Swift/SwiftUI (iOS), React Native + TypeScript (cross-platform)
- **Build System:** setuptools, wheel
- **Testing:** pytest, pytest-cov
- **Key Dependencies:** requests (HTTP), cryptography (encryption), psutil (monitoring)

## Critical Architecture

### Translation Pipeline
```
JPE Files (.jpe) → JPE Parser → Intermediate Representation (IR)
→ Validator → XML Generator → Sims 4 XML Output
```

The IR (defined in `engine/ir.py`) is the central data model representing Sims 4 concepts:
- `Interaction`, `Buff`, `Trait`, `EnumDefinition`, `TestSet`, `LootAction`
- `LocalizedString`, `ProjectMetadata`, `ProjectIR`

All components serialize/deserialize through IR.

### Module Responsibilities

| Module | Purpose | Key Files |
|--------|---------|-----------|
| `engine/` | Core translation orchestration | `engine.py`, `ir.py`, `parsers/*`, `generators/*`, `validation/*` |
| `diagnostics/` | Error reporting and severity coloring | `errors.py`, `reports.py`, `error_system.py` (32KB comprehensive) |
| `ui/` | Desktop theming and component system | `theme_manager.py` (10 themes), `ui_enhancements.py` |
| `onboarding/` | Interactive tutorials (The Codex) | `the_codex.py` (66KB), `the_codex_gui.py` (73KB), `teaching_system.py` |
| `plugins/` | Runtime extensibility for parsers/generators | `manager.py`, `registry.py`, `base.py` |
| `config/` | Encrypted settings and secrets | `config_manager.py` |
| `security/` | Path/input validation, sanitization | `validator.py` |
| `performance/` | Async operations, monitoring | `monitor.py` |
| `cloud/` | Multi-device sync and backup | `api.py` (13KB RESTful) |

### Entry Points

- `__main__.py` - Main application router (CLI or Studio mode)
- `cli.py` - Command-line interface (jpe-sims4)
- `studio.py` - Desktop GUI application (jpe-studio)
- `installer.py` - Branded installation wizard (jpe-installer)

## Build, Test, and Common Commands

### Installation & Development Setup
```bash
# Install in development mode with dev dependencies
pip install -e ".[dev]"

# Install with all optional dependencies (cloud sync, dev tools)
pip install -e ".[all]"
```

### Testing
```bash
# Run all tests with coverage
python run_tests.py

# Or use pytest directly
python -m pytest tests/ --cov=jpe_sims4 -v

# Run specific test file
python -m pytest tests/test_engine.py -v

# Run specific test
python -m pytest tests/test_ir.py::test_interaction_creation -v
```

### Building and Running
```bash
# Build distributions (wheel, sdist)
python build.py

# Or use standard Python build
python -m build

# Launch desktop studio
jpe-studio

# Or
python studio.py

# CLI commands
jpe-sims4 build /path/to/project --build-id my_build_001
jpe-sims4 validate /path/to/project
jpe-sims4 info /path/to/project
```

### Validation and Verification
```bash
# Quick validation
python quick_verify.py

# Final validation
python final_verify.py

# UI/UX validation
python validate_ui_ux.py
```

## Key Design Patterns

### 1. Intermediate Representation (IR)
All translation flows through a central IR model. The IR:
- Represents core Sims 4 concepts (interactions, buffs, traits, etc.)
- Validates internal consistency
- Serializes to/from multiple formats
- Lives in `engine/ir.py`

### 2. Multi-Format Architecture
- **Parsers** (in `engine/parsers/`) convert formats → IR
- **Generators** (in `engine/generators/`) convert IR → formats
- New formats require creating parser + generator pair
- Plugin system allows runtime format extension

### 3. Error Handling with Severity
Errors use color-coded severity levels (in `diagnostics/errors.py`):
- **CRITICAL** (Red #E53E3E) - Gameplay-blocking
- **WARNING** (Orange #DD6B20) - Compatibility
- **CAUTION** (Yellow #D69E2E) - Potential conflicts
- **INFO** (Blue #3182CE) - Informational
- **SUCCESS** (Green #38A169) - Positive

Error categories: `ParseError`, `ValidationError`, `GenerationError`, `RuntimeError`

### 4. Plugin System Lifecycle
1. Discover plugins in `plugins/` directory
2. Load and register with `PluginManager`
3. Execute during build pipeline (parse → validate → generate phases)
4. Collect errors/warnings per plugin
5. Clean up resources

### 5. Theme System
The 10 themes in `ui/theme_manager.py` have consistent color schemes:
- Each theme provides foreground, background, accent, warning colors
- Applied globally to entire Studio GUI
- User preference stored in config

## UI/UX Asset Requirements

Per project directive, all UI elements must match asset screenshots. Key components:
- Desktop Studio interface (tabbed: Project Explorer, Editor, Build, Reports, Documentation, Settings)
- Icon system and branding in `branding/` directory
- Accessibility support required across all UI
- Desktop, iOS, and cross-platform mobile apps must maintain visual consistency

## Important Files & Conventions

### Configuration
- **System Config:** `config/config_manager.py` - handles encrypted storage, paths, settings
- **Build Config:** Project expects `config/` directory in project root
- **Plugin Config:** Plugins discovered from `plugins/` directory at runtime

### Logging
- Performance monitoring in `diagnostics/logging.py` with timing decorators
- Build reports written to project `build/` directory
- Error reports include file/line references for user navigation

### Testing Structure
- Tests mirror source structure: `tests/test_*.py`
- Use pytest fixtures for common setups
- Test IR objects, parsers, validators, generators, and integration
- Coverage target: maintain existing coverage levels

### Documentation
Comprehensive PDFs provided (read for context, but code is source of truth):
- `prd01_core_translator_engine.pdf` - Engine specs
- `prd02_jpe_language_and_jpe_xml.pdf` - JPE syntax
- `prd03_desktop_jpe_studio.pdf` - Studio application
- Others cover mobile, cloud, plugins, onboarding, diagnostics

User-facing docs: `README.md`, `THE_CODEX_USER_MANUAL.md`

## Development Workflow

### Before Making Changes
1. Read the relevant IR data structures if modifying core concepts
2. Check existing error categories if adding new error types
3. Review plugin system if adding new format support
4. Ensure theme system is applied to UI changes

### Code Quality Standards
- Maintain existing code style and patterns
- Use type hints (Python 3.11+)
- Write minimal, focused tests for changes
- Keep error messages clear and actionable
- Sanitize all user input (in `security/validator.py`)
- Use async operations for long-running tasks (in `performance/monitor.py`)

### Before Committing
- Run test suite: `python run_tests.py`
- Verify no type errors (project uses type hints)
- Check error messages are user-friendly
- If touching UI, verify theme system consistency

## Cloud Synchronization

Cloud API in `cloud/api.py` provides:
- User authentication and project management
- Multi-device synchronization
- Conflict resolution
- Encrypted communications

Uses encrypted credential storage from `config_manager.py`.

## Performance Considerations

- Large projects may have many JPE files: use async parsing in `performance/monitor.py`
- IR validation is comprehensive: cache results when possible
- Plugin execution happens sequentially in build pipeline
- UI updates handled via Tkinter event loop (no blocking operations)

## System Requirements

- Python 3.11+ (3.8 minimum for compatibility)
- 512MB available RAM minimum
- 100MB disk space minimum
- Windows 6.0+, macOS, or Linux

## Known Development Points

1. **IR Validation** - Most complex validation lives in `engine/validation/validator.py`
2. **Error Reporting** - Comprehensive error detection in `diagnostics/error_system.py` (32KB)
3. **Onboarding** - The Codex system spans `the_codex.py` and `the_codex_gui.py` (140KB combined)
4. **Theme System** - All 10 themes defined in single `theme_manager.py` file
5. **Plugin Loading** - Runtime plugin discovery in `plugins/manager.py`

## Production Deployment Status

✅ All 8 phases complete
✅ Production-ready with extensive testing
✅ Cloud sync, mobile apps, plugin system all implemented
✅ Comprehensive onboarding and diagnostics
✅ Ready for user adoption and GitHub hosting

When adding features or fixing bugs, maintain alignment with production standards and ensure all UI/UX elements match provided asset screenshots.
