"""
Font Integration Module for JPE Sims 4 Mod Translator.

This module integrates the font pack system with the theme manager
and other UI components.
"""

import tkinter as tk
from tkinter import ttk
from typing import Dict, Optional
from fonts.font_manager import font_manager


class FontThemeIntegration:
    """Integrates font packs with the theme manager."""

    def __init__(self):
        self.theme_manager = None  # Will be set later
        self.font_themes: Dict[str, str] = {}  # theme_name -> font_pack_name
    
    def register_font_for_theme(self, theme_name: str, font_pack_name: str):
        """Register a font pack to be used with a specific theme."""
        if self.theme_manager is None:
            raise ValueError("Theme manager not set")

        if theme_name in self.theme_manager.themes:
            self.font_themes[theme_name] = font_pack_name
        else:
            raise ValueError(f"Theme '{theme_name}' not found in theme manager")

    def apply_font_theme(self, widget: tk.Widget, theme_name: str):
        """Apply font styles associated with a theme."""
        if self.theme_manager is None:
            # If theme manager is not set, just return
            return

        if theme_name not in self.font_themes:
            # If no font pack registered for this theme, check if the theme has a font_pack
            theme = self.theme_manager.themes.get(theme_name)
            if theme and hasattr(theme, 'font_pack') and theme.font_pack:
                font_pack_name = theme.font_pack
            else:
                # No font pack associated with this theme, return
                return
        else:
            font_pack_name = self.font_themes[theme_name]

        try:
            font_manager.set_current_pack(font_pack_name)
        except ValueError:
            # Font pack doesn't exist, use default
            font_manager.set_current_pack("modern")
            return

        # Apply fonts to the widget based on its type
        self._apply_fonts_recursive(widget)
    
    def _apply_fonts_recursive(self, widget: tk.Widget):
        """Recursively apply fonts to widget and its children."""
        wtype = widget.winfo_class()
        
        # Determine font key based on widget type
        font_key = self._get_font_key_for_widget(wtype)
        
        if font_key:
            font_obj = font_manager.get_font(font_key)
            if font_obj:
                try:
                    # Apply font to the widget
                    widget.config(font=font_obj)
                except tk.TclError:
                    # Widget doesn't support font option
                    pass
        
        # Recursively apply to children
        for child in widget.winfo_children():
            self._apply_fonts_recursive(child)
    
    def _get_font_key_for_widget(self, widget_type: str) -> Optional[str]:
        """Get the appropriate font key for a widget type."""
        widget_font_mapping = {
            # Text display widgets
            'Text': 'default',
            'Label': 'default',
            'Message': 'default',
            
            # Header-like widgets
            'TLabel': 'default',  # For themed labels
            'Heading': 'header',  # For treeview headings
            
            # Input widgets
            'Entry': 'default',
            'TEntry': 'default',
            'Spinbox': 'default',
            
            # Button widgets
            'Button': 'default',
            'TButton': 'default',
            'Checkbutton': 'default',
            'TCheckbutton': 'default',
            'Radiobutton': 'default',
            'TRadiobutton': 'default',
            
            # Menu widgets
            'Menu': 'default',
            'Menubutton': 'default',
            
            # List/tree widgets
            'Listbox': 'default',
            'Treeview': 'default',
            
            # Special cases
            'TNotebook.Tab': 'default',  # Notebook tab font
        }
        
        return widget_font_mapping.get(widget_type)
    
    def get_font_for_widget_type(self, widget_type: str, theme_name: Optional[str] = None):
        """Get the appropriate font for a widget type in a theme."""
        if theme_name and theme_name in self.font_themes:
            font_pack_name = self.font_themes[theme_name]
            try:
                font_manager.set_current_pack(font_pack_name)
            except ValueError:
                font_manager.set_current_pack("modern")
        
        font_key = self._get_font_key_for_widget(widget_type)
        if font_key:
            return font_manager.get_font(font_key)
        return None


def apply_fonts_to_widget(widget: tk.Widget, font_key: str = "default", size_override: Optional[int] = None):
    """Apply a specific font from the current pack to a widget."""
    font_obj = font_manager.get_font(font_key, size_override)
    if font_obj:
        try:
            widget.config(font=font_obj)
        except tk.TclError:
            # Widget doesn't support font option
            pass


def apply_fonts_recursive(widget: tk.Widget, font_key: str = "default", size_override: Optional[int] = None):
    """Apply a specific font from the current pack to a widget and all its children."""
    apply_fonts_to_widget(widget, font_key, size_override)
    
    for child in widget.winfo_children():
        apply_fonts_recursive(child, font_key, size_override)


def get_current_font_info():
    """Get information about the current font pack and its fonts."""
    current_pack = font_manager.get_current_pack()
    if not current_pack:
        return {
            "pack_name": "None",
            "pack_description": "No font pack selected",
            "fonts": {}
        }
    
    return {
        "pack_name": current_pack.name,
        "pack_description": current_pack.description,
        "fonts": {key: {
            "family": font_def.family,
            "size": font_def.size,
            "weight": font_def.weight,
            "slant": font_def.slant
        } for key, font_def in current_pack.fonts.items()}
    }


# Global font integration instance
font_theme_integration = FontThemeIntegration()


def set_theme_manager_in_integration(theme_manager_instance):
    """Set the theme manager instance in the font integration."""
    font_theme_integration.theme_manager = theme_manager_instance


def apply_font_integration(widget: tk.Widget, theme_name: str):
    """Apply both theme and font integration to a widget."""
    # Import theme manager here to avoid circular import
    from ui.theme_manager import theme_manager

    # Apply theme first
    theme_manager.apply_theme(widget, theme_name)

    # Then apply font integration
    font_theme_integration.apply_font_theme(widget, theme_name)