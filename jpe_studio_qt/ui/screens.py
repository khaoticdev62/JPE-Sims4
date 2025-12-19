"""
Complete screen mockups using atomic, molecular, and organism components.

This module provides complete screen implementations (14 screens total):

Core Workflow Screens:
1. DashboardScreen - Main screen with search, filters, and project cards
2. DetailScreen - Detail view with inspector and tabbed content
3. ExplorerScreen - Project file browser with tree view
4. WorkspaceScreen - Dual-pane translation/edit workspace

Phase 10 Screens:
5. BuildScreen - Build history with filters and statistics
6. DiagnosticsScreen - Issues/QA with severity filtering and search
7. ProjectDetailScreen - Project metadata and information
8. AboutScreen - Application information and links
9. DocsScreen - Documentation and help system
10. PluginsScreen - Plugin marketplace browser
11. EntityViewScreen - Entity tree and details editor

Settings & Demo:
12. SettingsScreen - Settings form with sections and fields
13. ComponentShowcase - Component gallery and documentation
14. H3 - Helper function for H3-styled labels
"""

from __future__ import annotations

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QScrollArea,
    QFrame,
    QGridLayout,
    QLabel,
    QSplitter,
    QTextEdit,
    QSizePolicy,
    QSpacerItem,
    QTreeWidget,
    QTreeWidgetItem,
)

from jpe_studio_qt.design_tokens import DESIGN, COLORS, SPACING, RADIUS, SHADOWS
from jpe_studio_qt.ui.components import (
    H1,
    H2,
    Muted,
    MaterialIcon,
    CardFrame,
    SearchBar,
    FilterChipsRow,
    TopBar,
    ListCard,
    BuildHistoryItem,
    InspectorHeader,
    PropertiesTable,
    TabPanel,
    Callout,
    StatsCard,
    FormSection,
    Button,
    Input,
    DiagnosticsRow,
    BadgeLabel,
    ProgressBar,
)


class DashboardScreen(QWidget):
    """
    Dashboard/Home screen: TopBar + SearchBar + FilterChips + BuildHistory grid.
    Main entry point showing recent projects and builds.

    Features:
    - Dynamic build history grid that updates with real data
    - Search and filter functionality
    - Click signals for navigation to build details
    - Empty state when no builds available

    Usage:
        dashboard = DashboardScreen()
        builds = [
            {"id": "142", "status": "success", "progress": 100, "timestamp": "2 hours ago"},
            ...
        ]
        dashboard.load_builds(builds)
    """

    from PySide6.QtCore import Signal
    build_selected = Signal(str)  # Emits build ID

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")

        # Store references for dynamic updates
        self._build_cards = {}
        self._current_builds = []

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Dashboard", has_back=False, actions=["notifications", "settings"])
        layout.addWidget(top_bar)

        # Content area (scrollable)
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        scroll.setStyleSheet("border: none;")

        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        content_layout.setSpacing(SPACING.lg)

        # Search bar
        self.search = SearchBar(placeholder="Search builds, projects...")
        content_layout.addWidget(self.search)

        # Filter chips
        self.filters = FilterChipsRow(["All", "Success", "Failed", "Running"], active_chip="All")
        self.filters.chip_clicked.connect(self._on_filter_changed)
        content_layout.addWidget(self.filters)

        # Build cards grid (2 columns) - stored for dynamic updates
        self.grid_container = QWidget()
        self.grid = QGridLayout(self.grid_container)
        self.grid.setSpacing(SPACING.md)
        self.grid.setContentsMargins(0, 0, 0, 0)

        content_layout.addWidget(self.grid_container)
        content_layout.addStretch(1)

        scroll.setWidget(content)
        layout.addWidget(scroll, 1)

        # Load sample data initially
        self._load_sample_builds()

    def _load_sample_builds(self) -> None:
        """Load sample build data for demonstration."""
        sample_builds = [
            {"id": "142", "title": "Build #142", "status": "success", "progress": 100, "timestamp": "2 hours ago"},
            {"id": "141", "title": "Build #141", "status": "running", "progress": 67, "timestamp": "5 minutes ago"},
            {"id": "140", "title": "Build #140", "status": "error", "progress": 0, "timestamp": "1 day ago"},
            {"id": "139", "title": "Build #139", "status": "success", "progress": 100, "timestamp": "2 days ago"},
        ]
        self.load_builds(sample_builds)

    def load_builds(self, builds: list) -> None:
        """
        Load and display a list of builds in the grid.

        Args:
            builds: List of build dictionaries with keys:
                - id: Build identifier (required)
                - title: Display title (required)
                - status: "success", "running", "error" (required)
                - progress: Integer 0-100 (optional, default 0)
                - timestamp: Time string (optional, default "Recently")
        """
        self._current_builds = builds
        self._refresh_grid()

    def _refresh_grid(self) -> None:
        """Clear and rebuild the grid with current builds."""
        # Clear existing widgets
        while self.grid.count():
            widget = self.grid.takeAt(0).widget()
            if widget:
                widget.deleteLater()

        self._build_cards = {}

        # Add build cards
        for i, build in enumerate(self._current_builds):
            # Parse build data with defaults
            build_id = build.get("id", str(i))
            title = build.get("title", f"Build #{i}")
            status = build.get("status", "unknown").lower()
            progress = build.get("progress", 0)
            timestamp = build.get("timestamp", "Recently")

            # Map status to variant
            status_variant = {
                "success": "success",
                "running": "primary",
                "error": "error",
                "failed": "error",
            }.get(status, "info")

            # Create card
            card = BuildHistoryItem(
                title=title,
                status=status.title(),
                status_variant=status_variant,
                progress=progress,
                timestamp=timestamp,
            )

            # Connect click signal
            card.clicked.connect(lambda checked=False, bid=build_id: self.build_selected.emit(bid))

            # Add to grid (2 columns layout)
            row, col = divmod(i, 2)
            self.grid.addWidget(card, row, col)
            self._build_cards[build_id] = card

        # Add stretch to fill remaining space
        remaining_rows = (len(self._current_builds) + 1) // 2
        if remaining_rows > 0:
            self.grid.addItem(QSpacerItem(0, 0, QSizePolicy.Minimum, QSizePolicy.Expanding), remaining_rows, 0, 1, 2)

    def _on_filter_changed(self, filter_name: str) -> None:
        """Handle filter chip selection."""
        if filter_name.lower() == "all":
            # Show all builds
            self._refresh_grid()
        else:
            # Filter builds by status
            filtered_builds = [
                b for b in self._current_builds
                if b.get("status", "").lower() == filter_name.lower()
            ]
            self._refresh_grid_with(filtered_builds)

    def _refresh_grid_with(self, builds: list) -> None:
        """Refresh grid with a filtered list of builds."""
        # Temporarily override current builds
        original = self._current_builds
        self._current_builds = builds
        self._refresh_grid()
        # Note: current_builds stays filtered; call load_builds() to restore


