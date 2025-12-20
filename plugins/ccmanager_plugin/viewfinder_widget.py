"""
Viewfinder Widget for CC Manager Plugin.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

from PySide6.QtCore import Qt
from PySide6.QtGui import QPixmap
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QScrollArea, QFrame, QGridLayout
)

from jpe_studio_qt.design_tokens import COLORS, SPACING, RADIUS
from jpe_studio_qt.ui.components import CardFrame, BadgeLabel, H2, Muted, PropertiesTable
from jpe_studio_qt.ui.code_editor import CodeEditor

from .file_indexer import CCRecord

logger = logging.getLogger(__name__)


class ViewfinderWidget(QFrame):
    """
    Preview pane for CC records.
    """

    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self.setStyleSheet(f"background: {COLORS.bg_0};")
        self._build_ui()

    def _build_ui(self) -> None:
        """Construct preview layout."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        scroll.setStyleSheet("background: transparent; border: none;")
        
        self.content = QWidget()
        self.content_layout = QVBoxLayout(self.content)
        self.content_layout.setContentsMargins(SPACING.xl, SPACING.xl, SPACING.xl, SPACING.xl)
        self.content_layout.setSpacing(SPACING.lg)
        
        # Header Area
        self.header_card = CardFrame(shadow=False)
        h_layout = QVBoxLayout(self.header_card)
        
        self.title_lbl = H2("Select a Mod")
        h_layout.addWidget(self.title_lbl)
        
        self.creator_lbl = Muted("Creator Unknown")
        h_layout.addWidget(self.creator_lbl)
        
        self.badge_layout = QHBoxLayout()
        self.badge_layout.setSpacing(SPACING.xs)
        h_layout.addLayout(self.badge_layout)
        
        self.content_layout.addWidget(self.header_card)
        
        # Thumbnail Preview
        self.thumb_card = CardFrame(shadow=True)
        self.thumb_card.setFixedSize(260, 200)
        t_layout = QVBoxLayout(self.thumb_card)
        t_layout.setContentsMargins(0, 0, 0, 0)
        
        self.thumb_lbl = QLabel()
        self.thumb_lbl.setAlignment(Qt.AlignCenter)
        self.thumb_lbl.setStyleSheet("border-radius: 8px;")
        t_layout.addWidget(self.thumb_lbl)
        
        self.content_layout.addWidget(self.thumb_card, 0, Qt.AlignCenter)
        
        # Metadata Table
        self.props_container = QWidget()
        self.props_layout = QVBoxLayout(self.props_container)
        self.props_layout.setContentsMargins(0, 0, 0, 0)
        self.content_layout.addWidget(self.props_container)
        
        # File Preview
        self.content_layout.addWidget(QLabel("File Content Preview"))
        self.editor = CodeEditor()
        self.editor.setMinimumHeight(300)
        self.editor.setReadOnly(True)
        self.content_layout.addWidget(self.editor)
        
        self.content_layout.addStretch(1)
        
        scroll.setWidget(self.content)
        layout.addWidget(scroll)

    def set_cc_record(self, record: Optional[CCRecord]) -> None:
        """Update display for selected CC."""
        if not record:
            self.title_lbl.setText("Select a Mod")
            self.creator_lbl.setText("Creator Unknown")
            self.thumb_lbl.clear()
            self._clear_badges()
            self._clear_props()
            self.editor.clear()
            return
            
        self.title_lbl.setText(record.name)
        self.creator_lbl.setText(f"By {record.creator or 'Unknown'}")
        
        # Badges
        self._clear_badges()
        self.badge_layout.addWidget(BadgeLabel(record.category, variant="primary"))
        if record.tags:
            for tag in record.tags[:3]:
                self.badge_layout.addWidget(BadgeLabel(tag, variant="info"))
        self.badge_layout.addStretch(1)
        
        # Thumbnail
        if hasattr(record, "thumbnail_path") and record.thumbnail_path:
            pix = QPixmap(record.thumbnail_path)
            if not pix.isNull():
                self.thumb_lbl.setPixmap(pix.scaled(260, 200, Qt.KeepAspectRatio, Qt.SmoothTransformation))
            else:
                self.thumb_lbl.setText("No Preview")
        else:
            self.thumb_lbl.setText("No Preview")
            
        # Metadata
        self._populate_metadata_table(record)
        
        # Preview first text file if available
        self._preview_file(record)

    def _clear_badges(self) -> None:
        while self.badge_layout.count():
            item = self.badge_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

    def _clear_props(self) -> None:
        while self.props_layout.count():
            item = self.props_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

    def _populate_metadata_table(self, record: CCRecord) -> None:
        self._clear_props()
        
        props = {
            "Creator": record.creator or "Unknown",
            "Category": record.category,
            "Size": f"{record.total_size / 1024 / 1024:.2f} MB",
            "Files": str(len(record.files)),
            "Modified": record.last_modified[:10] if record.last_modified else "N/A"
        }
        
        self.props_table = PropertiesTable(props)
        self.props_layout.addWidget(self.props_table)

    def _preview_file(self, record: CCRecord) -> None:
        """Display file content (text files only)."""
        # Search for a text-like file
        self.editor.clear()
        
        # Simulation: in a real app we'd check if file is text/xml/jpe
        pass
