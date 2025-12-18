from __future__ import annotations

import json
from pathlib import Path


def recents_file_path() -> Path:
    return (Path.cwd() / ".tmp" / "studio_recents.json").expanduser()


def load_recents(*, limit: int = 50) -> list[str]:
    path = recents_file_path()
    try:
        if not path.exists():
            return []
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            out = [str(x) for x in data if str(x).strip()]
            return out[:limit]
    except Exception:
        return []
    return []


def save_recents(paths: list[str], *, limit: int = 50) -> None:
    path = recents_file_path()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(list(paths)[:limit], indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    except Exception:
        return


def push_recent(paths: list[str], project_json_path: Path, *, limit: int = 50) -> list[str]:
    try:
        raw = str(project_json_path.expanduser().resolve())
    except Exception:
        raw = str(project_json_path)
    if not raw.strip():
        return list(paths)[:limit]
    next_paths = [p for p in paths if str(p) != raw]
    next_paths.insert(0, raw)
    return next_paths[:limit]

