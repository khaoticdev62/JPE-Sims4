from __future__ import annotations

from pathlib import Path

from jpe_sims4.bulk import apply_best_sqlite_tm_to_empty_targets
from jpe_sims4.tm.sqlite_store import SqliteTMStore, TMRow


def test_bulk_apply_best_tm_uses_sqlite_store(tmp_path: Path) -> None:
    store = SqliteTMStore(db_path=tmp_path / "tm.sqlite3")
    store.add(TMRow(source_locale="en", target_locale="fr", source="Hello", target="Bonjour", segment_id="x"))

    segments = [
        {"id": "s1", "source": "Hello", "target": "", "status": "new"},
        {"id": "s2", "source": "Other", "target": "", "status": "new"},
    ]
    res = apply_best_sqlite_tm_to_empty_targets(
        segments,
        tm_store=store,
        source_locale="en",
        target_locale="fr",
        min_score=95,
        overwrite=False,
        set_status="in_progress",
    )
    assert res.updated_segments == 1
    assert segments[0]["target"] == "Bonjour"
    assert segments[0]["status"] == "in_progress"

