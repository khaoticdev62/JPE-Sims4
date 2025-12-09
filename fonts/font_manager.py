"""
Font Management System for JPE Sims 4 Mod Translator.

This module provides a customizable font pack system that allows users to
select from various font options for different UI elements in the application.
"""

import os
import tkinter as tk
from tkinter import font
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path


@dataclass
class FontDefinition:
    """Definition of a font with its properties."""
    name: str
    family: str
    size: int
    weight: str = "normal"
    slant: str = "roman"
    underline: bool = False
    overstrike: bool = False
    platform_specific: Optional[Dict[str, str]] = None
    # Whether this font is part of the bundled collection
    bundled: bool = False


class FontPack:
    """A collection of fonts for different UI purposes."""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.fonts: Dict[str, FontDefinition] = {}
    
    def add_font(self, key: str, font_def: FontDefinition):
        """Add a font definition to the pack."""
        self.fonts[key] = font_def
    
    def get_font(self, key: str, size_override: Optional[int] = None) -> Optional[font.Font]:
        """Get a tkinter font object from the pack."""
        if key not in self.fonts:
            return None
            
        font_def = self.fonts[key]
        
        # Determine the actual family based on platform
        family = font_def.family
        if font_def.platform_specific:
            import sys
            platform = sys.platform
            if platform in font_def.platform_specific:
                family = font_def.platform_specific[platform]
        
        # Create the font with size override if provided
        size = size_override if size_override is not None else font_def.size
        
        return font.Font(
            family=family,
            size=size,
            weight=font_def.weight,
            slant=font_def.slant,
            underline=font_def.underline,
            overstrike=font_def.overstrike
        )


