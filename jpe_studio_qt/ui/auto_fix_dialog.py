"""
Auto-Fix Dialog UI.

Shows suggested fixes with diffs and allows batch applying.

Features:
- List of suggested fixes
- Diff preview for each fix
- Confidence scoring
- Apply individual or all fixes
- Skip fixes
"""

from __future__ import annotations

from typing import Optional, List

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QListWidget,
    QListWidgetItem, QPushButton, QFrame, QTextEdit, QProgressBar
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont, QColor

from jpe_studio_qt.ai.auto_fix import SuggestedFix
from jpe_studio_qt.ai.code_diff import CodeDiffAnalyzer
from jpe_studio_qt.ui.code_diff_dialog import CodeDiffDialog
from jpe_studio_qt.design_tokens import COLORS, SPACING, RADIUS


class AutoFixDialog(QDialog):
    """
    Dialog for reviewing and applying auto-fixes.

    Shows list of suggested fixes with diffs and allows
    user to review and apply them individually or as batch.

    Example:
        dialog = AutoFixDialog(fixes)
        result = dialog.exec()

        if dialog.accepted:
            applied_fixes = dialog.get_applied_fixes()
            for fix in applied_fixes:
                editor.setPlainText(fix.fixed_code)
    """

    # Signals
    fixes_applied = Signal(list)  # List of applied SuggestedFix
    fixes_rejected = Signal(list)  # List of rejected SuggestedFix
    fix_applied = Signal(SuggestedFix)  # Individual fix applied

    def __init__(self, fixes: List[SuggestedFix], parent: Optional[object] = None) -> None:
        """
        Initialize auto-fix dialog.

        Args:
            fixes: List of SuggestedFix objects
            parent: Parent widget
        """
        super().__init__(parent)
        self._fixes = fixes
        self._applied_fixes: List[SuggestedFix] = []
        self._rejected_fixes: List[SuggestedFix] = []
        self._diff_analyzer = CodeDiffAnalyzer()

        self.setWindowTitle("Auto-Fix Suggestions")
        self.setGeometry(100, 100, 1000, 600)
        self.setModal(True)

        self._init_ui()

    def _init_ui(self) -> None:
        """Initialize UI."""
        layout = QVBoxLayout(self)

        # Header
        header = self._create_header()
        layout.addWidget(header)

        # Fixes list
        fixes_list = self._create_fixes_list()
        layout.addWidget(fixes_list, 1)

        # Details
        details = self._create_details()
        layout.addWidget(details)

        # Actions
        actions = self._create_actions()
        layout.addLayout(actions)

        self.setStyleSheet(f"""
            QDialog {{
                background: {COLORS.bg_0};
            }}
            QListWidget {{
                background: {COLORS.surface_0};
                color: {COLORS.text_primary};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.md}px;
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
            QPushButton {{
                color: {COLORS.text_primary};
                border: 1px solid {COLORS.stroke_1};
                border-radius: {RADIUS.md}px;
                padding: 0 {SPACING.lg}px;
                min-height: 36px;
                background: transparent;
            }}
            QPushButton:hover {{
                background: {COLORS.surface_1};
            }}
        """)

    def _create_header(self) -> QFrame:
        """Create header with stats."""
        header = QFrame()
        header_layout = QHBoxLayout(header)

        # Title
        title = QLabel("Suggested Auto-Fixes")
        title_font = QFont()
        title_font.setBold(True)
        title_font.setPointSize(14)
        title.setFont(title_font)
        header_layout.addWidget(title)

        header_layout.addStretch(1)

        # Stats
        avg_confidence = sum(f.confidence for f in self._fixes) / len(self._fixes) if self._fixes else 0
        stats = QLabel(f"Fixes: {len(self._fixes)} | Avg Confidence: {int(avg_confidence * 100)}%")
        stats.setStyleSheet(f"color: {COLORS.text_secondary};")
        header_layout.addWidget(stats)

        return header

    def _create_fixes_list(self) -> QListWidget:
        """Create list of fixes."""
        list_widget = QListWidget()

        for i, fix in enumerate(self._fixes, 1):
            confidence_pct = int(fix.confidence * 100)
            error_code = fix.error_code

            # Create list item
            item_text = f"{i}. {error_code} - {fix.fix_description[:40]}... ({confidence_pct}%)"
            item = QListWidgetItem(item_text)

            # Color based on confidence
            if fix.confidence >= 0.8:
                item.setForeground(QColor(COLORS.success))
            elif fix.confidence >= 0.6:
                item.setForeground(QColor(COLORS.text_primary))
            else:
                item.setForeground(QColor(COLORS.warning))

            list_widget.addItem(item)

        return list_widget

    def _create_details(self) -> QFrame:
        """Create details panel."""
        frame = QFrame()
        layout = QVBoxLayout(frame)

        label = QLabel("Details")
        label_font = QFont()
        label_font.setBold(True)
        label.setFont(label_font)
        layout.addWidget(label)

        details_text = QTextEdit()
        details_text.setReadOnly(True)
        details_text.setMaximumHeight(150)

        # Show first fix details
        if self._fixes:
            first_fix = self._fixes[0]
            details = f"""Error: {first_fix.error_code}
Message: {first_fix.error_message}

Fix #{first_fix.fix_index + 1}:
{first_fix.fix_description}

Confidence: {int(first_fix.confidence * 100)}%
"""
            details_text.setText(details)

        layout.addWidget(details_text)

        return frame

    def _create_actions(self) -> QHBoxLayout:
        """Create action buttons."""
        layout = QHBoxLayout()
        layout.setSpacing(SPACING.sm)
        layout.addStretch(1)

        # Skip all button
        skip_btn = QPushButton("Skip All")
        skip_btn.clicked.connect(self._skip_all)
        layout.addWidget(skip_btn)

        # Preview first button
        preview_btn = QPushButton("Preview")
        preview_btn.clicked.connect(self._preview_first)
        layout.addWidget(preview_btn)

        # Apply individual button
        apply_one_btn = QPushButton("Apply One")
        apply_one_btn.clicked.connect(self._apply_one)
        layout.addWidget(apply_one_btn)

        # Apply all button
        apply_all_btn = QPushButton("Apply All")
        apply_all_btn.setStyleSheet(f"""
            QPushButton {{
                background: {COLORS.accent_primary};
                color: {COLORS.text_primary};
                border: none;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background: {COLORS.accent_hover};
            }}
        """)
        apply_all_btn.clicked.connect(self._apply_all)
        layout.addWidget(apply_all_btn)

        return layout

    def _preview_first(self) -> None:
        """Preview first fix."""
        if not self._fixes:
            return

        fix = self._fixes[0]
        diff = self._diff_analyzer.compare(fix.original_code, fix.fixed_code)

        from jpe_studio_qt.ui.code_diff_dialog import CodeDiffDialog
        dialog = CodeDiffDialog(diff, self)
        result = dialog.exec()

        if dialog.accepted:
            self._apply_one()

    def _apply_one(self) -> None:
        """Apply first fix."""
        if not self._fixes:
            return

        fix = self._fixes.pop(0)
        self._applied_fixes.append(fix)
        self.fix_applied.emit(fix)

        # Refresh UI
        self.close()
        self.fixes_applied.emit(self._applied_fixes)

    def _apply_all(self) -> None:
        """Apply all fixes."""
        self._applied_fixes.extend(self._fixes)
        self.fixes_applied.emit(self._applied_fixes)
        self.accept()

    def _skip_all(self) -> None:
        """Reject all fixes."""
        self._rejected_fixes.extend(self._fixes)
        self.fixes_rejected.emit(self._rejected_fixes)
        self.reject()

    def get_applied_fixes(self) -> List[SuggestedFix]:
        """Get list of applied fixes."""
        return self._applied_fixes.copy()

    def get_rejected_fixes(self) -> List[SuggestedFix]:
        """Get list of rejected fixes."""
        return self._rejected_fixes.copy()
