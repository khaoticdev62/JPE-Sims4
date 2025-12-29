from __future__ import annotations

import json
from pathlib import Path
from zipfile import ZipFile

from jpe_sims4.apply import apply_ini_like, apply_jpe_like, apply_json, apply_xml
from jpe_sims4.build import build_to_folder, build_to_zip
from jpe_sims4.extractors import extract_from_json, extract_from_xml
from jpe_sims4.project import Project
from jpe_sims4.reports import render_diagnostics_markdown


def test_apply_xml_updates_text_and_attribute() -> None:
    xml = "<Root><Item name=\"Hello\">World</Item></Root>"
    extracted = extract_from_xml(file_path="tuning.xml", text=xml)
    segs = [s.to_dict() for s in extracted.segments]
    for s in segs:
        if s["source"] == "Hello":
            s["target"] = "Salut"
        if s["source"] == "World":
            s["target"] = "Monde"
    res = apply_xml(file_path="tuning.xml", content=xml.encode("utf-8"), segments=segs)
    out = res.content.decode("utf-8", "replace")
    assert "name=\"Salut\"" in out
    assert ">Monde<" in out
    assert res.applied == 2


def test_apply_json_updates_string_values() -> None:
    text = "{\"a\": \"Hello\", \"b\": [\"World\", 123]}"
    extracted = extract_from_json(file_path="data.json", text=text)
    segs = [s.to_dict() for s in extracted.segments]
    for s in segs:
        if s["source"] == "Hello":
            s["target"] = "Hi"
    res = apply_json(file_path="data.json", content=text.encode("utf-8"), segments=segs)
    data = json.loads(res.content.decode("utf-8"))
    assert data["a"] == "Hi"
    assert res.applied == 1


def test_apply_json_supports_bracket_key_paths() -> None:
    text = "{\"weird key\": \"Hello\", \"nested\": {\"a.b\": \"World\"}}"
    extracted = extract_from_json(file_path="data.json", text=text)
    segs = [s.to_dict() for s in extracted.segments]
    for s in segs:
        if s["source"] == "Hello":
            s["target"] = "Hi"
        if s["source"] == "World":
            s["target"] = "Earth"
    res = apply_json(file_path="data.json", content=text.encode("utf-8"), segments=segs)
    data = json.loads(res.content.decode("utf-8"))
    assert data["weird key"] == "Hi"
    assert data["nested"]["a.b"] == "Earth"
    assert res.applied == 2


def test_apply_ini_preserves_quotes_and_comments() -> None:
    ini = "greeting = \"Hello\" ; keep\n"
    segs = [{"id": "1", "file_path": "a.ini", "location": "line:1:greeting", "source": "Hello", "target": "Bonjour"}]
    res = apply_ini_like(file_path="a.ini", content=ini.encode("utf-8"), segments=segs)
    out = res.content.decode("utf-8")
    assert "greeting = \"Bonjour\" ; keep" in out
    assert res.applied == 1


def test_apply_ini_supports_section_key_locations() -> None:
    ini = "[main]\ngreeting = \"Hello\" ; keep\n"
    segs = [{"id": "1", "file_path": "a.ini", "location": "ini:[main].greeting", "source": "Hello", "target": "Bonjour"}]
    res = apply_ini_like(file_path="a.ini", content=ini.encode("utf-8"), segments=segs)
    out = res.content.decode("utf-8")
    assert "greeting = \"Bonjour\" ; keep" in out
    assert res.applied == 1


def test_apply_jpe_replaces_quoted_string_on_line() -> None:
    jpe = "say(\"Hello  world\")\n"
    segs = [
        {"id": "1", "file_path": "a.jpe", "location": "line:1:quoted", "source": "Hello world", "target": "Bonjour le monde"}
    ]
    res = apply_jpe_like(file_path="a.jpe", content=jpe.encode("utf-8"), segments=segs)
    out = res.content.decode("utf-8")
    assert "\"Bonjour le monde\"" in out
    assert res.applied == 1


def test_apply_jpe_can_target_duplicate_sources_with_occurrence_index() -> None:
    jpe = "\"Hello\" \"Hello\"\n"
    segs = [
        {"id": "1", "file_path": "a.jpe", "location": "line:1:quoted", "source": "Hello", "target": "A"},
        {"id": "2", "file_path": "a.jpe", "location": "line:1:quoted#2", "source": "Hello", "target": "B"},
    ]
    res = apply_jpe_like(file_path="a.jpe", content=jpe.encode("utf-8"), segments=segs)
    out = res.content.decode("utf-8")
    assert "\"A\" \"B\"" in out
    assert res.applied == 2


def test_build_to_folder_writes_translated_outputs(tmp_path: Path) -> None:
    src = tmp_path / "src"
    src.mkdir()
    (src / "data.json").write_text("{\"a\": \"Hello\"}\n", encoding="utf-8")
    (src / "tuning.xml").write_text("<Root><Item name=\"Hello\">World</Item></Root>", encoding="utf-8")

    project = Project.create(source_path=src)
    project.files = [{"path": "data.json", "kind": "json"}, {"path": "tuning.xml", "kind": "xml"}]
    extracted_xml = extract_from_xml(file_path="tuning.xml", text=(src / "tuning.xml").read_text(encoding="utf-8"))
    extracted_json = extract_from_json(file_path="data.json", text=(src / "data.json").read_text(encoding="utf-8"))
    segs = [s.to_dict() for s in [*extracted_xml.segments, *extracted_json.segments]]
    for s in segs:
        if s["source"] == "Hello":
            s["target"] = "Salut"
        if s["source"] == "World":
            s["target"] = "Monde"
    project.segments = segs

    out = tmp_path / "out"
    res = build_to_folder(project=project, output_dir=out)
    assert (out / "data.json").exists()
    assert (out / "tuning.xml").exists()
    assert (out / "manifest.jpe.json").exists()
    assert (out / "diff_report.md").exists()
    assert "\"Salut\"" in (out / "data.json").read_text(encoding="utf-8")
    assert "Monde" in (out / "tuning.xml").read_text(encoding="utf-8")
    assert res.files_written == 2
    assert res.segments_applied >= 2
    assert project.build_history


