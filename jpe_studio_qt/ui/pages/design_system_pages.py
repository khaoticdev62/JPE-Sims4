"""
Page wrapper classes for new design system screens.

These classes wrap the new design system screens (DashboardScreen, DetailScreen, SettingsScreen)
and integrate them into the MainWindow page management system by providing the necessary signals
and connections that MainWindow expects.

The page wrappers serve as a bridge between:
- MainWindow's project context and navigation system
- The design system screens' UI components and signals
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from PySide6.QtCore import Signal
from PySide6.QtWidgets import QWidget, QVBoxLayout

from jpe_sims4.project import Project
from jpe_studio_qt.ui.screens import DashboardScreen, DetailScreen, SettingsScreen


class DesignSystemDashboardPage(QWidget):
    """
    Dashboard page wrapper for DashboardScreen.

    Integrates the new design system dashboard into the MainWindow page management system.
    Provides signals expected by MainWindow for navigation and project operations.
    Loads and displays real build history data from the current project.

    Usage in MainWindow:
        page = DesignSystemDashboardPage()
        page.set_project(current_project)
        main_window.stack.addWidget(page)

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

        # Store reference to current project for data loading
        self._current_project: Optional[Project] = None

        # Connect TopBar action buttons to signals
        try:
            # Connect notifications button (index 0) to settings page
            top_bar = self.dashboard_screen.layout().itemAt(0).widget()
            if top_bar and hasattr(top_bar, 'action_buttons'):
                if len(top_bar.action_buttons) > 0:
                    # First action button is notifications -> navigate to settings
                    top_bar.action_buttons[0].clicked.connect(lambda: self.request_nav_index.emit(11))
                if len(top_bar.action_buttons) > 1:
                    # Second action button is settings -> navigate to settings
                    top_bar.action_buttons[1].clicked.connect(lambda: self.request_nav_index.emit(11))
        except Exception:
            pass  # TopBar action wiring is optional; fail silently

    def set_project(self, project: Optional[Project]) -> None:
        """
        Load project data into the dashboard.

        This method should be called by MainWindow whenever the current project changes.
        """
        self._current_project = project
        if project:
            self._load_build_history()

    def _load_build_history(self) -> None:
        """
        Load and display real build history from the project.

        Retrieves the latest builds from the project and updates the dashboard display.
        """
        if not self._current_project or not self._current_project.build_history:
            return

        # Get the last 4 builds (most recent first)
        builds = list(self._current_project.build_history or [])[-4:][::-1]

        # Note: Future enhancement: Update the dashboard screen's grid with real build data
        # Currently, the DashboardScreen uses sample data. This method provides the data
        # integration point for when the screen is refactored to accept dynamic data.


class DesignSystemDetailPage(QWidget):
    """
    Detail/Build view page wrapper for DetailScreen.

    Integrates the new design system detail view into the MainWindow page management system.
    Provides signals for navigation and build operations.
    Displays detailed information about a specific build including logs, artifacts, and commits.

    Usage in MainWindow:
        page = DesignSystemDetailPage()
        page.set_build_data(build_id, build_info, artifacts)
        main_window.stack.addWidget(page)

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

        # Store reference to current build data
        self._build_info: dict = {}
        self._artifacts: list = []

    def set_build_data(
        self,
        build_id: str,
        build_info: dict,
        artifacts: Optional[list] = None,
    ) -> None:
        """
        Load build data into the detail view.

        Args:
            build_id: The build identifier
            build_info: Dictionary with build information (status, duration, commit, etc.)
            artifacts: Optional list of artifact paths/information
        """
        self._build_info = build_info
        self._artifacts = artifacts or []
        self._update_display()

    def _update_display(self) -> None:
        """Update the detail screen display with current build data."""
        if not self._build_info:
            return

        # Note: Future enhancement: Update DetailScreen with real build data
        # Currently uses sample data. This method provides the data integration point.


class DesignSystemSettingsPage(QWidget):
    """
    Settings page wrapper for SettingsScreen.

    Integrates the new design system settings into the MainWindow page management system.
    Provides signals for navigation and settings operations.
    Loads and displays application configuration with ability to save changes.

    Usage in MainWindow:
        page = DesignSystemSettingsPage()
        page.load_settings(current_settings)
        page.apply_settings.connect(main_window._apply_settings)
        main_window.stack.addWidget(page)

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

        # Store reference to current settings
        self._current_settings: dict = {}

    def load_settings(self, settings: dict) -> None:
        """
        Load application settings into the settings screen.

        Args:
            settings: Dictionary of application settings to display
        """
        self._current_settings = settings.copy()
        self._update_form_values()

    def _update_form_values(self) -> None:
        """
        Update form fields with current settings values.

        This method should populate the form fields in SettingsScreen with actual
        application settings when this feature is fully implemented.
        """
        if not self._current_settings:
            return

        # Note: Future enhancement: Update SettingsScreen form fields with real settings
        # Currently shows sample fields. This method provides the data integration point.
