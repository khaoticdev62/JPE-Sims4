from __future__ import annotations

from pathlib import Path

from jpe_sims4.storage import save_project
from jpe_sims4.workflow import extract_project


def test_e2e_reextract_preserves_fields_only_for_unchanged_segments(tmp_path: Path) -> None:
    src = tmp_path / "mod"
    src.mkdir()
    xml = src / "tuning.xml"
    xml.write_text("<Root><Item name=\"Hello\">World</Item></Root>", encoding="utf-8")

    first = extract_project(src).project
    assert first.segments
    first_id = str(first.segments[0]["id"])

    first.segments[0]["target"] = "Bonjour"
    first.segments[0]["status"] = "reviewed"
    first.segments[0]["note"] = "keep"

    prev_path = tmp_path / "prev.project.json"
    save_project(first, prev_path)

    second = extract_project(src, merge_from_project_json=prev_path).project
    merged = next(s for s in second.segments if str(s.get("id") or "") == first_id)
    assert merged["target"] == "Bonjour"
    assert merged["status"] == "reviewed"
    assert merged["note"] == "keep"

    xml.write_text("<Root><Item name=\"Hello!\">World</Item></Root>", encoding="utf-8")
    third = extract_project(src, merge_from_project_json=prev_path).project
    assert all(str(s.get("id") or "") != first_id for s in third.segments)
    assert all(str(s.get("target") or "") != "Bonjour" for s in third.segments)

