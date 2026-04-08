# JPE BetterExceptions Integration Specification (PIS)

## Project: JPE Sims 4 Mod Translation Suite

## Document Type: Product Integration Specification (PIS)

## Version: 1.0

## Date: 2026-03-09

------------------------------------------------------------------------

# 1. Purpose

This Product Integration Specification defines the architecture,
behavior, and operational requirements for the **BetterExceptions
subsystem inside JPE Studio**.

The goal is to transform raw Sims 4 exception data, crash logs, and
tuning errors into:

-   Human-readable diagnostics
-   Actionable mod conflict reports
-   Source-level debugging insights
-   Automated repair suggestions
-   Structured telemetry for the JPE ecosystem

This subsystem expands upon the philosophy of the Better Exceptions
debugging model by turning game crashes into structured engineering data
that both **mod developers and casual users can understand**.

The system acts as a **diagnostic bridge between the Sims 4 runtime and
JPE's translation engine**.

------------------------------------------------------------------------

# 2. Goals

Primary goals:

1.  Convert raw Sims 4 exception logs into structured diagnostic
    objects.
2.  Identify the **mod responsible for a crash or tuning conflict**.
3.  Map crash locations back to:
    -   XML tuning
    -   JPE source files
    -   STBL localization entries
4.  Provide **human-readable explanations of the issue**.
5.  Suggest **automated repair strategies** where possible.
6.  Integrate diagnostics with:
    -   JPE Studio Desktop UI
    -   JPE Mobile Companion
    -   CLI build pipeline
7.  Provide **machine-readable outputs** for automated CI validation.

------------------------------------------------------------------------

# 3. Scope

The BetterExceptions subsystem supports analysis of:

• LastException.txt\
• LastUIException.txt\
• LastCrash.txt\
• Script errors (.ts4script/.py)\
• Tuning resolution failures\
• XML schema mismatches\
• Mod load-order conflicts\
• Localization errors\
• Broken references between tuning resources

Out of scope:

• Reverse engineering compiled EA binaries\
• Editing save files\
• Runtime patch injection into the Sims 4 executable

------------------------------------------------------------------------

# 4. High-Level Architecture

BetterExceptions inside JPE operates as a **five-stage analysis
pipeline**.

Stage 1 --- Log Acquisition\
Stage 2 --- Exception Parsing\
Stage 3 --- Dependency Mapping\
Stage 4 --- Root Cause Analysis\
Stage 5 --- Diagnostic Rendering

Architecture Diagram:

Game Logs ↓ Exception Parser ↓ Structured Exception Model ↓ Mod
Resolution Engine ↓ Dependency Graph Analyzer ↓ Root Cause Engine ↓
Human Readable Diagnostics ↓ UI + Reports + JSON

------------------------------------------------------------------------

# 5. Core Components

## 5.1 Exception Collector

Responsible for locating and ingesting runtime exception files.

Watched directories:

Documents/Electronic Arts/The Sims 4/

Supported patterns:

LastException*.txt\
LastUIException*.txt\
LastCrash\*.txt

Capabilities:

• Automatic detection of new crash logs\
• Manual import of archived logs\
• Batch ingestion for large debugging sessions

Outputs:

RawExceptionDocument

------------------------------------------------------------------------

## 5.2 Exception Parser

Transforms raw crash logs into structured objects.

Input:

RawExceptionDocument

Output:

ExceptionObject

Fields:

timestamp\
error_type\
stack_trace\
script_module\
function_name\
line_number\
exception_message\
game_version

Parsing Strategy:

Regex + structured token extraction + Python stack interpretation.

------------------------------------------------------------------------

## 5.3 Mod Resolution Engine

Identifies which mod file triggered the exception.

This engine correlates:

Stack trace modules\
Package resources\
Script file paths

Resolution methods:

1.  File hash lookup
2.  Package resource ID lookup
3.  Script module namespace matching
4.  STBL reference correlation

Output:

ModIdentificationResult

Fields:

mod_name\
mod_author\
mod_version\
file_path\
package_guid\
confidence_score

------------------------------------------------------------------------

## 5.4 Dependency Graph Analyzer

Constructs a directed graph of mod dependencies.

Nodes:

Mods\
Tuning files\
Scripts\
Localization tables

Edges:

imports\
references\
overrides\
loot actions\
buff triggers

This graph allows the system to detect:

• cascading failures\
• conflicting overrides\
• circular dependencies

Output:

DependencyGraph

------------------------------------------------------------------------

## 5.5 Root Cause Engine

Determines **the most probable cause of the crash**.

