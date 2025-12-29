from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Diagnostic:
    severity: str  # INFO|WARNING|ERROR|FATAL
    code: str
    message: str
    file_path: str | None = None
    category: str | None = None
    location: str | None = None
    segment_id: str | None = None

    def to_dict(self) -> dict[str, object]:
        return {
            "severity": self.severity,
            "code": self.code,
            "message": self.message,
            "file_path": self.file_path,
            "category": self.category,
            "location": self.location,
            "segment_id": self.segment_id,
        }
