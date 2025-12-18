from __future__ import annotations

from jpe_sims4.tm import concordance


def test_concordance_searches_source_and_target() -> None:
    tm = [
        {"id": "1", "source": "Open the door", "target": "Ouvre la porte"},
        {"id": "2", "source": "Close the door", "target": "Ferme la porte"},
    ]
    src_hits = concordance(tm, query="open", in_field="source")
    assert len(src_hits) == 1 and src_hits[0]["id"] == "1"

    tgt_hits = concordance(tm, query="porte", in_field="target")
    assert len(tgt_hits) == 2

