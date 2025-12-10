# PRD — TS4Rebels Integration Plugin for JPE Sims 4 Mod Translation Suite

## 1. Overview

The TS4Rebels plugin is a first‑class integration module for the JPE Sims 4 Mod Translation Suite.
Its mission is to make TS4Rebels‑sourced mods easy to:
- Discover and index from a user‑configured vault on disk.
- Enrich with creator and source metadata from manifest files.
- Push through the JPE translation pipeline (JPE and JPE‑XML).
- Diagnose and track issues with a Better‑Exceptions‑style CRM view.
- Export sanitized reports for collaboration in TS4Rebels support spaces.

This document defines the **product requirements** for that plugin: behavior, data model, UX, and
acceptance criteria for a shippable v1.

## 2. Background & Context

The JPE Sims 4 Mod Translation Suite is a desktop and CLI toolchain that:
- Reads Sims 4 mod formats (package, ts4script, XML tuning, STBL, script files).
- Translates them into Just Plain English (JPE) and a JPE‑XML fork suitable for game‑ready output.
- Provides diagnostics, conflict detection, and mod organization tools.

TS4Rebels is a community and ecosystem of Sims 4 mod creators and users. Many players maintain
local "TS4Rebels" mod folders or vaults that mirror collections, creators, or curated lists.

The plugin sits in the JPE `plugins/` layer and focuses specifically on integrating those local
TS4Rebels‑style vaults. It does **not** host, scrape, or mirror TS4Rebels content; it operates on
the user's local files and user‑provided metadata only.

### 2.1 Goals

- G1: Provide a dedicated **TS4Rebels Vault** experience inside JPE.
- G2: Make it trivial to run bulk translations on TS4Rebels‑sourced mods.
- G3: Attach Better‑Exceptions‑style diagnostics and CRM tracking to each mod.
- G4: Offer clean, privacy‑safe exports suitable for TS4Rebels forum/Discord troubleshooting.
- G5: Stay fully compatible with the JPE core SOP, style guidelines, and security model.

### 2.2 Success Metrics

- M1: A user can configure a vault, scan it, and see a complete mod list in under 3 minutes.
- M2: Translating a batch of 50 typical TS4Rebels mods completes without unhandled errors.
- M3: At least 90% of translation failures surface with actionable diagnostics, not generic errors.
- M4: Exported reports contain no absolute filesystem paths or OS usernames.
- M5: No original mod file is ever modified by plugin operations.

## 3. Target Users & Use Cases

### 3.1 Primary User Personas

- **P1 – Power Mod User / Curator**
  - Maintains a large TS4Rebels‑style mods folder.
  - Wants to understand what each mod does in plain English.
  - Needs tooling to organize, triage, and clean up conflicts.

- **P2 – Mod Author / Tweaker**
  - Writes or edits TS4Rebels‑adjacent mods.
  - Uses JPE to inspect tuning, spot errors, and refine behavior.
  - Wants enriched diagnostics and structured exports to share with collaborators.

- **P3 – Support Operator / Troubleshooter**
  - Helps others diagnose broken mod setups.
  - Uses the CRM dashboard to track issues per mod and version.
  - Relies on privacy‑safe exports to request help on TS4Rebels or similar communities.

### 3.2 Core Use Cases

- U1: Configure a TS4Rebels vault path and structure preset.
- U2: Scan the vault and build an index of all mods and their files.
- U3: Enrich that index using one or more metadata manifest files.
- U4: Run a bulk translation of selected mods into JPE/JPE‑XML.
- U5: View diagnostics per mod in a CRM‑style dashboard.
- U6: Export a formatted issue bundle for posting on TS4Rebels support channels.
- U7: Run incremental scans as new mods are added or updated.
- U8: Review conflict warnings for overlapping tuning IDs or resources.

## 4. Product Scope

### 4.1 In Scope (v1)

