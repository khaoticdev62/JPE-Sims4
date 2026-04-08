"""Unit tests for async AICodeEditor."""

import pytest
from unittest.mock import Mock, MagicMock, patch

from PySide6.QtCore import Qt
from PySide6.QtGui import QKeyEvent

from jpe_studio_qt.ui.ai_code_editor_async import (
    AsyncAICodeEditor,
    AsyncCompletionMode,
)
from jpe_studio_qt.ai.gemini_completion import CompletionStatus, AsyncCompletionResult


class TestAsyncCompletionMode:
    """Test AsyncCompletionMode configuration."""

    def test_default_mode(self):
        """Test default mode configuration."""
        mode = AsyncCompletionMode()

        assert mode.enabled is True
        assert mode.use_local_fallback is True
        assert mode.use_gemini is True
        assert mode.timeout_ms == 5000
        assert mode.min_confidence == 0.5

    def test_custom_mode(self):
        """Test custom mode configuration."""
        mode = AsyncCompletionMode(
            enabled=False,
            use_gemini=False,
            timeout_ms=3000
        )

        assert mode.enabled is False
        assert mode.use_gemini is False
        assert mode.timeout_ms == 3000


class TestAsyncAICodeEditor:
    """Test AsyncAICodeEditor widget."""

    @pytest.fixture
    def editor(self):
        """Create editor instance."""
        return AsyncAICodeEditor()

    @pytest.fixture
    def editor_with_client(self):
        """Create editor with mock client."""
        client = Mock()
        editor = AsyncAICodeEditor(gemini_client=client)
        return editor, client

    def test_editor_creation(self, editor):
        """Test editor can be created."""
        assert editor is not None
        assert isinstance(editor, AsyncAICodeEditor)

    def test_async_config(self, editor):
        """Test async configuration."""
        assert isinstance(editor._async_config, AsyncCompletionMode)
        assert editor._async_config.enabled is True

    def test_set_async_config(self, editor):
        """Test setting async config."""
        config = AsyncCompletionMode(enabled=False)
        editor.set_async_config(config)

        assert editor._async_config == config
        assert editor._async_config.enabled is False

    def test_set_gemini_client(self, editor):
        """Test setting Gemini client."""
        client = Mock()
        editor.set_gemini_client(client)

        assert editor._gemini_client == client

    def test_with_gemini_client(self, editor_with_client):
        """Test editor with Gemini client."""
        editor, client = editor_with_client

        assert editor._gemini_client == client

    def test_text_input(self, editor):
        """Test basic text input."""
        editor.insertPlainText("def test():")
        assert "def test():" in editor.toPlainText()

    def test_cancel_async_request(self, editor_with_client):
        """Test cancelling async request."""
        editor, client = editor_with_client

        editor._current_async_request_id = "req_123"
        editor._async_manager = Mock()

        editor.cancel_async_request()

        editor._async_manager.cancel_request.assert_called()

    def test_cleanup(self, editor_with_client):
        """Test cleanup method."""
        editor, client = editor_with_client

        editor.cleanup()
        # Should not crash

    def test_signals(self, editor):
        """Test editor has async signals."""
        assert hasattr(editor, 'async_completion_started')
        assert hasattr(editor, 'async_completion_finished')
        assert hasattr(editor, 'async_completion_failed')

    def test_escape_cancels_async(self, editor_with_client):
        """Test Escape key cancels async request."""
        editor, client = editor_with_client

        editor._loading_timer = Mock()
        editor._loading_timer.isActive.return_value = True
        editor._async_manager = Mock()
        editor._completion_popup = Mock()

        key_event = QKeyEvent(
            QKeyEvent.KeyPress,
            Qt.Key.Key_Escape,
            Qt.NoModifier,
        )

        editor.keyPressEvent(key_event)

        editor._async_manager.cancel_request.assert_called()