class DetailScreen(QWidget):
    """
    Detail view screen: TopBar (with back) + Splitter (inspector | tabs).
    Shows detailed information about a build with diagnostics, artifacts, and commits.

    Features:
    - Dynamic build information loading
    - Tabbed interface for different data types
    - Real-time property updates
    - Inspector header with badges and actions

    Usage:
        detail = DetailScreen()
        build_data = {
            "id": "142",
            "title": "Build #142",
            "status": "success",
            "duration": "2m 34s",
            "diagnostics": "Build log output...",
            "artifacts": ["mod.zip", "config.xml"],
            "commits": ["a3f2c1d", "8e1b2c4"],
            ...
        }
        detail.load_build(build_data)
    """

    back_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")

        # Store references for dynamic updates
        self._build_data = {}
        self._current_title = "Build Details"

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar with back button
        self.top_bar = TopBar("Build Details", has_back=True, actions=["share", "delete"])
        self.top_bar.back_clicked.connect(self.back_requested.emit)
        layout.addWidget(self.top_bar)

        # Splitter: Left (inspector) | Right (tabs)
        splitter = QSplitter(Qt.Horizontal)

        # ===== LEFT PANEL =====
        self.left_panel = QWidget()
        self.left_layout = QVBoxLayout(self.left_panel)
        self.left_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.md, SPACING.xl)
        self.left_layout.setSpacing(SPACING.lg)

        # Store references for dynamic updates
        self.inspector = None
        self.warning_callout = None
        self.props_table = None

        # Initialize with sample data
        self._load_sample_build()

        self.left_layout.addStretch(1)

        # ===== RIGHT PANEL =====
        self.right_panel = QWidget()
        self.right_layout = QVBoxLayout(self.right_panel)
        self.right_layout.setContentsMargins(SPACING.lg, SPACING.lg, SPACING.xl, SPACING.xl)
        self.right_layout.setSpacing(SPACING.lg)

        # Create text edit widgets for tabs
        self.diagnostics_widget = self._create_text_widget("")
        self.artifacts_widget = self._create_text_widget("")
        self.commits_widget = self._create_text_widget("")

        # Store references to tab panel for updates
        self.tabs = TabPanel(
            tabs=[
                ("Diagnostics", self.diagnostics_widget),
                ("Artifacts", self.artifacts_widget),
                ("Commits", self.commits_widget),
            ]
        )
        self.right_layout.addWidget(self.tabs, 1)

        # Add panels to splitter
        splitter.addWidget(self.left_panel)
        splitter.addWidget(self.right_panel)
        splitter.setSizes([400, 600])
        splitter.setStyleSheet(f"background: {COLORS.bg_0};")

        layout.addWidget(splitter, 1)

    def _create_text_widget(self, text: str) -> QTextEdit:
        """Create a styled text edit widget."""
        widget = QTextEdit()
        widget.setPlainText(text)
        widget.setStyleSheet(f"""
            background: {COLORS.bg_1};
            color: {COLORS.text_primary};
            border: 1px solid {COLORS.stroke_0};
            border-radius: {RADIUS.md}px;
            padding: {SPACING.md}px;
            font-family: 'JetBrains Mono';
            font-size: 10pt;
        """)
        return widget

    def _load_sample_build(self) -> None:
        """Load sample build data for demonstration."""
        sample_data = {
            "id": "142",
            "title": "Build #142",
            "status": "success",
            "entity_name": "com.jpe.sims4.mod",
            "badges": [("v1.2.0", "primary"), ("DEPLOYED", "success")],
            "duration": "2m 34s",
            "artifacts": "4 files",
            "commit": "a3f2c1d",
            "branch": "main",
            "diagnostics": "Build log output...\n[✓] Dependencies resolved\n[✓] Build succeeded\n",
            "artifact_files": ["mod.zip (14.2 MB)", "mod_config.xml", "README.txt", "LICENSE"],
            "commits": ["a3f2c1d - Fix deprecated tags", "8e1b2c4 - Add new features", "c5d3e2f - Initial commit"],
        }
        self.load_build(sample_data)

    def load_build(self, build_data: dict) -> None:
        """
        Load and display build data.

        Args:
            build_data: Dictionary with keys:
                - id: Build identifier
                - title: Display title
                - entity_name: Entity/package name
                - badges: List of (text, variant) tuples
                - diagnostics: Build log output text
                - artifact_files: List of artifact names
                - commits: List of commit messages
                - Plus standard build properties
        """
        self._build_data = build_data

        # Update TopBar title
        title = build_data.get("title", "Build Details")
        self.top_bar.setWindowTitle(title)
        self.top_bar.title.setText(title)

        # Clear left panel
        while self.left_layout.count():
            widget = self.left_layout.takeAt(0).widget()
            if widget:
                widget.deleteLater()

        # Update inspector header
        entity_name = build_data.get("entity_name", "Unknown")
        badges = build_data.get("badges", [])
        self.inspector = InspectorHeader(entity_name, badges=badges, actions=["edit", "delete"])
        self.left_layout.addWidget(self.inspector)

        # Add warning callout if needed
        status = build_data.get("status", "").lower()
        if status == "error" or status == "failed":
            self.warning_callout = Callout(
                "Build Failed",
                message="This build encountered errors during compilation.",
                variant="error",
            )
            self.left_layout.addWidget(self.warning_callout)

        # Update properties table
        props_dict = {
            "Build ID": build_data.get("id", "Unknown"),
            "Duration": build_data.get("duration", "N/A"),
            "Artifacts": build_data.get("artifacts", "0 files"),
            "Commit": build_data.get("commit", "N/A"),
            "Branch": build_data.get("branch", "N/A"),
            "Status": build_data.get("status", "Unknown").title(),
        }
        self.props_table = PropertiesTable(props_dict)
        self.left_layout.addWidget(self.props_table)
        self.left_layout.addStretch(1)

        # Update right panel tabs
        diagnostics_text = build_data.get("diagnostics", "No diagnostics available")
        self.diagnostics_widget.setPlainText(diagnostics_text)

        artifacts_list = build_data.get("artifact_files", [])
        artifacts_text = "\n".join(artifacts_list) if artifacts_list else "No artifacts"
        self.artifacts_widget.setPlainText(artifacts_text)

        commits_list = build_data.get("commits", [])
        commits_text = "\n".join(commits_list) if commits_list else "No commits"
        self.commits_widget.setPlainText(commits_text)


