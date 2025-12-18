from __future__ import annotations

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from jpe_sims4.scanner import scan_input
from jpe_sims4.workflow import extract_project


def test_scan_zip_entry_too_large_respects_env_limit(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setenv("JPE_MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES", "10")
    z = tmp_path / "mod.zip"
    with ZipFile(z, "w", compression=ZIP_DEFLATED) as zf:
        zf.writestr("tuning.xml", "<x>" + ("a" * 50) + "</x>")

    res = scan_input(z)
    assert any(d["code"] == "E_ZIP_ENTRY_TOO_LARGE" for d in res.diagnostics)


def test_scan_zip_too_many_files_stops_early(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setenv("JPE_MAX_ZIP_FILES", "2")
    z = tmp_path / "mod.zip"
    with ZipFile(z, "w") as zf:
        zf.writestr("a.xml", "<x/>")
        zf.writestr("b.xml", "<x/>")
        zf.writestr("c.xml", "<x/>")

    res = scan_input(z)
    assert any(d["code"] == "E_ZIP_TOO_MANY_FILES" for d in res.diagnostics)
    assert len(res.files) == 2


def test_scan_zip_total_uncompressed_limit(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setenv("JPE_MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES", "10")
    z = tmp_path / "mod.zip"
    with ZipFile(z, "w") as zf:
        zf.writestr("a.xml", "12345678")
        zf.writestr("b.xml", "ABCDEFGH")

    res = scan_input(z)
    assert any(d["code"] == "E_ZIP_TOO_LARGE" for d in res.diagnostics)


def test_scan_zip_suspicious_compression_ratio(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setenv("JPE_MAX_ZIP_INFLATE_RATIO", "2.0")
    z = tmp_path / "mod.zip"
    with ZipFile(z, "w", compression=ZIP_DEFLATED) as zf:
        zf.writestr("repeat.txt", "a" * 50_000)

    res = scan_input(z)
    assert any(d["code"] == "E_ZIP_SUSPICIOUS_COMPRESSION" for d in res.diagnostics)


def test_extract_project_skips_unsafe_zip_member_read(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setenv("JPE_MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES", "10")
    z = tmp_path / "mod.zip"
    with ZipFile(z, "w", compression=ZIP_DEFLATED) as zf:
        zf.writestr("tuning.xml", "<x>" + ("a" * 50) + "</x>")

    res = extract_project(z)
    assert any(d.code == "E_ZIP_ENTRY_TOO_LARGE" for d in res.diagnostics)
    assert res.project.segments == []

