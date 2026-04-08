"""JPE PluginManager (drop-in reference implementation).

This module is intentionally dependency-free (stdlib only) so you can copy
it directly into your suite under `core/` (e.g. `core/plugin_manager.py`).

It aligns with the JPE SOP:
- `core/` hosts parsers, generators, validators, diagnostics.
- `plugins/` hosts file-type adapters, version packs, and transformations.
- Failures surface through structured diagnostics, not raw stack traces.

Discovery mechanisms
1) Manifest scanning (recommended for local dev)
   - Looks for `plugins/*/manifest.json`.
   - Manifest must contain: `id`, `name`, `version`, `entrypoint`.
   - Entrypoint format: `module:object`.
     - If object is a class -> instantiated with no args.
     - If object is callable -> called with no args.
     - Else -> used as-is (assumed plugin instance).

2) Python entry-point discovery (recommended for pip-installed plugins)
   - Reads entry points under group `jpe.plugins`.
   - Each entry point should return a plugin instance (factory).

Hook dispatch
- Hooks are called in deterministic order (sorted by plugin id).
- Each hook call returns `(value, diagnostics)` or `diagnostics`.
- Diagnostics are aggregated and normalized to dictionaries.
"""

from __future__ import annotations

import importlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterable, Optional, Protocol


class Plugin(Protocol):
    id: str
    name: str
    version: str


def _load_entrypoint(entrypoint: str) -> Any:
    if ":" not in entrypoint:
        raise ValueError(f"Invalid entrypoint '{entrypoint}' (expected module:object)")
    mod_name, obj_name = entrypoint.split(":", 1)
    mod = importlib.import_module(mod_name)
    obj = getattr(mod, obj_name)
    # Class
    if isinstance(obj, type):
        return obj()
    # Factory
    if callable(obj):
        return obj()
    # Instance
    return obj


def _safe_to_diag_dict(d: Any, *, text: str | None = None) -> dict[str, Any]:
    """Best-effort conversion of plugin diagnostics to a dict."""
    if d is None:
        return {"code": "UNKNOWN", "severity": "info", "message": "(no details)"}
    if isinstance(d, dict):
        return d
    # Our AAVEPack Diagnostic has to_dict(text=...)
    to_dict = getattr(d, "to_dict", None)
    if callable(to_dict):
        try:
            # Some impls accept (text), some accept (text=...)
            try:
                return to_dict(text=text)
            except TypeError:
                return to_dict(text)
        except Exception:
            pass
    # Fallback
    return {
        "code": getattr(d, "code", "UNKNOWN"),
        "severity": getattr(getattr(d, "severity", None), "value", getattr(d, "severity", "info")),
        "message": getattr(d, "message", repr(d)),
    }


@dataclass
class DiagnosticsReport:
    """Machine-readable diagnostic bundle for the engine/UI."""

    diagnostics_version: str
    items: list[dict[str, Any]]

    def to_dict(self) -> dict[str, Any]:
        return {"diagnostics_version": self.diagnostics_version, "items": self.items}