class SettingsScreen(QWidget):
    """
    Settings screen: TopBar + scrollable content with sections and form fields.
    Allows configuration of application settings.

    Features:
    - Dynamic settings form with sections
    - Real-time settings updates
    - Save/Cancel actions
    - Settings persistence via signals

    Usage:
        settings = SettingsScreen()
        app_settings = {
            "project_name": "My Mod",
            "author": "Developer",
            "version": "1.0.0",
            "output_dir": "/path/to/output",
            "build_target": "Release",
        }
        settings.load_settings(app_settings)
    """

    settings_changed = Signal(dict)

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")

        # Store references for dynamic updates
        self._settings = {}
        self._form_fields = {}

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Settings", has_back=False, actions=["help"])
        layout.addWidget(top_bar)

        # Content area (scrollable)
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        scroll.setStyleSheet("border: none;")

        content = QWidget()
        self.content_layout = QVBoxLayout(content)
        self.content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        self.content_layout.setSpacing(SPACING.xxl)

        # Create form sections
        self._create_form_sections()

        self.content_layout.addStretch(1)

        # ===== BOTTOM ACTION BAR =====
        actions_frame = QFrame()
        actions_frame.setStyleSheet(f"background: {COLORS.surface_0}; border-top: 1px solid {COLORS.stroke_0};")
        actions_layout = QHBoxLayout(actions_frame)
        actions_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.lg)
        actions_layout.setSpacing(SPACING.sm)

        actions_layout.addStretch(1)

        cancel_btn = Button("Cancel", variant="ghost")
        cancel_btn.clicked.connect(lambda: print("Cancel clicked"))
        actions_layout.addWidget(cancel_btn)

        self.save_btn = Button("Save Changes", variant="primary")
        self.save_btn.clicked.connect(lambda: self._on_settings_save())
        actions_layout.addWidget(self.save_btn)

        scroll.setWidget(content)
        layout.addWidget(scroll, 1)
        layout.addWidget(actions_frame)

    def _create_form_sections(self) -> None:
        """Create the default form sections."""
        # ===== SECTION 1: GENERAL =====
        general_fields = [
            ("Project Name", Input("My Sims 4 Mod", has_clear_button=False)),
            ("Author", Input("John Doe", has_clear_button=False)),
            ("Version", Input("1.0.0", has_clear_button=False)),
        ]
        self.section_general = FormSection("General", fields=general_fields)
        self.content_layout.addWidget(self.section_general)

        # Store field references
        for label, widget in general_fields:
            self._form_fields[label.lower().replace(" ", "_")] = widget

        # ===== SECTION 2: BUILD =====
        build_fields = [
            ("Output Directory", Input("/path/to/output", has_clear_button=False)),
            ("Build Target", Input("Release", has_clear_button=False)),
        ]
        self.section_build = FormSection("Build", fields=build_fields)
        self.content_layout.addWidget(self.section_build)

        # Store field references
        for label, widget in build_fields:
            self._form_fields[label.lower().replace(" ", "_")] = widget

        # ===== SECTION 3: ADVANCED =====
        self.section_advanced = FormSection("Advanced", fields=[])
        self.content_layout.addWidget(self.section_advanced)

    def load_settings(self, settings: dict) -> None:
        """
        Load and display application settings.

        Args:
            settings: Dictionary of application settings to display
        """
        self._settings = settings.copy()
        self._populate_form_fields()

    def _populate_form_fields(self) -> None:
        """Populate form fields with current settings values."""
        if not self._settings:
            return

        # Map settings keys to form field names
        mapping = {
            "project_name": "Project Name",
            "author": "Author",
            "version": "Version",
            "output_directory": "Output Directory",
            "build_target": "Build Target",
        }

        for settings_key, field_key in mapping.items():
            if settings_key in self._settings:
                normalized_key = field_key.lower().replace(" ", "_")
                if normalized_key in self._form_fields:
                    field_widget = self._form_fields[normalized_key]
                    value = str(self._settings[settings_key])
                    if isinstance(field_widget, Input):
                        field_widget.setText(value)

    def _on_settings_save(self) -> None:
        """Handle settings save by emitting the changed signal."""
        # Collect current form values
        saved_settings = {}
        for key, widget in self._form_fields.items():
            if isinstance(widget, Input):
                saved_settings[key] = widget.text()

        self.settings_changed.emit(saved_settings)


class ExplorerScreen(QWidget):
    """
    Explorer screen: Project file browser with tree view and details panel.
    Shows project files and folders in a hierarchical tree structure.

    Features:
    - Tree view of project files and directories
    - File selection and navigation
    - Quick action buttons (Build, Translate, Settings)
    - File count and statistics

    Usage:
        explorer = ExplorerScreen()
        explorer.set_project(project)
    """

    request_build = Signal()
    request_translate = Signal()
    request_settings = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")
        self.setProperty("full_shell", True)

        # Store project reference
        self._project = None

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Projects", has_back=False, actions=[])
        layout.addWidget(top_bar)

        # Main content area
        content = QWidget()
        content_layout = QHBoxLayout(content)
        content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        content_layout.setSpacing(SPACING.lg)

        # Left panel: File tree
        left_panel = QFrame()
        left_panel.setStyleSheet(f"background: {COLORS.surface_0}; border-radius: {RADIUS.lg}px;")
        left_layout = QVBoxLayout(left_panel)
        left_layout.setContentsMargins(SPACING.md, SPACING.md, SPACING.md, SPACING.md)

        tree_label = H2("Files")
        left_layout.addWidget(tree_label)

        # File tree widget
        self.file_tree = QTreeWidget()
        self.file_tree.setColumnCount(1)
        self.file_tree.setHeaderLabel("Project Files")
        self.file_tree.setStyleSheet(f"""
            QTreeWidget {{
                background: {COLORS.bg_1};
                color: {COLORS.text_primary};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.md}px;
            }}
            QTreeWidget::item:selected {{
                background: {COLORS.accent_bg};
            }}
        """)
        left_layout.addWidget(self.file_tree)

        content_layout.addWidget(left_panel, 1)

        # Right panel: Quick actions and details
        right_panel = QFrame()
        right_panel.setStyleSheet(f"background: {COLORS.surface_0}; border-radius: {RADIUS.lg}px;")
        right_layout = QVBoxLayout(right_panel)
        right_layout.setContentsMargins(SPACING.md, SPACING.md, SPACING.md, SPACING.md)

        detail_label = H2("Actions")
        right_layout.addWidget(detail_label)

        # Quick action buttons
        button_layout = QVBoxLayout()
        button_layout.setSpacing(SPACING.sm)

        build_btn = Button("Build Project", variant="primary")
        build_btn.clicked.connect(self.request_build.emit)
        button_layout.addWidget(build_btn)

        translate_btn = Button("Translate", variant="secondary")
        translate_btn.clicked.connect(self.request_translate.emit)
        button_layout.addWidget(translate_btn)

        settings_btn = Button("Settings", variant="ghost")
        settings_btn.clicked.connect(self.request_settings.emit)
        button_layout.addWidget(settings_btn)

        right_layout.addLayout(button_layout)

        # Stats
        stats_label = H2("Statistics")
        right_layout.addWidget(stats_label)

        self.file_count_label = QLabel("Files: 0")
        self.file_count_label.setStyleSheet(f"color: {COLORS.text_secondary}; font-size: 13px;")
        right_layout.addWidget(self.file_count_label)

        self.size_label = QLabel("Size: 0 KB")
        self.size_label.setStyleSheet(f"color: {COLORS.text_secondary}; font-size: 13px;")
        right_layout.addWidget(self.size_label)

        right_layout.addStretch(1)

        content_layout.addWidget(right_panel, 0)

        layout.addWidget(content)

        # Load sample data
        self._load_sample_project()

    def _load_sample_project(self) -> None:
        """Load sample project data for demonstration."""
        self.file_tree.clear()

        root = QTreeWidgetItem(self.file_tree)
        root.setText(0, "project_root/")

        # Add sample folders
        src_folder = QTreeWidgetItem(root)
        src_folder.setText(0, "src/")

        file1 = QTreeWidgetItem(src_folder)
        file1.setText(0, "main.py")

        file2 = QTreeWidgetItem(src_folder)
        file2.setText(0, "utils.py")

        data_folder = QTreeWidgetItem(root)
        data_folder.setText(0, "data/")

        file3 = QTreeWidgetItem(data_folder)
        file3.setText(0, "config.json")

        self.file_tree.expandAll()
        self.file_count_label.setText("Files: 3")

    def set_project(self, project) -> None:
        """Load project data into the explorer."""
        self._project = project
        # TODO: Load actual project files and update tree
        self._load_sample_project()


