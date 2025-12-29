"""Navigation history and state management for JPE Studio.

Implements browser-like navigation with back/forward history and breadcrumbs.
Tracks which page user is on, where they came from, and where they can go.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Optional


@dataclass
class NavigationState:
    """Represents a single navigation state (page + context).

    Attributes:
        page_index: Index of the current page in page stack
        page_name: Human-readable page name
        context: Optional context data (e.g., selected project, build id)
        scroll_position: Optional scroll position to restore
    """

    page_index: int
    page_name: str
    context: Optional[dict[str, Any]] = None
    scroll_position: int = 0


class NavigationHistory:
    """Manages navigation history with back/forward support.

    Features:
    - Back/forward navigation (browser-like)
    - Navigation state tracking with context
    - Breadcrumb generation
    - Navigation callbacks
    - History limit for memory management

    Usage:
        nav = NavigationHistory(page_names={0: "Dashboard", 1: "Build", 2: "Settings"})

        # Navigate to a page
        nav.navigate_to(1, context={"build_id": 123})

        # Go back/forward
        if nav.can_go_back():
            nav.go_back()

        if nav.can_go_forward():
            nav.go_forward()

        # Get breadcrumbs for UI
        breadcrumbs = nav.get_breadcrumbs()
    """

    def __init__(self, page_names: dict[int, str], max_history: int = 50) -> None:
        """Initialize navigation history.

        Args:
            page_names: Mapping of page index to display name
            max_history: Maximum history entries to keep
        """
        self.page_names = page_names
        self.max_history = max_history
        self.history: list[NavigationState] = []
        self.current_index = -1
        self.on_navigate_callbacks: list[Callable[[NavigationState], None]] = []

    def navigate_to(
        self,
        page_index: int,
        context: Optional[dict[str, Any]] = None,
        scroll_position: int = 0,
    ) -> NavigationState:
        """Navigate to a page.

        Args:
            page_index: Index of page to navigate to
            context: Optional context data to pass with navigation
            scroll_position: Optional scroll position to restore

        Returns:
            New NavigationState
        """
        # Remove any forward history (like browser)
        if self.current_index >= 0:
            self.history = self.history[: self.current_index + 1]

        # Create new state
        page_name = self.page_names.get(page_index, f"Page {page_index}")
        state = NavigationState(
            page_index=page_index,
            page_name=page_name,
            context=context or {},
            scroll_position=scroll_position,
        )

        # Add to history
        self.history.append(state)
        self.current_index = len(self.history) - 1

        # Enforce max history
        if len(self.history) > self.max_history:
            self.history.pop(0)
            self.current_index -= 1

        # Notify listeners
        self._notify_navigate(state)
        return state

    def go_back(self) -> Optional[NavigationState]:
        """Go back in history.

        Returns:
            Previous NavigationState or None if at beginning
        """
        if not self.can_go_back():
            return None

        self.current_index -= 1
        state = self.history[self.current_index]
        self._notify_navigate(state)
        return state

    def go_forward(self) -> Optional[NavigationState]:
        """Go forward in history.

        Returns:
            Next NavigationState or None if at end
        """
        if not self.can_go_forward():
            return None

        self.current_index += 1
        state = self.history[self.current_index]
        self._notify_navigate(state)
        return state

    def can_go_back(self) -> bool:
        """Check if back navigation is available."""
        return self.current_index > 0

    def can_go_forward(self) -> bool:
        """Check if forward navigation is available."""
        return self.current_index < len(self.history) - 1

    def get_current_state(self) -> Optional[NavigationState]:
        """Get current navigation state."""
        if self.current_index >= 0 and self.current_index < len(self.history):
            return self.history[self.current_index]
        return None

    def get_breadcrumbs(self) -> list[tuple[int, str]]:
        """Get breadcrumb trail for UI display.

        Returns:
            List of (page_index, page_name) tuples for current history
        """
        breadcrumbs = []
        for state in self.history[: self.current_index + 1]:
            breadcrumbs.append((state.page_index, state.page_name))
        return breadcrumbs

    def get_breadcrumb_string(self, separator: str = " > ") -> str:
        """Get breadcrumb trail as formatted string.

        Args:
            separator: String to use between breadcrumbs

        Returns:
            Formatted breadcrumb string
        """
        breadcrumbs = self.get_breadcrumbs()
        return separator.join(name for _, name in breadcrumbs)

    def on_navigate(self, callback: Callable[[NavigationState], None]) -> None:
        """Register callback for navigation events.

        Args:
            callback: Function called with NavigationState when navigation occurs
        """
        self.on_navigate_callbacks.append(callback)

    def _notify_navigate(self, state: NavigationState) -> None:
        """Notify all registered callbacks of navigation."""
        for callback in self.on_navigate_callbacks:
            try:
                callback(state)
            except Exception:
                pass  # Silently ignore callback errors

    def clear(self) -> None:
        """Clear all navigation history."""
        self.history.clear()
        self.current_index = -1

    def get_history_size(self) -> int:
        """Get number of history entries."""
        return len(self.history)


class BreadcrumbWidget:
    """Helper for displaying navigation breadcrumbs.

    Usage:
        from jpe_studio_qt.ui.components import MaterialIcon, Muted
        breadcrumb = BreadcrumbWidget(nav_history)
        breadcrumb.render(layout)  # Adds breadcrumb widgets to layout
    """

    def __init__(self, navigation: NavigationHistory) -> None:
        """Initialize breadcrumb widget helper.

        Args:
            navigation: NavigationHistory instance to track
        """
        self.navigation = navigation
        self.breadcrumb_widgets: list[Any] = []

    def render(self, layout) -> None:
        """Render breadcrumbs into a layout.

        Args:
            layout: QHBoxLayout to add breadcrumb widgets to
        """
        from PySide6.QtWidgets import QLabel
        from jpe_studio_qt.design_tokens import COLORS, SPACING

        # Clear existing breadcrumbs
        for widget in self.breadcrumb_widgets:
            if hasattr(widget, "deleteLater"):
                widget.deleteLater()
        self.breadcrumb_widgets.clear()

        breadcrumbs = self.navigation.get_breadcrumbs()

        for i, (idx, name) in enumerate(breadcrumbs):
            # Add name label
            label = QLabel(name)
            label.setStyleSheet(f"color: {COLORS.text_secondary}; font-size: 12px;")
            layout.addWidget(label)
            self.breadcrumb_widgets.append(label)

            # Add separator (except for last item)
            if i < len(breadcrumbs) - 1:
                sep = QLabel(" > ")
                sep.setStyleSheet(f"color: {COLORS.text_tertiary}; font-size: 11px;")
                layout.addWidget(sep)
                self.breadcrumb_widgets.append(sep)
