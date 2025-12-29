"""
Responsive layout utilities for window resizing and adaptive layouts.

Provides helpers for responsive behavior aligned with Phase 6 polish requirements.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

from PySide6.QtCore import QSize
from PySide6.QtWidgets import QWidget

if TYPE_CHECKING:
    from PySide6.QtWidgets import QGridLayout


class ResponsiveGrid:
    """
    Helper for responsive grid layouts that adapt columns based on width.

    Usage:
        grid = ResponsiveGrid(layout, min_col_width=280)
        grid.update_columns(window_width)
    """

    def __init__(self, layout: QGridLayout, min_col_width: int = 280, max_columns: int = 4) -> None:
        """
        Initialize responsive grid helper.

        Args:
            layout: QGridLayout to make responsive
            min_col_width: Minimum width per column in pixels (default: 280)
            max_columns: Maximum number of columns (default: 4)
        """
        self.layout = layout
        self.min_col_width = min_col_width
        self.max_columns = max_columns
        self._items: list[QWidget] = []

    def add_item(self, widget: QWidget) -> None:
        """Add an item to the responsive grid."""
        self._items.append(widget)

    def update_columns(self, available_width: int) -> None:
        """
        Update grid column count based on available width.

        Args:
            available_width: Available width in pixels
        """
        # Calculate optimal number of columns
        cols = min(
            self.max_columns,
            max(1, available_width // self.min_col_width)
        )

        # Clear existing layout
        while self.layout.count():
            item = self.layout.takeAt(0)
            if item.widget():
                item.widget().setParent(None)

        # Reposition items in grid
        for i, widget in enumerate(self._items):
            row = i // cols
            col = i % cols
            self.layout.addWidget(widget, row, col)


class ResponsiveWindow:
    """
    Helper for window-level responsive behavior.

    Provides breakpoints and size policies for adaptive layouts.
    """

    # Breakpoints (from plan Phase 6)
    BREAKPOINT_XS = 768  # Mobile/small tablets
    BREAKPOINT_SM = 1024  # Tablets/small desktops
    BREAKPOINT_MD = 1280  # Medium desktops
    BREAKPOINT_LG = 1600  # Large desktops
    BREAKPOINT_XL = 1920  # Extra large

    # Minimum window size (from plan)
    MIN_WIDTH = 1024
    MIN_HEIGHT = 600

    @staticmethod
    def get_size_class(width: int) -> str:
        """
        Get responsive size class based on width.

        Args:
            width: Window width in pixels

        Returns:
            Size class string: 'xs', 'sm', 'md', 'lg', or 'xl'
        """
        if width < ResponsiveWindow.BREAKPOINT_XS:
            return 'xs'
        elif width < ResponsiveWindow.BREAKPOINT_SM:
            return 'sm'
        elif width < ResponsiveWindow.BREAKPOINT_MD:
            return 'md'
        elif width < ResponsiveWindow.BREAKPOINT_LG:
            return 'lg'
        else:
            return 'xl'

    @staticmethod
    def should_hide_sidebar(width: int) -> bool:
        """
        Determine if sidebar should be hidden based on width.

        Args:
            width: Window width in pixels

        Returns:
            True if sidebar should be hidden (narrow window)
        """
        return width < 1200  # From plan: hide sidebar on narrow windows

    @staticmethod
    def get_grid_columns(width: int, min_col_width: int = 280) -> int:
        """
        Calculate optimal grid column count for width.

        Args:
            width: Available width in pixels
            min_col_width: Minimum column width (default: 280px)

        Returns:
            Number of columns (1-4)
        """
        return min(4, max(1, width // min_col_width))

    @staticmethod
    def apply_minimum_size(window: QWidget) -> None:
        """
        Apply minimum window size constraint.

        Args:
            window: Window widget to constrain
        """
        window.setMinimumSize(QSize(ResponsiveWindow.MIN_WIDTH, ResponsiveWindow.MIN_HEIGHT))


def make_responsive_grid(layout: QGridLayout, items: list[QWidget], parent_width: int, min_col_width: int = 280) -> None:
    """
    Arrange items in a responsive grid based on parent width.

    Args:
        layout: QGridLayout to arrange items in
        items: List of widgets to arrange
        parent_width: Parent widget width in pixels
        min_col_width: Minimum width per column (default: 280px)
    """
    cols = ResponsiveWindow.get_grid_columns(parent_width, min_col_width)

    # Clear existing items
    while layout.count():
        item = layout.takeAt(0)
        if item.widget():
            item.widget().setParent(None)

    # Add items in grid
    for i, widget in enumerate(items):
        row = i // cols
        col = i % cols
        layout.addWidget(widget, row, col)