def test_build_to_zip_writes_translated_archive(tmp_path: Path) -> None:
    src_zip = tmp_path / "mod.zip"
    with ZipFile(src_zip, "w") as zf:
        zf.writestr("data.json", "{\"a\": \"Hello\"}")
        zf.writestr("readme.txt", "noop")

    project = Project.create(source_path=src_zip)
    project.files = [{"path": "data.json", "kind": "json"}, {"path": "readme.txt", "kind": "unknown"}]
    segs = [{"id": "1", "file_path": "data.json", "location": "$.a", "source": "Hello", "target": "Hi"}]
    project.segments = segs

    out_zip = tmp_path / "out.zip"
    res = build_to_zip(project=project, output_zip=out_zip)
    assert res.files_written == 2
    with ZipFile(out_zip) as zf:
        data = json.loads(zf.read("data.json").decode("utf-8"))
        assert data["a"] == "Hi"
        assert zf.getinfo("manifest.jpe.json")
        assert zf.getinfo("diff_report.md")


def test_build_creates_backup_for_existing_output_folder(tmp_path: Path) -> None:
    src = tmp_path / "src"
    src.mkdir()
    (src / "a.json").write_text("{\"a\": \"Hello\"}\n", encoding="utf-8")
    project = Project.create(source_path=src)
    project.files = [{"path": "a.json", "kind": "json"}]
    project.segments = [{"id": "1", "file_path": "a.json", "location": "$.a", "source": "Hello", "target": "Hi"}]

    out = tmp_path / "out"
    out.mkdir()
    (out / "old.txt").write_text("old", encoding="utf-8")
    res = build_to_folder(project=project, output_dir=out)
    backup_paths = [Path(d.file_path) for d in res.diagnostics if d.code == "I_BACKUP_CREATED" and d.file_path]
    assert backup_paths and backup_paths[0].exists()


def test_build_creates_backup_for_existing_output_zip(tmp_path: Path) -> None:
    src = tmp_path / "src"
    src.mkdir()
    (src / "a.json").write_text("{\"a\": \"Hello\"}\n", encoding="utf-8")
    project = Project.create(source_path=src)
    project.files = [{"path": "a.json", "kind": "json"}]
    project.segments = [{"id": "1", "file_path": "a.json", "location": "$.a", "source": "Hello", "target": "Hi"}]

    out_zip = tmp_path / "out.zip"
    out_zip.write_bytes(b"dummy")
    res = build_to_zip(project=project, output_zip=out_zip)
    backup_paths = [Path(d.file_path) for d in res.diagnostics if d.code == "I_BACKUP_CREATED" and d.file_path]
    assert backup_paths and backup_paths[0].exists()


def test_build_refuses_unsafe_paths_and_records_diagnostic(tmp_path: Path) -> None:
    src = tmp_path / "src"
    src.mkdir()
    (src / "ok.txt").write_text("noop", encoding="utf-8")
    project = Project.create(source_path=src)
    project.files = [
        {"path": "ok.txt", "kind": "unknown"},
        {"path": "../evil.txt", "kind": "unknown"},
        {"path": "/abs.txt", "kind": "unknown"},
        {"path": "C:/abs.txt", "kind": "unknown"},
    ]
    project.segments = []

    out = tmp_path / "out"
    res = build_to_folder(project=project, output_dir=out)
    assert (out / "ok.txt").exists()
    assert any(d.code == "E_UNSAFE_PATH" for d in res.diagnostics)
    assert project.build_history and "diagnostics" in project.build_history[-1]


def test_build_refuses_output_equal_to_source(tmp_path: Path) -> None:
    src = tmp_path / "src"
    src.mkdir()
    (src / "ok.txt").write_text("noop", encoding="utf-8")
    project = Project.create(source_path=src)
    project.files = [{"path": "ok.txt", "kind": "unknown"}]
    project.segments = []

    res = build_to_folder(project=project, output_dir=src)
    assert res.files_written == 0
    assert any(d.code == "E_UNSAFE_OUTPUT" for d in res.diagnostics)
    assert project.build_history


def test_build_zip_refuses_output_equal_to_source(tmp_path: Path) -> None:
    src_zip = tmp_path / "mod.zip"
    with ZipFile(src_zip, "w") as zf:
        zf.writestr("ok.txt", "noop")
    project = Project.create(source_path=src_zip)
    project.files = [{"path": "ok.txt", "kind": "unknown"}]
    project.segments = []

    res = build_to_zip(project=project, output_zip=src_zip)
    assert res.files_written == 0
    assert any(d.code == "E_UNSAFE_OUTPUT" for d in res.diagnostics)
    assert project.build_history


def test_render_diagnostics_markdown_smoke(tmp_path: Path) -> None:
    p = Project.create(source_path=tmp_path)
    p.diagnostics = [{"severity": "ERROR", "code": "E1", "message": "Bad", "file_path": "a.xml", "category": "X"}]
    md = render_diagnostics_markdown(p)
    assert "# JPE Diagnostics Report" in md
    assert "E1" in md
