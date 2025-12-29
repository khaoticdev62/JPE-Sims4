from __future__ import annotations

import csv
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from jpe_sims4.glossary import glossary_entry_id
from jpe_sims4.project import Project


@dataclass(frozen=True)
class GlossaryImportResult:
    added: int
    updated: int
    skipped: int


def _parse_bool(v: object) -> bool:
    s = str(v or "").strip().lower()
    return s in {"1", "true", "yes", "y", "on"}


def export_glossary_csv(project: Project, out_path: Path) -> None:
    out_path = out_path.expanduser().resolve()
    entries = list(project.glossary or [])
    entries.sort(key=lambda e: (str(e.get("source") or "").lower(), str(e.get("target") or "").lower()))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as fp:
        w = csv.DictWriter(
            fp,
            fieldnames=["id", "mode", "source", "target", "note", "case_sensitive", "whole_word", "enabled", "updated_at"],
        )
        w.writeheader()
        for e in entries:
            w.writerow(
                {
                    "id": str(e.get("id") or ""),
                    "mode": str(e.get("mode") or ("forbidden" if bool(e.get("forbidden") or False) else "preferred")),
                    "source": str(e.get("source") or ""),
                    "target": str(e.get("target") or ""),
                    "note": str(e.get("note") or ""),
                    "case_sensitive": "1" if bool(e.get("case_sensitive") or False) else "0",
                    "whole_word": "1" if bool(e.get("whole_word") or False) else "0",
                    "enabled": "1" if (e.get("enabled") is not False) else "0",
                    "updated_at": str(e.get("updated_at") or ""),
                }
            )


def import_glossary_csv(
    project: Project,
    csv_path: Path,
    *,
    overwrite: bool = True,
) -> GlossaryImportResult:
    csv_path = csv_path.expanduser().resolve()
    existing = {str(e.get("id") or ""): dict(e) for e in (project.glossary or []) if str(e.get("id") or "")}
    added = 0
    updated = 0
    skipped = 0
    now = datetime.now(timezone.utc).isoformat()

    with csv_path.open("r", newline="", encoding="utf-8") as fp:
        r = csv.DictReader(fp)
        for row in r:
            mode = str((row.get("mode") or "")).strip().lower()
            if not mode:
                mode = "preferred"
            if mode not in {"preferred", "forbidden"}:
                mode = "preferred"
            src = str((row.get("source") or "")).strip()
            tgt = str((row.get("target") or "")).strip()
            if not src:
                skipped += 1
                continue
            if mode == "preferred" and not tgt:
                skipped += 1
                continue
            gid = str((row.get("id") or "")).strip() or glossary_entry_id(src, tgt)
            entry = {
                "id": gid,
                "mode": mode,
                "source": src,
                "target": tgt,
                "note": str((row.get("note") or "")).strip(),
                "case_sensitive": _parse_bool(row.get("case_sensitive")),
                "whole_word": _parse_bool(row.get("whole_word")),
                "enabled": not (str((row.get("enabled") or "")).strip() in {"0", "false", "no", "off"}),
                "updated_at": str((row.get("updated_at") or "")).strip() or now,
            }
            if gid not in existing:
                existing[gid] = entry
                added += 1
                continue
            if overwrite:
                existing[gid] = entry
                updated += 1
            else:
                skipped += 1

    merged = list(existing.values())
    merged.sort(key=lambda e: (str(e.get("source") or "").lower(), str(e.get("target") or "").lower()))
    project.glossary = merged
    return GlossaryImportResult(added=added, updated=updated, skipped=skipped)
