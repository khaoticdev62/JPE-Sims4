from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Optional

from ..engine.ir import ProjectIR
from ..diagnostics.errors import EngineError


class PluginContext:
    """Context passed to plugins during execution."""

    def __init__(self, project_ir: ProjectIR) -> None:
        self.project_ir = project_ir


class BasePlugin(ABC):
    """Base class for all plugins extending the translation engine."""

    plugin_id: str
    plugin_version: str

    @abstractmethod
    def apply(self, context: PluginContext) -> list[EngineError]:
        """Apply transformations or checks to the project IR.

        Implementations may append new IR elements or validate existing ones.
        """
        raise NotImplementedError
