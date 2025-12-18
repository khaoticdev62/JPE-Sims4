from __future__ import annotations

import json
from pathlib import Path

from jpe_sims4.tm.sqlite_store import SqliteTMStore, TMRow


def test_sqlite_tm_exact_is_100_and_deterministic(tmp_path: Path) -> None:
    db = tmp_path / "tm.sqlite3"
    store = SqliteTMStore(db_path=db)
    assert store.add(TMRow(source_locale="en", target_locale="fr", source="Hello world", target="Bonjour le monde", segment_id="s1"))
    assert store.add(TMRow(source_locale="en", target_locale="fr", source="Hello world", target="Salut monde", segment_id="s2"))

    hits = store.suggest(source_locale="en", target_locale="fr", source="Hello world", limit=5, min_score=70)
    assert [h.score for h in hits] == [100, 100]
    # Deterministic tie-break: ORDER BY target ASC.
    assert [h.target for h in hits] == ["Bonjour le monde", "Salut monde"]


def test_sqlite_tm_fuzzy_and_concordance(tmp_path: Path) -> None:
    store = SqliteTMStore(db_path=tmp_path / "tm.sqlite3")
    store.add(TMRow(source_locale="en", target_locale="fr", source="Open the door", target="Ouvre la porte", segment_id="1"))
    store.add(TMRow(source_locale="en", target_locale="fr", source="Close the door", target="Ferme la porte", segment_id="2"))

    fuzzy = store.suggest(source_locale="en", target_locale="fr", source="Open door", limit=3, min_score=60)
    assert fuzzy and fuzzy[0].target == "Ouvre la porte"

    tgt_hits = store.concordance(source_locale="en", target_locale="fr", query="porte", in_field="target", limit=10)
    assert len(tgt_hits) == 2


def test_sqlite_tm_import_export_json_roundtrip(tmp_path: Path) -> None:
    store = SqliteTMStore(db_path=tmp_path / "tm.sqlite3")
    store.add(TMRow(source_locale="en", target_locale="es", source="Yes", target="Sí", segment_id="a"))
    store.add(TMRow(source_locale="en", target_locale="es", source="No", target="No", segment_id="b"))

    out = tmp_path / "tm.json"
    store.export_json(out, source_locale="en", target_locale="es")
    payload = json.loads(out.read_text(encoding="utf-8"))
    assert payload["version"] == 1
    assert len(payload["entries"]) == 2

    store2 = SqliteTMStore(db_path=tmp_path / "tm2.sqlite3")
    added = store2.import_json(out, source_locale="en", target_locale="es")
    assert added == 2
    hits = store2.suggest(source_locale="en", target_locale="es", source="Yes", limit=1, min_score=70)
    assert hits and hits[0].target == "Sí" and hits[0].score == 100


def test_sqlite_tm_ingest_segments_dedupes(tmp_path: Path) -> None:
    store = SqliteTMStore(db_path=tmp_path / "tm.sqlite3")
    segments = [
        {"id": "1", "source": "Hi", "target": "Salut"},
        {"id": "2", "source": "Hi", "target": "Salut"},
        {"id": "3", "source": "Hi", "target": ""},
    ]
    added = store.ingest_segments(segments, source_locale="en", target_locale="fr")
    assert added == 1

