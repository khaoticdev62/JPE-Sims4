"""Enhanced exception handling system with Sentinel capabilities."""

import traceback
import logging
import sys
from typing import Dict, List, Optional, Callable, Any, Union
from pathlib import Path
from datetime import datetime
import json

from ..diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity
from ..diagnostics.comprehensive import ExceptionTranslator


class SentinelExceptionLogger:
    """Enhanced exception logging with contextual information and analysis."""
    
    def __init__(self, log_file: Optional[Path] = None, max_log_size: int = 10*1024*1024):  # 10MB
        self.log_file = log_file or Path("logs") / "sentinel_exceptions.log"
        self.max_log_size = max_log_size
        self.context_stack: List[Dict[str, Any]] = []
        
        # Ensure log directory exists
        self.log_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Set up file handler with rotation
        self.logger = logging.getLogger('SentinelExceptionLogger')
        self.logger.setLevel(logging.DEBUG)
        
        # Prevent adding multiple handlers if logger already exists
        if not self.logger.handlers:
            file_handler = logging.FileHandler(self.log_file, encoding='utf-8')
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
    
    def add_context(self, **context) -> None:
        """Add contextual information to the current logging scope."""
        self.context_stack.append(context)
    
    def remove_context(self) -> None:
        """Remove the most recent contextual information."""
        if self.context_stack:
            self.context_stack.pop()
    
    def get_current_context(self) -> Dict[str, Any]:
        """Get the combined context from all active context levels."""
        combined_context = {}
        for context in self.context_stack:
            combined_context.update(context)
        return combined_context
    
    def log_exception(self, exc: Exception, context: Optional[Dict[str, Any]] = None, 
                     severity: ErrorSeverity = ErrorSeverity.ERROR) -> str:
        """Log an exception with contextual information."""
        exc_id = self._generate_exception_id(exc)
        
        # Combine provided context with current context
        full_context = self.get_current_context()
        if context:
            full_context.update(context)
        
        # Create detailed log entry
        log_entry = {
            "exception_id": exc_id,
            "timestamp": datetime.now().isoformat(),
            "exception_type": type(exc).__name__,
            "exception_message": str(exc),
            "traceback": traceback.format_exc(),
            "context": full_context,
            "severity": severity.value,
            "module": getattr(exc, '__module__', 'unknown'),
        }
        
        # Log to file
        self.logger.error(f"EXCEPTION_ID: {exc_id} | {type(exc).__name__}: {str(exc)} | CONTEXT: {full_context}")
        
        # Also log to a JSON file for analysis
        self._log_to_json_file(log_entry)
        
        return exc_id
    
    def _generate_exception_id(self, exc: Exception) -> str:
        """Generate a unique ID for an exception."""
        import hashlib
        timestamp = datetime.now().isoformat()
        exc_str = f"{type(exc).__name__}:{str(exc)}:{timestamp}:{len(self.context_stack)}"
        return hashlib.md5(exc_str.encode()).hexdigest()[:16]
    
    def _log_to_json_file(self, log_entry: Dict[str, Any]) -> None:
        """Log the entry to a JSON file for analysis."""
        json_log_file = self.log_file.with_suffix('.json')
        
        try:
            # Read existing entries
            if json_log_file.exists():
                with open(json_log_file, 'r', encoding='utf-8') as f:
                    entries = json.load(f)
            else:
                entries = []
            
            # Add new entry
            entries.append(log_entry)
            
            # Limit log size by keeping only recent entries
            if len(entries) > 1000:  # Keep last 1000 entries
                entries = entries[-1000:]
            
            # Write back to file
            with open(json_log_file, 'w', encoding='utf-8') as f:
                json.dump(entries, f, indent=2)
                
        except Exception:
            # If JSON logging fails, just continue
            pass


