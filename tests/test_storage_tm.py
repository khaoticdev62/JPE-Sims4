from __future__ import annotations

import json
from pathlib import Path

from jpe_sims4.project import Project
from jpe_sims4.storage import load_project, save_project
from jpe_sims4.tm import build_tm_from_segments, suggest


def test_project_storage_roundtrip(tmp_path: Path) -> None:
    p = Project.create(source_path=tmp_path)
    p.name = "Test"
    p.files = [{"path": "a.xml", "kind": "xml"}]
    p.file_index = {"a.xml": {"kind": "xml", "size": 1, "mtime_ns": 2, "sha256": "x"}}
    p.segments = [{"id": "s1", "file_path": "a.xml", "location": "x", "source": "Hello", "target": "Hi"}]
    p.glossary = [{"id": "g1", "source": "Simoleon", "target": "Simflouz", "enabled": True}]
    p.validation = {"max_target_len": 140}
    out = tmp_path / "project.json"
    save_project(p, out)

    loaded = load_project(out)
    assert loaded.name == "Test"
    assert loaded.files == p.files
    assert loaded.file_index == p.file_index
    assert loaded.segments == p.segments
    assert loaded.glossary == p.glossary
    assert loaded.validation == p.validation


def test_tm_suggest_exact_and_fuzzy() -> None:
    segments = [
        {"id": "1", "source": "Hello world", "target": "Bonjour le monde"},
        {"id": "2", "source": "Open the door", "target": "Ouvre la porte"},
    ]
    tm = build_tm_from_segments(segments)
    s1 = suggest(tm, "Hello world", limit=3, min_score=70)
    assert s1 and s1[0].target == "Bonjour le monde" and s1[0].score == 100
