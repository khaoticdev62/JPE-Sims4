from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path

from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.project import Project
from jpe_sims4.storage import load_project, save_project


@dataclass(frozen=True)
class SyncStatus:
    state: str  # missing|equal|local_ahead|remote_ahead|diverged
    local_hash: str | None
    remote_hash: str | None
    remote_path: Path | None


@dataclass(frozen=True)
class MergeResult:
    project: Project
    diagnostics: list[Diagnostic]
    conflicts: int


def _hash_bytes(b: bytes) -> str:
    return sha256(b).hexdigest()


def _project_sync_dir(sync_root: Path, project_uid: str) -> Path:
    return sync_root / "jpe_sync" / project_uid


def _remote_project_path(sync_root: Path, project_uid: str) -> Path:
    return _project_sync_dir(sync_root, project_uid) / "project.json"


def _remote_meta_path(sync_root: Path, project_uid: str) -> Path:
    return _project_sync_dir(sync_root, project_uid) / "meta.json"


def _payload_for_hash(data: dict[str, object]) -> bytes:
    scrubbed = dict(data)
    scrubbed["sync_last_remote_hash"] = None
    payload = json.dumps(scrubbed, ensure_ascii=False, sort_keys=True).encode("utf-8")
    return payload


def compute_local_project_hash(project: Project) -> str:
    return _hash_bytes(_payload_for_hash(project.to_dict()))


def compute_remote_project_hash(path: Path) -> str:
    data = json.loads(path.read_text(encoding="utf-8"))
    return _hash_bytes(_payload_for_hash(data))


def get_status(*, project: Project, sync_root: Path) -> SyncStatus:
    sync_root = sync_root.expanduser().resolve()
    remote = _remote_project_path(sync_root, project.project_uid)
    local_hash = compute_local_project_hash(project)
    if not remote.exists():
        return SyncStatus(state="missing", local_hash=local_hash, remote_hash=None, remote_path=remote)

    remote_hash = compute_remote_project_hash(remote)
    if remote_hash == local_hash:
        return SyncStatus(state="equal", local_hash=local_hash, remote_hash=remote_hash, remote_path=remote)

    base = str(project.sync_last_remote_hash or "").strip() or None
    if base:
        if base == remote_hash and base != local_hash:
            return SyncStatus(state="local_ahead", local_hash=local_hash, remote_hash=remote_hash, remote_path=remote)
        if base == local_hash and base != remote_hash:
            return SyncStatus(state="remote_ahead", local_hash=local_hash, remote_hash=remote_hash, remote_path=remote)
    return SyncStatus(state="diverged", local_hash=local_hash, remote_hash=remote_hash, remote_path=remote)


