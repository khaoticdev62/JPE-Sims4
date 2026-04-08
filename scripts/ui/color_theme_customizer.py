"""
Visual Color Theme Customizer for JPE Sims 4 Mod Translator.

This module provides a UI for customizing themes using the expanded color swatch collection.
"""

import tkinter as tk
from tkinter import ttk, colorchooser, messagebox
from PIL import Image, ImageTk
from typing import Dict, Optional, Any
from ui.color_manager import color_manager
from ui.theme_manager import Theme
from ui.visual_color_swatches import VisualColorSwatchPreview


class ColorThemeCustomizer:
    """
    A UI for customizing themes with the expanded color swatch collection.
    """
    
    def __init__(self, parent: tk.Widget, theme: Theme):
        self.parent = parent
        self.base_theme = theme
        self.color_vars: Dict[str, tk.StringVar] = {}
        self.color_buttons: Dict[str, tk.Button] = {}
        self.current_theme = Theme(
            name=f"{theme.name}_custom",
            display_name=f"{theme.display_name} (Custom)",
            description=f"Customized version of {theme.display_name}",
            bg=theme.bg,
            fg=theme.fg,
            select_bg=theme.select_bg,
            select_fg=theme.select_fg,
            button_bg=theme.button_bg,
            button_fg=theme.button_fg,
            button_hover=theme.button_hover,
            entry_bg=theme.entry_bg,
            entry_fg=theme.entry_fg,
            text_bg=theme.text_bg,
            text_fg=theme.text_fg,
            highlight_color=theme.highlight_color,
            disabled_bg=theme.disabled_bg,
            disabled_fg=theme.disabled_fg
        )
        
        self.preview_generator = VisualColorSwatchPreview()
        self.create_widgets()
        self.update_color_vars()
    
    def create_widgets(self):
        """Create the color theme customizer UI."""
        # Main frame
        main_frame = ttk.Frame(self.parent)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Title
        title_label = ttk.Label(
            main_frame,
            text=f"Customize '{self.base_theme.display_name}' Theme",
            font=("Arial", 14, "bold")
        )
        title_label.pack(pady=(0, 10))
        
        # Color selection frame
        color_frame = ttk.LabelFrame(main_frame, text="Color Selection", padding=10)
        color_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Create color selection rows
        self.create_color_selection_row(color_frame, "Background", "bg", 0, 0)
        self.create_color_selection_row(color_frame, "Foreground", "fg", 0, 1)
        self.create_color_selection_row(color_frame, "Selection Background", "select_bg", 1, 0)
        self.create_color_selection_row(color_frame, "Selection Foreground", "select_fg", 1, 1)
        self.create_color_selection_row(color_frame, "Button Background", "button_bg", 2, 0)
        self.create_color_selection_row(color_frame, "Button Foreground", "button_fg", 2, 1)
        self.create_color_selection_row(color_frame, "Button Hover", "button_hover", 3, 0)
        self.create_color_selection_row(color_frame, "Entry Background", "entry_bg", 3, 1)
        self.create_color_selection_row(color_frame, "Entry Foreground", "entry_fg", 4, 0)
        self.create_color_selection_row(color_frame, "Text Background", "text_bg", 4, 1)
        self.create_color_selection_row(color_frame, "Text Foreground", "text_fg", 5, 0)
        self.create_color_selection_row(color_frame, "Highlight", "highlight_color", 5, 1)
        self.create_color_selection_row(color_frame, "Disabled Background", "disabled_bg", 6, 0)
        self.create_color_selection_row(color_frame, "Disabled Foreground", "disabled_fg", 6, 1)
        
        # Color swatch preview frame
        swatch_frame = ttk.LabelFrame(main_frame, text="Color Swatches", padding=10)
        swatch_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # Category selector
        cat_frame = ttk.Frame(swatch_frame)
        cat_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(cat_frame, text="Category:").pack(side=tk.LEFT)
        self.category_var = tk.StringVar()
        categories = color_manager.get_all_categories()
        self.category_combo = ttk.Combobox(
            cat_frame,
            textvariable=self.category_var,
            values=categories,
            state="readonly",
            width=20
        )
        self.category_combo.pack(side=tk.LEFT, padx=(10, 0))
        self.category_combo.set(categories[0] if categories else "")
        self.category_combo.bind("<<ComboboxSelected>>", self.on_category_change)
        
        # Swatch preview area
        self.swatch_canvas = tk.Canvas(swatch_frame, height=150)
        self.swatch_scrollbar = ttk.Scrollbar(swatch_frame, orient="horizontal", command=self.swatch_canvas.xview)
        self.swatch_frame = ttk.Frame(self.swatch_canvas)
        
        self.swatch_frame.bind(
            "<Configure>",
            lambda e: self.swatch_canvas.configure(scrollregion=self.swatch_canvas.bbox("all"))
        )
        
        self.swatch_canvas.create_window((0, 0), window=self.swatch_frame, anchor="nw")
        self.swatch_canvas.configure(xscrollcommand=self.swatch_scrollbar.set)
        
        self.swatch_canvas.pack(fill=tk.X, pady=(0, 10))
        self.swatch_scrollbar.pack(fill=tk.X)
        
        # Initially populate swatches
        self.populate_swatch_previews()
        
        # Buttons frame
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X)
        
        # Reset button
        reset_btn = ttk.Button(
            button_frame,
            text="Reset to Original",
            command=self.reset_colors
        )
        reset_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # Apply button
        apply_btn = ttk.Button(
            button_frame,
            text="Apply Custom Theme",
            command=self.apply_custom_theme
        )
        apply_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # Preview button
        preview_btn = ttk.Button(
            button_frame,
            text="Preview Theme",
            command=self.preview_current_theme
        )
        preview_btn.pack(side=tk.LEFT)
    
    def create_color_selection_row(self, parent: tk.Widget, label: str, color_attr: str, row: int, col: int):
        """Create a row for a specific color attribute."""
        # Create frame for the row
        frame = ttk.Frame(parent)
        frame.grid(row=row, column=col, sticky="ew", padx=5, pady=2)
        
        # Configure grid weights for expansion
        parent.columnconfigure(col, weight=1)
        
        # Label
        ttk.Label(frame, text=f"{label}:", width=20).pack(side=tk.LEFT, padx=(0, 5))
        
        # Color value display
        self.color_vars[color_attr] = tk.StringVar(value=getattr(self.current_theme, color_attr))
        color_label = ttk.Label(
            frame,
            textvariable=self.color_vars[color_attr],
            width=10,
            background=getattr(self.current_theme, color_attr),
            relief="solid",
            borderwidth=1
        )
        color_label.pack(side=tk.LEFT, padx=(0, 5))
        
        # Color selection button
        btn = ttk.Button(
            frame,
            text="Choose",
            command=lambda a=color_attr: self.choose_color(a)
        )
        btn.pack(side=tk.LEFT)
        
        self.color_buttons[color_attr] = btn
    
    def choose_color(self, color_attr: str):
        """Open a color chooser for a specific color attribute."""
        initial_color = getattr(self.current_theme, color_attr)
        color = colorchooser.askcolor(color=initial_color, title=f"Select {color_attr.replace('_', ' ').title()} Color")
        
        if color[1]:  # If a color was selected
            setattr(self.current_theme, color_attr, color[1])
            self.color_vars[color_attr].set(color[1])
            
            # Update the color display
            btn = [widget for name, widget in self.color_buttons.items() if name == color_attr][0]
            btn.master.children[list(btn.master.children.keys())[0]].config(background=color[1])
    
    def update_color_vars(self):
        """Update the color variables to reflect the current theme."""
        for attr in self.color_vars:
            color = getattr(self.current_theme, attr)
            self.color_vars[attr].set(color)
            
            # Update the color display
            btn = self.color_buttons[attr]
            btn.master.children[list(btn.master.children.keys())[0]].config(background=color)
    
    def reset_colors(self):
        """Reset all colors to the original theme."""
        attrs = [
            'bg', 'fg', 'select_bg', 'select_fg', 
            'button_bg', 'button_fg', 'button_hover',
            'entry_bg', 'entry_fg', 'text_bg', 'text_fg',
            'highlight_color', 'disabled_bg', 'disabled_fg'
        ]
        
        for attr in attrs:
            original_value = getattr(self.base_theme, attr)
            setattr(self.current_theme, attr, original_value)
        
        self.update_color_vars()
    
    def on_category_change(self, event=None):
        """Handle category change event."""
        self.populate_swatch_previews()
    
    def populate_swatch_previews(self):
        """Populate the swatch preview area with swatches from the selected category."""
        # Clear existing widgets
        for widget in self.swatch_frame.winfo_children():
            widget.destroy()
        
        # Get selected category
        category = self.category_var.get()
        if not category:
            return
        
        # Get swatches in category
        swatches = color_manager.get_swatches_by_category(category)
        
        # Add swatches to the frame
        for i, swatch in enumerate(swatches):
            # Create a frame for each swatch
            swatch_frm = tk.Frame(self.swatch_frame, relief="raised", borderwidth=1)
            swatch_frm.grid(row=0, column=i, padx=2, pady=2)
            
            # Color swatch
            color_box = tk.Frame(swatch_frm, bg=swatch.hex_code, width=30, height=30)
            color_box.grid(row=0, column=0, sticky="ew")
            color_box.grid_propagate(False)  # Maintain fixed size
            
            # Name
            name_label = tk.Label(swatch_frm, text=swatch.name[:10], font=("Arial", 7))
            name_label.grid(row=1, column=0)
            
            # Bind click to use this color
            def use_color(color_hex, attr="bg"):
                def click_handler(event):
                    # For now, default to background, but in a real implementation
                    # you might want to ask which attribute to change
                    if messagebox.askyesno(
                        "Apply Color", 
                        f"Apply {color_hex} to background color?"
                    ):
                        setattr(self.current_theme, "bg", color_hex)
                        self.color_vars["bg"].set(color_hex)
                        self.update_color_vars()
                return click_handler
            
            # Bind click event to use this color
            color_box.bind("<Button-1>", use_color(swatch.hex_code))
            name_label.bind("<Button-1>", use_color(swatch.hex_code))
    
    def apply_custom_theme(self):
        """Apply the current custom theme to the application."""
        # Get the root window to apply the theme to
        root = self.parent.winfo_toplevel()
        
        # Apply the custom theme to the root window
        from ui.theme_manager import ThemeManager
        theme_manager = ThemeManager()
        
        # Add the custom theme to the theme manager
        theme_manager.themes[self.current_theme.name] = self.current_theme
        
        # Apply theme to the root window
        theme_manager.apply_theme(root, self.current_theme.name)
        
        messagebox.showinfo("Theme Applied", f"Custom theme '{self.current_theme.display_name}' has been applied!")
    
    def preview_current_theme(self):
        """Preview the current theme."""
        # Create a temporary theme preview
        preview_img = self.create_theme_preview()
        if preview_img:
            # Show in a new window
            preview_window = tk.Toplevel()
            preview_window.title(f"Preview - {self.current_theme.display_name}")
            
            # Convert PIL image to PhotoImage
            photo = ImageTk.PhotoImage(preview_img)
            
            # Create label to show the preview
            label = tk.Label(preview_window, image=photo)
            label.image = photo  # Keep reference to avoid garbage collection
            label.pack(padx=10, pady=10)
    
    def create_theme_preview(self):
        """Create a visual preview of the current theme."""
        # This is a simplified version - in a real implementation, you would create a more
        # detailed preview showing the theme's colors in a UI context
        from PIL import Image, ImageDraw
        width, height = 300, 200
        
        # Create a preview image using the current theme's background color
        img = Image.new('RGB', (width, height), color=self.current_theme.bg)
        draw = ImageDraw.Draw(img)
        
        # Draw some sample elements using theme colors
        # Background
        draw.rectangle([0, 0, width, height], fill=self.current_theme.bg)
        
        # Sample text
        from ui.jpe_branding import get_platform_font
        try:
            from design_system.font_manager import font_manager as design_font_manager
            font = design_font_manager.get_font("Roboto", 14, "normal")
        except:
            font = None
        
        text = "Theme Preview"
        draw.text((20, 20), text, fill=self.current_theme.fg)
        
        # Sample button
        button_rect = [20, 60, 120, 90]
        draw.rectangle(button_rect, fill=self.current_theme.button_bg, outline=self.current_theme.button_fg)
        draw.text((30, 70), "Button", fill=self.current_theme.button_fg)
        
        # Sample selected text area
        selection_rect = [20, 110, 200, 140]
        draw.rectangle(selection_rect, fill=self.current_theme.select_bg, outline=self.current_theme.select_fg)
        draw.text((30, 120), "Selected Text", fill=self.current_theme.select_fg)
        
        # Sample input field
        input_rect = [20, 160, 200, 180]
        draw.rectangle(input_rect, fill=self.current_theme.entry_bg, outline=self.current_theme.entry_fg)
        draw.text((30, 165), "Input Field", fill=self.current_theme.entry_fg)
        
        return img


def show_color_theme_customizer(parent_window: tk.Tk, theme):
    """Show the color theme customizer in a new window."""
    customizer_window = tk.Toplevel(parent_window)
    customizer_window.title("Color Theme Customizer - JPE Sims 4 Mod Translator")
    customizer_window.geometry("900x800")
    
    # Create the color theme customizer
    customizer = ColorThemeCustomizer(customizer_window, theme)
    
    return customizer


def create_color_customizer_tab(notebook: ttk.Notebook, theme):
    """Create a color customizer tab and add it to the notebook."""
    tab_frame = ttk.Frame(notebook)
    
    # Create the color theme customizer
    customizer = ColorThemeCustomizer(tab_frame, theme)
    
    return tab_frame, customizer