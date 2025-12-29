"""
Editor integration for Natural Language to JPE Code conversion.

Extends AICodeEditor to detect // prefix and offer code generation.

Features:
- Auto-detect // natural language prefix
- Inline conversion suggestions
- One-click apply with undo support
- Async conversion without blocking UI
"""

from __future__ import annotations

from typing import Optional

from PySide6.QtCore import Qt, Signal, QTimer
from PySide6.QtGui import QTextCursor, QFont
from PySide6.QtWidgets import QTextEdit, QListWidgetItem

from jpe_studio_qt.ui.ai_code_editor import AICodeEditor, CompletionPopup
from jpe_studio_qt.ai.nlp_to_jpe import (
    NLPToJPEConverter,
    ConversionRequest,
    ConversionType
)
from jpe_studio_qt.ai.nlp_conversion_async import (
    AsyncNLPConversionManager,
    AsyncConversionRequest
)


class NLPCodeEditor(AICodeEditor):
    """
    Code editor with natural language to JPE conversion via // prefix.

    When user types //, the editor detects this and offers to convert
    the natural language description to JPE code.

    Example:
        editor = NLPCodeEditor(language="xml")
        editor.set_nlp_converter(converter)

        # User types: // add an interaction that displays a message
        # Editor shows conversion suggestion in popup
        # User clicks to apply
    """

    # Signals
    nlp_conversion_started = Signal()
    nlp_conversion_finished = Signal(str)  # Generated code
    nlp_conversion_failed = Signal(str)    # Error message

    def __init__(self, *, language: str = "xml",
                 completion_system: Optional[object] = None,
                 gemini_client: Optional[object] = None,
                 parent: Optional[object] = None) -> None:
        """
        Initialize NLP-enabled editor.

        Args:
            language: Language for syntax highlighting
            completion_system: Completion system for fallback
            gemini_client: GeminiClient for NLP conversion
            parent: Parent widget
        """
        super().__init__(
            language=language,
            completion_system=completion_system,
            parent=parent
        )

        self._nlp_converter: Optional[NLPToJPEConverter] = None
        self._nlp_async_manager: Optional[AsyncNLPConversionManager] = None
        self._current_nlp_request_id: Optional[str] = None
        self._last_nlp_line: Optional[str] = None

        # Timer to detect NLP trigger after user stops typing
        self._nlp_detection_timer = QTimer()
        self._nlp_detection_timer.setSingleShot(True)
        self._nlp_detection_timer.timeout.connect(self._check_nlp_trigger)
        self._nlp_detection_timer.setInterval(500)  # Wait 500ms after typing stops

        if gemini_client:
            self.set_nlp_converter(gemini_client)

    def set_nlp_converter(self, gemini_client: object) -> None:
        """Set Gemini client for NLP conversion."""
        self._nlp_converter = NLPToJPEConverter(gemini_client)
        self._nlp_async_manager = AsyncNLPConversionManager(gemini_client)

        # Connect signals
        self._nlp_async_manager.conversion_ready.connect(
            self._on_nlp_conversion_ready
        )
        self._nlp_async_manager.progress.connect(self._on_nlp_progress)
        self._nlp_async_manager.error.connect(self._on_nlp_error)

    def keyPressEvent(self, event) -> None:
        """Override to detect // trigger."""
        super().keyPressEvent(event)

        # Detect // trigger after each keystroke
        self._nlp_detection_timer.stop()
        self._nlp_detection_timer.start()

    def _check_nlp_trigger(self) -> None:
        """Check if current line has // natural language prefix."""
        text = self.toPlainText()
        cursor = self.textCursor()
        cursor_pos = cursor.position()

        # Detect NLP trigger
        nlp_text = NLPToJPEConverter.detect_nlp_trigger(text, cursor_pos)

        if not nlp_text or not self._nlp_async_manager:
            return

        # Check if this is a new line (prevent re-triggering same line)
        current_line = self._get_current_line()
        if self._last_nlp_line == current_line:
            return

        self._last_nlp_line = current_line

        # Infer conversion type
        conversion_type = NLPToJPEConverter.infer_conversion_type(nlp_text)

        # Get code context
        context = text[:cursor_pos]

        # Request conversion
        self.nlp_conversion_started.emit()
        self._show_nlp_loading_popup()

        request = AsyncConversionRequest(
            natural_language=nlp_text,
            current_context=context,
            suggested_type=conversion_type
        )

        self._current_nlp_request_id = self._nlp_async_manager.request_conversion(request)

    def _get_current_line(self) -> str:
        """Get current line text."""
        cursor = self.textCursor()
        cursor.select(QTextCursor.LineUnderCursor)
        return cursor.selectedText()

    def _show_nlp_loading_popup(self) -> None:
        """Show loading indicator for NLP conversion."""
        if not self._completion_popup:
            self._completion_popup = CompletionPopup(self)

        self._completion_popup.list_widget.clear()
        loading_item = QListWidgetItem("⟳ Converting to JPE code...")
        self._completion_popup.list_widget.addItem(loading_item)
        self._completion_popup.show()

        cursor_rect = self.cursorRect()
        self._completion_popup.move_to_cursor(cursor_rect, self.mapToGlobal(self.pos()))

    def _on_nlp_conversion_ready(self, result) -> None:
        """Handle NLP conversion result."""
        if result.status == "success":
            self._show_nlp_suggestion(result.jpe_code, result.explanation, result.confidence)
            self.nlp_conversion_finished.emit(result.jpe_code)

        elif result.status == "partial":
            self._show_nlp_suggestion(result.jpe_code, result.explanation, result.confidence)
            self.nlp_conversion_finished.emit(result.jpe_code)

        else:
            self._hide_completions()
            self.nlp_conversion_failed.emit(result.error or "Conversion failed")

    def _show_nlp_suggestion(self, code: str, explanation: str, confidence: float) -> None:
        """Show NLP conversion suggestion in popup."""
        if not self._completion_popup:
            self._completion_popup = CompletionPopup(self)

        self._completion_popup.list_widget.clear()

        # Confidence indicator
        confidence_pct = int(confidence * 100)
        confidence_bar = self._create_confidence_bar(confidence)

        # Title
        title_item = QListWidgetItem(
            f"✓ JPE Code Generated ({confidence_pct}% confidence)"
        )
        title_item.setFont(self._make_bold_font())
        self._completion_popup.list_widget.addItem(title_item)

        # Confidence bar
        bar_item = QListWidgetItem(confidence_bar)
        self._completion_popup.list_widget.addItem(bar_item)

        # Explanation
        if explanation:
            explanation_item = QListWidgetItem(f"→ {explanation}")
            self._completion_popup.list_widget.addItem(explanation_item)

        # Code preview (truncated)
        code_lines = code.split('\n')[:3]
        code_preview = '\n'.join(code_lines)
        if len(code.split('\n')) > 3:
            code_preview += "\n  ..."

        code_item = QListWidgetItem(f"\n{code_preview}")
        self._completion_popup.list_widget.addItem(code_item)

        # Apply button
        apply_item = QListWidgetItem("\n[Enter] Apply  |  [Esc] Cancel")
        apply_item.setFont(self._make_bold_font())
        self._completion_popup.list_widget.addItem(apply_item)

        self._completion_popup.show()

        cursor_rect = self.cursorRect()
        self._completion_popup.move_to_cursor(cursor_rect, self.mapToGlobal(self.pos()))

        # Store code for apply
        self._nlp_generated_code = code

    def _on_nlp_progress(self, message: str) -> None:
        """Handle progress updates."""
        if self._completion_popup and self._completion_popup.isVisible():
            item = self._completion_popup.list_widget.item(0)
            if item:
                item.setText(f"⟳ {message}")

    def _on_nlp_error(self, error_msg: str) -> None:
        """Handle NLP conversion error."""
        self.nlp_conversion_failed.emit(error_msg)
        self._hide_completions()

    def _apply_nlp_code(self) -> None:
        """Apply generated NLP code at current position."""
        if not hasattr(self, '_nlp_generated_code'):
            return

        cursor = self.textCursor()
        current_line_num = cursor.blockNumber()

        # Find the // line
        text = self.toPlainText()
        lines = text.split('\n')

        if current_line_num >= len(lines):
            return

        # Replace the // line with generated code
        lines[current_line_num] = self._nlp_generated_code

        # Update editor
        self.setPlainText('\n'.join(lines))

        # Clear state
        self._last_nlp_line = None
        self._hide_completions()

    def _create_confidence_bar(self, confidence: float) -> str:
        """Create visual confidence bar."""
        bar_length = 20
        filled = int(bar_length * confidence)
        bar = "█" * filled + "░" * (bar_length - filled)
        return f"  [{bar}] {int(confidence * 100)}%"

    def _make_bold_font(self) -> QFont:
        """Get bold font."""
        font = self.font()
        font.setBold(True)
        return font

    def keyPressEvent_override(self, event) -> None:
        """Override key press for NLP suggestion handling."""
        # Check if we should apply NLP code
        if (event.key() == Qt.Key.Key_Return and
            self._completion_popup and
            self._completion_popup.isVisible() and
            hasattr(self, '_nlp_generated_code')):
            self._apply_nlp_code()
            return

        super().keyPressEvent(event)

    def cancel_nlp_conversion(self) -> None:
        """Cancel current NLP conversion."""
        if self._nlp_async_manager and self._current_nlp_request_id:
            self._nlp_async_manager.cancel_conversion(self._current_nlp_request_id)
        self._last_nlp_line = None
        self._hide_completions()

    def cleanup(self) -> None:
        """Cleanup NLP resources."""
        self._nlp_detection_timer.stop()
        if self._nlp_async_manager:
            self._nlp_async_manager.cleanup()
        super().cleanup()

    def __del__(self):
        """Cleanup on destruction."""
        self.cleanup()
