# JPE Sims 4 Mod Translation Suite — Fresh-Start MVP (v0.1)  
**Implementation Blueprint (Core Engine + CLI + Desktop Lite)**

> This document is the “start over fresh” MVP plan for the **JPE Sims 4 Mod Translation Suite**.  
> It is designed to be **shippable**, **testable**, and **expandable** without recreating the pain that killed the previous codebase.

---

## 0) Why this MVP exists

The SOP’s core promise is simple and powerful:

- Read Sims 4 mod formats (starting with XML tuning).
- Translate them into **Just Plain English (JPE)** so humans can understand/edit behavior.
- Compile JPE (and later JPE‑XML) back into Sims 4 compatible tuning.
- Surface problems through **structured diagnostics**, not raw stack traces.
- Share one engine across desktop and mobile later.  

This MVP implements the **engine heart** and two minimal front-ends:
- **CLI** (automation + tests + CI + power users)
- **Desktop Lite** (Tauri) to inspect/edit and view diagnostics  

---

## 1) MVP goals (what we WILL ship)

### 1.1 Must-have outcomes
1. **XML tuning import** (folder in → project out)
2. **XML → IR → JPE export** for a supported subset of tuning patterns
3. **JPE → IR → XML build** back to Sims 4 tuning for the same subset
4. **Diagnostics-first**: warnings and errors are data (human-readable + JSON)
5. **Deterministic formatting** for JPE (stable diffs, clean reviews)
6. **Golden fixtures + tests** so regressions are caught immediately
7. **Desktop Lite**: open project, show XML/JPE, show problems, build/export

### 1.2 Supported tuning slice (v0.1)
Start with what modders touch constantly and what’s common across mods:

- **Interactions** (basic structure + pie menu metadata)
- **Tests / conditions** (common predicates)
- **Loot actions** (apply buff, set commodity, statistic modifiers — limited set)
- **Buffs / moodlets** (basic definition + duration references)
- **Traits** (basic definition + references)

> Anything outside the supported subset must be handled via **diagnostics + preservation**, never via crashing.

---

## 2) Non-goals (what we will NOT ship in MVP)

These are explicitly postponed so MVP doesn’t collapse under its own ambition:

- Full `.package` container parsing
- Full STBL toolchain (string tables) beyond placeholders
- `.ts4script/.py` decompile/recompile and deep Python analysis
- JPE‑XML (English-friendly XML fork) beyond project placeholders
- Cloud sync, accounts, iPhone app
- Perfect semantic coverage for every tuning element Sims 4 uses

Design for these now, implement later.

---

## 3) Core design principle: Everything goes through IR

**IR (Intermediate Representation)** is the one true “meaning layer”.

All conversions go through it:

- **XML → IR → JPE**
- **JPE → IR → XML**

This prevents translator forks, duplicated logic, and drift between formats.

---

## 4) Tech stack (recommended)

### 4.1 Engine + CLI: Rust
Rust gives:
- Fast parsing & generation
- Memory safety
- Easy single-binary distribution
- A future path to shared engine across desktop + mobile (via UniFFI)

### 4.2 Desktop: Tauri (Rust + web UI)
Tauri is lightweight and integrates naturally with Rust core.

### 4.3 Data formats
- Project config: `TOML`
- Diagnostics output: `JSON`
- Fixtures: raw XML + expected JPE + expected diagnostics snapshots

---

## 5) Repo layout (fresh, clean, expandable)

```text
jpe-sims4-suite/
  core/
    crates/
      jpe_ir/              # IR types + IDs + serializers
      jpe_diag/            # structured diagnostics + spans + reporters
      jpe_xml/             # Sims4 XML tuning parser + generator (subset)
      jpe_lang/            # JPE parser + formatter + generator (subset)
      jpe_engine/          # orchestration: XML<->IR<->JPE + preservation
      jpe_cli/             # CLI entry + commands
    tests/
      fixtures/
        xml/
        jpe/
        expected/
  desktop/
    src-tauri/
    ui/
  languages/
    jpe/
      spec.md              # fuller spec (starts minimal, grows)
      grammar.pest         # if using pest; optional
    jpe-xml/
      schema.md            # placeholder for later
  plugins/
    version-packs/         # later: patch compatibility packs
  docs/
    MVP_IMPLEMENTATION.md  # this file (or link to it)
    ARCHITECTURE.md
  samples/
  .github/workflows/
  Cargo.toml
  README.md
  LICENSE
```