class WorkspaceScreen(QWidget):
    """
    Workspace screen: Dual-pane translation/edit interface.
    Shows file editor on left and translation content on right.

    Features:
    - Dual-pane layout with file editor and translation view
    - Tab switching (Editor, Diff, History views)
    - Save functionality
    - File navigation

    Usage:
        workspace = WorkspaceScreen()
        workspace.set_project(project)
        workspace.set_file_scope(file_path)
    """

    save_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")
        self.setProperty("full_shell", True)

        # Store state
        self._project = None

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Translate", has_back=False, actions=["save", "more_vert"])
        layout.addWidget(top_bar)

        # Main splitter: Left (editor) | Right (translation)
        splitter = QSplitter(Qt.Horizontal)

        # Left panel: Code editor
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        left_layout.setContentsMargins(SPACING.lg, SPACING.lg, SPACING.md, SPACING.lg)

        editor_label = H2("Source")
        left_layout.addWidget(editor_label)

        self.editor = QTextEdit()
        self.editor.setPlainText("// Source code here\nfunction example() {\n  return 'Hello';\n}")
        self.editor.setStyleSheet(f"""
            background: {COLORS.bg_1};
            color: {COLORS.text_primary};
            border: 1px solid {COLORS.stroke_0};
            border-radius: {RADIUS.md}px;
            font-family: 'JetBrains Mono';
            font-size: 11pt;
        """)
        left_layout.addWidget(self.editor)

        # Right panel: Translation view
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        right_layout.setContentsMargins(SPACING.md, SPACING.lg, SPACING.xl, SPACING.lg)

        translation_label = H2("Translation")
        right_layout.addWidget(translation_label)

        self.translation_view = QTextEdit()
        self.translation_view.setPlainText("// Translated content here\nfunction example() {\n  return 'Bonjour';\n}")
        self.translation_view.setStyleSheet(f"""
            background: {COLORS.bg_1};
            color: {COLORS.text_primary};
            border: 1px solid {COLORS.stroke_0};
            border-radius: {RADIUS.md}px;
            font-family: 'JetBrains Mono';
            font-size: 11pt;
        """)
        right_layout.addWidget(self.translation_view)

        splitter.addWidget(left_panel)
        splitter.addWidget(right_panel)
        splitter.setSizes([400, 400])
        splitter.setStyleSheet(f"background: {COLORS.bg_0};")

        layout.addWidget(splitter)

    def set_project(self, project) -> None:
        """Set the current project."""
        self._project = project

    def set_file_scope(self, file_path: str) -> None:
        """Set the current file being edited."""
        # TODO: Load actual file content
        pass


