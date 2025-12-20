"""
Settings Panel for CC Manager Plugin.
"""

from __future__ import annotations

import logging
from typing import Optional, List

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QLineEdit, QFileDialog, QListWidget, QFrame
)

from jpe_studio_qt.design_tokens import COLORS, SPACING, RADIUS
from jpe_studio_qt.ui.components import CardFrame, H2, Muted, ToggleSwitch, FormSection

from .config import CCManagerConfig

logger = logging.getLogger(__name__)


class CCManagerSettingsPanel(QWidget):
    """
    Settings UI for CC Manager.
    """

    def __init__(self, plugin: object, parent: Optional[QWidget] = None) -> None:
        super().__init__(parent)
        self.plugin = plugin # CCManagerPlugin instance
        self._build_ui()
        self._load_settings()

    def _build_ui(self) -> None:
        """Construct settings layout."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(SPACING.xl, SPACING.xl, SPACING.xl, SPACING.xl)
        layout.setSpacing(SPACING.xl)
        
        # 1. CC Directories Section
        self.dirs_section = CardFrame(shadow=False)
        ds_layout = QVBoxLayout(self.dirs_section)
        ds_layout.addWidget(H2("CC Directories"))
        ds_layout.addWidget(Muted("Folders to scan for custom content and mods."))
        
        self.path_list = QListWidget()
        self.path_list.setFixedHeight(120)
        self.path_list.setStyleSheet(f"""
            QListWidget {{
                background: {COLORS.bg_1};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.md}px;
                color: {COLORS.text_primary};
            }}
        """)
        ds_layout.addWidget(self.path_list)
        
        btn_row = QHBoxLayout()
        self.add_path_btn = QPushButton("Add Folder")
        self.add_path_btn.setObjectName("Primary")
        self.add_path_btn.clicked.connect(self._browse_cc_path)
        btn_row.addWidget(self.add_path_btn)
        
        self.remove_path_btn = QPushButton("Remove Selected")
        self.remove_path_btn.clicked.connect(self._remove_path)
        btn_row.addWidget(self.remove_path_btn)
        
        btn_row.addStretch(1)
        ds_layout.addLayout(btn_row)
        
        layout.addWidget(self.dirs_section)
        
        # 2. Metadata Sources Section
        self.meta_section = CardFrame(shadow=False)
        ms_layout = QVBoxLayout(self.meta_section)
        ms_layout.addWidget(H2("Metadata Sources"))
        ms_layout.addWidget(Muted("JSON/CSV manifest files for mod info."))
        
        self.meta_list = QListWidget()
        self.meta_list.setFixedHeight(100)
        self.meta_list.setStyleSheet(f"""
            QListWidget {{
                background: {COLORS.bg_1};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.md}px;
                color: {COLORS.text_primary};
            }}
        """)
        ms_layout.addWidget(self.meta_list)
        
        m_btn_row = QHBoxLayout()
        self.add_meta_btn = QPushButton("Add Manifest")
        self.add_meta_btn.clicked.connect(self._browse_metadata_source)
        m_btn_row.addWidget(self.add_meta_btn)
        
        self.remove_meta_btn = QPushButton("Remove Selected")
        self.remove_meta_btn.clicked.connect(self._remove_meta)
        m_btn_row.addWidget(self.remove_meta_btn)
        
        m_btn_row.addStretch(1)
        ms_layout.addLayout(m_btn_row)
        
        layout.addWidget(self.meta_section)
        
        # 3. Options Section
        self.opts_section = CardFrame(shadow=False)
        os_layout = QVBoxLayout(self.opts_section)
        os_layout.addWidget(H2("Options"))
        
        self.toggle_thumbnails = self._create_toggle_row(os_layout, "Show Thumbnails", "Display preview images in browser.")
        self.toggle_rebels = self._create_toggle_row(os_layout, "Use TS4Rebels Index", "Integrate with TS4Rebels vault if available.")
        self.toggle_cache = self._create_toggle_row(os_layout, "Enable Caching", "Store scan results for faster startup.")
        self.toggle_extract = self._create_toggle_row(os_layout, "Extract Package Metadata", "Read deep info from .package files.")
        
        layout.addWidget(self.opts_section)
        
        layout.addStretch(1)
        
        # Save Button
        self.save_btn = QPushButton("Save Settings")
        self.save_btn.setObjectName("Primary")
        self.save_btn.setMinimumHeight(44)
        self.save_btn.clicked.connect(self._save_settings)
        layout.addWidget(self.save_btn)

    def _create_toggle_row(self, layout, title, desc) -> ToggleSwitch:
        row = QHBoxLayout()
        text_col = QVBoxLayout()
        text_col.addWidget(QLabel(title))
        text_col.addWidget(Muted(desc))
        row.addLayout(text_col, 1)
        
        toggle = ToggleSwitch()
        row.addWidget(toggle)
        layout.addLayout(row)
        return toggle

    def _browse_cc_path(self) -> None:
        path = QFileDialog.getExistingDirectory(self, "Select Sims 4 Mods Folder")
        if path:
            self.path_list.addItem(path)

    def _remove_path(self) -> None:
        it = self.path_list.currentItem()
        if it:
            self.path_list.takeItem(self.path_list.row(it))

    def _browse_metadata_source(self) -> None:
        path, _ = QFileDialog.getOpenFileName(self, "Select Manifest File", "", "Manifests (*.json *.csv)")
        if path:
            self.meta_list.addItem(path)

    def _remove_meta(self) -> None:
        it = self.meta_list.currentItem()
        if it:
            self.meta_list.takeItem(self.meta_list.row(it))

    def _load_settings(self) -> None:
        """Load from config."""
        config = getattr(self.plugin, "config", CCManagerConfig())
        
        for path in config.cc_paths:
            self.path_list.addItem(path)
            
        for source in config.metadata_sources:
            self.meta_list.addItem(source)
            
        self.toggle_thumbnails.setChecked(config.show_thumbnails)
        self.toggle_rebels.setChecked(config.use_ts4rebels_index)
        self.toggle_cache.setChecked(config.cache_enabled)
        self.toggle_extract.setChecked(config.extract_package_metadata)

    def _save_settings(self) -> None:
        """Save to config."""
        cc_paths = [self.path_list.item(i).text() for i in range(self.path_list.count())]
        meta_sources = [self.meta_list.item(i).text() for i in range(self.meta_list.count())]
        
        new_config = CCManagerConfig(
            cc_paths=cc_paths,
            metadata_sources=meta_sources,
            show_thumbnails=self.toggle_thumbnails.isChecked(),
            use_ts4rebels_index=self.toggle_rebels.isChecked(),
            cache_enabled=self.toggle_cache.isChecked(),
            extract_package_metadata=self.toggle_extract.isChecked()
        )
        
        # Update plugin instance
        self.plugin.config = new_config
        
        # Save to global config manager if available
        if hasattr(self.plugin, "config_manager") and self.plugin.config_manager:
            self.plugin.config_manager.set("ccmanager", new_config.to_dict())
            self.plugin.config_manager.save()
            
        from PySide6.QtWidgets import QMessageBox
        QMessageBox.information(self, "Settings", "CC Manager settings saved successfully.")
