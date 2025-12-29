from __future__ import annotations

from pathlib import Path

from jpe_sims4.project import Project
from jpe_sims4.sync import get_status, merge_projects, pull, push


def test_sync_push_status_pull(tmp_path: Path) -> None:
    project = Project.create(source_path=tmp_path / "src")
    project.name = "My Project"
    project.files = [{"path": "a.xml", "kind": "xml"}]
    project.segments = [{"id": "1", "file_path": "a.xml", "location": "x", "source": "Hello", "target": "Hi"}]

    root = tmp_path / "syncroot"
    st0 = get_status(project=project, sync_root=root)
    assert st0.state == "missing"

    diags = push(project=project, sync_root=root)
    assert diags and diags[0].code == "I_SYNC_PUSH"

    st1 = get_status(project=project, sync_root=root)
    assert st1.state == "equal"

    pulled, diags2 = pull(project_uid=project.project_uid, sync_root=root)
    assert pulled is not None
    assert any(d.code == "I_SYNC_PULL" for d in diags2)
    assert pulled.project_uid == project.project_uid
    assert pulled.name == "My Project"

    project.name = "Changed"
    st2 = get_status(project=project, sync_root=root)
    assert st2.state in {"local_ahead", "diverged"}


def test_sync_status_local_and_remote_ahead(tmp_path: Path) -> None:
    project = Project.create(source_path=tmp_path / "src")
    project.segments = [{"id": "1", "file_path": "a", "location": "x", "source": "s", "target": "t"}]
    root = tmp_path / "syncroot"

    push(project=project, sync_root=root)
    st_equal = get_status(project=project, sync_root=root)
    assert st_equal.state == "equal"

    project.name = "local change"
    st_local = get_status(project=project, sync_root=root)
    assert st_local.state == "local_ahead"

    remote, _ = pull(project_uid=project.project_uid, sync_root=root)
    assert remote is not None
    remote.name = "remote change"
    push(project=remote, sync_root=root)

    st_diverged = get_status(project=project, sync_root=root)
    assert st_diverged.state in {"diverged", "remote_ahead"}  # remote ahead only if local base matches local hash


def test_sync_merge_prefers_newer_updated_at(tmp_path: Path) -> None:
    local = Project.create(source_path=tmp_path / "src")
    local.project_uid = "u1"
    local.segments = [
        {"id": "s1", "file_path": "a", "location": "x", "source": "Hello", "target": "Hi", "updated_at": "2025-01-01T00:00:00+00:00"}
    ]

    remote = Project.create(source_path=tmp_path / "src")
    remote.project_uid = "u1"
    remote.segments = [
        {
            "id": "s1",
            "file_path": "a",
            "location": "x",
            "source": "Hello",
            "target": "Hey",
            "updated_at": "2026-01-01T00:00:00+00:00",
        }
    ]

    res = merge_projects(local=local, remote=remote)
    assert res.project.segments[0]["target"] == "Hey"
