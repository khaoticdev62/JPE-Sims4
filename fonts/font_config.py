"""
Font Configuration System for JPE Sims 4 Mod Translator.

This module extends the configuration system to include font-specific settings.
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional
from config.config_manager import config_manager
from fonts.font_manager import font_manager


def register_font_configs():
    """Register font-related configuration defaults with the config manager."""
    # Extend the config manager with font settings
    current_config = config_manager.config
    
    # Add font settings if they don't exist
    if "fonts" not in current_config:
        current_config["fonts"] = {
            "current_pack": "modern",
            "size_multiplier": 1.0,
            "custom_font_paths": [],
            "override_defaults": {}
        }
        
    # Save back to config
    config_manager.config = current_config
    config_manager.save()


def get_current_font_pack() -> str:
    """Get the current font pack from configuration."""
    return config_manager.get("fonts.current_pack", "modern")


def set_current_font_pack(pack_name: str):
    """Set the current font pack in configuration."""
    config_manager.set("fonts.current_pack", pack_name)
    font_manager.set_current_pack(pack_name)


def get_font_size_multiplier() -> float:
    """Get the font size multiplier from configuration."""
    return config_manager.get("fonts.size_multiplier", 1.0)


def set_font_size_multiplier(multiplier: float):
    """Set the font size multiplier in configuration."""
    config_manager.set("fonts.size_multiplier", multiplier)


def add_custom_font_path(path: str):
    """Add a custom font path to the configuration."""
    custom_paths = config_manager.get("fonts.custom_font_paths", [])
    if path not in custom_paths:
        custom_paths.append(path)
        config_manager.set("fonts.custom_font_paths", custom_paths)


def get_override_fonts() -> Dict[str, Any]:
    """Get font overrides from configuration."""
    return config_manager.get("fonts.override_defaults", {})


def load_fonts_from_config():
    """Load font settings from configuration."""
    # Register defaults if not present
    register_font_configs()
    
    # Load the current font pack
    current_pack = get_current_font_pack()
    try:
        font_manager.set_current_pack(current_pack)
    except ValueError:
        # If pack doesn't exist, use default
        font_manager.set_current_pack("modern")
        set_current_font_pack("modern")


# Load font settings when module is imported
load_fonts_from_config()