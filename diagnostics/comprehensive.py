"""Comprehensive diagnostics and exception translation system."""

from typing import Dict, List, Optional, Any
from .errors import EngineError, ErrorCategory, ErrorSeverity
from pathlib import Path


class DiagnosticsTranslator:
    """Translates internal error codes and messages to user-friendly localized messages."""
    
    def __init__(self, locale: str = "en_US"):
        self.locale = locale
        self.translations = self._load_translations()
    
    def _load_translations(self) -> Dict[str, Dict[str, str]]:
        """Load translation mappings for different locales."""
        # Base English translations
        translations = {
            "en_US": {
                # Error codes to user-friendly messages
                "INVALID_PROJECT_NAME": {
                    "short": "Invalid project name",
                    "long": "The project name is missing or invalid",
                    "fix": "Enter a valid project name in the project configuration"
                },
                "INVALID_PROJECT_ID": {
                    "short": "Invalid project ID",
                    "long": "The project ID is missing or invalid",
                    "fix": "Enter a valid project ID in the project configuration"
                },
                "INVALID_INTERACTION_ID": {
                    "short": "Invalid interaction ID",
                    "long": "An interaction is missing an ID or has an invalid ID",
                    "fix": "Add a valid ID to your interaction definition"
                },
                "INVALID_BUFF_ID": {
                    "short": "Invalid buff ID", 
                    "long": "A buff is missing an ID or has an invalid ID",
                    "fix": "Add a valid ID to your buff definition"
                },
                "INVALID_TRAIT_ID": {
                    "short": "Invalid trait ID",
                    "long": "A trait is missing an ID or has an invalid ID", 
                    "fix": "Add a valid ID to your trait definition"
                },
                "INVALID_ENUM_ID": {
                    "short": "Invalid enum ID",
                    "long": "An enum is missing an ID or has an invalid ID",
                    "fix": "Add a valid ID to your enum definition"
                },
                "INVALID_STRING_KEY": {
                    "short": "Invalid string key",
                    "long": "A localized string is missing a key or has an invalid key",
                    "fix": "Add a valid key to your string definition"
                },
                "EMPTY_STRING_TEXT": {
                    "short": "Empty string text",
                    "long": "A localized string has no text content",
                    "fix": "Add text content to your string definition"
                },
                "INVALID_LOCALE_FORMAT": {
                    "short": "Invalid locale format",
                    "long": "A locale string does not match the expected format",
                    "fix": "Use a standard locale format like 'en_US' or 'en'"
                },
                "DUPLICATE_RESOURCE_ID": {
                    "short": "Duplicate resource ID",
                    "long": "The same ID is used for multiple different resources",
                    "fix": "Ensure each resource (interaction, buff, trait, etc.) has a unique ID"
                },
                "UNDEFINED_BUFF_REFERENCE": {
                    "short": "Undefined buff reference",
                    "long": "A trait references a buff that doesn't exist",
                    "fix": "Define the referenced buff or remove the reference"
                },
                "UNDEFINED_TRAIT_REFERENCE": {
                    "short": "Undefined trait reference",
                    "long": "A buff references a trait that doesn't exist",
                    "fix": "Define the referenced trait or remove the reference"
                },
                "NO_JPE_FILES": {
                    "short": "No JPE files found",
                    "long": "No .jpe source files were found in the project directory",
                    "fix": "Create .jpe files in your project directory with the required Sims 4 mod definitions"
                },
                "INVALID_FORMAT": {
                    "short": "Invalid file format",
                    "long": "The file does not match the expected format",
                    "fix": "Ensure the file follows the correct format specification"
                },
                "PARSE_ERROR": {
                    "short": "Parse error",
                    "long": "Could not parse the file due to syntax errors",
                    "fix": "Check the file syntax for well-formedness issues like unclosed tags or invalid characters"
                },
                "ENCODING_ERROR": {
                    "short": "File encoding error",
                    "long": "Could not read the file with the expected encoding",
                    "fix": "Ensure the file is saved with UTF-8 encoding"
                },
            }
        }
        
        # Add other locales if needed
        if self.locale != "en_US":
            # Load additional locale-specific translations
            pass
            
        return translations
    
    def translate_error(self, error: EngineError) -> EngineError:
        """Translate an error to use localized messages."""
        locale_translations = self.translations.get(self.locale, self.translations["en_US"])
        code_translations = locale_translations.get(error.code, {})
        
        # Create a new error with translated messages
        translated_error = EngineError(
            code=error.code,
            category=error.category,
            severity=error.severity,
            message_short=code_translations.get("short", error.message_short),
            message_long=code_translations.get("long", error.message_long),
            file_path=error.file_path,
            resource_id=error.resource_id,
            language_layer=error.language_layer,
            position=error.position,
            snippet=error.snippet,
            suggested_fix=code_translations.get("fix", error.suggested_fix),
            stack_trace_sanitized=error.stack_trace_sanitized,
            plugin_id=error.plugin_id,
            extra=error.extra
        )
        
        return translated_error
    
    def translate_error_list(self, errors: List[EngineError]) -> List[EngineError]:
        """Translate a list of errors."""
        return [self.translate_error(error) for error in errors]


