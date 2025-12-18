from __future__ import annotations

from pathlib import Path

from jpe_sims4.io.indexing import changed_paths
from jpe_sims4.storage import save_project
from jpe_sims4.workflow import scan_project


def test_scan_project_builds_file_index_and_reuses_hashes(tmp_path: Path) -> None:
    src = tmp_path / "src"
    src.mkdir()
    (src / "a.json").write_text('{"k": "v"}\n', encoding="utf-8")
    (src / "b.bin").write_bytes(b"\x00\xff\x00\xff")

    first = scan_project(src)
    p1 = first.project
    assert [f["path"] for f in p1.files] == sorted(f["path"] for f in p1.files)
    assert "a.json" in p1.file_index
    assert isinstance(p1.file_index["a.json"].get("sha256"), str) and p1.file_index["a.json"]["sha256"]
    assert "b.bin" in p1.file_index
    assert "sha256" not in p1.file_index["b.bin"]

    project_path = tmp_path / "project.jpe.json"
    save_project(p1, project_path)

    # Change only b.bin; a.json should remain unchanged and keep its cached hash.
    (src / "b.bin").write_bytes(b"\x01\x02\x03")
    second = scan_project(src, merge_from_project_json=project_path)
    p2 = second.project
    assert p2.file_index["a.json"]["sha256"] == p1.file_index["a.json"]["sha256"]
    assert changed_paths(p1.file_index, p2.file_index) == {"b.bin"}

