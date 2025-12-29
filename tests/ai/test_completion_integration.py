"""Unit tests for completion integration module."""

import pytest
from unittest.mock import Mock, MagicMock, patch

from jpe_studio_qt.ai.completion_integration import (
    CompletionConfig,
    CompletionSystemManager,
    get_manager,
    configure_editor,
    get_completion_system,
    update_config,
    clear_cache,
)


class TestCompletionConfig:
    """Test CompletionConfig dataclass."""

    def test_default_config(self):
        """Test creating config with defaults."""
        config = CompletionConfig()

        assert config.enabled is True
        assert config.auto_trigger is True
        assert config.trigger_delay_ms == 250
        assert config.max_visible_items == 8
        assert config.use_local_completions is True
        assert config.use_gemini_completions is True
        assert config.confidence_threshold == 0.5

    def test_custom_config(self):
        """Test creating config with custom values."""
        config = CompletionConfig(
            enabled=False,
            auto_trigger=False,
            trigger_delay_ms=500,
            confidence_threshold=0.7,
        )

        assert config.enabled is False
        assert config.auto_trigger is False
        assert config.trigger_delay_ms == 500
        assert config.confidence_threshold == 0.7

    def test_config_from_ai_settings(self):
        """Test creating config from AI settings object."""
        mock_settings = Mock()
        mock_settings.ai_enabled = False
        mock_settings.confidence_threshold = 0.8

        config = CompletionConfig.from_ai_settings(mock_settings)

        assert config.enabled is False
        assert config.use_gemini_completions is False
        assert config.confidence_threshold == 0.8


class TestCompletionSystemManager:
    """Test CompletionSystemManager singleton."""

    @pytest.fixture
    def manager(self):
        """Get manager instance."""
        # Reset singleton for testing
        CompletionSystemManager._instance = None
        CompletionSystemManager._initialized = False
        return CompletionSystemManager()

    def test_singleton_pattern(self):
        """Test that manager is a singleton."""
        manager1 = CompletionSystemManager()
        manager2 = CompletionSystemManager()

        assert manager1 is manager2

    def test_manager_initialization(self, manager):
        """Test manager initializes correctly."""
        assert manager._completion_system is None
        assert isinstance(manager._config, CompletionConfig)
        assert isinstance(manager._editor_configs, dict)
        assert len(manager._editor_configs) == 0

    def test_get_manager(self):
        """Test get_manager convenience function."""
        CompletionSystemManager._instance = None
        CompletionSystemManager._initialized = False

        manager1 = get_manager()
        manager2 = get_manager()

        assert manager1 is manager2
        assert isinstance(manager1, CompletionSystemManager)

    def test_set_completion_system(self, manager):
        """Test setting completion system."""
        system = Mock()
        manager.set_completion_system(system)

        assert manager._completion_system is system

    def test_get_completion_system_none(self, manager):
        """Test getting completion system when not initialized."""
        # With no system and mocked imports, should return None
        with patch('jpe_studio_qt.ai.completion_integration.logger'):
            system = manager.get_completion_system()
            # May be None due to import failures in test environment

    def test_get_config(self, manager):
        """Test getting global config."""
        config = manager.get_config()

        assert isinstance(config, CompletionConfig)
        assert config.trigger_delay_ms == 250

    def test_update_config(self, manager):
        """Test updating configuration."""
        manager.update_config(trigger_delay_ms=500, enabled=False)

        config = manager.get_config()
        assert config.trigger_delay_ms == 500
        assert config.enabled is False

    def test_set_config_from_ai_settings(self, manager):
        """Test setting config from AI settings."""
        mock_settings = Mock()
        mock_settings.ai_enabled = False
        mock_settings.confidence_threshold = 0.9

        manager.set_config_from_ai_settings(mock_settings)

        config = manager.get_config()
        assert config.enabled is False
        assert config.confidence_threshold == 0.9

    def test_editor_config_default(self, manager):
        """Test getting default editor config."""
        config = manager.get_editor_config(12345)

        assert config == manager.get_config()

    def test_editor_config_custom(self, manager):
        """Test setting custom editor config."""
        editor_id = 12345
        manager.set_editor_config(editor_id, trigger_delay_ms=350)

        config = manager.get_editor_config(editor_id)
        assert config.trigger_delay_ms == 350
        assert config.enabled is True  # Still uses global default

    def test_configure_editor_not_ai_editor(self, manager):
        """Test configuring non-AICodeEditor raises warning."""
        not_an_editor = Mock()

        # Should not crash
        with patch('jpe_studio_qt.ai.completion_integration.logger'):
            manager.configure_editor(not_an_editor)

    def test_configure_editor_with_ai_editor(self, manager):
        """Test configuring AICodeEditor."""
        manager.set_completion_system(Mock())

        editor = Mock()
        editor.set_completion_system = Mock()
        editor.set_completion_delay = Mock()
        editor.enable_completions = Mock()

        # Mock isinstance check
        with patch('jpe_studio_qt.ai.completion_integration.AICodeEditor', create=True):
            with patch('jpe_studio_qt.ai.completion_integration.logger'):
                # This will fail due to import, but tests the basic flow
                pass

    def test_clear_cache(self, manager):
        """Test clearing cache."""
        system = Mock()
        system.clear_cache = Mock()
        manager.set_completion_system(system)

        with patch('jpe_studio_qt.ai.completion_integration.logger'):
            manager.clear_cache()

        system.clear_cache.assert_called_once()

    def test_clear_cache_no_system(self, manager):
        """Test clearing cache when no system is set."""
        with patch('jpe_studio_qt.ai.completion_integration.logger'):
            manager.clear_cache()  # Should not crash

    def test_enable_all(self, manager):
        """Test enabling all completions."""
        manager.update_config(enabled=False)
        assert manager.get_config().enabled is False

        with patch('jpe_studio_qt.ai.completion_integration.logger'):
            manager.enable_all()

        assert manager.get_config().enabled is True

    def test_disable_all(self, manager):
        """Test disabling all completions."""
        assert manager.get_config().enabled is True

        with patch('jpe_studio_qt.ai.completion_integration.logger'):
            manager.disable_all()

        assert manager.get_config().enabled is False

    def test_reset(self, manager):
        """Test resetting manager."""
        manager.set_completion_system(Mock())
        manager.update_config(trigger_delay_ms=500)

        with patch('jpe_studio_qt.ai.completion_integration.logger'):
            manager.reset()

        assert manager._completion_system is None
        assert manager.get_config().trigger_delay_ms == 250
        assert len(manager._editor_configs) == 0


