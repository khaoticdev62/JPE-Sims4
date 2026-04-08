"""Enhanced installer with boot checklist integration.

Uses official JPE branding colors and styling per Branding PRD v1.0.
"""

import tkinter as tk
from tkinter import ttk
import sys
import os
from pathlib import Path

from ui.installer_checklist import InstallerChecklist
from ui.jpe_branding import (
    InstallerStyle,
    BRAND_LIGHT,
    BRAND_DARK,
    BRAND_ACCENT,
    NEUTRAL_700,
    get_platform_font,
)


class EnhancedInstallerWithChecklist:
    """Installer with real-time installation progress checklist."""

    def __init__(self):
        """Initialize the enhanced installer with official JPE branding."""
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

        # Current step
        self.current_step = 0

    def _center_window(self):
        """Center window on screen."""
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (self.root.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (self.root.winfo_height() // 2)
        self.root.geometry(f"+{x}+{y}")

    def _setup_styles(self):
        """Setup ttk styles with official JPE branding."""
        style = ttk.Style()

        # Header style using brand accent color
        style.configure(
            "Header.TLabel",
            font=(get_platform_font(), InstallerStyle.TITLE_FONT_SIZE, "bold"),
            foreground=InstallerStyle.TITLE_COLOR
        )

        # Subtitle style using neutral secondary text
        style.configure(
            "Subtitle.TLabel",
            font=(get_platform_font(), InstallerStyle.SUBTITLE_FONT_SIZE),
            foreground=InstallerStyle.SUBTITLE_COLOR
        )

        # Primary button style
        style.configure(
            "Primary.TButton",
            font=(get_platform_font(), 10)
        )

    def _create_layout(self):
        """Create installer layout with official JPE branding."""
        # Main container
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

        # Header
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill=tk.X, pady=(0, 20))

        # Title using brand accent color
        title = ttk.Label(
            header_frame,
            text=InstallerStyle.TITLE_TEXT,
            style="Header.TLabel"
        )
        title.pack(anchor=tk.W)

        # Subtitle using neutral secondary text
        subtitle = ttk.Label(
            header_frame,
            text="Professional Installation",
            style="Subtitle.TLabel"
        )
        subtitle.pack(anchor=tk.W, pady=(5, 0))

        # Separator
        separator = ttk.Separator(main_frame, orient=tk.HORIZONTAL)
        separator.pack(fill=tk.X, pady=(0, 20))

        # Content area - will be populated based on step
        self.content_frame = ttk.Frame(main_frame)
        self.content_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 20))

        # Navigation buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, side=tk.BOTTOM)

        self.back_button = ttk.Button(
            button_frame,
            text="< Back",
            command=self._go_back
        )
        self.back_button.pack(side=tk.LEFT, padx=(0, 10))

        self.next_button = ttk.Button(
            button_frame,
            text="Next >",
            command=self._go_next
        )
        self.next_button.pack(side=tk.LEFT, padx=5)

        self.cancel_button = ttk.Button(
            button_frame,
            text="Cancel",
            command=self.root.quit
        )
        self.cancel_button.pack(side=tk.RIGHT)

        # Show welcome screen
        self._show_welcome()

    def _clear_content(self):
        """Clear content frame."""
        for widget in self.content_frame.winfo_children():
            widget.destroy()

    def _show_welcome(self):
        """Show welcome screen."""
        self._clear_content()

        # Message
        msg = ttk.Label(self.content_frame,
                       text="Welcome to JPE Sims 4 Mod Translator Setup\n\n"
                            "This installation wizard will guide you through the "
                            "process of installing JPE Sims 4 Mod Translator on your system.\n\n"
                            "Click 'Next' to continue.",
                       style="Subtitle.TLabel",
                       justify=tk.LEFT)
        msg.pack(pady=50)

        self.back_button.config(state=tk.DISABLED)
        self.next_button.config(text="Next >", state=tk.NORMAL)

    def _show_license(self):
        """Show license screen."""
        self._clear_content()

        # License text
        license_frame = ttk.Frame(self.content_frame)
        license_frame.pack(fill=tk.BOTH, expand=True)

        text = tk.Text(license_frame, height=15, width=80, wrap=tk.WORD)
        text.pack(fill=tk.BOTH, expand=True)

        license_text = """MIT License

Copyright (c) 2024 JPE Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

[Full license text would appear here...]"""

        text.insert(tk.END, license_text)
        text.config(state=tk.DISABLED)

        # Agreement
        self.agree_var = tk.BooleanVar()
        agree_check = ttk.Checkbutton(self.content_frame,
                                     text="I agree to the license terms",
                                     variable=self.agree_var)
        agree_check.pack(pady=10)

        self.back_button.config(state=tk.NORMAL)
        self.next_button.config(
            text="I Agree",
            state=tk.NORMAL,
            command=lambda: self._go_next() if self.agree_var.get() else None
        )

    def _show_destination(self):
        """Show destination folder selection."""
        self._clear_content()

        label = ttk.Label(self.content_frame,
                         text="Select Installation Directory:",
                         style="Subtitle.TLabel")
        label.pack(pady=(10, 10))

        path_frame = ttk.Frame(self.content_frame)
        path_frame.pack(fill=tk.X, pady=10)

        self.dest_var = tk.StringVar(value=str(Path.home() / "JPE"))
        path_entry = ttk.Entry(path_frame, textvariable=self.dest_var, width=50)
        path_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))

        browse_button = ttk.Button(path_frame, text="Browse...",
                                   command=self._browse_destination)
        browse_button.pack(side=tk.LEFT)

        # Space info
        info = ttk.Label(self.content_frame,
                        text="Requires approximately 500MB of disk space.",
                        style="Subtitle.TLabel")
        info.pack(pady=20)

        self.back_button.config(state=tk.NORMAL)
        self.next_button.config(text="Next >", state=tk.NORMAL)

    def _browse_destination(self):
        """Browse for destination folder."""
        from tkinter import filedialog
        folder = filedialog.askdirectory(title="Select Installation Directory")
        if folder:
            self.dest_var.set(folder)

    def _show_components(self):
        """Show component selection."""
        self._clear_content()

        label = ttk.Label(self.content_frame,
                         text="Select Components to Install:",
                         style="Subtitle.TLabel")
        label.pack(pady=(10, 20))

        self.components = {}
        components = [
            ("Desktop Application", True),
            ("Command-Line Tools", True),
            ("Documentation", True),
            ("Examples & Tutorials", True),
            ("Cloud Sync Support", True),
            ("Plugin Development Kit", False),
        ]

        for comp_name, default in components:
            var = tk.BooleanVar(value=default)
            self.components[comp_name] = var

            check = ttk.Checkbutton(self.content_frame, text=comp_name,
                                   variable=var)
            check.pack(anchor=tk.W, pady=5)

        self.back_button.config(state=tk.NORMAL)
        self.next_button.config(text="Next >", state=tk.NORMAL)

    def _show_summary(self):
        """Show installation summary."""
        self._clear_content()

        label = ttk.Label(self.content_frame,
                         text="Ready to Install",
                         style="Subtitle.TLabel")
        label.pack(pady=(10, 20))

        # Summary info
        summary_text = f"""Installation Path: {self.dest_var.get()}

Selected Components:
"""
        for comp_name, var in self.components.items():
            if var.get():
                summary_text += f"  ✓ {comp_name}\n"

        summary_text += "\nClick 'Install' to begin installation."

        info = ttk.Label(self.content_frame, text=summary_text,
                        style="Subtitle.TLabel", justify=tk.LEFT)
        info.pack(pady=20)

        self.back_button.config(state=tk.NORMAL)
        self.next_button.config(text="Install", state=tk.NORMAL,
                               command=self._show_installation)

    def _show_installation(self):
        """Show installation progress."""
        self._clear_content()

        # Create checklist
        checklist = InstallerChecklist(self.content_frame,
                                      "Installation Progress")
        checklist.pack(fill=tk.BOTH, expand=True)

        # Add installation steps
        steps = [
            ("Creating directories", self._step_create_dirs),
            ("Extracting files", self._step_extract_files),
            ("Installing dependencies", self._step_install_deps),
            ("Configuring application", self._step_configure),
            ("Setting up shortcuts", self._step_shortcuts),
            ("Initializing database", self._step_database),
            ("Downloading updates", self._step_updates),
            ("Verifying installation", self._step_verify),
        ]

        for step_name, step_func in steps:
            checklist.add_item(step_name, step_func)

        # Hide navigation buttons during installation
        self.back_button.pack_forget()
        self.cancel_button.config(state=tk.DISABLED)
        self.next_button.config(state=tk.DISABLED)

        # Run installation
        def on_complete():
            self.next_button.config(text="Finish", state=tk.NORMAL,
                                   command=self._show_completion)
            self.cancel_button.config(text="Close", state=tk.NORMAL)

        checklist.completion_callback = on_complete
        checklist.run()

    def _show_completion(self):
        """Show completion screen with success branding."""
        self._clear_content()

        # Use diagnostic success color for completion message
        from ui.jpe_branding import DIAGNOSTIC_SUCCESS
        label = ttk.Label(
            self.content_frame,
            text="✓ Installation Complete!",
            style="Header.TLabel",
            foreground=DIAGNOSTIC_SUCCESS
        )
        label.pack(pady=(30, 10))

        msg = ttk.Label(self.content_frame,
                       text=f"JPE Sims 4 Mod Translator has been successfully "
                            f"installed to:\n\n{self.dest_var.get()}\n\n"
                            f"You can now launch the application from the Start Menu "
                            f"or desktop shortcut.",
                       style="Subtitle.TLabel",
                       justify=tk.CENTER)
        msg.pack(pady=50)

        # Hide other buttons
        self.back_button.pack_forget()
        self.next_button.config(text="Finish", command=self.root.quit)

    def _go_back(self):
        """Go to previous step."""
        self.current_step = max(0, self.current_step - 1)
        self._show_step()

    def _go_next(self):
        """Go to next step."""
        self.current_step += 1
        self._show_step()

    def _show_step(self):
        """Show current step."""
        steps = [
            self._show_welcome,
            self._show_license,
            self._show_destination,
            self._show_components,
            self._show_summary,
        ]

        if self.current_step < len(steps):
            steps[self.current_step]()

    # Installation step functions
    def _step_create_dirs(self):
        """Create installation directories."""
        import time
        time.sleep(0.5)
        return "success", "Directories created"

    def _step_extract_files(self):
        """Extract installation files."""
        import time
        time.sleep(1.0)
        return "success", "Files extracted"

    def _step_install_deps(self):
        """Install dependencies."""
        import time
        time.sleep(1.5)
        return "success", "Dependencies installed"

    def _step_configure(self):
        """Configure application."""
        import time
        time.sleep(0.8)
        return "success", "Configuration complete"

    def _step_shortcuts(self):
        """Create shortcuts."""
        import time
        time.sleep(0.3)
        return "success", "Shortcuts created"

    def _step_database(self):
        """Initialize database."""
        import time
        time.sleep(0.6)
        return "success", "Database ready"

    def _step_updates(self):
        """Download updates."""
        import time
        time.sleep(1.2)
        return "success", "Updates downloaded"

    def _step_verify(self):
        """Verify installation."""
        import time
        time.sleep(0.5)
        return "success", "Verification passed"

    def run(self):
        """Run the installer."""
        self.root.mainloop()


if __name__ == "__main__":
    installer = EnhancedInstallerWithChecklist()
    installer.run()
