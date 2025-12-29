from __future__ import annotations

from jpe_sims4.workspace import compute_progress, filter_segments, next_untranslated_id, sort_segments, update_segment_editor_fields


def test_filter_segments_search_status_and_file() -> None:
    segments = [
        {"id": "1", "file_path": "a.xml", "location": "x", "source": "Hello", "target": "", "status": "new", "note": ""},
        {"id": "2", "file_path": "b.xml", "location": "y", "source": "World", "target": "Monde", "status": "reviewed", "note": "ok"},
        {"id": "3", "file_path": "a.xml", "location": "z", "source": "Other", "target": "X", "status": "in_progress", "note": ""},
    ]
    assert [s["id"] for s in filter_segments(segments, query="hello")] == ["1"]
    assert [s["id"] for s in filter_segments(segments, status="reviewed")] == ["2"]
    assert [s["id"] for s in filter_segments(segments, file_path="a.xml")] == ["1", "3"]
    assert [s["id"] for s in filter_segments(segments, query="ok")] == ["2"]
    assert [s["id"] for s in filter_segments(segments, query="b.xml")] == ["2"]
    assert [s["id"] for s in filter_segments(segments, query="2")] == ["2"]


def test_compute_progress() -> None:
    segments = [
        {"id": "1", "target": "", "status": "new"},
        {"id": "2", "target": "x", "status": "in_progress"},
        {"id": "3", "target": "y", "status": "reviewed"},
    ]
    p = compute_progress(segments)
    assert p.total == 3
    assert p.translated == 2
    assert p.reviewed == 1


def test_sort_segments_is_deterministic() -> None:
    segments = [
        {"id": "b", "file_path": "b.xml", "location": "2"},
        {"id": "a", "file_path": "a.xml", "location": "2"},
        {"id": "c", "file_path": "a.xml", "location": "1"},
    ]
    out = sort_segments(segments)
    assert [s["id"] for s in out] == ["c", "a", "b"]


def test_update_segment_editor_fields_autosets_in_progress() -> None:
    seg = {"id": "1", "source": "Hello", "target": "", "status": "new", "note": "", "updated_at": None}
    update_segment_editor_fields(seg, target="Bonjour", note="n", status="new", now_iso="2025-01-01T00:00:00+00:00")
    assert seg["target"] == "Bonjour"
    assert seg["note"] == "n"
    assert seg["status"] == "in_progress"
    assert seg["updated_at"] == "2025-01-01T00:00:00+00:00"


def test_next_untranslated_id_wraps_and_returns_none() -> None:
    visible = [
        {"id": "a", "target": "x"},
        {"id": "b", "target": ""},
        {"id": "c", "target": ""},
    ]
    assert next_untranslated_id(visible, current_id="a") == "b"
    assert next_untranslated_id(visible, current_id="b") == "c"
    assert next_untranslated_id(visible, current_id="c") == "b"  # wraps
    assert next_untranslated_id([{"id": "x", "target": "y"}], current_id="x") is None
