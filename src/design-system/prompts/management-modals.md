# Project Management Modals Prompt

## Context
Design the high-fidelity modals for project management in JPE Mod Translator 2.0. These utilize the "Apple TV UX" glassmorphism and fluid transition principles.

## Modals to Design

### 1. New Project Wizard
- **Layout:** Multi-step wizard (Stepper).
- **Steps:**
  1. **Project Identity:** Name, Author, Description.
  2. **Source Selection:** File picker for XML/STBL files.
  3. **Configuration:** Output directory, default language.
- **Visuals:**
  - Progress indicator (Stepper) at the top.
  - Large, clear input fields.
  - Focus state on the current active input.
  - Glassmorphism backdrop blur.

### 2. Settings Dialog
- **Layout:** Tabbed modal (General, Editor, Compiler, Advanced).
- **Visuals:**
  - Sidebar or Top-tab navigation.
  - Form groups with labels and helper text.
  - Save/Cancel buttons in a sticky footer or bottom-right.

## Global Modal Visuals
- **Background:** `background-tertiary` with 80-90% opacity + `backdrop-blur`.
- **Border:** `border-subtle` with a slight glow on focus.
- **Transition:** 
  - **Entry:** Scale up from 0.95 -> 1.0 + Fade in (200ms).
  - **Exit:** Scale down from 1.0 -> 0.95 + Fade out (150ms).

## Technical Constraints
- Use Radix UI `Dialog` or `Tabs` structure logic.
- References `spacing` and `z-index` tokens.