Analysis techniques:

• stack trace ranking\
• dependency traversal\
• resource override comparison\
• schema validation failures

Example root causes:

Missing tuning reference\
Script attribute mismatch\
Invalid enum value\
Broken loot action\
Conflicting mod override

Output:

RootCauseReport

------------------------------------------------------------------------

# 6. Diagnostic Output Model

Diagnostics are stored in a structured format.

DiagnosticReport

Fields:

report_id\
timestamp\
game_patch_version\
error_summary\
suspected_mods\
root_cause\
stack_trace\
affected_resources\
recommended_fixes\
confidence_score

Severity levels:

INFO\
WARNING\
ERROR\
CRITICAL

------------------------------------------------------------------------

# 7. JPE Source Mapping

One of the most powerful features of the system is the ability to map
errors back to **JPE source code**.

Mapping process:

XML tuning → IR → JPE Source

Example:

Exception: AttributeError in interaction tuning

Mapped JPE Source:

interaction cook_grilled_cheese requires stove adds buff happy_cooked

The editor will highlight the exact source location.

------------------------------------------------------------------------

# 8. Automated Fix Suggestions

The system can recommend repair strategies.

Example cases:

Missing resource Suggested fix: Recompile JPE project with dependency
package included.

Invalid enum Suggested fix: Replace enum value with valid entry from
game schema.

Broken localization Suggested fix: Add missing STBL entry.

------------------------------------------------------------------------

# 9. Desktop UI Integration

Inside JPE Studio the BetterExceptions system appears as:

Diagnostics Panel

Sections:

Crash Overview\
Affected Mods\
Dependency Graph\
Stack Trace\
Suggested Fixes

Features:

Clickable stack traces\
Jump to source file\
Dependency graph visualization\
One-click mod isolation testing

------------------------------------------------------------------------

# 10. Mobile Companion Integration

The iOS JPE companion app supports:

• viewing crash reports • receiving push notifications for new
exceptions • remote log uploads • quick diagnostic summaries

Mobile mode focuses on **read-only debugging**.

------------------------------------------------------------------------

# 11. CLI Integration

JPE CLI supports automated diagnostics.

Example command:

jpe diagnose --logs ./logs

Output:

diagnostics.json diagnostics.md

CI systems can block builds if **critical issues are detected**.

------------------------------------------------------------------------

# 12. Plugin System

BetterExceptions supports plugin analyzers.

Example plugins:

Career tuning analyzer\
Interaction conflict analyzer\
Animation state machine validator\
STBL localization checker

Plugins register via:

plugins/diagnostics/

Interface:

DiagnosticPlugin

Required methods:

analyze(exception_object)\
generate_report()

------------------------------------------------------------------------

# 13. Performance Requirements

Target processing speed:

Single log analysis: \< 2 seconds

Large batch (100 logs): \< 30 seconds

Memory usage:

\< 300MB typical workload

------------------------------------------------------------------------

# 14. Security Considerations

The subsystem must:

• never execute arbitrary mod scripts • sandbox log parsing • validate
all file inputs • prevent path traversal attacks

------------------------------------------------------------------------

# 15. Telemetry and Analytics

Anonymous telemetry can track:

most common crash types\
most problematic mods\
patch compatibility issues

This data helps improve JPE diagnostics over time.

------------------------------------------------------------------------

# 16. Testing Strategy

Testing includes:

Unit tests

Parser correctness\
stack trace extraction

Integration tests

mod resolution accuracy\
dependency graph generation

Regression tests

known crash logs from real mod sets

------------------------------------------------------------------------

# 17. Failure Handling

If diagnostics fail:

System falls back to:

Raw log viewer

This ensures users always have access to the original crash data.

------------------------------------------------------------------------

# 18. Future Enhancements

Planned upgrades include:

AI-assisted root cause analysis\
automatic mod conflict isolation\
self-healing tuning patches\
community crash signature database

------------------------------------------------------------------------

# 19. Deliverables

The BetterExceptions subsystem must ship with:

core/diagnostics/ core/exception_parser/ core/mod_resolver/
core/dependency_graph/

desktop UI diagnostics panel

CLI diagnostic tool

documentation and crash analysis guides

------------------------------------------------------------------------

# 20. Conclusion

The BetterExceptions subsystem transforms chaotic crash logs into
structured engineering insight.

Instead of forcing modders to decode cryptic Python errors, JPE
provides:

• clear explanations\
• exact source mapping\
• actionable fixes

This dramatically reduces debugging time and enables **a new generation
of accessible Sims 4 mod development**.