class ComponentShowcase(QWidget):
    """
    Comprehensive showcase screen displaying all design system components.

    This screen serves as:
    - Living documentation for all available components
    - Design system testing and validation
    - Reference implementation for developers
    - Interactive component gallery

    Categories:
    - Atoms: Basic building blocks (Buttons, Inputs, Badges, Progress bars)
    - Molecules: Combined components (TopBar, FilterChips, ListCard, Callout)
    - Organisms: Screen-level components (BuildHistoryItem, InspectorHeader)
    - Design Tokens: Visual reference for colors, spacing, radius, shadows
    """

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Component Showcase", has_back=False)
        layout.addWidget(top_bar)

        # Content area (scrollable)
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        scroll.setStyleSheet("border: none;")

        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        content_layout.setSpacing(SPACING.xxl)

        # ===== DESIGN TOKENS REFERENCE =====
        tokens_section = CardFrame(shadow=False)
        tokens_layout = QVBoxLayout(tokens_section)
        tokens_layout.addWidget(H2("Design Tokens"))
        tokens_layout.addWidget(Muted("Color palette, spacing scale, and typography"))

        # Colors grid
        colors_grid = QGridLayout()
        colors_grid.setSpacing(SPACING.md)
        color_samples = [
            ("Primary", COLORS.accent_primary),
            ("Success", COLORS.success),
            ("Warning", COLORS.warning),
            ("Error", COLORS.error),
            ("Info", COLORS.info),
            ("Surface", COLORS.surface_0),
        ]
        for i, (label, color) in enumerate(color_samples):
            color_box = QFrame()
            color_box.setFixedSize(80, 60)
            color_box.setStyleSheet(f"background: {color}; border-radius: {RADIUS.md}px;")
            color_label = QLabel(label)
            color_label.setStyleSheet(f"font-size: 11px; color: {COLORS.text_secondary};")
            color_col = QVBoxLayout()
            color_col.addWidget(color_box)
            color_col.addWidget(color_label)
            colors_grid.addLayout(color_col, 0, i)

        tokens_layout.addLayout(colors_grid)
        content_layout.addWidget(tokens_section)

        # ===== ATOMS SHOWCASE =====
        atoms_section = CardFrame(shadow=False)
        atoms_layout = QVBoxLayout(atoms_section)
        atoms_layout.addWidget(H2("Atoms"))
        atoms_layout.addWidget(Muted("Basic building blocks and primitives"))

        # Buttons (all variants)
        atoms_layout.addWidget(H3("Buttons"))
        button_row = QHBoxLayout()
        button_row.addWidget(Button("Primary", variant="primary"))
        button_row.addWidget(Button("Secondary", variant="secondary"))
        button_row.addWidget(Button("Ghost", variant="ghost"))
        button_row.addWidget(Button("Disabled", variant="primary"))
        button_row.lastWidget().setEnabled(False)
        button_row.addStretch(1)
        atoms_layout.addLayout(button_row)

        # Badges (all variants)
        atoms_layout.addWidget(H3("Status Badges"))
        badge_row = QHBoxLayout()
        for variant in ["primary", "success", "warning", "error", "info"]:
            badge_row.addWidget(BadgeLabel(variant.upper(), variant=variant))
        badge_row.addStretch(1)
        atoms_layout.addLayout(badge_row)

        # Inputs
        atoms_layout.addWidget(H3("Input Fields"))
        input_row = QHBoxLayout()
        input_row.addWidget(Input("Standard input"))
        input_row.addWidget(Input("Placeholder text..."))
        input_row.addStretch(1)
        atoms_layout.addLayout(input_row)

        # Progress bars
        atoms_layout.addWidget(H3("Progress Bars"))
        prog_row = QHBoxLayout()
        prog_row.addWidget(ProgressBar(25))
        prog_row.addWidget(ProgressBar(50))
        prog_row.addWidget(ProgressBar(75))
        prog_row.addWidget(ProgressBar(100))
        atoms_layout.addLayout(prog_row)

        content_layout.addWidget(atoms_section)

        # ===== MOLECULES SHOWCASE =====
        molecules_section = CardFrame(shadow=False)
        molecules_layout = QVBoxLayout(molecules_section)
        molecules_layout.addWidget(H2("Molecules"))
        molecules_layout.addWidget(Muted("Combined components and patterns"))

        # Filter chips
        molecules_layout.addWidget(H3("Filter Chips"))
        filters = FilterChipsRow(["All", "Recent", "Archived", "Starred"], active_chip="All")
        molecules_layout.addWidget(filters)

        # List cards
        molecules_layout.addWidget(H3("List Cards"))
        card_row = QHBoxLayout()
        card_row.addWidget(ListCard("Build #142", metadata="2 hours ago", status="Success", status_variant="success"))
        card_row.addWidget(ListCard("Build #141", metadata="5 minutes ago", status="Running", status_variant="primary"))
        card_row.addWidget(ListCard("Build #140", metadata="1 day ago", status="Failed", status_variant="error"))
        card_row.addStretch(1)
        molecules_layout.addLayout(card_row)

        # Callouts
        molecules_layout.addWidget(H3("Callouts"))
        callout_row = QHBoxLayout()
        callout_row.addWidget(Callout("Warning Message", "This is a warning notification", variant="warning"))
        callout_row.addWidget(Callout("Error Alert", "An error has occurred", variant="error"))
        callout_row.addStretch(1)
        molecules_layout.addLayout(callout_row)

        content_layout.addWidget(molecules_section)

        # ===== ORGANISMS SHOWCASE =====
        organisms_section = CardFrame(shadow=False)
        organisms_layout = QVBoxLayout(organisms_section)
        organisms_layout.addWidget(H2("Organisms"))
        organisms_layout.addWidget(Muted("Screen-level and complex components"))

        # Build history items (different states)
        organisms_layout.addWidget(H3("Build History States"))
        build_row = QHBoxLayout()
        build_row.addWidget(BuildHistoryItem("Build #142", "success", 100, "2 hours ago"))
        build_row.addWidget(BuildHistoryItem("Build #141", "running", 67, "5 minutes ago"))
        build_row.addWidget(BuildHistoryItem("Build #140", "error", 0, "1 day ago"))
        organisms_layout.addLayout(build_row)

        # Stats cards
        organisms_layout.addWidget(H3("Statistics Cards"))
        stats_row = QHBoxLayout()
        stats_row.addWidget(StatsCard("24", label="Total Builds", icon="task"))
        stats_row.addWidget(StatsCard("95%", label="Success Rate", icon="trending_up"))
        stats_row.addWidget(StatsCard("2m 30s", label="Avg Duration", icon="schedule"))
        stats_row.addStretch(1)
        organisms_layout.addLayout(stats_row)

        content_layout.addWidget(organisms_section)

        # ===== SPACING REFERENCE =====
        spacing_section = CardFrame(shadow=False)
        spacing_layout = QVBoxLayout(spacing_section)
        spacing_layout.addWidget(H2("Spacing Scale"))
        spacing_layout.addWidget(Muted("4px-based spacing system"))

        spacing_demo = QHBoxLayout()
        for name, value in [
            ("xxs", SPACING.xxs),
            ("xs", SPACING.xs),
            ("sm", SPACING.sm),
            ("md", SPACING.md),
            ("lg", SPACING.lg),
        ]:
            space_box = QFrame()
            space_box.setFixedWidth(value * 4)  # Scale up for visibility
            space_box.setFixedHeight(40)
            space_box.setStyleSheet(f"background: {COLORS.accent_primary}; border-radius: {RADIUS.md}px;")
            space_label = QLabel(f"{name}\n{value}px")
            space_label.setStyleSheet(f"font-size: 9px; color: {COLORS.text_secondary}; text-align: center;")
            space_col = QVBoxLayout()
            space_col.addWidget(space_box)
            space_col.addWidget(space_label)
            spacing_demo.addLayout(space_col)

        spacing_layout.addLayout(spacing_demo)
        content_layout.addWidget(spacing_section)

        content_layout.addStretch(1)
        scroll.setWidget(content)
        layout.addWidget(scroll, 1)


def H3(text: str) -> QLabel:
    """Helper function to create H3-styled labels."""
    label = QLabel(text)
    label.setStyleSheet(f"font-size: 14px; font-weight: 600; color: {COLORS.text_primary};")
    return label


