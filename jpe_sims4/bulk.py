from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.tm import build_tm_from_segments, suggest
from jpe_sims4.tm.sqlite_store import SqliteTMStore


@dataclass(frozen=True)
class BulkResult:
    updated_segments: int
    diagnostics: list[Diagnostic]


def propagate_targets_by_source(
    segments: list[dict[str, object]],
    *,
    overwrite: bool = False,
    set_status: str | None = "in_progress",
) -> BulkResult:
    diagnostics: list[Diagnostic] = []
    updated = 0

    lookup: dict[str, str] = {}
    for s in segments:
        src = str(s.get("source") or "").strip()
        tgt = str(s.get("target") or "").strip()
        if src and tgt:
            lookup.setdefault(src, tgt)

    now = datetime.now(timezone.utc).isoformat()
    for s in segments:
        src = str(s.get("source") or "").strip()
        if not src or src not in lookup:
            continue
        current = str(s.get("target") or "").strip()
        if current and not overwrite:
            continue
        s["target"] = lookup[src]
        if set_status and str(s.get("status") or "new") == "new":
            s["status"] = set_status
        s["updated_at"] = now
        updated += 1

    diagnostics.append(
        Diagnostic(
            severity="INFO",
            category="BULK",
            code="I_PROPAGATE_BY_SOURCE",
            message=f"Propagated translations by identical source (updated={updated}, overwrite={overwrite}).",
        )
    )
    return BulkResult(updated_segments=updated, diagnostics=diagnostics)


def propagate_targets_by_source_scoped(
    segments: list[dict[str, object]],
    *,
    scope: list[dict[str, object]],
    overwrite: bool = False,
    set_status: str | None = "in_progress",
) -> BulkResult:
    diagnostics: list[Diagnostic] = []
    updated = 0

    lookup: dict[str, str] = {}
    for s in segments:
        src = str(s.get("source") or "").strip()
        tgt = str(s.get("target") or "").strip()
        if src and tgt:
            lookup.setdefault(src, tgt)

    now = datetime.now(timezone.utc).isoformat()
    for s in scope:
        src = str(s.get("source") or "").strip()
        if not src or src not in lookup:
            continue
        current = str(s.get("target") or "").strip()
        if current and not overwrite:
            continue
        s["target"] = lookup[src]
        if set_status and str(s.get("status") or "new") == "new":
            s["status"] = set_status
        s["updated_at"] = now
        updated += 1

    diagnostics.append(
        Diagnostic(
            severity="INFO",
            category="BULK",
            code="I_PROPAGATE_BY_SOURCE",
            message=f"Propagated translations by identical source (updated={updated}, overwrite={overwrite}).",
        )
    )
    return BulkResult(updated_segments=updated, diagnostics=diagnostics)


def apply_best_tm_to_empty_targets(
    segments: list[dict[str, object]],
    *,
    min_score: int = 95,
    overwrite: bool = False,
    set_status: str | None = "in_progress",
) -> BulkResult:
    diagnostics: list[Diagnostic] = []
    updated = 0
    tm = build_tm_from_segments(segments)
    now = datetime.now(timezone.utc).isoformat()

    for s in segments:
        src = str(s.get("source") or "").strip()
        if not src:
            continue
        tgt = str(s.get("target") or "").strip()
        if tgt and not overwrite:
            continue
        hits = suggest(tm, src, limit=1, min_score=min_score)
        if not hits:
            continue
        s["target"] = hits[0].target
        if set_status and str(s.get("status") or "new") == "new":
            s["status"] = set_status
        s["updated_at"] = now
        updated += 1

    diagnostics.append(
        Diagnostic(
            severity="INFO",
            category="BULK",
            code="I_APPLY_BEST_TM",
            message=f"Applied best TM suggestions (updated={updated}, min_score={min_score}, overwrite={overwrite}).",
        )
    )
    return BulkResult(updated_segments=updated, diagnostics=diagnostics)


