from __future__ import annotations

from pathlib import Path

from jpe_sims4.project import Project
from jpe_sims4.storage import load_project, save_project
from jpe_sims4.ts4rebels.validation_preset import apply_ts4rebels_validation_preset


def test_ts4rebels_validation_preset_adds_token_regexes(tmp_path: Path) -> None:
    p = Project.create(source_path=tmp_path / "src")
    p.validation = {"token_regexes": []}
    res = apply_ts4rebels_validation_preset(p)
    assert res.added_token_regexes >= 1
    assert any("[" in r and "]" in r for r in res.token_regexes)
    assert any(r.startswith(":") for r in res.token_regexes)


def test_ts4rebels_validation_preset_roundtrips_in_project_json(tmp_path: Path) -> None:
    project_path = tmp_path / "project.jpe.json"
    src = tmp_path / "src"
    src.mkdir(parents=True, exist_ok=True)

    p = Project.create(source_path=src)
    save_project(p, project_path)
    loaded = load_project(project_path)
    _ = apply_ts4rebels_validation_preset(loaded)
    save_project(loaded, project_path)

    reread = load_project(project_path)
    rules = dict(reread.validation or {})
    tokens = rules.get("token_regexes") or []
    assert isinstance(tokens, list)
    assert len(tokens) >= 1

