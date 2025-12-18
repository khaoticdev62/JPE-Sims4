from __future__ import annotations

from jpe_sims4.glossary import glossary_hits
from jpe_sims4.validation import validate_segment


def test_glossary_hits_whole_word_and_case() -> None:
    entries = [
        {"id": "e1", "source": "cat", "target": "chat", "enabled": True, "whole_word": True, "case_sensitive": False},
        {"id": "e2", "source": "Sims", "target": "Les Sims", "enabled": True, "whole_word": False, "case_sensitive": True},
    ]
    hits = glossary_hits(entries, "concatenate cat Cat SIMS Sims")
    ids = {h.entry_id for h in hits}
    assert "e1" in ids
    assert "e2" in ids

    e1 = [h for h in hits if h.entry_id == "e1"][0]
    assert e1.count == 2  # cat + Cat (case-insensitive), not "concatenate"

    e2 = [h for h in hits if h.entry_id == "e2"][0]
    assert e2.count == 1  # only "Sims" matches (case-sensitive)


def test_validate_segment_glossary_warning() -> None:
    glossary = [{"id": "e1", "source": "Hello", "target": "Bonjour", "enabled": True}]
    seg = {"id": "s1", "file_path": "a.xml", "location": "x", "source": "Hello world", "target": "Salut monde"}
    diags = validate_segment(segment=seg, glossary_entries=glossary)
    assert any(d.code == "W_GLOSSARY_MISSING" for d in diags)

