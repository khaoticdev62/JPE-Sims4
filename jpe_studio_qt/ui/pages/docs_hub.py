from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QScrollArea,
    QVBoxLayout,
    QWidget,
)

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import CardFrame, H1, H2, MaterialIcon, Muted, SearchBar
from jpe_studio_qt.ui.glass_widgets import GlassFrame


class DocsHubPage(QWidget):
    """
    Documentation hub page aligned to `JPE assets folder/help_&_docs_hub`.
    
    This page provides access to documentation, tutorials, and help resources.
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
        header_l.setSpacing(18)

        # Title and subtitle
        title = H1("Documentation Hub")
        title.setStyleSheet("font-weight: 700;")
        header_l.addWidget(title)

        subtitle = Muted("Find guides, tutorials, and help resources for JPE Studio")
        subtitle.setWordWrap(True)
        header_l.addWidget(subtitle)

        # Search bar
        search = SearchBar(placeholder="Search documentation...")
        header_l.addWidget(search)

        root.addWidget(header)

        # Content area
        content = QFrame()
        content.setStyleSheet(f"background: {c.background};")
        content_l = QVBoxLayout(content)
        content_l.setContentsMargins(24, 18, 24, 24)
        content_l.setSpacing(18)

        # Quick start section
        quick_start = self._create_section("Quick Start", self._create_quick_start_content())
        content_l.addWidget(quick_start)

        # Tutorials grid
        tutorials_section = self._create_section("Tutorials", self._create_tutorials_content())
        content_l.addWidget(tutorials_section)

        # Resource categories
        resources_section = self._create_section("Resources", self._create_resources_content())
        content_l.addWidget(resources_section)

        # Support section
        support_section = self._create_section("Support", self._create_support_content())
        content_l.addWidget(support_section)

        root.addWidget(content, 1)

    def _create_section(self, title: str, content_widget: QWidget) -> QFrame:
        """Create a section with title and content."""
        section = QFrame()
        section_l = QVBoxLayout(section)
        section_l.setContentsMargins(0, 0, 0, 0)
        section_l.setSpacing(12)

        title_lbl = H2(title)
        title_lbl.setStyleSheet("font-weight: 600;")
        section_l.addWidget(title_lbl)

        section_l.addWidget(content_widget)

        return section

    def _create_quick_start_content(self) -> QWidget:
        """Create quick start content."""
        container = QFrame()
        container_l = QGridLayout(container)
        container_l.setSpacing(14)

        quick_items = [
            ("Import Project", "folder_open", "Learn how to import your first project"),
            ("Translation Workflow", "translate", "Understand the translation process"),
            ("Build & Export", "build", "Create your translated mod package"),
            ("Plugin System", "extension", "Extend functionality with plugins")
        ]

        for i, (title, icon, desc) in enumerate(quick_items):
            card = self._create_doc_card(title, icon, desc)
            row = i // 2
            col = i % 2
            container_l.addWidget(card, row, col)

        return container

    def _create_tutorials_content(self) -> QWidget:
        """Create tutorials content."""
        container = QFrame()
        container_l = QGridLayout(container)
        container_l.setSpacing(14)

        tutorials = [
            ("Getting Started", "play_circle", "5 min read"),
            ("Advanced Translation", "school", "12 min read"),
            ("Quality Assurance", "verified", "8 min read"),
            ("Collaboration", "groups", "10 min read")
        ]

        for i, (title, icon, duration) in enumerate(tutorials):
            card = self._create_tutorial_card(title, icon, duration)
            row = i // 2
            col = i % 2
            container_l.addWidget(card, row, col)

        return container

    def _create_resources_content(self) -> QWidget:
        """Create resources content."""
        container = QFrame()
        container_l = QGridLayout(container)
        container_l.setSpacing(14)

        resources = [
            ("API Reference", "code", "Technical documentation"),
            ("UI Guidelines", "design_services", "Design system documentation"),
            ("Troubleshooting", "help_center", "Common issues and solutions"),
            ("Release Notes", "new_releases", "Recent updates")
        ]

        for i, (title, icon, desc) in enumerate(resources):
            card = self._create_resource_card(title, icon, desc)
            row = i // 2
            col = i % 2
            container_l.addWidget(card, row, col)

        return container

    def _create_support_content(self) -> QWidget:
        """Create support content."""
        container = QFrame()
        container_l = QHBoxLayout(container)
        container_l.setSpacing(14)

        contact_card = self._create_support_card("contact_support", "Contact Support", "Get help from our team")
        community_card = self._create_support_card("forum", "Community Forum", "Connect with other translators")
        feedback_card = self._create_support_card("feedback", "Send Feedback", "Help us improve JPE Studio")

        container_l.addWidget(contact_card)
        container_l.addWidget(community_card)
        container_l.addWidget(feedback_card)

        return container

    def _create_doc_card(self, title: str, icon: str, description: str) -> QFrame:
        """Create a documentation card."""
        card = CardFrame(shadow=False)
        card_l = QVBoxLayout(card)
        card_l.setContentsMargins(16, 16, 16, 16)
        card_l.setSpacing(12)

        # Icon and title row
        top_row = QHBoxLayout()
        top_row.setContentsMargins(0, 0, 0, 0)
        top_row.setSpacing(12)

        icon_frame = QFrame()
        icon_frame.setFixedSize(40, 40)
        icon_frame.setStyleSheet("""
            border-radius: 12px;
            background: rgba(134, 56, 250, 0.15);
            border: 1px solid rgba(134, 56, 250, 0.25);
        """)
        icon_l = QHBoxLayout(icon_frame)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon(icon, size_px=20)
        icon_lbl.setStyleSheet("color: #8638fa;")
        icon_l.addWidget(icon_lbl, 0, Qt.AlignCenter)
        top_row.addWidget(icon_frame)

        title_lbl = QLabel(title)
        title_lbl.setStyleSheet("font-size: 12pt; font-weight: 600;")
        top_row.addWidget(title_lbl, 1)

        card_l.addLayout(top_row)

        # Description
        desc_lbl = Muted(description)
        desc_lbl.setWordWrap(True)
        card_l.addWidget(desc_lbl)

        # Link arrow
        arrow_row = QHBoxLayout()
        arrow_row.addStretch(1)
        arrow = MaterialIcon("chevron_right", size_px=20)
        arrow.setStyleSheet("color: rgba(255,255,255,0.4);")
        arrow_row.addWidget(arrow)
        card_l.addLayout(arrow_row)

        return card

    def _create_tutorial_card(self, title: str, icon: str, duration: str) -> QFrame:
        """Create a tutorial card."""
        card = CardFrame(shadow=False)
        card_l = QVBoxLayout(card)
        card_l.setContentsMargins(16, 16, 16, 16)
        card_l.setSpacing(10)

        # Icon
        icon_frame = QFrame()
        icon_frame.setFixedSize(44, 44)
        icon_frame.setStyleSheet("""
            border-radius: 14px;
            background: rgba(76, 201, 240, 0.15);
            border: 1px solid rgba(76, 201, 240, 0.25);
        """)
        icon_l = QHBoxLayout(icon_frame)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon(icon, size_px=22)
        icon_lbl.setStyleSheet("color: #4cc9f0;")
        icon_l.addWidget(icon_lbl, 0, Qt.AlignCenter)
        card_l.addWidget(icon_frame, 0, Qt.AlignLeft)

        # Title
        title_lbl = QLabel(title)
        title_lbl.setStyleSheet("font-size: 11pt; font-weight: 600;")
        card_l.addWidget(title_lbl)

        # Duration
        duration_lbl = Muted(duration)
        duration_lbl.setStyleSheet("font-size: 9pt;")
        card_l.addWidget(duration_lbl)

        # Progress bar (example)
        progress_container = QFrame()
        progress_container.setFixedHeight(6)
        progress_container.setStyleSheet("border-radius: 3px; background: rgba(255,255,255,0.05);")
        progress_l = QHBoxLayout(progress_container)
        progress_l.setContentsMargins(0, 0, 0, 0)

        progress_fill = QFrame()
        progress_fill.setStyleSheet("border-radius: 3px; background: #4cc9f0; max-width: 30%;")
        progress_l.addWidget(progress_fill)

        card_l.addWidget(progress_container)

        return card

    def _create_resource_card(self, title: str, icon: str, description: str) -> QFrame:
        """Create a resource card."""
        card = CardFrame(shadow=False)
        card_l = QVBoxLayout(card)
        card_l.setContentsMargins(16, 16, 16, 16)
        card_l.setSpacing(8)

        # Title
        title_lbl = QLabel(title)
        title_lbl.setStyleSheet("font-size: 11pt; font-weight: 600;")
        card_l.addWidget(title_lbl)

        # Icon and description
        content_row = QHBoxLayout()
        content_row.setSpacing(10)

        icon_lbl = MaterialIcon(icon, size_px=18)
        icon_lbl.setStyleSheet("color: rgba(255,255,255,0.5);")
        content_row.addWidget(icon_lbl)

        desc_lbl = Muted(description)
        desc_lbl.setWordWrap(True)
        desc_lbl.setStyleSheet("font-size: 10pt;")
        content_row.addWidget(desc_lbl, 1)
        content_row.addStretch(1)

        card_l.addLayout(content_row)

        # Link arrow
        arrow_row = QHBoxLayout()
        arrow_row.addStretch(1)
        arrow = MaterialIcon("open_in_new", size_px=16)
        arrow.setStyleSheet("color: rgba(255,255,255,0.4);")
        arrow_row.addWidget(arrow)
        card_l.addLayout(arrow_row)

        return card

    def _create_support_card(self, icon: str, title: str, description: str) -> QFrame:
        """Create a support card."""
        card = CardFrame(shadow=False)
        card_l = QVBoxLayout(card)
        card_l.setContentsMargins(16, 16, 16, 16)
        card_l.setSpacing(12)

        # Icon
        icon_frame = QFrame()
        icon_frame.setFixedSize(40, 40)
        icon_frame.setStyleSheet("""
            border-radius: 12px;
            background: rgba(234, 179, 8, 0.15);
            border: 1px solid rgba(234, 179, 8, 0.25);
        """)
        icon_l = QHBoxLayout(icon_frame)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon(icon, size_px=20)
        icon_lbl.setStyleSheet("color: #eab308;")
        icon_l.addWidget(icon_lbl, 0, Qt.AlignCenter)
        card_l.addWidget(icon_frame)

        # Title
        title_lbl = QLabel(title)
        title_lbl.setStyleSheet("font-size: 11pt; font-weight: 600;")
        card_l.addWidget(title_lbl)

        # Description
        desc_lbl = Muted(description)
        desc_lbl.setWordWrap(True)
        card_l.addWidget(desc_lbl)

        return card