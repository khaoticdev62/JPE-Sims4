from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class ErrorCategory(str, Enum):
    PARSER_JPE = "parser_jpe"
    PARSER_JPE_XML = "parser_jpe_xml"
    PARSER_XML = "parser_xml"
    VALIDATION_SCHEMA = "validation_schema"
    VALIDATION_SEMANTIC = "validation_semantic"
    IO_FILE = "io_file"
    PLUGIN = "plugin"
    SYNC_CLOUD = "sync_cloud"


class ErrorSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    FATAL = "fatal"


@dataclass(slots=True)
class ErrorPosition:
    """Position of an error within a text source."""

    line: Optional[int] = None
    column: Optional[int] = None


@dataclass(slots=True)
class EngineError:
    """Structured diagnostic describing a single error or warning."""

    code: str
    category: ErrorCategory
    severity: ErrorSeverity
    message_short: str
    message_long: str
    file_path: Optional[str] = None
    resource_id: Optional[str] = None
    language_layer: Optional[str] = None
    position: Optional[ErrorPosition] = None
    snippet: Optional[str] = None
    suggested_fix: Optional[str] = None
    stack_trace_sanitized: Optional[str] = None
    plugin_id: Optional[str] = None
    extra: Dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class BuildReport:
    """Aggregate diagnostics for a single build operation."""

    build_id: str
    project_id: str
    status: str
    errors: List[EngineError] = field(default_factory=list)
    warnings: List[EngineError] = field(default_factory=list)
