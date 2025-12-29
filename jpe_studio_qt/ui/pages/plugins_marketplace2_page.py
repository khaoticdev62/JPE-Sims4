from __future__ import annotations

from PySide6.QtCore import Qt
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
from jpe_studio_qt.ui.components import CardFrame, H1, H2, MaterialIcon, Muted, SearchBar, ChipButton, BadgeLabel
from jpe_studio_qt.ui.glass_widgets import GlassFrame


class PluginsMarketplace2Page(QWidget):
    """
    Plugin marketplace page aligned to `JPE assets folder/plugin_marketplace_2`.
    
    This page displays available plugins for installation and management.
    """

    def __init__(self) -> None:
        super().__init__()

        c = DESIGN.colors

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # Header section with glass-morphism effect
        header = GlassFrame()  # Glass-morphism header (Phase 4)
        header.setFixedHeight(64)  # Stitch spec: Header 64px
        header.setStyleSheet(f"background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 {c.surface}, stop:1 {c.background});")
        header_l = QVBoxLayout(header)
        header_l.setContentsMargins(24, 24, 24, 24)
        header_l.setSpacing(16)

        # Title and subtitle
        title = H1("Plugin Marketplace")
        title.setStyleSheet("font-weight: 700;")
        header_l.addWidget(title)

        subtitle = Muted("Extend JPE Studio functionality with plugins")
        subtitle.setWordWrap(True)
        header_l.addWidget(subtitle)

        # Search and filters
        search_row = QHBoxLayout()
        search_row.setSpacing(12)

        search = SearchBar(placeholder="Search plugins...")
        search_row.addWidget(search, 1)

        # Filter chips
        all_chip = ChipButton("All", active=True)
        installed_chip = ChipButton("Installed")
        updates_chip = ChipButton("Updates")

        search_row.addWidget(all_chip)
        search_row.addWidget(installed_chip)
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
        content_l.setContentsMargins(24, 18, 24, 24)
        content_l.setSpacing(18)

        # Categories
        categories_row = QHBoxLayout()
        categories_row.setSpacing(DESIGN.spacing.md)

        categories = ["All", "Translation", "Validation", "Export", "Utility", "Theme"]
        for cat in categories:
            chip = ChipButton(cat, active=(cat == "All"))
            categories_row.addWidget(chip)

        categories_row.addStretch(1)
        content_l.addLayout(categories_row)

        # Featured plugins section
        featured_section = self._create_section("Featured Plugins", self._create_featured_content())
        content_l.addWidget(featured_section)

        # All plugins section
        all_section = self._create_section("All Plugins", self._create_all_plugins_content())
        content_l.addWidget(all_section)

        content_l.addStretch(1)
        content.setWidget(content_widget)
        root.addWidget(content, 1)

    def set_project(self, project: object) -> None:
        """Set the current project context (for wiring with MainWindow)."""
        # Store project for future use when plugin features are fully implemented
        self._project = project
        # Current implementation shows marketplace plugins; in future will show project-specific plugins

    def _create_section(self, title: str, content_widget: QWidget) -> QFrame:
        """Create a section with title and content."""
        section = QFrame()
        section_l = QVBoxLayout(section)
        section_l.setContentsMargins(0, 0, 0, 0)
        section_l.setSpacing(12)

        title_row = QHBoxLayout()
        title_row.setContentsMargins(0, 0, 0, 0)
        title_lbl = H2(title)
        title_lbl.setStyleSheet("font-weight: 600;")
        title_row.addWidget(title_lbl)
        title_row.addStretch(1)
        section_l.addLayout(title_row)

        section_l.addWidget(content_widget)

        return section

    def _create_featured_content(self) -> QWidget:
        """Create featured plugins content."""
        container = QFrame()
        container_l = QGridLayout(container)
        container_l.setSpacing(14)

        featured_plugins = [
            ("Auto-Translator Pro", "Advanced AI-powered translation", "4.9", "2.1M", "verified", "success"),
            ("Theme Engine", "Customize the look and feel of JPE Studio", "4.7", "1.8M", "palette", "info"),
            ("Batch Processor", "Process multiple projects at once", "4.5", "890K", "bolt", "primary")
        ]

        for i, (name, desc, rating, downloads, icon, badge_variant) in enumerate(featured_plugins):
            plugin_card = self._create_plugin_card(name, desc, rating, downloads, icon, badge_variant, featured=True)
            container_l.addWidget(plugin_card, i // 1, i % 1)  # Single row layout

        return container

    def _create_all_plugins_content(self) -> QWidget:
        """Create all plugins content."""
        container = QFrame()
        container_l = QGridLayout(container)
        container_l.setSpacing(14)

        all_plugins = [
            ("TM Manager", "Translation Memory management", "4.8", "1.2M", "memory", "info", False),
            ("CSV Tools", "Import/export CSV for external translation", "4.6", "950K", "import_export", "primary", False),
            ("Validation Suite", "Advanced validation tools", "4.9", "750K", "fact_check", "success", False),
            ("Backup Manager", "Automated backup solutions", "4.4", "620K", "backup", "info", True),
            ("Glossary Pro", "Advanced glossary management", "4.7", "880K", "menu_book", "primary", False),
            ("Regex Tools", "Advanced pattern matching", "4.3", "450K", "code", "warning", False),
        ]

        for i, (name, desc, rating, downloads, icon, badge_variant, installed) in enumerate(all_plugins):
            row = i // 2
            col = i % 2
            plugin_card = self._create_plugin_card(name, desc, rating, downloads, icon, badge_variant, installed=installed)
            container_l.addWidget(plugin_card, row, col)

        return container

    def _create_plugin_card(self, name: str, desc: str, rating: str, downloads: str, icon: str, badge_variant: str, featured: bool = False, installed: bool = False) -> QFrame:
        """Create a plugin card."""
        card = CardFrame(shadow=False)
        card_l = QVBoxLayout(card)
        card_l.setContentsMargins(16, 16, 16, 16)
        card_l.setSpacing(12)

        # Top row: icon, name, rating
        top_row = QHBoxLayout()
        top_row.setContentsMargins(0, 0, 0, 0)
        top_row.setSpacing(12)

        icon_frame = QFrame()
        icon_frame.setFixedSize(44, 44)
        icon_frame.setStyleSheet(f"""
            border-radius: 14px;
            background: rgba({self._get_color_for_variant(badge_variant)}, 0.15);
            border: 1px solid rgba({self._get_color_for_variant(badge_variant)}, 0.25);
        """)
        icon_l = QHBoxLayout(icon_frame)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon(icon, size_px=22)
        icon_lbl.setStyleSheet(f"color: {self._get_color_for_variant(badge_variant)};")
        icon_l.addWidget(icon_lbl, 0, Qt.AlignCenter)
        top_row.addWidget(icon_frame)

        name_col = QVBoxLayout()
        name_col.setContentsMargins(0, 0, 0, 0)
        name_col.setSpacing(2)

        name_lbl = QLabel(name)
        name_lbl.setStyleSheet("font-size: 11pt; font-weight: 600;")
        name_col.addWidget(name_lbl)

        # Rating and downloads
        info_row = QHBoxLayout()
        info_row.setContentsMargins(0, 0, 0, 0)
        info_row.setSpacing(8)

        rating_frame = QFrame()
        rating_frame.setStyleSheet("""
            border-radius: 6px;
            background: rgba(255,255,255,0.08);
            padding: 2px 6px;
        """)
        rating_l = QHBoxLayout(rating_frame)
        rating_l.setContentsMargins(2, 2, 2, 2)
        rating_l.setSpacing(4)
        rating_icon = MaterialIcon("star", size_px=12)
        rating_icon.setStyleSheet("color: #eab308;")
        rating_lbl = QLabel(rating)
        rating_lbl.setStyleSheet("font-size: 9pt; color: #eab308;")
        rating_l.addWidget(rating_icon)
        rating_l.addWidget(rating_lbl)
        info_row.addWidget(rating_frame)

        downloads_lbl = Muted(f"{downloads} downloads")
        downloads_lbl.setStyleSheet("font-size: 9pt;")
        info_row.addWidget(downloads_lbl)

        name_col.addLayout(info_row)
        top_row.addLayout(name_col, 1)

        # Featured badge
        if featured:
            featured_badge = BadgeLabel("FEATURED", variant="info")
            top_row.addWidget(featured_badge)

        card_l.addLayout(top_row)

        # Description
        desc_lbl = Muted(desc)
        desc_lbl.setWordWrap(True)
        card_l.addWidget(desc_lbl)

        # Bottom row: author, tags, action button
        bottom_row = QHBoxLayout()
        bottom_row.setContentsMargins(0, 0, 0, 0)
        bottom_row.setSpacing(10)

        author_lbl = Muted("JPE Labs")
        author_lbl.setStyleSheet("font-size: 9pt;")
        bottom_row.addWidget(author_lbl)

        bottom_row.addStretch(1)

        # Action button (Install/Update/Manage)
        if installed:
            action_btn = QPushButton("Manage")
            action_btn.setObjectName("Chip")
        else:
            action_btn = QPushButton("Install")
            action_btn.setObjectName("Primary")
        
        action_btn.setFixedHeight(32)
        bottom_row.addWidget(action_btn)

        card_l.addLayout(bottom_row)

        return card

    def _get_color_for_variant(self, variant: str) -> str:
        """Get RGB color values based on variant (for rgba() usage)."""
        if variant == "success":
            return "34, 197, 94"  # #22c55e
        elif variant == "warning":
            return "234, 179, 8"  # #eab308
        elif variant == "error":
            return "239, 68, 68"  # #ef4444
        elif variant == "info":
            return "76, 201, 240"  # #4cc9f0
        else:  # primary
            return "134, 56, 250"  # #8638fa