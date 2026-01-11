# JPE Sims 4 Mod Translation Suite — Core Engine (Rust)

This is the core engine for the JPE Sims 4 Mod Translation Suite, implemented in Rust as per the MVP specification.

## Overview

The JPE Sims 4 Mod Translation Suite is designed to:
- Read Sims 4 mod formats (starting with XML tuning)
- Translate them into **Just Plain English (JPE)** so humans can understand/edit behavior
- Compile JPE (and later JPE‑XML) back into Sims 4 compatible tuning
- Surface problems through **structured diagnostics**, not raw stack traces
- Share one engine across desktop and mobile

## Architecture

The system is organized into several crates:

- `jpe_diag`: Structured diagnostics with JSON serialization
- `jpe_ir`: Intermediate representation types for Sims 4 mod concepts
- `jpe_xml`: XML tuning file parser and generator
- `jpe_lang`: JPE language parser and formatter
- `jpe_engine`: Orchestration engine for conversion workflows
- `jpe_cli`: Command-line interface

## Building

```bash
# Build the entire workspace
cargo build

# Build in release mode
cargo build --release

# Run tests
cargo test
```

## Usage

The CLI can be run with:

```bash
# Initialize a new project
cargo run -- init ./MyModProject

# Import XML tuning
cargo run -- import --xml-folder ./SomeModTuning --out ./MyModProject

# Validate project
cargo run -- check ./MyModProject

# Build back to XML
cargo run -- build --project ./MyModProject --out ./ExportedTuning --passthrough
```

## MVP Features (v0.1)

Currently implemented:
- Basic project structure and CLI commands
- Structured diagnostics system
- Intermediate representation for core Sims 4 concepts
- Placeholders for XML and JPE parsing/generation

Planned for completion:
- XML tuning import/export for interactions, buffs, traits, tests, and loot actions
- JPE language parsing and formatting
- Full round-trip conversion capabilities
- Preservation of unsupported XML elements
- Desktop Lite integration via Tauri