"""Unit tests for unified AI assistant panel."""

import pytest
from unittest.mock import Mock, patch
from PySide6.QtWidgets import QApplication

from jpe_studio_qt.ui.ai_assistant_unified import (
    AIAssistantPanel, AIAssistantManager, AssistantAction, AssistantTab
)


@pytest.fixture(scope="session")
def qapp():
    """Create QApplication for tests."""
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    return app


class TestAssistantAction:
    """Test AssistantAction dataclass."""

    def test_action_creation(self):
        """Test creating an assistant action."""
        callback = Mock()

        action = AssistantAction(
            title="Fix Error",
            description="Apply auto-fix for missing tag",
            category="fix",
            icon="check_circle",
            callback=callback,
            priority=2
        )

        assert action.title == "Fix Error"
        assert action.description == "Apply auto-fix for missing tag"
        assert action.category == "fix"
        assert action.icon == "check_circle"
        assert action.callback == callback
        assert action.priority == 2

    def test_action_defaults(self):
        """Test action with defaults."""
        action = AssistantAction(
            title="Suggestion",
            description="Code suggestion",
            category="suggestion",
            icon="lightbulb"
        )

        assert action.callback is None
        assert action.data is None
        assert action.priority == 0


class TestAssistantTab:
    """Test AssistantTab enum."""

    def test_tabs_exist(self):
        """Test all tabs exist."""
        assert AssistantTab.SUGGESTIONS.value == "suggestions"
        assert AssistantTab.FIXES.value == "fixes"
        assert AssistantTab.INSIGHTS.value == "insights"
        assert AssistantTab.ANALYSIS.value == "analysis"
        assert AssistantTab.DOCS.value == "docs"


class TestAIAssistantPanel:
    """Test AI Assistant Panel."""

    @pytest.fixture
    def panel(self, qapp):
        """Create assistant panel for testing."""
        return AIAssistantPanel()

    def test_panel_creation(self, panel):
        """Test panel can be created."""
        assert panel is not None
        assert hasattr(panel, '_search_input')
        assert hasattr(panel, '_results_list')
        assert hasattr(panel, '_actions')

    def test_add_single_action(self, panel):
        """Test adding a single action."""
        action = AssistantAction(
            title="Test Fix",
            description="Test description",
            category="fix",
            icon="check_circle",
            priority=1
        )

        panel.add_action(action)

        assert len(panel._actions) == 1
        assert panel._actions[0].title == "Test Fix"

    def test_add_multiple_actions(self, panel):
        """Test adding multiple actions."""
        actions = [
            AssistantAction(
                title=f"Action {i}",
                description=f"Description {i}",
                category="suggestion",
                icon="lightbulb",
                priority=i
            )
            for i in range(3)
        ]

        panel.add_actions(actions)

        assert len(panel._actions) == 3

    def test_actions_sorted_by_priority(self, panel):
        """Test actions are sorted by priority."""
        actions = [
            AssistantAction(
                title="Low Priority",
                description="Low",
                category="suggestion",
                icon="bulb",
                priority=0
            ),
            AssistantAction(
                title="High Priority",
                description="High",
                category="fix",
                icon="check",
                priority=2
            ),
            AssistantAction(
                title="Medium Priority",
                description="Medium",
                category="insight",
                icon="info",
                priority=1
            ),
        ]

        panel.add_actions(actions)

        # Should be sorted by priority (highest first)
        assert panel._actions[0].priority == 2
        assert panel._actions[1].priority == 1
        assert panel._actions[2].priority == 0

    def test_filter_actions_empty_query(self, panel):
        """Test filtering with empty query returns all."""
        actions = [
            AssistantAction(
                title="Fix 1",
                description="Desc 1",
                category="fix",
                icon="check"
            ),
            AssistantAction(
                title="Suggestion 2",
                description="Desc 2",
                category="suggestion",
                icon="bulb"
            ),
        ]

        panel.add_actions(actions)
        panel._filter_actions("")

        assert len(panel._filtered_actions) == 2

    def test_filter_actions_by_title(self, panel):
        """Test filtering by title."""
        actions = [
            AssistantAction(
                title="Fix Error",
                description="Fix description",
                category="fix",
                icon="check"
            ),
            AssistantAction(
                title="Suggest Change",
                description="Suggestion description",
                category="suggestion",
                icon="bulb"
            ),
        ]

        panel.add_actions(actions)
        panel._filter_actions("fix")

        assert len(panel._filtered_actions) == 1
        assert panel._filtered_actions[0].title == "Fix Error"

    def test_filter_actions_by_description(self, panel):
        """Test filtering by description."""
        actions = [
            AssistantAction(
                title="Action 1",
                description="error fix",
                category="fix",
                icon="check"
            ),
            AssistantAction(
                title="Action 2",
                description="code analysis",
                category="analysis",
                icon="info"
            ),
        ]

        panel.add_actions(actions)
        panel._filter_actions("error")

        assert len(panel._filtered_actions) == 1

    def test_filter_actions_case_insensitive(self, panel):
        """Test filtering is case insensitive."""
        action = AssistantAction(
            title="FIX ERROR",
            description="Description",
            category="fix",
            icon="check"
        )

        panel.add_action(action)
        panel._filter_actions("fix")

        assert len(panel._filtered_actions) == 1

    def test_clear_actions(self, panel):
        """Test clearing all actions."""
        actions = [
            AssistantAction(
                title=f"Action {i}",
                description=f"Desc {i}",
                category="suggestion",
                icon="bulb"
            )
            for i in range(3)
        ]

        panel.add_actions(actions)
        assert len(panel._actions) == 3

        panel.clear_actions()

        assert len(panel._actions) == 0
        assert len(panel._filtered_actions) == 0

    def test_set_actions_replaces_existing(self, panel):
        """Test set_actions replaces existing."""
        # Add initial actions
        panel.add_action(AssistantAction(
            title="Old",
            description="Old action",
            category="fix",
            icon="check"
        ))

        assert len(panel._actions) == 1

        # Set new actions
        new_actions = [
            AssistantAction(
                title="New 1",
                description="New action 1",
                category="suggestion",
                icon="bulb"
            ),
            AssistantAction(
                title="New 2",
                description="New action 2",
                category="insight",
                icon="info"
            ),
        ]

        panel.set_actions(new_actions)

        assert len(panel._actions) == 2
        assert panel._actions[0].title == "New 1"

    def test_action_callback_execution(self, panel):
        """Test action callback is called."""
        callback = Mock()

        action = AssistantAction(
            title="Test",
            description="Test",
            category="fix",
            icon="check",
            callback=callback
        )

        panel.add_action(action)
        panel._on_action_triggered(action)

        assert callback.called

    def test_signal_emission(self, panel):
        """Test panel emits action_triggered signal."""
        action = AssistantAction(
            title="Test",
            description="Test",
            category="fix",
            icon="check"
        )

        mock_signal = Mock()
        panel.action_triggered = mock_signal

        panel._on_action_triggered(action)

        assert mock_signal.emit.called


