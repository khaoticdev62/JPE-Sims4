"""
Code Diff Preview Dialog.

Shows before/after code comparison with visual highlighting and controls.

Features:
- Side-by-side or unified diff view
- Color-coded additions/deletions
- Line numbers
- Diff statistics
- Apply/reject actions
- Copy code button
"""

from __future__ import annotations

from typing import Optional

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QTextEdit,
    QPushButton, QFrame, QSplitter, QStatusBar, QWidget
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont, QColor, QTextCursor, QTextCharFormat

from jpe_studio_qt.ai.code_diff import CodeDiffAnalyzer, CodeDiff
from jpe_studio_qt.design_tokens import COLORS, SPACING, RADIUS


class CodeDiffDialog(QDialog):
    """
    Dialog showing code diff with before/after comparison.

    User can review changes and decide to apply or reject.

    Example:
        diff = analyzer.compare(original_code, new_code)
        dialog = CodeDiffDialog(diff)
        dialog.exec()

        if dialog.accepted:
            # Apply changes
            editor.setPlainText(diff.new_code)
    """

    # Signals
    applied = Signal(str)    # Emits new code
    rejected = Signal()      # Diff rejected

    def __init__(self, diff: CodeDiff, parent: Optional[QWidget] = None) -> None:
        """
        Initialize diff dialog.

        Args:
            diff: CodeDiff to display
            parent: Parent widget
        """
        super().__init__(parent)
        self._diff = diff
        self._accepted = False

        self.setWindowTitle("Code Diff Preview")
        self.setGeometry(100, 100, 1200, 700)
        self.setModal(True)

        self._init_ui()

    def _init_ui(self) -> None:
        """Initialize UI."""
        layout = QVBoxLayout(self)

        # Header with stats
        header = self._create_header()
        layout.addWidget(header)

        # Diff viewer
        diff_widget = self._create_diff_viewer()
        layout.addWidget(diff_widget, 1)

        # Status bar
        status = QStatusBar()
        status.showMessage(f"Changes: +{self._diff.additions} -{self._diff.deletions}")
        layout.addWidget(status)

        # Actions
        actions = self._create_actions()
        layout.addLayout(actions)

        self.setStyleSheet(f"""
            QDialog {{
                background: {COLORS.bg_0};
            }}
            QTextEdit {{
                background: {COLORS.surface_0};
                color: {COLORS.text_primary};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.md}px;
                font-family: JetBrains Mono;
                font-size: 11px;
            }}
            QLabel {{
                color: {COLORS.text_primary};
            }}
        """)

    def _create_header(self) -> QFrame:
        """Create header with diff statistics."""
        header = QFrame()
        header_layout = QHBoxLayout(header)

        # Title
        title = QLabel("Code Diff Preview")
        title_font = QFont()
        title_font.setBold(True)
        title_font.setPointSize(14)
        title.setFont(title_font)
        header_layout.addWidget(title)

        header_layout.addStretch(1)

        # Stats
        stats_text = f"Changes: +{self._diff.additions} -{self._diff.deletions} | Similarity: {int(self._diff.similarity * 100)}%"
        stats = QLabel(stats_text)
        stats.setStyleSheet(f"color: {COLORS.text_secondary};")
        header_layout.addWidget(stats)

        return header

    def _create_diff_viewer(self) -> QWidget:
        """Create side-by-side diff viewer."""
        container = QWidget()
        layout = QHBoxLayout(container)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Splitter for resizing
        splitter = QSplitter(Qt.Horizontal)

        # Original code
        original_label = QLabel("Original Code")
        original_label.setStyleSheet(f"font-weight: bold; color: {COLORS.text_secondary};")

        original_editor = QTextEdit()
        original_editor.setPlainText(self._diff.original_code)
        original_editor.setReadOnly(True)
        self._highlight_original(original_editor)

        original_container = QWidget()
        original_layout = QVBoxLayout(original_container)
        original_layout.setContentsMargins(SPACING.md, SPACING.md, SPACING.md, SPACING.md)
        original_layout.setSpacing(SPACING.sm)
        original_layout.addWidget(original_label)
        original_layout.addWidget(original_editor, 1)

        # New code
        new_label = QLabel("Suggested Code")
        new_label.setStyleSheet(f"font-weight: bold; color: {COLORS.text_secondary};")

        new_editor = QTextEdit()
        new_editor.setPlainText(self._diff.new_code)
        new_editor.setReadOnly(True)
        self._highlight_new(new_editor)

        new_container = QWidget()
        new_layout = QVBoxLayout(new_container)
        new_layout.setContentsMargins(SPACING.md, SPACING.md, SPACING.md, SPACING.md)
        new_layout.setSpacing(SPACING.sm)
        new_layout.addWidget(new_label)
        new_layout.addWidget(new_editor, 1)

        splitter.addWidget(original_container)
        splitter.addWidget(new_container)
        splitter.setSizes([600, 600])

        layout.addWidget(splitter)
        return container

    def _highlight_original(self, editor: QTextEdit) -> None:
        """Apply syntax highlighting to original code."""
        cursor = editor.textCursor()
        cursor.movePosition(QTextCursor.Start)

        for line in self._diff.original_code.split('\n'):
            # Check if line was deleted
            if any(d.line_number_original == cursor.blockNumber() + 1 and
                   d.type.value == "deletion"
                   for d in self._diff.diff_lines):
                # Highlight deletion
                fmt = QTextCharFormat()
                fmt.setBackground(QColor(COLORS.error).lighter(150))
                cursor.select(QTextCursor.LineUnderCursor)
                cursor.setCharFormat(fmt)
            cursor.movePosition(QTextCursor.Down)

    def _highlight_new(self, editor: QTextEdit) -> None:
        """Apply syntax highlighting to new code."""
        cursor = editor.textCursor()
        cursor.movePosition(QTextCursor.Start)

        for line in self._diff.new_code.split('\n'):
            # Check if line was added
            if any(d.line_number_new == cursor.blockNumber() + 1 and
                   d.type.value == "addition"
                   for d in self._diff.diff_lines):
                # Highlight addition
                fmt = QTextCharFormat()
                fmt.setBackground(QColor(COLORS.success).lighter(150))
                cursor.select(QTextCursor.LineUnderCursor)
                cursor.setCharFormat(fmt)
            cursor.movePosition(QTextCursor.Down)

    def _create_actions(self) -> QHBoxLayout:
        """Create action buttons."""
        layout = QHBoxLayout()
        layout.setSpacing(SPACING.sm)
        layout.addStretch(1)

        # Copy original button
        copy_orig_btn = QPushButton("Copy Original")
        copy_orig_btn.clicked.connect(self._copy_original)
        layout.addWidget(copy_orig_btn)

        # Copy new button
        copy_new_btn = QPushButton("Copy New")
        copy_new_btn.clicked.connect(self._copy_new)
        layout.addWidget(copy_new_btn)

        # Reject button
        reject_btn = QPushButton("Reject")
        reject_btn.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                color: {COLORS.text_primary};
                border: 1px solid {COLORS.stroke_1};
                border-radius: {RADIUS.md}px;
                padding: 0 {SPACING.lg}px;
                min-height: 40px;
            }}
            QPushButton:hover {{
                background: {COLORS.surface_1};
            }}
        """)
        reject_btn.clicked.connect(self._reject)
        layout.addWidget(reject_btn)

        # Apply button
        apply_btn = QPushButton("Apply Changes")
        apply_btn.setStyleSheet(f"""
            QPushButton {{
                background: {COLORS.accent_primary};
                color: {COLORS.text_primary};
                border: none;
                border-radius: {RADIUS.md}px;
                padding: 0 {SPACING.lg}px;
                min-height: 40px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background: {COLORS.accent_hover};
            }}
        """)
        apply_btn.clicked.connect(self._apply)
        layout.addWidget(apply_btn)

        return layout

    def _copy_original(self) -> None:
        """Copy original code to clipboard."""
        from PySide6.QtWidgets import QApplication
        clipboard = QApplication.clipboard()
        clipboard.setText(self._diff.original_code)

    def _copy_new(self) -> None:
        """Copy new code to clipboard."""
        from PySide6.QtWidgets import QApplication
        clipboard = QApplication.clipboard()
        clipboard.setText(self._diff.new_code)

    def _apply(self) -> None:
        """Apply changes."""
        self._accepted = True
        self.applied.emit(self._diff.new_code)
        self.accept()

    def _reject(self) -> None:
        """Reject changes."""
        self._accepted = False
        self.rejected.emit()
        self.reject()

    @property
    def accepted(self) -> bool:
        """Check if diff was accepted."""
        return self._accepted