class BuildScreen(QWidget):
    """
    Build history screen: Project build management with history, filters, and statistics.

    Features:
    - Build action buttons (Build from Folder, Build from ZIP)
    - Filter chips (All, Success, Failed, Last 7 Days)
    - Build history table with status, duration, and date
    - Statistics summary (Total Builds, Success Rate, Avg. Duration, Last Build)

    Signals:
        build_folder_requested: Build from folder action triggered
        build_zip_requested: Build from ZIP action triggered
        settings_requested: Settings action triggered
    """

    build_folder_requested = Signal()
    build_zip_requested = Signal()
    settings_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")
        self.setProperty("full_shell", True)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Build History", has_back=False, actions=[])
        layout.addWidget(top_bar)

        # Content area
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none;")

        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        content_layout.setSpacing(SPACING.lg)

        # Action buttons
        action_layout = QHBoxLayout()
        action_layout.setSpacing(SPACING.sm)

        build_folder_btn = Button("Build from Folder", variant="primary")
        build_folder_btn.clicked.connect(self.build_folder_requested.emit)
        action_layout.addWidget(build_folder_btn)

        build_zip_btn = Button("Build from ZIP", variant="secondary")
        build_zip_btn.clicked.connect(self.build_zip_requested.emit)
        action_layout.addWidget(build_zip_btn)

        action_layout.addStretch(1)

        settings_btn = IconButton("settings", size=44)
        settings_btn.clicked.connect(self.settings_requested.emit)
        action_layout.addWidget(settings_btn)

        content_layout.addLayout(action_layout)

        # Filter chips
        filters = FilterChipsRow(["All Builds", "Success", "Failed", "Last 7 Days"], active_chip="All Builds")
        content_layout.addWidget(filters)

        # Builds table
        table_frame = CardFrame()
        table_layout = QVBoxLayout(table_frame)
        table_layout.setContentsMargins(0, 0, 0, 0)

        table_header = QHBoxLayout()
        for header_text in ["Project", "Status", "Duration", "Date"]:
            header_label = QLabel(header_text)
            header_label.setStyleSheet(f"font-weight: 600; color: {COLORS.text_secondary};")
            table_header.addWidget(header_label)
        table_layout.addLayout(table_header)

        # Sample builds
        builds_data = [
            ("Sims4_UI_Enhancement", "success", "1m 45s", "Today, 14:30"),
            ("Furniture_Pack_2", "failed", "3m 12s", "Today, 12:15"),
            ("Gameplay_Tweaks", "success", "2m 08s", "Yesterday, 09:45"),
            ("Clothing_Collection", "success", "1m 30s", "Yesterday, 16:20"),
        ]

        for project, status, duration, date in builds_data:
            row_layout = QHBoxLayout()
            row_layout.setSpacing(SPACING.md)

            proj_label = QLabel(project)
            proj_label.setStyleSheet(f"color: {COLORS.text_primary};")
            row_layout.addWidget(proj_label)

            status_pill = Pill(status.upper(), variant="success" if status == "success" else "error")
            row_layout.addWidget(status_pill)

            dur_label = QLabel(duration)
            dur_label.setStyleSheet(f"color: {COLORS.text_secondary};")
            row_layout.addWidget(dur_label)

            date_label = QLabel(date)
            date_label.setStyleSheet(f"color: {COLORS.text_secondary};")
            row_layout.addWidget(date_label)

            table_layout.addLayout(row_layout)

        content_layout.addWidget(table_frame)

        # Statistics
        stats_frame = CardFrame()
        stats_layout = QHBoxLayout(stats_frame)
        stats_layout.setSpacing(SPACING.xl)

        stats_data = [
            ("Total Builds", "24"),
            ("Success Rate", "95%"),
            ("Avg. Duration", "2m 15s"),
            ("Last Build", "Today, 14:30")
        ]

        for label, value in stats_data:
            stat_layout = QVBoxLayout()
            stat_layout.setSpacing(SPACING.xs)

            value_label = QLabel(value)
            value_label.setStyleSheet(f"font-size: 16px; font-weight: 700; color: {COLORS.text_primary};")
            stat_layout.addWidget(value_label)

            label_label = QLabel(label)
            label_label.setStyleSheet(f"font-size: 11px; color: {COLORS.text_secondary};")
            stat_layout.addWidget(label_label)

            stats_layout.addLayout(stat_layout)

        stats_layout.addStretch(1)
        content_layout.addWidget(stats_frame)

        content_layout.addStretch(1)
        scroll.setWidget(content)
        layout.addWidget(scroll, 1)


class DiagnosticsScreen(QWidget):
    """
    Diagnostics/Issues screen: Project quality control with error filtering and fixing.

    Features:
    - Filter chips (All, Errors, Warnings, Info)
    - Search bar for finding issues
    - Issues list with severity, code, and message
    - Action buttons (Open Pane, Share, Clear, Fix Next)

    Signals:
        open_pane_requested: Open full diagnostics pane
        share_requested: Share diagnostics report
        clear_requested: Clear all diagnostics
        fix_next_requested: Fix next issue
    """

    open_pane_requested = Signal()
    share_requested = Signal()
    clear_requested = Signal()
    fix_next_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")
        self.setProperty("full_shell", True)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Global Diagnostics", has_back=False, actions=[])
        layout.addWidget(top_bar)

        # Content area
        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        content_layout.setSpacing(SPACING.lg)

        # Action buttons
        action_layout = QHBoxLayout()
        action_layout.setSpacing(SPACING.sm)

        open_pane_btn = Button("Open Pane", variant="secondary")
        open_pane_btn.clicked.connect(self.open_pane_requested.emit)
        action_layout.addWidget(open_pane_btn)

        action_layout.addStretch(1)

        share_btn = IconButton("share", size=44)
        share_btn.clicked.connect(self.share_requested.emit)
        action_layout.addWidget(share_btn)

        clear_btn = IconButton("delete", size=44)
        clear_btn.clicked.connect(self.clear_requested.emit)
        action_layout.addWidget(clear_btn)

        fix_next_btn = Button("Fix Next", variant="primary")
        fix_next_btn.clicked.connect(self.fix_next_requested.emit)
        action_layout.addWidget(fix_next_btn)

        content_layout.addLayout(action_layout)

        # Filter chips
        filters = FilterChipsRow(["All Issues", "Errors", "Warnings", "Info"], active_chip="All Issues")
        content_layout.addWidget(filters)

        # Search bar
        search_input = Input("Search issues, error codes, or files...")
        content_layout.addWidget(search_input)

        # Issues list
        issues_frame = CardFrame()
        issues_layout = QVBoxLayout(issues_frame)
        issues_layout.setSpacing(SPACING.md)

        issues_data = [
            ("error", "ERR_001", "Syntax error in pattern validation", "components/validator.py", "L42"),
            ("warning", "WARN_005", "Deprecated function usage detected", "utils/helpers.py", "L128"),
            ("error", "ERR_012", "Missing required field in entity definition", "data/entities.py", "L87"),
            ("info", "INFO_003", "Consider using const instead of let", "scripts/main.js", "L15"),
        ]

        for severity, code, message, file_path, location in issues_data:
            issue_layout = QHBoxLayout()
            issue_layout.setSpacing(SPACING.md)

            # Severity indicator
            severity_variants = {"error": "error", "warning": "warning", "info": "info"}
            severity_pill = Pill(severity.upper(), variant=severity_variants.get(severity, "neutral"))
            issue_layout.addWidget(severity_pill)

            # Issue details
            details_layout = QVBoxLayout()
            details_layout.setSpacing(SPACING.xs)

            title_label = QLabel(f"{code}: {message}")
            title_label.setStyleSheet(f"color: {COLORS.text_primary}; font-weight: 600;")
            details_layout.addWidget(title_label)

            path_label = QLabel(f"{file_path} {location}")
            path_label.setStyleSheet(f"color: {COLORS.text_secondary}; font-size: 11px;")
            details_layout.addWidget(path_label)

            issue_layout.addLayout(details_layout, 1)
            issue_layout.addStretch(1)

            # Action button
            fix_btn = Button("Fix", variant="ghost")
            fix_btn.setMaximumWidth(60)
            issue_layout.addWidget(fix_btn)

            issues_layout.addLayout(issue_layout)

        content_layout.addWidget(issues_frame)
        content_layout.addStretch(1)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none;")
        scroll.setWidget(content)
        layout.addWidget(scroll, 1)


