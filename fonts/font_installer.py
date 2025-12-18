"""
Font Installation Utility for JPE Sims 4 Mod Translator.

This module provides functionality to install and manage custom fonts
for the application.
"""

import os
import sys
import shutil
from pathlib import Path
from typing import List, Optional, Dict
import tkinter as tk
from tkinter import filedialog, messagebox
import subprocess


def get_system_font_dir() -> Optional[Path]:
    """Get the system font directory for the current platform."""
    if sys.platform.startswith("win"):
        # Windows
        return Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
    elif sys.platform.startswith("darwin"):
        # macOS
        return Path.home() / "Library" / "Fonts"
    elif sys.platform.startswith("linux"):
        # Linux
        return Path.home() / ".fonts"
    else:
        return None


def install_font_file(font_path: Path) -> bool:
    """Install a font file to the system font directory."""
    system_font_dir = get_system_font_dir()
    if not system_font_dir:
        print(f"Unsupported platform: {sys.platform}")
        return False
    
    # Create system font directory if it doesn't exist
    system_font_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy font to system directory
    try:
        destination = system_font_dir / font_path.name
        shutil.copy2(font_path, destination)
        
        # On Windows, we might need to update the registry
        if sys.platform.startswith("win"):
            update_font_registry(font_path.name)
        
        print(f"Successfully installed font: {font_path.name}")
        return True
    except Exception as e:
        print(f"Failed to install font {font_path.name}: {e}")
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


def is_font_installed(font_name: str) -> bool:
    """Check if a specific font is installed on the system."""
    system_font_dir = get_system_font_dir()
    if not system_font_dir or not system_font_dir.exists():
        return False
    
    # Look for the font file in the system font directory
    font_files = list(system_font_dir.glob(f"*{font_name}*"))
    return len(font_files) > 0


def get_installed_fonts() -> List[str]:
    """Get a list of installed font files in the system font directory."""
    system_font_dir = get_system_font_dir()
    if not system_font_dir or not system_font_dir.exists():
        return []
    
    font_extensions = ['.ttf', '.otf', '.woff', '.woff2', '.eot', '.fon', '.fnt']
    installed_fonts = []
    
    for ext in font_extensions:
        installed_fonts.extend([f.name for f in system_font_dir.glob(f"*{ext}")])
    
    return installed_fonts


def install_font_from_dialog(parent_window: tk.Tk) -> bool:
    """Show a dialog to select and install a font file."""
    # Open file dialog to select font file
    file_path = filedialog.askopenfilename(
        title="Select Font File to Install",
        filetypes=[
            ("Font files", "*.ttf *.otf *.woff *.woff2"),
            ("TrueType fonts", "*.ttf"),
            ("OpenType fonts", "*.otf"),
            ("Web Open Font Format", "*.woff *.woff2"),
            ("All files", "*.*")
        ]
    )
    
    if not file_path:
        return False  # User cancelled
    
    # Install the selected font
    font_path = Path(file_path)
    if font_path.suffix.lower() in ['.ttf', '.otf', '.woff', '.woff2']:
        success = install_font_file(font_path)
        if success:
            messagebox.showinfo(
                "Success", 
                f"Font '{font_path.name}' has been installed successfully!\n"
                "You may need to restart the application to see the changes."
            )
        else:
            messagebox.showerror(
                "Error", 
                f"Failed to install font '{font_path.name}'. Check permissions and try again."
            )
        return success
    else:
        messagebox.showerror(
            "Error", 
            f"'{font_path.suffix}' is not a supported font file format."
        )
        return False


def validate_font_file(file_path: Path) -> bool:
    """Validate if a file is a valid font file."""
    if not file_path.exists():
        return False
    
    # Check file extension
    valid_extensions = {'.ttf', '.otf', '.woff', '.woff2', '.eot'}
    if file_path.suffix.lower() not in valid_extensions:
        return False
    
    # Check file size (fonts are typically not too large)
    if file_path.stat().st_size > 50 * 1024 * 1024:  # 50MB
        return False
    
    # Additional validation could go here
    # For now, just check if it's a valid file that can be read
    try:
        with open(file_path, 'rb') as f:
            header = f.read(10)  # Read first 10 bytes
        # Basic check: font files have specific headers
        # This is a simplified check; real validation would be more complex
        return len(header) > 0
    except Exception:
        return False


def get_font_info(file_path: Path) -> Optional[Dict[str, str]]:
    """Get information about a font file if possible."""
    # This would use a font library to extract font information
    # For now, just return basic file info
    try:
        stat = file_path.stat()
        return {
            "name": file_path.name,
            "size": str(stat.st_size),
            "extension": file_path.suffix
        }
    except Exception:
        return None


class FontInstallerGUI:
    """GUI for font installation and management."""
    
    def __init__(self, parent_window: tk.Tk):
        self.window = tk.Toplevel(parent_window)
        self.window.title("Font Installer - JPE Sims 4 Mod Translator")
        self.window.geometry("600x400")
        
        self.create_widgets()
    
    def create_widgets(self):
        """Create the GUI widgets."""
        # Main frame
        main_frame = tk.Frame(self.window, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = tk.Label(
            main_frame, 
            text="Font Installer", 
            font=("Arial", 16, "bold")
        )
        title_label.pack(pady=(0, 20))
        
        # Description
        desc_label = tk.Label(
            main_frame,
            text="Install custom fonts for use in the JPE Sims 4 Mod Translator application",
            wraplength=500,
            justify=tk.LEFT
        )
        desc_label.pack(pady=(0, 20))
        
        # Install button
        install_btn = tk.Button(
            main_frame,
            text="Install Font File...",
            command=self.install_font_from_dialog,
            width=20,
            height=2
        )
        install_btn.pack(pady=10)
        
        # System font info
        if sys.platform.startswith("win"):
            font_dir = get_system_font_dir()
            if font_dir:
                info_label = tk.Label(
                    main_frame,
                    text=f"System fonts directory: {font_dir}",
                    font=("Arial", 9),
                    fg="gray"
                )
                info_label.pack(pady=(20, 10))
        
        # Installed fonts list
        list_frame = tk.Frame(main_frame)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=(20, 0))
        
        tk.Label(list_frame, text="Installed Fonts:", font=("Arial", 10, "bold")).pack(anchor=tk.W)
        
        # Create listbox with scrollbar
        listbox_frame = tk.Frame(list_frame)
        listbox_frame.pack(fill=tk.BOTH, expand=True)
        
        scrollbar = tk.Scrollbar(listbox_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.font_listbox = tk.Listbox(
            listbox_frame,
            yscrollcommand=scrollbar.set
        )
        self.font_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        scrollbar.config(command=self.font_listbox.yview)
        
        # Populate the list with installed fonts
        self.populate_font_list()
    
    def install_font_from_dialog(self):
        """Install font using GUI."""
        install_font_from_dialog(self.window)
        self.populate_font_list()  # Refresh the list
    
    def populate_font_list(self):
        """Populate the listbox with installed fonts."""
        self.font_listbox.delete(0, tk.END)
        
        installed_fonts = get_installed_fonts()
        for font_name in installed_fonts[:50]:  # Limit display to first 50 fonts
            self.font_listbox.insert(tk.END, font_name)


def show_font_installer(parent_window: tk.Tk):
    """Show the font installer GUI."""
    installer = FontInstallerGUI(parent_window)
    return installer