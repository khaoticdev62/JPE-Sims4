"""
Unified AI Assistant Panel (Ctrl+K).

Comprehensive AI feature panel combining:
- Code completions
- Error analysis and explanations
- Auto-fix suggestions
- AI insights and recommendations
- Code analysis
- Documentation lookup

Features:
- Command palette style interface
- Quick search and filtering
- Real-time suggestions
- One-click actions
- Keyboard navigation
- Customizable shortcuts
"""

from __future__ import annotations

from typing import Optional, List, Callable
from dataclasses import dataclass
from enum import Enum

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QListWidget, QListWidgetItem, QFrame, QPushButton, QScrollArea,
    QWidget, QApplication
)
from PySide6.QtCore import Qt, Signal, QTimer, QSize
from PySide6.QtGui import QFont, QColor, QIcon, QKeySequence
from PySide6.QtCore import QPropertyAnimation, QEasingCurve

from jpe_studio_qt.design_tokens import COLORS, SPACING, RADIUS


class AssistantTab(Enum):
    """Assistant panel tabs."""
    SUGGESTIONS = "suggestions"
    FIXES = "fixes"
    INSIGHTS = "insights"
    ANALYSIS = "analysis"
    DOCS = "docs"


@dataclass
class AssistantAction:
    """AI assistant action."""
    title: str
    description: str
    category: str  # "suggestion", "fix", "insight", "analysis", "doc"
    icon: str  # Material Symbol icon name
    callback: Optional[Callable] = None
    data: Optional[dict] = None
    priority: int = 0  # 0=low, 1=medium, 2=high


class AssistantActionItem(QFrame):
    """Individual assistant action item."""

    action_triggered = Signal(AssistantAction)

    def __init__(
        self, action: AssistantAction, parent: Optional[object] = None
    ) -> None:
        """
        Initialize action item.

        Args:
            action: Assistant action
            parent: Parent widget
        """
        super().__init__(parent)
        self._action = action
        self._init_ui()

    def _init_ui(self) -> None:
        """Initialize UI."""
        # Color by category
        category_colors = {
            "suggestion": COLORS.info,
            "fix": COLORS.success,
            "insight": COLORS.accent_primary,
            "analysis": COLORS.warning,
            "doc": COLORS.text_secondary,
        }
        color = category_colors.get(self._action.category, COLORS.text_secondary)

        self.setStyleSheet(f"""
            QFrame {{
                background: {COLORS.surface_0};
                border-left: 3px solid {color};
                border-radius: {RADIUS.md}px;
                padding: {SPACING.md}px;
                margin-bottom: {SPACING.xs}px;
            }}
            QFrame:hover {{
                background: {COLORS.surface_1};
            }}
        """)
        self.setCursor(Qt.PointingHandCursor)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(SPACING.md, SPACING.sm, SPACING.md, SPACING.sm)
        layout.setSpacing(SPACING.xs)

        # Title and priority
        title_row = QHBoxLayout()
        title_row.setSpacing(SPACING.sm)

        title = QLabel(self._action.title)
        title_font = QFont()
        title_font.setBold(True)
        title_font.setPointSize(11)
        title.setFont(title_font)
        title.setStyleSheet(f"color: {COLORS.text_primary};")
        title_row.addWidget(title)

        # Priority indicator
        if self._action.priority == 2:
            priority = QLabel("★")
            priority.setStyleSheet(f"color: {COLORS.accent_primary}; font-size: 14px;")
            title_row.addWidget(priority)

        title_row.addStretch(1)
        layout.addLayout(title_row)

        # Description
        if self._action.description:
            desc = QLabel(self._action.description)
            desc.setWordWrap(True)
            desc.setStyleSheet(f"""
                font-size: 11px;
                color: {COLORS.text_secondary};
                line-height: 1.4;
            """)
            layout.addWidget(desc)

    def mousePressEvent(self, event) -> None:
        """Handle click."""
        self.action_triggered.emit(self._action)
        if self._action.callback:
            self._action.callback(self._action)