class ProjectDetailScreen(QWidget):
    """
    Project detail screen: Comprehensive project information and metadata view.

    Features:
    - Project name, version, and description
    - Project metadata (author, date created, last modified)
    - Project statistics (files, size, build count)
    - Project actions (Edit, Share, Archive)

    Signals:
        edit_requested: Edit project action triggered
        share_requested: Share project action triggered
        archive_requested: Archive project action triggered
    """

    edit_requested = Signal()
    share_requested = Signal()
    archive_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")
        self.setProperty("full_shell", True)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Project Details", has_back=True, actions=[])
        layout.addWidget(top_bar)

        # Content area
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none;")

        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        content_layout.setSpacing(SPACING.lg)

        # Project header card
        header_frame = CardFrame()
        header_layout = QVBoxLayout(header_frame)
        header_layout.setSpacing(SPACING.md)

        project_name = H2("Sims 4 UI Enhancement")
        header_layout.addWidget(project_name)

        version_label = QLabel("v2.1.0 • Last updated: Yesterday at 3:45 PM")
        version_label.setStyleSheet(f"color: {COLORS.text_secondary}; font-size: 12px;")
        header_layout.addWidget(version_label)

        desc_label = QLabel("A comprehensive UI enhancement pack that improves the visual design and user experience of The Sims 4 game interface.")
        desc_label.setStyleSheet(f"color: {COLORS.text_secondary};")
        desc_label.setWordWrap(True)
        header_layout.addWidget(desc_label)

        # Action buttons
        action_layout = QHBoxLayout()
        action_layout.setSpacing(SPACING.sm)

        edit_btn = Button("Edit", variant="primary")
        edit_btn.clicked.connect(self.edit_requested.emit)
        action_layout.addWidget(edit_btn)

        share_btn = Button("Share", variant="secondary")
        share_btn.clicked.connect(self.share_requested.emit)
        action_layout.addWidget(share_btn)

        archive_btn = Button("Archive", variant="ghost")
        archive_btn.clicked.connect(self.archive_requested.emit)
        action_layout.addWidget(archive_btn)

        header_layout.addLayout(action_layout)
        content_layout.addWidget(header_frame)

        # Project metadata
        meta_frame = CardFrame()
        meta_layout = QVBoxLayout(meta_frame)
        meta_layout.setSpacing(SPACING.md)

        metadata = [
            ("Author", "Jane Developer"),
            ("Created", "March 15, 2023"),
            ("Last Modified", "December 19, 2024"),
            ("Status", "Active"),
        ]

        for key, value in metadata:
            row = QHBoxLayout()
            row.setSpacing(SPACING.lg)

            key_label = QLabel(key)
            key_label.setStyleSheet(f"color: {COLORS.text_secondary}; font-weight: 600; min-width: 100px;")
            row.addWidget(key_label)

            value_label = QLabel(value)
            value_label.setStyleSheet(f"color: {COLORS.text_primary};")
            row.addWidget(value_label, 1)

            meta_layout.addLayout(row)

        content_layout.addWidget(meta_frame)

        # Statistics
        stats_frame = CardFrame()
        stats_layout = QHBoxLayout(stats_frame)
        stats_layout.setSpacing(SPACING.xl)

        stats_data = [("Files", "156"), ("Size", "84.5 MB"), ("Builds", "28"), ("Success Rate", "96%")]

        for label, value in stats_data:
            stat_layout = QVBoxLayout()
            stat_layout.setSpacing(SPACING.xs)

            value_label = QLabel(value)
            value_label.setStyleSheet(f"font-size: 16px; font-weight: 700; color: {COLORS.text_primary};")
            stat_layout.addWidget(value_label)

            label_label = QLabel(label)
            label_label.setStyleSheet(f"font-size: 11px; color: {COLORS.text_secondary};")
            stat_layout.addWidget(label_label)

            stats_layout.addLayout(stat_layout)

        stats_layout.addStretch(1)
        content_layout.addWidget(stats_frame)

        content_layout.addStretch(1)
        scroll.setWidget(content)
        layout.addWidget(scroll, 1)


class AboutScreen(QWidget):
    """
    About screen: Application information, version, and links.

    Features:
    - App name and version
    - App description and credits
    - Links (Website, Documentation, GitHub, Support)
    - System information
    """

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")
        self.setProperty("full_shell", True)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("About JPE Studio", has_back=False, actions=[])
        layout.addWidget(top_bar)

        # Content area
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none;")

        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        content_layout.setSpacing(SPACING.lg)

        # App info
        info_frame = CardFrame()
        info_layout = QVBoxLayout(info_frame)
        info_layout.setSpacing(SPACING.md)

        app_title = H2("JPE Studio")
        info_layout.addWidget(app_title)

        version_label = QLabel("Version 3.0.0 (Build 2024-12-19)")
        version_label.setStyleSheet(f"color: {COLORS.text_secondary};")
        info_layout.addWidget(version_label)

        desc_label = QLabel("A professional IDE for building and translating Sims 4 mods with design system components, real-time diagnostics, and build management.")
        desc_label.setStyleSheet(f"color: {COLORS.text_secondary};")
        desc_label.setWordWrap(True)
        info_layout.addWidget(desc_label)

        content_layout.addWidget(info_frame)

        # Links
        links_frame = CardFrame()
        links_layout = QVBoxLayout(links_frame)
        links_layout.setSpacing(SPACING.sm)

        links = [
            ("Website", "https://jpe-studio.dev"),
            ("Documentation", "https://docs.jpe-studio.dev"),
            ("GitHub", "https://github.com/jpe-studio"),
            ("Support", "https://support.jpe-studio.dev"),
        ]

        for label, url in links:
            link_btn = Button(label, variant="secondary")
            links_layout.addWidget(link_btn)

        content_layout.addWidget(links_frame)

        # Credits
        credits_frame = CardFrame()
        credits_layout = QVBoxLayout(credits_frame)
        credits_layout.setSpacing(SPACING.md)

        credits_title = H3("Credits")
        credits_layout.addWidget(credits_title)

        credits_text = QLabel("Designed and developed by the JPE Studio team.\n\nBuilt with PySide6, Python, and modern UI design principles.")
        credits_text.setStyleSheet(f"color: {COLORS.text_secondary};")
        credits_text.setWordWrap(True)
        credits_layout.addWidget(credits_text)

        content_layout.addWidget(credits_frame)

        content_layout.addStretch(1)
        scroll.setWidget(content)
        layout.addWidget(scroll, 1)


