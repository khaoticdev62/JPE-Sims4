"""JPE Sims 4 Mod Translator - Icon System and Branding Assets."""

import tkinter as tk
from tkinter import ttk
import os
from pathlib import Path
from enum import Enum
from typing import Dict, Optional


class JPEIconType(Enum):
    """Types of icons in the JPE ecosystem."""
    PROJECT = "project"
    INTERACTION = "interaction"
    BUFF = "buff"
    TRAIT = "trait"
    ENUM = "enum"
    STRING = "string"
    FOLDER = "folder"
    FILE = "file"
    BUILD = "build"
    SETTINGS = "settings"
    DOCUMENTATION = "documentation"
    ONBOARDING = "onboarding"
    PLUGIN = "plugin"
    CLOUD_SYNC = "cloud_sync"
    REPORT = "report"
    TOOLS = "tools"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    SUCCESS = "success"


class JPEIconModule:
    """Module for managing JPE icons and branding assets."""

    def __init__(self):
        self.icons: Dict[JPEIconType, str] = {}  # Store color codes initially
        self._define_default_icons()

    def _define_default_icons(self):
        """Define default icon colors for the application."""
        # Define the colors for each icon type (will be turned into images when requested)
        self.icon_colors = {
            JPEIconType.PROJECT: "#4A90E2",
            JPEIconType.INTERACTION: "#7ED321",
            JPEIconType.BUFF: "#F5A623",
            JPEIconType.TRAIT: "#BD10E0",
            JPEIconType.ENUM: "#9013FE",
            JPEIconType.STRING: "#4A90E2",
            JPEIconType.FOLDER: "#F5A623",
            JPEIconType.FILE: "#8B8B8B",
            JPEIconType.BUILD: "#7ED321",
            JPEIconType.SETTINGS: "#4A4A4A",
            JPEIconType.DOCUMENTATION: "#50E3C2",
            JPEIconType.ONBOARDING: "#B8E986",
            JPEIconType.PLUGIN: "#F8E71C",
            JPEIconType.CLOUD_SYNC: "#B0D2EB",
            JPEIconType.REPORT: "#D0021B",
            JPEIconType.TOOLS: "#F5A623",
            JPEIconType.ERROR: "#D0021B",
            JPEIconType.WARNING: "#F5A623",
            JPEIconType.INFO: "#4A90E2",
            JPEIconType.SUCCESS: "#7ED321"
        }

    def get_icon(self, icon_type: JPEIconType, tk_root: tk.Tk = None) -> tk.PhotoImage:
        """Get the icon for a specific type, creating it if needed."""
        if tk_root is None:
            # If no root is provided, return a simple placeholder
            # In a real implementation, we'd have a default root
            return None

        # Create the icon image on-demand
        color = self.icon_colors.get(icon_type, "#CCCCCC")
        image = tk.PhotoImage(width=16, height=16)

        # Fill the image with the color
        for x in range(16):
            for y in range(16):
                image.put(color, (x, y))

        return image

    def get_icon_for_resource(self, resource_type: str, tk_root: tk.Tk = None) -> tk.PhotoImage:
        """Get the appropriate icon for a resource type."""
        mapping = {
            "project": JPEIconType.PROJECT,
            "interaction": JPEIconType.INTERACTION,
            "buff": JPEIconType.BUFF,
            "trait": JPEIconType.TRAIT,
            "enum": JPEIconType.ENUM,
            "string": JPEIconType.STRING,
            "folder": JPEIconType.FOLDER,
            "file": JPEIconType.FILE,
            "build": JPEIconType.BUILD,
            "settings": JPEIconType.SETTINGS,
            "doc": JPEIconType.DOCUMENTATION,
            "onboarding": JPEIconType.ONBOARDING,
            "plugin": JPEIconType.PLUGIN,
            "sync": JPEIconType.CLOUD_SYNC,
            "report": JPEIconType.REPORT,
            "tools": JPEIconType.TOOLS,
            "error": JPEIconType.ERROR,
            "warning": JPEIconType.WARNING,
            "info": JPEIconType.INFO,
            "success": JPEIconType.SUCCESS,
        }

        icon_type = mapping.get(resource_type.lower(), JPEIconType.FILE)


class JPEBranding:
    """Class managing JPE visual identity and branding elements."""

    def __init__(self):
        self.colors = {
            # Primary colors
            "primary_blue": "#2C5F99",      # JPE primary blue
            "secondary_green": "#7EC154",   # Secondary green
            "accent_orange": "#FF8A34",     # Accent orange
            "neutral_gray": "#4A4A4A",      # Neutral gray

            # UI colors
            "bg_light": "#FFFFFF",          # Light backgrounds
            "bg_medium": "#F8F8F8",         # Medium backgrounds
            "bg_dark": "#ECECEC",           # Dark backgrounds
            "text_primary": "#2C2C2C",      # Primary text
            "text_secondary": "#7D7D7D",    # Secondary text
            "border": "#D8D8D8",            # Border color
            "success": "#4CAF50",           # Success color
            "warning": "#FFC107",           # Warning color
            "error": "#F44336",             # Error color
            "info": "#2196F3"              # Info color
        }

        self.typography = {
            "title_font": ("Segoe UI", 16, "bold"),
            "header_font": ("Segoe UI", 12, "bold"),
            "body_font": ("Segoe UI", 10),
            "small_font": ("Segoe UI", 9),
            "code_font": ("Consolas", 10)
        }

    def apply_branding_to_widget(self, widget: tk.Widget, element_type: str = "default"):
        """Apply JPE branding to a widget."""
        # This would apply the branding colors and fonts to a widget
        # For now, we'll just return the appropriate colors

        element_colors = {
            "primary_button": {
                "background": self.colors["primary_blue"],
                "foreground": self.colors["bg_light"],
                "hover": "#1D4F89"
            },
            "secondary_button": {
                "background": self.colors["bg_medium"],
                "foreground": self.colors["text_primary"],
                "hover": self.colors["bg_dark"]
            },
            "success_button": {
                "background": self.colors["success"],
                "foreground": self.colors["bg_light"],
                "hover": "#43A047"
            },
            "default": {
                "background": self.colors["bg_light"],
                "foreground": self.colors["text_primary"],
                "hover": self.colors["bg_medium"]
            }
        }

        return element_colors.get(element_type, element_colors["default"])

    def apply_branding(self, widget: tk.Widget, element_type: str = "default"):
        """Apply JPE branding to a widget by configuring its appearance."""
        colors = self.apply_branding_to_widget(widget, element_type)

        # Depending on the widget type, configure appropriately
        try:
            # Try to apply background/foreground colors
            widget.configure(
                background=colors["background"],
                foreground=colors["foreground"]
            )
        except tk.TclError:
            # Widget doesn't support bg/fg colors
            pass

        return colors


# Global instance to use throughout the application
icon_module = JPEIconModule()
branding_manager = JPEBranding()