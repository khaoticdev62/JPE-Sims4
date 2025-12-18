from __future__ import annotations

import json
from pathlib import Path

import pytest


def _write_project_json(path: Path, *, source_path: Path) -> None:
    source_path.mkdir(parents=True, exist_ok=True)
    payload = {
        "source_path": str(source_path),
        "version": "test",
        "files": [],
        "file_index": {},
        "diagnostics": [],
        "segments": [],
        "glossary": [],
        "validation": {},
        "build_history": [],
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def test_ui_smoke_launch_and_open_project_json(tmp_path: Path) -> None:
    try:
        from tkinter import Tk, TclError
    except Exception:
        pytest.skip("tkinter not available")

    try:
        root = Tk()
    except TclError:
        pytest.skip("No display available for Tk")

    root.withdraw()
    try:
        from jpe_studio.app import StudioApp

        app = StudioApp(root)
        project_path = tmp_path / "project.json"
        _write_project_json(project_path, source_path=tmp_path / "src")

        # Exercise the render path without user dialogs.
        app._open_project_json_from_path(project_path)  # type: ignore[attr-defined]
        assert app.project is not None
        assert str(app.project.source_path).endswith("src")
    finally:
        try:
            root.destroy()
        except Exception:
            pass

