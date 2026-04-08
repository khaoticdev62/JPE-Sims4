"""Sentinel exception logging for JPE Sims 4 Mod Translator."""

import logging
from typing import Optional, Dict, Any
from datetime import datetime
from pathlib import Path


class SentinelExceptionLogger:
    """Logs exceptions with context for debugging and monitoring."""
    
    def __init__(self, log_file: Optional[Path] = None):
        """Initialize the exception logger.
        
        Args:
            log_file: Optional path to exception log file
        """
        self.log_file = log_file or Path('jpe_exceptions.log')
        self.logger = logging.getLogger('jpe_sims4.sentinel')
        self._exception_count = 0
    
    def log_exception(
        self,
        exception: Exception,
        context: Optional[Dict[str, Any]] = None,
        severity: str = 'ERROR'
    ) -> None:
        """Log an exception with optional context.
        
        Args:
            exception: The exception to log
            context: Optional context dictionary
            severity: Log severity level
        """
        self._exception_count += 1
        
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'exception_type': type(exception).__name__,
            'exception_message': str(exception),
            'severity': severity,
            'context': context or {},
            'count': self._exception_count,
        }
        
        self.logger.error(f"Exception: {log_entry}")
    
    def get_exception_count(self) -> int:
        """Get total number of logged exceptions."""
        return self._exception_count
    
    def clear(self) -> None:
        """Clear exception count."""
        self._exception_count = 0
