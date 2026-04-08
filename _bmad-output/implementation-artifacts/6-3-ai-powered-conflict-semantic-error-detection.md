# Story: 6-3 - AI-Powered Conflict & Semantic Error Detection (Expanded)

**Epic:** 6 - AI-Powered Modding Engine  
**Story Key:** 6-3-ai-powered-conflict-semantic-error-detection  
**Status:** in-progress  
**User Story:** As a Modder, I want to detect logical conflicts across my project and access a newbie-friendly command reference, so that I can ensure my mods are functionally sound and community-compliant with 100% industrial-grade fidelity.

## 📋 Story Foundation

### Description
This story introduces a pro-active "Mod Health" suite. It combines AI's high-level logical reasoning (finding conflicts synthetic validators miss) with community-driven data (Scarlet's Realm) and a "Plain English" encyclopedia of JPE commands.

### Acceptance Criteria (BDD)

**Given** multiple mod files and a project state  
**When** I "Save Project" or press the "Scan Conflicts" button  
**Then** the following outcomes must be achieved:
1.  **Logical Conflict Scan**: The AI analyzes a "Summary Map" of the project to find duplicate IDs or priority contradictions.
2.  **Community Health Monitor**: JPE Studio flags mods in the project that match Broken/Outdated status on Scarlet's Realm List.
3.  **Better Exceptions JPE Edition**: Dropping a `lastException.txt` into the studio generates a JPE-style root cause analysis.
4.  **Command Dictionary (Ctrl+K)**: A searchable, newbie-friendly reference guide is accessible via a global shortcut.

## 🏗️ Developer Context

### Technical Milestones
- **Symbolic Analysis**: Building the "Summary Map" to reduce AI token costs.
- **Exception Engine**: AI-powered translation of Python stack traces into JPE root causes.
- **UI "Magic"**: Integrating the **🧠 Brain Icon** in Diagnostics for AI-sourced warnings.

### Implementation Patterns
- **Situation-Aware Hub**: The Sidebar becomes a central "Care Center" for mod health.
- **Short-Circuit Scan**: Prioritizing ID-collision checks before sending to the LLM.

## 🧪 Verification Plan

- `[ ]` **Test A (Conflicts)**: Create two buffs with the same ID. Save. Verify the 🧠 warning appears.
- `[ ]` **Test B (Dictionary)**: Press `Ctrl+K`. Search for "Interaction". Verify newbie-friendly explanation.
- `[ ]` **Test C (Exceptions)**: Drag a mock exception log. Verify "Plain English" JPE explanation appears.

---
**Project Context:** JPE-Sims4  
**Date:** 2026-04-03  
**Created By:** BMAD Master (Antigravity)