class FontManager:
    """Manages multiple font packs and provides font selection functionality."""

    def __init__(self):
        self.font_packs: Dict[str, FontPack] = {}
        self.current_font_pack: Optional[str] = None
        self.custom_fonts_dir = Path(__file__).parent / "custom_fonts"
        self.custom_fonts_dir.mkdir(exist_ok=True)
        self.bundled_fonts_dir = Path(__file__).parent / "bundled_fonts"

        # Register default font packs
        self._register_default_packs()

        # Register bundled fonts if available
        try:
            from .font_distribution import font_distribution_manager
            self._register_bundled_fonts()
        except ImportError:
            # Font distribution module not available, skip bundled fonts
            pass

    def _register_bundled_fonts(self):
        """Register bundled fonts as font packs."""
        try:
            from .font_distribution import font_distribution_manager
        except ImportError:
            return

        # Create a font pack for each category of bundled fonts
        categories = ["sans-serif", "serif", "monospace", "display"]

        for category in categories:
            fonts = font_distribution_manager.get_bundled_fonts_by_category(category)
            if fonts:
                # Create a new font pack for this category
                pack_name = f"bundled_{category}"
                pack_description = f"Bundled {category} fonts"
                category_pack = FontPack(pack_name, pack_description)

                # Add fonts from this category to the pack
                for i, font_info in enumerate(fonts):
                    # Use the first few fonts in each category for common UI elements
                    if i < 3:  # Limit to first 3 fonts per category
                        key_name = "default" if i == 0 else f"alt_{i}"
                        category_pack.add_font(
                            key_name,
                            FontDefinition(
                                name=font_info.name,
                                family=font_info.family,
                                size=10,
                                bundled=True
                            )
                        )

                self.font_packs[pack_name] = category_pack
    
    def _register_default_packs(self):
        """Register the default font packs."""
        # Classic Pack
        classic_pack = FontPack("classic", "Traditional UI fonts for maximum compatibility")
        classic_pack.add_font("default", FontDefinition(
            name="default",
            family="TkDefaultFont",
            size=10,
            weight="normal"
        ))
        classic_pack.add_font("header", FontDefinition(
            name="header", 
            family="TkDefaultFont",
            size=14,
            weight="bold"
        ))
        classic_pack.add_font("monospace", FontDefinition(
            name="monospace",
            family="TkFixedFont",
            size=10,
            weight="normal"
        ))
        self.font_packs["classic"] = classic_pack
        
        # Modern Pack
        modern_pack = FontPack("modern", "Modern sans-serif fonts for a clean look")
        modern_pack.add_font("default", FontDefinition(
            name="default",
            family="Segoe UI",
            size=10,
            weight="normal",
            platform_specific={
                "win32": "Segoe UI",
                "darwin": "SF Pro Display", 
                "linux": "Ubuntu"
            }
        ))
        modern_pack.add_font("header", FontDefinition(
            name="header",
            family="Segoe UI",
            size=14,
            weight="bold",
            platform_specific={
                "win32": "Segoe UI",
                "darwin": "SF Pro Display",
                "linux": "Ubuntu"
            }
        ))
        modern_pack.add_font("monospace", FontDefinition(
            name="monospace",
            family="Consolas",
            size=10,
            weight="normal",
            platform_specific={
                "win32": "Consolas",
                "darwin": "Menlo",
                "linux": "Monospace"
            }
        ))
        self.font_packs["modern"] = modern_pack
        
        # Readable Pack
        readable_pack = FontPack("readable", "Highly readable fonts with excellent contrast")
        readable_pack.add_font("default", FontDefinition(
            name="default",
            family="Arial",
            size=11,
            weight="normal"
        ))
        readable_pack.add_font("header", FontDefinition(
            name="header",
            family="Arial",
            size=15,
            weight="bold"
        ))
        readable_pack.add_font("monospace", FontDefinition(
            name="monospace", 
            family="Courier New",
            size=10,
            weight="normal"
        ))
        self.font_packs["readable"] = readable_pack
        
        # Developer Pack
        dev_pack = FontPack("developer", "Optimized for code reading and editing")
        dev_pack.add_font("default", FontDefinition(
            name="default",
            family="Consolas", 
            size=10,
            weight="normal",
            platform_specific={
                "win32": "Consolas",
                "darwin": "Menlo",
                "linux": "Monospace"
            }
        ))
        dev_pack.add_font("header", FontDefinition(
            name="header",
            family="Segoe UI",
            size=12,
            weight="bold",
            platform_specific={
                "win32": "Segoe UI", 
                "darwin": "SF Pro Display",
                "linux": "Ubuntu"
            }
        ))
        dev_pack.add_font("monospace", FontDefinition(
            name="monospace",
            family="Consolas",
            size=11,
            weight="normal",
            platform_specific={
                "win32": "Consolas",
                "darwin": "Menlo", 
                "linux": "Monospace"
            }
        ))
        self.font_packs["developer"] = dev_pack
    
    def register_font_pack(self, pack: FontPack):
        """Register a new font pack."""
        self.font_packs[pack.name] = pack
    
    def get_available_packs(self) -> List[str]:
        """Get list of available font pack names."""
        return list(self.font_packs.keys())

    def get_bundled_font_packs(self) -> List[str]:
        """Get list of bundled font pack names."""
        return [name for name in self.font_packs.keys() if name.startswith("bundled_")]

    def get_builtin_font_packs(self) -> List[str]:
        """Get list of built-in (non-bundled) font pack names."""
        return [name for name in self.font_packs.keys() if not name.startswith("bundled_")]
    
    def set_current_pack(self, pack_name: str):
        """Set the current font pack."""
        if pack_name in self.font_packs:
            self.current_font_pack = pack_name
        else:
            raise ValueError(f"Font pack '{pack_name}' not found")
    
    def get_current_pack(self) -> Optional[FontPack]:
        """Get the current font pack."""
        if self.current_font_pack and self.current_font_pack in self.font_packs:
            return self.font_packs[self.current_font_pack]
        return None
    
    def get_font(self, key: str, size_override: Optional[int] = None) -> Optional[font.Font]:
        """Get a font from the current pack."""
        if not self.current_font_pack:
            return None
            
        current_pack = self.font_packs[self.current_font_pack]
        return current_pack.get_font(key, size_override)
    
    def get_font_preview(self, pack_name: str) -> Dict[str, str]:
        """Get preview strings for all fonts in a pack."""
        if pack_name not in self.font_packs:
            return {}
            
        pack = self.font_packs[pack_name]
        preview = {}
        
        for key, font_def in pack.fonts.items():
            # Create a sample text based on the font purpose
            if key == "monospace":
                preview[key] = "0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz"
            elif key == "header":
                preview[key] = "Sample Header Text"
            else:
                preview[key] = "The quick brown fox jumps over the lazy dog"
                
        return preview


# Global font manager instance
font_manager = FontManager()


def get_platform_font() -> str:
    """
    Get the appropriate font for the current platform.
    
    This function maintains compatibility with the existing jpe_branding.py system.
    """
    import sys

    if sys.platform == "win32":
        return "Segoe UI"
    elif sys.platform == "darwin":
        return "SF Pro Display"
    else:
        return "Ubuntu"


def initialize_fonts():
    """Initialize fonts for the application."""
    # Set the default font pack
    font_manager.set_current_pack("modern")


# Initialize fonts when module is imported
initialize_fonts()