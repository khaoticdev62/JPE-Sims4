"""
Dashboard page (home screen) - Stitch design specification.

Pure content-focused dashboard without sidebar navigation.
Implements exact layout from project_dashboard_1.png / project_dashboard_2.png:
- Glass header (64px) with greeting and search
- Quick action tiles (4-column, 120x120px)
- Filter chips (horizontal scroll, 8px gap)
- Recent projects (responsive grid, 280px min)
- FAB (fixed bottom-right, 56x56px with neon shadow)
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

from PySide6.QtCore import Qt, Signal, QTimer
from PySide6.QtGui import QColor, QResizeEvent
from PySide6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QScrollArea,
    QToolButton,
    QVBoxLayout,
    QWidget,
)

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import CardFrame, H1, H2, MaterialIcon, Muted, set_toolbutton_icon
from jpe_studio_qt.ui.glass_widgets import GlassFrame, NeonButton
from jpe_studio_qt.responsive import ResponsiveGrid
from jpe_studio_qt.animations import fade_in  # Phase 5: Animation integration


class Dashboard2Page(QWidget):
    """
    Dashboard home page - pure content area without sidebar.

    Signals:
        request_nav_index: Emit page index for navigation
        request_import: Request project import dialog
        request_open_project_json: Request opening a project
        request_open_project_detail_json: Request opening project detail
    """

    request_nav_index = Signal(int)
    request_import = Signal()
    request_open_project_json = Signal(str)
    request_open_project_detail_json = Signal(str)

    def __init__(self) -> None:
        super().__init__()
        c = DESIGN.colors
        s = DESIGN.spacing

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # --- HEADER (64px glass bar) ---
        header = GlassFrame()
        header.setFixedHeight(64)
        header_layout = QHBoxLayout(header)
        header_layout.setContentsMargins(24, 0, 24, 0)  # 24px horizontal padding
        header_layout.setSpacing(16)  # 16px gap

        # Greeting: "Hello, Dev" (H1: 24pt)
        greeting = H1("Hello, Dev")
        header_layout.addWidget(greeting)

        # Search bar (48px height, 16px radius)
        search_container = QWidget()
        search_layout = QHBoxLayout(search_container)
        search_layout.setContentsMargins(0, 0, 0, 0)
        search_layout.setSpacing(0)

        self.search = QLineEdit()
        self.search.setPlaceholderText("Search projects...")
        self.search.setFixedHeight(48)
        self.search.setStyleSheet(
            f"""
            QLineEdit {{
                border-radius: 16px;
                padding: 12px 44px 12px 44px;
                background: rgba(26, 18, 37, 0.70);
                border: 1px solid rgba(255,255,255,0.07);
                color: #ffffff;
            }}
            QLineEdit:focus {{
                border: 1px solid {c.primary};
                background: rgba(26, 18, 37, 0.85);
            }}
            QLineEdit::placeholder {{
                color: rgba(255,255,255,0.35);
            }}
            """
        )
        search_layout.addWidget(self.search, 1)

        # Search icon (positioned inside)
        search_icon = MaterialIcon("search", size_px=20)
        search_icon.setStyleSheet("color: rgba(255,255,255,0.35);")
        search_icon.setParent(self.search)
        search_icon.move(12, 14)

        header_layout.addWidget(search_container, 1)
        header_layout.addStretch(1)

        # Help button
        self.btn_help = QToolButton()
        self.btn_help.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_help, "help", size_px=18)
        header_layout.addWidget(self.btn_help)

        root.addWidget(header)

        # --- SCROLLABLE CONTENT AREA ---
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        scroll.setStyleSheet(f"background: {c.background};")

        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(24, 24, 24, 24)  # 24px margins
        content_layout.setSpacing(24)  # 24px spacing

        # --- QUICK ACTIONS (4-column grid, 120x120px tiles) ---
        quick_label = H2("Quick Actions")
        content_layout.addWidget(quick_label)

        actions_grid = QGridLayout()
        actions_grid.setSpacing(16)  # 16px gap between tiles
        actions_grid.setContentsMargins(0, 0, 0, 0)

        quick_actions = [
            ("add", "New Project"),
            ("folder_open", "Open"),
            ("download", "Import"),
            ("settings", "Settings"),
        ]

        for idx, (icon_name, label) in enumerate(quick_actions):
            tile = self._create_quick_action_tile(icon_name, label)
            actions_grid.addWidget(tile, 0, idx)

        content_layout.addLayout(actions_grid)

        # --- FILTER CHIPS (horizontal scroll, 8px gap) ---
        chips_label = H2("Filter")
        content_layout.addWidget(chips_label)

        chips_scroll = QScrollArea()
        chips_scroll.setFixedHeight(40)
        chips_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        chips_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        chips_scroll.setFrameShape(QFrame.NoFrame)

        chips_container = QWidget()
        chips_layout = QHBoxLayout(chips_container)
        chips_layout.setContentsMargins(0, 0, 0, 0)
        chips_layout.setSpacing(8)  # 8px gap

        for chip_label in ["All", "Active", "Archived", "Recent"]:
            chip = QPushButton(chip_label)
            chip.setObjectName("Chip")
            chip.setFixedHeight(32)
            chips_layout.addWidget(chip)

        chips_layout.addStretch(1)
        chips_scroll.setWidget(chips_container)
        content_layout.addWidget(chips_scroll)

        # --- RECENT PROJECTS (responsive grid, 280px min) ---
        projects_label = H2("Recent Projects")
        content_layout.addWidget(projects_label)

        self._projects_container = QWidget()
        self._projects_layout = QGridLayout(self._projects_container)
        self._projects_layout.setContentsMargins(0, 0, 0, 0)
        self._projects_layout.setSpacing(16)  # 16px gap

        content_layout.addWidget(self._projects_container)
        content_layout.addStretch(1)

        scroll.setWidget(content)
        root.addWidget(scroll, 1)

        # --- FAB (fixed bottom-right, 56x56px) ---
        fab_wrapper = QFrame()
        fab_wrapper.setStyleSheet("background: transparent; border: none;")
        fab_layout = QVBoxLayout(fab_wrapper)
        fab_layout.setContentsMargins(24, 0, 24, 24)
        fab_layout.addStretch(1)

        fab_inner_layout = QHBoxLayout()
        fab_inner_layout.setContentsMargins(0, 0, 0, 0)
        fab_inner_layout.addStretch(1)

        self.fab = NeonButton("+", blur_radius=24)
        self.fab.setFixedSize(56, 56)
        self.fab.setStyleSheet(
            f"""
            QPushButton {{
                background: {c.primary};
                border: 1px solid {c.primary};
                border-radius: 28px;
                color: #ffffff;
                font-size: 28pt;
                font-weight: 800;
            }}
            QPushButton:hover {{
                background: {c.primary_hover};
                border-color: {c.primary_hover};
            }}
            """
        )
        self.fab.clicked.connect(self.request_import.emit)
        fab_inner_layout.addWidget(self.fab)

        fab_layout.addLayout(fab_inner_layout)
        root.addWidget(fab_wrapper)

        # Data
        self._projects: list[str] = []
        self._responsive_grid: Optional[ResponsiveGrid] = None

    def set_recents(self, recents: list[str]) -> None:
        """Populate recent projects grid."""
        self._projects = recents

        # Clear layout
        while self._projects_layout.count():
            item = self._projects_layout.takeAt(0)
            if item.widget():
                item.widget().setParent(None)

        if not recents:
            empty_msg = Muted("No recent projects yet. Create or import one to get started.")
            empty_msg.setWordWrap(True)
            self._projects_layout.addWidget(empty_msg, 0, 0)
            return

        # Create cards for each project with fade-in animation (Phase 5)
        project_cards = []
        for idx, project_path in enumerate(recents[:12]):
            card = self._create_project_card(project_path)
            self._projects_layout.addWidget(card)
            project_cards.append(card)
            # Stagger animations slightly for smooth cascade effect
            QTimer.singleShot(idx * 50, lambda c=card: fade_in(c, duration=150))

        # Setup responsive grid (280px min, 3 columns max on large screens) - Phase 5
        if self._responsive_grid is None:
            self._responsive_grid = ResponsiveGrid(
                self._projects_layout, min_col_width=280, max_columns=3
            )
        # Add project cards to responsive grid for tracking
        for card in project_cards:
            self._responsive_grid.add_item(card)

    def resizeEvent(self, event: QResizeEvent) -> None:
        """Phase 5: Handle window resize to update responsive grid columns."""
        super().resizeEvent(event)
        if self._responsive_grid is not None and self._projects:
            # Get the container width (accounting for scrollbar and margins)
            available_width = self.width() - 48  # 24px left + 24px right margin
            self._responsive_grid.update_columns(available_width)

    def _create_quick_action_tile(self, icon_name: str, label: str) -> QWidget:
        """Create a 120x120px quick action tile."""
        tile = QPushButton()
        tile.setFixedSize(120, 120)
        tile.setCursor(Qt.PointingHandCursor)
        tile.setStyleSheet(
            f"""
            QPushButton {{
                background: rgba(24, 16, 35, 0.90);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 16px;
                padding: 0px;
            }}
            QPushButton:hover {{
                border-color: rgba(134,56,250,0.25);
                background: rgba(49, 33, 74, 0.55);
            }}
            """
        )

        layout = QVBoxLayout(tile)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(8)
        layout.setAlignment(Qt.AlignCenter)

        # Icon (40x40px)
        icon = MaterialIcon(icon_name, size_px=40)
        layout.addWidget(icon, 0, Qt.AlignCenter)

        # Label
        text_label = QLabel(label)
        text_label.setStyleSheet("font-size: 10pt; font-weight: 600; color: #ffffff;")
        text_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(text_label, 0, Qt.AlignCenter)

        return tile

    def _create_project_card(self, project_path: str) -> QWidget:
        """Create a project card (280px min, responsive)."""
        card = CardFrame(shadow=True)
        card.setMinimumWidth(280)

        layout = QVBoxLayout(card)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(12)

        # Title
        title = QLabel(Path(project_path).stem)
        title.setStyleSheet("font-size: 12pt; font-weight: 700; color: #ffffff;")
        layout.addWidget(title)

        # Status badge
        status_label = QLabel("Active")
        status_label.setStyleSheet(
            f"""
            color: #22c55e;
            font-size: 9pt;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 6px;
            background: rgba(34, 197, 94, 0.15);
            """
        )
        layout.addWidget(status_label)

        # Path
        path_label = Muted(str(project_path))
        path_label.setWordWrap(True)
        layout.addWidget(path_label)

        layout.addStretch(1)

        # Open button
        open_btn = QPushButton("Open")
        open_btn.setObjectName("Primary")
        open_btn.setFixedHeight(36)
        open_btn.clicked.connect(lambda: self.request_open_project_json.emit(project_path))
        layout.addWidget(open_btn)

        return card
