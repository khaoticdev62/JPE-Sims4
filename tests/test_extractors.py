from __future__ import annotations

from jpe_sims4.extractors import extract_from_json, extract_from_xml


def test_extract_xml_text_and_attrs() -> None:
    xml = "<Root><Item name=\"Hello\">World</Item></Root>"
    res = extract_from_xml(file_path="tuning.xml", text=xml)
    assert not res.diagnostics
    sources = {s.source for s in res.segments}
    assert "Hello" in sources
    assert "World" in sources


def test_extract_json_strings() -> None:
    text = "{\"a\": \"Hello\", \"b\": [\"World\", 123]}"
    res = extract_from_json(file_path="data.json", text=text)
    assert not res.diagnostics
    sources = {s.source for s in res.segments}
    assert "Hello" in sources
    assert "World" in sources

