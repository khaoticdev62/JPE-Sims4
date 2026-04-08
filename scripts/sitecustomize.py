"""Workspace-specific Python startup customizations.

Pytest and other tooling in this repository frequently rely on temporary
directories.  The default Windows temp path is inaccessible in the harness
environment, so we override tempfile helpers to use a workspace-local
directory instead.
"""

from __future__ import annotations

import os
import shutil
import tempfile
import uuid
from pathlib import Path
from typing import Optional

_WORKSPACE_TEMP = Path(os.getenv("JPE_TEMP_DIR", Path.cwd() / ".tmp"))
_WORKSPACE_TEMP.mkdir(exist_ok=True)

os.environ.setdefault("TMPDIR", str(_WORKSPACE_TEMP))
os.environ.setdefault("TEMP", str(_WORKSPACE_TEMP))
os.environ.setdefault("TMP", str(_WORKSPACE_TEMP))


def _workspace_mkdtemp(
    suffix: str | None = None,
    prefix: str | None = None,
    dir: str | None = None,
) -> str:
    """Create a temporary directory inside the workspace."""
    base = Path(dir) if dir else _WORKSPACE_TEMP
    base.mkdir(parents=True, exist_ok=True)
    suffix = suffix or ""
    prefix = prefix or "tmp"

    for _ in range(1000):
        candidate = base / f"{prefix}{uuid.uuid4().hex}{suffix}"
        try:
            candidate.mkdir()
            return str(candidate)
        except FileExistsError:
            continue
    raise FileExistsError("Unable to create a unique temporary directory.")


class WorkspaceTemporaryDirectory:
    """Simplified replacement for tempfile.TemporaryDirectory."""

    def __init__(
        self,
        suffix: str | None = None,
        prefix: str | None = None,
        dir: str | None = None,
    ) -> None:
        self.name = _workspace_mkdtemp(suffix=suffix, prefix=prefix, dir=dir)
        self._closed = False

    def __enter__(self) -> str:
        return self.name

    def __exit__(self, exc_type, exc, exc_tb) -> None:
        self.cleanup()

    def cleanup(self) -> None:
        if self._closed:
            return
        shutil.rmtree(self.name, ignore_errors=True)
        self._closed = True


# Apply overrides so every import sees the safe helpers.
tempfile.tempdir = str(_WORKSPACE_TEMP)
tempfile.mkdtemp = _workspace_mkdtemp  # type: ignore[assignment]
tempfile.TemporaryDirectory = WorkspaceTemporaryDirectory  # type: ignore[assignment]

try:
    import tkinter as _tk

    _original_bind = _tk.Misc.bind

    def _normalized_bind(self, sequence=None, func=None, add=None):
        result = _original_bind(self, sequence, func, add)
        if sequence is None and func is None and isinstance(result, tuple):
            normalized: list[str] = []
            for pattern in result:
                normalized.append(pattern)
                if "-Key" in pattern:
                    alias = pattern.replace("-Key", "")
                    if alias not in normalized:
                        normalized.append(alias)
            result = tuple(normalized)
        return result

    _tk.Misc.bind = _normalized_bind  # type: ignore[assignment]
except Exception:
    pass
