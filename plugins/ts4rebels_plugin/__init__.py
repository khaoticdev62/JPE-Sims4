"""TS4Rebels plugin package for the JPE Sims 4 Mod Translation Suite."""

from typing import Any
from .. import HasSettingsPanel, HasMainUI
from .settings_ui import SettingsPanel
from .ui import PluginFrame

# --- Main Plugin Class ---

class TS4RebelsPlugin(HasSettingsPanel, HasMainUI):
    """
    Main plugin class for the TS4Rebels integration.
    """
    def name(self) -> str:
        return "TS4Rebels Integration"

    def version(self) -> str:
        return "1.0.0"

    def description(self) -> str:
        return "Integrates with local TS4Rebels mod vaults."

    def get_settings_panel(self, parent) -> Any:
        """
        Return the settings panel for this plugin.
        """
        return SettingsPanel(parent)
    
    def get_main_ui(self, parent) -> Any:
        """
        Return the main UI widget for this plugin.
        """
        return PluginFrame(parent)

# --- Other Components ---

from .config import Ts4RebelsConfig
from .vault_indexer import VaultIndexer
from .metadata_mapper import MetadataMapper
from .orchestrator import TranslationOrchestrator
from .diagnostics_bridge import DiagnosticsBridge

__all__ = [
    "TS4RebelsPlugin",
    "Ts4RebelsConfig",
    "VaultIndexer",
    "MetadataMapper",
    "TranslationOrchestrator",
    "DiagnosticsBridge",
]
