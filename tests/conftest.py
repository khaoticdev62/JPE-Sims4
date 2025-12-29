from __future__ import annotations

import os
from pathlib import Path
from uuid import uuid4

import pytest


def pytest_configure() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    local_tmp = repo_root / ".tmp"
    local_tmp.mkdir(exist_ok=True)
    os.environ.setdefault("TMPDIR", str(local_tmp))
    os.environ.setdefault("TMP", str(local_tmp))
    os.environ.setdefault("TEMP", str(local_tmp))


@pytest.fixture
def tmp_path() -> Path:
    """
    Sandbox-safe replacement for pytest's built-in `tmp_path`.

    The harness restricts access to OS temp directories and may also block
    directories with `pytest*` naming; use a project-local temp root instead.
    """
    repo_root = Path(__file__).resolve().parents[1]
    root = repo_root / ".jpe_tmp"
    root.mkdir(parents=True, exist_ok=True)
    p = root / f"t_{uuid4().hex}"
    p.mkdir(parents=True, exist_ok=True)
    try:
        yield p
    finally:
        try:
            for child in sorted(p.rglob("*"), reverse=True):
                try:
                    if child.is_dir():
                        child.rmdir()
                    else:
                        child.unlink()
                except Exception:
                    pass
            try:
                p.rmdir()
            except Exception:
                pass
        except Exception:
            pass
