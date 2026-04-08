"""
Visual Theme Selector for JPE Sims 4 Mod Translator.

This module provides a Tkinter-based UI for selecting themes with visual previews
generated using Pillow and the design system.
"""

import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import os
from pathlib import Path
from typing import Optional, Dict, Any
from ui.theme_manager import theme_manager
from ui.visual_theme_preview import VisualThemePreviewGenerator


class VisualThemeSelector:
    """
    A visual theme selector that displays thumbnails of themes with previews.
    """
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        self.preview_generator = VisualThemePreviewGenerator()
        self.previews: Dict[str, Any] = {}
        self.selected_theme_var = tk.StringVar()
        
        self.create_widgets()
        self.load_previews()
        
    def create_widgets(self):
        """Create the visual theme selector UI."""
        # Main frame
        main_frame = ttk.Frame(self.parent)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Title
        title_label = ttk.Label(
            main_frame,
            text="Visual Theme Selector",
            font=("Arial", 14, "bold")
        )
        title_label.pack(pady=(0, 10))
        
        # Create canvas with scrollbar for theme previews
        canvas_frame = ttk.Frame(main_frame)
        canvas_frame.pack(fill=tk.BOTH, expand=True)
        
        canvas = tk.Canvas(canvas_frame)
        scrollbar = ttk.Scrollbar(canvas_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        # Theme frames with previews
        self.theme_frames = {}
        
        for theme_name, theme in theme_manager.themes.items():
            theme_frame = ttk.LabelFrame(scrollable_frame, text=theme.display_name, padding=10)
            theme_frame.pack(fill=tk.X, padx=5, pady=5)
            
            # Load and display preview image
            preview_path = self.previews.get(theme_name)
            if preview_path and os.path.exists(preview_path):
                # Load image and resize it
                pil_image = Image.open(preview_path)
                # Resize image to fit in the UI while maintaining aspect ratio
                img_width, img_height = pil_image.size
                max_width, max_height = 700, 200  # Max dimensions for display
                
                if img_width > max_width or img_height > max_height:
                    ratio = min(max_width/img_width, max_height/img_height)
                    new_width = int(img_width * ratio)
                    new_height = int(img_height * ratio)
                    pil_image = pil_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                photo = ImageTk.PhotoImage(pil_image)
                
                # Create label to display the image
                img_label = tk.Label(theme_frame, image=photo)
                img_label.image = photo  # Keep a reference to avoid garbage collection
                img_label.pack(pady=5)
            
            # Button to select this theme
            select_btn = ttk.Button(
                theme_frame,
                text="Select Theme",
                command=lambda t=theme_name: self.select_theme(t)
            )
            select_btn.pack(pady=5)
            
            self.theme_frames[theme_name] = theme_frame
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Bind mousewheel to canvas for scrolling
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
        canvas.bind_all("<MouseWheel>", _on_mousewheel)
    
    def load_previews(self):
        """Load all theme previews."""
        # Generate previews for all available themes
        for theme_name in theme_manager.themes.keys():
            preview_path = self.preview_generator.generate_theme_preview(theme_name, width=700, height=180)
            if preview_path:
                self.previews[theme_name] = preview_path
    
    def select_theme(self, theme_name: str):
        """Select a theme and update the application."""
        # Get the root window to apply the theme to
        root = self.parent.winfo_toplevel()
        
        # Apply theme to the root window
        theme_manager.apply_theme(root, theme_name)
        self.selected_theme_var.set(theme_name)
        
        # Show confirmation
        msg = f"Theme '{theme_name}' has been selected and applied to the application."
        tk.messagebox.showinfo("Theme Selected", msg)
        
        print(f"Theme {theme_name} selected")


def show_visual_theme_selector(parent_window: tk.Tk):
    """Show the visual theme selector in a new window."""
    selector_window = tk.Toplevel(parent_window)
    selector_window.title("Visual Theme Selector - JPE Sims 4 Mod Translator")
    selector_window.geometry("800x600")
    
    # Create the visual theme selector
    selector = VisualThemeSelector(selector_window)
    
    # Add a close button
    close_btn = ttk.Button(
        selector_window,
        text="Close",
        command=selector_window.destroy
    )
    close_btn.pack(pady=10)
    
    return selector


def create_visual_theme_selector_tab(notebook: ttk.Notebook):
    """Create a visual theme selector tab and add it to the notebook."""
    tab_frame = ttk.Frame(notebook)
    
    # Create the visual theme selector
    selector = VisualThemeSelector(tab_frame)
    
    return tab_frame, selector