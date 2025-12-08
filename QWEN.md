# JPE Sims 4 Mod Translator

## Project Overview

JPE Sims 4 Mod Translator is a Python-based translation engine designed to handle The Sims 4 mod content using a Just Plain English (JPE) syntax. The project provides a complete ecosystem for developing, translating, validating, and building Sims 4 mods with human-readable source files.

### Key Components

- **Core Engine (`engine/engine.py`)**: Main orchestration API that manages the build process from JPE sources to XML outputs
- **Intermediate Representation (`engine/ir.py`)**: Data structures representing Sims 4 mod concepts in memory (interactions, buffs, traits, statistics, etc.)
- **Parser System (`engine/parsers/`)**: Collection of parsers for different input formats (JPE, JPE-XML, XML)
- **Generator System (`engine/generators/`)**: Converts IR back to XML output files
- **Validation System (`engine/validation/`)**: Validates parsed content against business rules
- **Diagnostics System (`diagnostics/`)**: Comprehensive error reporting and build status tracking

### Supported Sims 4 Mod Elements

The system handles various types of Sims 4 mod resources:
- Interactions (with participants, tests, and loot actions)
- Buffs and moodlets
- Traits with associated modifiers
- Statistics and their modifiers
- Enums and their options
- Test sets (with logical conditions)
- Loot actions
- Localized strings

## Building and Running

### Prerequisites
- Python 3.11 or higher

### Setup
```bash
# Install dependencies
pip install -e .
```

### Running the Build Tool
```bash
# Basic usage
python -m cli path/to/project/root --build-id my-build-001

# Specify reports directory
python -m cli path/to/project/root --build-id my-build-001 --reports-dir /path/to/reports
```

### Build Process Flow
1. Parse JPE source files into internal Intermediate Representation (IR)
2. Validate the IR against semantic rules
3. Generate XML output files if validation passes
4. Create build report with status, errors, and warnings

## Architecture

### Engine Configuration (`EngineConfig`)
- `project_root`: Path to the JPE project root directory
- `reports_directory`: Directory where build reports will be stored

### Translation Engine (`TranslationEngine`)
The main orchestrator responsible for:
- Managing parser instances (JPE, JPE-XML, XML)
- Running validation on parsed IR
- Generating XML output files
- Producing detailed build reports

### Error Handling
The system implements a sophisticated error categorization system:
- **Categories**: Parser errors (JPE, JPE-XML, XML), validation, I/O, plugins, cloud sync
- **Severities**: Info, Warning, Error, Fatal
- **Reporting**: Detailed JSON build reports with file paths, positions, and suggested fixes

### IR Structure
The intermediate representation includes classes for:
- `ProjectIR`: Top-level container with metadata and collections of all mod elements
- `ResourceID`: Logical identifiers linking module, class name, and instance ID
- Element types: Interactions, Buffs, Traits, Enums, TestSets, LootActions, LocalizedStrings

## Development Conventions

- Type hints are extensively used throughout the codebase
- Dataclasses with `slots=True` are used for memory efficiency
- Enum classes define constrained value sets
- The code follows modern Python 3.11+ syntax and practices
- Error handling is centralized through the diagnostic system

## Project Structure

```
├── .venv/                 # Virtual environment
├── .idea/                 # IDE configuration
├── diagnostics/           # Error reporting and build reports
│   ├── errors.py          # Error definitions and categories
│   └── reports.py         # Report generation utilities
├── engine/                # Core translation engine
│   ├── engine.py          # Main engine orchestrator
│   ├── ir.py              # Intermediate representation models
│   ├── parsers/           # Source file parsers
│   │   ├── jpe_parser.py
│   │   ├── jpe_xml_parser.py
│   │   └── xml_parser.py
│   ├── generators/        # Output generators
│   │   └── xml_generator.py
│   └── validation/        # Validation logic
│       └── validator.py
├── plugins/               # Plugin interface directory
├── src/                   # Package source directory (currently empty)
├── cli.py                 # Command-line interface entry point
├── __init__.py            # Package initialization
├── pyproject.toml         # Project configuration
└── *.pdf                  # Product requirement documents
```

## File Formats

The project uses several file formats:
- `.jpe`: Just Plain English format for mod definitions
- `.jpe-xml`: XML representation of JPE syntax
- `.xml`: Standard Sims 4 mod XML files
- `.json`: Build reports and diagnostic output

## Future Development Areas

Based on the PRD files in the directory, planned features include:
- Desktop Studio application
- iPhone app
- Cloud sync API
- Plugin and extensibility system
- Enhanced diagnostics and exception translation
- Onboarding documentation