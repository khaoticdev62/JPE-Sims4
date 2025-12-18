from __future__ import annotations

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QScrollArea,
    QVBoxLayout,
    QWidget,
)

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import (
    CardFrame, H1, H2, MaterialIcon, Muted,
    SearchBar, ChipButton, BadgeLabel, ToggleSwitch
)


class PluginLibraryPage(QWidget):
    """
    Plugin library page aligned to `JPE assets folder/plugin_library_1`.

    This page displays installed plugins with enable/disable controls.
    """

    plugin_detail_requested = Signal(str)  # Plugin ID

    def __init__(self) -> None:
        super().__init__()

        c = DESIGN.colors

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # Header section
        header = QFrame()
        header.setStyleSheet(f"background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 {c.surface}, stop:1 {c.background});")
        header_l = QVBoxLayout(header)
        header_l.setContentsMargins(DESIGN.spacing.xl, DESIGN.spacing.xl, DESIGN.spacing.xl, DESIGN.spacing.xl)
        header_l.setSpacing(DESIGN.spacing.lg)

        # Title and subtitle
        title = H1("Plugin Library")
        title.setStyleSheet("font-weight: 700;")
        header_l.addWidget(title)

        subtitle = Muted("Manage installed plugins and extensions")
        subtitle.setWordWrap(True)
        header_l.addWidget(subtitle)

        # Search and filters
        search_row = QHBoxLayout()
        search_row.setSpacing(DESIGN.spacing.md)

        search = SearchBar(placeholder="Search installed plugins...")
        search_row.addWidget(search, 1)

        # Filter chips
        all_chip = ChipButton("All", active=True)
        enabled_chip = ChipButton("Enabled")
        disabled_chip = ChipButton("Disabled")
        updates_chip = ChipButton("Updates Available")

        search_row.addWidget(all_chip)
        search_row.addWidget(enabled_chip)
        search_row.addWidget(disabled_chip)
        search_row.addWidget(updates_chip)

        header_l.addLayout(search_row)

        root.addWidget(header)

        # Content area
        content = QScrollArea()
        content.setWidgetResizable(True)
        content.setFrameShape(QFrame.NoFrame)
        content.setStyleSheet(f"background: {c.background};")

        content_widget = QWidget()
        content_l = QVBoxLayout(content_widget)
        content_l.setContentsMargins(DESIGN.spacing.xl, DESIGN.spacing.lg, DESIGN.spacing.xl, DESIGN.spacing.xl)
        content_l.setSpacing(DESIGN.spacing.lg)

        # Installed plugins grid
        plugins_grid = QGridLayout()
        plugins_grid.setSpacing(DESIGN.spacing.md)

        installed_plugins = [
            ("Auto-Translator Pro", "Advanced AI-powered translation", "2.4.0", True, False, "verified"),
            ("Theme Engine", "Customize the look and feel", "1.8.2", True, True, "palette"),
            ("Batch Processor", "Process multiple projects at once", "3.1.0", False, False, "bolt"),
            ("TM Manager", "Translation Memory management", "1.5.3", True, True, "memory"),
            ("CSV Tools", "Import/export CSV", "2.0.1", True, False, "import_export"),
            ("Validation Suite", "Advanced validation tools", "1.9.0", False, False, "fact_check"),
        ]

        for i, (name, desc, version, enabled, has_update, icon) in enumerate(installed_plugins):
            row = i // 2
            col = i % 2
            plugin_card = self._create_plugin_card(name, desc, version, enabled, has_update, icon)
            plugins_grid.addWidget(plugin_card, row, col)

        content_l.addLayout(plugins_grid)

        content_l.addStretch(1)
        content.setWidget(content_widget)
        root.addWidget(content, 1)

    def _create_plugin_card(self, name: str, desc: str, version: str, enabled: bool, has_update: bool, icon: str) -> QFrame:
        """Create an installed plugin card."""
        card = CardFrame(shadow=False)
        card_l = QVBoxLayout(card)
        card_l.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg)
        card_l.setSpacing(DESIGN.spacing.md)

        # Top row: icon, name, enable toggle
        top_row = QHBoxLayout()
        top_row.setContentsMargins(0, 0, 0, 0)
        top_row.setSpacing(DESIGN.spacing.md)

        icon_frame = QFrame()
        icon_frame.setFixedSize(44, 44)
        icon_frame.setStyleSheet(f"""
            border-radius: {DESIGN.radius.lg}px;
            background: rgba(157, 92, 255, 0.15);
            border: 1px solid rgba(157, 92, 255, 0.25);
        """)
        icon_l = QHBoxLayout(icon_frame)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon(icon, size_px=22)
        icon_lbl.setStyleSheet("color: #9d5cff;")
        icon_l.addWidget(icon_lbl, 0, Qt.AlignmentFlag.AlignCenter)
        top_row.addWidget(icon_frame)

        name_col = QVBoxLayout()
        name_col.setContentsMargins(0, 0, 0, 0)
        name_col.setSpacing(2)

        name_lbl = QLabel(name)
        name_lbl.setStyleSheet("font-size: 11pt; font-weight: 600;")
        name_col.addWidget(name_lbl)

        # Version and status row
        info_row = QHBoxLayout()
        info_row.setContentsMargins(0, 0, 0, 0)
        info_row.setSpacing(DESIGN.spacing.xs)

        version_lbl = Muted(f"v{version}")
        version_lbl.setStyleSheet("font-size: 9pt; font-family: 'JetBrains Mono';")
        info_row.addWidget(version_lbl)

        # Update badge
        if has_update:
            update_badge = BadgeLabel("UPDATE", variant="warning")
            info_row.addWidget(update_badge)

        # Status badge
        status_badge = BadgeLabel("ENABLED" if enabled else "DISABLED", variant="success" if enabled else "error")
        info_row.addWidget(status_badge)

        name_col.addLayout(info_row)
        top_row.addLayout(name_col, 1)

        # Enable/Disable toggle
        toggle = ToggleSwitch(checked=enabled)
        top_row.addWidget(toggle)

        card_l.addLayout(top_row)

        # Description
        desc_lbl = Muted(desc)
        desc_lbl.setWordWrap(True)
        card_l.addWidget(desc_lbl)

        # Bottom row: actions
        bottom_row = QHBoxLayout()
        bottom_row.setContentsMargins(0, 0, 0, 0)
        bottom_row.setSpacing(DESIGN.spacing.sm)

        # Author
        author_lbl = Muted("JPE Labs")
        author_lbl.setStyleSheet("font-size: 9pt;")
        bottom_row.addWidget(author_lbl)

        bottom_row.addStretch(1)

        # Action buttons
        if has_update:
            update_btn = QPushButton("Update")
            update_btn.setObjectName("Primary")
            update_btn.setFixedHeight(32)
            bottom_row.addWidget(update_btn)

        settings_btn = QPushButton("Settings")
        settings_btn.setObjectName("Chip")
        settings_btn.setFixedHeight(32)
        settings_btn.clicked.connect(lambda: self.plugin_detail_requested.emit(name))
        bottom_row.addWidget(settings_btn)

        uninstall_btn = QPushButton("Uninstall")
        uninstall_btn.setObjectName("Chip")
        uninstall_btn.setFixedHeight(32)
        uninstall_btn.setStyleSheet("color: #ef4444;")
        bottom_row.addWidget(uninstall_btn)

        card_l.addLayout(bottom_row)

        return card
