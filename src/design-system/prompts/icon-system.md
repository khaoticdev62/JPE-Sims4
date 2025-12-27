# Icon System Prompt

## Context
Define the iconographic style for JPE Mod Translator 2.0. We utilize the `Lucide` icon library as our base, ensuring consistency and high legibility across the application.

## Icon Specs
- **Library:** Lucide React.
- **Stroke Width:** 2px (Standard) | 1.5px (Small/Secondary).
- **Size Scale:**
  - `small`: 16x16.
  - `medium`: 24x24 (Default).
  - `large`: 32x32.
- **Color:**
  - `Default`: `text-muted`.
  - `Active/Hover`: `text-primary`.
  - `Focused State`: `accent-primary` with a subtle outer glow.

## Category Mapping
- **Navigation:** `LayoutDashboard`, `FolderKanban`, `Settings`, `User`.
- **Editor:** `FileCode`, `Save`, `Undo`, `Redo`, `Search`.
- **Diagnostics:** `AlertCircle` (Error), `AlertTriangle` (Warning), `Info` (Info).
- **Actions:** `Plus`, `Trash2`, `ExternalLink`, `ChevronRight`.

## Visual Consistency
- Use rounded caps and joins (`stroke-linecap="round" stroke-linejoin="round"`).
- Icons should never be filled; stick to line art to match the "Modern Dark Mode" aesthetic.
