"""Diagnostics module for JPE Sims 4 Mod Translator.

This module provides error handling, logging, and diagnostic capabilities.
"""

from .errors import EngineError, ErrorCategory, ErrorSeverity
from .logging import setup_logging, get_logger

__all__ = [
    'EngineError',
    'ErrorCategory', 
    'ErrorSeverity',
    'setup_logging',
    'get_logger',
]