---

## 6) Data model: IR (Intermediate Representation)

### 6.1 IR principles
- **Stable IDs**: retain tuning instance IDs where possible
- **Human names**: prefer display names when available
- **References**: represent “links” between tuning records explicitly
- **Unknown preservation**: store unsupported XML fragments for round-trip safety (optional mode)

### 6.2 IR types (MVP subset)

#### 6.2.1 Common building blocks
- `TuningId` (u64 or string)
- `ResourceKey` (later for package/STBL integration)
- `Span` (file + line/col; best-effort)
- `Ref<T>` (reference to another tuning record by id/name)
- `LocKey` (string id reference; later STBL integration)

#### 6.2.2 Core records
- `Interaction`
  - id, name
  - target_type (Sim/Object)
  - pie_menu_category
  - tests: Vec<TestExpr>
  - loots: Vec<LootAction>
  - metadata: map of known properties
  - preserved_xml: Vec<PreservedNode> (optional)

- `Buff`
  - id, name, duration_ref
  - metadata
  - preserved_xml

- `Trait`
  - id, name
  - metadata
  - preserved_xml

- `TestExpr` (subset)
  - logical: And(Vec<TestExpr>) | Or(Vec<TestExpr>) | Not(Box<TestExpr>)
  - predicates:
    - `Age(TeenOrOlder | Child | … subset)`
    - `IsSleeping(bool)`
    - `Relationship(min_level)`
    - `HasTrait(Ref<Trait>)`
    - `HasBuff(Ref<Buff>)`
    - etc (grow via data-driven catalog)

- `LootAction` (subset)
  - ApplyBuff { buff: Ref<Buff>, target: Actor|Target, duration: Option<Duration> }
  - ModifyStatistic { stat: String, delta: f32, target: Actor|Target }
  - SetCommodity { commodity: String, value: f32, target: Actor|Target }
  - (Add others carefully)

- `PreservedNode`
  - xpath-ish location
  - raw_xml string
  - note (why preserved)

> MVP policy: If we can’t translate a node, we **preserve** it (optional mode) and emit diagnostics.

---

## 7) Diagnostics (non-negotiable)

### 7.1 The rule
No raw stack traces to users. Ever.  
Errors are returned as structured diagnostics.

### 7.2 Diagnostic shape (JSON)
```json
{
  "code": "JPE1004_UNSUPPORTED_TUNING",
  "severity": "warning",
  "file": "tuning/interaction_FriendlyAsk.xml",
  "span": { "startLine": 42, "startCol": 5, "endLine": 42, "endCol": 31 },
  "message": "Unsupported tuning element in MVP: <complex_factory>",
  "hint": "This element will be preserved verbatim in passthrough mode."
}
```

### 7.3 Diagnostic severities
- `info`: FYI, no action needed
- `warning`: supported build may still succeed
- `error`: build cannot produce valid output
- `fatal`: internal bug (still structured; suggests filing issue)

### 7.4 Error code policy
- Stable codes: `JPE1xxx` for language/parser; `JPE2xxx` for XML; `JPE3xxx` for engine; etc.
- Codes must be documented in `docs/DIAGNOSTICS.md`.

---

## 8) JPE language (v0.1) — structured plain English DSL

JPE is **not** “freeform paragraphs”.  
It is a **deterministic structured DSL** that reads like plain English.

### 8.1 File format
- UTF‑8 text
- Indentation-based blocks (2 spaces recommended)
- `#` for comments
- Quoted strings for names that contain spaces

### 8.2 MVP grammar (human-readable)
- `interaction "<name>":`
- `buff "<name>":`
- `trait "<name>":`
- Properties as `key: value`
- Lists as:
  - `available_when:`
    - `- <test>`
  - `on_success:`
    - `- <loot>`

### 8.3 Example (MVP)
```text
# File: tuning/interaction_friendly_ask_about_day.jpe

interaction "Ask About Day":
  id: 123456789012345678
  target: Sim
  pie_menu: Friendly

  available_when:
    - actor is teen_or_older
    - target is not sleeping

  on_success:
    - apply buff "Happy +1" to target for 2h
```

