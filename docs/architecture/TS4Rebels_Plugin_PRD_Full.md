# PRD — TS4Rebels Plugin for JPE Sims 4 Mod Translation Suite (Full-Scope)

**Document ID:** JPE-PLUG-TS4R-PRD-001  
**Status:** v1.0.0 (Product Requirements)  
**Owner:** JPE Plugin Team  
**Last Updated:** 2025-12-17  
**Applies To:** JPE Desktop (JPE Studio) + JPE CLI core integration

---

## 0. Executive Summary

The **TS4Rebels Plugin** is a dedicated integration module inside the JPE Sims 4 Mod Translation Suite that turns a user's **local TS4Rebels-sourced mod vault** into a first-class citizen of the JPE workflow.

It provides:
- A **Vault** experience (scan, index, group, and enrich mods).
- **Translation orchestration** (bulk translate to JPE + JPE-XML using JPE core).
- **Diagnostics + CRM** (Better-Exceptions-style issues per mod, per run, with lifecycle tracking).
- **Conflict detection** (tuning/resource overlap heuristics with configurable strictness).
- **Privacy-safe exports** (sanitized reports for troubleshooting without leaking absolute paths/usernames).

It explicitly **does not** scrape, mirror, host, or redistribute TS4Rebels content. It operates only on user-provided local files and user-provided metadata.

---

## 1. Background & Context

### 1.1 JPE Suite Context
The JPE Sims 4 Mod Translation Suite is a toolchain that reads Sims 4 mod file types (XML tuning, STBL, .package, .ts4script/.py, JSON/cfg, etc.), translates them to **Just Plain English (JPE)**, supports authoring in **JPE and JPE-XML**, compiles back into Sims 4-compatible tuning, and produces rich diagnostics suitable for both machine consumption and human troubleshooting.

### 1.2 TS4Rebels Context
Many users curate collections of mods they associate with TS4Rebels creators and distribution ecosystems, stored locally as folders of `.package` and `.ts4script` (and associated artifacts). Users want:
- A plain-English understanding of mod behavior.
- Safe bulk workflows (never overwrite originals).
- Better diagnostics, issue tracking, and support-friendly export bundles.

---

## 2. Goals, Non-Goals, and Constraints

### 2.1 Goals (G)
**G1 — Vault First-Class Support**
- Treat a TS4Rebels vault like a project-native source: scan, index, browse, filter, and select.

**G2 — Zero-Destruction Safety**
- Never modify or overwrite original mod files. All outputs must be in JPE-managed locations.

**G3 — Bulk Translation at Scale**
- Batch translate and validate large sets of mods with per-mod result statuses and resumable runs.

**G4 — Diagnostics that Don’t Suck**
- Structured diagnostics (not raw traces), actionable messages, and machine-readable artifacts.

**G5 — CRM for Mods**
- A persistent issue model (status, severity, notes, history) keyed to mods + runs.

**G6 — Support-Ready Exports**
- Export sanitized issues with enough context to troubleshoot while protecting privacy.

**G7 — Offline-First**
- No network dependency; no background telemetry; no external calls required for operation.

### 2.2 Non-Goals (NG)
- NG1: No web scraping, login bypass, or direct API integration to TS4Rebels infrastructure.
- NG2: No hosting or redistribution of TS4Rebels content.
- NG3: No automatic installation into the user’s Sims 4 game Mods folder (v1).
- NG4: No multi-vault merging (v1 supports a single TS4Rebels vault per JPE profile).

### 2.3 Hard Constraints (C)
- C1: All failures must surface via the JPE diagnostics layer; never rely on raw stack traces.
- C2: Outputs must be written into new folders under the JPE project path; never overwrite inputs.
- C3: Must integrate via the JPE `plugins/` system (plugin loader, schema, lifecycle hooks).
- C4: Must remain compatible with JPE core parsing and generation pipeline (XML→IR→JPE/JPE-XML and back).

---

## 3. Personas & Primary Use Cases

### 3.1 Personas
**P1 — Curator (Vault Maintainer)** — 1,000+ mods; needs grouping/filtering and safe batch ops.  
**P2 — Tweaker (Mod Editor)** — relies on validation and diagnostics quality.  
**P3 — Support Operator (Troubleshooter)** — needs issue tracking + privacy-safe exports.

### 3.2 Primary Use Cases (U)
U1 Configure vault • U2 Full scan + index • U3 Incremental scan • U4 Bulk translate • U5 Review diagnostics/conflicts  
U6 Issue lifecycle + notes • U7 Export issue bundles • U8 Compare run snapshots

---

## 4. Product Surface Areas

### 4.1 Surfaces
- Desktop UI (JPE Studio): Vault Overview, Mods Table, Mod Detail, CRM Issues, Settings.
- CLI integration: headless scanning/translation/export.
- Plugin storage: index, issues, runs, cache, logs, exports.