class EnhancedExceptionTranslator(ExceptionTranslator):
    """Enhanced exception translator with better categorization and suggestions."""
    
    def __init__(self):
        super().__init__()
        self.exception_patterns = self._load_exception_patterns()
    
    def _load_exception_patterns(self) -> Dict[str, Dict[str, str]]:
        """Load patterns for common exceptions to provide better translations."""
        return {
            # File I/O related
            "FileNotFoundError": {
                "pattern": "No such file or directory",
                "category": "IO_FILE",
                "severity": "error",
                "short": "File not found",
                "long": "The specified file could not be found",
                "fix": "Check the file path and ensure the file exists"
            },
            "PermissionError": {
                "pattern": "Permission denied",
                "category": "IO_FILE", 
                "severity": "error",
                "short": "Permission denied",
                "long": "You don't have permission to access this file or directory",
                "fix": "Check file permissions and ensure you have read/write access"
            },
            "IsADirectoryError": {
                "pattern": "Is a directory",
                "category": "IO_FILE",
                "severity": "error", 
                "short": "Expected file, got directory",
                "long": "A directory path was provided where a file was expected",
                "fix": "Provide a path to a file, not a directory"
            },
            
            # XML/Parse related
            "xml.etree.ElementTree.ParseError": {
                "pattern": "",
                "category": "PARSER_XML",
                "severity": "error",
                "short": "XML Parse Error",
                "long": "Invalid XML syntax detected",
                "fix": "Check the XML file for well-formedness issues like unclosed tags"
            },
            
            # General Python errors
            "ValueError": {
                "pattern": "",
                "category": "VALIDATION_SCHEMA", 
                "severity": "error",
                "short": "Invalid Value",
                "long": "A value in the input is not valid for this context",
                "fix": "Check the input value and ensure it matches expected format"
            },
            "TypeError": {
                "pattern": "",
                "category": "VALIDATION_SCHEMA",
                "severity": "error",
                "short": "Type Error",
                "long": "An operation or function received an object of inappropriate type",
                "fix": "Check the data type of the value and ensure it's correct"
            },
            "KeyError": {
                "pattern": "",
                "category": "VALIDATION_SEMANTIC",
                "severity": "error",
                "short": "Missing Key",
                "long": "A required key or reference was not found",
                "fix": "Ensure all required keys/fields are present in the input"
            }
        }
    
    def translate_exception(self, exc: Exception, context: Optional[str] = None) -> EngineError:
        """Translate an exception to an EngineError with enhanced messaging."""
        # First try to match against known patterns
        exc_type_name = f"{type(exc).__module__}.{type(exc).__name__}"
        exc_name = type(exc).__name__
        
        pattern_info = None
        if exc_type_name in self.exception_patterns:
            pattern_info = self.exception_patterns[exc_type_name]
        elif exc_name in self.exception_patterns:
            pattern_info = self.exception_patterns[exc_name]
        
        if pattern_info:
            # Use pattern-based translation
            category = ErrorCategory(pattern_info["category"])
            severity = ErrorSeverity(pattern_info["severity"])
            
            return EngineError(
                code=exc_name.upper().replace("ERROR", "") if "ERROR" in exc_name.upper() else exc_name.upper(),
                category=category,
                severity=severity,
                message_short=pattern_info["short"],
                message_long=pattern_info["long"],
                suggested_fix=pattern_info["fix"],
                extra={
                    "original_exception": exc_name,
                    "context": context,
                    "traceback": traceback.format_tb(exc.__traceback__)
                }
            )
        else:
            # Fall back to base class translation
            return super().translate_exception(exc, context)


