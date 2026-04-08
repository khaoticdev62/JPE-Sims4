"""Logging utilities for JPE Sims 4 Mod Translator."""

import logging
import sys
import time
from typing import Optional
from pathlib import Path
from contextlib import contextmanager


_logger: Optional[logging.Logger] = None


def setup_logging(
    level: int = logging.INFO,
    log_file: Optional[Path] = None,
    format_string: Optional[str] = None,
) -> logging.Logger:
    """Set up logging for the JPE engine.

    Args:
        level: Logging level (default: INFO)
        log_file: Optional path to log file
        format_string: Optional custom format string

    Returns:
        Configured logger instance
    """
    global _logger

    if format_string is None:
        format_string = (
            "%(asctime)s - %(name)s - %(levelname)s - "
            "%(filename)s:%(lineno)d - %(message)s"
        )

    formatter = logging.Formatter(format_string)

    # Create logger
    _logger = logging.getLogger("jpe_sims4")
    _logger.setLevel(level)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    _logger.addHandler(console_handler)

    # File handler (if specified)
    if log_file:
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)
        _logger.addHandler(file_handler)

    return _logger


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Get the JPE logger or create a child logger.

    Args:
        name: Optional child logger name

    Returns:
        Logger instance
    """
    if _logger is None:
        setup_logging()

    if name:
        return _logger.getChild(name)
    return _logger


# Convenience functions for common logging operations
def log_info(message: str, **kwargs):
    """Log an info message."""
    logger = get_logger()
    logger.info(message, extra=kwargs if kwargs else None)


def log_error(message: str, **kwargs):
    """Log an error message."""
    logger = get_logger()
    logger.error(message, extra=kwargs if kwargs else None)


def log_warning(message: str, **kwargs):
    """Log a warning message."""
    logger = get_logger()
    logger.warning(message, extra=kwargs if kwargs else None)


def log_audit(message: str, **kwargs):
    """Log an audit message."""
    logger = get_logger()
    logger.info(f"[AUDIT] {message}", extra=kwargs if kwargs else None)


@contextmanager
def performance_timer(operation_name: str = "Operation"):
    """Context manager for timing operations.

    Usage:
        with performance_timer("Parsing"):
            # do something
    """
    start_time = time.perf_counter()
    try:
        yield
    finally:
        end_time = time.perf_counter()
        duration = end_time - start_time
        log_info(f"{operation_name} completed in {duration:.3f}s")
