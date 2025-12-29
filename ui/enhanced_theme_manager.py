"""
Enhanced Theme Manager with ttkbootstrap Integration for JPE Sims 4 Mod Translator.

This module enhances the existing theme system with modern styling capabilities
using ttkbootstrap while maintaining compatibility with the existing system.
"""

import tkinter as tk
from tkinter import ttk
from typing import Dict, Tuple, Optional
from dataclasses import dataclass
import ttkbootstrap as ttkb
from ttkbootstrap import Style
from ui.theme_manager import ThemeManager, Theme
from ui.jpe_branding import (
    BRAND_ACCENT,
    BRAND_DARK,
    BRAND_LIGHT,
    DIAGNOSTIC_ERROR,
    DIAGNOSTIC_WARNING,
    DIAGNOSTIC_INFO,
    DIAGNOSTIC_SUCCESS,
    NEUTRAL_900,
    NEUTRAL_700,
    NEUTRAL_500,
    NEUTRAL_300,
    NEUTRAL_100,
)


@dataclass
class EnhancedTheme:
    """Enhanced theme with ttkbootstrap compatibility."""
    name: str
    display_name: str
    description: str
    ttkbootstrap_theme: str  # ttkbootstrap theme name
    custom_colors: Dict[str, str]  # Override specific colors


class EnhancedThemeManager:
    """Enhanced theme manager with ttkbootstrap integration."""
    
    def __init__(self):
        # Initialize ttkbootstrap style
        self.ttkb_style = Style(theme='flatly')  # Default theme
        self.enhanced_themes: Dict[str, EnhancedTheme] = {}
        self.current_ttkb_theme: str = 'flatly'
        
        # Map original themes to enhanced versions
        self._load_enhanced_themes()
    
    def _load_enhanced_themes(self):
        """Load enhanced themes with ttkbootstrap mappings."""
        # Create enhanced versions of existing themes
        self.enhanced_themes["cyberpunk"] = EnhancedTheme(
            name="cyberpunk",
            display_name="Cyberpunk Neon (Enhanced)",
            description="Neon lights in a dark digital world with modern styling",
            ttkbootstrap_theme="darkly",  # Dark theme with accent colors
            custom_colors={
                "primary": BRAND_ACCENT,  # Override with brand accent
                "light": "#1a1a1a",      # Dark background
                "dark": "#0a0a0a",       # Darker background
            }
        )
        
        self.enhanced_themes["sunset"] = EnhancedTheme(
            name="sunset",
            display_name="Sunset Glow (Enhanced)",
            description="Warm sunset colors for a cozy feel with modern styling",
            ttkbootstrap_theme="yeti",  # Light theme with warm colors
            custom_colors={
                "primary": "#d62828",    # Sunset red
                "secondary": "#f7a072",  # Accent color
            }
        )
        
        self.enhanced_themes["forest"] = EnhancedTheme(
            name="forest",
            display_name="Forest Twilight (Enhanced)",
            description="Deep forest greens with twilight mystery and modern styling", 
            ttkbootstrap_theme="darkly",  # Dark theme
            custom_colors={
                "primary": "#5a8f2d",    # Forest green
                "light": "#2d5016",      # Dark forest background
            }
        )
        
        self.enhanced_themes["ocean"] = EnhancedTheme(
            name="ocean",
            display_name="Ocean Depths (Enhanced)", 
            description="Deep ocean blues with coral accents and modern styling",
            ttkbootstrap_theme="superhero",  # Blue theme
            custom_colors={
                "primary": "#2a5b8c",    # Ocean blue
                "secondary": "#4fc3f7",  # Light blue accent
            }
        )
        
        self.enhanced_themes["vintage"] = EnhancedTheme(
            name="vintage",
            display_name="Vintage Paper (Enhanced)",
            description="Old paper with sepia tones and modern styling",
            ttkbootstrap_theme="litera",  # Light theme
            custom_colors={
                "primary": "#5c4b51",    # Sepia text
                "light": "#f4e4bc",      # Paper background
            }
        )
        
        self.enhanced_themes["cosmic"] = EnhancedTheme(
            name="cosmic",
            display_name="Cosmic Void (Enhanced)",
            description="Starry cosmos with nebula colors and modern styling",
            ttkbootstrap_theme="darkly",  # Dark theme
            custom_colors={
                "primary": "#5a4b8c",    # Cosmic purple
                "secondary": "#9c8ce6",  # Light purple accent
            }
        )
        
        self.enhanced_themes["tropical"] = EnhancedTheme(
            name="tropical",
            display_name="Tropical Paradise (Enhanced)",
            description="Vibrant tropical colors with modern styling",
            ttkbootstrap_theme="pulse",  # Vibrant theme
            custom_colors={
                "primary": "#2e7d32",    # Tropical green
                "secondary": "#8bc34a",  # Light green accent
            }
        )
        
        self.enhanced_themes["ice"] = EnhancedTheme(
            name="ice",
            display_name="Ice Crystal (Enhanced)",
            description="Cool ice blue with silver highlights and modern styling",
            ttkbootstrap_theme="morph",  # Light blue theme
            custom_colors={
                "primary": "#00838f",    # Ice blue
                "secondary": "#80deea",  # Light blue accent
            }
        )
        
        self.enhanced_themes["desert"] = EnhancedTheme(
            name="desert",
            display_name="Desert Sunset (Enhanced)",
            description="Warm desert tones with sunset gradients and modern styling",
            ttkbootstrap_theme="sandstone",  # Warm theme
            custom_colors={
                "primary": "#6d4c41",    # Desert brown
                "secondary": "#d7ccc8",  # Light desert accent
            }
        )
        
        self.enhanced_themes["midnight"] = EnhancedTheme(
            name="midnight",
            display_name="Midnight Purple (Enhanced)",
            description="Deep purple with starlight accents and modern styling",
            ttkbootstrap_theme="cyborg",  # Dark purple theme
            custom_colors={
                "primary": "#651fff",    # Midnight purple
                "secondary": "#e040fb",  # Bright accent
            }
        )
    
    def apply_enhanced_theme(self, widget: tk.Widget, theme_name: str):
        """Apply an enhanced theme using ttkbootstrap."""
        if theme_name in self.enhanced_themes:
            enhanced_theme = self.enhanced_themes[theme_name]
            
            # Change the ttkbootstrap theme
            self.ttkb_style.theme_use(enhanced_theme.ttkbootstrap_theme)
            self.current_ttkb_theme = enhanced_theme.ttkbootstrap_theme
            
            # Apply custom colors if specified
            for color_name, color_value in enhanced_theme.custom_colors.items():
                try:
                    # This is a simplified approach - in a full implementation, 
                    # we would apply custom color mappings to the ttkbootstrap style
                    self._apply_custom_color(color_name, color_value)
                except:
                    # If custom color application fails, continue with basic theme
                    pass
            
            # Apply to child widgets recursively
            self._apply_theme_recursive(widget)
        else:
            # Fall back to original theme manager if enhanced theme not found
            from ui.theme_manager import theme_manager
            theme_manager.apply_theme(widget, theme_name)
    
    def _apply_custom_color(self, color_name: str, color_value: str):
        """Apply a custom color override to the ttkbootstrap theme."""
        # This is a placeholder for the actual implementation
        # In a real scenario, we would modify the ttkbootstrap theme colors
        pass
    
    def _apply_theme_recursive(self, widget: tk.Widget):
        """Recursively apply theme to widget and its children."""
        try:
            # Apply theme to current widget based on type
            wtype = widget.winfo_class()
            
            # For ttk widgets, the ttkbootstrap theme will handle styling
            # For regular tkinter widgets, we might need custom handling
            
            # Example: Update colors for non-ttk widgets if necessary
            if wtype == 'Frame':
                # ttkbootstrap handles frame styling automatically
                pass
            elif wtype == 'Label':
                # ttkbootstrap handles label styling automatically
                pass
            elif wtype == 'Button':
                # ttkbootstrap handles button styling automatically
                pass
            elif wtype == 'Entry':
                # ttkbootstrap handles entry styling automatically
                pass
            elif wtype == 'Text':
                # Text widgets might need special handling
                try:
                    # Try to apply theme to text widget
                    pass
                except tk.TclError:
                    # Some widgets don't support style changes
                    pass
            
        except tk.TclError:
            # Some widgets don't support certain options
            pass

        # Recursively apply to children
        for child in widget.winfo_children():
            self._apply_theme_recursive(child)
    
    def get_available_enhanced_themes(self) -> Dict[str, EnhancedTheme]:
        """Get all available enhanced themes."""
        return self.enhanced_themes.copy()
    
    def get_ttkbootstrap_themes(self) -> list:
        """Get list of available ttkbootstrap themes."""
        return self.ttkb_style.theme_names()


