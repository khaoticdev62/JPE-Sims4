"""Keyboard shortcuts management for JPE Studio.

Provides utilities for registering and handling keyboard shortcuts across the application.
Includes common shortcuts: Ctrl+Q (Quit), Ctrl+S (Save), Ctrl+Z (Undo), Ctrl+Y (Redo), etc.
"""

from __future__ import annotations

from typing import Callable, Optional

from PySide6.QtCore import Qt
from PySide6.QtGui import QKeySequence
from PySide6.QtWidgets import QApplication, QWidget


class KeyboardShortcuts:
    """Manages application-wide keyboard shortcuts.

    Features:
    - Global shortcut registration
    - Common shortcut presets (Ctrl+Q, Ctrl+S, etc.)
    - Per-widget shortcut scoping
    - Shortcut help/legend display

    Usage:
        shortcuts = KeyboardShortcuts(app)
        shortcuts.register(Qt.CTRL + Qt.Key_Q, self.on_quit)
        shortcuts.register(Qt.CTRL + Qt.Key_S, self.on_save)
    """

    # Common shortcuts
    QUIT = Qt.CTRL + Qt.Key_Q
    SAVE = Qt.CTRL + Qt.Key_S
    UNDO = Qt.CTRL + Qt.Key_Z
    REDO = Qt.CTRL + Qt.SHIFT + Qt.Key_Z
    SEARCH = Qt.CTRL + Qt.Key_F
    REFRESH = Qt.Key_F5
    NEXT_TAB = Qt.CTRL + Qt.Key_Tab
    PREV_TAB = Qt.CTRL + Qt.SHIFT + Qt.Key_Tab
    ESCAPE = Qt.Key_Escape
    DELETE = Qt.Key_Delete
    ENTER = Qt.Key_Return

    def __init__(self, app: QApplication) -> None:
        """Initialize keyboard shortcuts manager.

        Args:
            app: QApplication instance
        """
        self.app = app
        self.shortcuts: dict[int, list[Callable]] = {}
        self.shortcut_labels: dict[int, str] = {}

    def register(
        self,
        key_sequence: int,
        callback: Callable,
        label: str = "",
        widget: Optional[QWidget] = None,
    ) -> None:
        """Register a keyboard shortcut.

        Args:
            key_sequence: Qt key combination (e.g., Qt.CTRL + Qt.Key_Q)
            callback: Function to call when shortcut is triggered
            label: Human-readable label for shortcut (for help display)
            widget: Optional widget to scope shortcut to
        """
        if key_sequence not in self.shortcuts:
            self.shortcuts[key_sequence] = []
            self.shortcut_labels[key_sequence] = label or self._key_to_string(key_sequence)

        self.shortcuts[key_sequence].append(callback)

        # If widget-scoped, install event filter
        if widget:
            self._install_filter(widget, key_sequence)

    def _install_filter(self, widget: QWidget, key_sequence: int) -> None:
        """Install event filter on widget for shortcut handling."""
        from PySide6.QtCore import QObject, QEvent

        class ShortcutFilter(QObject):
            def __init__(self, parent, target_key, callbacks):
                super().__init__(parent)
                self.target_key = target_key
                self.callbacks = callbacks

            def eventFilter(self, obj, event):
                if event.type() == QEvent.KeyPress:
                    if event.key() == self.target_key:
                        for callback in self.callbacks:
                            callback()
                        return True
                return False

        filter_obj = ShortcutFilter(widget, key_sequence, self.shortcuts[key_sequence])
        widget.installEventFilter(filter_obj)

    def _key_to_string(self, key_sequence: int) -> str:
        """Convert Qt key sequence to readable string."""
        # Parse the key sequence
        modifiers = []
        key = key_sequence

        if key_sequence & Qt.CTRL:
            modifiers.append("Ctrl")
            key = key_sequence & ~Qt.CTRL

        if key_sequence & Qt.SHIFT:
            modifiers.append("Shift")
            key = key_sequence & ~Qt.SHIFT

        if key_sequence & Qt.ALT:
            modifiers.append("Alt")
            key = key_sequence & ~Qt.ALT

        # Map key codes to names
        key_names = {
            Qt.Key_Q: "Q",
            Qt.Key_S: "S",
            Qt.Key_Z: "Z",
            Qt.Key_Y: "Y",
            Qt.Key_F: "F",
            Qt.Key_F5: "F5",
            Qt.Key_Tab: "Tab",
            Qt.Key_Escape: "Esc",
            Qt.Key_Delete: "Delete",
            Qt.Key_Return: "Enter",
        }

        key_name = key_names.get(key, f"Key_{key}")
        return " + ".join(modifiers + [key_name])

    def get_help_text(self) -> str:
        """Get formatted help text for all shortcuts.

        Returns:
            Formatted string with all registered shortcuts
        """
        if not self.shortcuts:
            return "No keyboard shortcuts registered."

        lines = ["Keyboard Shortcuts:", ""]
        for key_seq in sorted(self.shortcuts.keys()):
            label = self.shortcut_labels.get(key_seq, self._key_to_string(key_seq))
            key_str = self._key_to_string(key_seq)
            lines.append(f"  {key_str:<20} {label}")

        return "\n".join(lines)


# Preset shortcut mappings
SHORTCUT_PRESETS = {
    "quit": (KeyboardShortcuts.QUIT, "Quit application"),
    "save": (KeyboardShortcuts.SAVE, "Save project"),
    "undo": (KeyboardShortcuts.UNDO, "Undo last action"),
    "redo": (KeyboardShortcuts.REDO, "Redo action"),
    "search": (KeyboardShortcuts.SEARCH, "Open search"),
    "refresh": (KeyboardShortcuts.REFRESH, "Refresh data"),
    "next_tab": (KeyboardShortcuts.NEXT_TAB, "Next tab"),
    "prev_tab": (KeyboardShortcuts.PREV_TAB, "Previous tab"),
    "escape": (KeyboardShortcuts.ESCAPE, "Close/Cancel"),
    "delete": (KeyboardShortcuts.DELETE, "Delete item"),
    "enter": (KeyboardShortcuts.ENTER, "Confirm"),
}
