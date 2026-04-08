"""Generic plugin loader snippet for JPE-style projects.

Supports:
- plugins/<plugin_id>/manifest.json
- manifest 'entrypoint' in form 'module.submodule:Symbol'
- returns instantiated plugin objects

This is intentionally standalone so you can drop it into:
- core/plugin_loader.py
- backend/core/plugin_loader.py
- or wherever your suite keeps its bootstrapping code.
"""

from __future__ import annotations

from dataclasses import dataclass
from importlib import import_module
from pathlib import Path
import json
from typing import Any


@dataclass
class LoadedPlugin:
    manifest: dict[str, Any]
    instance: Any


def _import_entrypoint(entrypoint: str):
    if ":" not in entrypoint:
        raise ValueError(f"Invalid entrypoint (expected module:Symbol): {entrypoint!r}")
    mod_name, sym_name = entrypoint.split(":", 1)
    mod = import_module(mod_name)
    sym = getattr(mod, sym_name)
    return sym


def discover_plugins(plugins_dir: str | Path = "plugins") -> list[LoadedPlugin]:
    plugins_dir = Path(plugins_dir)
    loaded: list[LoadedPlugin] = []

    if not plugins_dir.exists():
        return loaded

    for manifest_path in plugins_dir.glob("**/manifest.json"):
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            entrypoint = manifest.get("entrypoint")
            if not entrypoint:
                continue

            sym = _import_entrypoint(entrypoint)
            instance = sym() if callable(sym) else sym  # supports classes, factories, or instances
            loaded.append(LoadedPlugin(manifest=manifest, instance=instance))
        except Exception as e:  # keep loader resilient; surface via your diagnostics system
            # Replace this with your suite's structured diagnostics reporter
            print(f"[plugin-loader] Failed to load {manifest_path}: {e}")

    return loaded
