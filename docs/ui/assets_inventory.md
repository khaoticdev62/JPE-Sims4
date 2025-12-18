# JPE Assets UI Inventory

This repository ships a complete UI reference set under `JPE assets folder/`. These assets are the **source of truth** for the Studio (Qt) look-and-feel.

## Regenerating The Manifest

- Generate/refresh the machine-readable manifest: `python scripts/jpe_assets_inventory.py --write`
- Output: `docs/ui/assets_manifest.json`

The manifest captures per-screen metadata (title, fonts, Tailwind color tokens, and file locations) so we can keep the Qt theme/QSS aligned as assets evolve.

## Screen Catalog (By Folder)

Desktop:
- Dashboard: `project_dashboard_1`, `project_dashboard_2`
- Explorer: `project_explorer_1`, `project_explorer_2`
- Project detail: `project_detail`
- Dual-pane editor: `dual-pane_jpe/xml_editor_1`, `dual-pane_jpe/xml_editor_2`
- Diagnostics: `diagnostics_tab_(global)`, `global_diagnostics_pane_1`, `global_diagnostics_pane_2`
- Build: `build_&_history_screen_1`, `build_&_history_screen_2`, `build_activity_tab`
- Plugins: `plugin_library_1`, `plugin_library_2`, `plugin_marketplace_1`, `plugin_marketplace_2`, `plugin_detail_&_settings_1`, `plugin_detail_&_settings_2`
- Settings: `global_settings_1`, `global_settings_2`
- Help/Docs: `help_&_docs_hub`
- About: `about_/_system_info`
- Entity views: `entity_detail_sheet_1`, `entity_detail_sheet_2`, `entity_jpe_view`
- Command palette: `keyboard_shortcuts_&_command_palette`

Mobile references (optional / separate delivery):
- `mobile_home_/*`, `mobile_settings`

## Design System (Observed Tokens)

From `docs/ui/assets_manifest.json`:
- Fonts: `Inter` (UI), `JetBrains Mono` (code), `Material Symbols Outlined` (icons), plus occasional `Noto Sans`.
- Primary color variants appear across assets (`#9d5cff`, `#761ff9`, `#8638fa`, `#9551fb`, `#7825f4`, `#b066ff`).
- Shared structural patterns: left navigation, header/search, rounded “card” surfaces, chip filters, list rows with leading icon + trailing chevron, and strong “code editor” contrast blocks.

## Qt Implementation Mapping (Current)

Implemented/Aligned:
- Dashboard: `jpe_studio_qt/ui/main_window.py` (`project_dashboard_*`)
- Explorer: `jpe_studio_qt/ui/main_window.py` (`project_explorer_*`)
- Dual-pane editor: `jpe_studio_qt/ui/main_window.py` + `jpe_studio_qt/ui/code_editor.py` (`dual-pane_jpe/*`)
- Command palette: `jpe_studio_qt/ui/main_window.py` (`keyboard_shortcuts_&_command_palette`)

Partial (needs fidelity passes):
- Diagnostics tab: `jpe_studio_qt/ui/main_window.py` (`diagnostics_tab_(global)`)
- Build history: `jpe_studio_qt/ui/main_window.py` (`build_&_history_screen_*`)
- Plugins library: `jpe_studio_qt/ui/main_window.py` (`plugin_library_*`)
- Global settings: `jpe_studio_qt/ui/main_window.py` (`global_settings_*`)

Missing (not yet built in Qt):
- `project_detail`, `build_activity_tab`, `global_diagnostics_pane_*`
- `plugin_marketplace_*`, `plugin_detail_&_settings_*`
- `entity_detail_sheet_*`, `entity_jpe_view`
- `help_&_docs_hub`, `about_/_system_info`
- Mobile-only reference screens