def push(*, project: Project, sync_root: Path) -> list[Diagnostic]:
    sync_root = sync_root.expanduser().resolve()
    remote = _remote_project_path(sync_root, project.project_uid)
    meta = _remote_meta_path(sync_root, project.project_uid)
    remote.parent.mkdir(parents=True, exist_ok=True)

    local_hash = compute_local_project_hash(project)
    project.sync_last_remote_hash = local_hash
    save_project(project, remote)
    meta.write_text(
        json.dumps(
            {
                "project_uid": project.project_uid,
                "pushed_at": datetime.now(timezone.utc).isoformat(),
                "hash": local_hash,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return [
        Diagnostic(
            severity="INFO",
            category="SYNC",
            code="I_SYNC_PUSH",
            message=f"Pushed project to {remote}.",
            file_path=str(remote),
        )
    ]


def pull(*, project_uid: str, sync_root: Path) -> tuple[Project | None, list[Diagnostic]]:
    sync_root = sync_root.expanduser().resolve()
    remote = _remote_project_path(sync_root, project_uid)
    if not remote.exists():
        return None, [
            Diagnostic(
                severity="ERROR",
                category="SYNC",
                code="E_SYNC_MISSING",
                message="Remote project not found in sync root.",
                file_path=str(remote),
            )
        ]
    try:
        project = load_project(remote)
        try:
            project.sync_last_remote_hash = compute_remote_project_hash(remote)
        except Exception:
            project.sync_last_remote_hash = None
        return project, [
            Diagnostic(
                severity="INFO",
                category="SYNC",
                code="I_SYNC_PULL",
                message=f"Pulled project from {remote}.",
                file_path=str(remote),
            )
        ]
    except Exception as e:
        return None, [
            Diagnostic(
                severity="ERROR",
                category="SYNC",
                code="E_SYNC_PULL_FAILED",
                message=str(e),
                file_path=str(remote),
            )
        ]


def merge_projects(*, local: Project, remote: Project) -> MergeResult:
    diagnostics: list[Diagnostic] = []
    conflicts = 0

    merged = Project.create(source_path=local.source_path)
    merged.version = local.version
    merged.created_at = local.created_at
    merged.name = local.name
    merged.source_locale = local.source_locale
    merged.target_locale = local.target_locale
    merged.exclude_globs = list(getattr(local, "exclude_globs", None) or [])
    merged.project_uid = local.project_uid
    merged.sync_root = local.sync_root
    merged.sync_auto_push = local.sync_auto_push
    merged.sync_last_remote_hash = remote.sync_last_remote_hash or local.sync_last_remote_hash
    merged.files = list(local.files) if local.files else list(remote.files)
    merged.diagnostics = list(local.diagnostics)
    merged.build_history = list(local.build_history)
    merged.glossary = []
    merged.validation = dict(local.validation or remote.validation or {})
    merged.plugin_paths = list(getattr(local, "plugin_paths", None) or [])
    merged.disabled_plugins = list(getattr(local, "disabled_plugins", None) or [])

    by_id_local = {str(s.get("id") or ""): s for s in local.segments}
    by_id_remote = {str(s.get("id") or ""): s for s in remote.segments}
    all_ids = sorted({*by_id_local.keys(), *by_id_remote.keys()} - {""})

    def ts(s: dict[str, object]) -> str:
        return str(s.get("updated_at") or "")

    for sid in all_ids:
        ls = by_id_local.get(sid)
        rs = by_id_remote.get(sid)
        if ls is None:
            merged.segments.append(dict(rs or {}))
            continue
        if rs is None:
            merged.segments.append(dict(ls))
            continue
        if dict(ls) == dict(rs):
            merged.segments.append(dict(ls))
            continue

        lt = ts(ls)
        rt = ts(rs)
        choose = "local"
        if rt and (not lt or rt > lt):
            choose = "remote"
        elif lt and (not rt or lt > rt):
            choose = "local"
        else:
            choose = "local"

        target_l = str(ls.get("target") or "").strip()
        target_r = str(rs.get("target") or "").strip()
        if target_l and target_r and target_l != target_r and lt == rt:
            conflicts += 1
            diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="SYNC",
                    code="W_SYNC_CONFLICT",
                    message="Conflicting targets; chose local.",
                    file_path=str(ls.get("file_path") or rs.get("file_path") or ""),
                    location=str(ls.get("location") or rs.get("location") or ""),
                    segment_id=sid,
                )
            )

        merged.segments.append(dict(ls if choose == "local" else rs))

    by_gid_local = {str(g.get("id") or ""): g for g in local.glossary}
    by_gid_remote = {str(g.get("id") or ""): g for g in remote.glossary}
    all_gids = sorted({*by_gid_local.keys(), *by_gid_remote.keys()} - {""})

    def ts_g(g: dict[str, object]) -> str:
        return str(g.get("updated_at") or "")

    for gid in all_gids:
        lg = by_gid_local.get(gid)
        rg = by_gid_remote.get(gid)
        if lg is None:
            merged.glossary.append(dict(rg or {}))
            continue
        if rg is None:
            merged.glossary.append(dict(lg))
            continue
        if dict(lg) == dict(rg):
            merged.glossary.append(dict(lg))
            continue

        lt = ts_g(lg)
        rt = ts_g(rg)
        choose = "local"
        if rt and (not lt or rt > lt):
            choose = "remote"
        elif lt and (not rt or lt > rt):
            choose = "local"
        else:
            choose = "local"
        merged.glossary.append(dict(lg if choose == "local" else rg))

    diagnostics.append(
        Diagnostic(
            severity="INFO",
            category="SYNC",
            code="I_SYNC_MERGE",
            message=f"Merged projects (segments={len(merged.segments)}, glossary={len(merged.glossary)}, conflicts={conflicts}).",
        )
    )
    return MergeResult(project=merged, diagnostics=diagnostics, conflicts=conflicts)
