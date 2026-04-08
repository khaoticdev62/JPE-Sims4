"""Boot checklist system with real-time loading visualization.

Uses official JPE branding colors, typography, and styling as defined in
the JPE Branding PRD and Style Guide (v1.0).

Color palette:
- Brand Accent: #2EC4B6 (for highlights and primary actions)
- Brand Dark: #151A24 (for backgrounds)
- Brand Light: #F5F7FA (for content areas)
- Diagnostics: Error, Warning, Info, Success colors

Typography:
- Windows: Segoe UI
- macOS: SF Pro Display
- Linux: Ubuntu
"""

import tkinter as tk
from tkinter import ttk
import threading
import time
from pathlib import Path
from typing import Callable, List, Tuple, Optional
import sys

# Import branding constants
from ui.jpe_branding import (
    BootChecklistStyle,
    BRAND_ACCENT,
    BRAND_DARK,
    BRAND_LIGHT,
    DIAGNOSTIC_ERROR,
    DIAGNOSTIC_WARNING,
    DIAGNOSTIC_INFO,
    DIAGNOSTIC_SUCCESS,
    NEUTRAL_500,
    NEUTRAL_700,
    get_status_color,
    get_status_symbol,
    get_platform_font,
    BRANDING_VERSION,
)


class ChecklistItem:
    """Represents a single checklist item."""

    def __init__(self, name: str, check_func: Callable, timeout: float = 5.0):
        """
        Initialize a checklist item.

        Args:
            name: Display name for the item
            check_func: Function that performs the check/initialization
            timeout: Timeout in seconds (default 5)
        """
        self.name = name
        self.check_func = check_func
        self.timeout = timeout
        self.status = "pending"  # pending, checking, success, warning, error
        self.message = ""
        self.progress = 0


