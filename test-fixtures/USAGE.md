# JPE Studio Test Fixtures — Usage Guide

This guide explains how to use the test fixtures to validate recent codebase updates.

## Quick Start

```bash
# Run all fixture tests
npm run test:fixtures

# Run single test category
npx tsx test-fixtures/run-tests.ts

# Windows batch runner
test-fixtures\run-tests.bat
```

## Fixture Categories

### 1. Trait Mods (`test-fixtures/traits/`)

**Files:**
- `evil_trait.xml` — Basic trait with display name, tooltip, age/gender restrictions
- `perfectionist_trait.xml` — Advanced trait with statistic tracking

**Tests:**
- ✅ Round-trip JPE↔XML conversion
- ✅ ProjectValidator validation
- ✅ JPEDecompiler decompilation
- ✅ STBL hash key resolution

**Example:**
```bash
# Validate traits
npm run validate:roundtrip -- test-fixtures/traits

# Decompile to JPE
npx tsx src/cli/decompile-service.ts test-fixtures/traits/evil_trait.xml output.jpe
```

### 2. Buff Mods (`test-fixtures/buffs/`)

**Files:**
- `confident_buff.xml` — Buff with duration, effects, triggers

**Tests:**
- ✅ Export Wizard resource selection
- ✅ Buff effect parsing
- ✅ Duration and trigger validation

### 3. Interaction Mods (`test-fixtures/interactions/`)

**Files:**
- `greet_neighbor.xml` — Social interaction with conditions and outcomes

**Tests:**
- ✅ SearchService project-wide search
- ✅ Interaction condition parsing
- ✅ Outcome chain validation

### 4. STBL Files (`test-fixtures/stbl/`)

**Files:**
- `evil_trait_en_US.stbl` — English strings
- `evil_trait_ja_JP.stbl` — Japanese strings
- `multi_locale_de_DE.stbl` — German strings (multi-entry)

**Tests:**
- ✅ StblBatchService global search/replace
- ✅ FNV-32a hash collision detection
- ✅ Multi-locale synchronization
- ✅ Unicode support (Japanese characters)

**Example:**
```typescript
// In JPE Studio or test:
import { StblBatchService } from '@/services/translation/StblBatchService'

// Search and replace across all locales
const result = await StblBatchService.globalSearchAndReplace(
  project,
  'Evil',
  'Wicked',
  false // case-insensitive
)
```

### 5. Script Mods (`test-fixtures/scripts/`)

**Files:**
- `jpe_test_greeting.py` — Python interaction injection

**Tests:**
- ✅ PythonService extraction
- ✅ OllamaService AI code analysis
- ✅ .ts4script format validation

### 6. Mixed Mod (`test-fixtures/mixed-mod/`)

**Files:**
- `project.jpe` — Complete mod project manifest

**Tests:**
- ✅ Export Wizard full workflow
- ✅ Project bundling (JpeBundlerService)
- ✅ Multi-file resource selection
- ✅ Package export with metadata

**Usage in JPE Studio:**
1. Open JPE Studio
2. File → Open Project → Select `test-fixtures/mixed-mod/`
3. Test Export Wizard: Tools → Export Package
4. Test Search: Ctrl+Shift+F → Search for "trait"
5. Test STBL Batch: Open String Table Manager → Batch Operations

### 7. Validation Suite (`test-fixtures/validation-suite/`)

**Files:**
- `edge_case_empty.xml` — Minimal trait (no restrictions)
- `edge_case_malformed.xml` — Intentionally broken XML
- `edge_case_nested.xml` — Deep nesting (4+ levels)

**Tests:**
- ✅ ProjectValidator error handling
- ✅ Round-trip validator resilience
- ✅ Parser edge case coverage
- ✅ Error message quality

## Testing New Features

### ProjectValidator

```bash
# Validate entire fixture suite
npm run test:fixtures

# Validate specific directory
npx tsx src/cli/validate-roundtrip.ts test-fixtures/validation-suite
```

### StblBatchService

```typescript
// Test in JPE Studio console or integration test:
import { StblBatchService } from '@/services/translation/StblBatchService'

const project = {
  files: [
    { id: 'en', type: 'stbl', path: 'test-fixtures/stbl/evil_trait_en_US.stbl' },
    { id: 'ja', type: 'stbl', path: 'test-fixtures/stbl/evil_trait_ja_JP.stbl' },
    { id: 'de', type: 'stbl', path: 'test-fixtures/stbl/multi_locale_de_DE.stbl' },
  ]
}

// Sync English to German
await StblBatchService.syncLocales(project, 'en', ['de'])
```

### SearchService

```typescript
// Test project-wide search
import { searchService } from '@/services/SearchService'

const result = await searchService.search(
  'test-fixtures/',
  'trait',
  { isRegex: false, isCase: false, isWord: true }
)
```

### JPEDecompiler (CLI)

```bash
# Decompile single file
npx tsx src/cli/decompile-service.ts test-fixtures/traits/evil_trait.xml

# Decompile with output
npx tsx src/cli/decompile-service.ts test-fixtures/buffs/confident_buff.xml output.jpe
```

### OllamaService (Local AI)

**Prerequisites:**
```bash
# Install Ollama: https://ollama.ai
ollama pull codellama:13b
```

**Test in JPE Studio:**
1. Open AI Assistant (Ctrl+I)
2. Select Ollama provider
3. Load `test-fixtures/scripts/jpe_test_greeting.py`
4. Ask: "Analyze this Python script for potential issues"

## Expected Results

| Test | Expected Outcome |
|------|------------------|
| Trait round-trip | ✅ PASS (valid XML→JPE→XML) |
| Buff parsing | ✅ PASS (effects extracted) |
| STBL multi-locale | ✅ PASS (3 locales loaded) |
| Malformed XML | ⚠ FAIL (expected — tests error handling) |
| Empty trait | ✅ PASS (minimal valid structure) |
| Nested structure | ✅ PASS (deep nesting handled) |
| SearchService | ✅ PASS (finds "trait" in 6+ files) |
| StblBatchService | ✅ PASS (search/replace works) |
| Export Wizard | ✅ PASS (builds .package) |

## Adding New Fixtures

1. Create fixture file in appropriate subdirectory
2. Update `test-fixtures/run-tests.ts` → `expectedFiles` array
3. Run `npm run test:fixtures` to validate
4. Document in this file

## Troubleshooting

### "File not found" errors
- Ensure you're running from project root
- Check that fixtures were committed (run `git status`)

### STBL parse failures
- Verify hash format: `0xXXXXXXXX=value`
- Ensure UTF-8 encoding

### Round-trip validation failures
- Check XML is well-formed
- Verify all STBL hashes resolve
- Look for unsupported elements

### OllamaService connection refused
- Ensure Ollama is running: `ollama list`
- Check endpoint: `http://localhost:11434`
