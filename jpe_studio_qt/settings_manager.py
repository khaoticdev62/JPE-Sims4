"""Application settings and preferences management.

Handles loading, saving, and managing user preferences.
Supports default values, type validation, and change notifications.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Callable, Optional

logger = logging.getLogger(__name__)


class SettingsManager:
    """Manages application settings and user preferences.

    Features:
    - JSON-based settings storage
    - Default values with type validation
    - Change callbacks/observers
    - Setting groups (e.g., "ui", "editor", "build")
    - Import/export settings

    Usage:
        settings = SettingsManager()

        # Set defaults
        settings.set_default("ui.theme", "dark")
        settings.set_default("ui.font_size", 12)
        settings.set_default("editor.auto_save", True)

        # Get settings
        theme = settings.get("ui.theme")
        font_size = settings.get("ui.font_size", default=11)

        # Set values
        settings.set("ui.theme", "light")

        # Watch for changes
        settings.on_change("ui.theme", lambda new_value: print(f"Theme changed to {new_value}"))
    """

    def __init__(self, settings_dir: Path | str = None) -> None:
        """Initialize settings manager.

        Args:
            settings_dir: Directory to store settings (default: ~/.jpe_studio)
        """
        if settings_dir is None:
            settings_dir = Path.home() / ".jpe_studio"
        else:
            settings_dir = Path(settings_dir)

        self.settings_dir = Path(settings_dir)
        self.settings_dir.mkdir(parents=True, exist_ok=True)
        self.settings_file = self.settings_dir / "settings.json"

        self.settings: dict[str, Any] = {}
        self.defaults: dict[str, Any] = {}
        self.change_callbacks: dict[str, list[Callable]] = {}

        # Load existing settings
        self._load_settings()

    def set_default(self, key: str, value: Any) -> None:
        """Set a default value for a setting.

        Args:
            key: Setting key (supports dot notation, e.g., "ui.theme")
            value: Default value
        """
        self.defaults[key] = value

        # If not already set, use default
        if key not in self.settings:
            self.settings[key] = value

        logger.debug(f"Default set for '{key}': {value}")

    def get(self, key: str, default: Any = None) -> Any:
        """Get a setting value.

        Args:
            key: Setting key
            default: Default value if key not found

        Returns:
            Setting value or default if not set
        """
        if key in self.settings:
            return self.settings[key]

        if default is not None:
            return default

        return self.defaults.get(key)

    def set(self, key: str, value: Any) -> None:
        """Set a setting value.

        Args:
            key: Setting key
            value: New value
        """
        old_value = self.settings.get(key)

        self.settings[key] = value

        # Only notify if value actually changed
        if old_value != value:
            self._notify_change(key, value)

        # Auto-save on change
        self._save_settings()

        logger.debug(f"Setting '{key}' changed to {value}")

    def get_group(self, prefix: str) -> dict[str, Any]:
        """Get all settings in a group.

        Args:
            prefix: Group prefix (e.g., "ui" for "ui.theme", "ui.font_size")

        Returns:
            Dictionary of settings in that group
        """
        group = {}
        prefix_with_dot = f"{prefix}."

        for key, value in self.settings.items():
            if key.startswith(prefix_with_dot):
                group_key = key[len(prefix_with_dot) :]
                group[group_key] = value

        return group

    def set_group(self, prefix: str, values: dict[str, Any]) -> None:
        """Set multiple settings in a group.

        Args:
            prefix: Group prefix
            values: Dictionary of key-value pairs to set
        """
        for key, value in values.items():
            full_key = f"{prefix}.{key}"
            self.set(full_key, value)

    def on_change(self, key: str, callback: Callable[[Any], None]) -> None:
        """Register callback for setting changes.

        Args:
            key: Setting key to watch
            callback: Function called with new value when setting changes
        """
        if key not in self.change_callbacks:
            self.change_callbacks[key] = []

        self.change_callbacks[key].append(callback)

    def _notify_change(self, key: str, value: Any) -> None:
        """Notify callbacks of setting change."""
        if key in self.change_callbacks:
            for callback in self.change_callbacks[key]:
                try:
                    callback(value)
                except Exception as e:
                    logger.warning(f"Callback error for '{key}': {e}")

    def _load_settings(self) -> None:
        """Load settings from disk."""
        try:
            if self.settings_file.exists():
                with open(self.settings_file, "r") as f:
                    self.settings = json.load(f)
                logger.info(f"Settings loaded from {self.settings_file}")
            else:
                logger.info("No existing settings file, starting fresh")
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse settings: {e}, using defaults")
            self.settings = {}
        except Exception as e:
            logger.error(f"Failed to load settings: {e}")
            self.settings = {}

    def _save_settings(self) -> None:
        """Save settings to disk."""
        try:
            with open(self.settings_file, "w") as f:
                json.dump(self.settings, f, indent=2, default=str)
            logger.debug(f"Settings saved to {self.settings_file}")
        except Exception as e:
            logger.error(f"Failed to save settings: {e}")

    def reset_to_defaults(self) -> None:
        """Reset all settings to their default values."""
        self.settings = self.defaults.copy()
        self._save_settings()
        logger.info("Settings reset to defaults")

    def clear(self) -> None:
        """Clear all settings."""
        self.settings.clear()
        self._save_settings()
        logger.info("Settings cleared")

    def export_settings(self, export_path: Path | str) -> bool:
        """Export settings to a file.

        Args:
            export_path: Path to export file

        Returns:
            True if successful
        """
        try:
            with open(export_path, "w") as f:
                json.dump(self.settings, f, indent=2, default=str)
            logger.info(f"Settings exported to {export_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to export settings: {e}")
            return False

    def import_settings(self, import_path: Path | str, merge: bool = True) -> bool:
        """Import settings from a file.

        Args:
            import_path: Path to settings file
            merge: If True, merge with existing settings; if False, replace all

        Returns:
            True if successful
        """
        try:
            with open(import_path, "r") as f:
                imported = json.load(f)

            if merge:
                self.settings.update(imported)
            else:
                self.settings = imported

            self._save_settings()
            logger.info(f"Settings imported from {import_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to import settings: {e}")
            return False


# Preset settings categories
DEFAULT_SETTINGS = {
    # UI Settings
    "ui.theme": "dark",
    "ui.font_size": 12,
    "ui.window_width": 1200,
    "ui.window_height": 800,
    "ui.show_breadcrumbs": True,
    "ui.animation_enabled": True,
    "ui.animation_speed": 1.0,
    # Editor Settings
    "editor.auto_save_enabled": True,
    "editor.auto_save_interval": 60,
    "editor.word_wrap": True,
    "editor.font": "monospace",
    # Build Settings
    "build.auto_refresh_builds": True,
    "build.refresh_interval": 5,
    "build.max_history": 50,
    # Project Settings
    "project.default_location": str(Path.home() / "JPEProjects"),
    "project.auto_load_recent": True,
    "project.recent_projects": [],
    # Shortcuts
    "shortcuts.enabled": True,
    "shortcuts.custom": {},
}
