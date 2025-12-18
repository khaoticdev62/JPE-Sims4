from __future__ import annotations

import csv
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.project import Project


CSV_FIELDS = ["id", "file_path", "location", "source", "target", "status", "note", "updated_at"]


@dataclass(frozen=True)
class ImportCsvResult:
    updated_segments: int
    diagnostics: list[Diagnostic]


def export_segments_csv(project: Project, out_path: Path) -> None:
    out_path = out_path.expanduser().resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        w.writeheader()
        for s in project.segments:
            row = {k: s.get(k, "") for k in CSV_FIELDS}
            w.writerow(row)


def import_segments_csv(
    project: Project,
    csv_path: Path,
    *,
    overwrite_target: bool = False,
    update_status: bool = True,
    update_note: bool = True,
) -> ImportCsvResult:
    csv_path = csv_path.expanduser().resolve()
    diagnostics: list[Diagnostic] = []
    by_id: dict[str, dict[str, object]] = {str(s.get("id") or ""): s for s in project.segments}
    updated = 0

    seen_ids: set[str] = set()
    with csv_path.open("r", encoding="utf-8", newline="") as f:
        r = csv.DictReader(f)
        for i, row in enumerate(r, start=2):
            sid = str((row.get("id") or "")).strip()
            if not sid:
                diagnostics.append(
                    Diagnostic(
                        severity="WARNING",
                        category="CSV",
                        code="W_CSV_MISSING_ID",
                        message="Row is missing segment id.",
                        location=f"row:{i}",
                    )
                )
                continue
            if sid in seen_ids:
                diagnostics.append(
                    Diagnostic(
                        severity="WARNING",
                        category="CSV",
                        code="W_CSV_DUPLICATE_ID",
                        message="Duplicate segment id in CSV.",
                        location=f"row:{i}",
                        segment_id=sid,
                    )
                )
            seen_ids.add(sid)

            seg = by_id.get(sid)
            if not seg:
                diagnostics.append(
                    Diagnostic(
                        severity="WARNING",
                        category="CSV",
                        code="W_CSV_UNKNOWN_ID",
                        message="CSV references a segment id not present in project.",
                        location=f"row:{i}",
                        segment_id=sid,
                    )
                )
                continue

            changed = False
            target = str((row.get("target") or "")).rstrip("\n")
            if target.strip() and (overwrite_target or not str(seg.get("target") or "").strip()):
                seg["target"] = target
                changed = True

            if update_status:
                status = str((row.get("status") or "")).strip()
                if status in {"new", "in_progress", "reviewed"} and status != str(seg.get("status") or "new"):
                    seg["status"] = status
                    changed = True

            if update_note:
                note = str((row.get("note") or "")).rstrip("\n")
                if note != str(seg.get("note") or ""):
                    seg["note"] = note
                    changed = True

            if changed:
                seg["updated_at"] = datetime.now(timezone.utc).isoformat()
                updated += 1

    return ImportCsvResult(updated_segments=updated, diagnostics=diagnostics)

