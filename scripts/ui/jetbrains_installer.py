"""
Advanced GUI Installer with JetBrains-like Interface and Integrated CLI.

This module provides a sophisticated installer with modern UI elements,
integrated console output with color coding, and professional styling.
"""

import tkinter as tk
from tkinter import ttk, messagebox
import tkinter.scrolledtext as ScrolledText
import sys
import os
from pathlib import Path
import threading
import time
import subprocess
from typing import Optional, List, Callable, Any
import json
import re

try:
    import ttkbootstrap as ttkb
    from ttkbootstrap import Style
    from ttkbootstrap.constants import *
    ttkb_available = True
except ImportError:
    ttkb_available = False

# Import color manager and theme manager for styling
try:
    from ui.color_manager import color_manager
    from ui.theme_manager import theme_manager
    from ui.jpe_branding import (
        BRAND_LIGHT,
        BRAND_DARK,
        BRAND_ACCENT,
        NEUTRAL_700,
        NEUTRAL_500,
        NEUTRAL_300,
        NEUTRAL_100,
        get_platform_font
    )
except ImportError:
    # Fallback values
    BRAND_LIGHT = "#f8f9fa"
    BRAND_DARK = "#212529"
    BRAND_ACCENT = "#2ec4b6"
    NEUTRAL_700 = "#4d4d4d"
    NEUTRAL_500 = "#7f7f7f"
    NEUTRAL_300 = "#bfbfbf"
    NEUTRAL_100 = "#e6e6e6"
    def get_platform_font():
        return "TkDefaultFont"

from ui.animation_system import AnimationManager


class ColoredConsole(ScrolledText.ScrolledText):
    """A console text widget with color-coded output."""

    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)

        # Configure color tags
        self.tag_configure("info", foreground="blue")
        self.tag_configure("success", foreground="green")
        self.tag_configure("warning", foreground="orange")
        self.tag_configure("error", foreground="red")
        self.tag_configure("debug", foreground="purple")
        self.tag_configure("highlight", background=BRAND_ACCENT, foreground="white")
        self.tag_configure("command", foreground=BRAND_ACCENT)

        # Make the text widget readonly by default
        self.config(state=tk.DISABLED)

        # Bind to allow scrolling while keeping cursor disabled
        self.bind("<Button-1>", lambda event: self.focus_set())

    def write(self, text, tag=None):
        """Write text with optional color tag."""
        self.config(state=tk.NORMAL)
        self.insert(tk.END, text, tag)

        # Auto-scroll to show new content
        self.see(tk.END)
        self.config(state=tk.DISABLED)

    def clear(self):
        """Clear all text."""
        self.config(state=tk.NORMAL)
        self.delete(1.0, tk.END)
        self.config(state=tk.DISABLED)

    def color_line(self, line_num, tag):
        """Apply color to a specific line."""
        start_idx = f"{line_num}.0"
        end_idx = f"{line_num}.end"
        self.tag_add(tag, start_idx, end_idx)