### 8.4 Formatting rules (deterministic)
- Keys are always snake_case in output
- Lists always use `- `
- Quotes always use `"` (double quotes)
- Engine sorts properties in a stable order:
  1) id/name/target/pie_menu
  2) tests
  3) loot/actions
  4) metadata
  5) preserved

This ensures stable diffs and reproducible builds.

---

## 9) XML tuning support (v0.1 subset) — strategy

### 9.1 Parsing approach
We do **best-effort structured parse** for known patterns, plus optional preservation:

- Parse XML into a lightweight DOM/event model (e.g., `quick-xml`)
- For known “shapes,” map into IR
- For unknown nodes:
  - if `--passthrough` enabled: preserve raw XML fragments into IR
  - always emit diagnostics

### 9.2 Generation approach
- From IR, generate XML using known templates
- Re-insert preserved nodes if passthrough mode was enabled and safe
- Emit warnings when preserved nodes are inserted (so users know it’s not fully “understood”)

### 9.3 Round-trip guarantee policy
- For **supported subset** and **no preserved nodes**, guarantee:
  - XML → JPE → XML maintains equivalent semantics (within subset)
- For preserved nodes:
  - guarantee “no loss” (verbatim retention) when possible
  - if not possible, emit error with clear action

---

## 10) CLI MVP spec (Rust)

### 10.1 Command list
- `jpe init <folder>`
  - creates project structure and config

- `jpe import <mod_folder> --out <project>`
  - imports XML tuning folder into project
  - generates `.jpe` files alongside or in `jpe/`

- `jpe check <project> [--json <path>]`
  - validates XML + JPE parseability
  - outputs diagnostics

- `jpe build <project> --out <export_folder> [--passthrough]`
  - compiles JPE back to XML
  - writes output folder suitable for mod packaging

- `jpe fmt <project>`
  - rewrites JPE files into canonical formatting

### 10.2 CLI output rules
- Default output: human-friendly logs
- `--json` dumps diagnostics in machine format
- `--quiet` minimizes stdout (CI-friendly)

### 10.3 CLI examples
```bash
# Create project
jpe init ./MyModProject

# Import XML tuning
jpe import ./SomeModTuning --out ./MyModProject

# Validate
jpe check ./MyModProject --json ./diag.json

# Build back to XML
jpe build ./MyModProject --out ./ExportedTuning --passthrough
```

---

## 11) Desktop Lite spec (Tauri)

### 11.1 MVP screens
1. **Project Explorer**
   - folder tree
   - file search

2. **Dual-pane viewer/editor**
   - left: XML view
   - right: JPE view
   - toggle: “edit JPE” (XML read-only initially)

3. **Problems panel**
   - list diagnostics
   - click highlights file and approximate span

4. **Build/Export**
   - runs the same engine as CLI
   - shows diagnostics

### 11.2 Desktop state model
- Project loaded → scan files → run `engine.check()` → populate problems
- On file save → re-check just that file
- On build → run `engine.build()` → show report + open output folder action

### 11.3 Desktop/engine integration
- Engine is a Rust crate used both by:
  - CLI binary
  - Tauri backend commands (`#[tauri::command]`)

---

## 12) Implementation plan (step-by-step)

### Phase A — Core foundations (Week 0–1 equivalent)
1. Create Rust workspace in `/core`
2. Implement `jpe_diag`:
   - `Diagnostic`, `Span`, `Severity`, JSON serializer
3. Implement `jpe_ir`:
   - IR structs + serde
4. Add test harness + fixture layout

### Phase B — XML subset parser/generator (Week 1–2)
1. Implement `jpe_xml` parsing for:
   - interactions, tests, loots (subset)
2. Add preservation mechanism:
   - raw XML capture + reinsertion scaffolding
3. Implement XML generator for supported IR types
4. Add round-trip tests

### Phase C — JPE language subset (Week 2–3)
1. Implement `jpe_lang`:
   - parser (hand-rolled or Pest)
   - formatter (canonical)
2. Implement JPE generator from IR
3. Add snapshot tests for JPE formatting