### 4.2 Operating Modes
- Normal Mode: writes translation outputs + stores diagnostics.
- Dry Run: parses/validates/diagnoses only; no translation outputs written.
- Safe Export Mode: export bundles with enforced privacy redaction rules.

---

## 5. Functional Requirements

### 5.1 Configuration & Settings

#### FR-001 — Vault Path
- User sets an absolute directory path as TS4Rebels vault.
- Validate: exists, is directory, readable, not equal to any JPE-managed output directory.
- Store: `plugins.ts4rebels.vault_path`.

#### FR-002 — Vault Structure Preset
Enum: `flat`, `by_creator`, `by_pack`, `mixed`.

#### FR-003 — Manifests
- Attach 0..N manifests. Supported: JSON, CSV.
- Load errors produce structured diagnostics (no crashes).

Required keys per entry:
- `file_name` (string)
- `creator` (string)
- `category` (enum; see Categories below)
- `source_url` (string; may be empty string but must exist)

Optional keys:
- `tags` (array|string)
- `pack` (string)
- `collection` (string)
- `version` (string)
- `notes` (string)
- `sha256` (string; enables exact hash match)

Categories enum:
- CAS, BuildBuy, Gameplay, Overhaul, Utility, Animation, Careers, Traits, Interactions, Aspirations, Other

#### FR-004 — Conflict Ruleset
Enum: `conservative`, `balanced`, `aggressive`.

Thresholds:
- Conservative: warn >= 80, error >= 95
- Balanced: warn >= 65, error >= 85
- Aggressive: warn >= 50, error >= 75

#### FR-005 — Privacy Controls
- `redact_local_paths_in_exports` (default true)
- `redact_username_in_exports` (default true)
- `exclude_non_ts4rebels_mods_from_exports` (default true)

Redaction rules are mandatory for exports and apply to:
- issue evidence strings
- exported run reports
- exported file references

#### FR-006 — Retention Policy
`diagnostics_retention_days` integer: default 30, min 1, max 365.

---

### 5.2 Vault Indexing

#### FR-010 — Full Scan
- Recursive scan under vault root.
- Supported file types: `.package`, `.ts4script`, `.py`, `.xml`, `.stbl` (as surfaced by core extractors).
- Produces: updated index store + run report + diagnostics.

#### FR-011 — Incremental Scan
- Detect new/changed/deleted files using mtime+size and optional hashing.
- Background job with progress + cancel.

#### FR-012 — Fingerprinting
- Always store size + mtime.
- Store sha256 when computed.
- Hash strategy: eager for <256MB files; on-demand otherwise.

#### FR-013 — Mod Grouping
Deterministic grouping order:
1) manifest grouping via `collection` or `pack`
2) top-level folder group key
3) flat-mode filename-prefix heuristic (min prefix 8 chars; delimiters: `- _ . space`)

---

### 5.3 Metadata Enrichment

#### FR-020 — Deterministic Merge
Manifest order is authoritative: last wins on conflicts.

Matching order:
1) exact filename
2) punctuation/space-insensitive filename
3) sha256 match (if provided)

#### FR-021 — Normalization
- Creator: trimmed, whitespace-collapsed, and stored as (display, slug).
- Tags: trimmed, indexed lowercase, display preserved, deduplicated.
- Source URL: validated; malformed creates warning.

#### FR-022 — Completeness Flag
`metadata_completeness`: complete|partial|missing.

---

### 5.4 Translation Orchestration

#### FR-030 — Batch Translate
- Uses JPE core pipeline (extract → IR → generate JPE + JPE-XML → validate).
- Writes outputs into JPE-managed folders only.
- Records per-mod status + diagnostics.

Output structure (canonical):
- `{JPE_PROJECT_ROOT}/projects/{project_id}/ts4rebels/{mod_id}/jpe/`
- `{JPE_PROJECT_ROOT}/projects/{project_id}/ts4rebels/{mod_id}/jpe-xml/`
- `{JPE_PROJECT_ROOT}/projects/{project_id}/ts4rebels/{mod_id}/reports/`
- `{JPE_PROJECT_ROOT}/projects/{project_id}/ts4rebels/{mod_id}/artifacts/`

#### FR-031 — Dry Run
- Produces only a report: `{...}/reports/dry-run/`.

#### FR-032 — Status Enum
not_translated | translated | partial | failed

#### FR-033 — Cancellation & Resume
- Cancel marks run as cancelled; preserves completed outputs.
- Resume re-runs failed/not_translated unless forced.

---

### 5.5 Conflict Detection

#### FR-040 — Signals
- tuning ID collisions
- resource key collisions (exclusive types)
- script module collisions

#### FR-041 — Score (0..100)
- +60 tuning collision
- +25 resource collision
- +15 script collision
- cap 100

#### FR-042 — Presentation
Badges in Mods Table + per-mod conflict panel + CRM issues category `Conflict`.

---

### 5.6 Diagnostics & CRM

#### FR-050 — Structured Diagnostics Only
- All failures surface through diagnostics objects (human-friendly + machine-readable).
- UI never displays raw stack traces by default.