- Single‑vault TS4Rebels integration (one primary TS4Rebels vault per user profile).
- Configurable vault path and structure preset.
- Support for TS4 mod file types already handled by JPE core:
  - .package
  - .ts4script
  - .py script files within TS4Script bundles
  - XML tuning files
  - STBL resources when exposed by core extractors
- Manifest ingestion:
  - JSON and CSV manifests describing creator, category, tags, and TS4Rebels links.
- Vault index storage in a structured plugin‑local database or JSON bundle.
- Deep integration with JPE translation pipeline for JPE/JPE‑XML output.
- Diagnostics and CRM view for TS4Rebels mods.
- Privacy‑aware exports.

### 4.2 Out of Scope (v1)

- Multiple TS4Rebels vaults per user profile (may be added later).
- Direct HTTP/API integration with TS4Rebels infrastructure.
- Automatic installation or removal of mods in the Sims 4 game folder.
- Any remote telemetry beyond local logs (the plugin is designed for offline use).

## 5. Functional Requirements

### 5.1 Configuration & Settings

**FR‑1: TS4Rebels Vault Path**  
- The user must be able to set an absolute directory path as the TS4Rebels vault.
- The UI must validate existence and readability of the path.
- The plugin must not scan outside that root path.

**FR‑2: Vault Structure Preset**
- The user must be able to select a structure preset from:
  - `flat` – mods all in one folder.
  - `by_creator` – primary folders are mod creators.
  - `by_pack` – primary folders represent mod packs or collections.
  - `mixed` – heuristic detection from folder and manifest data.
- The preset drives how folder segments map to `creator`, `pack`, or `category` fields.

**FR‑3: Metadata Manifest Configuration**
- The user must be able to add one or more manifest files.
- Supported formats:
  - JSON with an array or map of entries.
  - CSV with a header row.
- Required manifest fields:
  - `file_name` (base filename or pattern).
  - `creator`.
  - `category` (e.g., CAS, BuildBuy, Gameplay, Overhaul).
  - `source_url` (TS4Rebels link or equivalent).
- Optional manifest fields:
  - `tags` (comma‑separated or array).
  - `pack` or `collection` name.

**FR‑4: Diagnostics Retention & Privacy Settings**
- The user must be able to set a diagnostics retention duration (in days).
- The plugin must support boolean options:
  - `redact_local_paths_in_exports`.
  - `redact_username_in_exports`.
  - `exclude_non_ts4rebels_mods_from_exports`.

### 5.2 Vault Indexing

**FR‑5: Full Scan**
- The plugin shall perform a full recursive scan of the configured vault path.
- It shall detect and index:
  - .package files.
  - .ts4script files and bundled scripts.
  - XML tuning and STBL data exposed by core extractors.
- For each file, the index shall record:
  - Internal plugin ID.
  - Relative path from vault root.
  - File size.
  - Last modified timestamp.
  - Detected file type.
  - Associated mod ID (grouping multiple files under one logical mod).

**FR‑6: Incremental Scan**
- The plugin shall support incremental scans that update only changed or new files.
- It must detect and remove entries for deleted files.

**FR‑7: Mod Grouping**
- The plugin shall group files into logical "mods" based on:
  - Folder structure.
  - Manifest entries.
  - Heuristics (such as shared naming patterns).
- Each mod record must include:
  - Mod ID.
  - Human‑friendly name.
  - Creator.
  - Category.
  - Source URL (if available).
  - File count and file list.

### 5.3 Metadata Enrichment

**FR‑8: Manifest Merge**
- The plugin shall merge manifest data into vault index entries.
- Matching strategy:
  - Primary: exact filename match (excluding path).
  - Secondary: pattern match or hash match where configured.
- When conflicts arise (e.g., multiple manifests disagree):
  - The plugin must select a deterministic winner (e.g., last manifest wins) while logging a warning.

**FR‑9: Metadata Normalization**
- The plugin shall normalize:
  - Creator names (consistent casing, optional slug).
  - Categories (mapped to fixed enums).
  - Tags (tokenized and deduplicated).