### Phase D — Engine orchestration (Week 3)
1. Implement `jpe_engine`:
   - `import_xml_folder()`
   - `export_jpe()`
   - `parse_jpe_folder()`
   - `build_xml_folder()`
   - `check_project()`
2. Standardize diagnostics emission across all layers

### Phase E — CLI (Week 3–4)
1. Implement `jpe_cli` using `clap`
2. Wire commands to engine
3. Add CI job for CLI integration tests

### Phase F — Desktop Lite (Week 4)
1. Tauri app shell
2. File explorer + editor panes + problems list
3. Engine commands exposed via Tauri backend
4. Release build artifacts

---

## 13) Testing strategy (how we keep this from dying again)

### 13.1 Fixture library (required)
`core/tests/fixtures/`
- `xml/` — source tuning files
- `expected/jpe/` — expected JPE outputs (snapshots)
- `expected/xml/` — expected regenerated XML outputs
- `expected/diag/` — expected diagnostics JSON

### 13.2 Test categories
1. **Unit tests**
   - parser components
   - formatting rules
2. **Snapshot tests**
   - IR → JPE output must match expected
3. **Round-trip tests**
   - XML → IR → JPE → IR → XML equivalence for supported subset
4. **Negative tests**
   - unsupported features yield warnings/errors, not panics
5. **Fuzz/property tests** (optional but powerful)
   - ensure parser doesn’t crash on weird inputs

### 13.3 “No panic” policy
- Public API returns `Result<T, Vec<Diagnostic>>` or `Result<T, EngineError>` where errors convert into diagnostics.
- Panics only allowed in tests.

---

## 14) CI workflow (GitHub Actions)

### Required jobs
- `fmt`: rustfmt
- `lint`: clippy (deny warnings for core crates)
- `test`: cargo test (Linux + Windows)
- `desktop-build` (later): build Tauri artifacts (tagged releases)

### Minimum matrix
- Ubuntu latest
- Windows latest

---

## 15) Security + legal + ethics

- Tool operates only on **user-provided mods**.
- Do not bundle or redistribute Sims 4 proprietary assets or executables.
- Avoid shipping copyrighted content in sample fixtures (use synthetic fixtures if needed).
- Diagnostics must never upload mod contents anywhere (local-first by default).

---

## 16) Definition of Done (MVP acceptance criteria)

MVP is “done” when:

1. `jpe import` converts a folder of XML tuning into `.jpe` files
2. `jpe build` regenerates valid XML for supported subset
3. Unsupported tuning yields structured diagnostics (warnings/errors), never crashes
4. At least **25 fixtures** exist and run in CI
5. Round-trip tests exist and pass for supported subset
6. Desktop Lite can:
   - open project
   - show XML/JPE side-by-side
   - show problems panel
   - run build/export

---

## 17) Post-MVP roadmap (next expansions)

### v0.2
- Expand test + loot catalogs (data-driven)
- Improve span tracking (line/col)
- Better preservation reinsertion safety checks

### v0.3
- STBL integration (string keys → readable text)
- Package container read-only support (`.package` exploration)

### v0.4+
- JPE‑XML language support
- Plugin adapters + version packs (patch compatibility)
- Shared engine for iPhone app (UniFFI)

---

## 18) Appendix: Implementation notes & conventions

### 18.1 Code style
- Rust 2021 edition
- `clippy::pedantic` (selective allowlist)
- `serde` for serialization
- `thiserror` for internal errors

### 18.2 Logging
- Use `tracing` crate
- CLI sets logging level via `RUST_LOG`
- Desktop captures logs and exposes them in a “Logs” panel (optional)

### 18.3 Project config (TOML)
`jpe_project.toml`
```toml
[project]
name = "MyModProject"
version = "0.1"
game = "sims4"

[paths]
xml_in = "xml"
jpe = "jpe"
xml_out = "build/xml"

[engine]
passthrough = true
```

---

## 19) What to build first (the no-brainer checklist)

1. `jpe_diag` crate (diagnostics model + JSON)
2. `jpe_ir` crate (IR structs)
3. One working pipeline:
   - parse one interaction XML shape → IR → JPE
   - parse that JPE → IR → XML
4. Add fixtures around that pipeline
5. Expand supported shapes one by one, always fixture-first

---

**End of MVP Implementation Blueprint**