@dataclass
class PluginManager:
    plugins: list[Plugin]
    diagnostics_version: str = "1"

    def _sorted(self) -> list[Plugin]:
        return sorted(self.plugins, key=lambda p: getattr(p, "id", ""))

    def normalize_preparse(self, text: str, *, context: dict[str, Any] | None = None) -> tuple[str, DiagnosticsReport]:
        context = context or {}
        diags: list[dict[str, Any]] = []
        out = text
        for p in self._sorted():
            fn = getattr(p, "normalize_preparse", None) or getattr(p, "pre_parse", None)
            if not callable(fn):
                continue
            try:
                out, p_diags = fn(out, context=context)
                for d in (p_diags or []):
                    diags.append(_safe_to_diag_dict(d, text=out))
            except Exception as e:
                diags.append({
                    "code": "PLUGIN_NORMALIZE_CRASH",
                    "severity": "error",
                    "message": f"Plugin '{getattr(p, 'id', '?')}' crashed in normalize_preparse: {e}",
                    "metadata": {"plugin": getattr(p, "id", None)},
                })
        return out, DiagnosticsReport(self.diagnostics_version, diags)

    def render_postprocess(self, text: str, *, context: dict[str, Any] | None = None) -> tuple[str, DiagnosticsReport]:
        context = context or {}
        diags: list[dict[str, Any]] = []
        out = text
        for p in self._sorted():
            fn = getattr(p, "render_postprocess", None) or getattr(p, "post_render", None)
            if not callable(fn):
                continue
            try:
                out, p_diags = fn(out, context=context)
                for d in (p_diags or []):
                    diags.append(_safe_to_diag_dict(d, text=out))
            except Exception as e:
                diags.append({
                    "code": "PLUGIN_RENDER_CRASH",
                    "severity": "error",
                    "message": f"Plugin '{getattr(p, 'id', '?')}' crashed in render_postprocess: {e}",
                    "metadata": {"plugin": getattr(p, "id", None)},
                })
        return out, DiagnosticsReport(self.diagnostics_version, diags)

    def lint(self, text: str, *, context: dict[str, Any] | None = None) -> DiagnosticsReport:
        context = context or {}
        diags: list[dict[str, Any]] = []
        for p in self._sorted():
            fn = getattr(p, "lint", None)
            if not callable(fn):
                continue
            try:
                p_diags = fn(text, context=context)
                for d in (p_diags or []):
                    diags.append(_safe_to_diag_dict(d, text=text))
            except Exception as e:
                diags.append({
                    "code": "PLUGIN_LINT_CRASH",
                    "severity": "error",
                    "message": f"Plugin '{getattr(p, 'id', '?')}' crashed in lint: {e}",
                    "metadata": {"plugin": getattr(p, "id", None)},
                })
        return DiagnosticsReport(self.diagnostics_version, diags)

    def dictionary_lookup(self, query: str, *, context: dict[str, Any] | None = None) -> dict[str, Any]:
        context = context or {}
        merged: list[dict[str, Any]] = []
        for p in self._sorted():
            fn = getattr(p, "dictionary_lookup", None) or getattr(p, "lookup_dictionary", None)
            if not callable(fn):
                continue
            try:
                res = fn(query, context=context)
                for r in res.get("results", []) if isinstance(res, dict) else []:
                    merged.append(r)
            except Exception:
                continue
        return {"query": query, "results": merged}


def discover_plugins(*, plugins_dir: str | Path = "plugins") -> PluginManager:
    """Discover plugins from local manifests and python entry points."""
    root = Path(plugins_dir)
    plugins: list[Plugin] = []

    # 1) Local manifests
    if root.exists() and root.is_dir():
        for manifest_path in sorted(root.glob("*/manifest.json")):
            try:
                manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
                entrypoint = manifest.get("entrypoint")
                if not entrypoint:
                    continue
                plugin = _load_entrypoint(entrypoint)
                # Fill obvious metadata gaps if present in manifest
                for k in ("id", "name", "version"):
                    if getattr(plugin, k, None) is None and manifest.get(k) is not None:
                        try:
                            setattr(plugin, k, manifest[k])
                        except Exception:
                            pass
                plugins.append(plugin)  # type: ignore[arg-type]
            except Exception:
                # Keep discovery resilient; the engine should surface diagnostics elsewhere.
                continue

    # 2) Python entry points
    try:
        from importlib.metadata import entry_points

        eps = entry_points()
        group = eps.select(group="jpe.plugins") if hasattr(eps, "select") else eps.get("jpe.plugins", [])
        for ep in group:
            try:
                factory = ep.load()
                plugin = factory() if callable(factory) else factory
                plugins.append(plugin)  # type: ignore[arg-type]
            except Exception:
                continue
    except Exception:
        pass

    # De-duplicate by id (first wins)
    unique: dict[str, Plugin] = {}
    for p in plugins:
        pid = getattr(p, "id", None) or repr(p)
        if pid not in unique:
            unique[pid] = p
    return PluginManager(list(unique.values()))
