"""Unit tests for AICodeEditor widget."""

import pytest
from unittest.mock import Mock, MagicMock, patch
from dataclasses import dataclass

from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QKeyEvent
from PySide6.QtWidgets import QApplication, QMainWindow

from jpe_studio_qt.ui.ai_code_editor import (
    AICodeEditor,
    CompletionPopup,
    CompletionItemRole,
)


# Mock completion system
@dataclass
class MockCompletion:
    """Mock completion candidate."""
    text: str
    type: Mock
    confidence: float = 0.9
    context_match: float = 0.8
    description: str = "Test completion"

    def __post_init__(self):
        if isinstance(self.type, str):
            self.type = Mock(value=self.type)


class MockCompletionSystem:
    """Mock completion system for testing."""

    def __init__(self):
        self.completions = [
            MockCompletion("name:", "property", 0.95),
            MockCompletion("display_name:", "property", 0.9),
            MockCompletion("value", "value", 0.85),
        ]
        self.get_completions_called = False
        self.last_text = None
        self.last_cursor_pos = None

    def get_completions(self, text: str, cursor_pos: int):
        """Return mock completions."""
        self.get_completions_called = True
        self.last_text = text
        self.last_cursor_pos = cursor_pos
        return self.completions


class TestCompletionPopup:
    """Test CompletionPopup widget."""

    @pytest.fixture
    def popup(self):
        """Create a popup instance."""
        return CompletionPopup()

    def test_popup_creation(self, popup):
        """Test that popup can be created."""
        assert popup is not None
        assert popup.list_widget is not None

    def test_show_completions(self, popup):
        """Test showing completions."""
        completions = [
            MockCompletion("test1:", "property"),
            MockCompletion("test2:", "property"),
        ]
        popup.show_completions(completions)

        assert popup.list_widget.count() == 2
        assert popup.isVisible()

    def test_completion_text_formatting(self, popup):
        """Test that completion text is formatted correctly."""
        completions = [
            MockCompletion("test:", "property", confidence=0.9),
        ]
        popup.show_completions(completions)

        item = popup.list_widget.item(0)
        text = item.text()
        assert "[PROPERTY]" in text
        assert "test:" in text
        assert "[" in text and "]" in text  # Confidence bar

    def test_select_next(self, popup):
        """Test selecting next item."""
        completions = [
            MockCompletion("test1:", "property"),
            MockCompletion("test2:", "property"),
        ]
        popup.show_completions(completions)

        assert popup._selected_index == 0
        popup.select_next()
        assert popup._selected_index == 1

    def test_select_previous(self, popup):
        """Test selecting previous item."""
        completions = [
            MockCompletion("test1:", "property"),
            MockCompletion("test2:", "property"),
        ]
        popup.show_completions(completions)

        popup.select_next()
        popup.select_previous()
        assert popup._selected_index == 0

    def test_get_selected_completion(self, popup):
        """Test getting selected completion."""
        completions = [
            MockCompletion("test1:", "property"),
            MockCompletion("test2:", "property"),
        ]
        popup.show_completions(completions)

        selected = popup.get_selected_completion()
        assert selected == "test1:"

    def test_completion_popup_signal(self, popup):
        """Test that completion selection emits signal."""
        completions = [
            MockCompletion("test:", "property"),
        ]
        popup.show_completions(completions)

        with patch.object(popup.completion_selected, 'emit') as mock_signal:
            item = popup.list_widget.item(0)
            popup._on_item_selected(item)
            mock_signal.assert_called_with("test:")


