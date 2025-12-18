from __future__ import annotations

import re

from PySide6.QtCore import QRect, QSize, Qt
from PySide6.QtGui import (
    QColor,
    QFont,
    QPainter,
    QPen,
    QTextCharFormat,
    QSyntaxHighlighter,
)
from PySide6.QtWidgets import QPlainTextEdit, QWidget, QTextEdit


class _XmlHighlighter(QSyntaxHighlighter):
    def __init__(self, parent) -> None:
        super().__init__(parent)
        self._tag = QTextCharFormat()
        self._tag.setForeground(QColor("#9d5cfa"))
        self._tag.setFontWeight(QFont.Weight.DemiBold)

        self._attr = QTextCharFormat()
        self._attr.setForeground(QColor("#f59e0b"))

        self._string = QTextCharFormat()
        self._string.setForeground(QColor("#22c55e"))

        self._comment = QTextCharFormat()
        self._comment.setForeground(QColor(255, 255, 255, 120))

        self._rx_tag = re.compile(r"</?[\w:\-\.]+")
        self._rx_attr = re.compile(r"\b[\w:\-\.]+(?=\=)")
        self._rx_string = re.compile(r"\"[^\"]*\"|'[^']*'")
        self._rx_comment = re.compile(r"<!--.*?-->")

    def highlightBlock(self, text: str) -> None:  # pragma: no cover (Qt)
        for m in self._rx_comment.finditer(text):
            self.setFormat(m.start(), m.end() - m.start(), self._comment)
        for m in self._rx_tag.finditer(text):
            self.setFormat(m.start(), m.end() - m.start(), self._tag)
        for m in self._rx_attr.finditer(text):
            self.setFormat(m.start(), m.end() - m.start(), self._attr)
        for m in self._rx_string.finditer(text):
            self.setFormat(m.start(), m.end() - m.start(), self._string)


class _LineNumberArea(QWidget):
    def __init__(self, editor: "CodeEditor") -> None:
        super().__init__(editor)
        self._editor = editor

    def sizeHint(self) -> QSize:  # pragma: no cover (Qt)
        return QSize(self._editor.line_number_area_width(), 0)

    def paintEvent(self, event) -> None:  # pragma: no cover (Qt)
        self._editor.paint_line_number_area(event)


class CodeEditor(QPlainTextEdit):
    """
    A minimal code editor with line numbers and a lightweight XML highlighter.

    This is intentionally small and dependency-free (no QScintilla) while matching
    the "dual-pane editor" visuals from the JPE asset templates.
    """

    def __init__(self, *, language: str = "xml") -> None:
        super().__init__()
        self._line_area = _LineNumberArea(self)
        self._highlighter = _XmlHighlighter(self.document()) if language.lower() == "xml" else None
        self._gutter_bg = QColor("#130d1c")
        self._gutter_border = QColor(255, 255, 255, 22)
        self._gutter_fg = QColor(255, 255, 255, 90)
        self._gutter_fg_active = QColor(255, 255, 255, 210)
        self._gutter_active_bg = QColor(134, 56, 250, 28)
        self._gutter_active_bar = QColor("#8638fa")

        font = QFont("Cascadia Mono")
        if not font.exactMatch():
            font = QFont("Consolas")
        font.setPointSize(10)
        self.setFont(font)

        # PySide6 varies slightly across versions; prefer the QPlainTextEdit API.
        try:
            self.setLineWrapMode(QPlainTextEdit.LineWrapMode.NoWrap)  # type: ignore[attr-defined]
        except Exception:
            try:
                self.setLineWrapMode(QPlainTextEdit.NoWrap)  # type: ignore[attr-defined]
            except Exception:
                pass
        self.setTabStopDistance(self.fontMetrics().horizontalAdvance(" ") * 4)

        self.blockCountChanged.connect(self._update_line_area_width)
        self.updateRequest.connect(self._update_line_area)
        self.cursorPositionChanged.connect(self._highlight_current_line)

        self._update_line_area_width(0)
        self._highlight_current_line()

    def set_variant(self, variant: str) -> None:
        """
        Matches QSS variants used by the dual-pane assets and keeps the gutter
        background in sync with the editor background.
        """
        self.setProperty("variant", variant)
        if variant == "codeOutput":
            self._gutter_bg = QColor("#0d0914")
        else:
            self._gutter_bg = QColor("#130d1c")
        self._line_area.update()

    def line_number_area_width(self) -> int:
        digits = 1
        max_lines = max(1, self.blockCount())
        while max_lines >= 10:
            max_lines //= 10
            digits += 1
        return 12 + self.fontMetrics().horizontalAdvance("9") * digits

    def _update_line_area_width(self, _new_block_count: int) -> None:
        self.setViewportMargins(self.line_number_area_width(), 0, 0, 0)

    def _update_line_area(self, rect: QRect, dy: int) -> None:
        if dy:
            self._line_area.scroll(0, dy)
        else:
            self._line_area.update(0, rect.y(), self._line_area.width(), rect.height())
        if rect.contains(self.viewport().rect()):
            self._update_line_area_width(0)

    def resizeEvent(self, event) -> None:  # pragma: no cover (Qt)
        super().resizeEvent(event)
        cr = self.contentsRect()
        self._line_area.setGeometry(QRect(cr.left(), cr.top(), self.line_number_area_width(), cr.height()))

    def paint_line_number_area(self, event) -> None:  # pragma: no cover (Qt)
        painter = QPainter(self._line_area)
        painter.fillRect(event.rect(), self._gutter_bg)
        painter.setPen(QPen(self._gutter_border))
        painter.drawLine(event.rect().right(), event.rect().top(), event.rect().right(), event.rect().bottom())

        active_line = self.textCursor().blockNumber()

        block = self.firstVisibleBlock()
        block_number = block.blockNumber()
        top = int(self.blockBoundingGeometry(block).translated(self.contentOffset()).top())
        bottom = top + int(self.blockBoundingRect(block).height())

        while block.isValid() and top <= event.rect().bottom():
            if block.isVisible() and bottom >= event.rect().top():
                is_active = block_number == active_line
                if is_active:
                    painter.fillRect(
                        0,
                        top,
                        self._line_area.width(),
                        self.fontMetrics().height(),
                        self._gutter_active_bg,
                    )
                    painter.fillRect(
                        0,
                        top,
                        3,
                        self.fontMetrics().height(),
                        self._gutter_active_bar,
                    )
                number = str(block_number + 1)
                painter.setPen(self._gutter_fg_active if is_active else self._gutter_fg)
                painter.drawText(
                    0,
                    top,
                    self._line_area.width() - 6,
                    self.fontMetrics().height(),
                    int(Qt.AlignmentFlag.AlignRight),
                    number,
                )
            block = block.next()
            top = bottom
            bottom = top + int(self.blockBoundingRect(block).height())
            block_number += 1

    def _highlight_current_line(self) -> None:  # pragma: no cover (Qt)
        extra = []
        sel = QTextEdit.ExtraSelection()
        sel.format.setBackground(QColor(134, 56, 250, 35))
        try:
            sel.format.setProperty(QTextCharFormat.Property.FullWidthSelection, True)  # type: ignore[attr-defined]
        except Exception:
            pass
        sel.cursor = self.textCursor()
        sel.cursor.clearSelection()
        extra.append(sel)
        self.setExtraSelections(extra)
