from __future__ import annotations

from pathlib import Path
from zipfile import ZipFile

from jpe_sims4.build import build_to_folder, build_to_zip
from jpe_sims4.workflow import extract_project


def test_e2e_unsafe_zip_member_is_flagged_and_not_built(tmp_path: Path) -> None:
    z = tmp_path / "mod.zip"
    with ZipFile(z, "w") as zf:
        zf.writestr("../evil.txt", "nope")
        zf.writestr("tuning.xml", "<Root><Item name=\"Hello\">World</Item></Root>")

    res = extract_project(z)
    assert any(d.get("code") == "E_ZIP_PATH_TRAVERSAL" for d in (res.project.diagnostics or []))
    assert res.project.segments

    out_dir = tmp_path / "out"
    build_res = build_to_folder(project=res.project, output_dir=out_dir)
    assert any(d.code == "E_UNSAFE_PATH" for d in build_res.diagnostics)
    assert (out_dir / "tuning.xml").exists()
    assert not (out_dir / "evil.txt").exists()

    out_zip = tmp_path / "built.zip"
    build_zip_res = build_to_zip(project=res.project, output_zip=out_zip)
    assert any(d.code == "E_UNSAFE_PATH" for d in build_zip_res.diagnostics)
    with ZipFile(out_zip) as built:
        names = set(built.namelist())
    assert "tuning.xml" in names
    assert "../evil.txt" not in names

