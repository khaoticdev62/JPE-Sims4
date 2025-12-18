from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4


@dataclass
class Project:
    version: str
    created_at: str
    source_path: Path
    name: str | None = None
    source_locale: str | None = None
    target_locale: str | None = None
    # File exclude patterns (POSIX/glob style) applied during scan/extract/build.
    exclude_globs: list[str] = field(default_factory=list)
    project_uid: str = field(default_factory=lambda: uuid4().hex)
    sync_root: str | None = None
    sync_auto_push: bool = False
    sync_last_remote_hash: str | None = None
    files: list[dict[str, str]] = field(default_factory=list)
    file_index: dict[str, dict[str, object]] = field(default_factory=dict)
    diagnostics: list[dict[str, object]] = field(default_factory=list)
    segments: list[dict[str, object]] = field(default_factory=list)
    glossary: list[dict[str, object]] = field(default_factory=list)
    validation: dict[str, object] = field(default_factory=dict)
    build_history: list[dict[str, object]] = field(default_factory=list)
    # Studio/CLI plugin configuration. Paths are additional plugin directories; disabled paths are module file paths.
    plugin_paths: list[str] = field(default_factory=list)
    disabled_plugins: list[str] = field(default_factory=list)
    # List of remote integrations (e.g., TS4Rebels) and their persisted settings.
    # Legacy projects stored this as a dict keyed by kind; load_project() normalizes.
    remote_sources: list[dict[str, object]] = field(default_factory=list)

    @classmethod
    def create(cls, source_path: Path) -> "Project":
        return cls(
            version="m9",
            created_at=datetime.now(timezone.utc).isoformat(),
            source_path=source_path,
        )

    def to_dict(self) -> dict[str, object]:
        return {
            "version": self.version,
            "created_at": self.created_at,
            "source_path": str(self.source_path),
            "name": self.name,
            "source_locale": self.source_locale,
            "target_locale": self.target_locale,
            "exclude_globs": list(self.exclude_globs or []),
            "project_uid": self.project_uid,
            "sync_root": self.sync_root,
            "sync_auto_push": self.sync_auto_push,
            "sync_last_remote_hash": self.sync_last_remote_hash,
            "files": self.files,
            "file_index": self.file_index,
            "diagnostics": self.diagnostics,
            "segments": self.segments,
            "glossary": self.glossary,
            "validation": self.validation,
            "build_history": self.build_history,
            "plugin_paths": self.plugin_paths,
            "disabled_plugins": self.disabled_plugins,
            "remote_sources": self.remote_sources,
        }
