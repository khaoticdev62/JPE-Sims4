# Story: 6-2 - "Prompt-to-JPE" Automated Mod Creation

**Epic:** 6 - AI-Powered Modding Engine  
**Story Key:** 6-2-prompt-to-jpe-automated-mod-creation  
**Status:** done  
**User Story:** As a Modder, I want to generate mod skeletons from natural language, so that I can start building complex logic faster with 100% industrial-grade fidelity.

## 📋 Story Foundation

### Description
This story introduces the core AI generation feature. It bridges the gap between natural language descriptions and valid JPE code. The system uses situational awareness (sending the active file's content to the AI) and provides an interactive "Apply to Editor" experience with smart insertion (replace if empty, append if not).

### Acceptance Criteria (BDD)

**Given** an active JPE editor tab  
**When** I enter a prompt in the AIAssistant (e.g., "Create a buff that gives Sims energy when they eat")  
**Then** the following outcomes must be achieved:
1.  **Context-Aware Prompting**: The AI must receive the content of the currently open file as context.
2.  **Valid JPE Output**: The generated code must follow the WHEN/DO/ONLY_IF grammar.
3.  **Smart Insertion**: 
    - If the file is **empty**, the generated code replaces the entire file.
    - If the file has **existing content**, the code is appended to the bottom of the file.
4.  **One-Click Application**: A "Magic wand" button appears on the code block to instantly apply it to the active tab.

## 🏗️ Developer Context

### Technical Milestones
- **Grammar Reinforcement**: `SYSTEM_PROMPT_JPE_GENERATOR` ensures the LLM's output is optimized for our JPE parser.
- **Smart State Mutation**: `insertCodeToActiveTab` in the store handles the logic for empty/non-empty states.
- **Interactive Component**: `AIAssistant` markdown rendering is wrapped with an action overlay for code blocks.

### Implementation Patterns
- **Situational Awareness**: Proactive context inclusion in every AI request.
- **Atomic Insertion**: Store-driven content updates to ensure undo/redo compatibility.

## 🧪 Verification Plan

- [x] **Test A (Empty File)**: Ask for a new buff. Click Apply. Verify the file is populated.
- [x] **Test B (Append Logic)**: Add content to the file. Ask for a new interaction. Click Apply. Verify it appends beneath the original code.
- [x] **Test C (Context Link)**: Ask "What does the current code do?". Verify the AI correctly identifies the active file's logic.

### Review Findings

- [x] [Review][Patch] Double-submit vulnerability in handleSendMessage [AIAssistant.tsx:54]
- [x] [Review][Patch] Wrap File Context in markers to prevent prompt injection [AIAssistant.tsx:74]
- [x] [Review][Patch] Case-insensitive language tag check for jpe code blocks [AIAssistant.tsx:175]
- [x] [Review][Defer] Conversation Pruning / Token Management [AIAssistant.tsx:35] ΓÇö deferred, epic-6 optimization phase

---
**Project Context:** JPE-Sims4  
**Date:** 2026-04-03  
**Created By:** BMAD Master (Antigravity)
