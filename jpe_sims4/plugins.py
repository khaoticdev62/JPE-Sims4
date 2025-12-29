from __future__ import annotations

import importlib.util
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from types import ModuleType
from typing import Callable

from jpe_sims4.diagnostics import Diagnostic

ExtractorFn = Callable[[str, str, bytes], object]
ApplierFn = Callable[[str, str, bytes, list[dict[str, object]]], object]
ValidatorFn = Callable[[dict[str, object]], list[Diagnostic]]


@dataclass(frozen=True)
class LoadedPlugin:
    name: str
    path: str
    module: ModuleType


@dataclass
class PluginRegistry:
    extractors: dict[str, Callable[[str, bytes], object]] = field(default_factory=dict)
    appliers: dict[str, Callable[[str, bytes, list[dict[str, object]]], object]] = field(default_factory=dict)
    validators: list[ValidatorFn] = field(default_factory=list)
    diagnostics: list[Diagnostic] = field(default_factory=list)
    loaded: list[LoadedPlugin] = field(default_factory=list)

    def register_extractor(self, kind: str, fn: Callable[[str, bytes], object]) -> None:
        self.extractors[kind.lower()] = fn

    def register_applier(self, kind: str, fn: Callable[[str, bytes, list[dict[str, object]]], object]) -> None:
        self.appliers[kind.lower()] = fn

    def register_validator(self, fn: ValidatorFn) -> None:
        self.validators.append(fn)


class PluginManager:
    def __init__(self) -> None:
        self._loaded = False
        self._extra_dirs: tuple[Path, ...] = ()
        self._disabled_paths: set[str] = set()
        self.registry = PluginRegistry()

    def reset(self) -> None:
        self._loaded = False
        self.registry = PluginRegistry()

    def configure(self, *, extra_dirs: list[Path] | None = None, disabled_paths: list[str] | None = None) -> None:
        next_extra = tuple(extra_dirs or ())
        next_disabled: set[str] = set()
        for p in disabled_paths or ():
            raw = str(p or "").strip()
            if not raw:
                continue
            try:
                next_disabled.add(str(Path(raw).expanduser().resolve()))
            except Exception:
                next_disabled.add(raw)

        if next_extra != self._extra_dirs or next_disabled != self._disabled_paths:
            self._extra_dirs = next_extra
            self._disabled_paths = next_disabled
            self.reset()

    def load(self) -> PluginRegistry:
        if self._loaded:
            return self.registry
        self._loaded = True

        for plugin_dir in _iter_plugin_dirs(extra_dirs=list(self._extra_dirs)):
            self._load_dir(plugin_dir)
        return self.registry

    def _load_dir(self, plugin_dir: Path) -> None:
        try:
            plugin_dir = plugin_dir.expanduser().resolve()
        except Exception:
            return
        if not plugin_dir.exists() or not plugin_dir.is_dir():
            return

        for py in sorted(plugin_dir.glob("*.py")):
            if py.name.startswith("_"):
                continue
            try:
                if str(py.expanduser().resolve()) in self._disabled_paths:
                    continue
            except Exception:
                if str(py) in self._disabled_paths:
                    continue
            self._load_module(py)

    def _load_module(self, path: Path) -> None:
        name = f"jpe_plugin_{path.stem}_{abs(hash(str(path))) & 0xFFFFFFFF:x}"
        try:
            spec = importlib.util.spec_from_file_location(name, str(path))
            if spec is None or spec.loader is None:
                raise ImportError("Unable to create module spec.")
            module = importlib.util.module_from_spec(spec)
            sys.modules[name] = module
            spec.loader.exec_module(module)

            register = getattr(module, "register", None)
            if not callable(register):
                raise AttributeError("Plugin must define register(registry).")
            register(self.registry)

            self.registry.loaded.append(LoadedPlugin(name=name, path=str(path), module=module))
        except Exception as e:
            self.registry.diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="PLUGINS",
                    code="W_PLUGIN_LOAD_FAILED",
                    message=str(e),
                    file_path=str(path),
                )
            )


_MANAGER = PluginManager()


def plugins() -> PluginManager:
    return _MANAGER


def _iter_plugin_dirs(*, extra_dirs: list[Path] | None = None) -> list[Path]:
    dirs: list[Path] = []

    env = os.environ.get("JPE_PLUGINS_PATH", "").strip()
    if env:
        for part in env.split(os.pathsep):
            part = part.strip()
            if part:
                dirs.append(Path(part))

    for p in extra_dirs or ():
        dirs.append(p)

    repo_default = Path(__file__).resolve().parents[1] / "plugins"
    dirs.append(repo_default)
    # Deduplicate while preserving order (after resolving best-effort).
    out: list[Path] = []
    seen: set[str] = set()
    for d in dirs:
        try:
            k = str(d.expanduser().resolve())
        except Exception:
            k = str(d)
        if k in seen:
            continue
        seen.add(k)
        out.append(d)
    return out
