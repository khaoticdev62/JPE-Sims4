from __future__ import annotations

from datetime import datetime
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QScrollArea,
    QTreeWidget,
    QTreeWidgetItem,
    QVBoxLayout,
    QWidget,
)

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import CardFrame, H1, H2, MaterialIcon, Muted
from jpe_studio_qt.ui.glass_widgets import GlassFrame


class BuildHistory2Page(QWidget):
    """
    Build history page aligned to `JPE assets folder/build_&_history_screen_2`.
    
    This page displays historical build information and allows running new builds.
    """

    request_build_folder = Signal()
    request_build_zip = Signal()
    request_open_settings = Signal()

    def __init__(self) -> None:
        super().__init__()

        c = DESIGN.colors

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # Header section with glass-morphism effect
        header = GlassFrame()  # Glass-morphism header (Phase 3)
        header.setFixedHeight(64)  # Stitch spec: Header 64px (was variable)
        header.setStyleSheet(f"background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 {c.surface}, stop:1 {c.background});")
        header_l = QVBoxLayout(header)
        header_l.setContentsMargins(DESIGN.spacing.xl, DESIGN.spacing.xl, DESIGN.spacing.xl, DESIGN.spacing.xl)  # 24px margins
        header_l.setSpacing(DESIGN.spacing.lg)  # 16px spacing

        # Title and subtitle
        title = H1("Build History")
        title.setStyleSheet("font-weight: 700;")
        header_l.addWidget(title)

        subtitle = Muted("View and manage your build history")
        subtitle.setWordWrap(True)
        header_l.addWidget(subtitle)

        root.addWidget(header)

        # Content area
        content = QScrollArea()
        content.setWidgetResizable(True)
        content.setFrameShape(QFrame.NoFrame)
        content.setStyleSheet(f"background: {c.background};")

        content_widget = QWidget()
        content_l = QVBoxLayout(content_widget)
        content_l.setContentsMargins(DESIGN.spacing.xl, DESIGN.spacing.lg, DESIGN.spacing.xl, DESIGN.spacing.xl)  # 24,18,24,24px margins
        content_l.setSpacing(DESIGN.spacing.lg)  # 18px spacing

        # Quick actions section
        actions_card = CardFrame(shadow=False)
        actions_l = QHBoxLayout(actions_card)
        actions_l.setContentsMargins(16, 16, 16, 16)
        actions_l.setSpacing(12)

        build_folder_btn = QPushButton("Build from Folder")
        build_folder_btn.setObjectName("Primary")
        build_folder_btn.setFixedHeight(56)  # Stitch spec: Build button 56px height (was 42px)
        build_folder_btn.clicked.connect(self.request_build_folder.emit)

        build_zip_btn = QPushButton("Build from ZIP")
        build_zip_btn.setObjectName("Chip")
        build_zip_btn.setFixedHeight(40)  # Secondary button 40px height
        build_zip_btn.clicked.connect(self.request_build_zip.emit)

        settings_btn = QPushButton()
        settings_btn.setObjectName("IconButton")
        set_toolbutton_icon(settings_btn, "settings", size_px=20)
        settings_btn.setFixedHeight(42)
        settings_btn.clicked.connect(self.request_open_settings.emit)
        settings_btn.setToolTip("Build Settings")

        actions_l.addWidget(build_folder_btn)
        actions_l.addWidget(build_zip_btn)
        actions_l.addStretch(1)
        actions_l.addWidget(settings_btn)

        content_l.addWidget(actions_card)

        # Filters section
        filters_card = CardFrame(shadow=False)
        filters_l = QHBoxLayout(filters_card)
        filters_l.setContentsMargins(16, 12, 16, 12)
        filters_l.setSpacing(10)

        all_btn = QPushButton("All Builds")
        all_btn.setObjectName("ChipActive")
        all_btn.setFixedHeight(32)

        success_btn = QPushButton("Success")
        success_btn.setObjectName("Chip")
        success_btn.setFixedHeight(32)

        failed_btn = QPushButton("Failed")
        failed_btn.setObjectName("Chip")
        failed_btn.setFixedHeight(32)

        last_7_btn = QPushButton("Last 7 Days")
        last_7_btn.setObjectName("Chip")
        last_7_btn.setFixedHeight(32)

        filters_l.addWidget(all_btn)
        filters_l.addWidget(success_btn)
        filters_l.addWidget(failed_btn)
        filters_l.addWidget(last_7_btn)
        filters_l.addStretch(1)

        content_l.addWidget(filters_card)

        # Build history section
        history_card = CardFrame(shadow=False)
        history_l = QVBoxLayout(history_card)
        history_l.setContentsMargins(0, 0, 0, 0)
        history_l.setSpacing(0)

        history_header = QFrame()
        history_header_l = QHBoxLayout(history_header)
        history_header_l.setContentsMargins(16, 12, 16, 12)
        history_header_l.setSpacing(10)

        history_title = H2("Recent Builds")
        history_title.setStyleSheet("font-weight: 600;")
        history_header_l.addWidget(history_title)
        history_header_l.addStretch(1)

        refresh_btn = QPushButton()
        refresh_btn.setObjectName("IconButton")
        set_toolbutton_icon(refresh_btn, "refresh", size_px=18)
        refresh_btn.setFixedHeight(32)
        refresh_btn.setFixedWidth(32)
        history_header_l.addWidget(refresh_btn)

        history_l.addWidget(history_header)

        # Build history list
        self.builds_tree = QTreeWidget()
        self.builds_tree.setHeaderLabels(["Project", "Status", "Duration", "Date", "Actions"])
        self.builds_tree.setRootIsDecorated(False)
        self.builds_tree.setAlternatingRowColors(True)
        self.builds_tree.setStyleSheet(f"""
            QTreeWidget {{
                background: transparent;
                border: none;
            }}
            QTreeWidget::item {{
                height: 48px;
                padding: 12px 16px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }}
            QTreeWidget::item:selected {{
                background: rgba(134,56,250,0.10);
            }}
            QTreeWidget::header {{
                background: transparent;
                border: none;
                padding: 8px 0px;
            }}
        """)

        # Add sample builds
        self._add_sample_builds()

        history_l.addWidget(self.builds_tree)
        content_l.addWidget(history_card)

        # Stats summary
        stats_card = CardFrame(shadow=False)
        stats_l = QHBoxLayout(stats_card)
        stats_l.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg)  # 16px margins
        stats_l.setSpacing(DESIGN.spacing.xl)  # 20px spacing

        stats = [
            ("Total Builds", "24"),
            ("Success Rate", "95%"),
            ("Avg. Duration", "2m 15s"),
            ("Last Build", "Today, 14:30")
        ]

        for label, value in stats:
            stat_col = QVBoxLayout()
            stat_col.setContentsMargins(0, 0, 0, 0)
            stat_col.setSpacing(4)

            value_lbl = QLabel(value)
            value_lbl.setStyleSheet("font-size: 14pt; font-weight: 700;")
            label_lbl = Muted(label)
            label_lbl.setStyleSheet("font-size: 9pt;")

            stat_col.addWidget(value_lbl)
            stat_col.addWidget(label_lbl)
            stats_l.addLayout(stat_col)

        stats_l.addStretch(1)
        content_l.addWidget(stats_card)

        content_l.addStretch(1)
        content.setWidget(content_widget)
        root.addWidget(content, 1)

    def set_project(self, project: object) -> None:
        """Set the current project context (for wiring with MainWindow)."""
        # Store project for future use when build features are fully implemented
        self._project = project
        # Current implementation shows sample builds; in future will show real project builds

    def _add_sample_builds(self) -> None:
        """Add sample builds to the tree."""
        builds = [
            {
                "project": "Sims4_UI_Enhancement",
                "status": "Success",
                "variant": "success",
                "duration": "1m 45s",
                "date": "Today, 14:30",
                "size": "14.2 MB"
            },
            {
                "project": "Furniture_Pack_2",
                "status": "Failed",
                "variant": "error",
                "duration": "3m 12s",
                "date": "Today, 12:15",
                "size": "22.7 MB"
            },
            {
                "project": "Gameplay_Tweaks",
                "status": "Success",
                "variant": "success",
                "duration": "2m 05s",
                "date": "Yesterday, 09:45",
                "size": "8.3 MB"
            },
            {
                "project": "Clothing_Bundle",
                "status": "In Progress",
                "variant": "primary",
                "duration": "0m 32s",
                "date": "Yesterday, 16:20",
                "size": "18.9 MB"
            },
            {
                "project": "World_Expansion",
                "status": "Success",
                "variant": "success",
                "duration": "4m 22s",
                "date": "Dec 16, 10:30",
                "size": "45.6 MB"
            }
        ]

        for build in builds:
            item = QTreeWidgetItem(self.builds_tree, [
                build["project"],
                build["status"],
                build["duration"],
                build["date"],
                "Actions"
            ])

            # Status badge
            status_badge = self._create_status_badge(build["status"], build["variant"])
            self.builds_tree.setItemWidget(item, 1, status_badge)

            # Actions
            actions_widget = self._create_action_buttons()
            self.builds_tree.setItemWidget(item, 4, actions_widget)

    def _create_status_badge(self, status: str, variant: str) -> QLabel:
        """Create a status badge."""
        badge = QLabel(status.upper())
        badge.setProperty("role", "badge")
        badge.setProperty("variant", variant)
        badge.setStyleSheet(
            "padding: 4px 8px; border-radius: 6px; font-size: 9pt; font-weight: 700;"
            f"background: {self._get_bg_color(variant)}; color: {self._get_text_color(variant)}; "
            f"border: 1px solid {self._get_border_color(variant)};"
        )
        return badge

    def _create_action_buttons(self) -> QWidget:
        """Create action buttons for a build row."""
        container = QWidget()
        layout = QHBoxLayout(container)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(6)

        view_btn = QPushButton("View")
        view_btn.setObjectName("Chip")
        view_btn.setFixedHeight(24)
        layout.addWidget(view_btn)

        download_btn = QPushButton()
        download_btn.setObjectName("IconButton")
        set_toolbutton_icon(download_btn, "download", size_px=14)
        download_btn.setFixedHeight(24)
        download_btn.setFixedWidth(24)
        layout.addWidget(download_btn)

        delete_btn = QPushButton()
        delete_btn.setObjectName("IconButton")
        set_toolbutton_icon(delete_btn, "delete", size_px=14)
        delete_btn.setFixedHeight(24)
        delete_btn.setFixedWidth(24)
        delete_btn.setStyleSheet("color: #ef4444;")
        layout.addWidget(delete_btn)

        return container

    def _get_bg_color(self, variant: str) -> str:
        """Get background color for variant."""
        c = DESIGN.colors
        if variant == "success":
            return c.success_bg
        elif variant == "error":
            return c.error_bg
        elif variant == "warning":
            return c.warning_bg
        else:  # primary (in progress)
            return c.primary_bg

    def _get_text_color(self, variant: str) -> str:
        """Get text color for variant."""
        c = DESIGN.colors
        if variant == "success":
            return c.success
        elif variant == "error":
            return c.error
        elif variant == "warning":
            return c.warning
        else:  # primary (in progress)
            return c.primary

    def _get_border_color(self, variant: str) -> str:
        """Get border color for variant."""
        if variant == "success":
            return "rgba(34,197,94,0.25)"
        elif variant == "error":
            return "rgba(239,68,68,0.25)"
        elif variant == "warning":
            return "rgba(234,179,8,0.25)"
        else:  # primary (in progress) - Stitch spec: #8638fa color (was #9d5cff)
            return "rgba(134,56,250,0.25)"


def set_toolbutton_icon(button, name: str, size_px: int = 18) -> None:
    """
    Sets an icon on a `QToolButton` using Material Symbols ligatures when available,
    otherwise falling back to a Unicode approximation.
    """
    try:
        from PySide6.QtGui import QFont
        from jpe_studio_qt.icons import icon_font_family
        from jpe_studio_qt.icons import icon_text

        f = QFont(icon_font_family())
        f.setPixelSize(size_px)
        button.setFont(f)
        button.setText(icon_text(name))
        return
    except Exception:
        button.setText(name)