- The plugin shall flag entries with incomplete metadata.

### 5.4 Translation Orchestration

**FR‑10: Bulk Translation**
- The plugin shall allow the user to select one or more mods and run a bulk translation.
- For each selected mod:
  - Invoke the JPE core extractors and IR pipeline.
  - Generate JPE and JPE‑XML output under a dedicated project folder (e.g. `projects/<project>/ts4rebels/<mod_id>/`).
  - Record translation results (success, partial, failure) and associate diagnostics.

**FR‑11: Dry Run Mode**
- The plugin shall support a "Dry Run" mode that:
  - Runs parsing, validation, and diagnostics.
  - Does not write any new JPE or XML output files.
  - Is surfaced clearly in the UI.

**FR‑12: Conflict Detection**
- The plugin shall detect and flag likely conflicts between TS4Rebels mods based on:
  - Duplicate tuning IDs.
  - Shared resources where game behavior suggests exclusivity.
- It shall apply a ruleset (`conservative`, `balanced`, `aggressive`) chosen in configuration.
- Flagged conflicts must appear in both:
  - Mod details view.
  - Diagnostics/CRM panel.

### 5.5 Diagnostics & CRM

**FR‑13: Diagnostics Storage**
- The plugin shall store diagnostics entries as structured objects containing at minimum:
  - Issue ID.
  - Timestamp.
  - Severity.
  - Category (e.g., "Translation Error", "Conflict", "Configuration").
  - Short summary.
  - Detailed message.
  - Affected mod ID and file path (relative to vault).
  - Plugin version and JPE core version.

**FR‑14: Issue Lifecycle**
- Diagnostics entries shall be grouped into "issues" with statuses:
  - `open`, `in_review`, `resolved`, `wont_fix`.
- Users shall be able to:
  - Change issue status.
  - Add short notes or comments per issue.

**FR‑15: CRM Dashboard**
- The plugin shall provide a CRM‑style dashboard showing:
  - Total open issues.
  - Open issues by severity.
  - Issues by creator.
  - Issues by category (CAS, Build/Buy, Gameplay, etc.).
- The dashboard shall support filtering by:
  - Severity.
  - Status.
  - Creator.
  - Category.
  - Mod name or ID.

**FR‑16: Export for Support**
- Users shall be able to export a selection of issues as:
  - Markdown or text report for direct pasting.
  - JSON bundle for advanced tooling.
- Exports must respect privacy settings (no absolute paths, usernames, or unrelated mods).

### 5.6 User Interface

**FR‑17: Vault Overview Panel**
- The plugin shall provide a "TS4Rebels Vault" panel with:
  - Vault path.
  - Last full scan time.
  - Total mods.
  - Total files.
  - A scan/rescan button.
  - One‑click navigation to a full mods table.

**FR‑18: Mods Table**
- The mods table shall list one row per mod with columns:
  - Name.
  - Creator.
  - Category.
  - File count.
  - Last updated.
  - Translation status.
  - Issue count.
- The table shall support:
  - Sorting by any visible column.
  - Filtering by creator, category, and translation status.
  - Selection of multiple mods for bulk actions (translate, dry run, export issues).

**FR‑19: Mod Detail View**
- Selecting a mod shall open a detail view showing:
  - Basic info (name, creator, category, tags, source URL).
  - Files list with file type and size.
  - Conflicts affecting that mod.
  - Recent diagnostics for that mod.
  - Buttons to:
    - Run translation.
    - Run dry‑run diagnostics.
    - Open diagnostics in CRM panel.

**FR‑20: CRM Panel**
- The CRM panel shall display issue lists with:
  - Severity badge.
  - Status.
  - Short description.
  - Affected mod.
  - Last updated time.
- Selecting an issue shall show:
  - Full message.
  - Affected files.
  - Suggested next steps where available.
  - Status and note editing controls.

