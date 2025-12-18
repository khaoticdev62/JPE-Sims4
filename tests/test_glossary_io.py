from __future__ import annotations

from pathlib import Path

from jpe_sims4.glossary_io import export_glossary_csv, import_glossary_csv
from jpe_sims4.project import Project


def test_glossary_csv_roundtrip(tmp_path: Path) -> None:
    p = Project.create(source_path=tmp_path / "src")
    p.glossary = [
        {
            "id": "g1",
            "source": "Simoleon",
            "target": "Simflouz",
            "note": "Currency",
            "enabled": True,
            "case_sensitive": False,
            "whole_word": True,
            "updated_at": "2025-01-01T00:00:00+00:00",
        }
    ]
    out = tmp_path / "glossary.csv"
    export_glossary_csv(p, out)

    p2 = Project.create(source_path=tmp_path / "src")
    res = import_glossary_csv(p2, out, overwrite=True)
    assert res.added == 1
    assert len(p2.glossary) == 1
    assert p2.glossary[0]["id"] == "g1"
    assert p2.glossary[0]["source"] == "Simoleon"
    assert p2.glossary[0]["whole_word"] is True

