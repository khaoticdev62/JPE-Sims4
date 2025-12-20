"""
CC Manager Plugin for JPE Studio.
"""

from __future__ import annotations

import logging
from typing import Optional, TYPE_CHECKING, Any

from PySide6.QtWidgets import QWidget

from .config import CCManagerConfig
from config.config_manager import config_manager

if TYPE_CHECKING:
    from config.config_manager import ConfigManager

logger = logging.getLogger(__name__)


class CCManagerPlugin:
    """
    Plugin for managing Sims 4 Custom Content and Mods.
    """

    def __init__(self, config_mgr: Optional[ConfigManager] = None) -> None:
        self.config_manager = config_mgr or config_manager
        self.config = self._load_config()

    def name(self) -> str:
        return "CC Manager"

    def version(self) -> str:
        return "1.0.0"

    def description(self) -> str:
        return "Browse, preview, and organize Sims 4 custom content."

    def _load_config(self) -> CCManagerConfig:
        """Load configuration from config manager."""
        if self.config_manager:
            data = self.config_manager.get("ccmanager", {})
            return CCManagerConfig.from_dict(data)
        return CCManagerConfig()

    def get_main_ui(self, parent: QWidget) -> QWidget:
        """
        Return the main UI widget for the plugin.
        Implements HasMainUI protocol.
        """
        from .cc_browser_ui import CCBrowserUI
        return CCBrowserUI(self, parent)

    def get_settings_panel(self, parent: QWidget) -> QWidget:
        """
        Return the settings panel widget for the plugin.
        Implements HasSettingsPanel protocol.
        """
        from .settings_panel import CCManagerSettingsPanel
        return CCManagerSettingsPanel(self, parent)


# Instantiate the plugin so it's discovered by PluginManager
cc_manager_plugin = CCManagerPlugin(config_manager)


def register_plugin(plugin_manager):
    """Register the plugin with the plugin manager."""
    plugin_manager.register(cc_manager_plugin)
