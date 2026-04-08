"""Startup screen with boot checklist display.

Uses official JPE branding colors and styling per Branding PRD v1.0.
"""

import tkinter as tk
from tkinter import ttk
from typing import Optional, Callable
import threading

from ui.boot_checklist import BootChecklist, create_standard_checklist
from ui.jpe_branding import (
    StartupScreenStyle,
    BRAND_LIGHT,
    BRAND_DARK,
    BRAND_ACCENT,
    NEUTRAL_700,
    NEUTRAL_500,
    get_platform_font,
)


class StartupScreen:
    """Professional startup screen with boot checklist."""

    def __init__(self, root: tk.Tk, on_ready: Optional[Callable] = None):
        """
        Initialize startup screen.

        Args:
            root: Root window
            on_ready: Callback when startup completes
        """
        self.root = root
        self.on_ready = on_ready
        self.checklist: Optional[BootChecklist] = None

        # Configure root using branding specifications
        self.root.title(StartupScreenStyle.TITLE_TEXT + " - Starting...")
        self.root.geometry(f"{StartupScreenStyle.WINDOW_WIDTH}x{StartupScreenStyle.WINDOW_HEIGHT}")
        self.root.resizable(False, False)
        self.root.configure(bg=StartupScreenStyle.WINDOW_BG)

        # Center window
        self._center_window()

        # Create UI
        self._create_widgets()

    def _center_window(self):
        """Center window on screen."""
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (self.root.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (self.root.winfo_height() // 2)
        self.root.geometry(f"+{x}+{y}")

    def _create_widgets(self):
        """Create UI widgets with official JPE branding."""
        # Main frame with brand light background
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Brand header
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill=tk.X, padx=30, pady=(30, 20))

        # Title using brand accent color and platform font
        title = ttk.Label(
            header_frame,
            text=StartupScreenStyle.TITLE_TEXT,
            font=(get_platform_font(), StartupScreenStyle.TITLE_FONT_SIZE, "bold"),
            foreground=StartupScreenStyle.TITLE_COLOR
        )
        title.pack(anchor=tk.W)

        # Subtitle using neutral secondary text color
        subtitle = ttk.Label(
            header_frame,
            text=StartupScreenStyle.SUBTITLE_TEXT,
            font=(get_platform_font(), StartupScreenStyle.SUBTITLE_FONT_SIZE),
            foreground=StartupScreenStyle.SUBTITLE_COLOR
        )
        subtitle.pack(anchor=tk.W, pady=(5, 0))

        # Separator
        separator = ttk.Separator(main_frame, orient=tk.HORIZONTAL)
        separator.pack(fill=tk.X, padx=30, pady=(10, 20))

        # Checklist area
        self.checklist = create_standard_checklist(main_frame)
        # We'll need to modify BootChecklist to support embedding
        # For now, create checklist frame manually
        self._create_embedded_checklist(main_frame)

    def _create_embedded_checklist(self, parent: tk.Widget):
        """Create embedded checklist with official JPE branding."""
        # Container
        container = ttk.Frame(parent)
        container.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)

        # Checklist frame with brand light background
        canvas = tk.Canvas(
            container,
            bg=BRAND_LIGHT,
            highlightthickness=0
        )
        canvas.pack(fill=tk.BOTH, expand=True)

        scrollbar = ttk.Scrollbar(
            container,
            orient=tk.VERTICAL,
            command=canvas.yview
        )
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        canvas.config(yscrollcommand=scrollbar.set)

        # Items container
        self.items_frame = ttk.Frame(canvas)
        self.canvas_window = canvas.create_window(
            (0, 0),
            window=self.items_frame,
            anchor=tk.NW
        )
        canvas.config(scrollregion=canvas.bbox("all"))

        self.canvas = canvas
        self.items = {}

    def add_check_item(self, name: str, func: Optional[Callable] = None):
        """
        Add a check item to the startup screen.

        Args:
            name: Display name
            func: Check function to execute
        """
        item_frame = ttk.Frame(self.items_frame)
        item_frame.pack(fill=tk.X, padx=10, pady=5)

        # Status indicator - pending symbol with neutral color
        status_label = tk.Label(
            item_frame,
            text="○",
            font=(get_platform_font(), 14, "bold"),
            fg=NEUTRAL_500,
            bg=BRAND_LIGHT
        )
        status_label.pack(side=tk.LEFT, padx=(5, 10))

        # Content frame
        content_frame = ttk.Frame(item_frame)
        content_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        name_label = ttk.Label(
            content_frame,
            text=name,
            font=(get_platform_font(), 10)
        )
        name_label.pack(anchor=tk.W)

        msg_label = ttk.Label(
            content_frame,
            text="",
            font=(get_platform_font(), 8),
            foreground=NEUTRAL_700
        )
        msg_label.pack(anchor=tk.W)

        # Time label
        time_label = tk.Label(
            item_frame,
            text="",
            font=(get_platform_font(), 8),
            fg=NEUTRAL_700,
            bg=BRAND_LIGHT
        )
        time_label.pack(side=tk.RIGHT, padx=5)

        item_data = {
            "frame": item_frame,
            "status": status_label,
            "name": name_label,
            "message": msg_label,
            "time": time_label,
            "func": func,
            "status_val": "pending"
        }
        self.items[name] = item_data

        # Update canvas
        self.items_frame.update_idletasks()
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))

    def update_item(self, name: str, status: str, message: str = "", elapsed: float = 0):
        """
        Update an item status using official JPE branding.

        Args:
            name: Item name
            status: Status (pending, checking, success, warning, error)
            message: Status message
            elapsed: Elapsed time in seconds
        """
        if name not in self.items:
            return

        item = self.items[name]

        # Use branding constants for symbols and colors
        from ui.jpe_branding import BootChecklistStyle
        symbols = BootChecklistStyle.STATUS_SYMBOLS
        colors = BootChecklistStyle.STATUS_COLORS

        item["status"].config(text=symbols[status], fg=colors[status])
        if message:
            item["message"].config(text=message)
        if elapsed > 0:
            item["time"].config(text=f"{elapsed:.2f}s")

        item["status_val"] = status

    def run_startup(self):
        """Run startup sequence."""
        # Start in background thread
        thread = threading.Thread(target=self._run_startup_sequence, daemon=True)
        thread.start()

    def _run_startup_sequence(self):
        """Run the startup sequence."""
        # Add items
        checks = [
            ("System Requirements", lambda: self._check_system()),
            ("Configuration", lambda: self._check_config()),
            ("Security", lambda: self._check_security()),
            ("Themes", lambda: self._check_themes()),
            ("Engine", lambda: self._check_engine()),
            ("Plugins", lambda: self._check_plugins()),
            ("Cloud", lambda: self._check_cloud()),
            ("Onboarding", lambda: self._check_onboarding()),
            ("Documentation", lambda: self._check_docs()),
            ("Finalization", lambda: self._check_finalize()),
        ]

        # Run all checks
        for name, func in checks:
            self.root.after(0, self.add_check_item, name, func)

        total = len(checks)
        for index, (name, func) in enumerate(checks):
            try:
                self.root.after(0, self.update_item, name, "checking")

                import time
                start = time.time()
                result = func()
                elapsed = time.time() - start

                if isinstance(result, tuple):
                    status, msg = result
                else:
                    status, msg = "success", ""

                self.root.after(0, self.update_item, name, status, msg, elapsed)

            except Exception as e:
                self.root.after(0, self.update_item, name, "error",
                              str(e)[:50], 0)

            import time
            time.sleep(0.1)

        # Complete
        self.root.after(0, self._on_startup_complete)

    def _check_system(self):
        """Check system requirements."""
        import platform
        import sys
        try:
            import psutil
            memory = psutil.virtual_memory().available / (1024**3)
        except:
            memory = 0

        return "success", f"{platform.system()} | Python {sys.version_info.major}.{sys.version_info.minor} | {memory:.1f}GB"

    def _check_config(self):
        """Check configuration."""
        try:
            from config.config_manager import config_manager
            config_manager.load()
            return "success", "Configuration loaded"
        except Exception as e:
            return "warning", str(e)[:40]

    def _check_security(self):
        """Check security."""
        try:
            from security.validator import security_validator
            return "success", "Security initialized"
        except Exception as e:
            return "warning", str(e)[:40]

    def _check_themes(self):
        """Check themes."""
        try:
            from ui.theme_manager import theme_manager
            count = len(theme_manager.themes)
            return "success", f"{count} themes available"
        except Exception as e:
            return "error", str(e)[:40]

    def _check_engine(self):
        """Check engine."""
        try:
            from engine.engine import TranslationEngine
            return "success", "Engine ready"
        except Exception as e:
            return "error", str(e)[:40]

    def _check_plugins(self):
        """Check plugins."""
        try:
            from plugins.manager import PluginManager
            mgr = PluginManager()
            count = len(mgr.list_plugins())
            return "success", f"{count} plugins loaded"
        except Exception as e:
            return "warning", str(e)[:40]

    def _check_cloud(self):
        """Check cloud."""
        try:
            from cloud.api import CloudAPI
            return "success", "Cloud client ready"
        except Exception as e:
            return "warning", str(e)[:40]

    def _check_onboarding(self):
        """Check onboarding."""
        try:
            from onboarding.the_codex import CodexManager
            mgr = CodexManager()
            return "success", f"{len(mgr.lessons)} lessons"
        except Exception as e:
            return "warning", str(e)[:40]

    def _check_docs(self):
        """Check documentation."""
        try:
            return "success", "Documentation loaded"
        except Exception as e:
            return "warning", str(e)[:40]

    def _check_finalize(self):
        """Finalize startup."""
        try:
            from diagnostics.logging import log_info
            log_info("Startup complete")
            return "success", "Ready!"
        except Exception as e:
            return "success", "Ready"

    def _on_startup_complete(self):
        """Called when startup completes."""
        if self.on_ready:
            self.on_ready()