class EnhancedUIManager:
    """Manager for enhanced UI components using ttkbootstrap."""
    
    def __init__(self):
        self.enhanced_theme_manager = EnhancedThemeManager()
    
    def create_styled_button(self, parent: tk.Widget, text: str, command=None, style: str = "primary"):
        """Create a styled button using ttkbootstrap."""
        return ttkb.Button(parent, text=text, command=command, bootstyle=style)
    
    def create_styled_entry(self, parent: tk.Widget, **kwargs):
        """Create a styled entry using ttkbootstrap."""
        return ttkb.Entry(parent, **kwargs)
    
    def create_styled_frame(self, parent: tk.Widget, **kwargs):
        """Create a styled frame using ttkbootstrap."""
        return ttkb.Frame(parent, **kwargs)
    
    def create_styled_label(self, parent: tk.Widget, text: str, **kwargs):
        """Create a styled label using ttkbootstrap."""
        return ttkb.Label(parent, text=text, **kwargs)
    
    def create_styled_combobox(self, parent: tk.Widget, **kwargs):
        """Create a styled combobox using ttkbootstrap."""
        return ttkb.Combobox(parent, **kwargs)
    
    def create_styled_progressbar(self, parent: tk.Widget, **kwargs):
        """Create a styled progressbar using ttkbootstrap."""
        return ttkb.Progressbar(parent, **kwargs)
    
    def create_styled_checkbutton(self, parent: tk.Widget, text: str, variable=None, **kwargs):
        """Create a styled checkbutton using ttkbootstrap."""
        return ttkb.Checkbutton(parent, text=text, variable=variable, **kwargs)
    
    def create_styled_radiobutton(self, parent: tk.Widget, text: str, variable=None, value=None, **kwargs):
        """Create a styled radiobutton using ttkbootstrap."""
        return ttkb.Radiobutton(parent, text=text, variable=variable, value=value, **kwargs)


# Global enhanced UI manager instance
enhanced_ui_manager = EnhancedUIManager()