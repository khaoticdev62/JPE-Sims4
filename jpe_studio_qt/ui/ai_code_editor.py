"""
AI-powered code editor with intelligent completions.

Extends the base CodeEditor with support for:
- AI-driven code completions via the intelligent completion system
- Completion popup/menu display
- Keyboard shortcuts (Ctrl+Space, Tab, Enter)
- Learning from user choices
"""

from __future__ import annotations

from typing import Optional, List
from enum import Enum

from PySide6.QtCore import Qt, QTimer, QRect, QSize, Signal
from PySide6.QtGui import (
    QFont,
    QColor,
    QPainter,
    QTextCursor,
    QKeyEvent,
    QIcon,
)
from PySide6.QtWidgets import (
    QListWidget,
    QListWidgetItem,
    QFrame,
    QVBoxLayout,
    QLabel,
    QWidget,
)

from jpe_studio_qt.ui.code_editor import CodeEditor


class CompletionItemRole(Enum):
    """Qt user role for storing completion data in list items."""
    COMPLETION_TEXT = 256
    COMPLETION_TYPE = 257
    COMPLETION_CONFIDENCE = 258
    COMPLETION_DESCRIPTION = 259


class CompletionPopup(QFrame):
    """
    Popup widget displaying code completion candidates.

    Shows a list of completion suggestions with:
    - Completion text
    - Type badge (Property, Value, Template, etc.)
    - Confidence indicator
    - Description/help text
    """

    completion_selected = Signal(str)  # Emits selected completion text

    def __init__(self, parent: Optional[QWidget] = None) -> None:
        super().__init__(parent)
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.NoDropShadowWindowHint)
        self.setFrameStyle(QFrame.StyledPanel)

        # Styling
        self.setStyleSheet(
            "QFrame { "
            "    background: rgba(25, 16, 36, 0.95); "
            "    border: 1px solid rgba(157, 92, 255, 0.3); "
            "    border-radius: 8px; "
            "} "
            "QListWidget { "
            "    background: transparent; "
            "    border: none; "
            "    outline: none; "
            "} "
            "QListWidget::item { "
            "    padding: 4px 8px; "
            "    background: transparent; "
            "} "
            "QListWidget::item:hover { "
            "    background: rgba(157, 92, 255, 0.15); "
            "} "
            "QListWidget::item:selected { "
            "    background: rgba(157, 92, 255, 0.25); "
            "    border-left: 3px solid #9d5cff; "
            "}"
        )

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        self.list_widget = QListWidget()
        self.list_widget.itemDoubleClicked.connect(self._on_item_selected)
        self.list_widget.itemSelectionChanged.connect(self._on_selection_changed)
        layout.addWidget(self.list_widget)

        self._max_visible_items = 8
        self._item_height = 24
        self._selected_index = 0

    def show_completions(self, completions: List) -> None:
        """Display completions in the popup list.

        Args:
            completions: List of CompletionCandidate objects from intelligent_completion
        """
        self.list_widget.clear()

        for candidate in completions:
            # Create display text with type badge
            display_text = self._format_completion_text(candidate)

            item = QListWidgetItem(display_text)
            item.setData(CompletionItemRole.COMPLETION_TEXT.value, candidate.text)
            item.setData(CompletionItemRole.COMPLETION_TYPE.value, candidate.type.value)
            item.setData(CompletionItemRole.COMPLETION_CONFIDENCE.value, candidate.confidence)
            item.setData(CompletionItemRole.COMPLETION_DESCRIPTION.value,
                        candidate.description or "")

            self.list_widget.addItem(item)

        # Select first item
        if self.list_widget.count() > 0:
            self.list_widget.setCurrentRow(0)
            self._selected_index = 0

        # Update popup size
        self._update_size()
        self.show()

    def _format_completion_text(self, candidate) -> str:
        """Format completion candidate for display in list."""
        type_badge = f"[{candidate.type.value.upper()}]"
        confidence_bar = self._confidence_to_bar(candidate.confidence)

        return f"{type_badge} {candidate.text} {confidence_bar}"

    def _confidence_to_bar(self, confidence: float) -> str:
        """Convert confidence (0-1) to visual bar."""
        bars = int(confidence * 5)
        bar_str = "█" * bars + "░" * (5 - bars)
        return f"[{bar_str}]"

    def _update_size(self) -> None:
        """Update popup size based on number of items."""
        count = self.list_widget.count()
        visible_count = min(count, self._max_visible_items)

        height = visible_count * self._item_height + 4
        width = 400

        self.setFixedSize(QSize(width, height))

    def _on_item_selected(self, item: QListWidgetItem) -> None:
        """Handle item double-click selection."""
        text = item.data(CompletionItemRole.COMPLETION_TEXT.value)
        self.completion_selected.emit(text)
        self.hide()

    def _on_selection_changed(self) -> None:
        """Track selection index."""
        current = self.list_widget.currentRow()
        if current >= 0:
            self._selected_index = current

    def select_next(self) -> None:
        """Move selection to next item."""
        if self.list_widget.count() > 0:
            next_row = (self._selected_index + 1) % self.list_widget.count()
            self.list_widget.setCurrentRow(next_row)
            self._selected_index = next_row

    def select_previous(self) -> None:
        """Move selection to previous item."""
        if self.list_widget.count() > 0:
            prev_row = (self._selected_index - 1) % self.list_widget.count()
            self.list_widget.setCurrentRow(prev_row)
            self._selected_index = prev_row

    def get_selected_completion(self) -> Optional[str]:
        """Get currently selected completion text."""
        item = self.list_widget.currentItem()
        if item:
            return item.data(CompletionItemRole.COMPLETION_TEXT.value)
        return None

    def move_to_cursor(self, cursor_rect: QRect, parent_pos) -> None:
        """Position popup below cursor."""
        popup_x = parent_pos.x() + cursor_rect.x()
        popup_y = parent_pos.y() + cursor_rect.bottom() + 4
        self.move(popup_x, popup_y)


