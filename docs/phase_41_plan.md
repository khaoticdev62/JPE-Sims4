# Phase 41: Productivity Power-Ups (Implementation Plan)

This phase focuses on enhancing user productivity through a Global Command Palette and a Background Sentinel.

## Proposed Changes

### [Component] Global Command Palette

- **[NEW] [CommandPalette.tsx](file:///c:/Users/thecr/Desktop/JPE_Mod_Translator_2.0/src/components/CommandPalette.tsx)**: A high-fidelity, spotlight-style modal for rapid access to projects, mods, and system actions.
- **[MODIFY] [App.tsx](file:///c:/Users/thecr/Desktop/JPE_Mod_Translator_2.0/src/App.tsx)**: Integrate the Command Palette at the top level and handle the `Ctrl+K` global shortcut.

### [Component] Background Sentinel

- **[MODIFY] [useSentinelStore.ts](file:///c:/Users/thecr/Desktop/JPE_Mod_Translator_2.0/src/stores/useSentinelStore.ts)**: Add background polling/watching logic to monitor the Sims 4 Mod folder.
- **[MODIFY] [App.tsx](file:///c:/Users/thecr/Desktop/JPE_Mod_Translator_2.0/src/App.tsx)**: Initialize the sentinel on mount.

## Verification Plan

### Automated/Manual Tests

- Press `Ctrl+K` from any screen and verify the palette opens.
- Search for a project and verify navigation.
- Add/remove a mod file in the OS and verify the Sentinel detects it and updates the status.
