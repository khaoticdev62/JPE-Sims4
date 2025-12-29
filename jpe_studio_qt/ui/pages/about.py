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
from jpe_studio_qt.ui.components import CardFrame, H1, H2, MaterialIcon, Muted
from jpe_studio_qt.ui.glass_widgets import GlassFrame


class AboutSystemInfoPage(QWidget):
    """
    About / System Info page aligned to `JPE assets folder/about_/_system_info`.
    
    This page displays application information, system details, and licensing info.
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
        header_l.setSpacing(12)

        # App logo and title
        app_row = QHBoxLayout()
        app_row.setContentsMargins(0, 0, 0, 0)
        app_row.setSpacing(16)

        logo = QFrame()
        logo.setFixedSize(64, 64)
        logo.setStyleSheet("""
            border-radius: 16px;
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 #8638fa, stop:1 #6d28d9);
        """)
        logo_l = QHBoxLayout(logo)
        logo_l.setContentsMargins(0, 0, 0, 0)
        logo_lbl = QLabel("JPE")
        logo_lbl.setAlignment(Qt.AlignCenter)
        logo_lbl.setStyleSheet("font-size: 20pt; font-weight: 800; color: white;")
        logo_l.addWidget(logo_lbl)
        app_row.addWidget(logo)

        title_col = QVBoxLayout()
        title_col.setContentsMargins(0, 0, 0, 0)
        title_col.setSpacing(4)

        app_title = H1("JPE Studio")
        app_title.setStyleSheet("font-size: 24pt; font-weight: 800;")
        title_col.addWidget(app_title)

        app_subtitle = Muted("SIMS 4 Translation Suite")
        app_subtitle.setStyleSheet("font-size: 12pt;")
        title_col.addWidget(app_subtitle)

        app_row.addLayout(title_col)
        app_row.addStretch(1)

        header_l.addLayout(app_row)

        # Version info
        version_row = QHBoxLayout()
        version_row.setSpacing(8)

        version_lbl = QLabel("Version 2.4.0")
        version_lbl.setStyleSheet("font-size: 11pt; font-weight: 600;")

        pro_badge = QLabel("PRO")
        pro_badge.setStyleSheet("""
            font-size: 8pt;
            font-weight: 800;
            letter-spacing: 1px;
            padding: 3px 8px;
            border-radius: 6px;
            background: rgba(134,56,250,0.18);
            color: #8638fa;
            border: 1px solid rgba(134,56,250,0.15);
        """)

        version_row.addWidget(version_lbl)
        version_row.addWidget(pro_badge)
        version_row.addStretch(1)

        header_l.addLayout(version_row)

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

        # License info
        license_section = self._create_info_section("License Information", self._create_license_content())
        content_l.addWidget(license_section)

        # System info
        system_section = self._create_info_section("System Information", self._create_system_content())
        content_l.addWidget(system_section)

        # Application info
        app_section = self._create_info_section("Application Info", self._create_app_content())
        content_l.addWidget(app_section)

        # Links section
        links_section = self._create_info_section("Links & Resources", self._create_links_content())
        content_l.addWidget(links_section)

        # Footer
        footer = self._create_footer()
        content_l.addWidget(footer)

        content_l.addStretch(1)
        content.setWidget(content_widget)
        root.addWidget(content, 1)

    def _create_info_section(self, title: str, content_widget: QWidget) -> QFrame:
        """Create an info section with title and content."""
        section = CardFrame(shadow=False)
        section_l = QVBoxLayout(section)
        section_l.setContentsMargins(16, 16, 16, 16)
        section_l.setSpacing(12)

        title_lbl = H2(title)
        title_lbl.setStyleSheet("font-weight: 600;")
        section_l.addWidget(title_lbl)

        section_l.addWidget(content_widget)

        return section

    def _create_license_content(self) -> QWidget:
        """Create license information content."""
        container = QWidget()
        container_l = QGridLayout(container)
        container_l.setSpacing(10)

        license_items = [
            ("License Type", "Commercial Pro License"),
            ("License ID", "JPE-PRO-2023-7F3A9C"),
            ("Valid Until", "Perpetual"),
            ("Licensed To", "DevUser_01"),
            ("Activation Status", "Active")
        ]

        for i, (label, value) in enumerate(license_items):
            label_lbl = QLabel(label)
            label_lbl.setStyleSheet("font-weight: 600; color: rgba(255,255,255,0.7);")
            value_lbl = QLabel(value)
            value_lbl.setStyleSheet("font-family: 'JetBrains Mono';")

            container_l.addWidget(label_lbl, i, 0)
            container_l.addWidget(value_lbl, i, 1)

        return container

    def _create_system_content(self) -> QWidget:
        """Create system information content."""
        container = QWidget()
        container_l = QGridLayout(container)
        container_l.setSpacing(10)

        system_items = [
            ("OS", "Windows 10/11"),
            ("Python Version", "3.11+"),
            ("Qt Version", "PySide6"),
            ("Memory", "Available: 8GB+"),
            ("Storage", "500MB free space")
        ]

        for i, (label, value) in enumerate(system_items):
            label_lbl = QLabel(label)
            label_lbl.setStyleSheet("font-weight: 600; color: rgba(255,255,255,0.7);")
            value_lbl = QLabel(value)
            value_lbl.setStyleSheet("font-family: 'JetBrains Mono';")

            container_l.addWidget(label_lbl, i, 0)
            container_l.addWidget(value_lbl, i, 1)

        return container

    def _create_app_content(self) -> QWidget:
        """Create application information content."""
        container = QWidget()
        container_l = QGridLayout(container)
        container_l.setSpacing(10)

        app_items = [
            ("Build Date", "2023-12-18"),
            ("Git Commit", "abc123def456"),
            ("Dependencies", "Updated"),
            ("Cache Location", "C:\\Users\\...\\AppData\\..."),
            ("Config Location", "C:\\Users\\...\\.config\\jpe")
        ]

        for i, (label, value) in enumerate(app_items):
            label_lbl = QLabel(label)
            label_lbl.setStyleSheet("font-weight: 600; color: rgba(255,255,255,0.7);")
            value_lbl = QLabel(value)
            value_lbl.setStyleSheet("font-family: 'JetBrains Mono';")

            container_l.addWidget(label_lbl, i, 0)
            container_l.addWidget(value_lbl, i, 1)

        return container

    def _create_links_content(self) -> QWidget:
        """Create links and resources content."""
        container = QFrame()
        container_l = QGridLayout(container)
        container_l.setSpacing(12)

        links = [
            ("Website", "https://jpe-suite.com", "language"),
            ("Documentation", "https://docs.jpe-suite.com", "menu_book"),
            ("Community", "https://community.jpe-suite.com", "forum"),
            ("Support", "support@jpe-suite.com", "email"),
            ("GitHub", "https://github.com/jpe-suite", "code"),
            ("Privacy Policy", "https://jpe-suite.com/privacy", "gavel")
        ]

        for i, (name, url, icon) in enumerate(links):
            row = i // 2
            col = i % 2

            link_card = self._create_link_card(name, url, icon)
            container_l.addWidget(link_card, row, col)

        return container

    def _create_link_card(self, name: str, url: str, icon: str) -> QFrame:
        """Create a link card."""
        card = CardFrame(shadow=False)
        card_l = QHBoxLayout(card)
        card_l.setContentsMargins(12, 12, 12, 12)
        card_l.setSpacing(10)

        icon_lbl = MaterialIcon(icon, size_px=20)
        icon_lbl.setStyleSheet("color: #8638fa;")
        card_l.addWidget(icon_lbl)

        text_col = QVBoxLayout()
        text_col.setContentsMargins(0, 0, 0, 0)
        text_col.setSpacing(2)

        name_lbl = QLabel(name)
        name_lbl.setStyleSheet("font-weight: 600;")
        text_col.addWidget(name_lbl)

        url_lbl = Muted(url)
        url_lbl.setStyleSheet("font-size: 9pt; font-family: 'JetBrains Mono';")
        text_col.addWidget(url_lbl)

        card_l.addLayout(text_col, 1)

        arrow = MaterialIcon("open_in_new", size_px=16)
        arrow.setStyleSheet("color: rgba(255,255,255,0.4);")
        card_l.addWidget(arrow)

        return card

    def _create_footer(self) -> QFrame:
        """Create the footer with copyright and action buttons."""
        footer = QFrame()
        footer_l = QHBoxLayout(footer)
        footer_l.setContentsMargins(0, 24, 0, 0)
        footer_l.setSpacing(12)

        copyright_lbl = Muted("© 2023 JPE Studio. All rights reserved.")
        copyright_lbl.setStyleSheet("font-size: 10pt;")
        footer_l.addWidget(copyright_lbl)

        footer_l.addStretch(1)

        # Action buttons
        privacy_btn = QPushButton("Privacy Policy")
        privacy_btn.setObjectName("Chip")
        privacy_btn.setFixedHeight(32)

        terms_btn = QPushButton("Terms of Service")
        terms_btn.setObjectName("Chip")
        terms_btn.setFixedHeight(32)

        license_btn = QPushButton("License Details")
        license_btn.setObjectName("Chip")
        license_btn.setFixedHeight(32)

        footer_l.addWidget(privacy_btn)
        footer_l.addWidget(terms_btn)
        footer_l.addWidget(license_btn)

        return footer