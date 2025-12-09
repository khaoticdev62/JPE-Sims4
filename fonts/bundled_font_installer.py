"""
Bundled Font Installer for JPE Sims 4 Mod Translator.

This module handles the installation of bundled fonts that ship with the application.
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path
from typing import List, Optional, Dict
from fonts.font_distribution import font_distribution_manager, BundledFont


def get_system_font_directory() -> Optional[Path]:
    """Get the system font directory for the current platform."""
    if sys.platform.startswith("win"):
        # Windows
        return Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
    elif sys.platform.startswith("darwin"):
        # macOS
        return Path.home() / "Library" / "Fonts"
    elif sys.platform.startswith("linux"):
        # Linux
        return Path.home() / ".fonts" if (Path.home() / ".fonts").exists() else Path("/usr/share/fonts")
    else:
        return None


def install_bundled_font(font_file_name: str, force: bool = False) -> bool:
    """
    Install a bundled font to the system font directory.
    
    Args:
        font_file_name: Name of the font file in the bundled_fonts directory
        force: Whether to overwrite existing font files
        
    Returns:
        True if installation was successful, False otherwise
    """
    # Get the font file path
    font_path = font_distribution_manager.get_font_path(font_file_name)
    if not font_path:
        print(f"Bundled font '{font_file_name}' not found in bundled fonts directory")
        return False
    
    # Get system font directory
    system_font_dir = get_system_font_directory()
    if not system_font_dir:
        print(f"Unsupported platform: {sys.platform}")
        return False
    
    # Create system font directory if it doesn't exist
    system_font_dir.mkdir(parents=True, exist_ok=True)
    
    # Check if font already exists
    destination = system_font_dir / font_file_name
    if destination.exists() and not force:
        print(f"Font '{font_file_name}' already installed, skipping")
        return True
    
    try:
        # Copy font to system directory
        shutil.copy2(font_path, destination)
        print(f"Successfully installed font: {font_file_name}")
        
        # On Windows, we might need to update the registry
        if sys.platform.startswith("win"):
            update_font_registry(font_file_name)
        
        return True
    except Exception as e:
        print(f"Failed to install font {font_file_name}: {e}")
        return False


def update_font_registry(font_name: str):
    """Update Windows registry to register the font (Windows only)."""
    if not sys.platform.startswith("win"):
        return
    
    try:
        import winreg
        
        # Open the fonts registry key
        key = winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts",
            0,
            winreg.KEY_SET_VALUE
        )
        
        # Add the font to the registry
        winreg.SetValueEx(key, font_name, 0, winreg.REG_SZ, font_name)
        winreg.CloseKey(key)
        
        print(f"Updated registry for font: {font_name}")
    except Exception as e:
        print(f"Failed to update registry for {font_name}: {e}")


def install_all_bundled_fonts() -> Dict[str, bool]:
    """
    Install all bundled fonts to the system.
    
    Returns:
        Dictionary mapping font file names to installation success status
    """
    results = {}
    
    for font in font_distribution_manager.get_all_bundled_fonts():
        success = install_bundled_font(font.file_name)
        results[font.file_name] = success
    
    return results


def install_bundled_fonts_by_category(category: str) -> Dict[str, bool]:
    """
    Install all bundled fonts of a specific category.
    
    Args:
        category: The font category ('sans-serif', 'serif', 'monospace', 'display', 'script')
        
    Returns:
        Dictionary mapping font file names to installation success status
    """
    results = {}
    
    for font in font_distribution_manager.get_bundled_fonts_by_category(category):
        success = install_bundled_font(font.file_name)
        results[font.file_name] = success
    
    return results


def create_font_installation_report(results: Dict[str, bool]) -> str:
    """
    Create a human-readable report of font installation results.
    
    Args:
        results: Dictionary of font installation results
        
    Returns:
        Formatted report string
    """
    total_fonts = len(results)
    successful = sum(1 for success in results.values() if success)
    failed = total_fonts - successful
    
    report = "Font Installation Report\n"
    report += "=" * 50 + "\n"
    report += f"Total fonts: {total_fonts}\n"
    report += f"Successful: {successful}\n"
    report += f"Failed: {failed}\n\n"
    
    if failed > 0:
        report += "Failed installations:\n"
        for font_name, success in results.items():
            if not success:
                report += f"  - {font_name}\n"
        report += "\n"
    
    report += "Installation details:\n"
    for font_name, success in results.items():
        status = "SUCCESS" if success else "FAILED"
        report += f"  {font_name}: {status}\n"
    
    return report


def check_if_font_installed(font_name: str) -> bool:
    """Check if a specific font is installed in the system."""
    system_font_dir = get_system_font_directory()
    if not system_font_dir or not system_font_dir.exists():
        return False
    
    # Look for the font file in the system font directory
    font_files = list(system_font_dir.glob(f"*{font_name}*"))
    return len(font_files) > 0


def get_installed_bundled_fonts() -> List[str]:
    """Get a list of bundled fonts that are already installed on the system."""
    installed_fonts = []
    
    for font in font_distribution_manager.get_all_bundled_fonts():
        if check_if_font_installed(font.file_name):
            installed_fonts.append(font.name)
    
    return installed_fonts


class BundledFontInstaller:
    """GUI class for installing bundled fonts."""
    
    def __init__(self, parent_window=None):
        self.parent_window = parent_window
        self.root = None
        self.setup_ui()
    
    def setup_ui(self):
        """Set up the user interface."""
        import tkinter as tk
        from tkinter import ttk, messagebox, filedialog
        
        # Create window if not provided
        if self.parent_window:
            self.root = tk.Toplevel(self.parent_window)
        else:
            self.root = tk.Tk()
            self.root.title("Bundled Font Installer - JPE Sims 4 Mod Translator")
        
        self.root.geometry("700x500")
        
        # Main frame
        main_frame = ttk.Frame(self.root, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(
            main_frame,
            text="Bundled Font Installer",
            font=("Arial", 16, "bold")
        )
        title_label.pack(pady=(0, 10))
        
        # Description
        desc_label = ttk.Label(
            main_frame,
            text="Install fonts bundled with the JPE Sims 4 Mod Translator application",
            wraplength=600,
            justify=tk.CENTER
        )
        desc_label.pack(pady=(0, 20))
        
        # Installation options frame
        options_frame = ttk.LabelFrame(main_frame, text="Installation Options", padding=15)
        options_frame.pack(fill=tk.X, pady=(0, 15))
        
        # Category selection
        ttk.Label(options_frame, text="Install fonts by category:").pack(anchor=tk.W)
        
        category_var = tk.StringVar(value="all")
        categories = ["all", "sans-serif", "serif", "monospace", "display"]
        
        category_frame = ttk.Frame(options_frame)
        category_frame.pack(fill=tk.X, pady=(5, 10))
        
        for i, cat in enumerate(categories):
            rb = ttk.Radiobutton(category_frame, text=cat.title(), variable=category_var, value=cat)
            rb.pack(side=tk.LEFT, padx=(0, 10))
        
        # Buttons frame
        buttons_frame = ttk.Frame(options_frame)
        buttons_frame.pack(fill=tk.X, pady=(10, 0))
        
        # Install button
        def install_fonts():
            category = category_var.get()
            
            if category == "all":
                results = install_all_bundled_fonts()
            else:
                results = install_bundled_fonts_by_category(category)
            
            report = create_font_installation_report(results)
            
            # Show results in a new window
            results_window = tk.Toplevel(self.root)
            results_window.title("Installation Results")
            results_window.geometry("600x400")
            
            text_widget = tk.Text(results_window, wrap=tk.WORD)
            text_widget.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            
            scrollbar = ttk.Scrollbar(text_widget)
            scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
            text_widget.config(yscrollcommand=scrollbar.set)
            scrollbar.config(command=text_widget.yview)
            
            text_widget.insert(tk.END, report)
            text_widget.config(state=tk.DISABLED)
        
        install_btn = ttk.Button(
            buttons_frame,
            text="Install Selected Fonts",
            command=install_fonts
        )
        install_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # Show system font directory
        system_dir = get_system_font_directory()
        if system_dir:
            ttk.Label(
                options_frame,
                text=f"System font directory: {system_dir}",
                font=("Arial", 9),
                foreground="gray"
            ).pack(anchor=tk.W, pady=(10, 0))
        
        # Progress frame
        progress_frame = ttk.LabelFrame(main_frame, text="Installation Progress", padding=15)
        progress_frame.pack(fill=tk.BOTH, expand=True)
        
        # Progress text widget
        self.progress_text = tk.Text(progress_frame, height=10, state=tk.DISABLED)
        self.progress_text.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # Progress scrollbar
        progress_scrollbar = ttk.Scrollbar(self.progress_text)
        self.progress_text.config(yscrollcommand=progress_scrollbar.set)
        progress_scrollbar.config(command=self.progress_text.yview)
        progress_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Add some information about available fonts
        info_frame = ttk.LabelFrame(main_frame, text="Available Fonts", padding=15)
        info_frame.pack(fill=tk.X, pady=(0, 15))
        
        # Show categories
        categories_info = font_distribution_manager.create_bundled_fonts_info()
        
        for category, fonts in categories_info.items():
            ttk.Label(
                info_frame,
                text=f"{category.title()}: {len(fonts)} fonts",
                font=("Arial", 10, "bold")
            ).pack(anchor=tk.W)
    
    def run(self):
        """Run the installer UI."""
        if not self.parent_window:
            self.root.mainloop()


def show_bundled_font_installer(parent_window=None):
    """Show the bundled font installer GUI."""
    installer = BundledFontInstaller(parent_window)
    return installer