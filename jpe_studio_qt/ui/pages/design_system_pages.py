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
from jpe_studio_qt.ui.screens import (
    DashboardScreen,
    DetailScreen,
    SettingsScreen,
    ExplorerScreen,
    WorkspaceScreen,
    BuildScreen,
    DiagnosticsScreen,
    ProjectDetailScreen,
    AboutScreen,
    DocsScreen,
    PluginsScreen,
    EntityViewScreen,
)


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
        raw_builds = list(self._current_project.build_history or [])[-4:][::-1]

        # Transform project build data to screen format
        formatted_builds = []
        for i, build_info in enumerate(raw_builds):
            build_id = build_info.get("id", str(i))
            status = build_info.get("status", "unknown").lower()

            # Format timestamp - handle various input formats
            timestamp = build_info.get("timestamp", "Recently")
            if isinstance(timestamp, str):
                # Already a string, use as-is
                pass
            else:
                # If it's a number or other type, convert to string
                timestamp = str(timestamp) if timestamp else "Recently"

            formatted_builds.append({
                "id": build_id,
                "title": f"Build #{build_id}",
                "status": status,
                "progress": build_info.get("progress", 0),
                "timestamp": timestamp,
            })

        # Update the dashboard screen with real data
        try:
            self.dashboard_screen.load_builds(formatted_builds)
        except Exception as e:
            # Fallback: keep sample data if real data fails
            import logging
            logging.warning(f"Failed to load builds: {e}")


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

        # Load the build data into the detail screen
        try:
            self.detail_screen.load_build(self._build_info)
        except Exception as e:
            # Fallback: keep sample data if update fails
            import logging
            logging.warning(f"Failed to update build display: {e}")


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

        Loads application settings into the SettingsScreen form for editing.
        """
        if not self._current_settings:
            return

        # Load settings into the settings screen
        try:
            self.settings_screen.load_settings(self._current_settings)
        except Exception as e:
            # Fallback: keep default values if settings loading fails
            import logging
            logging.warning(f"Failed to load settings: {e}")


class DesignSystemExplorerPage(QWidget):
    """
    Explorer/File Browser page wrapper for ExplorerScreen.

    Integrates the new design system explorer into the MainWindow page management system.
    Provides signals for navigation and project operations.
    Displays file tree and project structure with quick action buttons.

    Usage in MainWindow:
        page = DesignSystemExplorerPage()
        page.set_project(current_project)
        main_window.stack.addWidget(page)

    Signals:
        request_nav_index: Navigate to page by index
        build_requested: Build action triggered
        translate_requested: Translate action triggered
    """

    request_nav_index = Signal(int)
    build_requested = Signal()
    translate_requested = Signal()

    def __init__(self) -> None:
        super().__init__()

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Create the design system explorer screen
        self.explorer_screen = ExplorerScreen()
        layout.addWidget(self.explorer_screen)

        # Store reference to current project
        self._current_project: Optional[Project] = None

        # Connect screen signals to page signals
        self.explorer_screen.request_build.connect(self.build_requested.emit)
        self.explorer_screen.request_translate.connect(self.translate_requested.emit)
        self.explorer_screen.request_settings.connect(lambda: self.request_nav_index.emit(11))

    def set_project(self, project: Optional[Project]) -> None:
        """
        Load project data into the explorer.

        This method should be called by MainWindow whenever the current project changes.
        """
        self._current_project = project
        if project:
            self._load_project_files()

    def _load_project_files(self) -> None:
        """
        Load and display project files in the explorer.

        Retrieves the project file structure and updates the explorer display.
        """
        if not self._current_project:
            return

        # TODO: Load actual project file structure
        # For now, the explorer screen displays sample data
        try:
            self.explorer_screen.set_project(self._current_project)
        except Exception as e:
            # Fallback: keep sample data if loading fails
            import logging
            logging.warning(f"Failed to load project files: {e}")


class DesignSystemWorkspacePage(QWidget):
    """
    Workspace/Translation page wrapper for WorkspaceScreen.

    Integrates the new design system workspace into the MainWindow page management system.
    Provides a dual-pane editor for source and translation content with save functionality.

    Usage in MainWindow:
        page = DesignSystemWorkspacePage()
        page.set_project(current_project)
        page.set_file(file_path)
        main_window.stack.addWidget(page)

    Signals:
        request_nav_index: Navigate to page by index
        save_requested: Save translation changes
    """

    request_nav_index = Signal(int)
    save_requested = Signal()

    def __init__(self) -> None:
        super().__init__()

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Create the design system workspace screen
        self.workspace_screen = WorkspaceScreen()
        layout.addWidget(self.workspace_screen)

        # Store references to current project and file
        self._current_project: Optional[Project] = None
        self._current_file: str = ""

        # Connect screen signals to page signals
        self.workspace_screen.save_requested.connect(self.save_requested.emit)

    def set_project(self, project: Optional[Project]) -> None:
        """
        Set the current project for the workspace.

        This method should be called by MainWindow whenever the current project changes.
        """
        self._current_project = project
        if project:
            self.workspace_screen.set_project(project)

    def set_file_scope(self, file_path: str) -> None:
        """
        Load a specific file into the workspace editor.

        Args:
            file_path: The path to the file to load
        """
        self._current_file = file_path
        try:
            self.workspace_screen.set_file_scope(file_path)
            self._load_file_content()
        except Exception as e:
            # Fallback: keep current content if loading fails
            import logging
            logging.warning(f"Failed to load file: {e}")

    def _load_file_content(self) -> None:
        """
        Load the actual file content into the workspace editor.

        Retrieves file content from the project and updates the editor display.
        """
        if not self._current_project or not self._current_file:
            return

        # TODO: Load actual file content from project
        # For now, the workspace screen displays sample data
        try:
            # Placeholder for loading actual file content
            pass
        except Exception as e:
            # Fallback: keep sample data if loading fails
            import logging
            logging.warning(f"Failed to load file content: {e}")


class DesignSystemBuildPage(QWidget):
    """
    Build page wrapper for BuildScreen - Phase 10.

    Integrates the design system build history page into MainWindow.
    Manages build operations and displays build history.
    Loads real build history from project data.

    Signals:
        build_folder_requested: Build from folder action
        build_zip_requested: Build from ZIP action
        settings_requested: Settings action
    """

    build_folder_requested = Signal()
    build_zip_requested = Signal()
    settings_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        self.build_screen = BuildScreen()
        layout.addWidget(self.build_screen)

        self.build_screen.build_folder_requested.connect(self.build_folder_requested.emit)
        self.build_screen.build_zip_requested.connect(self.build_zip_requested.emit)
        self.build_screen.settings_requested.connect(self.settings_requested.emit)

        # Store reference to current project
        self._current_project: Optional[Project] = None

    def set_project(self, project: Optional[Project]) -> None:
        """
        Load project data into the build page.

        This method should be called by MainWindow whenever the current project changes.
        """
        self._current_project = project
        if project:
            self._load_build_history()

    def _load_build_history(self) -> None:
        """
        Load and display real build history from the project.

        Retrieves the latest builds from the project and updates the build screen display.
        """
        if not self._current_project or not self._current_project.build_history:
            return

        # Get all builds, most recent first
        raw_builds = list(self._current_project.build_history or [])

        # Transform project build data to screen format
        formatted_builds = []
        for build_info in raw_builds:
            build_id = build_info.get("id", "Unknown")
            status = build_info.get("status", "unknown").lower()
            duration = build_info.get("duration", "-")
            timestamp = build_info.get("timestamp", "Recently")

            # Handle timestamp format
            if isinstance(timestamp, str):
                pass  # Already a string
            else:
                timestamp = str(timestamp) if timestamp else "Recently"

            formatted_builds.append({
                "id": build_id,
                "title": f"Build #{build_id}",
                "status": status,
                "duration": duration,
                "timestamp": timestamp,
                "progress": build_info.get("progress", 0),
            })

        # Update the build screen with real data
        try:
            self.build_screen.load_builds(formatted_builds)
        except Exception as e:
            # Fallback: keep sample data if real data fails
            import logging
            logging.warning(f"Failed to load builds: {e}")


class DesignSystemDiagnosticsPage(QWidget):
    """
    Diagnostics page wrapper for DiagnosticsScreen - Phase 10.

    Integrates the design system diagnostics page into MainWindow.
    Manages issue tracking and quality control.
    Loads real diagnostic data from project.

    Signals:
        open_pane_requested, share_requested, clear_requested, fix_next_requested
    """

    open_pane_requested = Signal()
    share_requested = Signal()
    clear_requested = Signal()
    fix_next_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        self.diagnostics_screen = DiagnosticsScreen()
        layout.addWidget(self.diagnostics_screen)

        self.diagnostics_screen.open_pane_requested.connect(self.open_pane_requested.emit)
        self.diagnostics_screen.share_requested.connect(self.share_requested.emit)
        self.diagnostics_screen.clear_requested.connect(self.clear_requested.emit)
        self.diagnostics_screen.fix_next_requested.connect(self.fix_next_requested.emit)

        # Store reference to current project
        self._current_project: Optional[Project] = None

    def set_project(self, project: Optional[Project]) -> None:
        """
        Load project data into the diagnostics page.

        This method should be called by MainWindow whenever the current project changes.
        """
        self._current_project = project
        if project:
            self._load_diagnostics()

    def _load_diagnostics(self) -> None:
        """
        Load and display real diagnostics from the project.

        Retrieves the diagnostics from the project and updates the screen display.
        """
        if not self._current_project or not self._current_project.diagnostics:
            return

        # Transform project diagnostic data to screen format
        formatted_issues = []
        for diagnostic in self._current_project.diagnostics:
            severity = diagnostic.get("severity", "info").lower()
            code = diagnostic.get("code", diagnostic.get("type", "UNKNOWN"))
            message = diagnostic.get("message", "No description")
            file_path = diagnostic.get("file", "unknown")
            location = diagnostic.get("location", diagnostic.get("line", ""))

            formatted_issues.append({
                "severity": severity,
                "code": code,
                "message": message,
                "file": file_path,
                "location": location,
            })

        # Update the diagnostics screen with real data
        try:
            self.diagnostics_screen.load_issues(formatted_issues)
        except Exception as e:
            # Fallback: keep sample data if real data fails
            import logging
            logging.warning(f"Failed to load diagnostics: {e}")


class DesignSystemProjectDetailPage(QWidget):
    """
    Project detail page wrapper for ProjectDetailScreen - Phase 10.

    Integrates the design system project detail page into MainWindow.
    Displays comprehensive project information and metadata.

    Signals:
        edit_requested, share_requested, archive_requested
    """

    edit_requested = Signal()
    share_requested = Signal()
    archive_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        self.project_detail_screen = ProjectDetailScreen()
        layout.addWidget(self.project_detail_screen)

        self.project_detail_screen.edit_requested.connect(self.edit_requested.emit)
        self.project_detail_screen.share_requested.connect(self.share_requested.emit)
        self.project_detail_screen.archive_requested.connect(self.archive_requested.emit)


class DesignSystemAboutPage(QWidget):
    """
    About page wrapper for AboutScreen - Phase 10.

    Integrates the design system about page into MainWindow.
    Displays application information and links.
    """

    def __init__(self) -> None:
        super().__init__()
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        self.about_screen = AboutScreen()
        layout.addWidget(self.about_screen)


class DesignSystemDocsPage(QWidget):
    """
    Docs page wrapper for DocsScreen - Phase 10.

    Integrates the design system documentation page into MainWindow.
    Provides help, guides, and tutorials.
    """

    def __init__(self) -> None:
        super().__init__()
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        self.docs_screen = DocsScreen()
        layout.addWidget(self.docs_screen)


class DesignSystemPluginsPage(QWidget):
    """
    Plugins page wrapper for PluginsScreen - Phase 10.

    Integrates the design system plugins/marketplace page into MainWindow.
    Manages plugin browsing and installation.
    """

    def __init__(self) -> None:
        super().__init__()
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        self.plugins_screen = PluginsScreen()
        layout.addWidget(self.plugins_screen)


class DesignSystemEntityViewPage(QWidget):
    """
    Entity view page wrapper for EntityViewScreen - Phase 10.

    Integrates the design system entity browser into MainWindow.
    Manages entity browsing and editing.
    """

    def __init__(self) -> None:
        super().__init__()
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        self.entity_view_screen = EntityViewScreen()
        layout.addWidget(self.entity_view_screen)
