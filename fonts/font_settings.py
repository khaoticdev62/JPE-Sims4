"""
Font Settings Interface for JPE Sims 4 Mod Translator.

This module provides a settings panel for font preferences that can be integrated 
into the main application settings.
"""

import tkinter as tk
from tkinter import ttk
from typing import Optional, Callable
from fonts.font_manager import font_manager
from fonts.font_config import (
    get_current_font_pack, 
    set_current_font_pack,
    get_font_size_multiplier,
    set_font_size_multiplier
)
from fonts.font_preview import show_font_preview
from fonts.font_installer import show_font_installer


class FontSettingsPanel:
    """Font settings panel that can be integrated into application settings."""
    
    def __init__(self, parent: ttk.Frame):
        self.parent = parent
        self.callbacks: list[Callable] = []  # List of callbacks to run when settings change
        
        self.create_widgets()
        self.load_settings()
    
    def create_widgets(self):
        """Create the font settings widgets."""
        # Main container
        container = ttk.LabelFrame(self.parent, text="Font Settings", padding=15)
        container.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Font pack selection
        pack_frame = ttk.Frame(container)
        pack_frame.pack(fill=tk.X, pady=(0, 15))
        
        ttk.Label(pack_frame, text="Font Pack:").pack(anchor=tk.W)
        
        self.pack_var = tk.StringVar()
        pack_selector = ttk.Combobox(
            pack_frame,
            textvariable=self.pack_var,
            values=font_manager.get_available_packs(),
            state="readonly",
            width=25
        )
        pack_selector.pack(side=tk.LEFT, pady=(5, 0))
        pack_selector.bind("<<ComboboxSelected>>", self.on_pack_change)
        
        # Preview button
        preview_btn = ttk.Button(
            pack_frame,
            text="Preview Fonts",
            command=self.show_preview
        )
        preview_btn.pack(side=tk.RIGHT, padx=(10, 0))
        
        # Size multiplier
        size_frame = ttk.Frame(container)
        size_frame.pack(fill=tk.X, pady=(0, 15))
        
        ttk.Label(size_frame, text="Font Size Multiplier:").pack(anchor=tk.W)
        
        self.size_var = tk.DoubleVar()
        size_scale = ttk.Scale(
            size_frame,
            from_=0.8,
            to=2.0,
            variable=self.size_var,
            command=self.on_size_change,
            length=300
        )
        size_scale.pack(side=tk.LEFT, pady=(5, 0), fill=tk.X, expand=True)
        
        self.size_label = ttk.Label(
            size_frame,
            text="1.0x",
            width=6
        )
        self.size_label.pack(side=tk.LEFT, padx=(10, 0))
        
        # Install custom fonts button
        install_frame = ttk.Frame(container)
        install_frame.pack(fill=tk.X, pady=(0, 15))
        
        install_btn = ttk.Button(
            install_frame,
            text="Install Custom Fonts...",
            command=self.show_font_installer
        )
        install_btn.pack(anchor=tk.W)
        
        # Preview button
        preview_all_btn = ttk.Button(
            install_frame,
            text="Font Pack Previewer",
            command=self.show_preview
        )
        preview_all_btn.pack(side=tk.RIGHT)
    
    def load_settings(self):
        """Load current settings into the UI."""
        current_pack = get_current_font_pack()
        self.pack_var.set(current_pack)
        
        size_multiplier = get_font_size_multiplier()
        self.size_var.set(size_multiplier)
        self.size_label.config(text=f"{size_multiplier:.1f}x")
    
    def on_pack_change(self, event=None):
        """Handle font pack change."""
        selected_pack = self.pack_var.get()
        if selected_pack:
            set_current_font_pack(selected_pack)
            self._run_callbacks()
    
    def on_size_change(self, value):
        """Handle font size change."""
        multiplier = float(value)
        set_font_size_multiplier(multiplier)
        self.size_label.config(text=f"{multiplier:.1f}x")
        self._run_callbacks()
    
    def show_preview(self):
        """Show font preview window."""
        try:
            # This would typically be called with the main window as parent
            # For now we'll just use a dummy parent or None
            show_font_preview(self.parent.winfo_toplevel())
        except tk.TclError:
            # If we can't get the toplevel, create a new window
            root = tk.Tk()
            root.withdraw()  # Hide the root window
            preview = show_font_preview(root)
            
            # Handle the window closing
            def on_close():
                root.destroy()
            
            preview.window.protocol("WM_DELETE_WINDOW", on_close)
    
    def show_font_installer(self):
        """Show font installer window."""
        try:
            show_font_installer(self.parent.winfo_toplevel())
        except tk.TclError:
            # If we can't get the toplevel, create a new window
            root = tk.Tk()
            root.withdraw()  # Hide the root window
            installer = show_font_installer(root)
            
            # Handle the window closing
            def on_close():
                root.destroy()
            
            installer.window.protocol("WM_DELETE_WINDOW", on_close)
    
    def add_change_callback(self, callback: Callable):
        """Add a callback to be run when font settings change."""
        self.callbacks.append(callback)
    
    def _run_callbacks(self):
        """Run all registered callbacks."""
        for callback in self.callbacks:
            try:
                callback()
            except Exception as e:
                print(f"Error in font settings callback: {e}")


def create_font_settings_tab(notebook: ttk.Notebook):
    """Create a font settings tab and add it to the notebook."""
    tab_frame = ttk.Frame(notebook)
    
    # Create the font settings panel
    font_panel = FontSettingsPanel(tab_frame)
    
    # Add a description label
    desc_label = ttk.Label(
        tab_frame, 
        text="Customize the fonts used throughout the application",
        font=("TkDefaultFont", 9)
    )
    desc_label.pack(pady=(0, 10))
    
    return tab_frame, font_panel