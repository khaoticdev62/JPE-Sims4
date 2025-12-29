"""
Async-enhanced AICodeEditor with Gemini completions.

Extends AICodeEditor to support asynchronous completions from Gemini API
while maintaining local completions as fallback.

Features:
- Async Gemini completion fetching
- Local completion fallback
- Progress indicators
- Request cancellation
- Hybrid completion mode (local + Gemini)
"""

from __future__ import annotations

from typing import Optional, List
from dataclasses import dataclass

from PySide6.QtCore import Qt, Signal, QTimer

from jpe_studio_qt.ui.ai_code_editor import AICodeEditor, CompletionPopup
from jpe_studio_qt.ai.gemini_completion import (
    AsyncGeminiCompletionManager,
    CompletionStatus,
)


@dataclass
class AsyncCompletionMode:
    """Configuration for async completion mode."""
    enabled: bool = True
    use_local_fallback: bool = True
    use_gemini: bool = True
    timeout_ms: int = 5000
    min_confidence: float = 0.5


class AsyncAICodeEditor(AICodeEditor):
    """
    AI code editor with async Gemini completions.

    Extends AICodeEditor with:
    - Asynchronous Gemini API calls
    - Non-blocking UI
    - Local completion fallback
    - Hybrid completion mode
    - Progress indicators
    """

    # Signals
    async_completion_started = Signal()
    async_completion_finished = Signal()
    async_completion_failed = Signal(str)  # Error message

    def __init__(self, *, language: str = "xml",
                 gemini_client: Optional[object] = None,
                 completion_system: Optional[object] = None,
                 parent: Optional[object] = None) -> None:
        """
        Initialize async editor.

        Args:
            language: Language for syntax highlighting
            gemini_client: GeminiClient instance for async completions
            completion_system: Completion system for local completions
            parent: Parent widget
        """
        super().__init__(language=language,
                        completion_system=completion_system,
                        parent=parent)

        self._async_config = AsyncCompletionMode()
        self._async_manager: Optional[AsyncGeminiCompletionManager] = None
        self._current_async_request_id: Optional[str] = None
        self._gemini_client = gemini_client

        # Timer to show "Loading..." indicator
        self._loading_timer = QTimer()
        self._loading_timer.timeout.connect(self._update_loading_indicator)

        if gemini_client:
            self._init_async_manager()

    def set_gemini_client(self, client: object) -> None:
        """Set or update the Gemini client."""
        self._gemini_client = client
        if not self._async_manager:
            self._init_async_manager()
        else:
            self._async_manager.set_client(client)

    def _init_async_manager(self) -> None:
        """Initialize async completion manager."""
        if not self._gemini_client:
            return

        self._async_manager = AsyncGeminiCompletionManager(
            self._gemini_client,
            timeout_ms=self._async_config.timeout_ms
        )

        # Connect signals
        self._async_manager.completions_ready.connect(
            self._on_async_completions_ready
        )
        self._async_manager.progress.connect(self._on_async_progress)
        self._async_manager.error.connect(self._on_async_error)

    def set_async_config(self, config: AsyncCompletionMode) -> None:
        """Set async completion configuration."""
        self._async_config = config

    def _request_completions(self) -> None:
        """Override to use async Gemini if available."""
        if not self._async_config.enabled or not self._async_manager:
            # Fallback to local completions
            super()._request_completions()
            return

        try:
            text = self.toPlainText()
            cursor = self.textCursor()
            cursor_pos = cursor.position()

            # Get current line
            lines = text.split('\n')
            current_line_idx = 0
            chars_counted = 0

            for i, line in enumerate(lines):
                if chars_counted + len(line) + 1 >= cursor_pos:
                    current_line_idx = i
                    break
                chars_counted += len(line) + 1

            position_in_line = cursor_pos - chars_counted
            current_line = lines[current_line_idx][:position_in_line] \
                if current_line_idx < len(lines) else ""

            # Get context
            context_lines = lines[:current_line_idx + 1]
            if context_lines:
                context_lines[-1] = current_line
            context_text = '\n'.join(context_lines)

            # Request both local and async completions
            if self._async_config.use_local_fallback and self._completion_system:
                # Get local completions as fallback
                local_completions = self._completion_system.get_completions(
                    text, cursor_pos
                )
                if local_completions:
                    self._show_completions(local_completions)
            else:
                # Show loading indicator
                self._show_loading_popup()

            # Request async Gemini completions
            self.async_completion_started.emit()
            self._current_async_request_id = self._async_manager.request_completions(
                context_text, current_line
            )
            self._loading_timer.start(300)  # Show loading every 300ms

        except Exception as e:
            self.async_completion_failed.emit(str(e))
            super()._request_completions()  # Fallback

    def _show_completions(self, completions: List) -> None:
        """Show completions in popup."""
        if not self._completion_popup:
            self._completion_popup = CompletionPopup(self)
            self._completion_popup.completion_selected.connect(
                self._on_completion_selected
            )

        self._completion_popup.show_completions(completions)

        cursor_rect = self.cursorRect()
        self._completion_popup.move_to_cursor(cursor_rect, self.mapToGlobal(self.pos()))

    def _show_loading_popup(self) -> None:
        """Show loading indicator in completion popup."""
        if not self._completion_popup:
            self._completion_popup = CompletionPopup(self)

        # Clear and show loading indicator
        self._completion_popup.list_widget.clear()
        from PySide6.QtWidgets import QListWidgetItem
        loading_item = QListWidgetItem("⟳ Fetching completions from Gemini...")
        self._completion_popup.list_widget.addItem(loading_item)
        self._completion_popup.show()

        cursor_rect = self.cursorRect()
        self._completion_popup.move_to_cursor(cursor_rect, self.mapToGlobal(self.pos()))

    def _update_loading_indicator(self) -> None:
        """Update loading indicator animation."""
        if not self._completion_popup or not self._completion_popup.isVisible():
            self._loading_timer.stop()
            return

        # Cycle through loading states
        item = self._completion_popup.list_widget.item(0)
        if item:
            text = item.text()
            # Rotate loading spinner
            spinner = "⟳⟳⟲⟲"
            current_index = len(text) % len(spinner)
            new_text = f"{spinner[current_index]} Fetching completions from Gemini..."
            item.setText(new_text)

    def _on_async_completions_ready(self, result) -> None:
        """Handle async completion results."""
        self._loading_timer.stop()

        if result.status == CompletionStatus.COMPLETED:
            if result.completions:
                self._show_completions(result.completions)
            else:
                self._hide_completions()
            self.async_completion_finished.emit()

        elif result.status == CompletionStatus.FAILED:
            self.async_completion_failed.emit(result.error or "Unknown error")
            # Try local completions as fallback
            if self._async_config.use_local_fallback and self._completion_system:
                text = self.toPlainText()
                cursor = self.textCursor()
                cursor_pos = cursor.position()
                local_completions = self._completion_system.get_completions(
                    text, cursor_pos
                )
                if local_completions:
                    self._show_completions(local_completions)

        elif result.status == CompletionStatus.TIMEOUT:
            self.async_completion_failed.emit("Gemini request timed out")
            # Fallback to local
            if self._async_config.use_local_fallback and self._completion_system:
                text = self.toPlainText()
                cursor = self.textCursor()
                cursor_pos = cursor.position()
                local_completions = self._completion_system.get_completions(
                    text, cursor_pos
                )
                if local_completions:
                    self._show_completions(local_completions)

        elif result.status == CompletionStatus.CANCELLED:
            self._hide_completions()

    def _on_async_progress(self, message: str) -> None:
        """Handle progress updates."""
        if self._completion_popup and self._completion_popup.isVisible():
            item = self._completion_popup.list_widget.item(0)
            if item:
                item.setText(f"⟳ {message}")

    def _on_async_error(self, error_msg: str) -> None:
        """Handle async errors."""
        self.async_completion_failed.emit(error_msg)

    def cancel_async_request(self) -> None:
        """Cancel the current async request."""
        if self._async_manager and self._current_async_request_id:
            self._async_manager.cancel_request(self._current_async_request_id)
            self._loading_timer.stop()

    def keyPressEvent(self, event) -> None:
        """Handle keyboard events, including Escape to cancel async."""
        if event.key() == Qt.Key.Key_Escape and self._loading_timer.isActive():
            self.cancel_async_request()
            self._hide_completions()
            return

        super().keyPressEvent(event)

    def cleanup(self) -> None:
        """Cleanup async resources."""
        self._loading_timer.stop()
        if self._async_manager:
            self._async_manager.cleanup()

    def __del__(self):
        """Cleanup on destruction."""
        self.cleanup()
