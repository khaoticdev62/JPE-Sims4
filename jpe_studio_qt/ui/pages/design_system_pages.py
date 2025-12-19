"""
Page wrapper classes for new design system screens.

These classes wrap the new design system screens (DashboardScreen, DetailScreen, SettingsScreen)
and integrate them into the MainWindow page management system by providing the necessary signals
and connections that MainWindow expects.
"""

from __future__ import annotations

from PySide6.QtCore import Signal
from PySide6.QtWidgets import QWidget, QVBoxLayout

from jpe_studio_qt.ui.screens import DashboardScreen, DetailScreen, SettingsScreen


class DesignSystemDashboardPage(QWidget):
    """
    Dashboard page wrapper for DashboardScreen.

    Integrates the new design system dashboard into the MainWindow page management system.
    Provides signals expected by MainWindow for navigation and project operations.

    Signals:
        request_nav_index: Navigate to page by index
        request_import: Request project import
        request_open_project_json: Open project from JSON path
        request_open_project_detail_json: Open project detail from JSON path
    """

    request_nav_index = Signal(int)
    request_import = Signal()
    request_open_project_json = Signal(str)
    request_open_project_detail_json = Signal(str)

    def __init__(self) -> None:
        super().__init__()

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Create the design system dashboard screen
        self.dashboard_screen = DashboardScreen()
        layout.addWidget(self.dashboard_screen)

        # Connect signals from the screen to our page signals
        # These connections allow the dashboard screen to trigger MainWindow navigation
        # TODO: Wire up specific interactions:
        # - Notifications button -> request_nav_index(11) for settings
        # - Settings button -> request_nav_index(11) for settings
        # - Build card clicks -> request_open_project_detail_json(path)
        # - New project button -> request_import()


class DesignSystemDetailPage(QWidget):
    """
    Detail/Build view page wrapper for DetailScreen.

    Integrates the new design system detail view into the MainWindow page management system.
    Provides signals for navigation and build operations.

    Signals:
        back_requested: Navigate back to previous page
    """

    back_requested = Signal()

    def __init__(self) -> None:
        super().__init__()

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Create the design system detail screen
        self.detail_screen = DetailScreen()
        layout.addWidget(self.detail_screen)

        # Connect back button signal
        self.detail_screen.back_requested.connect(self.back_requested.emit)


class DesignSystemSettingsPage(QWidget):
    """
    Settings page wrapper for SettingsScreen.

    Integrates the new design system settings into the MainWindow page management system.
    Provides signals for navigation and settings operations.

    Signals:
        request_back: Navigate back to previous page
        apply_settings: Apply settings changes (emitted with settings dict)
    """

    request_back = Signal()
    apply_settings = Signal(dict)

    def __init__(self) -> None:
        super().__init__()

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Create the design system settings screen
        self.settings_screen = SettingsScreen()
        layout.addWidget(self.settings_screen)

        # Connect signals from the screen to our page signals
        self.settings_screen.settings_changed.connect(
            lambda data: self.apply_settings.emit(data)
        )
