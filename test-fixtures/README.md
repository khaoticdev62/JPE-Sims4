# JPE Studio Test Fixtures

This directory contains sample mod projects for deep feature testing. Each fixture targets specific features added in recent codebase updates.

## Fixture Overview

| Fixture | Purpose | Tests |
|---------|---------|-------|
| `traits/` | Trait mod with STBL | Round-trip validation, STBL batch ops |
| `buffs/` | Buff chain mod | Decompiler, Export Wizard |
| `interactions/` | Social interactions | Search/Replace, ShortcutService |
| `stbl/` | Multi-locale string tables | StblBatchService, FNV-32a hashing |
| `scripts/` | Python injection mod | OllamaService AI analysis |
| `mixed-mod/` | Complete mod project | Full integration test |
| `validation-suite/` | Edge cases | ProjectValidator stress test |

## Usage

```bash
# Validate a fixture
npm run validate:roundtrip -- test-fixtures/traits

# Run full test suite with fixtures
npm run test:all

# Test Export Wizard
# Open JPE Studio → Open Project → Select test-fixtures/mixed-mod
```
