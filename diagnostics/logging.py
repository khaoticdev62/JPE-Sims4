"""Comprehensive logging system for JPE Sims 4 Mod Translator."""

import logging
import logging.handlers
from pathlib import Path
from datetime import datetime
from typing import Optional
import sys
import os

from .errors import EngineError


class ApplicationLogger:
    """Main application logging system with multiple output channels."""
    
    def __init__(self, app_name: str = "jpe-sims4", log_dir: Optional[Path] = None):
        self.app_name = app_name
        self.log_dir = log_dir or Path("logs")
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
        # Set up different loggers for different purposes
        self._setup_main_logger()
        self._setup_error_logger() 
        self._setup_audit_logger()
        self._setup_performance_logger()
    
    def _setup_main_logger(self):
        """Set up the main application logger."""
        self.main_logger = logging.getLogger(f"{self.app_name}.main")
        self.main_logger.setLevel(logging.DEBUG)
        
        # File handler with rotation
        main_handler = logging.handlers.RotatingFileHandler(
            self.log_dir / "application.log",
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        main_handler.setFormatter(formatter)
        self.main_logger.addHandler(main_handler)
        
        # Console handler for development
        if os.getenv("DEBUG_LOGGING") or "--verbose" in sys.argv:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.main_logger.addHandler(console_handler)
    
    def _setup_error_logger(self):
        """Set up dedicated error logger."""
        self.error_logger = logging.getLogger(f"{self.app_name}.error")
        self.error_logger.setLevel(logging.ERROR)
        
        error_handler = logging.handlers.RotatingFileHandler(
            self.log_dir / "errors.log",
            maxBytes=5*1024*1024,  # 5MB
            backupCount=3,
            encoding='utf-8'
        )
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        error_handler.setFormatter(formatter)
        self.error_logger.addHandler(error_handler)
    
    def _setup_audit_logger(self):
        """Set up audit logger for important operations."""
        self.audit_logger = logging.getLogger(f"{self.app_name}.audit")
        self.audit_logger.setLevel(logging.INFO)
        
        audit_handler = logging.handlers.RotatingFileHandler(
            self.log_dir / "audit.log",
            maxBytes=5*1024*1024,  # 5MB
            backupCount=10,
            encoding='utf-8'
        )
        
        formatter = logging.Formatter(
            '%(asctime)s - AUDIT - %(message)s'
        )
        audit_handler.setFormatter(formatter)
        self.audit_logger.addHandler(audit_handler)
    
    def _setup_performance_logger(self):
        """Set up performance logger for timing and optimization."""
        self.perf_logger = logging.getLogger(f"{self.app_name}.performance")
        self.perf_logger.setLevel(logging.INFO)
        
        perf_handler = logging.handlers.RotatingFileHandler(
            self.log_dir / "performance.log",
            maxBytes=5*1024*1024,  # 5MB
            backupCount=5,
            encoding='utf-8'
        )
        
        formatter = logging.Formatter(
            '%(asctime)s - PERF - %(message)s'
        )
        perf_handler.setFormatter(formatter)
        self.perf_logger.addHandler(perf_handler)
    
    def log_info(self, message: str, extra: Optional[dict] = None):
        """Log an informational message."""
        self.main_logger.info(message, extra=extra or {})
    
    def log_warning(self, message: str, extra: Optional[dict] = None):
        """Log a warning message."""
        self.main_logger.warning(message, extra=extra or {})
    
    def log_error(self, message: str, exception: Optional[Exception] = None, extra: Optional[dict] = None):
        """Log an error message, with optional exception."""
        if exception:
            self.error_logger.error(message, extra=extra or {}, exc_info=True)
        else:
            self.error_logger.error(message, extra=extra or {})
    
    def log_exception(self, engine_error: EngineError, extra: Optional[dict] = None):
        """Log an EngineError with appropriate formatting."""
        message = f"{engine_error.code}: {engine_error.message_short}"
        if engine_error.message_long:
            message += f" | {engine_error.message_long}"
        if engine_error.suggested_fix:
            message += f" | Suggestion: {engine_error.suggested_fix}"
        if engine_error.file_path:
            message += f" | File: {engine_error.file_path}"
        if engine_error.position:
            message += f" | Position: Line {engine_error.position.line}, Col {engine_error.position.column}"
        
        self.error_logger.error(message, extra=extra or {})
    
    def log_audit(self, operation: str, user: str = "system", details: Optional[dict] = None):
        """Log an audit trail entry."""
        details_str = f" | Details: {details}" if details else ""
        self.audit_logger.info(f"USER: {user} | OPERATION: {operation}{details_str}")
    
    def log_performance(self, operation: str, duration_ms: float, details: Optional[dict] = None):
        """Log a performance measurement."""
        details_str = f" | Details: {details}" if details else ""
        self.perf_logger.info(f"OPERATION: {operation} | DURATION: {duration_ms:.2f}ms{details_str}")


# Global logger instance
app_logger = ApplicationLogger()


class PerformanceTimer:
    """Context manager for measuring performance of operations."""
    
    def __init__(self, operation_name: str, logger: Optional[ApplicationLogger] = None):
        self.operation_name = operation_name
        self.logger = logger or app_logger
        self.start_time = None
        self.end_time = None
    
    def __enter__(self):
        from time import perf_counter
        self.start_time = perf_counter()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        from time import perf_counter
        self.end_time = perf_counter()
        duration_ms = (self.end_time - self.start_time) * 1000
        
        # Log the performance
        self.logger.log_performance(self.operation_name, duration_ms)
        
        # Also log to main logger if it's a slow operation
        if duration_ms > 1000:  # More than 1 second
            self.logger.log_warning(f"Slow operation detected: {self.operation_name} took {duration_ms:.2f}ms")


# Convenience functions
def log_info(message: str, **kwargs):
    """Log an informational message."""
    app_logger.log_info(message, extra=kwargs)

def log_warning(message: str, **kwargs):
    """Log a warning message."""
    app_logger.log_warning(message, extra=kwargs)

def log_error(message: str, exception: Optional[Exception] = None, **kwargs):
    """Log an error message."""
    app_logger.log_error(message, exception, extra=kwargs)

def log_exception(engine_error: EngineError, **kwargs):
    """Log an EngineError."""
    app_logger.log_exception(engine_error, extra=kwargs)

def log_audit(operation: str, user: str = "system", **kwargs):
    """Log an audit trail entry."""
    app_logger.log_audit(operation, user, details=kwargs)

def performance_timer(operation_name: str):
    """Create a performance timer context manager."""
    return PerformanceTimer(operation_name)