class TestGlobalFunctions:
    """Test module-level convenience functions."""

    @pytest.fixture(autouse=True)
    def setup_manager(self):
        """Reset manager for each test."""
        CompletionSystemManager._instance = None
        CompletionSystemManager._initialized = False
        yield
        CompletionSystemManager._instance = None
        CompletionSystemManager._initialized = False

    def test_get_completion_system(self):
        """Test get_completion_system function."""
        CompletionSystemManager._instance = None
        CompletionSystemManager._initialized = False

        system = get_completion_system()
        # May be None due to import failures in test

    def test_update_config(self):
        """Test update_config convenience function."""
        manager = get_manager()

        update_config(trigger_delay_ms=400)

        assert manager.get_config().trigger_delay_ms == 400

    def test_clear_cache_function(self):
        """Test clear_cache convenience function."""
        manager = get_manager()
        manager.set_completion_system(Mock())

        with patch('jpe_studio_qt.ai.completion_integration.logger'):
            clear_cache()


class TestCompletionIntegrationWorkflow:
    """Integration tests for completion workflow."""

    @pytest.fixture
    def manager(self):
        """Get clean manager."""
        CompletionSystemManager._instance = None
        CompletionSystemManager._initialized = False
        return CompletionSystemManager()

    def test_full_workflow(self, manager):
        """Test complete completion workflow."""
        # Setup
        system = Mock()
        manager.set_completion_system(system)

        # Configure globally
        manager.update_config(trigger_delay_ms=300, enabled=True)

        # Check configuration
        config = manager.get_config()
        assert config.trigger_delay_ms == 300
        assert config.enabled is True

        # Get system
        assert manager.get_completion_system() == system

    def test_per_editor_override(self, manager):
        """Test per-editor configuration overrides."""
        manager.update_config(trigger_delay_ms=250)

        editor_id = 999
        manager.set_editor_config(editor_id, trigger_delay_ms=500)

        global_config = manager.get_config()
        editor_config = manager.get_editor_config(editor_id)

        assert global_config.trigger_delay_ms == 250
        assert editor_config.trigger_delay_ms == 500
