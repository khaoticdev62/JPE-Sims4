from __future__ import annotations

import hashlib
from dataclasses import dataclass
from dataclasses import field
from datetime import datetime, timezone


@dataclass
class Segment:
    id: str
    file_path: str
    location: str
    source: str
    target: str = ""
    status: str = "new"  # new|in_progress|reviewed
    note: str = ""
    updated_at: str | None = None
    id_aliases: list[str] = field(default_factory=list)

    @staticmethod
    def make_id(file_path: str, location: str, source: str) -> str:
        h = hashlib.sha1()
        h.update(file_path.encode("utf-8", "ignore"))
        h.update(b"\0")
        h.update(location.encode("utf-8", "ignore"))
        h.update(b"\0")
        h.update(source.encode("utf-8", "ignore"))
        return h.hexdigest()[:12]

    @classmethod
    def create(cls, *, file_path: str, location: str, source: str, id_aliases: list[str] | None = None) -> "Segment":
        return cls(
            id=cls.make_id(file_path, location, source),
            file_path=file_path,
            location=location,
            source=source,
            updated_at=datetime.now(timezone.utc).isoformat(),
            id_aliases=list(id_aliases or []),
        )

    def to_dict(self) -> dict[str, object]:
        return {
            "id": self.id,
            "file_path": self.file_path,
            "location": self.location,
            "source": self.source,
            "target": self.target,
            "status": self.status,
            "note": self.note,
            "updated_at": self.updated_at,
            "id_aliases": list(self.id_aliases),
        }
