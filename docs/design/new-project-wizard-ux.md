# UX Flow: New Project Wizard

## Overview
The New Project Wizard is a guided experience to help users initialize a mod translation project correctly. It minimizes friction by breaking the process into logical, validated steps.

## User Flow
1. **Trigger:** User clicks "New Project" from the Dashboard or File Menu.
2. **Step 1: Identity**
   - User enters Project Name (Required).
   - User enters Author Name (Optional).
   - User enters Description (Optional).
   - **Validation:** "Next" button remains disabled until Project Name is provided.
3. **Step 2: Source**
   - User selects source files (XML, STBL, or .package).
   - User can drag and drop files into the target zone.
   - **Validation:** Files are checked for supported formats immediately.
4. **Step 3: Configuration**
   - User selects Output Directory.
   - User selects Target Language.
   - **Validation:** Checks if Output Directory is writable.
5. **Completion:** User clicks "Create Project". Modal closes, and the Editor Workspace opens with the new project loaded.

## Wizard Steps (Stepper)
- **Visuals:** A horizontal indicator showing "Identity", "Source", "Config".
- **States:** `Pending`, `Active`, `Completed`.

## Validation Details
- **Inline Feedback:** Error messages appear below inputs if validation fails (e.g., "Directory already exists").
- **State Persistence:** Data entered in previous steps is preserved if the user navigates back.

## Apple TV UX Integration
- **Transitions:** Smooth slide-left/slide-right animations when switching steps.
- **Focus:** High-visibility focus ring on the active input field.
