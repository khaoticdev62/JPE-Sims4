# Integrating AAVE Conversion (AAVEPack) into JPE Sims 4 Translation Suite

This plugin is designed to work with *multiple* common loader styles.

The JPE SOP explicitly calls out a `core/` engine and a `plugins/` directory for transformations and adapters, and it requires **structured diagnostics** (machine-readable) instead of raw stack traces. This plugin follows that contract.

## 1) Drop-in (manifest-based plugins folder)

If your suite already scans `plugins/*/manifest.json`:

1. Copy `plugins/aave_conversion/` into your suite's `plugins/` directory (same level as other plugins).
2. Ensure your loader imports the manifest `entrypoint`:
   - `aave_conversion.plugin:AAVEConversionPlugin`
3. Enable the plugin via your usual config (if applicable).

### Expected hook methods
The plugin exposes **primary** hooks:
- `normalize_preparse(input_text, context=...) -> (canonical_text, diagnostics)`
- `render_postprocess(canonical_text, context=...) -> (aave_text, diagnostics)`
- `dictionary_lookup(query, context=...) -> { query, results[] }`
- `lint(text, context=...) -> diagnostics[]`
- `suggest(text, cursor, context=...) -> { token, suggestions[] }`
- `stats() -> dict`

And **compatibility aliases** for loaders that use different names:
- `pre_parse` (alias of `normalize_preparse`)
- `post_render` (alias of `render_postprocess`)
- `lookup_dictionary` (alias of `dictionary_lookup`)

## 2) Python entry-point discovery (pip install)

If your suite discovers plugins via Python entry points:

- Install this plugin (editable is fine during dev):
  ```bash
  pip install -e plugins/aave_conversion
  ```

- Discover entry points under group `jpe.plugins`.
  This plugin advertises:
  - `aave_conversion = aave_conversion.jpe_entry:create_plugin`

## 3) Minimal loader snippet (copy/paste)

If you do **not** have a loader yet, use the snippet in:
- `patches/plugin_loader_snippet.py`

It supports:
- scanning `plugins/**/manifest.json`
- importing `entrypoint` strings
- returning instantiated plugin objects

## 3.1) Drop-in core PluginManager (recommended if your suite doesn't have one yet)

If you want something you can paste into the suite and be done:

1) Copy this file into your suite:
- `plugins/aave_conversion/patches/drop_in/core/plugin_manager.py` → `core/plugin_manager.py`

2) Wire it into your engine pipeline using the reference:
- `plugins/aave_conversion/patches/drop_in/core/engine_plugin_wiring_example.py`

The drop-in PluginManager provides deterministic discovery + ordered hook dispatch and returns **machine-readable diagnostics** you can surface in the desktop/mobile UI.

## 4) Wiring the Dictionary Modal (Textual editor)

If your editor is Textual-based, you can mount the modal:

```python
from aave_conversion.tui.dictionary_modal import DictionaryModal
from aave_conversion import create_plugin

plugin = create_plugin()
self.app.push_screen(DictionaryModal(plugin.registry))
```

Add a keybinding (example):
- `ctrl+d` -> open dictionary modal

## 5) Recommended contexts

For editor mode:
- `strict=False` for normalization to allow suggestions

For build/compile:
- `strict=True` and fail on `ERROR` diagnostics

Example context:
```python
ctx = {"register": "standard", "domain": "buffs", "strict": True}
```
