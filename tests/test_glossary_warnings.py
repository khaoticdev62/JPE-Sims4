from __future__ import annotations

from jpe_sims4.validate import validate_segment


def test_glossary_preferred_missing_emits_warning() -> None:
    seg = {"id": "s1", "file_path": "a.ini", "location": "x", "source": "Pay 5 Simoleons", "target": "Payez 5", "status": "new"}
    glossary = [{"id": "g1", "mode": "preferred", "source": "Simoleons", "target": "Simflouz", "enabled": True}]
    diags = validate_segment(segment=seg, glossary_entries=glossary, rules={})
    assert any(d.code == "W_GLOSSARY_MISSING" for d in diags)


def test_glossary_forbidden_emits_warning_when_present_in_target() -> None:
    seg = {"id": "s1", "file_path": "a.ini", "location": "x", "source": "Pay 5 Simoleons", "target": "Payez 5 Simoleons", "status": "new"}
    glossary = [{"id": "g1", "mode": "forbidden", "source": "Simoleons", "target": "", "enabled": True}]
    diags = validate_segment(segment=seg, glossary_entries=glossary, rules={})
    assert any(d.code == "W_GLOSSARY_FORBIDDEN" for d in diags)


def test_glossary_forbidden_blank_target_non_blocking() -> None:
    seg = {"id": "s1", "file_path": "a.ini", "location": "x", "source": "Pay 5 Simoleons", "target": "", "status": "new"}
    glossary = [{"id": "g1", "mode": "forbidden", "source": "Simoleons", "enabled": True}]
    diags = validate_segment(segment=seg, glossary_entries=glossary, rules={})
    assert not any(d.code == "W_GLOSSARY_FORBIDDEN" for d in diags)

