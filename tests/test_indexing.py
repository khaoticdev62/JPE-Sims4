from __future__ import annotations

from pathlib import Path

from jpe_sims4.io.indexing import changed_paths, index_files
from jpe_sims4.project import Project
from jpe_sims4.workflow import extract_project


def test_index_files_folder_reuses_hash_when_unchanged(tmp_path: Path) -> None:
    src = tmp_path / "src"
    src.mkdir()
    (src / "a.json").write_text("{\"a\": 1}\n", encoding="utf-8")
    files = [{"path": "a.json", "kind": "json"}]

    idx1, diags1, stats1 = index_files(source_path=src, files=files, previous_index=None)
    assert not diags1
    assert stats1.hashed == 1

    idx2, diags2, stats2 = index_files(source_path=src, files=files, previous_index=idx1)
    assert not diags2
    assert stats2.reused == 1
    assert idx2["a.json"]["sha256"] == idx1["a.json"]["sha256"]
    assert changed_paths(idx1, idx2) == set()


def test_extract_project_skips_unchanged_files_when_merging(tmp_path: Path) -> None:
    src = tmp_path / "src"
    src.mkdir()
    (src / "a.json").write_text("{\"a\": \"Hello\"}\n", encoding="utf-8")

    first = extract_project(src)
    assert first.project.file_index
    assert first.project.segments

    project_path = tmp_path / "p.json"
    from jpe_sims4.storage import save_project

    save_project(first.project, project_path)

    second = extract_project(src, merge_from_project_json=project_path)
    assert second.project.file_index == first.project.file_index
    assert second.project.segments == first.project.segments
