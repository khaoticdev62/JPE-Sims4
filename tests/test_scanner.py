from __future__ import annotations

from pathlib import Path
from zipfile import ZipFile

from jpe_sims4.scanner import scan_input


def test_scan_folder(tmp_path: Path) -> None:
    (tmp_path / "tuning.xml").write_text("<x/>", encoding="utf-8")
    (tmp_path / "strings.stbl").write_bytes(b"\x00\x01")
    (tmp_path / "readme.txt").write_text("hi", encoding="utf-8")
    (tmp_path / "blob.bin").write_bytes(b"\x00\xff\x00\xff")
    (tmp_path / "ts4rebels-manifest.json").write_text('{"file_name":"a.package"}', encoding="utf-8")

    res = scan_input(tmp_path)
    kinds = {f["path"]: f["kind"] for f in res.files}
    assert kinds["tuning.xml"] == "xml"
    assert kinds["strings.stbl"] == "stbl"
    assert kinds["readme.txt"] == "text"
    assert kinds["blob.bin"] == "unknown"
    assert kinds["ts4rebels-manifest.json"] == "ts4rebels-manifest"
    assert any(d["code"] == "I_UNKNOWN_FILE_TYPE" for d in res.diagnostics)


def test_scan_zip_path_traversal(tmp_path: Path) -> None:
    z = tmp_path / "mod.zip"
    with ZipFile(z, "w") as zf:
        zf.writestr("../evil.txt", "nope")
        zf.writestr("ok.xml", "<x/>")

    res = scan_input(z)
    assert any(d["code"] == "E_ZIP_PATH_TRAVERSAL" for d in res.diagnostics)
    assert any(f["path"] == "../evil.txt" for f in res.files)


def test_scan_outputs_sorted(tmp_path: Path) -> None:
    (tmp_path / "b.xml").write_text("<x/>", encoding="utf-8")
    (tmp_path / "a.xml").write_text("<x/>", encoding="utf-8")
    res = scan_input(tmp_path)
    assert [f["path"] for f in res.files] == sorted(f["path"] for f in res.files)

    z = tmp_path / "mod.zip"
    with ZipFile(z, "w") as zf:
        zf.writestr("b.xml", "<x/>")
        zf.writestr("a.xml", "<x/>")
    res2 = scan_input(z)
    assert [f["path"] for f in res2.files] == sorted(f["path"] for f in res2.files)
