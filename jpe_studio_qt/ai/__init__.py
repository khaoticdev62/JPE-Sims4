"""AI module for JPE Studio Qt application.

Provides Gemini API integration and AI-powered features:
- Code completions and suggestions
- Error detection and resolution
- Project health analysis
- Natural language to JPE conversion
- Secure API key storage with encryption
"""

from __future__ import annotations

__all__ = [
    "GeminiClient",
    "GeminiModel",
    "GeminiConfig",
    "EncryptionManager",
    "SecureSettingsManager",
    "encrypt_string",
    "decrypt_string",
    "CompletionSystemManager",
    "CompletionConfig",
    "get_manager",
    "configure_editor",
    "get_completion_system",
    "update_config",
    "clear_cache",
]

from .encryption import EncryptionManager, encrypt_string, decrypt_string
from .gemini_client import GeminiClient, GeminiConfig, GeminiModel
from .secure_settings import SecureSettingsManager
from .completion_integration import (
    CompletionSystemManager,
    CompletionConfig,
    get_manager,
    configure_editor,
    get_completion_system,
    update_config,
    clear_cache,
)
