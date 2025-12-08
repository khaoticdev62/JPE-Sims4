"""Installer checklist system for setup wizard."""

import tkinter as tk
from tkinter import ttk
import threading
import time
from typing import Callable, List, Tuple, Optional


class InstallerChecklist:
    """Installation progress checklist with real-time feedback."""

    SYMBOLS = {
        "pending": "○",
        "checking": "◐",
        "success": "✓",
        "warning": "⚠",
        "error": "✗",
    }

    COLORS = {
        "pending": "#888888",
        "checking": "#FF9800",
        "success": "#4CAF50",
        "warning": "#FFC107",
        "error": "#F44336",
    }

    def __init__(self, parent: tk.Widget, title: str = "Installation Progress"):
        """
        Initialize the installer checklist.

        Args:
            parent: Parent widget
            title: Display title
        """
        self.parent = parent
        self.title = title
        self.items: List[dict] = []
        self.is_running = False

        # Create frame
        self.frame = ttk.Frame(parent)
        self._create_widgets()

    def _create_widgets(self):
        """Create UI elements."""
        # Header
        header_label = ttk.Label(self.frame, text=self.title,
                                font=("Segoe UI", 12, "bold"),
                                foreground="#333333")
        header_label.pack(anchor=tk.W, padx=10, pady=(10, 5))

        # Checklist container
        self.canvas = tk.Canvas(self.frame, bg="#FFFFFF", highlightthickness=0, height=250)
        self.canvas.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        # Scrollbar
        scrollbar = ttk.Scrollbar(self.frame, orient=tk.VERTICAL, command=self.canvas.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y, padx=(0, 10))
        self.canvas.config(yscrollcommand=scrollbar.set)

        # Items frame
        self.items_frame = ttk.Frame(self.canvas)
        self.canvas.create_window((0, 0), window=self.items_frame, anchor=tk.NW)

        # Progress bar
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(self.frame, variable=self.progress_var,
                                           maximum=100, mode='determinate')
        self.progress_bar.pack(fill=tk.X, padx=10, pady=5)

        # Status label
        self.status_label = ttk.Label(self.frame, text="Ready to install...",
                                     font=("Segoe UI", 9),
                                     foreground="#666666")
        self.status_label.pack(anchor=tk.W, padx=10, pady=(0, 10))

    def pack(self, **kwargs):
        """Pack the frame."""
        self.frame.pack(**kwargs)

    def grid(self, **kwargs):
        """Grid the frame."""
        self.frame.grid(**kwargs)

    def add_item(self, name: str, check_func: Optional[Callable] = None,
                timeout: float = 5.0):
        """
        Add an installation step.

        Args:
            name: Step name
            check_func: Optional check function
            timeout: Timeout in seconds
        """
        item = {
            "name": name,
            "func": check_func,
            "timeout": timeout,
            "status": "pending",
            "message": "",
            "elapsed": 0
        }
        self.items.append(item)
        self._create_item_widget(item)

    def _create_item_widget(self, item: dict):
        """Create widget for an item."""
        item_frame = ttk.Frame(self.items_frame)
        item_frame.pack(fill=tk.X, padx=10, pady=5)
        item["widget_frame"] = item_frame

        # Status indicator
        item["status_label"] = tk.Label(item_frame, text=self.SYMBOLS["pending"],
                                       font=("Courier New", 12, "bold"),
                                       fg=self.COLORS["pending"], bg="#FFFFFF")
        item["status_label"].pack(side=tk.LEFT, padx=(5, 10))

        # Text
        text_frame = ttk.Frame(item_frame)
        text_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        item["name_label"] = ttk.Label(text_frame, text=item["name"],
                                      font=("Segoe UI", 10))
        item["name_label"].pack(anchor=tk.W)

        item["message_label"] = ttk.Label(text_frame, text="",
                                         font=("Segoe UI", 8),
                                         foreground="#999999")
        item["message_label"].pack(anchor=tk.W)

        # Progress indicator
        item["time_label"] = tk.Label(item_frame, text="",
                                     font=("Segoe UI", 8),
                                     fg="#999999", bg="#FFFFFF")
        item["time_label"].pack(side=tk.RIGHT, padx=5)

        # Update canvas
        self.items_frame.update_idletasks()
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))

    def run(self, on_complete: Optional[Callable] = None):
        """
        Run installation steps.

        Args:
            on_complete: Callback when complete
        """
        self.is_running = True
        self.completion_callback = on_complete

        thread = threading.Thread(target=self._run_installation, daemon=True)
        thread.start()

    def _run_installation(self):
        """Run all installation steps."""
        total = len(self.items)

        for index, item in enumerate(self.items):
            if not self.is_running:
                break

            # Update status
            item["status"] = "checking"
            self.parent.after(0, self._update_item_display, item)

            try:
                start_time = time.time()

                # Run check function if provided
                if item["func"]:
                    result = item["func"]()
                    if isinstance(result, tuple):
                        status, message = result
                    else:
                        status = "success"
                        message = ""
                else:
                    status = "success"
                    message = ""

                elapsed = time.time() - start_time

                item["status"] = status
                item["message"] = message
                item["elapsed"] = elapsed

            except Exception as e:
                item["status"] = "error"
                item["message"] = str(e)[:50]

            # Update display
            self.parent.after(0, self._update_item_display, item)

            # Update progress
            progress = ((index + 1) / total) * 100
            self.parent.after(0, self._update_progress, progress, index + 1, total)

            time.sleep(0.2)

        self.is_running = False
        self.parent.after(0, self._on_complete)

    def _update_item_display(self, item: dict):
        """Update item display."""
        if "status_label" in item:
            status = item["status"]
            item["status_label"].config(
                text=self.SYMBOLS[status],
                fg=self.COLORS[status]
            )

            if "message_label" in item and item["message"]:
                item["message_label"].config(text=item["message"])

            if "time_label" in item and item["elapsed"] > 0:
                item["time_label"].config(text=f"{item['elapsed']:.2f}s")

    def _update_progress(self, progress: float, current: int, total: int):
        """Update progress bar."""
        self.progress_var.set(progress)
        self.status_label.config(text=f"Installing: {current}/{total} components")

    def _on_complete(self):
        """Called when installation completes."""
        self.status_label.config(text="✓ Installation complete!")

        if self.completion_callback:
            self.completion_callback()

    def set_enable_state(self, enabled: bool):
        """Enable or disable the checklist."""
        state = tk.NORMAL if enabled else tk.DISABLED
        for item in self.items:
            if "status_label" in item:
                item["status_label"].config(state=state)