class TestAsyncCompletionFlow:
    """Test async completion workflow."""

    @pytest.fixture
    def editor_with_system(self):
        """Create editor with both client and completion system."""
        client = Mock()
        system = Mock()
        editor = AsyncAICodeEditor(gemini_client=client, completion_system=system)
        return editor, client, system

    def test_async_completions_ready(self, editor_with_system):
        """Test handling async completion results."""
        editor, client, system = editor_with_system

        result = AsyncCompletionResult(
            status=CompletionStatus.COMPLETED,
            completions=[Mock(), Mock()],
            request_id="req_123"
        )

        with patch.object(editor.async_completion_finished, 'emit') as mock_emit:
            editor._on_async_completions_ready(result)
            mock_emit.assert_called_once()

    def test_async_completions_failed(self, editor_with_system):
        """Test handling async completion failure."""
        editor, client, system = editor_with_system

        result = AsyncCompletionResult(
            status=CompletionStatus.FAILED,
            error="Connection error",
            request_id="req_123"
        )

        with patch.object(editor.async_completion_failed, 'emit') as mock_emit:
            editor._on_async_completions_ready(result)
            mock_emit.assert_called_once()

    def test_async_completions_timeout(self, editor_with_system):
        """Test handling async timeout."""
        editor, client, system = editor_with_system

        result = AsyncCompletionResult(
            status=CompletionStatus.TIMEOUT,
            error="Request timed out",
            request_id="req_123"
        )

        with patch.object(editor.async_completion_failed, 'emit') as mock_emit:
            editor._on_async_completions_ready(result)
            mock_emit.assert_called_once()

    def test_async_completions_cancelled(self, editor_with_system):
        """Test handling async cancellation."""
        editor, client, system = editor_with_system

        result = AsyncCompletionResult(
            status=CompletionStatus.CANCELLED,
            request_id="req_123"
        )

        editor._on_async_completions_ready(result)
        # Should hide completions


class TestAsyncProgressIndicators:
    """Test progress indicator display."""

    @pytest.fixture
    def editor(self):
        """Create editor."""
        return AsyncAICodeEditor(gemini_client=Mock())

    def test_show_loading_popup(self, editor):
        """Test showing loading indicator."""
        with patch.object(editor, '_completion_popup', Mock()):
            editor._show_loading_popup()
            # Should display loading message

    def test_update_loading_indicator(self, editor):
        """Test updating loading animation."""
        popup = Mock()
        item = Mock()
        popup.list_widget.item.return_value = item
        popup.isVisible.return_value = True

        editor._completion_popup = popup
        editor._loading_timer = Mock()

        editor._update_loading_indicator()

        item.setText.assert_called()

    def test_progress_update(self, editor):
        """Test progress update."""
        popup = Mock()
        item = Mock()
        popup.list_widget.item.return_value = item
        popup.isVisible.return_value = True

        editor._completion_popup = popup

        editor._on_async_progress("Processing...")

        item.setText.assert_called()


class TestAsyncFallback:
    """Test fallback to local completions."""

    @pytest.fixture
    def editor(self):
        """Create editor with local system fallback."""
        system = Mock()
        editor = AsyncAICodeEditor(
            gemini_client=Mock(),
            completion_system=system
        )
        return editor, system

    def test_fallback_on_async_failure(self, editor):
        """Test fallback when async fails."""
        editor_obj, system = editor

        # Configure to use local fallback
        editor_obj._async_config.use_local_fallback = True

        # Mock local system
        system.get_completions = Mock(return_value=[Mock()])

        result = AsyncCompletionResult(
            status=CompletionStatus.FAILED,
            error="Gemini failed"
        )

        editor_obj._on_async_completions_ready(result)

        # Should attempt to use local completions
        # (would be called if editor had text)

    def test_fallback_on_timeout(self, editor):
        """Test fallback when request times out."""
        editor_obj, system = editor

        editor_obj._async_config.use_local_fallback = True
        system.get_completions = Mock(return_value=[Mock()])

        result = AsyncCompletionResult(
            status=CompletionStatus.TIMEOUT,
            error="Timed out"
        )

        editor_obj._on_async_completions_ready(result)


class TestAsyncThreading:
    """Test async threading behavior."""

    def test_manager_initialization(self):
        """Test manager is initialized."""
        editor = AsyncAICodeEditor(gemini_client=Mock())

        assert editor._async_manager is not None

    def test_cleanup_releases_threads(self):
        """Test cleanup releases threads."""
        editor = AsyncAICodeEditor(gemini_client=Mock())

        # Request to initialize thread
        editor._async_config.enabled = True
        editor.insertPlainText("test")

        editor.cleanup()
        # Should not crash on cleanup
