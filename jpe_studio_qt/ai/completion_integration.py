"""
Completion System Integration for UI.

This module provides global management of the intelligent completion system
and easy integration with AICodeEditor widgets throughout the application.

Provides:
- Global completion system singleton
- Lazy initialization
- Per-editor configuration
- Cache management
- Settings integration
"""

from __future__ import annotations

from typing import Optional, Dict
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class CompletionConfig:
    """Configuration for code completion behavior."""

    enabled: bool = True
    auto_trigger: bool = True
    trigger_delay_ms: int = 250
    max_visible_items: int = 8
    use_local_completions: bool = True
    use_gemini_completions: bool = True
    confidence_threshold: float = 0.5

    @classmethod
    def from_ai_settings(cls, ai_settings: object) -> CompletionConfig:
        """Create config from AISettings object."""
        return cls(
            enabled=getattr(ai_settings, 'ai_enabled', True),
            use_gemini_completions=getattr(ai_settings, 'ai_enabled', True),
            confidence_threshold=getattr(ai_settings, 'confidence_threshold', 0.5),
        )


class CompletionSystemManager:
    """
    Global manager for code completion system.

    Provides:
    - Singleton pattern for completion system
    - Lazy initialization
    - Configuration management
    - Cache control
    - Per-editor settings
    """

    _instance: Optional[CompletionSystemManager] = None
    _initialized = False

    def __new__(cls) -> CompletionSystemManager:
        """Implement singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        """Initialize manager (only once)."""
        if self._initialized:
            return

        self._completion_system: Optional[object] = None
        self._config = CompletionConfig()
        self._editor_configs: Dict[int, CompletionConfig] = {}
        self._initialized = True

        logger.debug("CompletionSystemManager initialized")

    def get_completion_system(self) -> Optional[object]:
        """
        Get or lazily initialize the global completion system.

        Returns:
            AdvancedCodeCompletionSystem or IntelligentCodeCompletion instance
        """
        if self._completion_system is None:
            self._initialize_system()

        return self._completion_system

    def set_completion_system(self, system: object) -> None:
        """
        Set the global completion system.

        Useful for dependency injection or testing.

        Args:
            system: Completion system instance
        """
        self._completion_system = system
        logger.info(f"Completion system set: {type(system).__name__}")

    def _initialize_system(self) -> None:
        """Initialize the completion system with defaults."""
        try:
            # Try to use the advanced system if available
            from ai.intelligent_completion import AdvancedCodeCompletionSystem

            self._completion_system = AdvancedCodeCompletionSystem()
            logger.info("Initialized AdvancedCodeCompletionSystem")

        except ImportError:
            try:
                # Fallback to basic system
                from ai.intelligent_completion import IntelligentCodeCompletion

                # Create a dummy AI assistant (can be replaced)
                self._completion_system = IntelligentCodeCompletion(None)
                logger.info("Initialized IntelligentCodeCompletion (fallback)")

            except ImportError as e:
                logger.error(f"Failed to initialize completion system: {e}")
                self._completion_system = None

    def get_config(self) -> CompletionConfig:
        """Get global completion configuration."""
        return self._config

    def update_config(self, **kwargs) -> None:
        """Update global configuration.

        Args:
            **kwargs: Config fields to update (enabled, auto_trigger, etc.)
        """
        for key, value in kwargs.items():
            if hasattr(self._config, key):
                setattr(self._config, key, value)

        logger.debug(f"Completion config updated: {kwargs}")

    def set_config_from_ai_settings(self, ai_settings: object) -> None:
        """
        Update completion config from AI settings object.

        Args:
            ai_settings: AISettings dataclass instance
        """
        config = CompletionConfig.from_ai_settings(ai_settings)
        self._config = config
        logger.info("Completion config updated from AI settings")

    def get_editor_config(self, editor_id: int) -> CompletionConfig:
        """
        Get configuration for a specific editor.

        Falls back to global config if editor config not set.

        Args:
            editor_id: Editor widget id()

        Returns:
            CompletionConfig for the editor
        """
        if editor_id in self._editor_configs:
            return self._editor_configs[editor_id]

        return self._config

    def set_editor_config(self, editor_id: int, **kwargs) -> None:
        """
        Set configuration for a specific editor.

        Args:
            editor_id: Editor widget id()
            **kwargs: Config fields to override
        """
        if editor_id not in self._editor_configs:
            self._editor_configs[editor_id] = CompletionConfig()

        config = self._editor_configs[editor_id]
        for key, value in kwargs.items():
            if hasattr(config, key):
                setattr(config, key, value)

        logger.debug(f"Editor {editor_id} config updated: {kwargs}")

    def configure_editor(self, editor: object) -> None:
        """
        Configure an AICodeEditor with completion system.

        Args:
            editor: AICodeEditor instance
        """
        try:
            # Import here to avoid circular imports
            from jpe_studio_qt.ui.ai_code_editor import AICodeEditor

            if not isinstance(editor, AICodeEditor):
                logger.warning(f"Expected AICodeEditor, got {type(editor).__name__}")
                return

            # Set completion system
            system = self.get_completion_system()
            if system:
                editor.set_completion_system(system)

            # Apply config
            config = self.get_editor_config(id(editor))
            editor.set_completion_delay(config.trigger_delay_ms)
            editor.enable_completions(config.enabled)

            logger.debug(f"Configured editor: {id(editor)}")

        except Exception as e:
            logger.error(f"Failed to configure editor: {e}")

    def clear_cache(self) -> None:
        """Clear completion cache (if system supports it)."""
        if self._completion_system and hasattr(self._completion_system, 'clear_cache'):
            self._completion_system.clear_cache()
            logger.info("Cleared completion cache")

    def enable_all(self) -> None:
        """Enable completions globally."""
        self._config.enabled = True
        logger.info("Completions enabled globally")

    def disable_all(self) -> None:
        """Disable completions globally."""
        self._config.enabled = False
        logger.info("Completions disabled globally")

    def reset(self) -> None:
        """Reset to defaults."""
        self._completion_system = None
        self._config = CompletionConfig()
        self._editor_configs.clear()
        logger.info("CompletionSystemManager reset to defaults")


# Global instance
_manager: Optional[CompletionSystemManager] = None


def get_manager() -> CompletionSystemManager:
    """Get the global completion system manager."""
    global _manager
    if _manager is None:
        _manager = CompletionSystemManager()
    return _manager


def configure_editor(editor: object) -> None:
    """
    Convenience function to configure an editor.

    Args:
        editor: AICodeEditor instance
    """
    get_manager().configure_editor(editor)


def get_completion_system() -> Optional[object]:
    """Get the global completion system."""
    return get_manager().get_completion_system()


def update_config(**kwargs) -> None:
    """Update global completion configuration."""
    get_manager().update_config(**kwargs)


def clear_cache() -> None:
    """Clear completion cache."""
    get_manager().clear_cache()