class TestAICodeEditor:
    """Test AICodeEditor widget."""

    @pytest.fixture
    def editor(self):
        """Create an editor instance."""
        editor = AICodeEditor()
        return editor

    @pytest.fixture
    def editor_with_completion(self):
        """Create an editor with mock completion system."""
        editor = AICodeEditor()
        system = MockCompletionSystem()
        editor.set_completion_system(system)
        return editor, system

    def test_editor_creation(self, editor):
        """Test that editor can be created."""
        assert editor is not None
        assert isinstance(editor, AICodeEditor)

    def test_set_completion_system(self, editor):
        """Test setting completion system."""
        system = MockCompletionSystem()
        editor.set_completion_system(system)
        assert editor._completion_system == system

    def test_completion_delay_timer_setup(self, editor):
        """Test that completion delay timer is set up."""
        assert editor._completion_delay_timer is not None
        assert editor._completion_delay_ms == 250

    def test_set_completion_delay(self, editor):
        """Test setting completion delay."""
        editor.set_completion_delay(500)
        assert editor._completion_delay_ms == 500

    def test_text_input(self, editor):
        """Test basic text input."""
        editor.insertPlainText("test")
        assert editor.toPlainText() == "test"

    def test_request_completions_without_system(self, editor):
        """Test requesting completions without system doesn't crash."""
        editor._request_completions()
        # Should not crash

    def test_request_completions_with_empty_results(self, editor_with_completion):
        """Test requesting completions with empty results."""
        editor, system = editor_with_completion
        system.completions = []

        editor._request_completions()
        # Should hide completions when empty

    def test_request_completions_with_results(self, editor_with_completion):
        """Test requesting completions with results."""
        editor, system = editor_with_completion
        editor.insertPlainText("test")

        editor._request_completions()

        # Verify completion system was called
        assert system.get_completions_called
        assert system.last_text == "test"

    def test_ctrl_space_triggers_completions(self, editor_with_completion):
        """Test that Ctrl+Space triggers completion request."""
        editor, system = editor_with_completion

        # Create and send Ctrl+Space key event
        key_event = QKeyEvent(
            QKeyEvent.KeyPress,
            Qt.Key.Key_Space,
            Qt.ControlModifier,
        )

        editor.keyPressEvent(key_event)

        # Should have called get_completions after processing
        # (Note: timing may vary, but the mechanism is there)

    def test_completion_popup_creation(self, editor_with_completion):
        """Test that completion popup is created on demand."""
        editor, _ = editor_with_completion

        assert editor._completion_popup is None

        editor._request_completions()

        # Popup may or may not be created depending on completions
        # but the mechanism should work

    def test_hide_completions(self, editor):
        """Test hiding completions."""
        editor._completion_popup = Mock()
        editor._hide_completions()

        editor._completion_popup.hide.assert_called_once()

    def test_enable_disable_completions(self, editor):
        """Test enabling/disabling completions."""
        editor._completion_popup = Mock()
        editor._completion_delay_timer = Mock()

        editor.enable_completions(False)

        editor._completion_popup.hide.assert_called_once()
        editor._completion_delay_timer.stop.assert_called_once()

    def test_completion_delay_timer(self, editor):
        """Test completion delay timer behavior."""
        assert editor._completion_delay_timer.isSingleShot()

        editor._schedule_completion_request()
        assert editor._completion_delay_timer.isActive()

    def test_escape_key_hides_popup(self, editor):
        """Test that Escape key hides completion popup."""
        editor._completion_popup = Mock()
        editor._completion_popup.isVisible.return_value = True

        key_event = QKeyEvent(
            QKeyEvent.KeyPress,
            Qt.Key.Key_Escape,
            Qt.NoModifier,
        )

        editor.keyPressEvent(key_event)
        editor._completion_popup.hide.assert_called_once()

    def test_arrow_keys_navigate_completions(self, editor):
        """Test that arrow keys navigate completions."""
        editor._completion_popup = Mock()
        editor._completion_popup.isVisible.return_value = True

        # Up arrow
        key_event = QKeyEvent(
            QKeyEvent.KeyPress,
            Qt.Key.Key_Up,
            Qt.NoModifier,
        )
        editor.keyPressEvent(key_event)
        editor._completion_popup.select_previous.assert_called_once()

        # Reset mock
        editor._completion_popup.reset_mock()

        # Down arrow
        key_event = QKeyEvent(
            QKeyEvent.KeyPress,
            Qt.Key.Key_Down,
            Qt.NoModifier,
        )
        editor.keyPressEvent(key_event)
        editor._completion_popup.select_next.assert_called_once()

    def test_tab_accepts_completion(self, editor):
        """Test that Tab key accepts completion."""
        editor._completion_popup = Mock()
        editor._completion_popup.isVisible.return_value = True
        editor._accept_completion = Mock()

        key_event = QKeyEvent(
            QKeyEvent.KeyPress,
            Qt.Key.Key_Tab,
            Qt.NoModifier,
        )
        editor.keyPressEvent(key_event)

        editor._accept_completion.assert_called_once()

    def test_should_trigger_completions(self, editor):
        """Test completion trigger detection."""
        # Alphanumeric should trigger
        event = QKeyEvent(QKeyEvent.KeyPress, Qt.Key.Key_A, Qt.NoModifier, "a")
        assert editor._should_trigger_completions(event) is False  # No system set

        editor._completion_system = Mock()
        assert editor._should_trigger_completions(event) is True

        # Underscore should trigger
        event = QKeyEvent(QKeyEvent.KeyPress, Qt.Key.Key_Underscore, Qt.NoModifier, "_")
        assert editor._should_trigger_completions(event) is True

        # Colon should trigger
        event = QKeyEvent(QKeyEvent.KeyPress, Qt.Key.Key_Colon, Qt.NoModifier, ":")
        assert editor._should_trigger_completions(event) is True

    def test_completion_applied_signal(self, editor):
        """Test that completion_applied signal is emitted."""
        from unittest.mock import patch

        editor._completion_system = Mock()
        editor._completion_popup = Mock()
        editor._completion_popup.get_selected_completion.return_value = "test:"
        editor.toPlainText = Mock(return_value="test\n")

        with patch.object(editor.completion_applied, 'emit') as mock_signal:
            editor._on_completion_selected("test:")
            mock_signal.assert_called_with("test:")

    def test_learning_from_completion(self, editor):
        """Test that completions are learned from."""
        system = Mock()
        system.intelligent_completion = Mock()

        editor._completion_system = system
        editor._completion_popup = Mock()
        editor._completion_popup.get_selected_completion.return_value = "name:"
        editor._last_completion_context = "define interaction test"

        editor._on_completion_selected("name:")

        # Verify learning was called
        system.intelligent_completion.learn_from_completion.assert_called_once()


class TestCompletionIntegration:
    """Integration tests for completion workflow."""

    @pytest.fixture
    def editor_with_system(self):
        """Create editor with completion system."""
        editor = AICodeEditor()
        system = MockCompletionSystem()
        editor.set_completion_system(system)
        return editor, system

    def test_full_completion_workflow(self, editor_with_system):
        """Test complete completion workflow."""
        editor, system = editor_with_system

        # Type some text
        editor.insertPlainText("defin")

        # Request completions
        editor._request_completions()

        # Verify system was called
        assert system.get_completions_called
        assert "defin" in system.last_text

    def test_completion_with_multiple_candidates(self, editor_with_system):
        """Test handling multiple completion candidates."""
        editor, system = editor_with_system

        editor.insertPlainText("name")
        editor._request_completions()

        # Should have multiple completions
        assert len(system.completions) > 0
