from __future__ import annotations

from pathlib import Path

from jpe_sims4.ts4rebels.translation_pack import apply_translation_pack, load_translation_pack, parse_translation_pack


def test_translation_pack_csv_parses_pairs_and_applies_to_segments(tmp_path: Path) -> None:
    p = tmp_path / "pack.csv"
    p.write_text("source,target\nHello,Bonjour\nWorld,Monde\n", encoding="utf-8")
    pack = load_translation_pack(p)
    assert ("Hello", "Bonjour") in pack.pairs

    segments = [
        {"id": "1", "source": "Hello", "target": "", "note": "", "status": "new"},
        {"id": "2", "source": "Other", "target": "", "note": "", "status": "new"},
    ]
    updated = apply_translation_pack(project_segments=segments, translation_pairs=pack.pairs, overwrite_targets=False)
    assert updated == 1
    assert segments[0]["target"] == "Bonjour"


def test_translation_pack_json_parses_pairs() -> None:
    content = b'[{"source":"Hello","target":"Bonjour"}]'
    pack = parse_translation_pack(file_path="x.json", content=content)
    assert pack.pairs == [("Hello", "Bonjour")]


def test_translation_pack_does_not_overwrite_by_default() -> None:
    pairs = [("Hello", "Bonjour")]
    segments = [{"id": "1", "source": "Hello", "target": "Hi", "note": "", "status": "new"}]
    updated = apply_translation_pack(project_segments=segments, translation_pairs=pairs, overwrite_targets=False)
    assert updated == 0