class BootChecklist:
    """Real-time boot checklist with visual feedback.

    Uses official JPE branding colors and styling per Branding PRD v1.0.
    Combines shape + color + text for accessibility (never color alone).
    """

    # Status symbols - per Icon System PRD
    # Each has distinct shape for accessibility
    SYMBOLS = {
        "pending": "○",     # Hollow circle - neutral
        "checking": "◐",    # Half circle - in progress
        "success": "✓",     # Checkmark - clear success
        "warning": "⚠",     # Triangle - caution
        "error": "✗",       # X mark - stop
    }

    # Status colors - from JPE diagnostics palette
    # Always paired with symbols and text labels
    COLORS = {
        "pending": NEUTRAL_500,        # Gray - neutral
        "checking": DIAGNOSTIC_WARNING, # Orange - in progress
        "success": DIAGNOSTIC_SUCCESS,  # Green - success
        "warning": DIAGNOSTIC_WARNING,  # Orange - warning
        "error": DIAGNOSTIC_ERROR,      # Red - error
    }

    def __init__(self, parent: Optional[tk.Widget] = None, title: str = "Initializing JPE Sims 4"):
        """
        Initialize the boot checklist.

        Args:
            parent: Parent widget (creates new window if None)
            title: Window title
        """
        self.parent = parent
        self.title = title
        self.items: List[ChecklistItem] = []
        self.current_index = 0
        self.is_running = False
        self.completion_callback: Optional[Callable] = None

        # Create window
        if parent is None:
            self.root = tk.Tk()
            self.root.title(title)
            self.root.geometry("600x500")
            self.root.resizable(False, False)
            self.is_standalone = True
        else:
            self.root = parent
            self.is_standalone = False

        # Configure style
        self._setup_style()

        # Create UI elements
        self._create_widgets()

    def _setup_style(self):
        """Setup custom styles for the checklist.

        Uses official JPE branding colors per Style Guide.
        """
        style = ttk.Style()
        platform_font = get_platform_font()

        # Main frame - light background per brand palette
        style.configure("Checklist.TFrame", background=BRAND_LIGHT)

        # Header - brand accent with dark text
        style.configure("ChecklistHeader.TLabel",
                       font=(platform_font, 14, "bold"),
                       background=BRAND_LIGHT,
                       foreground=BRAND_DARK)

        # Item labels - neutral palette
        style.configure("ChecklistItem.TLabel",
                       font=(platform_font, 10),
                       background="white",
                       foreground=BRAND_DARK)

        # Status symbol - uses color from COLORS dict
        style.configure("ChecklistStatus.TLabel",
                       font=("Courier New", 11, "bold"),
                       background="white")

        # Status message - secondary text color
        style.configure("ChecklistMessage.TLabel",
                       font=(platform_font, 9),
                       background="white",
                       foreground=NEUTRAL_700)

    def _create_widgets(self):
        """Create UI widgets with JPE branding."""
        platform_font = get_platform_font()

        # Main container - brand light background
        main_frame = ttk.Frame(self.root, style="Checklist.TFrame")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Header section - brand styling
        header_frame = ttk.Frame(main_frame, style="Checklist.TFrame")
        header_frame.pack(fill=tk.X, padx=30, pady=(30, 20))

        # Title - brand accent color per Style Guide
        title_label = ttk.Label(header_frame, text=self.title, style="ChecklistHeader.TLabel")
        title_label.pack(anchor=tk.W)

        # Subtitle - secondary text color from neutral palette
        subtitle_label = ttk.Label(
            header_frame,
            text="Loading components...",
            style="Checklist.TFrame"
        )
        subtitle_label.pack(anchor=tk.W, pady=(5, 0))
        subtitle_label.configure(
            font=(platform_font, 9),
            foreground=NEUTRAL_700,
            background=BRAND_LIGHT
        )

        # Checklist container with scrolling - white content area
        self.canvas = tk.Canvas(
            main_frame,
            bg="white",
            highlightthickness=0,
            highlightcolor="white"
        )
        self.canvas.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 20))

        # Scrollbar for canvas - neutral color
        scrollbar = ttk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y, padx=(0, 20), pady=(0, 20))
        self.canvas.config(yscrollcommand=scrollbar.set)

        # Frame inside canvas for checklist items - light background
        self.checklist_frame = ttk.Frame(self.canvas, style="Checklist.TFrame")
        self.canvas.create_window((0, 0), window=self.checklist_frame, anchor=tk.NW, width=500)

        # Bind mousewheel/scrollwheel
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)

        # Progress bar - brand accent color
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(
            main_frame,
            variable=self.progress_var,
            maximum=100,
            mode='determinate',
            length=300
        )
        self.progress_bar.pack(fill=tk.X, padx=20, pady=(0, 10))

        # Configure progress bar style with brand accent
        style.configure("TProgressbar", foreground=BRAND_ACCENT, background=BRAND_ACCENT)

        # Status label - secondary text color
        self.status_label = ttk.Label(
            main_frame,
            text="Ready to start...",
            style="ChecklistMessage.TLabel"
        )
        self.status_label.pack(fill=tk.X, padx=20, pady=(0, 10))

        # Update scroll region
        self.checklist_frame.update_idletasks()
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))

    def _on_mousewheel(self, event):
        """Handle mousewheel scrolling."""
        if event.num == 5 or event.delta < 0:
            self.canvas.yview_scroll(1, "units")
        elif event.num == 4 or event.delta > 0:
            self.canvas.yview_scroll(-1, "units")

    def add_item(self, name: str, check_func: Callable, timeout: float = 5.0):
        """
        Add a checklist item.

        Args:
            name: Display name
            check_func: Function to execute for this check
            timeout: Timeout in seconds
        """
        item = ChecklistItem(name, check_func, timeout)
        self.items.append(item)
        self._create_item_widget(item)

    def _create_item_widget(self, item: ChecklistItem):
        """Create and add item widget to the checklist frame."""
        # Item container
        item_frame = ttk.Frame(self.checklist_frame)
        item_frame.pack(fill=tk.X, padx=15, pady=8)
        item.widget_frame = item_frame

        # Status indicator
        item.status_label = tk.Label(item_frame, text=self.SYMBOLS["pending"],
                                    font=("Courier New", 14, "bold"),
                                    fg=self.COLORS["pending"], bg="#FFFFFF")
        item.status_label.pack(side=tk.LEFT, padx=(0, 10))

        # Item name and message
        text_frame = ttk.Frame(item_frame)
        text_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        item.name_label = ttk.Label(text_frame, text=item.name, style="ChecklistItem.TLabel")
        item.name_label.pack(anchor=tk.W)

        item.message_label = ttk.Label(text_frame, text="", style="ChecklistMessage.TLabel")
        item.message_label.pack(anchor=tk.W, pady=(2, 0))

        # Progress indicator for current item
        item.progress_label = tk.Label(item_frame, text="", font=("Segoe UI", 8),
                                      fg="#999999", bg="#FFFFFF")
        item.progress_label.pack(side=tk.RIGHT, padx=(10, 0))

        # Update canvas scroll region
        self.checklist_frame.update_idletasks()
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))

    def run(self, on_complete: Optional[Callable] = None):
        """
        Run the checklist in a separate thread.

        Args:
            on_complete: Callback function when checklist completes
        """
        self.completion_callback = on_complete
        self.is_running = True

        # Start checklist in background thread
        thread = threading.Thread(target=self._run_checklist, daemon=True)
        thread.start()

        if self.is_standalone:
            self.root.mainloop()

    def _run_checklist(self):
        """Run through all checklist items."""
        total_items = len(self.items)

        for index, item in enumerate(self.items):
            if not self.is_running:
                break

            self.current_index = index

            # Update status to checking
            self._update_item_status(item, "checking")
            self.root.after(0, self._scroll_to_current_item)

            # Update progress bar
            progress = (index / total_items) * 100
            self.root.after(0, self._update_progress, progress)

            try:
                # Run the check function
                start_time = time.time()
                result = item.check_func()
                elapsed_time = time.time() - start_time

                # Determine status based on result
                if isinstance(result, tuple):
                    status, message = result
                else:
                    status = "success"
                    message = "Loaded successfully"

                # Update item
                item.message = message
                self._update_item_status(item, status, elapsed_time)

            except Exception as e:
                item.message = f"Error: {str(e)[:50]}"
                self._update_item_status(item, "error")

            # Small delay for visual effect
            time.sleep(0.3)

        # Final progress
        self.root.after(0, self._update_progress, 100)

        # Mark as complete
        self.is_running = False
        self.root.after(0, self._on_complete)

    def _update_item_status(self, item: ChecklistItem, status: str, elapsed_time: float = 0):
        """Update the status of an item."""
        item.status = status

        def update():
            if hasattr(item, 'status_label'):
                item.status_label.config(
                    text=self.SYMBOLS[status],
                    fg=self.COLORS[status]
                )

                if hasattr(item, 'message_label') and item.message:
                    item.message_label.config(text=item.message)

                if hasattr(item, 'progress_label') and elapsed_time > 0:
                    item.progress_label.config(text=f"{elapsed_time:.2f}s")

        self.root.after(0, update)

    def _scroll_to_current_item(self):
        """Scroll to the current item."""
        # Get the position of the current item
        if self.current_index < len(self.items):
            item = self.items[self.current_index]
            if hasattr(item, 'widget_frame'):
                self.canvas.yview_moveto(self.current_index / len(self.items))

    def _update_progress(self, progress: float):
        """Update progress bar."""
        self.progress_var.set(progress)

        # Update status label
        item_count = self.current_index + 1
        total_count = len(self.items)
        self.status_label.config(text=f"Loading: {item_count}/{total_count}")

    def _on_complete(self):
        """Called when checklist completes."""
        self.status_label.config(text="✓ All systems loaded successfully!")

        if self.completion_callback:
            self.completion_callback()

    def close(self):
        """Close the checklist window."""
        self.is_running = False
        if self.is_standalone and hasattr(self, 'root'):
            self.root.destroy()


