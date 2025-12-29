from __future__ import annotations

from pathlib import Path

from jpe_sims4.storage import save_project
from jpe_sims4.workflow import extract_project


def test_e2e_reextract_preserves_ini_edits_when_lines_shift(tmp_path: Path) -> None:
    src = tmp_path / "mod"
    src.mkdir()
    ini = src / "settings.ini"
    ini.write_text("[main]\ntitle=Hello\n", encoding="utf-8")

    first = extract_project(src).project
    seg = next(s for s in first.segments if str(s.get("source") or "") == "Hello")
    seg_id = str(seg.get("id") or "")
    seg["target"] = "Bonjour"
    seg["status"] = "reviewed"
    seg["note"] = "keep"

    prev_path = tmp_path / "prev.project.json"
    save_project(first, prev_path)

    # Insert a comment line at the top: legacy (line-based) ids would change, but ini:[section].key stays stable.
    ini.write_text("; comment\n[main]\ntitle=Hello\n", encoding="utf-8")
    second = extract_project(src, merge_from_project_json=prev_path).project
    merged = next(s for s in second.segments if str(s.get("id") or "") == seg_id)
    assert merged["target"] == "Bonjour"
    assert merged["status"] == "reviewed"
    assert merged["note"] == "keep"

