"""
Virtualized Tree Model for CC Manager.

Optimized for high-performance rendering of categorized CC records.
"""

from __future__ import annotations

from typing import List, Dict, Optional, Any, Union
from PySide6.QtCore import QAbstractItemModel, QModelIndex, Qt, QSize
from .file_indexer import CCRecord

class TreeItem:
    """A lightweight node in the CC tree."""
    def __init__(self, data: Any, parent: Optional[TreeItem] = None):
        self.parent_item = parent
        self.item_data = data
        self.child_items: List[TreeItem] = []

    def append_child(self, item: TreeItem):
        self.child_items.append(item)

    def child(self, row: int) -> Optional[TreeItem]:
        if row < 0 or row >= len(self.child_items):
            return None
        return self.child_items[row]

    def child_count(self) -> int:
        return len(self.child_items)

    def row(self) -> int:
        if self.parent_item:
            return self.parent_item.child_items.index(self)
        return 0

class CCManagerModel(QAbstractItemModel):
    """
    Model that provides data to QTreeView. 
    Only renders what is visible on screen.
    """

    def __init__(self, parent=None):
        super().__init__(parent)
        self.root_item = TreeItem("Root")
        self.headers = ["Name", "Creator", "Size"]

    def set_records(self, records: Dict[str, CCRecord]):
        """Build the internal lightweight tree structure."""
        self.beginResetModel()
        self.root_item = TreeItem("Root")
        
        # Group by category
        categories: Dict[str, TreeItem] = {}
        
        for name, record in records.items():
            cat_name = record.category
            if cat_name not in categories:
                cat_item = TreeItem(cat_name, self.root_item)
                self.root_item.append_child(cat_item)
                categories[cat_name] = cat_item
            
            mod_item = TreeItem(record, categories[cat_name])
            categories[cat_name].append_child(mod_item)
            
        self.endResetModel()

    def columnCount(self, parent: QModelIndex = QModelIndex()) -> int:
        return len(self.headers)

    def data(self, index: QModelIndex, role: int = Qt.DisplayRole) -> Any:
        if not index.isValid():
            return None

        item = index.internalPointer()
        
        if role == Qt.DisplayRole:
            if isinstance(item.item_data, str): # Category node
                return item.item_data if index.column() == 0 else ""
            
            record: CCRecord = item.item_data
            if index.column() == 0:
                return record.name
            elif index.column() == 1:
                return record.creator or "Unknown"
            elif index.column() == 2:
                return f"{record.total_size / 1024 / 1024:.1f} MB"

        return None

    def headerData(self, section: int, orientation: Qt.Orientation, role: int = Qt.DisplayRole) -> Any:
        if orientation == Qt.Horizontal and role == Qt.DisplayRole:
            return self.headers[section]
        return None

    def index(self, row: int, column: int, parent: QModelIndex = QModelIndex()) -> QModelIndex:
        if not self.hasIndex(row, column, parent):
            return QModelIndex()

        parent_item = parent.internalPointer() if parent.isValid() else self.root_item
        child_item = parent_item.child(row)
        if child_item:
            return self.createIndex(row, column, child_item)
        return QModelIndex()

    def parent(self, index: QModelIndex) -> QModelIndex:
        if not index.isValid():
            return QModelIndex()

        child_item = index.internalPointer()
        parent_item = child_item.parent_item

        if parent_item == self.root_item or parent_item is None:
            return QModelIndex()

        return self.createIndex(parent_item.row(), 0, parent_item)

    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if parent.column() > 0:
            return 0

        parent_item = parent.internalPointer() if parent.isValid() else self.root_item
        return parent_item.child_count()

    def flags(self, index: QModelIndex) -> Qt.ItemFlags:
        if not index.isValid():
            return Qt.NoItemFlags
        return super().flags(index)
