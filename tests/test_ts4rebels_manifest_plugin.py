from __future__ import annotations

from jpe_sims4.apply import apply_translations
from jpe_sims4.extractors import extract_segments
from jpe_sims4.validate import validate_segment


def test_ts4rebels_manifest_json_extract_stable_ids_on_reorder() -> None:
    a = (
        '[{"file_name":"a.package","notes":"Hello","title":"Cool Mod"},'
        '{"file_name":"b.package","notes":"World","title":"Other"}]'
    ).encode("utf-8")
    b = (
        '[{"file_name":"b.package","notes":"World","title":"Other"},'
        '{"file_name":"a.package","notes":"Hello","title":"Cool Mod"}]'
    ).encode("utf-8")

    r1 = extract_segments(file_path="ts4rebels-manifest.json", kind="ts4rebels-manifest", content=a)
    r2 = extract_segments(file_path="ts4rebels-manifest.json", kind="ts4rebels-manifest", content=b)
    assert r1.segments
    assert {s.id for s in r1.segments} == {s.id for s in r2.segments}
    assert any("file_name=\"a.package\"" in s.location for s in r1.segments)


def test_ts4rebels_manifest_json_apply_uses_locations() -> None:
    content = '[{"file_name":"a.package","notes":"Hello"}]\n'.encode("utf-8")
    extracted = extract_segments(file_path="ts4rebels-manifest.json", kind="ts4rebels-manifest", content=content)
    assert extracted.segments
    seg = extracted.segments[0].to_dict()
    seg["target"] = "Bonjour"

    res = apply_translations(
        file_path="ts4rebels-manifest.json", kind="ts4rebels-manifest", content=content, segments=[seg]
    )
    assert res.applied == 1
    assert b"Bonjour" in res.content


def test_ts4rebels_manifest_json_apply_preserves_unrelated_text() -> None:
    content = (
        '[ { "file_name" : "a.package" , "notes" : "Hello" , "extra" : 1 } ]\n'
    ).encode("utf-8")
    extracted = extract_segments(file_path="ts4rebels-manifest.json", kind="ts4rebels-manifest", content=content)
    seg = [s for s in extracted.segments if s.location.endswith(".notes")][0].to_dict()
    seg["target"] = "Bonjour"

    res = apply_translations(
        file_path="ts4rebels-manifest.json", kind="ts4rebels-manifest", content=content, segments=[seg]
    )
    out = res.content.decode("utf-8", "replace")
    assert '"extra" : 1' in out
    assert out.startswith('[ { "file_name" : "a.package" , "notes" : ')


def test_ts4rebels_manifest_apply_failed_diagnostic_has_segment_id() -> None:
    content = '[{"file_name":"a.package","notes":"Hello"}]\n'.encode("utf-8")
    extracted = extract_segments(file_path="ts4rebels-manifest.json", kind="ts4rebels-manifest", content=content)
    seg = extracted.segments[0].to_dict()
    seg["target"] = "Bonjour"
    seg["location"] = '$[file_name="missing.package"].notes'

    res = apply_translations(
        file_path="ts4rebels-manifest.json", kind="ts4rebels-manifest", content=content, segments=[seg]
    )
    assert res.applied == 0
    assert any(d.code == "E_TS4REBEL_APPLY_FAILED" and d.segment_id == seg["id"] for d in res.diagnostics)


def test_ts4rebels_manifest_csv_extract_and_apply() -> None:
    csv_bytes = (
        "file_name,title,notes\n"
        "a.package,Cool Mod,Hello\n"
        "b.package,Other,World\n"
    ).encode("utf-8")
    extracted = extract_segments(file_path="ts4rebels-manifest.csv", kind="ts4rebels-manifest", content=csv_bytes)
    assert extracted.segments
    any_a = [s for s in extracted.segments if 'file_name="a.package"' in s.location and s.location.endswith(".notes")]
    assert any_a
    seg = any_a[0].to_dict()
    seg["target"] = "Bonjour"

    res = apply_translations(
        file_path="ts4rebels-manifest.csv", kind="ts4rebels-manifest", content=csv_bytes, segments=[seg]
    )
    assert res.applied == 1
    assert b"a.package" in res.content
    assert b"Bonjour" in res.content


def test_ts4rebels_validator_bbcode_mismatch_is_error() -> None:
    seg = {
        "id": "s1",
        "file_path": "ts4rebels-manifest.json",
        "location": '$[file_name="a.package"].notes',
        "source": "[b]Hello[/b]",
        "target": "[b]Bonjour",
    }
    diags = validate_segment(segment=seg)
    assert any(d.code == "E_TS4REBEL_TOKEN_MISMATCH" for d in diags)


def test_ts4rebels_validator_blank_target_is_non_blocking() -> None:
    seg = {
        "id": "s1",
        "file_path": "ts4rebels-manifest.json",
        "location": '$[file_name="a.package"].notes',
        "source": "[b]Hello[/b]",
        "target": "",
    }
    diags = validate_segment(segment=seg)
    assert not any(d.code == "E_TS4REBEL_TOKEN_MISMATCH" for d in diags)