**FR‑21: Settings Panel**
- The settings panel shall allow configuration of:
  - Vault path (with folder picker and validation).
  - Vault structure preset.
  - Manifest file list (add/remove, validation).
  - Diagnostics retention (days).
  - Privacy options (checkboxes).
  - Conflict detection ruleset.

## 6. Data & Domain Model

### 6.1 Core Entities

**Mod**
- `id` (string, unique per vault).
- `name` (string).
- `creator` (string, normalized).
- `category` (enum: CAS, BuildBuy, Gameplay, Overhaul, Utility, Other).
- `pack` (string, optional).
- `source_url` (string, optional).
- `tags` (list of strings).
- `files` (list of FileRef).
- `last_updated` (datetime).
- `translation_status` (enum: not_translated, translated, failed, partial).
- `issue_counts` (map of severity → count).

**FileRef**
- `id` (string).
- `mod_id` (string).
- `relative_path` (string).
- `file_type` (enum: package, ts4script, script, xml, stbl, other).
- `size_bytes` (integer).
- `modified_at` (datetime).
- `resource_ids` (list of strings or numeric IDs where applicable).

**ManifestEntry**
- `file_name` (string).
- `creator` (string).
- `category` (enum).
- `source_url` (string).
- `tags` (list of strings).
- `pack` (string, optional).

**Config**
- `vault_path` (string).
- `vault_structure_preset` (enum).
- `manifest_paths` (list of strings).
- `diagnostics_retention_days` (integer).
- `redact_local_paths_in_exports` (bool).
- `redact_username_in_exports` (bool).
- `exclude_non_ts4rebels_mods_from_exports` (bool).
- `conflict_ruleset` (enum).

**DiagnosticIssue**
- `id` (string).
- `mod_id` (string).
- `severity` (enum: critical, major, minor, info).
- `status` (enum: open, in_review, resolved, wont_fix).
- `category` (string).
- `summary` (string).
- `details` (string).
- `created_at` (datetime).
- `updated_at` (datetime).
- `files` (list of FileRef IDs or paths).
- `plugin_version` (string).
- `jpe_core_version` (string).
- `notes` (list of note objects with author/timestamp/content).

**TranslationRun**
- `id` (string).
- `mod_ids` (list of strings).
- `started_at` (datetime).
- `completed_at` (datetime, optional).
- `mode` (enum: normal, dry_run).
- `results` (map of mod_id → result enum and message).

## 7. User Flows

### 7.1 First‑Time Setup

1. User installs or enables the TS4Rebels plugin in JPE.
2. User opens **Settings → Plugins → TS4Rebels**.
3. User selects vault path via folder picker.
4. Plugin validates the path and reports success or specific errors.
5. User selects vault structure preset.
6. User adds at least one manifest file:
   - Plugin validates file format and required fields.
7. User confirms diagnostics retention and privacy options.
8. User triggers **Full Scan** from the Vault Overview panel.
9. Scan completes and shows:
   - Number of mods.
   - Number of files.
   - Any configuration or manifest warnings.
10. User can open Mods Table and inspect first entries.

### 7.2 Daily Bulk Translation

1. User opens JPE desktop and navigates to **TS4Rebels Vault** panel.
2. User triggers **Incremental Scan**.
3. Plugin updates mods index and highlights new or changed mods.
4. User opens Mods Table and filters by "not translated" or "updated since last run".
5. User selects a batch of mods (10–50 typical size).
6. User clicks **Translate**.
7. Plugin runs translation and updates status per mod.
8. On completion, user can:
   - Inspect diagnostics for failed mods.
   - Open translated JPE/JPE‑XML in the main JPE viewer.

### 7.3 Exporting Diagnostics for Support

1. User opens **CRM panel**.
2. Filters issues to a specific severity or mod set.
3. Selects issues relevant to a support request.
4. Clicks **Export for Support**.
5. Chooses export format (Markdown or JSON).
6. Plugin applies privacy redaction rules.
7. Plugin saves export file or copies content to clipboard.
8. User pastes or uploads the export into a TS4Rebels support channel.

## 8. Integration & APIs