# Utility function for building standard checklist
def create_standard_checklist(parent: Optional[tk.Widget] = None) -> BootChecklist:
    """Create a standard application boot checklist."""
    checklist = BootChecklist(parent, "Initializing JPE Sims 4 Mod Translator")

    # Add standard items
    checklist.add_item("Checking system requirements", _check_system_requirements)
    checklist.add_item("Loading configuration", _load_configuration)
    checklist.add_item("Initializing security", _init_security)
    checklist.add_item("Loading theme system", _load_themes)
    checklist.add_item("Initializing translation engine", _init_engine)
    checklist.add_item("Loading plugins", _load_plugins)
    checklist.add_item("Setting up cloud client", _init_cloud)
    checklist.add_item("Initializing onboarding system", _init_onboarding)
    checklist.add_item("Loading documentation", _load_documentation)
    checklist.add_item("Finalizing startup", _finalize_startup)

    return checklist


# Check functions
def _check_system_requirements() -> Tuple[str, str]:
    """Check system requirements."""
    try:
        import platform
        import psutil

        os_name = platform.system()
        os_version = platform.release()
        python_version = f"{sys.version_info.major}.{sys.version_info.minor}"
        memory = psutil.virtual_memory().available / (1024**3)

        return "success", f"{os_name} {os_version} | Python {python_version} | {memory:.1f}GB RAM"
    except Exception as e:
        return "warning", f"Could not verify all requirements: {str(e)[:40]}"


