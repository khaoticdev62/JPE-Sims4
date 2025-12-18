from __future__ import annotations

from jpe_sims4.bulk import (
    apply_best_tm_to_empty_targets,
    apply_best_tm_to_empty_targets_scoped,
    propagate_targets_by_source,
    propagate_targets_by_source_scoped,
)


def test_propagate_targets_by_source() -> None:
    segments = [
        {"id": "1", "source": "Hello", "target": "Bonjour", "status": "reviewed"},
        {"id": "2", "source": "Hello", "target": "", "status": "new"},
        {"id": "3", "source": "Hello", "target": "Salut", "status": "reviewed"},
        {"id": "4", "source": "Other", "target": "", "status": "new"},
    ]
    res = propagate_targets_by_source(segments, overwrite=False, set_status="in_progress")
    assert res.updated_segments == 1
    assert segments[1]["target"] == "Bonjour"
    assert segments[1]["status"] == "in_progress"
    assert segments[2]["target"] == "Salut"
    assert segments[3]["target"] == ""


def test_apply_best_tm_to_empty_targets() -> None:
    segments = [
        {"id": "1", "source": "Hello world", "target": "Bonjour le monde", "status": "reviewed"},
        {"id": "2", "source": "Hello world", "target": "", "status": "new"},
        {"id": "3", "source": "Hello world", "target": "Salut le monde", "status": "reviewed"},
    ]
    res = apply_best_tm_to_empty_targets(segments, min_score=95, overwrite=False, set_status="in_progress")
    assert res.updated_segments == 1
    assert segments[1]["target"] == "Bonjour le monde"
    assert segments[1]["status"] == "in_progress"
    assert segments[2]["target"] == "Salut le monde"


def test_propagate_targets_by_source_scoped_only_updates_scope() -> None:
    segments = [
        {"id": "1", "source": "Hello", "target": "Bonjour", "status": "reviewed"},
        {"id": "2", "source": "Hello", "target": "", "status": "new"},
        {"id": "3", "source": "Hello", "target": "", "status": "new"},
    ]
    scope = [segments[2]]
    res = propagate_targets_by_source_scoped(segments, scope=scope, overwrite=False, set_status="in_progress")
    assert res.updated_segments == 1
    assert segments[1]["target"] == ""
    assert segments[2]["target"] == "Bonjour"


def test_apply_best_tm_to_empty_targets_scoped_only_updates_scope() -> None:
    segments = [
        {"id": "1", "source": "Hello", "target": "Bonjour", "status": "reviewed"},
        {"id": "2", "source": "Hello", "target": "", "status": "new"},
        {"id": "3", "source": "Hello", "target": "", "status": "new"},
    ]
    scope = [segments[2]]
    res = apply_best_tm_to_empty_targets_scoped(segments, scope=scope, min_score=95, overwrite=False, set_status="in_progress")
    assert res.updated_segments == 1
    assert segments[1]["target"] == ""
    assert segments[2]["target"] == "Bonjour"