#### FR-051 — Issue Model (Required)
- `issue_id` (ULID)
- `mod_id`
- `severity`: critical|major|minor|info
- `status`: open|in_review|resolved|wont_fix
- `category`: Configuration|Scan|Manifest|Translation|Validation|Conflict|Export
- `summary` (<= 140 chars)
- `details` (markdown-capable)
- timestamps
- evidence references (relative paths only)
- plugin + core versions

#### FR-052 — Lifecycle Ops
Update status, add note, mark duplicate, link evidence.

#### FR-053 — Run Reports
Every scan/translation/export produces a run record and is pruned by retention policy.

---

### 5.7 Export System

#### FR-060 — Formats
Markdown, JSON.

#### FR-061 — Required Bundle Contents
- version info (plugin + core)
- vault structure preset
- mod summaries + file lists (relative)
- issues + sanitized evidence

#### FR-062 — Safety
- apply redaction rules
- never include full contents
- snippet limits: <= 20 lines AND <= 2KB per snippet

---

## 6. UX Requirements (Desktop)

### Screen A — Vault Overview
Status card + metrics + scan actions + progress/cancel + error-to-issues path.

### Screen B — Mods Table
Virtualized table, full sort/filter/search, bulk actions, conflict + issue badges.

### Screen C — Mod Detail
Summary, files, translate controls, diagnostics teaser, conflicts panel, open outputs (safe).

### Screen D — Issues (CRM)
Two-pane list/detail; filtering; status/notes; export selected.

### Screen E — Settings
Vault picker, structure preset, manifests manager, ruleset selector, retention, privacy toggles, maintenance actions.

---

## 7. Storage & Data

Plugin data root:
- `{JPE_PROJECT_ROOT}/plugins/ts4rebels/`

Subfolders:
- index/ issues/ runs/ cache/ exports/ logs/

Formats:
- SQLite preferred; JSONL fallback; runs as JSON per run id.

Migrations:
- schema versioned; backup old stores; validate post-migration.

---

## 8. Plugin Lifecycle & Integration API

Lifecycle hooks:
- on_startup • on_shutdown • on_config_change • on_scan_requested • on_translation_requested • on_export_requested

Public service API:
- get_vault_summary • list_mods • get_mod • scan • translate • list_issues • get_issue • update_issue • export

Error handling:
- never throw across plugin boundary; always return diagnostics.

---

## 9. Non-Functional Requirements

Performance budgets:
- Full scan (5,000 files) <= 120s
- Incremental scan (<=200 changes) <= 30s
- Filter/search <= 250ms

Reliability:
- single-mod failures do not abort batch
- crash recovery marks run interrupted; index remains consistent

Privacy:
- offline-first; no telemetry by default; exports sanitized

Accessibility:
- keyboard navigable; not color-only; screen-reader labels

---

## 10. QA & Test Plan

Unit tests (minimum):
- config validation • manifest parsing • scanning • grouping • conflict scoring • redaction • export building

Integration tests:
- scan→table • incremental deletions • translation normal/dry • CRM persistence • export correctness

Regression:
- core roundtrip tests (XML↔JPE/JPE-XML) + plugin compatibility matrix

---

## 11. Release Requirements

Release artifacts:
- plugin bundle in plugins/ts4rebels/
- settings_schema.json
- changelog
- migrations (if any)
- test report summary

Release checklist:
- all tests pass
- verify non-destructive writes
- verify export redaction
- meet performance budgets
- docs updated

---

## 12. Acceptance Criteria (Ship Gate)

- Configure vault; validate path
- Full + incremental scan populates stable index
- Bulk translation produces JPE + JPE-XML into managed directories
- Structured diagnostics visible in Problems/CRM
- Issue changes persist
- Conflicts scored consistently
- Exports privacy-safe and complete for support
- Never modifies original vault mod files

---

## Appendix A — Canonical Config JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TS4Rebels Plugin Config",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "vault_path",
    "vault_structure_preset",
    "manifest_paths",
    "diagnostics_retention_days",
    "redact_local_paths_in_exports",
    "redact_username_in_exports",
    "exclude_non_ts4rebels_mods_from_exports",
    "conflict_ruleset"
  ],
  "properties": {
    "vault_path": { "type": "string", "minLength": 1 },
    "vault_structure_preset": {
      "type": "string",
      "enum": ["flat", "by_creator", "by_pack", "mixed"]
    },
    "manifest_paths": {
      "type": "array",
      "items": { "type": "string", "minLength": 1 }
    },
    "diagnostics_retention_days": {
      "type": "integer",
      "minimum": 1,
      "maximum": 365
    },
    "redact_local_paths_in_exports": { "type": "boolean" },
    "redact_username_in_exports": { "type": "boolean" },
    "exclude_non_ts4rebels_mods_from_exports": { "type": "boolean" },
    "conflict_ruleset": {
      "type": "string",
      "enum": ["conservative", "balanced", "aggressive"]
    }
  }
}
```

---