class DocsScreen(QWidget):
    """
    Documentation screen: Help, guides, and tutorials.

    Features:
    - Quick links to common topics
    - Search bar for documentation
    - Recent articles
    - Category browser
    """

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")
        self.setProperty("full_shell", True)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Documentation", has_back=False, actions=[])
        layout.addWidget(top_bar)

        # Content area
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none;")

        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        content_layout.setSpacing(SPACING.lg)

        # Search bar
        search_input = Input("Search documentation...")
        content_layout.addWidget(search_input)

        # Quick links
        quick_links_frame = CardFrame()
        quick_links_layout = QGridLayout(quick_links_frame)
        quick_links_layout.setSpacing(SPACING.md)

        quick_topics = [
            "Getting Started",
            "Creating Projects",
            "Build Configuration",
            "Translation Workflow",
            "Diagnostics & QA",
            "API Reference",
        ]

        for i, topic in enumerate(quick_topics):
            btn = Button(topic, variant="secondary")
            row, col = divmod(i, 3)
            quick_links_layout.addWidget(btn, row, col)

        content_layout.addWidget(quick_links_frame)

        # Recent articles
        articles_frame = CardFrame()
        articles_layout = QVBoxLayout(articles_frame)
        articles_layout.setSpacing(SPACING.md)

        articles_title = H3("Recent Articles")
        articles_layout.addWidget(articles_title)

        articles = [
            "Getting Started with JPE Studio",
            "How to Create Your First Project",
            "Understanding the Build System",
            "Translation Best Practices",
        ]

        for article in articles:
            article_label = QLabel(f"• {article}")
            article_label.setStyleSheet(f"color: {COLORS.text_secondary};")
            articles_layout.addWidget(article_label)

        content_layout.addWidget(articles_frame)

        content_layout.addStretch(1)
        scroll.setWidget(content)
        layout.addWidget(scroll, 1)


class PluginsScreen(QWidget):
    """
    Plugins/Marketplace screen: Browse and install plugins.

    Features:
    - Plugin search and filtering
    - Plugin cards with ratings and install buttons
    - Category browsing
    - Installed plugins list
    """

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")
        self.setProperty("full_shell", True)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Plugin Marketplace", has_back=False, actions=[])
        layout.addWidget(top_bar)

        # Content area
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none;")

        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        content_layout.setSpacing(SPACING.lg)

        # Search bar
        search_input = Input("Search plugins...")
        content_layout.addWidget(search_input)

        # Category filter
        categories = FilterChipsRow(["All", "Build Tools", "Translation", "Analytics", "Utilities"], active_chip="All")
        content_layout.addWidget(categories)

        # Plugin cards
        plugins_frame = CardFrame()
        plugins_layout = QGridLayout(plugins_frame)
        plugins_layout.setSpacing(SPACING.md)

        plugins = [
            ("Build Optimizer", "⭐⭐⭐⭐⭐ (128)"),
            ("Translation Helper", "⭐⭐⭐⭐ (85)"),
            ("Code Analyzer", "⭐⭐⭐⭐⭐ (156)"),
            ("Git Integration", "⭐⭐⭐⭐ (72)"),
        ]

        for i, (name, rating) in enumerate(plugins):
            plugin_col = QVBoxLayout()
            plugin_col.setSpacing(SPACING.sm)

            name_label = QLabel(name)
            name_label.setStyleSheet(f"font-weight: 600; color: {COLORS.text_primary};")
            plugin_col.addWidget(name_label)

            rating_label = QLabel(rating)
            rating_label.setStyleSheet(f"color: {COLORS.text_secondary}; font-size: 11px;")
            plugin_col.addWidget(rating_label)

            install_btn = Button("Install", variant="primary")
            install_btn.setMaximumWidth(80)
            plugin_col.addWidget(install_btn)

            plugin_col.addStretch(1)

            row, col = divmod(i, 2)
            plugins_layout.addLayout(plugin_col, row, col)

        content_layout.addWidget(plugins_frame)

        content_layout.addStretch(1)
        scroll.setWidget(content)
        layout.addWidget(scroll, 1)


class EntityViewScreen(QWidget):
    """
    Entity view screen: Browse and edit project entities (patterns, data definitions).

    Features:
    - Entity tree browser
    - Entity details panel
    - Entity editor
    - Search and filtering
    """

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")
        self.setProperty("full_shell", True)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Entity Browser", has_back=True, actions=[])
        layout.addWidget(top_bar)

        # Content area - dual pane
        content_layout = QHBoxLayout()
        content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        content_layout.setSpacing(SPACING.lg)

        # Left pane: Entity tree
        left_frame = CardFrame()
        left_layout = QVBoxLayout(left_frame)
        left_layout.setContentsMargins(SPACING.md, SPACING.md, SPACING.md, SPACING.md)

        tree_title = H3("Entities")
        left_layout.addWidget(tree_title)

        entity_tree = QTreeWidget()
        entity_tree.setHeaderLabel("Entity Structure")
        entity_tree.setStyleSheet(f"""
            QTreeWidget {{
                background: {COLORS.bg_1};
                color: {COLORS.text_primary};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.md}px;
            }}
        """)

        # Add sample entities
        root = QTreeWidgetItem(entity_tree, ["Project Root"])
        patterns = QTreeWidgetItem(root, ["Patterns"])
        QTreeWidgetItem(patterns, ["Pattern_Validation"])
        QTreeWidgetItem(patterns, ["Pattern_Transform"])
        data = QTreeWidgetItem(root, ["Data"])
        QTreeWidgetItem(data, ["EntityDef_Base"])
        QTreeWidgetItem(data, ["EntityDef_Extended"])

        entity_tree.expandAll()
        left_layout.addWidget(entity_tree)

        content_layout.addWidget(left_frame, 1)

        # Right pane: Entity details
        right_frame = CardFrame()
        right_layout = QVBoxLayout(right_frame)
        right_layout.setContentsMargins(SPACING.md, SPACING.md, SPACING.md, SPACING.md)

        detail_title = H3("Details")
        right_layout.addWidget(detail_title)

        entity_name = QLabel("Selected Entity")
        entity_name.setStyleSheet(f"color: {COLORS.text_secondary};")
        right_layout.addWidget(entity_name)

        entity_editor = QTextEdit()
        entity_editor.setPlaceholderText("Entity details will appear here")
        entity_editor.setStyleSheet(f"""
            QTextEdit {{
                background: {COLORS.bg_1};
                color: {COLORS.text_primary};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.md}px;
            }}
        """)
        right_layout.addWidget(entity_editor)

        content_layout.addWidget(right_frame, 1)

        content_widget = QWidget()
        content_widget.setLayout(content_layout)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none;")
        scroll.setWidget(content_widget)

        layout.addWidget(scroll, 1)
