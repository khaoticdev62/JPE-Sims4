from __future__ import annotations

import json
import zipfile
from pathlib import Path

from jpe_sims4.build import build_to_folder, build_to_zip
from jpe_sims4.storage import save_project
from jpe_sims4.workflow import extract_project


def _write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def _make_mod_fixture_folder(root: Path) -> Path:
    mod = root / "fixture_mod"
    mod.mkdir(parents=True, exist_ok=True)

    _write_text(
        mod / "tuning" / "strings.xml",
        """<?xml version="1.0" encoding="utf-8"?>
<root>
  <string>Hello {name}</string>
  <string>Goodbye</string>
</root>
""",
    )
    _write_text(
        mod / "data" / "config.json",
        json.dumps({"title": "My Mod", "desc": "A cool mod", "count": 3}, ensure_ascii=False, indent=2) + "\n",
    )
    _write_text(
        mod / "settings.ini",
        """[main]
title=My Mod
desc=A cool mod
""",
    )
    _write_text(mod / "notes.jpe", '"Quoted segment 1"\n"Quoted segment 2"\n')
    return mod


def _zip_folder(src_dir: Path, out_zip: Path) -> None:
    out_zip.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out_zip, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for p in sorted(src_dir.rglob("*")):
            if p.is_dir():
                continue
            rel = p.relative_to(src_dir).as_posix()
            zf.write(p, arcname=rel)


def test_e2e_zip_import_extract_build_folder_and_zip(tmp_path: Path) -> None:
    mod_dir = _make_mod_fixture_folder(tmp_path)
    mod_zip = tmp_path / "mod.zip"
    _zip_folder(mod_dir, mod_zip)

    res = extract_project(mod_zip)
    project = res.project
    assert project.files, "scan should produce files"
    assert project.segments, "extract should produce segments"

    # Translate a couple of known sources.
    translated = 0
    for s in project.segments:
        src = str(s.get("source") or "")
        if src == "My Mod":
            s["target"] = "Mon Mod"
            translated += 1
        if src == "A cool mod":
            s["target"] = "Un mod cool"
            translated += 1
        if src == "Quoted segment 1":
            s["target"] = "Segment cité 1"
            translated += 1
    assert translated >= 2

    project_path = tmp_path / "project.jpe.json"
    save_project(project, project_path)

    out_dir = tmp_path / "built_folder"
    built = build_to_folder(project=project, output_dir=out_dir)
    assert built.files_written > 0
    assert (out_dir / "data" / "config.json").exists()
    assert (out_dir / "settings.ini").exists()
    assert (out_dir / "notes.jpe").exists()

    # Applied translations should appear in supported outputs.
    config_text = (out_dir / "data" / "config.json").read_text(encoding="utf-8")
    assert "Mon Mod" in config_text
    assert "Un mod cool" in config_text

    ini_text = (out_dir / "settings.ini").read_text(encoding="utf-8")
    assert "title=Mon Mod" in ini_text
    assert "desc=Un mod cool" in ini_text

    jpe_text = (out_dir / "notes.jpe").read_text(encoding="utf-8")
    assert "Segment cité 1" in jpe_text

    out_zip = tmp_path / "built.zip"
    built_zip = build_to_zip(project=project, output_zip=out_zip)
    assert built_zip.files_written > 0
    assert out_zip.exists()
    with zipfile.ZipFile(out_zip, "r") as zf:
        names = set(zf.namelist())
        assert "data/config.json" in names
        assert "settings.ini" in names
        assert "notes.jpe" in names
        assert "tuning/strings.xml" in names
