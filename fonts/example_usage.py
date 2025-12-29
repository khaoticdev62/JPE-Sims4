"""
Example usage of the Font Pack System for JPE Sims 4 Mod Translator.

This script demonstrates how to integrate and use the font pack system 
in the application.
"""

import tkinter as tk
from tkinter import ttk
import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


def create_sample_app_with_fonts():
    """Create a sample application showing font pack integration."""
    root = tk.Tk()
    root.title("JPE Sims 4 Mod Translator - Font Pack Demo")
    root.geometry("800x600")
    
    # Apply a theme (this will also apply associated fonts if font integration is active)
    from ui.theme_manager import theme_manager
    theme_manager.apply_theme(root, "modern")  # Use the ocean theme which has "modern" font pack
    
    # Create a notebook for different sections
    notebook = ttk.Notebook(root)
    notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
    
    # Create main content frame
    main_frame = ttk.Frame(notebook)
    notebook.add(main_frame, text="Main View")
    
    # Header using header font
    header_label = ttk.Label(
        main_frame,
        text="JPE Sims 4 Mod Translator",
        font=("Arial", 16, "bold")  # This will be overridden by font integration
    )
    header_label.pack(pady=20)
    
    # Sample text areas
    text_frame = ttk.Frame(main_frame)
    text_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
    
    # Normal text
    normal_label = ttk.Label(text_frame, text="Normal Text", font=("Arial", 10))
    normal_label.pack(anchor=tk.W, pady=(0, 5))
    
    # Monospace text (for code)
    mono_label = ttk.Label(text_frame, text="Monospace Text (for code)", font=("Consolas", 10))
    mono_label.pack(anchor=tk.W, pady=(0, 5))
    
    # Example text widgets
    normal_text = tk.Text(text_frame, height=5, width=50)
    normal_text.pack(pady=5, fill=tk.X)
    normal_text.insert(tk.END, "This is an example of normal text using the default font from the selected font pack.")
    
    # Monospace text widget
    mono_text = tk.Text(text_frame, height=5, width=50, font=("Consolas", 10))
    mono_text.pack(pady=5, fill=tk.X)
    mono_text.insert(tk.END, "def example_function():\n    # This is monospace font\n    return 'Hello World'")
    
    # Settings frame
    settings_frame = ttk.Frame(notebook)
    notebook.add(settings_frame, text="Font Settings")
    
    # Integrate font settings
    from ui.ui_enhancements import integrate_font_settings
    font_tab, font_panel = integrate_font_settings(notebook)
    
    # If font settings were created successfully, add them to the notebook
    if font_tab and font_panel:
        notebook.insert(2, font_tab, text="Font Settings")  # Insert after main view but before settings
    
    # Add a button to show current font info
    def show_font_info():
        from ui.ui_enhancements import get_current_font_info
        info = get_current_font_info()
        info_str = f"Current Font Pack: {info['pack_name']}\n"
        info_str += f"Description: {info['pack_description']}\n"
        info_str += "Fonts: " + ", ".join(list(info['fonts'].keys()))
        
        font_info_window = tk.Toplevel(root)
        font_info_window.title("Current Font Information")
        font_info_window.geometry("400x200")
        
        tk.Label(font_info_window, text=info_str, justify=tk.LEFT).pack(pady=20, padx=20)
    
    info_btn = ttk.Button(settings_frame, text="Show Current Font Info", command=show_font_info)
    info_btn.pack(pady=20)
    
    # Add theme selector
    theme_frame = ttk.Frame(settings_frame)
    theme_frame.pack(pady=20)
    
    ttk.Label(theme_frame, text="Theme:").pack(anchor=tk.W)
    
    theme_var = tk.StringVar()
    theme_selector = ttk.Combobox(
        theme_frame,
        textvariable=theme_var,
        values=theme_manager.get_themes(),
        state="readonly"
    )
    theme_selector.pack(pady=5)
    
    # Set current theme
    for name, theme in theme_manager.themes.items():
        if theme.display_name == theme_manager.themes[theme_manager.current_theme].display_name if theme_manager.current_theme else "Default":
            theme_selector.set(theme.display_name)
            break
    
    def change_theme(*args):
        theme_name = theme_manager.get_theme_by_display_name(theme_var.get())
        if theme_name:
            theme_manager.apply_theme(root, theme_name)
    
    theme_selector.bind("<<ComboboxSelected>>", change_theme)
    
    root.mainloop()


if __name__ == "__main__":
    print("Starting JPE Sims 4 Mod Translator with Font Pack System demo...")
    print("This example shows how to integrate the font pack system with the application UI.")
    create_sample_app_with_fonts()