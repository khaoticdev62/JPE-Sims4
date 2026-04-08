from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, Optional


class DiagSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


@dataclass(frozen=True)
class Span:
    start: int  # absolute char offset
    end: int    # absolute char offset

    def clamp(self, n: int) -> "Span":
        return Span(max(0, min(self.start, n)), max(0, min(self.end, n)))


@dataclass(frozen=True)
class Location:
    line: int
    col: int


def index_to_linecol(text: str, idx: int) -> Location:
    idx = max(0, min(idx, len(text)))
    line = text.count("\n", 0, idx) + 1
    last_nl = text.rfind("\n", 0, idx)
    col = idx + 1 if last_nl == -1 else (idx - last_nl)
    return Location(line=line, col=col)


@dataclass(frozen=True)
class Diagnostic:
    code: str
    severity: DiagSeverity
    message: str
    span: Optional[Span] = None
    hint: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None

    def to_dict(self, text: str | None = None) -> dict[str, Any]:
        out: dict[str, Any] = {
            "code": self.code,
            "severity": self.severity.value,
            "message": self.message,
        }
        if self.span is not None:
            out["span"] = {"start": self.span.start, "end": self.span.end}
            if text is not None:
                s = self.span.clamp(len(text))
                out["location"] = {
                    "start": index_to_linecol(text, s.start).__dict__,
                    "end": index_to_linecol(text, s.end).__dict__,
                }
                out["snippet"] = text[s.start:s.end]
        if self.hint:
            out["hint"] = self.hint
        if self.metadata:
            out["metadata"] = self.metadata
        return out
