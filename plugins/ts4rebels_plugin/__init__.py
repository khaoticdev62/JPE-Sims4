"""TS4Rebels plugin package for the JPE Sims 4 Mod Translation Suite."""

from typing import Any
from pathlib import Path
from .. import HasSettingsPanel, HasMainUI
from .settings_ui import SettingsPanel
from .ui import PluginFrame
from config.config_manager import config_manager

# --- Helper Function for Config ---
def _get_ts4rebels_config_value(key: str, default: Any = None) -> Any:
    return config_manager.get(f"ts4rebels.{key}", default)

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
        vault_path_str = _get_ts4rebels_config_value("vault_path", "")
        vault_root = Path(vault_path_str) if vault_path_str else Path.cwd() # Fallback to current working directory
        return PluginFrame(parent, vault_root=vault_root)

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