class AIAssistantPanel(QDialog):
    """Unified AI Assistant Panel (Ctrl+K)."""

    action_triggered = Signal(AssistantAction)
    closed = Signal()

    def __init__(self, parent: Optional[object] = None) -> None:
        """
        Initialize AI assistant panel.

        Args:
            parent: Parent widget
        """
        super().__init__(parent)
        self._actions: List[AssistantAction] = []
        self._filtered_actions: List[AssistantAction] = []
        self._current_tab = AssistantTab.SUGGESTIONS
        self._init_ui()
        self._setup_keyboard_shortcuts()

    def _init_ui(self) -> None:
        """Initialize UI."""
        self.setWindowTitle("AI Assistant")
        self.setWindowFlags(Qt.Dialog | Qt.FramelessWindowHint)
        self.setModal(True)
        self.setAttribute(Qt.WA_TranslucentBackground)

        # Make it slightly smaller than screen but centered
        screen = QApplication.primaryScreen()
        if screen:
            geometry = screen.geometry()
            self.setGeometry(
                geometry.width() // 8,
                geometry.height() // 4,
                geometry.width() * 3 // 4,
                geometry.height() // 2
            )

        self.setStyleSheet(f"""
            QDialog {{
                background: {COLORS.glass_overlay};
                border: 1px solid {COLORS.glass_border};
                border-radius: {RADIUS.xl}px;
            }}
        """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(SPACING.xl, SPACING.xl, SPACING.xl, SPACING.xl)
        layout.setSpacing(SPACING.lg)

        # Search bar
        search_layout = QHBoxLayout()
        search_layout.setSpacing(SPACING.md)

        search_label = QLabel("🤖")
        search_label.setStyleSheet("font-size: 16px;")
        search_layout.addWidget(search_label)

        self._search_input = QLineEdit()
        self._search_input.setPlaceholderText("Ask AI... (type to search, ↑↓ to navigate, Enter to select)")
        self._search_input.setMinimumHeight(44)
        self._search_input.setStyleSheet(f"""
            QLineEdit {{
                background: {COLORS.surface_0};
                color: {COLORS.text_primary};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.md}px;
                padding: 0 {SPACING.md}px;
                font-size: 13px;
            }}
            QLineEdit:focus {{
                border-color: {COLORS.accent_primary};
                background: {COLORS.surface_1};
            }}
            QLineEdit::placeholder {{
                color: {COLORS.text_tertiary};
            }}
        """)
        self._search_input.textChanged.connect(self._on_search_text_changed)
        self._search_input.keyPressEvent = self._handle_search_key_press
        search_layout.addWidget(self._search_input)

        layout.addLayout(search_layout)

        # Results list
        self._results_list = QListWidget()
        self._results_list.setStyleSheet(f"""
            QListWidget {{
                background: {COLORS.surface_0};
                color: {COLORS.text_primary};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.md}px;
            }}
            QListWidget::item {{
                padding: 0;
                border: none;
            }}
            QListWidget::item:selected {{
                background: {COLORS.accent_bg};
            }}
        """)
        layout.addWidget(self._results_list)

        # Details panel
        details_layout = QVBoxLayout()
        details_layout.setSpacing(SPACING.sm)

        details_label = QLabel("Details")
        details_label.setStyleSheet(f"""
            font-size: 11px;
            font-weight: bold;
            color: {COLORS.text_secondary};
            text-transform: uppercase;
        """)
        details_layout.addWidget(details_label)

        self._details_text = QLineEdit()
        self._details_text.setReadOnly(True)
        self._details_text.setMaximumHeight(60)
        self._details_text.setStyleSheet(f"""
            QLineEdit {{
                background: {COLORS.surface_1};
                color: {COLORS.text_secondary};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.md}px;
                padding: {SPACING.sm}px;
                font-size: 11px;
            }}
        """)
        details_layout.addWidget(self._details_text)

        layout.addLayout(details_layout)

        # Footer with hints
        footer = QHBoxLayout()
        footer.setSpacing(SPACING.md)

        hint = QLabel("↵ Select  •  Esc Close  •  ↑↓ Navigate")
        hint.setStyleSheet(f"""
            font-size: 10px;
            color: {COLORS.text_tertiary};
        """)
        footer.addWidget(hint)
        footer.addStretch(1)

        layout.addLayout(footer)

    def _handle_search_key_press(self, event):
        """Handle key press in search input."""
        if event.key() == Qt.Key_Escape:
            self.close()
        elif event.key() == Qt.Key_Down:
            if self._results_list.count() > 0:
                self._results_list.setFocus()
                self._results_list.setCurrentRow(0)
        elif event.key() == Qt.Key_Return or event.key() == Qt.Key_Enter:
            if self._results_list.count() > 0:
                self._trigger_current_action()
        else:
            super(QLineEdit, self._search_input).keyPressEvent(event)

    def _setup_keyboard_shortcuts(self) -> None:
        """Setup keyboard shortcuts."""
        # Ctrl+K is handled by main window
        pass

    def _on_search_text_changed(self, text: str) -> None:
        """Handle search text change."""
        self._filter_actions(text)
        self._update_results_list()

    def _filter_actions(self, query: str) -> None:
        """Filter actions based on query."""
        query_lower = query.lower()

        if not query:
            self._filtered_actions = self._actions.copy()
        else:
            self._filtered_actions = [
                action for action in self._actions
                if query_lower in action.title.lower()
                or query_lower in action.description.lower()
                or query_lower in action.category.lower()
            ]

        # Sort by priority and relevance
        self._filtered_actions.sort(
            key=lambda a: (
                -a.priority,  # Higher priority first
                a.title.lower().index(query_lower)
                if query_lower in a.title.lower()
                else float('inf')  # Titles match before descriptions
            ),
            reverse=False
        )

    def _update_results_list(self) -> None:
        """Update results list display."""
        self._results_list.clear()

        for action in self._filtered_actions:
            item = QListWidgetItem()
            item.setText(f"{action.title}\n{action.description}")
            item.setData(Qt.UserRole, action)
            item.setSizeHint(QSize(400, 60))

            self._results_list.addItem(item)

            # Create custom widget for item
            widget = AssistantActionItem(action)
            widget.action_triggered.connect(self._on_action_triggered)
            self._results_list.setItemWidget(item, widget)

    def _trigger_current_action(self) -> None:
        """Trigger the currently selected action."""
        current_item = self._results_list.currentItem()
        if current_item:
            action = current_item.data(Qt.UserRole)
            self._on_action_triggered(action)

    def _on_action_triggered(self, action: AssistantAction) -> None:
        """Handle action triggered."""
        self.action_triggered.emit(action)

        if action.callback:
            action.callback(action)

        # Close panel after action
        QTimer.singleShot(300, self.close)

    def add_action(self, action: AssistantAction) -> None:
        """
        Add an action to the assistant.

        Args:
            action: Assistant action
        """
        self._actions.append(action)
        self._actions.sort(key=lambda a: -a.priority)
        self._filter_actions(self._search_input.text())
        self._update_results_list()

    def add_actions(self, actions: List[AssistantAction]) -> None:
        """
        Add multiple actions.

        Args:
            actions: List of actions
        """
        for action in actions:
            self.add_action(action)

    def clear_actions(self) -> None:
        """Clear all actions."""
        self._actions.clear()
        self._filtered_actions.clear()
        self._results_list.clear()

    def set_actions(self, actions: List[AssistantAction]) -> None:
        """
        Set actions (replace existing).

        Args:
            actions: List of actions
        """
        self.clear_actions()
        self.add_actions(actions)

    def show_with_focus(self) -> None:
        """Show dialog and set focus to search."""
        self.show()
        self._search_input.setFocus()
        self._search_input.clear()
        self._filter_actions("")
        self._update_results_list()

    def closeEvent(self, event) -> None:
        """Handle close."""
        self.closed.emit()
        super().closeEvent(event)

    def keyPressEvent(self, event) -> None:
        """Handle key press."""
        if event.key() == Qt.Key_Escape:
            self.close()
        else:
            super().keyPressEvent(event)


class AIAssistantManager:
    """Manager for AI Assistant panel."""

    def __init__(self) -> None:
        """Initialize manager."""
        self._panel: Optional[AIAssistantPanel] = None
        self._actions: List[AssistantAction] = []

    def create_panel(self, parent: Optional[object] = None) -> AIAssistantPanel:
        """
        Create assistant panel.

        Args:
            parent: Parent widget

        Returns:
            AI Assistant panel
        """
        if self._panel is None:
            self._panel = AIAssistantPanel(parent)
            self._panel.action_triggered.connect(self._on_action_triggered)

        return self._panel

    def register_action(self, action: AssistantAction) -> None:
        """
        Register an action.

        Args:
            action: Assistant action
        """
        self._actions.append(action)

        if self._panel:
            self._panel.add_action(action)

    def register_actions(self, actions: List[AssistantAction]) -> None:
        """
        Register multiple actions.

        Args:
            actions: List of actions
        """
        for action in actions:
            self.register_action(action)

    def show(self) -> None:
        """Show assistant panel."""
        if self._panel:
            self._panel.show_with_focus()

    def _on_action_triggered(self, action: AssistantAction) -> None:
        """Handle action triggered."""
        if action.callback:
            action.callback(action)

    def get_actions(self) -> List[AssistantAction]:
        """Get all registered actions."""
        return self._actions.copy()