class SentinelExceptionHandler:
    """Main exception handling system with advanced features."""
    
    def __init__(self):
        self.logger = SentinelExceptionLogger()
        self.translator = EnhancedExceptionTranslator()
        self.error_handlers: Dict[type, Callable] = {}
        self.unhandled_exception_hook: Optional[Callable] = None
    
    def register_error_handler(self, exc_type: type, handler: Callable) -> None:
        """Register a custom handler for a specific exception type."""
        self.error_handlers[exc_type] = handler
    
    def set_unhandled_exception_hook(self, hook: Callable) -> None:
        """Set a global hook for unhandled exceptions."""
        self.unhandled_exception_hook = hook
        # Set it globally in the system
        sys.excepthook = lambda exc_type, exc_value, exc_traceback: self._global_exception_handler(exc_type, exc_value, exc_traceback)
    
    def _global_exception_handler(self, exc_type, exc_value, exc_traceback):
        """Handle uncaught exceptions globally."""
        if self.unhandled_exception_hook:
            try:
                self.unhandled_exception_hook(exc_type, exc_value, exc_traceback)
            except Exception:
                pass  # Don't let the hook cause more problems
        
        # Log the unhandled exception
        self.logger.logger.critical(f"UNHANDLED EXCEPTION: {exc_type.__name__}: {exc_value}", 
                                   exc_info=(exc_type, exc_value, exc_traceback))
    
    def handle_exception(self, exc: Exception, context: Optional[Dict[str, Any]] = None, 
                        reraise: bool = False) -> Optional[EngineError]:
        """Handle an exception with full Sentinel capabilities."""
        # Log the exception
        exc_id = self.logger.log_exception(exc, context)
        
        # Translate to EngineError
        engine_error = self.translator.translate_exception(exc, str(context) if context else None)
        
        # Add the exception ID to the error
        if engine_error.extra is None:
            engine_error.extra = {}
        engine_error.extra['exception_id'] = exc_id
        
        # Check if we have a specific handler for this exception type
        for exc_type, handler in self.error_handlers.items():
            if isinstance(exc, exc_type):
                try:
                    result = handler(exc, engine_error, context)
                    if result is not None:
                        return result
                except Exception as handler_exc:
                    # If the handler itself fails, log it but don't cascade errors
                    self.logger.logger.warning(f"Exception handler failed: {handler_exc}")
        
        # If reraise is True, reraise the original exception
        if reraise:
            raise exc
        
        return engine_error
    
    def handle_with_context(self, operation: Callable, 
                           context: Optional[Dict[str, Any]] = None,
                           default_return: Any = None) -> Any:
        """Execute an operation with exception handling and context."""
        try:
            if context:
                self.logger.add_context(**context)
            result = operation()
            if context:
                self.logger.remove_context()
            return result
        except Exception as exc:
            if context:
                self.logger.remove_context()
            
            # Handle the exception and return default or re-raise
            engine_error = self.handle_exception(exc, context)
            
            # For now, we'll return the default for non-critical errors
            # In a real implementation, this could use more sophisticated logic
            if engine_error and engine_error.severity in [ErrorSeverity.WARNING, ErrorSeverity.INFO]:
                return default_return
            else:
                # For errors and fatal issues, we might want to propagate
                raise exc  # Re-raise the original exception


# Global sentinel instance for easy access
sentinel = SentinelExceptionHandler()


# Context manager for handling exceptions with context
class ExceptionContext:
    """Context manager for adding contextual information to exception handling."""
    
    def __init__(self, **context):
        self.context = context
        self.handled = False
    
    def __enter__(self):
        sentinel.logger.add_context(**self.context)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        sentinel.logger.remove_context()
        
        if exc_type is not None:
            # Handle the exception with the context
            engine_error = sentinel.handle_exception(exc_val, self.context)
            # Don't suppress the exception, let it propagate
            return False  # False means don't suppress the exception
        
        return False


# Decorator for adding context to functions
def with_exception_context(**context):
    """Decorator to add exception context to function calls."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            with ExceptionContext(**context):
                return func(*args, **kwargs)
        return wrapper
    return decorator


# Helper functions for common use cases
def safe_execute(operation: Callable, 
                context: Optional[Dict[str, Any]] = None,
                on_error_return: Any = None,
                log_error: bool = True) -> Any:
    """Safely execute an operation with exception handling."""
    try:
        return operation()
    except Exception as e:
        if log_error:
            sentinel.handle_exception(e, context)
        return on_error_return


def register_global_exception_handler():
    """Register the global exception handler."""
    sentinel.set_unhandled_exception_hook(None)  # Use default behavior for global hook


# Initialize the system
register_global_exception_handler()