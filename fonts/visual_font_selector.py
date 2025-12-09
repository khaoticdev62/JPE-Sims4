"""
Visual Font Selector for JPE Sims 4 Mod Translator.

This module provides a Tkinter-based UI for selecting fonts with visual previews
generated using Pillow and the design system font manager.
"""

import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import os
from pathlib import Path
from typing import Optional, Dict, Any
from fonts.font_manager import font_manager as app_font_manager
from fonts.visual_font_preview import VisualFontPreviewGenerator


class VisualFontSelector:
    """
    A visual font selector that displays thumbnails of font packs with previews.
    """
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        self.preview_generator = VisualFontPreviewGenerator()
        self.previews: Dict[str, Any] = {}
        self.selected_pack_var = tk.StringVar()
        
        self.create_widgets()
        self.load_previews()
        
    def create_widgets(self):
        """Create the visual font selector UI."""
        # Main frame
        main_frame = ttk.Frame(self.parent)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Title
        title_label = ttk.Label(
            main_frame,
            text="Visual Font Selector",
            font=("Arial", 14, "bold")
        )
        title_label.pack(pady=(0, 10))
        
        # Create canvas with scrollbar for font previews
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

        # Font pack buttons with previews
        self.pack_frames = {}
        
        for pack_name in app_font_manager.get_available_packs():
            pack_frame = ttk.LabelFrame(scrollable_frame, text=pack_name, padding=10)
            pack_frame.pack(fill=tk.X, padx=5, pady=5)
            
            # Load and display preview image
            preview_path = self.previews.get(pack_name)
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
                img_label = tk.Label(pack_frame, image=photo)
                img_label.image = photo  # Keep a reference to avoid garbage collection
                img_label.pack(pady=5)
            
            # Button to select this font pack
            select_btn = ttk.Button(
                pack_frame,
                text="Select Font Pack",
                command=lambda p=pack_name: self.select_font_pack(p)
            )
            select_btn.pack(pady=5)
            
            self.pack_frames[pack_name] = pack_frame
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Bind mousewheel to canvas for scrolling
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
        canvas.bind_all("<MouseWheel>", _on_mousewheel)
    
    def load_previews(self):
        """Load all font pack previews."""
        # Generate previews for all available packs
        for pack_name in app_font_manager.get_available_packs():
            preview_path = self.preview_generator.generate_font_pack_preview(pack_name, width=700, height=180)
            if preview_path:
                self.previews[pack_name] = preview_path
    
    def select_font_pack(self, pack_name: str):
        """Select a font pack and update the application."""
        app_font_manager.set_current_pack(pack_name)
        self.selected_pack_var.set(pack_name)
        
        # Show confirmation
        msg = f"Font pack '{pack_name}' has been selected and applied to the application."
        tk.messagebox.showinfo("Font Pack Selected", msg)
        
        print(f"Font pack {pack_name} selected")


def show_visual_font_selector(parent_window: tk.Tk):
    """Show the visual font selector in a new window."""
    selector_window = tk.Toplevel(parent_window)
    selector_window.title("Visual Font Selector - JPE Sims 4 Mod Translator")
    selector_window.geometry("800x600")
    
    # Create the visual font selector
    selector = VisualFontSelector(selector_window)
    
    # Add a close button
    close_btn = ttk.Button(
        selector_window,
        text="Close",
        command=selector_window.destroy
    )
    close_btn.pack(pady=10)
    
    return selector


def create_visual_font_selector_tab(notebook: ttk.Notebook):
    """Create a visual font selector tab and add it to the notebook."""
    tab_frame = ttk.Frame(notebook)
    
    # Create the visual font selector
    selector = VisualFontSelector(tab_frame)
    
    return tab_frame, selector