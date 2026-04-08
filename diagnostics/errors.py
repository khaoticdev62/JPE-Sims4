"""Error definitions for JPE Sims 4 Mod Translator."""

from __future__ import annotations
from enum import Enum
from dataclasses import dataclass
from typing import Optional, List


class ErrorCategory(Enum):
    """Categories of errors for classification and filtering."""

    PARSER_JPE = "parser_jpe"
    PARSER_XML = "parser_xml"
    PARSER_JPE_XML = "parser_jpe_xml"
    VALIDATOR_SYNTAX = "validator_syntax"
    VALIDATOR_SEMANTIC = "validator_semantic"
    GENERATOR_XML = "generator_xml"
    IO_FILE = "io_file"
    IO_NETWORK = "io_network"
    PLUGIN = "plugin"
    INTERNAL = "internal"


class ErrorSeverity(Enum):
    """Severity levels for errors."""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    FATAL = "fatal"


@dataclass
class ErrorPosition:
    """Position information for an error."""

    line: Optional[int] = None
    column: Optional[int] = None


@dataclass
class BuildReport:
    """Report generated after a build operation."""

    status: str  # 'success', 'failed', 'warning'
    errors: List[EngineError]
    warnings: List[EngineError]
    info: List[str]
    build_id: str
    timestamp: str


@dataclass
class EngineError:
    """Represents an error in the JPE engine.

    Attributes:
        code: Unique error code for identification
        category: Error category for classification
        severity: Error severity level
        message_short: Brief error message
        message_long: Detailed error description
        suggested_fix: Suggested remediation
        file_path: Optional path to related file
        line_number: Optional line number in source
        column: Optional column number in source
        position: Optional ErrorPosition object (alternative to line_number/column)
    """

    code: str
    category: ErrorCategory
    severity: ErrorSeverity
    message_short: str
    message_long: str
    suggested_fix: Optional[str] = None
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    column: Optional[int] = None
    position: Optional[ErrorPosition] = None

    def to_dict(self) -> dict:
        """Convert error to dictionary for serialization."""
        result = {
            "code": self.code,
            "category": self.category.value,
            "severity": self.severity.value,
            "message_short": self.message_short,
            "message_long": self.message_long,
            "suggested_fix": self.suggested_fix,
            "file_path": self.file_path,
            "line_number": self.line_number,
            "column": self.column,
        }
        if self.position is not None:
            result["position"] = {
                "line": self.position.line,
                "column": self.position.column,
            }
        return result

    @classmethod
    def from_dict(cls, data: dict) -> "EngineError":
        """Create EngineError from dictionary."""
        return cls(
            code=data["code"],
            category=ErrorCategory(data["category"]),
            severity=ErrorSeverity(data["severity"]),
            message_short=data["message_short"],
            message_long=data["message_long"],
            suggested_fix=data.get("suggested_fix"),
            file_path=data.get("file_path"),
            line_number=data.get("line_number"),
            column=data.get("column"),
        )