def apply_best_tm_to_empty_targets_scoped(
    segments: list[dict[str, object]],
    *,
    scope: list[dict[str, object]],
    min_score: int = 95,
    overwrite: bool = False,
    set_status: str | None = "in_progress",
) -> BulkResult:
    diagnostics: list[Diagnostic] = []
    updated = 0
    tm = build_tm_from_segments(segments)
    now = datetime.now(timezone.utc).isoformat()

    for s in scope:
        src = str(s.get("source") or "").strip()
        if not src:
            continue
        tgt = str(s.get("target") or "").strip()
        if tgt and not overwrite:
            continue
        hits = suggest(tm, src, limit=1, min_score=min_score)
        if not hits:
            continue
        s["target"] = hits[0].target
        if set_status and str(s.get("status") or "new") == "new":
            s["status"] = set_status
        s["updated_at"] = now
        updated += 1

    diagnostics.append(
        Diagnostic(
            severity="INFO",
            category="BULK",
            code="I_APPLY_BEST_TM",
            message=f"Applied best TM suggestions (updated={updated}, min_score={min_score}, overwrite={overwrite}).",
        )
    )
    return BulkResult(updated_segments=updated, diagnostics=diagnostics)


def apply_best_sqlite_tm_to_empty_targets(
    segments: list[dict[str, object]],
    *,
    tm_store: SqliteTMStore,
    source_locale: str,
    target_locale: str,
    min_score: int = 95,
    overwrite: bool = False,
    set_status: str | None = "in_progress",
) -> BulkResult:
    diagnostics: list[Diagnostic] = []
    updated = 0
    now = datetime.now(timezone.utc).isoformat()

    for s in segments:
        src = str(s.get("source") or "").strip()
        if not src:
            continue
        tgt = str(s.get("target") or "").strip()
        if tgt and not overwrite:
            continue
        hits = tm_store.suggest(
            source_locale=source_locale,
            target_locale=target_locale,
            source=src,
            limit=1,
            min_score=min_score,
        )
        if not hits:
            continue
        s["target"] = hits[0].target
        if set_status and str(s.get("status") or "new") == "new":
            s["status"] = set_status
        s["updated_at"] = now
        updated += 1

    diagnostics.append(
        Diagnostic(
            severity="INFO",
            category="BULK",
            code="I_APPLY_BEST_TM_SQLITE",
            message=(
                "Applied best TM suggestions from SQLite TM "
                f"(updated={updated}, min_score={min_score}, overwrite={overwrite})."
            ),
        )
    )
    return BulkResult(updated_segments=updated, diagnostics=diagnostics)


def apply_best_sqlite_tm_to_empty_targets_scoped(
    segments: list[dict[str, object]],
    *,
    scope: list[dict[str, object]],
    tm_store: SqliteTMStore,
    source_locale: str,
    target_locale: str,
    min_score: int = 95,
    overwrite: bool = False,
    set_status: str | None = "in_progress",
) -> BulkResult:
    diagnostics: list[Diagnostic] = []
    updated = 0
    now = datetime.now(timezone.utc).isoformat()

    for s in scope:
        src = str(s.get("source") or "").strip()
        if not src:
            continue
        tgt = str(s.get("target") or "").strip()
        if tgt and not overwrite:
            continue
        hits = tm_store.suggest(
            source_locale=source_locale,
            target_locale=target_locale,
            source=src,
            limit=1,
            min_score=min_score,
        )
        if not hits:
            continue
        s["target"] = hits[0].target
        if set_status and str(s.get("status") or "new") == "new":
            s["status"] = set_status
        s["updated_at"] = now
        updated += 1

    diagnostics.append(
        Diagnostic(
            severity="INFO",
            category="BULK",
            code="I_APPLY_BEST_TM_SQLITE",
            message=(
                "Applied best TM suggestions from SQLite TM "
                f"(updated={updated}, min_score={min_score}, overwrite={overwrite})."
            ),
        )
    )
    return BulkResult(updated_segments=updated, diagnostics=diagnostics)
