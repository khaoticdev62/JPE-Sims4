from __future__ import annotations

from pathlib import Path

from jpe_sims4.storage import save_project
from jpe_sims4.workflow import extract_project


def test_extract_project_merges_existing_segment_fields(tmp_path: Path) -> None:
    src = tmp_path / "mod"
    src.mkdir()
    (src / "tuning.xml").write_text("<Root><Item name=\"Hello\">World</Item></Root>", encoding="utf-8")

    first = extract_project(src).project
    assert first.segments
    sid = str(first.segments[0]["id"])
    for s in first.segments:
        s["target"] = "X"
        s["status"] = "reviewed"
        s["note"] = "n"
        s["updated_at"] = "2025-01-01T00:00:00+00:00"

    prev_path = tmp_path / "prev.json"
    save_project(first, prev_path)

    second = extract_project(src, merge_from_project_json=prev_path).project
    merged = next(s for s in second.segments if str(s.get("id")) == sid)
    assert merged["target"] == "X"
    assert merged["status"] == "reviewed"
    assert merged["note"] == "n"
    assert merged["updated_at"] == "2025-01-01T00:00:00+00:00"
