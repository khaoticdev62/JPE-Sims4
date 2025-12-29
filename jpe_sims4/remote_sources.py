from __future__ import annotations

from typing import Any

from jpe_sims4.project import Project


def normalize_remote_sources(value: object) -> list[dict[str, object]]:
    if value is None:
        return []

    if isinstance(value, list):
        out: list[dict[str, object]] = []
        for item in value:
            if isinstance(item, dict):
                out.append(dict(item))
        return out

    # Legacy: {"ts4rebels": {...}} keyed by kind
    if isinstance(value, dict):
        out = []
        for kind, cfg in value.items():
            if isinstance(cfg, dict):
                merged = dict(cfg)
                merged.setdefault("kind", str(kind))
                out.append(merged)
            else:
                out.append({"kind": str(kind), "value": cfg})
        return out

    return []


def get_remote_source(remote_sources: object, *, kind: str) -> dict[str, object] | None:
    for rs in normalize_remote_sources(remote_sources):
        if str(rs.get("kind") or "").strip() == kind:
            return rs
    return None


def upsert_remote_source(remote_sources: list[dict[str, object]], *, kind: str, value: dict[str, object]) -> None:
    for i, existing in enumerate(remote_sources):
        if str(existing.get("kind") or "").strip() == kind:
            merged = dict(existing)
            merged.update(value)
            merged["kind"] = kind
            remote_sources[i] = merged
            return
    merged = dict(value)
    merged["kind"] = kind
    remote_sources.append(merged)


def ensure_ts4rebels_remote_source(project: Project) -> dict[str, object]:
    project.remote_sources = normalize_remote_sources(project.remote_sources)
    rs = get_remote_source(project.remote_sources, kind="ts4rebels")
    if rs is None:
        rs = {"kind": "ts4rebels"}
        project.remote_sources.append(rs)

    rs.setdefault("base_url", "https://ts4rebels.cc/")
    rs.setdefault("enabled", False)
    rs.setdefault("allowed_hosts", ["ts4rebels.cc"])
    rs.setdefault("storage_root", None)
    rs.setdefault("last_sync_at", None)
    rs.setdefault("last_error", None)

    # Auth is cookie/session-based for phpBB; store only a keyring reference here.
    auth = dict(rs.get("auth") or {})
    auth.setdefault("mode", "anonymous")  # anonymous | phpbb_session
    auth.setdefault("keyring_id", None)
    rs["auth"] = auth

    # Back-compat for existing Studio fields.
    profile = dict(rs.get("profile") or {})
    if profile.get("keyring_id") and not auth.get("keyring_id"):
        auth["keyring_id"] = str(profile.get("keyring_id"))
        rs["auth"] = auth
    profile.setdefault("keyring_id", auth.get("keyring_id"))
    rs["profile"] = profile

    rs.setdefault("subscriptions", {"forums": [], "topics": []})
    rs.setdefault("download_prefs", {"auto_download": False})

    # Normalize allowed_hosts into the top-level field even if older key exists.
    download_prefs = dict(rs.get("download_prefs") or {})
    allowed_hosts = rs.get("allowed_hosts")
    if not isinstance(allowed_hosts, list):
        allowed_hosts = download_prefs.get("allowed_hosts")
    if isinstance(allowed_hosts, list) and allowed_hosts:
        rs["allowed_hosts"] = [str(h) for h in allowed_hosts if str(h).strip()]
    else:
        rs["allowed_hosts"] = ["ts4rebels.cc"]

    return rs


def project_set_remote_error(project: Project, *, kind: str, message: str | None) -> None:
    project.remote_sources = normalize_remote_sources(project.remote_sources)
    rs = get_remote_source(project.remote_sources, kind=kind) or {"kind": kind}
    rs["last_error"] = message
    upsert_remote_source(project.remote_sources, kind=kind, value=rs)


def project_update_remote_fields(project: Project, *, kind: str, **fields: Any) -> dict[str, object]:
    project.remote_sources = normalize_remote_sources(project.remote_sources)
    rs = get_remote_source(project.remote_sources, kind=kind) or {"kind": kind}
    for k, v in fields.items():
        rs[k] = v
    upsert_remote_source(project.remote_sources, kind=kind, value=rs)
    return rs