class AICodeEditor(CodeEditor):
    """
    Code editor with AI-powered intelligent completions.

    Extends CodeEditor with:
    - Completion popup triggered by Ctrl+Space or automatic triggers
    - Integration with IntelligentCodeCompletion system
    - Learning from user selections
    - Completion caching for performance

    Keyboard shortcuts:
    - Ctrl+Space: Show/request completions
    - Tab: Accept selected completion
    - Enter: Accept and insert completion
    - Up/Down: Navigate completions (when popup visible)
    - Escape: Hide completions popup
    """

    completion_applied = Signal(str)  # Emitted when completion is applied

    def __init__(self, *, language: str = "xml",
                 completion_system: Optional[object] = None,
                 parent: Optional[QWidget] = None) -> None:
        """
        Initialize AICodeEditor.

        Args:
            language: Language for syntax highlighting ('xml', etc.)
            completion_system: IntelligentCodeCompletion or AdvancedCodeCompletionSystem instance
            parent: Parent widget
        """
        super().__init__(language=language)
        if parent:
            self.setParent(parent)

        self._completion_system = completion_system
        self._completion_popup: Optional[CompletionPopup] = None
        self._completion_delay_timer = QTimer()
        self._completion_delay_timer.setSingleShot(True)
        self._completion_delay_timer.timeout.connect(self._request_completions)
        self._completion_delay_ms = 250  # Delay before requesting completions

        # Track last completion for learning
        self._last_completion_context = ""

    def set_completion_system(self, system: object) -> None:
        """Set or update the completion system."""
        self._completion_system = system

    def keyPressEvent(self, event: QKeyEvent) -> None:
        """Handle keyboard events for completions."""
        # Handle completion popup navigation
        if self._completion_popup and self._completion_popup.isVisible():
            if event.key() == Qt.Key.Key_Up:
                self._completion_popup.select_previous()
                return
            elif event.key() == Qt.Key.Key_Down:
                self._completion_popup.select_next()
                return
            elif event.key() == Qt.Key.Key_Tab or event.key() == Qt.Key.Key_Return:
                self._accept_completion()
                return
            elif event.key() == Qt.Key.Key_Escape:
                self._completion_popup.hide()
                return

        # Ctrl+Space: Explicit completion request
        if event.key() == Qt.Key.Key_Space and (event.modifiers() & Qt.ControlModifier):
            self._request_completions_now()
            event.accept()
            return

        # Tab key: Accept current completion or insert tab
        if event.key() == Qt.Key.Key_Tab:
            if self._completion_popup and self._completion_popup.isVisible():
                self._accept_completion()
                return
            # Otherwise use default tab behavior

        # Regular key press
        super().keyPressEvent(event)

        # Check if we should auto-trigger completions
        if self._should_trigger_completions(event):
            self._schedule_completion_request()

    def _should_trigger_completions(self, event: QKeyEvent) -> bool:
        """Determine if we should trigger completions for this keypress."""
        if not self._completion_system:
            return False

        # Trigger on alphanumeric, underscore, colon (common in JPE syntax)
        if event.text() and (event.text().isalnum() or event.text() in "_ :.-"):
            return True

        return False

    def _schedule_completion_request(self) -> None:
        """Schedule a completion request with delay to avoid lag."""
        self._completion_delay_timer.stop()
        self._completion_delay_timer.start(self._completion_delay_ms)

    def _request_completions_now(self) -> None:
        """Immediately request completions."""
        self._completion_delay_timer.stop()
        self._request_completions()

    def _request_completions(self) -> None:
        """Request completions from the completion system."""
        if not self._completion_system:
            return

        try:
            # Get current text and cursor position
            text = self.toPlainText()
            cursor = self.textCursor()
            cursor_pos = cursor.position()

            # Request completions from the system
            completions = self._completion_system.get_completions(text, cursor_pos)

            if not completions:
                self._hide_completions()
                return

            # Show completion popup
            if not self._completion_popup:
                self._completion_popup = CompletionPopup(self)
                self._completion_popup.completion_selected.connect(self._on_completion_selected)

            self._completion_popup.show_completions(completions)

            # Position popup at cursor
            cursor_rect = self.cursorRect()
            self._completion_popup.move_to_cursor(cursor_rect, self.mapToGlobal(self.pos()))

        except Exception as e:
            # Log but don't crash on completion errors
            print(f"Error requesting completions: {e}")
            self._hide_completions()

    def _accept_completion(self) -> None:
        """Accept the currently selected completion."""
        if not self._completion_popup:
            return

        completion_text = self._completion_popup.get_selected_completion()
        if completion_text:
            self._on_completion_selected(completion_text)

    def _on_completion_selected(self, completion_text: str) -> None:
        """Handle completion selection and insertion."""
        if not completion_text:
            return

        try:
            # Get cursor position
            cursor = self.textCursor()
            cursor_pos = cursor.position()

            # Save current state for learning
            self._last_completion_context = self.toPlainText()

            # Move cursor back to word start
            cursor.select(QTextCursor.WordUnderCursor)
            cursor.removeSelectedText()

            # Insert completion
            cursor.insertText(completion_text)
            self.setTextCursor(cursor)

            # Hide popup
            self._hide_completions()

            # Notify that completion was applied
            self.completion_applied.emit(completion_text)

            # Learn from this completion if system supports it
            if hasattr(self._completion_system, 'intelligent_completion'):
                system = self._completion_system
                new_text = self.toPlainText()
                system.intelligent_completion.learn_from_completion(
                    self._last_completion_context,
                    new_text,
                    completion_text
                )

        except Exception as e:
            print(f"Error accepting completion: {e}")

    def _hide_completions(self) -> None:
        """Hide the completion popup."""
        if self._completion_popup:
            self._completion_popup.hide()

    def set_completion_delay(self, delay_ms: int) -> None:
        """Set the delay before auto-triggering completions (in milliseconds)."""
        self._completion_delay_ms = delay_ms

    def enable_completions(self, enabled: bool) -> None:
        """Enable or disable code completions."""
        if not enabled:
            self._hide_completions()
            self._completion_delay_timer.stop()
