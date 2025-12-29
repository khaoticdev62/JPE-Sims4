"""
Font Preview Utility for JPE Sims 4 Mod Translator.

This module provides a GUI to preview different font packs and their effects.
"""

import tkinter as tk
from tkinter import ttk
from typing import Dict
import tkinter.font as tkfont
from fonts.font_manager import font_manager


class FontPreviewWindow:
    """Window to preview different font packs."""
    
    def __init__(self, parent_window: tk.Tk):
        self.window = tk.Toplevel(parent_window)
        self.window.title("Font Pack Preview - JPE Sims 4 Mod Translator")
        self.window.geometry("800x600")
        
        self.pack_selector = None
        self.preview_text = None
        self.font_size_var = tk.IntVar(value=10)
        
        self.create_widgets()
        self.update_previews()
    
    def create_widgets(self):
        """Create the GUI widgets."""
        # Main frame
        main_frame = ttk.Frame(self.window, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Controls frame
        controls_frame = ttk.Frame(main_frame)
        controls_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Pack selector
        ttk.Label(controls_frame, text="Font Pack:").pack(side=tk.LEFT, padx=(0, 10))
        
        pack_names = font_manager.get_available_packs()
        self.pack_selector = ttk.Combobox(
            controls_frame,
            values=pack_names,
            state="readonly",
            width=20
        )
        self.pack_selector.pack(side=tk.LEFT, padx=(0, 20))
        self.pack_selector.set(font_manager.current_font_pack)
        self.pack_selector.bind("<<ComboboxSelected>>", self.on_pack_change)
        
        # Font size control
        ttk.Label(controls_frame, text="Font Size Multiplier:").pack(side=tk.LEFT, padx=(0, 10))
        size_scale = ttk.Scale(
            controls_frame,
            from_=8,
            to=20,
            variable=self.font_size_var,
            command=self.on_size_change,
            length=150
        )
        size_scale.pack(side=tk.LEFT, padx=(0, 10))
        
        size_label = ttk.Label(controls_frame, textvariable=self.font_size_var)
        size_label.pack(side=tk.LEFT, padx=(0, 20))
        
        # Preview text frame
        preview_frame = ttk.LabelFrame(main_frame, text="Font Previews", padding=15)
        preview_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create notebook for different font types
        self.notebook = ttk.Notebook(preview_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Create preview tabs for different font types
        self.preview_tabs = {}
        for font_type in ["default", "header", "monospace"]:
            frame = ttk.Frame(self.notebook, padding=10)
            self.notebook.add(frame, text=font_type.title())
            
            # Label showing the font
            label = ttk.Label(
                frame,
                text=f"Sample {font_type} text",
                font=tkfont.Font(size=12)  # Will be updated
            )
            label.pack(pady=20)
            
            # Text widget for longer samples
            text_widget = tk.Text(
                frame,
                height=8,
                wrap=tk.WORD,
                font=tkfont.Font(size=10)  # Will be updated
            )
            text_widget.pack(fill=tk.BOTH, expand=True)
            
            # Store references
            self.preview_tabs[font_type] = {
                "label": label,
                "text": text_widget
            }
    
    def on_pack_change(self, event=None):
        """Handle font pack change."""
        selected_pack = self.pack_selector.get()
        if selected_pack:
            font_manager.set_current_pack(selected_pack)
            self.update_previews()
    
    def on_size_change(self, value):
        """Handle font size change."""
        self.update_previews()
    
    def update_previews(self):
        """Update all previews with the current font pack and size."""
        current_pack_name = font_manager.current_font_pack
        if not current_pack_name:
            return

        # Get the current font pack
        current_pack = font_manager.font_packs[current_pack_name]
        size_multiplier = self.font_size_var.get() / 10.0  # Convert back to multiplier

        # Update each preview tab
        for font_type, widgets in self.preview_tabs.items():
            # Check if the font type exists in this pack before trying to get it
            if font_type in current_pack.fonts:
                # Get the font from the current pack
                font_obj = current_pack.get_font(font_type, int(current_pack.fonts[font_type].size * size_multiplier))
            else:
                # If the font type doesn't exist in this pack, use the default font
                font_obj = current_pack.get_font("default", int(current_pack.fonts["default"].size * size_multiplier)) if "default" in current_pack.fonts else None

            if font_obj:
                # Update the label
                widgets["label"].config(font=font_obj, text=f"Sample {font_type} text with {current_pack.name} pack")

                # Update the text widget
                widgets["text"].config(font=font_obj)

                # Add sample text based on the font type
                widgets["text"].delete(1.0, tk.END)

                if font_type == "monospace":
                    sample_text = (
                        "0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ\n"
                        "abcdefghijklmnopqrstuvwxyz\n"
                        "{}[]()<>!@#$%^&*()-_=+\\|;:,./?\n\n"
                        "# This is sample code:\n"
                        "def example_function(param):\n"
                        "    return param * 2\n\n"
                        "class Example:\n"
                        "    def __init__(self):\n"
                        "        self.value = 42"
                    )
                elif font_type == "header":
                    sample_text = (
                        "This is a Header Font Preview\n"
                        "===============================\n\n"
                        "When using header fonts, we typically want something that stands out\n"
                        "and provides good readability at larger sizes. This font should work\n"
                        "well for titles, section headings, and important UI elements.\n\n"
                        "The contrast between the header font and body text should be clear\n"
                        "to help users navigate the interface effectively."
                    )
                else:  # default
                    sample_text = (
                        "The quick brown fox jumps over the lazy dog.\n"
                        "This pangram contains every letter of the alphabet.\n\n"
                        "JPE Sims 4 Mod Translator provides an accessible way to create\n"
                        "and modify Sims 4 mods using Just Plain English syntax.\n\n"
                        "With customizable fonts, you can optimize your editing experience\n"
                        "for comfort, readability, and personal preference. The application\n"
                        "supports multiple font packs that can be easily switched.\n\n"
                        "Font packs include:\n"
                        "• Modern: Clean, contemporary typefaces\n"
                        "• Classic: Traditional, highly compatible fonts\n"
                        "• Readable: Optimized for long reading sessions\n"
                        "• Developer: Designed for code editing"
                    )

                widgets["text"].insert(tk.END, sample_text)
            else:
                # If we couldn't get any font, just update the text without font styling
                widgets["label"].config(text=f"Sample {font_type} text with {current_pack.name} pack (font not available)")

                # Add sample text based on the font type
                widgets["text"].delete(1.0, tk.END)

                if font_type == "monospace":
                    sample_text = (
                        "0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ\n"
                        "abcdefghijklmnopqrstuvwxyz\n"
                        "{}[]()<>!@#$%^&*()-_=+\\|;:,./?\n\n"
                        "# This is sample code:\n"
                        "def example_function(param):\n"
                        "    return param * 2\n\n"
                        "class Example:\n"
                        "    def __init__(self):\n"
                        "        self.value = 42"
                    )
                elif font_type == "header":
                    sample_text = (
                        "This is a Header Font Preview\n"
                        "===============================\n\n"
                        "When using header fonts, we typically want something that stands out\n"
                        "and provides good readability at larger sizes. This font should work\n"
                        "well for titles, section headings, and important UI elements.\n\n"
                        "The contrast between the header font and body text should be clear\n"
                        "to help users navigate the interface effectively."
                    )
                else:  # default
                    sample_text = (
                        "The quick brown fox jumps over the lazy dog.\n"
                        "This pangram contains every letter of the alphabet.\n\n"
                        "JPE Sims 4 Mod Translator provides an accessible way to create\n"
                        "and modify Sims 4 mods using Just Plain English syntax.\n\n"
                        "With customizable fonts, you can optimize your editing experience\n"
                        "for comfort, readability, and personal preference. The application\n"
                        "supports multiple font packs that can be easily switched.\n\n"
                        "Font packs include:\n"
                        "• Modern: Clean, contemporary typefaces\n"
                        "• Classic: Traditional, highly compatible fonts\n"
                        "• Readable: Optimized for long reading sessions\n"
                        "• Developer: Designed for code editing"
                    )

                widgets["text"].insert(tk.END, sample_text)


def show_font_preview(parent_window: tk.Tk):
    """Show the font preview window."""
    preview = FontPreviewWindow(parent_window)
    return preview