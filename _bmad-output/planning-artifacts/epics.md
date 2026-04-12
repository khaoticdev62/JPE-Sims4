---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: [
  "docs/BMAD_MASTER_SCOPE_PLAN.md",
  "docs/ARCHITECTURE_DESIGN_PRD01_03.md",
  "docs/JPE_STUDIO_EDITOR_FRONTEND_SPEC.md",
  "docs/JPE_STUDIO_EDITOR_JPE_COMPONENTS_SPEC.md",
  "docs/JPE_Sims4_Translation_Suite_MVP_v0_1_IMPLEMENTATION.md"
]
---

## Overview

This document provides the complete epic and story breakdown for JPE Mod Translator 2.0, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Format Support - XML, .stbl, .ts4script, .package, .cfg, .json (P0)
FR2: Translation Accuracy - 100% of sample mods -> valid Sims 4 formats (P0)
FR3: Parser Efficiency - Compile < 5 seconds for typical mod (P0)
FR4: Error Detection - Catch 95%+ of common mod errors (P1)
FR5: JPE Grammar - Formal human-readable syntax (WHEN/DO/ONLY_IF) (P0)
FR6: JPE -> XML Parser (P0)
FR7: XML -> JPE Reverse Compiler (P0)
FR8: Multi-tab Editor - React components for editing (P0)
FR9: Project Explorer - Sidebar with folder structure and file icons (P0)
| FR11: Search and replace - Pattern matching and global refactoring (P1)
| FR12: Undo/redo - History management and keyboard interaction (P1)
FR10: Real-time Validation - Syntax/Semantic check with highlights (P1)
FR11: Live Preview - Real-time XML transformation and display (P1)
FR12: In-app Tutorial - Interactive walkthrough (P1)
FR13: Mod Elements Browser - Categorized lists (Interactions/Buffs/Traits) (P2)

FR21: Automated "JPE-Live" script-mod setup (P0)
FR22: Live alert human-readable translation (P0)
FR23: Power Toggle for Engine Link (P1)
FR24: Direct communication status glow (P1)
FR25: "Audio Scrubbing" interaction feedback (P1)
FR26: "Haptic Heartbeat" background telemetry (P1)
FR27: Reactive "Bioluminescent" visual pulses (P1)
FR28: "Spectral Success Chords" (P1)
FR29: Global "Sensory Master" slider (P2)

### NonFunctional Requirements

