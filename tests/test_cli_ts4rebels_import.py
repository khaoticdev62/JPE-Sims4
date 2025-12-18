from __future__ import annotations

import json
from pathlib import Path

import cli
from jpe_sims4.storage import load_project


def _write_project_json(path: Path, *, source_path: Path, segments: list[dict[str, object]]) -> None:
    source_path.mkdir(parents=True, exist_ok=True)
    payload = {
        "source_path": str(source_path),
        "version": "test",
        "files": [],
        "file_index": {},
        "diagnostics": [],
        "segments": segments,
        "glossary": [],
        "validation": {},
        "build_history": [],
        "remote_sources": [],
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def test_cli_plugins_lists_ts4rebels_extractors(capsys) -> None:
    code = cli.main(["plugins", "--json"])
    assert code == 0
    out = json.loads(capsys.readouterr().out)
    assert "ts4rebels-manifest" in out["extractors"]
    assert "ts4rebels-meta" in out["extractors"]
    assert "ts4rebels-manifest" in out["appliers"]


def test_cli_ts4rebels_import_updates_project_in_place(tmp_path: Path, capsys) -> None:
    project_path = tmp_path / "project.json"
    _write_project_json(
        project_path,
        source_path=tmp_path / "src",
        segments=[
            {"id": "1", "file_path": "a.xml", "location": "x", "source": "Hello", "target": ""},
            {"id": "2", "file_path": "a.xml", "location": "y", "source": "Other", "target": ""},
        ],
    )
    pack = tmp_path / "pack.csv"
    pack.write_text("source,target\nHello,Bonjour\n", encoding="utf-8")

    code = cli.main(["ts4rebels-import", "--project", str(project_path), "--in", str(pack), "--in-place", "--json"])
    out = json.loads(capsys.readouterr().out)
    assert code == 0
    assert out["segments_updated"] == 1

    loaded = load_project(project_path)
    seg = next(s for s in loaded.segments if str(s.get("id")) == "1")
    assert str(seg.get("target") or "") == "Bonjour"
