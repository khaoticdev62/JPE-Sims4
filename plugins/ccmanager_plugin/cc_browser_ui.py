"""CC Browser UI Component."""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QListWidget, 
    QSplitter, QLineEdit, QListWidgetItem
)
from PySide6.QtCore import Qt, Signal
from jpe_studio_qt.design_tokens import COLORS, SPACING
from jpe_studio_qt.ui.components import H2, Muted, CardFrame


class CCBrowserWidget(QWidget):
    """Main UI for browsing CC and Mods."""
    
    file_selected = Signal(str) # Emits file path
    
    def __init__(self, index: dict):
        super().__init__()
        self.index = index
        self._init_ui()
        
    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Header
        header = QHBoxLayout()
        header.addWidget(H2("CC Manager"))
        
        self.search_bar = QLineEdit()
        self.search_bar.setPlaceholderText("Search mods...")
        self.search_bar.textChanged.connect(self._filter_list)
        header.addWidget(self.search_bar)
        
        layout.addLayout(header)
        
        # Main content
        self.splitter = QSplitter(Qt.Horizontal)
        
        # File list
        self.file_list = QListWidget()
        self.file_list.itemSelectionChanged.connect(self._on_selection_changed)
        self._populate_list()
        
        self.splitter.addWidget(self.file_list)
        
        # Viewfinder placeholder
        self.viewfinder = QWidget()
        v_layout = QVBoxLayout(self.viewfinder)
        v_layout.addWidget(Muted("Select a mod to view details"))
        
        self.splitter.addWidget(self.viewfinder)
        self.splitter.setStretchFactor(0, 1)
        self.splitter.setStretchFactor(1, 2)
        
        layout.addWidget(self.splitter)
        
    def _populate_list(self):
        self.file_list.clear()
        for path, info in self.index.items():
            item = QListWidgetItem(info["name"])
            item.setData(Qt.UserRole, path)
            self.file_list.addItem(item)
            
    def _filter_list(self, text):
        for i in range(self.file_list.count()):
            item = self.file_list.item(i)
            item.setHidden(text.lower() not in item.text().lower())
            
    def _on_selection_changed(self):
        items = self.file_list.selectedItems()
        if items:
            path = items[0].data(Qt.UserRole)
            self.file_selected.emit(path)