### 8.1 Plugin Registration

- The plugin must register with the JPE plugin loader via a defined interface, providing:
  - Plugin name: `ts4rebels`.
  - Version string.
  - Configuration schema.
  - Hooks for:
    - `on_startup`.
    - `on_config_change`.
    - `on_scan_requested`.
    - `on_translation_requested`.

### 8.2 Core Services Used

- File system abstraction from JPE core (for consistent path handling).
- Mod parsing and IR pipeline (no reimplementation of parsers).
- Diagnostics service (for standardized error objects).
- UI framework used by the JPE desktop app.

### 8.3 Public API Surface

The plugin must expose internal functions for use by other JPE components:

- `get_vault_summary() → VaultSummary`
- `list_mods(filters) → list[Mod]`
- `get_mod_details(mod_id) → Mod`
- `run_scan(mode) → ScanResult`
- `run_translation(mod_ids, mode) → TranslationRun`
- `list_issues(filters) → list[DiagnosticIssue]`
- `export_issues(issue_ids, format, privacy_config) → ExportResult`

## 9. Performance & Reliability Requirements

- The plugin shall be able to index:
  - At least 5,000 mod files in under 2 minutes on a mid‑range machine.
- Incremental scans must complete within 30 seconds for small changes.
- Bulk translations:
  - When running on a batch of 50 mid‑sized mods, typical runtime should be manageable for desktop use; progress must be visible and cancellable.
- Long‑running operations (scan, translation) must be cancellable from the UI.
- Failures in individual mods must not abort the entire batch; they should be recorded as failed while other mods proceed.

## 10. Security & Privacy Requirements

- The plugin must never modify original mod files in the TS4Rebels vault.
- All writes must occur in JPE‑managed output or cache directories.
- Exports must respect configured redaction settings.
- No external network connections are required or initiated by the plugin.
- Logs must not contain OS usernames or absolute paths when a redaction setting is enabled.
- Sensitive error details may be stored locally for troubleshooting, but not exported by default.

## 11. Logging & Observability

- All major operations (scan start/end, translation start/end, export) must be logged.
- Logs must include:
  - Timestamp.
  - Operation type.
  - Counts (mods scanned, mods translated, issues exported).
  - High‑level outcome (success, partial, failure).
- Logs should be rotated with a size or count limit to avoid unbounded growth.

## 12. Testing & QA

### 12.1 Unit Tests

- Vault indexer:
  - Directory traversal.
  - File filtering.
  - Index structure correctness.
- Manifest merge:
  - Correct mapping of filenames to manifest entries.
  - Conflict resolution logic.
- Config validation:
  - Valid/invalid paths and manifest files.
  - Enum and boolean settings.

### 12.2 Integration Tests

- Full scan on a synthetic TS4Rebels‑style vault (~50–100 mods).
- Bulk translation and diagnostics on the same vault.
- Conflict detection test with intentionally overlapping tuning IDs.
- Export tests verifying privacy redaction behavior.

### 12.3 UI Tests

- Manual verification of first‑time setup flow.
- Manual verification of daily bulk translation flow.
- Manual verification of diagnostics export flow.
- Optional automated UI tests where the JPE UI framework supports it.

## 13. Release & Versioning

- Plugin versioning must follow semantic versioning: MAJOR.MINOR.PATCH.
- Each release must specify:
  - Minimum required JPE core version.
  - Sims 4 patch versions used for testing.
- Release notes must include:
  - New features.
  - Bug fixes.
  - Known issues and limitations.

## 14. Acceptance Criteria Summary

- A user can:
  - Configure a vault path and structure preset.
  - Attach at least one manifest file.
  - Run a full scan and see a populated mods table.
  - Run a bulk translation on a subset of mods.
  - View mod‑specific diagnostics.
  - Export an issue bundle without leaking local paths or usernames.
- Tests described in Section 12 are implemented and passing.
- No original mod file is altered by any plugin operation.
- All documented flows are accessible from the JPE desktop interface.
