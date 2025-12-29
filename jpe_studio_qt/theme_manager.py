"""Theme management system for dark/light mode support.

Handles switching between themes, applying stylesheets, and managing color palettes.
Integrates with SettingsManager for persistence.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Callable, Optional

from PySide6.QtWidgets import QApplication

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ThemeColors:
    """Color palette for a theme.

    Attributes:
        background: Main background color
        surface: Card/surface color
        text_primary: Primary text color
        text_secondary: Secondary text color
        accent: Accent color (highlights, buttons)
        error: Error/danger color
        success: Success color
        warning: Warning color
        info: Info color
    """

    background: str
    surface: str
    text_primary: str
    text_secondary: str
    accent: str
    error: str
    success: str
    warning: str
    info: str


# Dark theme (current JPE design)
DARK_THEME = ThemeColors(
    background="#110B1B",
    surface="#251A3A",
    text_primary="#F5F5F8",
    text_secondary="#94A3B8",
    accent="#9D5CFF",
    error="#EF4444",
    success="#22C55E",
    warning="#E5940C",
    info="#60A5FA",
)

# Light theme
LIGHT_THEME = ThemeColors(
    background="#FFFFFF",
    surface="#F8F9FA",
    text_primary="#1F2937",
    text_secondary="#6B7280",
    accent="#7C3AED",
    error="#DC2626",
    success="#16A34A",
    warning="#D97706",
    info="#2563EB",
)


class ThemeManager:
    """Manages application themes and styling.

    Features:
    - Switch between themes (dark/light)
    - Apply theme to entire application
    - Theme change callbacks
    - Dynamic color updates
    - Integration with SettingsManager

    Usage:
        theme = ThemeManager()
        theme.set_theme("light")

        # Watch for theme changes
        theme.on_theme_change(lambda t: print(f"Theme changed to {t}"))
    """

    def __init__(self, app: QApplication, settings_manager=None) -> None:
        """Initialize theme manager.

        Args:
            app: QApplication instance
            settings_manager: Optional SettingsManager for persistence
        """
        self.app = app
        self.settings = settings_manager
        self.current_theme = "dark"
        self.themes: dict[str, ThemeColors] = {
            "dark": DARK_THEME,
            "light": LIGHT_THEME,
        }
        self.change_callbacks: list[Callable[[str], None]] = []

        # Load saved theme
        if self.settings:
            self.current_theme = self.settings.get("ui.theme", "dark")
        else:
            self.current_theme = "dark"

        self.apply_theme(self.current_theme)

    def set_theme(self, theme_name: str) -> bool:
        """Switch to a different theme.

        Args:
            theme_name: Name of theme ("dark" or "light")

        Returns:
            True if successful, False if theme not found
        """
        if theme_name not in self.themes:
            logger.warning(f"Unknown theme: {theme_name}")
            return False

        self.current_theme = theme_name

        # Save to settings if available
        if self.settings:
            self.settings.set("ui.theme", theme_name)

        self.apply_theme(theme_name)
        self._notify_change(theme_name)

        logger.info(f"Theme changed to: {theme_name}")
        return True

    def apply_theme(self, theme_name: str) -> None:
        """Apply theme stylesheet to application.

        Args:
            theme_name: Name of theme to apply
        """
        if theme_name not in self.themes:
            logger.warning(f"Cannot apply unknown theme: {theme_name}")
            return

        theme = self.themes[theme_name]
        stylesheet = self._generate_stylesheet(theme)

        self.app.setStyle("Fusion")
        self.app.setStyleSheet(stylesheet)

        logger.debug(f"Theme stylesheet applied: {theme_name}")

    def register_theme(self, name: str, colors: ThemeColors) -> None:
        """Register a custom theme.

        Args:
            name: Theme identifier
            colors: ThemeColors instance
        """
        self.themes[name] = colors
        logger.info(f"Custom theme registered: {name}")

    def get_current_theme(self) -> str:
        """Get current theme name."""
        return self.current_theme

    def get_colors(self, theme_name: str = None) -> ThemeColors:
        """Get colors for a theme.

        Args:
            theme_name: Theme name (default: current theme)

        Returns:
            ThemeColors instance
        """
        if theme_name is None:
            theme_name = self.current_theme

        return self.themes.get(theme_name, DARK_THEME)

    def on_theme_change(self, callback: Callable[[str], None]) -> None:
        """Register callback for theme changes.

        Args:
            callback: Function called with theme name when changed
        """
        self.change_callbacks.append(callback)

    def _notify_change(self, theme_name: str) -> None:
        """Notify callbacks of theme change."""
        for callback in self.change_callbacks:
            try:
                callback(theme_name)
            except Exception as e:
                logger.warning(f"Theme change callback error: {e}")

    def _generate_stylesheet(self, theme: ThemeColors) -> str:
        """Generate QSS stylesheet for a theme.

        Args:
            theme: ThemeColors instance

        Returns:
            Complete QSS stylesheet string
        """
        return f"""
            /* Main Window */
            QMainWindow, QWidget {{
                background-color: {theme.background};
                color: {theme.text_primary};
            }}

            /* Panels and Frames */
            QFrame, QPanel {{
                background-color: {theme.surface};
                color: {theme.text_primary};
            }}

            /* Text Elements */
            QLabel {{
                color: {theme.text_primary};
            }}

            /* Input Fields */
            QLineEdit, QTextEdit, QPlainTextEdit {{
                background-color: {theme.background};
                color: {theme.text_primary};
                border: 1px solid {theme.text_secondary}30;
                border-radius: 4px;
                padding: 6px;
            }}

            QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus {{
                border: 1px solid {theme.accent};
                outline: none;
            }}

            /* Buttons */
            QPushButton {{
                background-color: {theme.accent};
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                font-weight: bold;
            }}

            QPushButton:hover {{
                opacity: 0.9;
            }}

            QPushButton:pressed {{
                opacity: 0.8;
            }}

            /* Checkboxes and Radio Buttons */
            QCheckBox, QRadioButton {{
                color: {theme.text_primary};
                spacing: 8px;
            }}

            QCheckBox::indicator, QRadioButton::indicator {{
                width: 18px;
                height: 18px;
                border: 2px solid {theme.text_secondary};
                border-radius: 3px;
                background-color: {theme.surface};
            }}

            QCheckBox::indicator:checked, QRadioButton::indicator:checked {{
                background-color: {theme.accent};
                border-color: {theme.accent};
            }}

            /* ComboBox */
            QComboBox {{
                background-color: {theme.background};
                color: {theme.text_primary};
                border: 1px solid {theme.text_secondary}30;
                border-radius: 4px;
                padding: 6px;
            }}

            QComboBox::drop-down {{
                border: none;
                width: 20px;
            }}

            QComboBox QAbstractItemView {{
                background-color: {theme.surface};
                color: {theme.text_primary};
                selection-background-color: {theme.accent};
            }}

            /* Scrollbars */
            QScrollBar:vertical {{
                background-color: {theme.background};
                width: 12px;
                border: none;
            }}

            QScrollBar::handle:vertical {{
                background-color: {theme.text_secondary}60;
                border-radius: 6px;
                min-height: 20px;
            }}

            QScrollBar::handle:vertical:hover {{
                background-color: {theme.text_secondary}80;
            }}

            QScrollBar:horizontal {{
                background-color: {theme.background};
                height: 12px;
                border: none;
            }}

            QScrollBar::handle:horizontal {{
                background-color: {theme.text_secondary}60;
                border-radius: 6px;
                min-width: 20px;
            }}

            QScrollBar::handle:horizontal:hover {{
                background-color: {theme.text_secondary}80;
            }}

            /* Tabs */
            QTabWidget::pane {{
                border: 1px solid {theme.text_secondary}30;
            }}

            QTabBar::tab {{
                background-color: {theme.surface};
                color: {theme.text_secondary};
                padding: 8px 16px;
                border: none;
                border-bottom: 2px solid transparent;
            }}

            QTabBar::tab:selected {{
                color: {theme.accent};
                border-bottom-color: {theme.accent};
            }}

            /* Lists and Trees */
            QListWidget, QTreeWidget {{
                background-color: {theme.background};
                color: {theme.text_primary};
                border: 1px solid {theme.text_secondary}30;
                gridline-color: {theme.text_secondary}30;
            }}

            QListWidget::item:selected, QTreeWidget::item:selected {{
                background-color: {theme.accent};
                color: white;
            }}

            QListWidget::item:hover, QTreeWidget::item:hover {{
                background-color: {theme.accent}30;
            }}

            /* Dialogs and Menus */
            QDialog, QMenu {{
                background-color: {theme.surface};
                color: {theme.text_primary};
            }}

            QMenu::item:selected {{
                background-color: {theme.accent};
                color: white;
            }}

            /* Headers */
            QHeaderView::section {{
                background-color: {theme.surface};
                color: {theme.text_secondary};
                padding: 6px;
                border: 1px solid {theme.text_secondary}30;
            }}
        """

    def toggle_theme(self) -> str:
        """Toggle between dark and light theme.

        Returns:
            New theme name
        """
        new_theme = "light" if self.current_theme == "dark" else "dark"
        self.set_theme(new_theme)
        return new_theme
