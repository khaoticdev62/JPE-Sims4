"""
Animated Installer for JPE Sims 4 Mod Translator.

This module creates an enhanced installer with animations and visual
feedback during the installation process, in alignment with the PRDs.
"""

import tkinter as tk
from tkinter import ttk, messagebox
import sys
import os
from pathlib import Path
import threading
import time
from typing import Callable, Optional

# Import branding and animation components
from ui.jpe_branding import (
    InstallerStyle,
    BRAND_LIGHT,
    BRAND_DARK,
    BRAND_ACCENT,
    NEUTRAL_700,
    get_platform_font,
)
from ui.animation_pack import (
    ButtonHoverAnimation,
    NotificationAnimation,
    SplashScreenAnimation
)
from ui.animation_system import animation_manager


class AnimatedInstaller:
    """Animated installer with visual feedback and progress indicators."""

    def __init__(self):
        """Initialize the animated installer with JPE branding."""
        self.root = tk.Tk()
        self.root.title(InstallerStyle.TITLE_TEXT + " - Setup")
        self.root.geometry(f"{InstallerStyle.WINDOW_WIDTH}x{InstallerStyle.WINDOW_HEIGHT}")
        self.root.resizable(False, False)
        self.root.configure(bg=InstallerStyle.HEADER_BG)

        # Center window
        self._center_window()

        # Setup styles
        self._setup_styles()

        # Create main layout
        self._create_layout()

        # Initialize animation components
        self.notification_area: Optional[tk.Frame] = None
        self.current_step = 0
        self.installation_complete = False
        
        # Initialize animation manager
        animation_manager.start_animation_loop(self.root)

    def _center_window(self):
        """Center window on screen."""
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (self.root.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (self.root.winfo_height() // 2)
        self.root.geometry(f"+{x}+{y}")

    def _setup_styles(self):
        """Setup custom styles for installer."""
        style = ttk.Style()
        
        # Configure progress bar
        style.configure(
            "Installer.Horizontal.TProgressbar",
            background=BRAND_ACCENT,
            troughcolor=BRAND_LIGHT,
            bordercolor=BRAND_DARK
        )

    def _create_layout(self):
        """Create the main layout for the installer."""
        # Header with branding
        header_frame = ttk.Frame(self.root)
        header_frame.pack(fill=tk.X, padx=20, pady=20)

        title_label = ttk.Label(
            header_frame,
            text=InstallerStyle.TITLE_TEXT,
            font=(get_platform_font(), InstallerStyle.TITLE_FONT_SIZE, "bold"),
            foreground=BRAND_ACCENT
        )
        title_label.pack(anchor=tk.W)

        subtitle_label = ttk.Label(
            header_frame,
            text="Install JPE Sims 4 Mod Translator",
            font=(get_platform_font(), InstallerStyle.SUBTITLE_FONT_SIZE),
            foreground=NEUTRAL_700
        )
        subtitle_label.pack(anchor=tk.W, pady=(5, 0))

        # Main content area
        self.content_frame = ttk.Frame(self.root)
        self.content_frame.pack(fill=tk.BOTH, expand=True, padx=30, pady=20)

        # Progress bar
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(
            self.root,
            variable=self.progress_var,
            maximum=100,
            style="Installer.Horizontal.TProgressbar",
            length=500
        )
        self.progress_bar.pack(pady=(20, 10))

        # Progress label
        self.progress_label = ttk.Label(
            self.root,
            text="Ready to install",
            font=(get_platform_font(), 9),
            foreground=NEUTRAL_700
        )
        self.progress_label.pack()

        # Button frame
        button_frame = ttk.Frame(self.root)
        button_frame.pack(fill=tk.X, padx=30, pady=20)

        # Cancel button
        self.cancel_btn = ttk.Button(
            button_frame,
            text="Cancel",
            command=self.cancel_installation
        )
        self.cancel_btn.pack(side=tk.LEFT)

        # Install button
        self.install_btn = ttk.Button(
            button_frame,
            text="Install",
            command=self.start_installation
        )
        self.install_btn.pack(side=tk.RIGHT)

        # Apply hover animations to buttons
        ButtonHoverAnimation(self.cancel_btn)
        ButtonHoverAnimation(self.install_btn)

        # Create notification area
        self.notification_area = tk.Frame(self.root, bg=BRAND_LIGHT)
        self.notification_area.pack(fill=tk.X, padx=30, pady=(0, 10))

    def _create_welcome_page(self):
        """Create the welcome page content."""
        for widget in self.content_frame.winfo_children():
            widget.destroy()

        welcome_frame = ttk.Frame(self.content_frame)
        welcome_frame.pack(expand=True)

        welcome_label = ttk.Label(
            welcome_frame,
            text="Welcome to the JPE Sims 4 Mod Translator Installer",
            font=(get_platform_font(), 14, "bold")
        )
        welcome_label.pack(pady=(0, 20))

        desc_label = ttk.Label(
            welcome_frame,
            text="This installer will guide you through the installation process.\n\n"
                 "Click 'Install' to begin the installation.",
            font=(get_platform_font(), 10),
            justify=tk.CENTER
        )
        desc_label.pack(pady=(0, 30))

    def _create_installation_page(self):
        """Create the installation progress page."""
        for widget in self.content_frame.winfo_children():
            widget.destroy()

        # Installation status frame
        status_frame = ttk.Frame(self.content_frame)
        status_frame.pack(expand=True)

        # Status label
        self.status_label = ttk.Label(
            status_frame,
            text="Starting installation...",
            font=(get_platform_font(), 12, "bold")
        )
        self.status_label.pack(pady=(0, 20))

        # Detailed status
        self.detail_status = tk.Text(
            status_frame,
            height=10,
            width=70,
            wrap=tk.WORD,
            state=tk.DISABLED
        )
        self.detail_status.pack(fill=tk.BOTH, expand=True)

        # Scrollbar for text widget
        scrollbar = ttk.Scrollbar(status_frame, orient=tk.VERTICAL, command=self.detail_status.yview)
        self.detail_status.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    def _create_completion_page(self):
        """Create the installation completion page."""
        for widget in self.content_frame.winfo_children():
            widget.destroy()

        completion_frame = ttk.Frame(self.content_frame)
        completion_frame.pack(expand=True)

        success_label = ttk.Label(
            completion_frame,
            text="Installation Complete!",
            font=(get_platform_font(), 16, "bold"),
            foreground=BRAND_ACCENT
        )
        success_label.pack(pady=(0, 20))

        success_desc = ttk.Label(
            completion_frame,
            text="JPE Sims 4 Mod Translator has been successfully installed.\n\n"
                 "Click 'Finish' to exit the installer.",
            font=(get_platform_font(), 10),
            justify=tk.CENTER
        )
        success_desc.pack(pady=(0, 30))

        # Update install button to finish
        self.install_btn.config(text="Finish", command=self.finish_installation)

    def start_installation(self):
        """Start the installation process with animations."""
        self._create_installation_page()
        
        # Disable install button during installation
        self.install_btn.config(state=tk.DISABLED)
        self.cancel_btn.config(state=tk.DISABLED)
        
        # Start installation in a separate thread to prevent UI blocking
        install_thread = threading.Thread(target=self._run_installation, daemon=True)
        install_thread.start()

    def _run_installation(self):
        """Run the actual installation process in a background thread."""
        # Installation steps with delays to simulate work
        installation_steps = [
            ("Preparing installation...", 0.1),
            ("Creating directories...", 0.2),
            ("Extracting application files...", 0.4),
            ("Setting up configuration...", 0.6),
            ("Installing dependencies...", 0.8),
            ("Finalizing installation...", 0.95),
            ("Installation complete!", 1.0)
        ]

        for step_desc, progress in installation_steps:
            # Update UI in the main thread
            self.root.after(0, lambda desc=step_desc, p=progress: self._update_installation_status(desc, p))
            time.sleep(1)  # Simulate work being done

        # Show completion page
        self.root.after(0, self._show_completion)

    def _update_installation_status(self, description: str, progress: float):
        """Update the installation status with animation."""
        self.status_label.config(text=description)
        self.progress_var.set(progress * 100)
        self.progress_label.config(text=f"Installing... ({int(progress * 100)}%)")
        
        # Add to detailed status
        self.detail_status.config(state=tk.NORMAL)
        self.detail_status.insert(tk.END, f"[{time.strftime('%H:%M:%S')}] {description}\n")
        self.detail_status.see(tk.END)  # Auto-scroll to end
        self.detail_status.config(state=tk.DISABLED)

        # Show notification for key milestones
        if progress > 0.3 and progress < 0.4:  # Extracting files
            self._show_notification("Extracting application files...", "info")
        elif progress > 0.6 and progress < 0.7:  # Installing dependencies
            self._show_notification("Installing required components...", "info")

    def _show_notification(self, message: str, notification_type: str = "info"):
        """Show an animated notification."""
        notifier = NotificationAnimation(self.notification_area)
        notifier.show_notification(message, 2.0, notification_type)

    def _show_completion(self):
        """Show the completion page."""
        self._create_completion_page()
        self.installation_complete = True
        
        # Show final notification
        self._show_notification("Installation completed successfully!", "success")

    def cancel_installation(self):
        """Handle installation cancellation."""
        if not self.installation_complete:
            if messagebox.askyesno("Cancel Installation", "Are you sure you want to cancel the installation?"):
                self.root.destroy()
        else:
            self.root.destroy()

    def finish_installation(self):
        """Finish the installation and close the installer."""
        self.root.destroy()

    def run(self):
        """Run the installer."""
        self._create_welcome_page()
        self.root.mainloop()


def run_animated_installer():
    """Run the animated installer."""
    installer = AnimatedInstaller()
    installer.run()


# Create a splash screen option for the installer
def show_splash_and_install():
    """Show an animated splash screen before running the installer."""
    def start_installer():
        installer = AnimatedInstaller()
        installer.run()
    
    # Show splash screen for 3 seconds, then start installer
    splash = SplashScreenAnimation(start_installer, duration=3.0)
    splash.root.mainloop()


if __name__ == "__main__":
    # Run either the installer directly or with splash screen
    # show_splash_and_install()
    run_animated_installer()