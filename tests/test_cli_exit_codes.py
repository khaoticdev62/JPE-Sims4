from __future__ import annotations

import json
from pathlib import Path

import cli


def _write_project_json(
    path: Path,
    *,
    source_path: Path,
    segments: list[dict[str, object]] | None = None,
    diagnostics: list[dict[str, object]] | None = None,
    validation: dict[str, object] | None = None,
) -> None:
    source_path.mkdir(parents=True, exist_ok=True)
    payload = {
        "source_path": str(source_path),
        "version": "test",
        "files": [],
        "file_index": {},
        "diagnostics": diagnostics or [],
        "segments": segments or [],
        "glossary": [],
        "validation": validation or {},
        "build_history": [],
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def test_validate_exit_code_error_placeholder_mismatch(tmp_path, capsys) -> None:
    project_path = tmp_path / "project.json"
    _write_project_json(
        project_path,
        source_path=tmp_path / "src",
        segments=[
            {
                "id": "s1",
                "file_path": "a.xml",
                "location": "1",
                "source": "Hello {name}",
                "target": "Hello {username}",
            }
        ],
    )

    code = cli.main(["validate", str(project_path), "--json"])
    out = json.loads(capsys.readouterr().out)
    assert code == 2
    assert out["exit_code"] == 2
    assert out["count"] == 1
    assert out["diagnostics"][0]["code"] == "E_PLACEHOLDER_MISMATCH"


def test_validate_exit_code_warning_and_strict_mode(tmp_path, capsys) -> None:
    project_path = tmp_path / "project.json"
    _write_project_json(
        project_path,
        source_path=tmp_path / "src",
        segments=[
            {
                "id": "s1",
                "file_path": "a.xml",
                "location": "1",
                "source": "abc",
                "target": "abcdef",
            }
        ],
        validation={"max_expansion_ratio": 1.1},
    )

    code = cli.main(["validate", str(project_path), "--json"])
    out = json.loads(capsys.readouterr().out)
    assert code == 1
    assert out["exit_code"] == 1

    code = cli.main(["validate", str(project_path), "--json", "--warnings-as-errors"])
    out = json.loads(capsys.readouterr().out)
    assert code == 2
    assert out["exit_code"] == 2


def test_validate_exit_code_blank_target_ok(tmp_path, capsys) -> None:
    project_path = tmp_path / "project.json"
    _write_project_json(
        project_path,
        source_path=tmp_path / "src",
        segments=[
            {
                "id": "s1",
                "file_path": "a.xml",
                "location": "1",
                "source": "Hello {name}",
                "target": "",
            }
        ],
    )

    code = cli.main(["validate", str(project_path), "--json"])
    out = json.loads(capsys.readouterr().out)
    assert code == 0
    assert out["exit_code"] == 0
    assert out["count"] == 0


def test_report_json_exit_code_matches_diagnostics(tmp_path, capsys) -> None:
    project_path = tmp_path / "project.json"
    _write_project_json(
        project_path,
        source_path=tmp_path / "src",
        diagnostics=[
            {
                "severity": "WARNING",
                "category": "VALIDATION",
                "code": "W_TEST",
                "message": "test",
                "file_path": "a.xml",
            }
        ],
    )

    code = cli.main(["report", str(project_path), "--json"])
    out = json.loads(capsys.readouterr().out)
    assert code == 1
    assert out["exit_code"] == 1
    assert out["diagnostics_summary"]["by_severity"]["WARNING"] == 1

