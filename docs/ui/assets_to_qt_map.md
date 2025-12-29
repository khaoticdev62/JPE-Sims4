# Assets to Qt Screen Map

This file tracks what is implemented and what is still missing when matching the `JPE assets folder/` templates in the Qt Studio UI (`jpe_studio_qt/`).

## Legend

- `done`: structure + styling close to asset
- `partial`: usable but needs a fidelity pass
- `todo`: not yet implemented in Qt
- `defer`: mobile/reference-only or out of v1 scope

## Desktop Screens

| Asset folder | Status | Qt location |
|---|---:|---|
| `project_dashboard_1` | partial | `jpe_studio_qt/ui/main_window.py` (legacy) |
| `project_dashboard_2` | partial | `jpe_studio_qt/ui/pages/dashboard2.py` (wired in `jpe_studio_qt/ui/main_window.py`) |
| `project_explorer_1` | defer | Covered by `project_explorer_2` for v1 desktop scope. |
| `project_explorer_2` | partial | `jpe_studio_qt/ui/pages/explorer2.py` (wired in `jpe_studio_qt/ui/main_window.py`) |
| `project_detail` | done | `jpe_studio_qt/ui/pages/project_detail.py` |
| `dual-pane_jpe/xml_editor_1` | partial | `jpe_studio_qt/ui/main_window.py` (Translate) + `jpe_studio_qt/ui/code_editor.py` |
| `dual-pane_jpe/xml_editor_2` | partial | `jpe_studio_qt/ui/main_window.py` (Translate) + `jpe_studio_qt/ui/code_editor.py` |
| `diagnostics_tab_(global)` | partial | `jpe_studio_qt/ui/pages/diagnostics_tab2.py` (wired in `jpe_studio_qt/ui/main_window.py`) |
| `global_diagnostics_pane_1` | partial | `jpe_studio_qt/ui/diagnostics_pane.py` |
| `global_diagnostics_pane_2` | partial | `jpe_studio_qt/ui/diagnostics_pane.py` |
| `build_&_history_screen_1` | partial | `jpe_studio_qt/ui/main_window.py` (legacy) |
| `build_&_history_screen_2` | partial | `jpe_studio_qt/ui/pages/build_history2.py` (wired in `jpe_studio_qt/ui/main_window.py`) |
| `build_activity_tab` | partial | `jpe_studio_qt/ui/pages/build_history2.py` (Activity toggle in Build). |
| `plugin_library_1` | partial | `jpe_studio_qt/ui/pages/plugin_marketplace2.py` (Installed view) |
| `plugin_library_2` | partial | `jpe_studio_qt/ui/pages/plugin_marketplace2.py` (Installed view) |
| `plugin_marketplace_1` | defer | Covered by `plugin_marketplace_2` for v1 desktop scope. |
| `plugin_marketplace_2` | partial | `jpe_studio_qt/ui/pages/plugins_marketplace2_page.py` + `jpe_studio_qt/ui/pages/plugin_marketplace2.py` |
| `plugin_detail_&_settings_1` | defer | Covered by `plugin_detail_&_settings_2` for v1 desktop scope. |
| `plugin_detail_&_settings_2` | partial | `jpe_studio_qt/ui/pages/plugin_detail_settings2.py` |
| `global_settings_1` | partial | `jpe_studio_qt/ui/main_window.py` (legacy) |
| `global_settings_2` | partial | `jpe_studio_qt/ui/pages/settings2.py` (wired in `jpe_studio_qt/ui/main_window.py`) |
| `help_&_docs_hub` | done | `jpe_studio_qt/ui/pages/docs_hub.py` |
| `about_/_system_info` | done | `jpe_studio_qt/ui/pages/about.py` |
| `entity_detail_sheet_1` | partial | `jpe_studio_qt/ui/entity_detail_dialog.py` |
| `entity_detail_sheet_2` | partial | `jpe_studio_qt/ui/entity_detail_dialog.py` |
| `entity_jpe_view` | partial | `jpe_studio_qt/ui/pages/entity_jpe_view.py` |
| `keyboard_shortcuts_&_command_palette` | partial | `jpe_studio_qt/ui/main_window.py` (Command palette dialog) |

## Mobile References

| Asset folder | Status | Notes |
|---|---:|---|
| `mobile_home_/*` | defer | Reference-only unless we ship a mobile UI. |
| `mobile_settings` | defer | Reference-only unless we ship a mobile UI. |