NFR1: Performance - UI updates < 16ms (60fps), suggestions < 100ms (P0)
NFR2: Platform Support - Windows 10+, macOS 10.13+ (P0)
NFR3: Aesthetics - Deep dark mode (#1e293b base), Apple TV-style depth effects (P1)
NFR4: Accessibility - WCAG 2.1 AA compliance (P2)
NFR5: Reliability - Auto-save and project state recovery (P1)
NFR6: Scalability - Handle 10K+ concurrent users (v2.0+) (P3)
NFR7: Memory Optimization - Lazy loading for large projects (P2)

### Additional Requirements

- Use Electron 26+, React 18+, TypeScript 5.2+, Zustand 4.4+, Tailwind CSS 3.4+, Vite 5+
- Implement Layered Architecture (IPC, React, Zustand, Services, Engine, Parsers)
- Support Unit, Integration, and E2E testing using Jest/RTL
- Ensure 100% round-trip conversion accuracy (XML -> JPE -> XML)

### UX Design Requirements

UX-DR1: Primary Background: #151A24 (Brand Dark), Accent: #2EC4B6 (Teal)
UX-DR2: Typography: Outfit (13px) for UI, Fira Code (14px) for editor
UX-DR3: Icon System: Standard icons for Actions/Status; unique icons for Interactions/Buffs/Traits
UX-DR4: Interface: Three-panel layout (Sidebar, Main Editor, Preview Panel)
UX-DR5: Motion: 200-400ms transitions for UI state changes; reactive bioluminescent glows

### FR Coverage Map

FR1: Epic 2 - Base formats, Epic 4 - Advanced formats
FR2: Epic 2 - Translation accuracy
FR3: Epic 4 - Parser efficiency
FR4: Epic 3 - Error detection
FR5: Epic 2 - JPE Grammar
FR6: Epic 2 - JPE -> XML Parser
FR7: Epic 4 - XML -> JPE Reverse Compiler
FR8: Epic 1 - Multi-tab Editor layout
FR9: Epic 1 - Project Explorer
FR10: Epic 3 - Real-time Validation
FR11: Epic 3 - Live Preview
FR12: Epic 5 - In-app Tutorial
FR13: Epic 1 - Mod Elements Browser
FR21, FR22, FR23, FR24: Epic 9 - JPE-Live Synchronization
FR25, FR26, FR27, FR28, FR29: Epic 10 - Sensory Studio Environment

## Epic List

### Epic 1: Project & Workspace Foundation
Users can initialize/open modding projects, browse files via a professional tree view, and experience the premium IDE shell.
**FRs covered:** FR8, FR9, FR13

### Epic 2: Core JPE Translation & Editing
Users can write "Just Plain English" logic with syntax highlighting and perform 100% accurate translations to Sims 4 XML.
**FRs covered:** FR1 (Base), FR2, FR5, FR6

### Epic 3: Real-Time Intelligence & Live Preview
Users receive instant validation feedback and see a synchronized live XML preview, removing the "compile and check" loop.
**FRs covered:** FR4, FR10, FR11

### Epic 4: Advanced Modding & Reverse Engineering
Users can decompile existing mods back into JPE and work with complex formats like .package and .ts4script.
**FRs covered:** FR1 (Advanced), FR3, FR7, CC-Support

### Epic 7: Mod Management & Workspace Utilities
Professional utilities to organize, deduplicate, and optimize the Sims 4 Mods folder for maximum project stability.
**FRs covered:** Workspace-Optimization, FR9 (Enhanced)

### Epic 5: Interactive Onboarding & Accessibility
New modders can master the tool via a built-in interactive tutorial, with full WCAG 2.1 AA accessibility support.
**FRs covered:** FR12

### Epic 6: AI-Assisted Modding & Predictive Scripting
Automate mod creation and detect logical conflicts using multi-model AI (OpenAI, Claude, Qwen).
**FRs covered:** FR26, FR10, FR11, FR4

### Epic 9: JPE-Live Synchronization Bridge
Establish a real-time bi-directional link between JPE Studio and the Sims 4 Engine for live diagnostics.
**FRs covered:** FR21, FR22, FR23, FR24

### Epic 10: Sensory Studio Environment
Implement the "Living Brand" audio-tactile layer for high-fidelity user feedback.
**FRs covered:** FR25, FR26, FR27, FR28, FR29


## Epic 1: Project & Workspace Foundation

Users can initialize/open modding projects, browse files via a professional tree view, and experience the premium IDE shell.

### Story 1.1: Core IDE Shell & Three-Panel Layout

As a Modder,
I want a structured three-panel interface,
So that I can manage projects, edit files, and see previews simultaneously.

**Acceptance Criteria:**

**Given** an Electron window environment
**When** the application is launched
**Then** I see the primary three-panel grid (Sidebar, Editor, Preview)
**And** each panel is resizable using draggables
**And** the layout adapts to window resizing without breaking components.

### Story 1.2: Project Explorer & File System Integration

As a Modder,
I want to browse my project files in a collapsible tree view,
So that I can easily find and open the mod files I'm working on.

**Acceptance Criteria:**

**Given** a selected local project folder
**When** the Project Explorer is active
**Then** I see a nested tree of all supported files (.xml, .stbl, .jpe)
**And** I can expand and collapse individual directories
**And** the file icons reflect the file type (XML, JPE, Folders).

### Story 1.3: Multi-Tab Editor System

As a Modder,
I want to open multiple files in tabs,
So that I can switch between different parts of my mod without losing my place.

**Acceptance Criteria:**

**Given** the Editor Pane is active
**When** I select files from the Project Explorer
**Then** each file opens in its own tab
**And** a dot indicator appears when a tab has unsaved changes
**And** I can close tabs using a close [x] button.

### Story 1.4: Mod Elements Browser

As a Modder,
I want to see a categorized list of my mod components,
So that I can quickly jump to specific game logic elements.

**Acceptance Criteria:**

**Given** a project containing Sims 4 mod files
**When** I switch to the Mod Elements sub-view
**Then** I see files grouped by "Interactions," "Buffs," and "Traits"
**And** the category counts update automatically
**And** a search bar identifies elements by name within categories.

### Story 1.5: Design System & Premium Aesthetics

As a Modder,
I want a high-fidelity dark-themed environment with smooth transitions,
So that my workspace feels professional and reduces eye strain.

**Acceptance Criteria:**

**Given** any UI interaction (panel toggle, tab switch)
**When** the visual state changes
**Then** I see the #151A24 Brand-Dark color scheme applied with #2EC4B6 Teal accents
**And** typography uses Outfit for UI and Fira Code for code editor
**And** all transitions/hover effects use a 200ms-400ms ease animation with subtle bioluminescent glows
**And** the UI emits a "Spectral Pulse" on critical state changes to reinforce the sensory brand.

### Story 1.6: Editor Productivity - Search & Global Replace

As a Modder,
I want to search for text patterns and perform global replacements across my project,
So that I can refactor my mod logic efficiently.

**Acceptance Criteria:**

**Given** the Search panel is active (Ctrl+F for file, Ctrl+Shift+F for project)
**When** I enter a query string or regex pattern
**Then** I see a real-time list of matches in the sidebar or search pane
**And** I can preview replacements on a per-match or global basis
**And** applying a replacement updates all affected files and triggers the validation engine.

### Story 1.7: Editor Productivity - History & Keyboard Controls

As a Modder,
I want a robust undo/redo system and comprehensive keyboard shortcuts,
So that I can work at high speed without friction.

**Acceptance Criteria:**

**Given** the Code Editor context
**When** I perform any destructive action (typing, deletion, refactoring)
**Then** the action is recorded in a 100-step circular undo buffer
**And** I can toggle through history using standard `Ctrl+Z` (Undo) and `Ctrl+Y` (Redo)
**And** all spectral shortcuts defined in the Frontend Spec (Section 5.1) are functional.


## Epic 2: Core JPE Translation & Editing

Users can write "Just Plain English" logic with syntax highlighting and perform 100% accurate translations to Sims 4 XML.

### Story 2.1: Semantic Syntax Intelligence

As a Modder,
I want the editor to understand the WHEN/DO/ONLY_IF syntax and mod logic,
So that I can see my errors accurately and get intelligent code hints.

**Acceptance Criteria:**

**Given** a JPE source string in the editor
**When** I enter JPE keywords (WHEN, DO, ONLY_IF, CONDITIONS)
**Then** the UI provides real-time "Spectral" syntax highlighting
**And** the intelligence engine reports lexical and semantic errors for invalid mod logic
**And** I see a high-level logical summary of the script in the status bar.

### Story 2.2: JPE-to-XML Translation Engine

As a Modder,
I want my JPE code to be converted into Sims 4 XML tuning files,
So that I can see the result in-game.

**Acceptance Criteria:**

**Given** a valid JPE Abstract Syntax Tree (AST)
**When** the translation service is executed
**Then** it maps JPE constructs to Sims 4 XML tuning templates (e.g., <interaction>, <ul>/<test>)
**And** it generates unique, collision-free 64-bit decimal IDs for all mod elements
**And** it preserves all hierarchy and conditional logic in the translated output.

### Story 2.3: STBL (String Table) Parser & Editing

As a Modder,
I want to edit localized strings within my JPE code,
So that my mod supports multiple languages.

**Acceptance Criteria:**

**Given** localized strings defined in a JPE file (EN, FR, DE, etc.)
**When** the project is compiled
**Then** it generates binary .stbl files for each defined locale
**And** it calculates the FnV-64 hash for each string entry
**And** it correctly references these hash IDs within the corresponding XML tuning.


### Story 2.6: Nested Condition Prototype (Spike)

As a Modder,
I want the translator to handle deeply nested ONLY_IF/WHEN/DO blocks,
So that I can create complex game logic without manually writing XML lists.

**Acceptance Criteria:**

**Given** a JPE file with at least two levels of nested conditional blocks
**When** the prototype translator processes the logic
**Then** it correctly flattens or nests the XML <L> and <V> elements according to Sims 4 Tuning standards
**And** it correctly resolves IDs for nested anonymous test blocks
**And** it prevents property name collisions between parent and child scopes.

### Story 2.4: XML Pretty-Printer & Namespace Validator

As a Modder,
I want the final XML output to be formatted and valid,
So that it meets Sims 4 modding standards.

**Acceptance Criteria:**

**Given** a translated XML object model
**When** the XML compiler runs
**Then** it outputs a pretty-printed XML string with standard 2-space indentation
**And** it includes the required UTF-8 encoding header
**And** all XML namespaces for Sims 4 tuning are correctly declared.

### Story 2.5: High-Fidelity Round-Trip Validation

As a Modder,
I want a validation suite that ensures no data loss during conversion,
So that I can confidently edit existing mods.

**Acceptance Criteria:**

**Given** an existing Sims 4 XML tuning file
**When** I perform a "Decompile to JPE" followed immediately by a "Compile to XML"
**Then** the final XML must be functionally identical to the source
**And** any deviations in data or mod logic between source and result must trigger a critical error.


## Epic 3: Real-Time Intelligence & Live Preview

Users receive instant validation feedback and see a synchronized live XML preview, removing the "compile and check" loop.

### Story 3.1: Debounced "As-You-Type" Validation

As a Modder,
I want to see my errors highlighted while I type,
So that I can fix them without manual compilation.

**Acceptance Criteria:**

**Given** an active JPE editor tab
**When** I modify the code content
**Then** the validation engine triggers with a 300ms typing debounce
**And** syntax errors are highlighted with red squiggly underlines in the editor
**And** the workspace status bar updates with the real-time error/warning count.

### Story 3.2: Synchronized Live XML Preview

As a Modder,
I want a side-by-side XML view that updates in real-time,
So that I can see the final mod structure instantly.

**Acceptance Criteria:**

**Given** the "Live Preview" panel is toggled ON
**When** I modify the JPE source code
**Then** the Preview pane re-renders with the latest XML translation within 200ms
**And** vertical scrolling in the JPE editor synchronously scrolls the XML preview to stay in context.

### Story 3.3: Diagnostics Panel UI

As a Modder,
I want a list of all current errors and warnings in my project,
So that I can fix them efficiently.

**Acceptance Criteria:**

**Given** validation issues exist in the current file
**When** the Diagnostics panel is open
**Then** I see a categorized list (Errors, Warnings, Info) with detailed descriptions
**And** clicking any list item jumps the editor cursor to the exact line and character of the problem.

### Story 3.4: Semantic Intelligence & Reference Checking

As a Modder,
I want the editor to warn me if my mod logic references non-existent elements,
So that my game doesn't crash.

**Acceptance Criteria:**

**Given** a JPE file containing references to other interactions, buffs, or traits
**When** the semantic validator runs during analysis
**Then** it ensures every referenced ID or name is either defined in the project or belongs to a known Sims 4 API set
**And** it reports "Undefined Reference" semantic errors for any missing components.

### Story 3.5: "Suggest Fix" Action Engine

As a Modder,
I want suggested fixes for common errors,
So that I can fix them with a single click.

**Acceptance Criteria:**

**Given** a syntax or semantic error with a known solution
**When** I hover over the error in the editor
**Then** a "Quick Fix" tooltip appears with suggested corrections
**And** clicking a suggestion automatically refactors the source code to the corrected version.


## Epic 4: Advanced Modding & Reverse Engineering

Users can decompile existing mods back into JPE and work with complex formats like .package and .ts4script.

### Story 4.1: XML-to-JPE Reverse Compiler (Decompiler)

As a Modder,
I want to open existing Sims 4 XML mods in the JPE format,
So that I can understand and edit them easily.

**Acceptance Criteria:**

**Given** a valid Sims 4 XML tuning file
**When** the decompiler is executed on the source
**Then** the engine translates the XML hierarchy back into the human-readable JPE format
**And** all logic blocks (WHEN, DO, ONLY_IF, CONDITIONS) are correctly reconstructed
**And** the decompiled JPE is immediately editable with full syntax support.

### Story 4.2: .package File Reader & Asset List

As a Modder,
I want to browse the contents of binary Sims 4 packages,
So that I can edit the tuning and strings they contain.

**Acceptance Criteria:**

**Given** a binary Sims 4 .package file
**When** the package is opened in the Project Explorer
**Then** I see a virtual file structure listing all XML and STBL resources inside
**And** I can select individual resources to open them in the Editor tabs
**And** the IDE handles binary reading without locking the file for other processes.

### Story 4.3: External Reference & "Mod Folder" Indexing

As a Modder,
I want the editor to recognize IDs from my existing mod collection,
So that I can avoid reference errors during development.

**Acceptance Criteria:**

**Given** a set path to the Sims 4 "Mods" directory in the application settings
**When** the workspace initializes
**Then** a background indexer scans the directory for all tuning IDs and names
**And** these IDs become available for the semantic validator to prevent false-positive errors.

### Story 4.4: .ts4script Metadata & Python Integration

As a Modder,
I want to bundle Python scripts with my JPE-compiled mods,
So that I can implement complex game logic or interaction scripts.

**Acceptance Criteria:**

**Given** a project containing .ts4script or .py files
**When** the project build command is executed
**Then** the compiler includes the Python files in the final distributable .package or .zip
**And** the IDE provides a basic Python syntax highlighting profile for those files.

### Story 4.5: High-Performance Parallel Compilation

As a Modder,
I want to compile hundreds of files simultaneously,
So that I can manage large-scale mod overhaul projects.

**Acceptance Criteria:**

**Given** a mod project with 100+ JPE and XML source files
**When** a Build Project command is triggered
**Then** the engine utilizes multi-core processing to execute translation tasks in parallel
**And** the total compilation time for 100 typical files remains under 5 seconds.

### Story 4.6: Custom Content (CC) Resource Support

As a Modder,
I want to browse and manage non-tuning resources in my .package files,
So that I can organize textures and assets alongside my logic.

**Acceptance Criteria:**

**Given** a Sims 4 .package file containing binary assets (PNG, DDS, LRLE)
**When** the package is opened in the Resource Browser
**Then** I see a list of non-tuning resources with their Type, Group, and Instance IDs
**And** selecting an image resource (PNG/DDS) displays a high-fidelity visual preview in the editor pane.


## Epic 7: Mod Management & Workspace Utilities

Professional utilities to organize, deduplicate, and optimize the Sims 4 Mods folder for maximum project stability.

### Story 7.1: Mods Folder Cleanup & Organizer Utility

As a Modder,
I want a professional tool to deduplicate and organize my Sims 4 Mods folder,
So that I can maintain a clean, high-performance mod environment.

**Acceptance Criteria:**

**Given** a set path to the local "Mods" directory
**When** the "Cleanup Scan" is executed
**Then** the utility identifies duplicate files using MD5 hashing and Instance ID comparison
**And** it provides a categorized report of "Duplicates," "Broken Links," and "Orphaned Files"
**And** I can perform a "Safe Move" to relocate identified files to a backup directory.

### Story 7.2: One-Click Mod Update & Manifest Patching

As a Modder,
I want to update my mod versions and patch manifests with a single click,
So that I can maintain my mod portfolio without manual binary rebuilding.

**Acceptance Criteria:**

**Given** a project with an existing `.package` file
**When** the "Update Version" action is triggered
**Then** the IDE increments the version in the internal manifest resource
**And** it reconstructs the package using the `PackageStreamWriter` to ensure 100% binary integrity
**And** the result is saved directly back to the `Mods` folder for immediate game testing.

### Story 7.3: Intelligent Mod Compatibility & Update System

As a Modder,
I want a unified dashboard that tracks mod compatibility based on community lists and local reports,
So that I can quickly identify which of my installed mods need updates after a game patch.

**Acceptance Criteria:**

**Given** a local Sims 4 installation and `Mods` folder
**When** the "Compatibility Scan" is executed
**Then** the system detects the local game version from `GameVersion.txt`
**And** it cross-references installed mods against Scarlet's Realm "Mod List" data (Broken, Updated, Fine)
**And** it parses local Better Exceptions (BE) HTML reports to identify specific failing tunings
**And** it provides a prioritized "Action Required" list with one-click update links where available.


## Epic 5: Interactive Onboarding & Accessibility

New modders can master the tool via a built-in interactive tutorial, with full WCAG 2.1 AA accessibility support.

### Story 5.1: Interactive "My First Mod" Tutorial

As a New Modder,
I want a step-by-step guide in the IDE,
So that I can create and compile my first interaction without leaving the app.

**Acceptance Criteria:**

**Given** the application is launched for the first time
**When** the onboarding guide is triggered
**Then** I see anchored tooltips pointing to the Sidebar, Editor, and Compile buttons
**And** I am guided through creating a simple "Hello World" JPE script
**And** the tutorial completes only after a successful JPE-to-XML compilation.

### Story 5.2: In-App Documentation & API Lookup

As a Modder,
I want to see documentation for JPE and Sims 4 tuning directly in the workspace,
So that I don't have to search online while coding.

**Acceptance Criteria:**

**Given** the Editor is active
**When** I hover over a JPE keyword or a Sims 4 XML element
**Then** a documentation popover appears with the element's purpose and examples
**And** a dedicated "Help Center" sidebar provides a searchable index of the complete JPE guide.

### Story 5.3: Keyboard-Only Navigation & WCAG Compliance

As a Modder with accessibility needs,
I want to navigate the entire IDE using only the keyboard,
So that I can work comfortably without a mouse.

**Acceptance Criteria:**

**Given** any screen in the application
**When** I use the Tab and Arrow keys
**Then** focus moves logically between all interactive elements (tabs, tree items, buttons)
**And** a high-visibility focus indicator is present on the active element
**And** all primary actions have discoverable keyboard shortcuts.

### Story 5.4: Screen Reader Support & ARIA Labeling

As a Visually Impaired Modder,
I want the application to be compatible with screen readers,
So that I can understand the UI state and code content.

**Acceptance Criteria:**

**Given** a screen reader (e.g., Narrator or VoiceOver) is active
**When** I navigate the application
**Then** all buttons and inputs have descriptive ARIA labels
**And** the tree view correctly reports expanded/collapsed states
**And** the diagnostics panel announces new errors when they occur.

### Story 5.5: High-Contrast & Custom Theme Support

As a User with visual sensitivities,
I want to select a high-contrast theme,
So that I can read the interface more easily.

**Acceptance Criteria:**

**Given** the Settings panel
**When** I select the "High Contrast" theme
**Then** the UI colors update to meet WCAG AAA contrast ratios
**And** the editor syntax highlighting shifts to high-visibility colors.

### Story 5.6: Interactive "Just Plain Manual" (JPM)

As a New or Advanced Modder,
I want a comprehensive, newbie-friendly manual that reads as easily as Just Plain English,
So that I can immediately pick up basic workflows and master advanced industrial functions.

**Acceptance Criteria:**

**Given** the JPE Studio Help Center
**When** the "Just Plain Manual" is opened
**Then** I see a "Getting Started" guide that explains modular syntax through interactive playgrounds
**And** it includes a "Pro Utilities" section covering the industrial stream writer, manifest patching, and size-collision cleanup
**And** the manual dynamically highlights relevant sections based on my current workspace view.


## Epic 6: AI-Assisted Modding & Predictive Scripting

Automate mod creation and detect logical conflicts using multi-model AI (OpenAI, Claude, Qwen).

### Story 6.1: Secure Multi-Model AI Service Integration

As a Modder,
I want to connect to different AI providers safely,
So that I can use my preferred LLM for modding assistance.

**Acceptance Criteria:**

**Given** the configuration settings
**When** I provide API keys for OpenAI, Claude, or Qwen
**Then** the credentials are encrypted and stored locally in the CredentialManager
**And** the AI Service handles provider-agnostic requests via the BaseAIService layer.

### Story 6.2: "Prompt-to-JPE" Automated Mod Creation

As a Modder,
I want to generate mod skeletons from natural language,
So that I can start building complex logic faster.

**Acceptance Criteria:**

**Given** an empty JPE file
**When** I enter a prompt (e.g., "A buff that gives Sims energy when they eat")
**Then** the AI generates a valid JPE code structure matching the description
**And** the code is automatically inserted into the editor with comments explaining the logic.

### Story 6.3: AI-Powered Conflict & Semantic Error Detection

As a Modder,
I want the AI to find logical errors that standard validators miss,
So that I avoid game crashes from complex mod conflicts.

**Acceptance Criteria:**

**Given** multiple files in a project
**When** I run the "AI Conflict Check"
**Then** the service analyzes the relationships between tuning IDs
**And** it identifies potential overlaps or missing dependencies that violate game logic
**And** it reports these as "Logical Warnings" in the Diagnostics panel.

### Story 6.4: Automated "Explain & Fix" Diagnostic Action

As a Modder,
I want the AI to explain my errors and offer fixes,
So that I can learn from my mistakes while fixing them.

**Acceptance Criteria:**

**Given** an error in the Diagnostics panel
**When** I click the "AI Fix" button
**Then** I see a plain-English explanation of why the code is invalid
**And** the AI proposes a diff with the corrected code
**And** clicking "Apply" refactors the source file immediately.

### Story 6.5: Predictive Scripting & Context-Aware Autocomplete

As a Modder,
I want intelligent suggestions for Sims 4 IDs as I type,
So that I don't have to memorize thousands of game hashes.

**Acceptance Criteria:**

**Given** the Editor is active
**When** I begin typing a reference or tag
**Then** the AI suggests relevant Sims 4 Tuning IDs or JPE patterns based on the current context
**And** suggestions appear within 300ms to maintain a fluid typing experience.


## Epic 9: JPE-Live Synchronization Bridge

Establish a real-time bi-directional link between JPE Studio and the Sims 4 Engine for live diagnostics.

### Story 9.1: Automated Live-Bridge Deployment

As a Modder,
I want the tool to automatically handle the Sims 4 engine link setup,
So that I don't have to manually install script mods to get live feedback.

**Acceptance Criteria:**

**Given** a Sims 4 installation path is configured
**When** the "Enable JPE-Live" toggle is flipped
**Then** the application passively injects the `jpe_live_sync.ts4script` into the Mods folder
**And** it performs a version handshake with the existing game process
**And** it automatically redeploys the script if a version mismatch is detected.

### Story 9.2: Passive Engine Monitoring

As a Modder,
I want to see what's happening inside the game engine in real-time,
So that I can debug my mod interactions as I play.

**Acceptance Criteria:**

**Given** the JPE-Live Link is active
**When** the Sims 4 engine executes a tuning block related to the mod
**Then** JPE Studio captures the event-driven logs via the async bridge
**And** the data ingestion consumes <5% of CPU to ensure zero-impact on game stability
**And** the application UI remains responsive (60 FPS) during heavy log bursts.

### Story 9.3: Human-Readable Alert Translation

As a Modder,
I want raw engine tracebacks to be translated into understandable JPE logic,
So that I can quickly identify which line of my script is failing.

**Acceptance Criteria:**

**Given** an engine error (Last Exception) is captured by the bridge
**When** the diagnostic engine processes the traceback
**Then** it maps the error to the specific JPE source file and line number
**And** it displays a "Spectral" alert card with a human-readable explanation of the logic failure
**And** it suggests a remediation based on previous successful translations.

### Story 9.4: Link Fail-Safe & Damped Pulse

As a Modder,
I want the tool to elegantly handle lost game connections,
So that my IDE doesn't crash or hang if I close the game.

**Acceptance Criteria:**

**Given** an active JPE-Live session
**When** the game process terminates or the link is severed
**Then** the status indicator transitions to a "Damped Gray Null-Pulse" state
**And** all live telemetry buffers are safely cleared to prevent memory leaks
**And** the UI provides a clear "Link Severed" notification without interrupting the editor.


## Epic 10: Sensory Studio Environment

Implement the "Living Brand" audio-tactile layer for high-fidelity user feedback.

### Story 10.1: Audio Scrubbing Utility

As a Modder,
I want my workspace to provide auditory feedback that reflects my project health,
So that I can sense errors even when not looking at the diagnostics panel.

**Acceptance Criteria:**

**Given** the Sensory Studio is active
**When** I scrub through the code or trigger a successful compilation
**Then** I hear reactive "Spectral Success Chords" or low-frequency diagnostic hums
**And** the audio frequency shifts dynamically based on the current error density
**And** all audio latency is maintained below 50ms for a "tactile" feel.

### Story 10.2: Haptic Heartbeat Integration

As a Modder,
I want subtle haptic feedback for background tasks,
So that I know when a massive project has finished compiling while I'm focused on other tasks.

**Acceptance Criteria:**

**Given** a supported haptic device (Steam Deck, Trackpad, or Controller)
**When** a background process (like .package indexing) completes
**Then** I feel a specific "Haptic Heartbeat" pulse indicating success
**And** the vibration intensity follows the "Industrial Isolation" fail-safe protocol to avoid user fatigue.

### Story 10.3: Bioluminescent Visual Bridges

As a Modder,
I want my UI to visually pulse in sync with system events,
So that the brand feels alive and responsive to my work.

**Acceptance Criteria:**

**Given** a sensory event (Error, Success, or Link Sync)
**When** the event triggers
**Then** the UI elements (borders, icons, glows) emit a bioluminescent "Spectral Pulse"
**And** the glow intensity maps to the severity of the event (Teal for success, Damped Red for errors)
**And** the animations use the standard 200ms-400ms brand motion curve.

### Story 10.4: Master Sensory Control Hub

As a Modder,
I want full control over the audio and haptic feedback intensity,
So that I can customize the studio to my own sensory preferences.

**Acceptance Criteria:**

**Given** the "Sensory Preferences" tab
**When** I adjust the global "Sensory Master" slider
**Then** both audio volume and haptic intensity scale proportionally
**And** the application automatically respects OS "Quiet Mode" or "Focus" settings
**And** I can toggle individual sensory layers (Audio, Haptics, Pulses) independently.
