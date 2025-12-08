"""Advanced Theme Manager for JPE Sims 4 Mod Translator."""

import tkinter as tk
from tkinter import ttk
from typing import Dict, Tuple, Optional
from dataclasses import dataclass


@dataclass
class Theme:
    """Data structure for theme configuration."""
    name: str
    display_name: str
    description: str
    bg: str
    fg: str
    select_bg: str
    select_fg: str
    button_bg: str
    button_fg: str
    button_hover: str
    entry_bg: str
    entry_fg: str
    text_bg: str
    text_fg: str
    highlight_color: str
    disabled_bg: str
    disabled_fg: str


class ThemeManager:
    """Manages application themes with 10 hyper unique themes."""

    def __init__(self):
        self.themes: Dict[str, Theme] = {}
        self.current_theme: Optional[str] = None
        self.style = ttk.Style()
        self._load_themes()
    
    def _load_themes(self):
        """Load all 10 hyper unique themes."""
        # Theme 1: Cyberpunk Neon
        self.themes["cyberpunk"] = Theme(
            name="cyberpunk",
            display_name="Cyberpunk Neon",
            description="Neon lights in a dark digital world",
            bg="#0a0a0a",
            fg="#00ff8c",
            select_bg="#ff0080",
            select_fg="#ffffff",
            button_bg="#00ff8c",
            button_fg="#0a0a0a",
            button_hover="#00cc70",
            entry_bg="#1a1a1a",
            entry_fg="#00ff8c",
            text_bg="#000011",
            text_fg="#00ff8c",
            highlight_color="#ff0080",
            disabled_bg="#2a2a2a",
            disabled_fg="#5a5a5a"
        )
        
        # Theme 2: Sunset Glow
        self.themes["sunset"] = Theme(
            name="sunset",
            display_name="Sunset Glow",
            description="Warm sunset colors for a cozy feel",
            bg="#ffecd2",
            fg="#d62828",
            select_bg="#f7a072",
            select_fg="#ffffff",
            button_bg="#d62828",
            button_fg="#ffffff",
            button_hover="#b71c1c",
            entry_bg="#fff5e6",
            entry_fg="#d62828",
            text_bg="#fff8f0",
            text_fg="#d62828",
            highlight_color="#f7a072",
            disabled_bg="#f5d0a0",
            disabled_fg="#d0a070"
        )
        
        # Theme 3: Forest Twilight
        self.themes["forest"] = Theme(
            name="forest",
            display_name="Forest Twilight",
            description="Deep forest greens with twilight mystery",
            bg="#2d5016",
            fg="#e0f7c4",
            select_bg="#5a8f2d",
            select_fg="#ffffff",
            button_bg="#5a8f2d",
            button_fg="#ffffff",
            button_hover="#4a7f1d",
            entry_bg="#3d6026",
            entry_fg="#e0f7c4",
            text_bg="#1d3006",
            text_fg="#e0f7c4",
            highlight_color="#8bc34a",
            disabled_bg="#5d8046",
            disabled_fg="#a0c080"
        )
        
        # Theme 4: Ocean Depths
        self.themes["ocean"] = Theme(
            name="ocean",
            display_name="Ocean Depths",
            description="Deep ocean blues with coral accents",
            bg="#0c1e3e",
            fg="#a7c5eb",
            select_bg="#2a5b8c",
            select_fg="#ffffff",
            button_bg="#2a5b8c",
            button_fg="#ffffff",
            button_hover="#1a4b7c",
            entry_bg="#1c2e4e",
            entry_fg="#a7c5eb",
            text_bg="#050f2c",
            text_fg="#a7c5eb",
            highlight_color="#4fc3f7",
            disabled_bg="#3c4e6e",
            disabled_fg="#7c9eb0"
        )
        
        # Theme 5: Vintage Paper
        self.themes["vintage"] = Theme(
            name="vintage",
            display_name="Vintage Paper",
            description="Old paper with sepia tones",
            bg="#f4e4bc",
            fg="#5c4b51",
            select_bg="#a89f9c",
            select_fg="#ffffff",
            button_bg="#5c4b51",
            button_fg="#f4e4bc",
            button_hover="#4c3b41",
            entry_bg="#f5e9cc",
            entry_fg="#5c4b51",
            text_bg="#f8f0d8",
            text_fg="#5c4b51",
            highlight_color="#d4c4a8",
            disabled_bg="#e0d0b0",
            disabled_fg="#a09070"
        )
        
        # Theme 6: Cosmic Void
        self.themes["cosmic"] = Theme(
            name="cosmic",
            display_name="Cosmic Void",
            description="Starry cosmos with nebula colors",
            bg="#050026",
            fg="#c5b3e6",
            select_bg="#5a4b8c",
            select_fg="#ffffff",
            button_bg="#5a4b8c",
            button_fg="#ffffff",
            button_hover="#4a3b7c",
            entry_bg="#100a36",
            entry_fg="#c5b3e6",
            text_bg="#020016",
            text_fg="#c5b3e6",
            highlight_color="#9c8ce6",
            disabled_bg="#201a46",
            disabled_fg="#605a80"
        )
        
        # Theme 7: Tropical Paradise
        self.themes["tropical"] = Theme(
            name="tropical",
            display_name="Tropical Paradise",
            description="Vibrant tropical colors",
            bg="#e3f2c1",
            fg="#2e7d32",
            select_bg="#4caf50",
            select_fg="#ffffff",
            button_bg="#2e7d32",
            button_fg="#ffffff",
            button_hover="#1e5d22",
            entry_bg="#e9f5d0",
            entry_fg="#2e7d32",
            text_bg="#eaf7d5",
            text_fg="#2e7d32",
            highlight_color="#8bc34a",
            disabled_bg="#d0e0b0",
            disabled_fg="#90b070"
        )
        
        # Theme 8: Ice Crystal
        self.themes["ice"] = Theme(
            name="ice",
            display_name="Ice Crystal",
            description="Cool ice blue with silver highlights",
            bg="#e0f7fa",
            fg="#006064",
            select_bg="#26c6da",
            select_fg="#ffffff",
            button_bg="#00838f",
            button_fg="#ffffff",
            button_hover="#006064",
            entry_bg="#e8f8f9",
            entry_fg="#006064",
            text_bg="#eafaf9",
            text_fg="#006064",
            highlight_color="#80deea",
            disabled_bg="#b0e0e6",
            disabled_fg="#70a0a6"
        )
        
        # Theme 9: Desert Sunset
        self.themes["desert"] = Theme(
            name="desert",
            display_name="Desert Sunset",
            description="Warm desert tones with sunset gradients",
            bg="#ffdfba",
            fg="#8d6e63",
            select_bg="#a1887f",
            select_fg="#ffffff",
            button_bg="#6d4c41",
            button_fg="#ffffff",
            button_hover="#5d3c31",
            entry_bg="#ffe5cc",
            entry_fg="#8d6e63",
            text_bg="#fff0e0",
            text_fg="#8d6e63",
            highlight_color="#d7ccc8",
            disabled_bg="#e0c0a0",
            disabled_fg="#b09070"
        )
        
        # Theme 10: Midnight Purple
        self.themes["midnight"] = Theme(
            name="midnight",
            display_name="Midnight Purple",
            description="Deep purple with starlight accents",
            bg="#1a0633",
            fg="#b388eb",
            select_bg="#7c4dff",
            select_fg="#ffffff",
            button_bg="#651fff",
            button_fg="#ffffff",
            button_hover="#550fef",
            entry_bg="#2a1643",
            entry_fg="#b388eb",
            text_bg="#0f0226",
            text_fg="#b388eb",
            highlight_color="#e040fb",
            disabled_bg="#3a2653",
            disabled_fg="#7a6a93"
        )
    
    def apply_theme(self, widget: tk.Widget, theme_name: str):
        """Apply a specific theme to a widget and its children."""
        if theme_name not in self.themes:
            return

        theme = self.themes[theme_name]
        self.current_theme = theme_name

        # Configure the ttk style for this theme
        self._configure_ttk_styles(theme)

        # Apply theme to the widget and its children recursively
        self._apply_theme_recursive(widget, theme)

    def _configure_ttk_styles(self, theme: Theme):
        """Configure ttk styles for the theme."""
        # Configure general TTK styles
        self.style.configure(
            ".",  # Apply to all widgets
            background=theme.bg,
            foreground=theme.fg,
            fieldbackground=theme.entry_bg,
            selectbackground=theme.select_bg,
            selectforeground=theme.select_fg
        )

        # Button style
        self.style.configure(
            "TButton",
            background=theme.button_bg,
            foreground=theme.button_fg,
            borderwidth=2,
            focuscolor='none',
            padding=(8, 4)
        )
        self.style.map(
            "TButton",
            background=[('active', theme.button_hover), ('disabled', theme.disabled_bg)],
            foreground=[('active', theme.button_fg), ('disabled', theme.disabled_fg)],
        )

        # Entry style
        self.style.configure(
            "TEntry",
            fieldbackground=theme.entry_bg,
            foreground=theme.entry_fg,
            insertcolor=theme.text_fg,
            borderwidth=1
        )

        # Frame style
        self.style.configure(
            "TFrame",
            background=theme.bg
        )

        # Label style
        self.style.configure(
            "TLabel",
            background=theme.bg,
            foreground=theme.fg
        )

        # Labelframe style
        self.style.configure(
            "TLabelframe",
            background=theme.bg,
            foreground=theme.fg
        )

        # Checkbutton style
        self.style.configure(
            "TCheckbutton",
            background=theme.bg,
            foreground=theme.fg
        )
        self.style.map(
            "TCheckbutton",
            background=[('active', theme.bg)],
            foreground=[('active', theme.fg)]
        )

        # Radiobutton style
        self.style.configure(
            "TRadiobutton",
            background=theme.bg,
            foreground=theme.fg
        )
        self.style.map(
            "TRadiobutton",
            background=[('active', theme.bg)],
            foreground=[('active', theme.fg)]
        )

        # Notebook style
        self.style.configure(
            "TNotebook",
            background=theme.bg
        )

        # Progressbar style
        self.style.configure(
            "Horizontal.TProgressbar",
            background=theme.highlight_color,
            troughcolor=theme.bg,
            bordercolor=theme.bg
        )

        # Scrollbar style
        self.style.configure(
            "Vertical.TScrollbar",
            background=theme.highlight_color,
            troughcolor=theme.bg
        )
        self.style.configure(
            "Horizontal.TScrollbar",
            background=theme.highlight_color,
            troughcolor=theme.bg
        )

    def _apply_theme_recursive(self, widget: tk.Widget, theme: Theme):
        """Recursively apply theme to widget and all its children."""
        try:
            # Apply to current widget based on type
            wtype = widget.winfo_class()

            if wtype in ['Tk', 'Toplevel']:
                widget.configure(bg=theme.bg, fg=theme.fg)
            elif wtype == 'Frame':
                widget.configure(bg=theme.bg)
            elif wtype == 'Label':
                widget.configure(bg=theme.bg, fg=theme.fg)
            elif wtype == 'Button':
                widget.configure(
                    bg=theme.button_bg,
                    fg=theme.button_fg,
                    activebackground=theme.button_hover,
                    activeforeground=theme.button_fg,
                    disabledforeground=theme.disabled_fg,
                    relief=tk.RAISED,
                    borderwidth=2
                )
            elif wtype == 'Entry':
                widget.configure(
                    bg=theme.entry_bg,
                    fg=theme.entry_fg,
                    insertbackground=theme.text_fg,
                    selectbackground=theme.select_bg,
                    selectforeground=theme.select_fg,
                    disabledbackground=theme.disabled_bg,
                    disabledforeground=theme.disabled_fg
                )
            elif wtype == 'Text':
                widget.configure(
                    bg=theme.text_bg,
                    fg=theme.text_fg,
                    insertbackground=theme.text_fg,
                    selectbackground=theme.select_bg,
                    selectforeground=theme.select_fg,
                    highlightthickness=1,
                    highlightcolor=theme.highlight_color
                )
            elif wtype == 'Listbox':
                widget.configure(
                    bg=theme.entry_bg,
                    fg=theme.entry_fg,
                    selectbackground=theme.select_bg,
                    selectforeground=theme.select_fg,
                    disabledforeground=theme.disabled_fg
                )
            elif wtype == 'Canvas':
                widget.configure(bg=theme.bg)
            elif wtype == 'Menu':
                widget.configure(
                    background=theme.bg,
                    foreground=theme.fg,
                    activebackground=theme.select_bg,
                    activeforeground=theme.select_fg,
                    disabledforeground=theme.disabled_fg
                )
            elif wtype == 'Scale':
                widget.configure(
                    bg=theme.bg,
                    fg=theme.fg,
                    troughcolor=theme.highlight_color,
                    sliderrelief=tk.RAISED
                )
            elif wtype == 'Panedwindow':
                widget.configure(bg=theme.bg, sashrelief=tk.RAISED)

        except tk.TclError:
            # Some widgets don't support these options
            pass

        # Recursively apply to children
        for child in widget.winfo_children():
            self._apply_theme_recursive(child, theme)

    def get_themes(self):
        """Get list of available themes."""
        return [theme.display_name for theme in self.themes.values()]

    def get_theme_by_display_name(self, display_name: str) -> Optional[str]:
        """Get internal theme name by display name."""
        for theme_name, theme in self.themes.items():
            if theme.display_name == display_name:
                return theme_name
        return None


# Global theme manager instance
theme_manager = ThemeManager()