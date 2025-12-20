"""
Main UI for CC Manager Plugin.
"""

from __future__ import annotations

import logging
from typing import Optional, Dict, List

from PySide6.QtCore import Qt, Signal, Slot
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QSplitter, QTreeView, 
    QLabel, QPushButton, QFrame, QHeaderView
)

from jpe_studio_qt.design_tokens import COLORS, SPACING, RADIUS
from jpe_studio_qt.ui.components import SearchBar, FilterChipsRow, CardFrame, H2, Muted

from .file_indexer import CCFileIndexer, CCRecord
from .cc_model import CCManagerModel
from .metadata_extractor import MetadataExtractor
from .viewfinder_widget import ViewfinderWidget

logger = logging.getLogger(__name__)


class CCBrowserUI(QWidget):
    """
    Main UI widget for CC Manager using virtualized QTreeView.
    """

    def __init__(self, plugin: object, parent: Optional[QWidget] = None) -> None:
        super().__init__(parent)
        self.plugin = plugin # CCManagerPlugin instance
        self.config = getattr(plugin, "config", None)
        
        self.indexer = CCFileIndexer(self.config.cc_paths if self.config else [])
        self.extractor = MetadataExtractor(self.config.metadata_sources if self.config else [])
        self.records: Dict[str, CCRecord] = {}
        
        # Performance Overhaul: Custom Model
        self.model = CCManagerModel(self)
        
        self._build_ui()
        self._load_cc_index()

    def _build_ui(self) -> None:
        """Construct the layout."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Header
        layout.addLayout(self._build_header())
        
        # Main Splitter
        self.splitter = QSplitter(Qt.Horizontal)
        self.splitter.setHandleWidth(4)
        self.splitter.setStyleSheet(f"QSplitter::handle {{ background: {COLORS.stroke_0}; }}")
        
        # Left Panel (Browser)
        self.browser_panel = self._build_browser_panel()
        self.splitter.addWidget(self.browser_panel)
        
        # Right Panel (Viewfinder)
        self.viewfinder = ViewfinderWidget(self)
        self.splitter.addWidget(self.viewfinder)
        
        self.splitter.setSizes([280, 720])
        layout.addWidget(self.splitter, 1)
        
        # Status Bar
        layout.addLayout(self._build_status_bar())

    def _build_header(self) -> QHBoxLayout:
        """Create header with buttons."""
        header = QHBoxLayout()
        header.setContentsMargins(SPACING.xl, SPACING.md, SPACING.xl, SPACING.md)
        
        title = H2("CC Manager")
        header.addWidget(title)
        
        header.addStretch(1)
        
        self.refresh_btn = QPushButton("Refresh")
        self.refresh_btn.setObjectName("Primary")
        self.refresh_btn.clicked.connect(self._refresh_index)
        header.addWidget(self.refresh_btn)
        
        return header

    def _build_browser_panel(self) -> QFrame:
        """Create left panel with virtualized tree view."""
        panel = QFrame()
        panel.setFixedWidth(280)
        panel.setStyleSheet(f"background: {COLORS.bg_1}; border-right: 1px solid {COLORS.stroke_0};")
        
        layout = QVBoxLayout(panel)
        layout.setContentsMargins(SPACING.md, SPACING.md, SPACING.md, SPACING.md)
        layout.setSpacing(SPACING.md)
        
        # Search
        self.search_bar = SearchBar(placeholder="Search mods...")
        self.search_bar.textChanged.connect(self._on_search_changed)
        layout.addWidget(self.search_bar)
        
        # Categories
        self.filter_row = FilterChipsRow(["All", "CAS", "BuildBuy", "Gameplay", "Other"], active_chip="All")
        self.filter_row.chip_clicked.connect(self._apply_category_filter)
        layout.addWidget(self.filter_row)
        
        # Tree (Virtualized)
        self.tree = QTreeView()
        self.tree.setModel(self.model)
        self.tree.setHeaderHidden(False)
        self.tree.setIndentation(14)
        self.tree.setAnimated(True)
        self.tree.setUniformRowHeights(True) # Major speed boost
        self.tree.setStyleSheet(f"""
            QTreeView {{
                background: transparent;
                border: none;
                color: {COLORS.text_primary};
            }}
            QTreeView::item {{ height: 32px; }}
            QTreeView::item:selected {{ background: {COLORS.accent_bg}; border-radius: 4px; }}
        """)
        
        # Adjust headers
        self.tree.header().setStretchLastSection(True)
        self.tree.header().setSectionResizeMode(0, QHeaderView.Stretch)
        self.tree.header().setStyleSheet(f"background: {COLORS.bg_1}; color: {COLORS.text_secondary};")
        
        self.tree.selectionModel().selectionChanged.connect(self._on_tree_selection_changed)
        layout.addWidget(self.tree, 1)
        
        return panel

    def _build_status_bar(self) -> QHBoxLayout:
        """Create status bar."""
        status = QHBoxLayout()
        status.setContentsMargins(SPACING.lg, SPACING.xs, SPACING.lg, SPACING.xs)
        
        self.status_lbl = Muted("Ready.")
        status.addWidget(self.status_lbl)
        
        status.addStretch(1)
        
        self.count_lbl = Muted("0 items")
        status.addWidget(self.count_lbl)
        
        return status

    def _load_cc_index(self) -> None:
        """Load and populate index."""
        self.status_lbl.setText("Scanning CC directories...")
        
        # In a real app, we'd use a worker thread
        self.records = self.indexer.full_scan()
        self.extractor.enrich(self.records)
        
        self._populate_tree()
        self.status_lbl.setText("Scan complete.")
        self.count_lbl.setText(f"{len(self.records)} items")

    def _populate_tree(self, filter_text: str = "", category: str = "All") -> None:
        """Pass records to the virtualized model."""
        self.model.set_records(self.records)
        self.tree.expandAll()

    @Slot()
    def _refresh_index(self) -> None:
        """Rescan CC directories."""
        self._load_cc_index()

    @Slot(str)
    def _on_search_changed(self, text: str) -> None:
        """Filter tree by search query using SQLite search."""
        if len(text) > 2:
            # High-performance DB search
            rows = self.indexer.vault.search_records(text)
            self.records = {}
            for row in rows:
                rec = CCRecord(
                    id=row['id'],
                    name=row['name'],
                    creator=row['creator'],
                    category=row['category'],
                    total_size=row['total_size'],
                    last_modified=row['last_modified'],
                    tags=row['tags'].split(',') if row['tags'] else []
                )
                self.records[row['name']] = rec
            self._populate_tree()
        elif not text:
            # Reset to full list
            self._load_cc_index()
        else:
            # Optional: handle short queries locally or wait
            pass

    @Slot(str)
    def _apply_category_filter(self, category: str) -> None:
        """Apply category filter."""
        self._populate_tree(filter_text=self.search_bar.text(), category=category)

    @Slot()
    def _on_tree_selection_changed(self) -> None:
        """Update viewfinder on selection using model index."""
        indexes = self.tree.selectionModel().selectedIndexes()
        if indexes:
            # Column 0 index has the internalPointer we need
            idx = indexes[0]
            item = idx.internalPointer()
            if hasattr(item, "item_data") and isinstance(item.item_data, CCRecord):
                self.viewfinder.set_cc_record(item.item_data)
                return
        
        self.viewfinder.set_cc_record(None)
