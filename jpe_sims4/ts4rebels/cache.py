from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


def default_cache_root(*, project_dir: Path) -> Path:
    return project_dir / ".jpe_cache" / "ts4rebels"


@dataclass(frozen=True)
class CacheEntry:
    url: str
    sha256: str
    saved_as: str
    downloaded_at: str
    etag: str | None = None
    last_modified: str | None = None

    def to_dict(self) -> dict[str, object]:
        return {
            "url": self.url,
            "sha256": self.sha256,
            "saved_as": self.saved_as,
            "downloaded_at": self.downloaded_at,
            "etag": self.etag,
            "last_modified": self.last_modified,
        }


def load_index(root: Path) -> list[dict[str, object]]:
    path = root / "index.json"
    if not path.exists():
        return []
    return list(json.loads(path.read_text(encoding="utf-8")) or [])


def save_index(root: Path, entries: list[dict[str, object]]) -> None:
    root.mkdir(parents=True, exist_ok=True)
    (root / "index.json").write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def append_entry(root: Path, entry: CacheEntry, *, max_entries: int = 200) -> None:
    entries = load_index(root)
    entries = [e for e in entries if str(e.get("url") or "") != entry.url]
    entries.insert(0, entry.to_dict())
    entries = entries[: int(max_entries)]
    save_index(root, entries)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

