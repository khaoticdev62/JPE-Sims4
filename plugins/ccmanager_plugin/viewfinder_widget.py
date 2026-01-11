"""Viewfinder preview widget."""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel, QScrollArea
from PySide6.QtGui import QPixmap
from PySide6.QtCore import Qt
from jpe_studio_qt.ui.components import H2, H3, Muted, CardFrame, Mono


class ViewfinderWidget(QScrollArea):
    """Detail view for a selected mod."""
    
    def __init__(self):
        super().__init__()
        self.setWidgetResizable(True)
        self.setFrameShape(QScrollArea.NoFrame)
        
        self.content = QWidget()
        self.layout = QVBoxLayout(self.content)
        self.setWidget(self.content)
        
        self._init_empty()
        
    def _init_empty(self):
        # Clear layout
        while self.layout.count():
            child = self.layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()
        
        self.layout.addWidget(Muted("Select a mod to see details"))
        self.layout.addStretch()
        
    def update_info(self, file_path: str, metadata: dict):
        """Update display with mod info."""
        # Clear layout
        while self.layout.count():
            item = self.layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
                
        # Header
        from pathlib import Path
        p = Path(file_path)
        self.layout.addWidget(H2(p.name))
        self.layout.addWidget(Muted(str(p.parent)))
        
        # Thumbnail placeholder
        self.thumb = QLabel()
        self.thumb.setFixedSize(256, 256)
        self.thumb.setStyleSheet("background-color: #1a1a1a; border-radius: 8px;")
        self.thumb.setAlignment(Qt.AlignCenter)
        self.thumb.setText("No Preview")
        self.layout.addWidget(self.thumb)
        
        # Details
        grid = QVBoxLayout()
        for k, v in metadata.items():
            row = QWidget()
            h = QVBoxLayout(row)
            h.setContentsMargins(0, 4, 0, 4)
            h.addWidget(Muted(k.upper()))
            h.addWidget(Mono(str(v)))
            grid.addWidget(row)
            
        self.layout.addLayout(grid)
        self.layout.addStretch()
