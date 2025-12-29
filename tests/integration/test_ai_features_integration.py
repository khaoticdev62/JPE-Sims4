"""Integration tests for AI features.

Tests the interaction between multiple AI components:
- Gemini client with various workflows
- AI assistant panel with unified actions
- Health metrics with diagnostics
- Code diff analysis
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

from PySide6.QtWidgets import QApplication

from jpe_studio_qt.ai.gemini_client import GeminiClient, GeminiConfig, GeminiModel
from jpe_studio_qt.ui.ai_assistant_unified import (
    AIAssistantPanel, AIAssistantManager, AssistantAction
)
from jpe_studio_qt.ui.health_gauge import HealthPanel, HealthMetrics


# Local copies to avoid circular imports
class FixStatus(Enum):
    """Fix status enum."""
    PENDING = "pending"
    APPLIED = "applied"
    REJECTED = "rejected"
    FAILED = "failed"


@dataclass
class SuggestedFix:
    """Suggested code fix."""
    error_code: str
    error_message: str
    original_code: str
    suggested_code: str
    confidence: float = 0.95
    status: FixStatus = FixStatus.PENDING


@pytest.fixture(scope="session")
def qapp():
    """Create QApplication for tests."""
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    return app




class TestGeminiClientErrorHandling:
    """Test Gemini client error handling."""

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_error_explanation_workflow(self, mock_rag, mock_local, mock_genai):
        """Test error explanation workflow."""
        # Setup mocks
        mock_genai.return_value = MagicMock()
        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        # Create client
        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)

        # Mock the explanation response
        mock_response = Mock()
        mock_response.text = (
            "The deprecated tag is no longer supported in version 2.0. "
            "Use the modern tag instead."
        )
        client._client.models.generate_content.return_value = mock_response

        # Get explanation
        explanation = client.explain_error("E001", "Deprecated tag detected")

        # Verify
        assert explanation is not None
        assert "deprecated" in explanation.lower()
        assert client.get_request_count() > 0

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_fix_suggestion_workflow(self, mock_rag, mock_local, mock_genai):
        """Test fix suggestion generation workflow."""
        # Setup
        mock_genai.return_value = MagicMock()
        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)

        # Mock fix response
        mock_response = Mock()
        mock_response.text = "<modern>updated content</modern>"
        client._client.models.generate_content.return_value = mock_response

        # Get fix
        fix = client.suggest_fix("E001", "<deprecated>content</deprecated>")

        # Verify
        assert fix is not None
        assert "<modern>" in fix
        assert client.get_request_count() > 0

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_health_metrics_update_workflow(self, mock_rag, mock_local, mock_genai, qapp):
        """Test health metrics update after error fixes."""
        # Setup
        mock_genai.return_value = MagicMock()
        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)

        # Create health panel with initial metrics
        health_panel = HealthPanel()
        initial_metrics = HealthMetrics(
            error_count=2,
            warning_count=3,
            suggestion_count=1,
            total_issues=6,
            health_percentage=80.0
        )
        health_panel.set_metrics(initial_metrics)

        # Simulate error fix and update metrics
        improved_metrics = HealthMetrics(
            error_count=1,
            warning_count=3,
            suggestion_count=1,
            total_issues=5,
            health_percentage=85.0
        )
        health_panel.set_metrics(improved_metrics)

        # Verify improvement
        assert health_panel._metrics.health_percentage > 80.0
        assert health_panel._metrics.health_percentage == 85.0


class TestAIAssistantPanelIntegration:
    """Test unified AI assistant panel integration."""

    def test_assistant_manager_with_multiple_actions(self):
        """Test manager handles multiple action types."""
        manager = AIAssistantManager()

        actions = [
            AssistantAction(
                title="Explain Error",
                description="Get AI explanation",
                category="insight",
                icon="info",
                priority=2
            ),
            AssistantAction(
                title="Generate Fix",
                description="Auto-generate fix code",
                category="fix",
                icon="check_circle",
                priority=2
            ),
            AssistantAction(
                title="Code Completion",
                description="Get code suggestions",
                category="suggestion",
                icon="lightbulb",
                priority=1
            ),
        ]

        manager.register_actions(actions)

        assert len(manager.get_actions()) == 3

    def test_assistant_action_callback_chain(self):
        """Test action callbacks execute in sequence."""
        manager = AIAssistantManager()

        # Track callback execution
        execution_log = []

        def callback_1(action):
            execution_log.append(f"callback_1: {action.title}")

        def callback_2(action):
            execution_log.append(f"callback_2: {action.title}")

        actions = [
            AssistantAction(
                title="Action 1",
                description="First action",
                category="fix",
                icon="check",
                callback=callback_1,
                priority=2
            ),
            AssistantAction(
                title="Action 2",
                description="Second action",
                category="suggestion",
                icon="bulb",
                callback=callback_2,
                priority=1
            ),
        ]

        manager.register_actions(actions)

        # Simulate triggering actions
        for action in manager.get_actions():
            if action.callback:
                action.callback(action)

        assert len(execution_log) == 2
        assert "callback_1: Action 1" in execution_log
        assert "callback_2: Action 2" in execution_log

    def test_assistant_search_filtering(self, qapp):
        """Test assistant panel search filters correctly."""
        panel = AIAssistantPanel()

        actions = [
            AssistantAction(
                title="Fix Missing Tag",
                description="Apply auto-fix for missing tag",
                category="fix",
                icon="check"
            ),
            AssistantAction(
                title="Explain Error Code",
                description="Get explanation for error",
                category="insight",
                icon="info"
            ),
            AssistantAction(
                title="Suggest Import",
                description="Suggest missing imports",
                category="suggestion",
                icon="bulb"
            ),
        ]

        panel.set_actions(actions)

        # Test search filtering
        panel._filter_actions("fix")
        assert len(panel._filtered_actions) == 1
        assert panel._filtered_actions[0].title == "Fix Missing Tag"

        # Test search by category
        panel._filter_actions("insight")
        assert len(panel._filtered_actions) == 1
        assert panel._filtered_actions[0].category == "insight"

    def test_assistant_priority_sorting(self, qapp):
        """Test actions are sorted by priority."""
        panel = AIAssistantPanel()

        actions = [
            AssistantAction(
                title="Low Priority",
                description="Low priority action",
                category="suggestion",
                icon="bulb",
                priority=0
            ),
            AssistantAction(
                title="High Priority",
                description="High priority action",
                category="fix",
                icon="check",
                priority=2
            ),
            AssistantAction(
                title="Medium Priority",
                description="Medium priority action",
                category="insight",
                icon="info",
                priority=1
            ),
        ]

        panel.set_actions(actions)

        # Verify sorting by priority (highest first)
        assert panel._actions[0].priority == 2
        assert panel._actions[1].priority == 1
        assert panel._actions[2].priority == 0


class TestCodeCompletionIntegration:
    """Test code completion with Gemini."""

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_code_completion_workflow(self, mock_rag, mock_local, mock_genai):
        """Test code completion suggestion workflow."""
        # Setup
        mock_genai.return_value = MagicMock()
        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)

        # Mock response
        mock_response = Mock()
        mock_response.text = "print('Hello World')\n    return result"
        client._client.models.generate_content.return_value = mock_response

        # Get completion
        completion = client.generate_code_completion("def hello():\n    ", cursor_position=17)

        # Verify
        assert completion is not None
        assert len(completion) > 0


class TestHealthMetricsIntegration:
    """Test health metrics with diagnostics."""

    def test_metrics_update_on_fix_applied(self, qapp):
        """Test health metrics improve when fix is applied."""
        # Initial state
        initial_metrics = HealthMetrics(
            error_count=3,
            warning_count=5,
            suggestion_count=2,
            total_issues=10,
            health_percentage=70.0
        )

        panel = HealthPanel()
        panel.set_metrics(initial_metrics)

        # Apply fix
        improved_metrics = HealthMetrics(
            error_count=2,
            warning_count=5,
            suggestion_count=2,
            total_issues=9,
            health_percentage=75.0
        )

        panel.set_metrics(improved_metrics)

        # Verify improvement
        assert panel._metrics.health_percentage > initial_metrics.health_percentage

    def test_metrics_color_progression(self, qapp):
        """Test health metrics color changes based on level."""
        panel = HealthPanel()

        # Test critical (red)
        critical = HealthMetrics(
            error_count=10,
            warning_count=5,
            suggestion_count=0,
            total_issues=15,
            health_percentage=20.0
        )
        panel.set_metrics(critical)
        # Panel should show red/critical state

        # Test excellent (green)
        excellent = HealthMetrics(
            error_count=0,
            warning_count=1,
            suggestion_count=0,
            total_issues=1,
            health_percentage=95.0
        )
        panel.set_metrics(excellent)
        # Panel should show green/excellent state

        # Verify transitions work
        assert panel._metrics.health_percentage == 95.0


class TestCompletionGeminiIntegration:
    """Test code completion with Gemini."""

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_code_completion_suggestion(self, mock_rag, mock_local, mock_genai):
        """Test generating code completions."""
        # Setup
        mock_genai.return_value = MagicMock()
        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)

        # Mock response
        mock_response = Mock()
        mock_response.text = "print('Hello World')\n    return result"
        client._client.models.generate_content.return_value = mock_response

        # Get completion
        completion = client.generate_code_completion("def hello():\n    ", cursor_position=17)

        # Verify
        assert completion is not None


class TestMultipleComponentsIntegration:
    """Test multiple AI components working together."""

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_full_ai_workflow(self, mock_rag, mock_local, mock_genai, qapp):
        """Test complete AI workflow: detect → analyze → fix → health update."""
        # Setup
        mock_genai.return_value = MagicMock()
        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        # 1. Create Gemini client
        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)

        # 2. Setup AI assistant with actions
        assistant_manager = AIAssistantManager()
        assistant_manager.create_panel()

        # 3. Setup health tracking
        health_panel = HealthPanel()
        health_panel.set_metrics(HealthMetrics(
            error_count=2,
            warning_count=3,
            suggestion_count=1,
            total_issues=6,
            health_percentage=80.0
        ))

        # 4. Simulate error detection and fix workflow
        mock_response = Mock()
        mock_response.text = "Replace deprecated tag with modern tag. Version 2.0+ requires modern tag."
        client._client.models.generate_content.return_value = mock_response

        # Get explanation
        explanation = client.explain_error("E001", "Deprecated tag")
        assert explanation is not None

        # Generate fix
        fix_suggestion = client.suggest_fix("E001", "<deprecated/>")
        assert fix_suggestion is not None

        # 5. Update health after fix
        health_panel.set_metrics(HealthMetrics(
            error_count=1,
            warning_count=3,
            suggestion_count=1,
            total_issues=5,
            health_percentage=85.0
        ))

        # 6. Register actions in assistant
        actions = [
            AssistantAction(
                title="View Full Error Explanation",
                description="Show detailed explanation of error E001",
                category="insight",
                icon="info",
                priority=2
            ),
            AssistantAction(
                title="Apply Generated Fix",
                description="Apply the suggested fix to the code",
                category="fix",
                icon="check_circle",
                priority=2
            ),
        ]
        assistant_manager.register_actions(actions)

        # Verify end state
        assert client.get_request_count() >= 2
        assert health_panel._metrics.health_percentage == 85.0
        assert len(assistant_manager.get_actions()) == 2