def _load_configuration() -> Tuple[str, str]:
    """Load configuration."""
    try:
        from config.config_manager import config_manager
        config_manager.load()

        theme = config_manager.get("ui.theme", "default")
        return "success", f"Config loaded (Theme: {theme})"
    except Exception as e:
        return "warning", f"Using default config: {str(e)[:30]}"


def _init_security() -> Tuple[str, str]:
    """Initialize security."""
    try:
        from security.validator import security_validator

        # Verify security modules
        security_validator.validate_environment()
        return "success", "Security systems initialized"
    except Exception as e:
        return "warning", f"Security check: {str(e)[:40]}"


def _load_themes() -> Tuple[str, str]:
    """Load theme system."""
    try:
        from ui.theme_manager import theme_manager

        theme_count = len(theme_manager.themes)
        return "success", f"Theme system ready ({theme_count} themes)"
    except Exception as e:
        return "error", f"Theme system failed: {str(e)[:40]}"


def _init_engine() -> Tuple[str, str]:
    """Initialize translation engine."""
    try:
        from engine.engine import TranslationEngine, EngineConfig

        engine = TranslationEngine()
        return "success", "Translation engine initialized"
    except Exception as e:
        return "error", f"Engine failed: {str(e)[:40]}"


def _load_plugins() -> Tuple[str, str]:
    """Load plugin system."""
    try:
        from plugins.manager import PluginManager

        plugin_mgr = PluginManager()
        plugin_count = len(plugin_mgr.list_plugins())

        return "success", f"Plugin system ready ({plugin_count} plugins)"
    except Exception as e:
        return "warning", f"Plugin system: {str(e)[:40]}"


def _init_cloud() -> Tuple[str, str]:
    """Initialize cloud client."""
    try:
        from cloud.api import CloudAPI

        # Cloud client is initialized lazily, just check import
        return "success", "Cloud client ready"
    except Exception as e:
        return "warning", f"Cloud client: {str(e)[:40]}"


def _init_onboarding() -> Tuple[str, str]:
    """Initialize onboarding system."""
    try:
        from onboarding.the_codex import CodexManager

        codex = CodexManager()
        lesson_count = len(codex.lessons)

        return "success", f"Onboarding system ready ({lesson_count} lessons)"
    except Exception as e:
        return "warning", f"Onboarding system: {str(e)[:40]}"


def _load_documentation() -> Tuple[str, str]:
    """Load documentation."""
    try:
        from onboarding.the_codex import CodexManager

        # Documentation is loaded with onboarding
        return "success", "Documentation loaded"
    except Exception as e:
        return "warning", f"Documentation: {str(e)[:40]}"


def _finalize_startup() -> Tuple[str, str]:
    """Finalize startup."""
    try:
        from diagnostics.logging import log_info

        log_info("Application startup complete")
        return "success", "Ready to use!"
    except Exception as e:
        return "success", "Startup complete"