class JetBrainsInstaller:
    """A JetBrains-style installer with integrated CLI window."""
    
    def __init__(self):
        if ttkb_available:
            self.root = ttkb.Window(themename="darkly")
            self.root.title("JPE Sims 4 Mod Translator - Setup")
        else:
            self.root = tk.Tk()
            self.root.title("JPE Sims 4 Mod Translator - Setup")
            self.root.configure(bg=BRAND_DARK)
        
        self.root.geometry("900x700")
        self.root.resizable(True, True)
        
        # Center the window
        self.center_window()
        
        # Initialize animation manager
        self.animation_manager = AnimationManager()
        
        # Setup UI
        self.setup_ui()
        
        # Start animation system
        self.animation_manager.start_animation_loop(self.root)
    
    def center_window(self):
        """Center the installer window on screen."""
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (self.root.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (self.root.winfo_height() // 2)
        self.root.geometry(f"+{x}+{y}")
    
    def setup_ui(self):
        """Setup the JetBrains-like installer UI."""
        # Main container
        if ttkb_available:
            self.main_frame = ttkb.Frame(self.root)
        else:
            self.main_frame = tk.Frame(self.root, bg=BRAND_DARK)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create top banner similar to JetBrains installers
        self.create_banner()
        
        # Create main content area
        self.create_main_content()
        
        # Create bottom buttons
        self.create_bottom_buttons()
        
        # Create status bar
        self.create_status_bar()
    
    def create_banner(self):
        """Create the top banner with branding."""
        # Banner frame
        if ttkb_available:
            banner_frame = ttkb.Frame(self.main_frame, bootstyle="primary")
        else:
            banner_frame = tk.Frame(self.main_frame, bg=BRAND_ACCENT)
        banner_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Banner content
        banner_content = tk.Frame(banner_frame, bg=BRAND_ACCENT if not ttkb_available else "#2c3e50")
        banner_content.pack(fill=tk.X, padx=20, pady=15)
        
        # Title
        title_label = tk.Label(
            banner_content,
            text="JPE Sims 4 Mod Translator",
            font=(get_platform_font(), 18, "bold"),
            fg="white",
            bg=BRAND_ACCENT if not ttkb_available else "#2c3e50"
        )
        title_label.pack(anchor=tk.W)
        
        # Subtitle
        subtitle_label = tk.Label(
            banner_content,
            text="Complete Installation Package",
            font=(get_platform_font(), 10),
            fg=NEUTRAL_100,
            bg=BRAND_ACCENT if not ttkb_available else "#2c3e50"
        )
        subtitle_label.pack(anchor=tk.W)
    
    def create_main_content(self):
        """Create the main content area with installer and console."""
        # Create paned window to split installer steps and console
        if ttkb_available:
            self.paned_window = ttkb.PanedWindow(self.main_frame, orient=tk.HORIZONTAL)
        else:
            self.paned_window = tk.PanedWindow(self.main_frame, orient=tk.HORIZONTAL, sashrelief=tk.RAISED)
        self.paned_window.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Left panel - Installation steps (similar to JetBrains installers)
        if ttkb_available:
            left_panel = ttkb.Frame(width=400)
            self.paned_window.add(left_panel, weight=2)
        else:
            left_panel = tk.Frame(self.paned_window, width=400, bg=BRAND_LIGHT)
            self.paned_window.add(left_panel)
        
        # Installation steps frame
        steps_label = tk.Label(
            left_panel,
            text="Installation Steps",
            font=(get_platform_font(), 12, "bold"),
            fg=NEUTRAL_900 if ttkb_available else BRAND_DARK,
            bg=BRAND_LIGHT if not ttkb_available else self.root.cget("bg")
        )
        steps_label.pack(anchor=tk.W, padx=10, pady=(0, 10))
        
        # Create installation steps with checkboxes
        self.steps_frame = tk.Frame(left_panel, bg=BRAND_LIGHT if not ttkb_available else self.root.cget("bg"))
        self.steps_frame.pack(fill=tk.BOTH, expand=True, padx=10)
        
        # Define installation steps
        self.install_steps = [
            ("License Agreement", "Accept the JPE license terms"),
            ("Installation Directory", "Select where to install the application"),
            ("Component Selection", "Choose components to install"),
            ("System Requirements", "Verify system compatibility"),
            ("Installation", "Installing application files"),
            ("Finalizing Setup", "Completing installation process")
        ]
        
        self.step_vars = {}
        for i, (step_title, step_desc) in enumerate(self.install_steps):
            step_frame = tk.Frame(self.steps_frame, bg=BRAND_LIGHT if not ttkb_available else self.root.cget("bg"))
            step_frame.pack(fill=tk.X, pady=2)
            
            # Checkbox
            var = tk.BooleanVar()
            self.step_vars[step_title] = var
            
            if ttkb_available:
                chk = ttkb.Checkbutton(step_frame, variable=var, bootstyle="round-toggle")
            else:
                chk = tk.Checkbutton(step_frame, variable=var, bg=BRAND_LIGHT if not ttkb_available else self.root.cget("bg"))
            chk.pack(side=tk.LEFT)
            
            # Text
            text_frame = tk.Frame(step_frame, bg=BRAND_LIGHT if not ttkb_available else self.root.cget("bg"))
            text_frame.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(5, 0))
            
            title_lbl = tk.Label(
                text_frame,
                text=step_title,
                font=(get_platform_font(), 10, "bold"),
                fg=NEUTRAL_700 if ttkb_available else BRAND_DARK,
                bg=BRAND_LIGHT if not ttkb_available else self.root.cget("bg")
            )
            title_lbl.pack(anchor=tk.W)
            
            desc_lbl = tk.Label(
                text_frame,
                text=step_desc,
                font=(get_platform_font(), 8),
                fg=NEUTRAL_500 if ttkb_available else NEUTRAL_700,
                bg=BRAND_LIGHT if not ttkb_available else self.root.cget("bg")
            )
            desc_lbl.pack(anchor=tk.W)
        
        # Right panel - Console with color coding
        if ttkb_available:
            right_panel = ttkb.Frame()
            self.paned_window.add(right_panel, weight=3)
        else:
            right_panel = tk.Frame(self.paned_window, bg=BRAND_LIGHT)
            self.paned_window.add(right_panel)
        
        # Console title
        console_label = tk.Label(
            right_panel,
            text="Installation Console",
            font=(get_platform_font(), 12, "bold"),
            fg=NEUTRAL_900 if ttkb_available else BRAND_DARK,
            bg=BRAND_LIGHT if not ttkb_available else self.root.cget("bg")
        )
        console_label.pack(anchor=tk.W, padx=10, pady=(0, 5))
        
        # Create the color-coded console
        self.console = ColoredConsole(
            right_panel,
            wrap=tk.WORD,
            height=20,
            font=(get_platform_font(), 9)
        )
        self.console.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0, 5))
        
        # Add installation start message
        self.console.write("JPE Sims 4 Mod Translator Installer\n", "highlight")
        self.console.write("=====================================\n\n", "highlight")
        self.console.write("Welcome to the JPE Sims 4 Mod Translator installer.\n", "info")
        self.console.write("Follow the installation steps and monitor progress in this console.\n\n", "info")
        
        # Progress bar
        if ttkb_available:
            self.progress = ttkb.Progressbar(
                right_panel,
                bootstyle="success-striped",
                length=400
            )
        else:
            self.progress = ttk.Progressbar(
                right_panel,
                length=400
            )
        self.progress.pack(fill=tk.X, padx=10, pady=(0, 10))
        self.progress_var = tk.DoubleVar()
        self.progress.config(variable=self.progress_var)
    
    def create_bottom_buttons(self):
        """Create bottom action buttons."""
        button_frame = tk.Frame(self.main_frame, bg=BRAND_DARK if not ttkb_available else self.root.cget("bg"))
        button_frame.pack(fill=tk.X, padx=10, pady=(5, 10))
        
        # Left buttons
        left_buttons = tk.Frame(button_frame, bg=BRAND_DARK if not ttkb_available else self.root.cget("bg"))
        left_buttons.pack(side=tk.LEFT)
        
        self.prev_button = tk.Button(
            left_buttons,
            text="< Previous",
            state=tk.DISABLED,
            command=self.previous_step
        )
        self.prev_button.pack(side=tk.LEFT, padx=(0, 5))
        
        # Right buttons
        right_buttons = tk.Frame(button_frame, bg=BRAND_DARK if not ttkb_available else self.root.cget("bg"))
        right_buttons.pack(side=tk.RIGHT)
        
        self.next_button = tk.Button(
            right_buttons,
            text="Next >",
            command=self.next_step
        )
        self.next_button.pack(side=tk.RIGHT, padx=(5, 0))
        
        self.install_button = tk.Button(
            right_buttons,
            text="Install",
            state=tk.DISABLED,
            command=self.start_installation
        )
        self.install_button.pack(side=tk.RIGHT, padx=(5, 0))
        
        self.cancel_button = tk.Button(
            right_buttons,
            text="Cancel",
            command=self.cancel_installation
        )
        self.cancel_button.pack(side=tk.RIGHT, padx=(5, 0))
    
    def create_status_bar(self):
        """Create a status bar at the bottom."""
        if ttkb_available:
            status_frame = ttkb.Frame(self.main_frame, bootstyle="dark")
        else:
            status_frame = tk.Frame(self.main_frame, bg=BRAND_DARK)
        status_frame.pack(fill=tk.X, side=tk.BOTTOM)
        
        self.status_label = tk.Label(
            status_frame,
            text="Ready to install JPE Sims 4 Mod Translator",
            font=(get_platform_font(), 9),
            fg="white",
            bg=BRAND_DARK if not ttkb_available else "#2c3e50"
        )
        self.status_label.pack(side=tk.LEFT, padx=10, pady=5)
    
    def next_step(self):
        """Go to the next installation step."""
        self.console.write(f"Moving to next installation step...\n", "info")
        
        # Mark current step as complete
        current_step_index = 0
        for i, (step_title, _) in enumerate(self.install_steps):
            if self.step_vars[step_title].get():
                current_step_index = i + 1
        
        # Update the next step
        if current_step_index < len(self.install_steps):
            step_title, _ = self.install_steps[current_step_index]
            self.step_vars[step_title].set(True)
            
            # Update console with step completion
            self.console.write(f"✓ Completed: {step_title}\n", "success")
            self.status_label.config(text=f"Completed: {step_title}")
    
    def previous_step(self):
        """Go to the previous installation step."""
        self.console.write(f"Returning to previous installation step...\n", "info")
    
    def start_installation(self):
        """Start the installation process with simulated progress."""
        self.install_button.config(state=tk.DISABLED)
        self.next_button.config(state=tk.DISABLED)
        
        # Start installation in a separate thread so UI stays responsive
        install_thread = threading.Thread(target=self._perform_installation)
        install_thread.daemon = True
        install_thread.start()
    
    def _perform_installation(self):
        """Perform the installation steps."""
        steps = [
            "Verifying system requirements...",
            "Creating installation directory...",
            "Extracting application files...",
            "Setting up configuration...",
            "Installing components...",
            "Creating desktop shortcut...",
            "Registering file associations...",
            "Finalizing installation...",
            "Installation completed successfully!"
        ]
        
        total_steps = len(steps)
        
        for i, step in enumerate(steps):
            # Update progress
            progress = (i + 1) / total_steps * 100
            self.progress_var.set(progress)
            
            # Write to console with appropriate color
            if "completed" in step.lower():
                self.console.write(f"[{i+1}/{total_steps}] {step}\n", "success")
                self.status_label.config(text="Installation completed!")
            elif "error" in step.lower() or "failed" in step.lower():
                self.console.write(f"[{i+1}/{total_steps}] {step}\n", "error")
                self.status_label.config(text="Installation failed!")
            else:
                self.console.write(f"[{i+1}/{total_steps}] {step}\n", "info")
                self.status_label.config(text=step)
            
            # Simulate work being done
            time.sleep(0.5)  # Simulate processing time
        
        # Enable finish button
        self.root.after(0, self._installation_finished)
    
    def _installation_finished(self):
        """Handle completion of installation."""
        self.install_button.config(text="Finish", command=self.finish_installation)
        self.install_button.config(state=tk.NORMAL)
    
    def cancel_installation(self):
        """Cancel the installation."""
        if tk.messagebox.askyesno("Cancel Installation", "Are you sure you want to cancel the installation?"):
            self.root.quit()
    
    def finish_installation(self):
        """Finish the installation."""
        self.root.quit()
    
    def run(self):
        """Run the installer."""
        self.root.mainloop()


def create_jetbrains_style_installer():
    """Create and return a JetBrains-style installer."""
    return JetBrainsInstaller()


if __name__ == "__main__":
    # Create and run the installer
    installer = create_jetbrains_style_installer()
    installer.run()