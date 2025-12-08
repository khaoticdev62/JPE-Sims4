from __future__ import annotations

from typing import Dict, Iterable, List, Type

from .base import BasePlugin, PluginContext
from ..diagnostics.errors import EngineError


class PluginRegistry:
    """In-memory registry of available plugins."""

    def __init__(self) -> None:
        self._plugins: Dict[str, Type[BasePlugin]] = {}

    def register(self, plugin_cls: Type[BasePlugin]) -> None:
        self._plugins[plugin_cls.plugin_id] = plugin_cls

    def enabled_plugins(self) -> Iterable[Type[BasePlugin]]:
        return self._plugins.values()

    def run_all(self, context: PluginContext) -> List[EngineError]:
        diagnostics: List[EngineError] = []
        for plugin_cls in self.enabled_plugins():
            plugin = plugin_cls()
            diagnostics.extend(plugin.apply(context))
        return diagnostics