class TestAIAssistantManager:
    """Test AI Assistant Manager."""

    def test_manager_creation(self):
        """Test manager can be created."""
        manager = AIAssistantManager()
        assert manager is not None
        assert len(manager.get_actions()) == 0

    def test_register_single_action(self):
        """Test registering a single action."""
        manager = AIAssistantManager()

        action = AssistantAction(
            title="Test",
            description="Test",
            category="fix",
            icon="check"
        )

        manager.register_action(action)

        assert len(manager.get_actions()) == 1
        assert manager.get_actions()[0].title == "Test"

    def test_register_multiple_actions(self):
        """Test registering multiple actions."""
        manager = AIAssistantManager()

        actions = [
            AssistantAction(
                title=f"Action {i}",
                description=f"Desc {i}",
                category="suggestion",
                icon="bulb"
            )
            for i in range(3)
        ]

        manager.register_actions(actions)

        assert len(manager.get_actions()) == 3

    def test_create_panel(self, qapp):
        """Test creating panel from manager."""
        manager = AIAssistantManager()
        panel = manager.create_panel()

        assert panel is not None
        assert isinstance(panel, AIAssistantPanel)

    def test_panel_created_once(self, qapp):
        """Test panel is created only once."""
        manager = AIAssistantManager()
        panel1 = manager.create_panel()
        panel2 = manager.create_panel()

        assert panel1 is panel2

    def test_actions_added_to_panel(self, qapp):
        """Test registered actions are added to panel."""
        manager = AIAssistantManager()
        panel = manager.create_panel()

        action = AssistantAction(
            title="Test",
            description="Test",
            category="fix",
            icon="check"
        )

        manager.register_action(action)

        assert len(panel._actions) == 1

    def test_action_callback_in_manager(self, qapp):
        """Test action callback is called via manager."""
        manager = AIAssistantManager()
        callback = Mock()

        action = AssistantAction(
            title="Test",
            description="Test",
            category="fix",
            icon="check",
            callback=callback
        )

        manager.register_action(action)

        # Trigger through manager
        manager._on_action_triggered(action)

        assert callback.called

    def test_get_actions_returns_copy(self):
        """Test get_actions returns a copy."""
        manager = AIAssistantManager()

        action = AssistantAction(
            title="Test",
            description="Test",
            category="fix",
            icon="check"
        )

        manager.register_action(action)

        actions = manager.get_actions()
        actions.append(AssistantAction(
            title="New",
            description="New",
            category="suggestion",
            icon="bulb"
        ))

        # Original should not be modified
        assert len(manager.get_actions()) == 1