class EnhancedDiagnosticsCollector:
    """Enhanced diagnostics system that collects and categorizes errors with additional context."""
    
    def __init__(self, translator: Optional[DiagnosticsTranslator] = None):
        self.translator = translator or DiagnosticsTranslator()
        self.errors: List[EngineError] = []
        self.warnings: List[EngineError] = []
        self.infos: List[EngineError] = []
    
    def add_error(self, error: EngineError, context: Optional[Dict[str, Any]] = None) -> None:
        """Add an error with optional context information."""
        if context:
            # Add context to error's extra data
            error.extra.update(context)
        
        if error.severity == ErrorSeverity.ERROR or error.severity == ErrorSeverity.FATAL:
            self.errors.append(error)
        elif error.severity == ErrorSeverity.WARNING:
            self.warnings.append(error)
        else:  # info
            self.infos.append(error)
    
    def add_error_from_exception(self, exc: Exception, context: Optional[Dict[str, Any]] = None) -> None:
        """Add an error derived from an exception."""
        import traceback
        error = EngineError(
            code="EXCEPTION_OCCURRED",
            category=ErrorCategory.PARSER_JPE,  # Generic category for exceptions
            severity=ErrorSeverity.ERROR,
            message_short=f"Exception occurred: {type(exc).__name__}",
            message_long=str(exc),
            stack_trace_sanitized=traceback.format_exc(),
            extra=context or {}
        )
        self.add_error(error)
    
    def get_diagnostic_summary(self) -> Dict[str, Any]:
        """Get a summary of collected diagnostics."""
        return {
            "total_errors": len(self.errors),
            "total_warnings": len(self.warnings), 
            "total_infos": len(self.infos),
            "error_categories": self._get_error_categories(),
            "severity_counts": self._get_severity_counts(),
            "by_file": self._get_errors_by_file()
        }
    
    def _get_error_categories(self) -> Dict[str, int]:
        """Count errors by category."""
        counts: Dict[str, int] = {}
        for error in self.errors + self.warnings + self.infos:
            cat = error.category.value
            counts[cat] = counts.get(cat, 0) + 1
        return counts
    
    def _get_severity_counts(self) -> Dict[str, int]:
        """Count errors by severity."""
        counts: Dict[str, int] = {}
        for error in self.errors + self.warnings + self.infos:
            severity = error.severity.value
            counts[severity] = counts.get(severity, 0) + 1
        return counts
    
    def _get_errors_by_file(self) -> Dict[str, int]:
        """Count errors by file path."""
        counts: Dict[str, int] = {}
        for error in self.errors + self.warnings:
            file_path = error.file_path or "unknown"
            counts[file_path] = counts.get(file_path, 0) + 1
        return counts
    
    def get_translated_errors(self) -> List[EngineError]:
        """Get all errors with translated messages."""
        all_errors = self.errors + self.warnings + self.infos
        return self.translator.translate_error_list(all_errors)
    
    def export_diagnostics_report(self, output_path: Path) -> None:
        """Export diagnostics to a structured report file."""
        import json
        from dataclasses import asdict
        
        # Prepare the report data
        report_data = {
            "summary": self.get_diagnostic_summary(),
            "errors": [asdict(error) for error in self.get_translated_errors()],
        }
        
        # Write to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)


class ExceptionTranslator:
    """Translates low-level exceptions to user-friendly error messages."""
    
    @staticmethod 
    def translate_exception(exc: Exception, context: Optional[str] = None) -> EngineError:
        """Translate an exception to an EngineError with user-friendly messaging."""
        # Determine error category based on exception type
        if isinstance(exc, (FileNotFoundError, PermissionError, OSError)):
            category = ErrorCategory.IO_FILE
            code = "FILE_IO_ERROR"
            severity = ErrorSeverity.ERROR
        elif isinstance(exc, (ValueError, TypeError)):
            category = ErrorCategory.VALIDATION_SCHEMA
            code = "VALIDATION_ERROR"
            severity = ErrorSeverity.ERROR
        else:
            category = ErrorCategory.PARSER_JPE  # Generic category
            code = "UNEXPECTED_ERROR"
            severity = ErrorSeverity.ERROR
        
        # Create user-friendly messages based on exception
        exc_type = type(exc).__name__
        base_msg = f"{exc_type}: {str(exc)}"
        
        if isinstance(exc, FileNotFoundError):
            short_msg = "File not found"
            long_msg = f"The file could not be found: {str(exc)}"
            fix_msg = "Check that the file path is correct and the file exists"
        elif isinstance(exc, PermissionError):
            short_msg = "Permission denied"
            long_msg = f"You don't have permission to access this file: {str(exc)}"
            fix_msg = "Check file permissions and ensure you have read/write access"
        elif isinstance(exc, ValueError):
            short_msg = "Invalid value"
            long_msg = f"A value in the file is invalid: {str(exc)}"
            fix_msg = "Check the file content and ensure all values are valid"
        else:
            short_msg = f"Unexpected error: {exc_type}"
            long_msg = base_msg
            fix_msg = "Please contact support or check the documentation"
        
        return EngineError(
            code=code,
            category=category,
            severity=severity,
            message_short=short_msg,
            message_long=long_msg,
            suggested_fix=fix_msg,
            extra={"original_exception": exc_type, "context": context}
        )


# Global diagnostics instance for easy access
diagnostics = EnhancedDiagnosticsCollector()