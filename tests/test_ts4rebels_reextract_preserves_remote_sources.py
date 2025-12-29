from __future__ import annotations

import json
from pathlib import Path

from jpe_sims4.storage import load_project, save_project
from jpe_sims4.workflow import extract_project


def test_reextract_preserves_remote_sources_from_previous_project(tmp_path: Path) -> None:
    mod = tmp_path / "mod"
    mod.mkdir(parents=True, exist_ok=True)

    # A minimal TS4Rebels manifest-like file so the plugin is exercised.
    (mod / "ts4rebels-manifest.json").write_text(
        json.dumps({"schema_version": "1", "title": "Hello", "description": "World"}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    first = extract_project(mod)
    project = first.project
    project.remote_sources = [
        {"kind": "ts4rebels", "base_url": "https://ts4rebels.cc/", "enabled": False, "allowed_hosts": ["ts4rebels.cc"]}
    ]

    project_path = tmp_path / "project.jpe.json"
    save_project(project, project_path)

    second = extract_project(mod, merge_from_project_json=project_path)
    assert any(rs.get("kind") == "ts4rebels" for rs in (second.project.remote_sources or []))
    assert second.project.remote_sources == load_project(project_path).remote_sources

