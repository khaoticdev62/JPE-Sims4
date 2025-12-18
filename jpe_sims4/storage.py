from __future__ import annotations

import hashlib
import json
from pathlib import Path

from jpe_sims4.project import Project
from jpe_sims4.remote_sources import normalize_remote_sources


def save_project(project: Project, path: Path) -> None:
    path = path.expanduser().resolve()
    path.write_text(json.dumps(project.to_dict(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _legacy_project_uid(source_path: str, created_at: str) -> str:
    h = hashlib.sha1()
    h.update(source_path.encode("utf-8", "ignore"))
    h.update(b"\0")
    h.update(created_at.encode("utf-8", "ignore"))
    return h.hexdigest()[:24]


def load_project(path: Path) -> Project:
    path = path.expanduser().resolve()
    data = json.loads(path.read_text(encoding="utf-8"))

    project = Project.create(source_path=Path(data["source_path"]))
    project.version = str(data.get("version") or project.version)
    project.created_at = str(data.get("created_at") or project.created_at)
    project.name = data.get("name")
    project.source_locale = data.get("source_locale")
    project.target_locale = data.get("target_locale")
    project.exclude_globs = list(data.get("exclude_globs") or [])
    project.project_uid = str(data.get("project_uid") or _legacy_project_uid(str(project.source_path), project.created_at))
    project.sync_root = data.get("sync_root")
    project.sync_auto_push = bool(data.get("sync_auto_push") or False)
    project.sync_last_remote_hash = data.get("sync_last_remote_hash")
    project.files = list(data.get("files") or [])
    project.file_index = dict(data.get("file_index") or {})
    project.diagnostics = list(data.get("diagnostics") or [])
    project.segments = list(data.get("segments") or [])
    project.glossary = list(data.get("glossary") or [])
    project.validation = dict(data.get("validation") or {})
    project.build_history = list(data.get("build_history") or [])
    project.plugin_paths = list(data.get("plugin_paths") or [])
    project.disabled_plugins = list(data.get("disabled_plugins") or [])
    project.remote_sources = normalize_remote_sources(data.get("remote_sources"))
    return project
