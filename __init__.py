"""JPE Sims 4 translation engine package.

This package contains the core engine, IR models, diagnostics, and plugin interfaces
for translating The Sims 4 mod content into Just Plain English (JPE) and back.
"""

from .engine.engine import TranslationEngine
from .engine.ir import ProjectIR
from .diagnostics.errors import BuildReport
from .plugins.manager import PluginManager
