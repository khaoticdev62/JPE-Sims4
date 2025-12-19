"""
Complete screen mockups using atomic, molecular, and organism components.

This module provides three complete screen implementations:
1. DashboardScreen - Main screen with search, filters, and project cards
2. DetailScreen - Detail view with inspector and tabbed content
3. SettingsScreen - Settings form with sections and fields
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
    Dashboard/Home screen: TopBar + SearchBar + FilterChips + BuildHistory grid + FAB.
    Main entry point showing recent projects and builds.
    """

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar
        top_bar = TopBar("Dashboard", has_back=False, actions=["notifications", "settings"])
        top_bar.back_clicked.connect(lambda: print("Back clicked"))
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
        search = SearchBar(placeholder="Search builds, projects...")
        content_layout.addWidget(search)

        # Filter chips
        filters = FilterChipsRow(["All", "Success", "Failed", "Running"], active_chip="All")
        filters.chip_clicked.connect(lambda chip: print(f"Filter: {chip}"))
        content_layout.addWidget(filters)

        # Build cards grid (2 columns)
        grid = QGridLayout()
        grid.setSpacing(SPACING.md)

        # Sample build data
        builds = [
            ("Build #142", "Success", 100, "2 hours ago", "success"),
            ("Build #141", "Running", 67, "5 minutes ago", "primary"),
            ("Build #140", "Failed", 0, "1 day ago", "error"),
            ("Build #139", "Success", 100, "2 days ago", "success"),
        ]

        for i, (name, status, progress, time, variant) in enumerate(builds):
            card = BuildHistoryItem(
                title=name,
                status=status,
                status_variant=variant,
                progress=progress,
                timestamp=time,
            )
            card.clicked.connect(lambda: print("Build clicked"))
            row, col = divmod(i, 2)
            grid.addWidget(card, row, col)

        content_layout.addLayout(grid)
        content_layout.addStretch(1)

        scroll.setWidget(content)
        layout.addWidget(scroll, 1)


class DetailScreen(QWidget):
    """
    Detail view screen: TopBar (with back) + Splitter (inspector | tabs).
    Shows detailed information with tabs for different views.
    """

    back_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # TopBar with back button
        top_bar = TopBar("Build #142 Details", has_back=True, actions=["share", "delete"])
        top_bar.back_clicked.connect(self.back_requested.emit)
        layout.addWidget(top_bar)

        # Splitter: Left (inspector) | Right (tabs)
        splitter = QSplitter(Qt.Horizontal)

        # ===== LEFT PANEL =====
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        left_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.md, SPACING.xl)
        left_layout.setSpacing(SPACING.lg)

        # Inspector header
        inspector = InspectorHeader(
            "com.jpe.sims4.mod",
            badges=[("v1.2.0", "primary"), ("DEPLOYED", "success")],
            actions=["edit", "delete"],
        )
        inspector.action_clicked.connect(lambda action: print(f"Action: {action}"))
        left_layout.addWidget(inspector)

        # Warning callout
        warning = Callout(
            "Deprecated Tag Detected",
            message="The tag <deprecated> is no longer supported in v2.0.",
            variant="warning",
        )
        left_layout.addWidget(warning)

        # Properties table
        props = PropertiesTable(
            {
                "Build ID": "#142",
                "Duration": "2m 34s",
                "Artifacts": "4 files",
                "Commit": "a3f2c1d",
                "Branch": "main",
                "Status": "Success",
            }
        )
        left_layout.addWidget(props)

        left_layout.addStretch(1)

        # ===== RIGHT PANEL =====
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        right_layout.setContentsMargins(SPACING.lg, SPACING.lg, SPACING.xl, SPACING.xl)
        right_layout.setSpacing(SPACING.lg)

        # Tab panel with sample content
        diagnostics_widget = QTextEdit()
        diagnostics_widget.setPlainText("Build log output...\n[✓] Dependencies resolved\n[✓] Build succeeded\n")
        diagnostics_widget.setStyleSheet(f"""
            background: {COLORS.bg_1};
            color: {COLORS.text_primary};
            border: 1px solid {COLORS.stroke_0};
            border-radius: {RADIUS.md}px;
            padding: {SPACING.md}px;
            font-family: 'JetBrains Mono';
            font-size: 10pt;
        """)

        artifacts_widget = QTextEdit()
        artifacts_widget.setPlainText("mod.zip (14.2 MB)\nmod_config.xml\nREADME.txt\nLICENSE")
        artifacts_widget.setStyleSheet(diagnostics_widget.styleSheet())

        commits_widget = QTextEdit()
        commits_widget.setPlainText("a3f2c1d - Fix deprecated tags\n8e1b2c4 - Add new features\nc5d3e2f - Initial commit")
        commits_widget.setStyleSheet(diagnostics_widget.styleSheet())

        tabs = TabPanel(
            tabs=[
                ("Diagnostics", diagnostics_widget),
                ("Artifacts", artifacts_widget),
                ("Commits", commits_widget),
            ]
        )
        right_layout.addWidget(tabs, 1)

        # Add panels to splitter
        splitter.addWidget(left_panel)
        splitter.addWidget(right_panel)
        splitter.setSizes([400, 600])
        splitter.setStyleSheet(f"background: {COLORS.bg_0};")

        layout.addWidget(splitter, 1)


class SettingsScreen(QWidget):
    """
    Settings screen: TopBar + scrollable content with sections and form fields.
    Allows configuration of application settings.
    """

    settings_changed = Signal(dict)

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet(f"background: {COLORS.bg_0};")

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
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(SPACING.xl, SPACING.lg, SPACING.xl, SPACING.xl)
        content_layout.setSpacing(SPACING.xxl)

        # ===== SECTION 1: GENERAL =====
        general_fields = [
            ("Project Name", Input("My Sims 4 Mod", has_clear_button=False)),
            ("Author", Input("John Doe", has_clear_button=False)),
            ("Version", Input("1.0.0", has_clear_button=False)),
        ]
        section1 = FormSection("General", fields=general_fields)
        content_layout.addWidget(section1)

        # ===== SECTION 2: BUILD =====
        build_fields = [
            ("Output Directory", Input("/path/to/output", has_clear_button=False)),
            ("Build Target", Input("Release", has_clear_button=False)),
        ]
        section2 = FormSection("Build", fields=build_fields)
        content_layout.addWidget(section2)

        # ===== SECTION 3: ADVANCED =====
        section3 = FormSection("Advanced", fields=[])
        content_layout.addWidget(section3)

        content_layout.addStretch(1)

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

        save_btn = Button("Save Changes", variant="primary")
        save_btn.clicked.connect(lambda: self._on_settings_save())
        actions_layout.addWidget(save_btn)

        scroll.setWidget(content)
        layout.addWidget(scroll, 1)
        layout.addWidget(actions_frame)

    def _on_settings_save(self) -> None:
        """Handle settings save."""
        self.settings_changed.emit({"status": "saved"})


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
