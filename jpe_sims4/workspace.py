from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass(frozen=True)
class Progress:
    total: int
    translated: int
    reviewed: int


def sort_segments(segments: list[dict[str, object]]) -> list[dict[str, object]]:
    return sorted(
        segments,
        key=lambda s: (
            str(s.get("file_path") or ""),
            str(s.get("location") or ""),
            str(s.get("id") or ""),
        ),
    )


def compute_progress(segments: list[dict[str, object]]) -> Progress:
    total = len(segments)
    translated = sum(1 for s in segments if str(s.get("target") or "").strip())
    reviewed = sum(1 for s in segments if str(s.get("status") or "") == "reviewed")
    return Progress(total=total, translated=translated, reviewed=reviewed)


def filter_segments(
    segments: list[dict[str, object]],
    *,
    query: str = "",
    status: str = "All",
    file_path: str | None = None,
) -> list[dict[str, object]]:
    q = (query or "").strip().lower()
    st = (status or "All").strip()
    out: list[dict[str, object]] = []
    for s in segments:
        if file_path and str(s.get("file_path") or "") != file_path:
            continue
        if st != "All" and str(s.get("status") or "new") != st:
            continue
        if q:
            hay = " ".join(
                [
                    str(s.get("id") or ""),
                    str(s.get("file_path") or ""),
                    str(s.get("location") or ""),
                    str(s.get("source") or ""),
                    str(s.get("target") or ""),
                    str(s.get("note") or ""),
                ]
            ).lower()
            if q not in hay:
                continue
        out.append(s)
    return out


def update_segment_editor_fields(
    segment: dict[str, object],
    *,
    target: str,
    note: str,
    status: str,
    now_iso: str | None = None,
) -> None:
    segment["target"] = target
    segment["note"] = note

    st = (status or str(segment.get("status") or "new")).strip() or "new"
    if st not in {"new", "in_progress", "reviewed"}:
        st = str(segment.get("status") or "new")
    segment["status"] = st

    if str(segment.get("target") or "").strip() and str(segment.get("status") or "") == "new":
        segment["status"] = "in_progress"

    segment["updated_at"] = now_iso or datetime.now(timezone.utc).isoformat()


def next_untranslated_id(visible_segments: list[dict[str, object]], *, current_id: str | None = None) -> str | None:
    if not visible_segments:
        return None

    ids = [str(s.get("id") or "") for s in visible_segments]
    start = 0
    if current_id and current_id in ids:
        start = ids.index(current_id) + 1

    for i in list(range(start, len(visible_segments))) + list(range(0, start)):
        seg = visible_segments[i]
        if not str(seg.get("target") or "").strip():
            sid = str(seg.get("id") or "")
            return sid or None
    return None
