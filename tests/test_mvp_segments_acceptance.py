from __future__ import annotations

import json
from pathlib import Path

from jpe_sims4.storage import load_project, save_project
from jpe_sims4.workflow import extract_project


def test_mvp_extract_sample_mod_and_reextract_preserves_fields(tmp_path: Path) -> None:
    # Sample "mod" folder with supported MVP formats: xml/json/ini/jpe-quoted.
    mod = tmp_path / "sample_mod"
    mod.mkdir()

    (mod / "strings.xml").write_text("<root><t>Hello</t></root>", encoding="utf-8")
    (mod / "data.json").write_text(json.dumps({"a": "Hello"}, ensure_ascii=False), encoding="utf-8")
    (mod / "config.ini").write_text("key=Hello\n", encoding="utf-8")
    # Two identical quoted strings on the same line create duplicate segments (same file+location+source).
    (mod / "script.jpe").write_text('"Hello" "Hello"\n', encoding="utf-8")

    res1 = extract_project(mod)
    p1 = res1.project
    assert p1.segments, "Expected non-empty segments[] for supported formats."

    # Segment ids must remain stable when file_path + location + source do not change.
    by_sig_1 = {(s["file_path"], s["location"], s["source"]): s["id"] for s in p1.segments}  # type: ignore[index]
    assert len(by_sig_1) == len(p1.segments), "Expected segments to be deduped by (file_path, location, source)."

    # Persist translations and workflow metadata for one segment.
    keep_id = str(p1.segments[0]["id"])
    for s in p1.segments:
        if str(s.get("id") or "") == keep_id:
            s["target"] = "Bonjour"
            s["status"] = "reviewed"
            s["note"] = "keep me"
            break

    prev_json = tmp_path / "project.prev.json"
    save_project(p1, prev_json)

    res2 = extract_project(mod, merge_from_project_json=prev_json)
    p2 = res2.project
    assert p2.segments

    by_sig_2 = {(s["file_path"], s["location"], s["source"]): s["id"] for s in p2.segments}  # type: ignore[index]
    assert by_sig_2 == by_sig_1

    kept = [s for s in p2.segments if str(s.get("id") or "") == keep_id][0]
    assert kept.get("target") == "Bonjour"
    assert kept.get("status") == "reviewed"
    assert kept.get("note") == "keep me"


def test_project_json_roundtrip_keeps_segments_and_glossary_and_validation(tmp_path: Path) -> None:
    mod = tmp_path / "mod"
    mod.mkdir()
    (mod / "strings.xml").write_text("<root><t>Hello</t></root>", encoding="utf-8")

    p = extract_project(mod).project
    p.validation = {"max_target_len": 10}
    p.glossary = [{"id": "g1", "source": "Hello", "target": "Bonjour", "enabled": True}]

    out = tmp_path / "project.json"
    save_project(p, out)

    loaded = load_project(out)
    assert loaded.segments
    assert loaded.validation == {"max_target_len": 10}
    assert loaded.glossary and loaded.glossary[0]["id"] == "g1"

