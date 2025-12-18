from __future__ import annotations

from dataclasses import dataclass
from difflib import SequenceMatcher


@dataclass(frozen=True)
class Suggestion:
    score: int  # 0-100
    source: str
    target: str
    segment_id: str | None = None


def _ratio(a: str, b: str) -> int:
    try:
        from fuzzywuzzy import fuzz  # type: ignore[import-not-found]

        return int(fuzz.ratio(a, b))
    except Exception:
        return int(SequenceMatcher(None, a, b).ratio() * 100)


def build_tm_from_segments(segments: list[dict[str, object]]) -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for s in segments:
        source = str(s.get("source") or "")
        target = str(s.get("target") or "")
        if not source.strip() or not target.strip():
            continue
        key = (source, target)
        if key in seen:
            continue
        seen.add(key)
        entries.append({"source": source, "target": target, "id": str(s.get("id") or "")})
    return entries


def suggest(tm_entries: list[dict[str, str]], source: str, *, limit: int = 5, min_score: int = 70) -> list[Suggestion]:
    source = source.strip()
    if not source:
        return []

    scored: list[Suggestion] = []
    for e in tm_entries:
        s = e["source"]
        score = 100 if s == source else _ratio(s, source)
        if score < min_score:
            continue
        scored.append(Suggestion(score=score, source=s, target=e["target"], segment_id=e.get("id") or None))

    scored.sort(key=lambda x: (-x.score, -len(x.source), x.target, x.segment_id or ""))
    return scored[:limit]


def concordance(
    tm_entries: list[dict[str, str]],
    *,
    query: str,
    limit: int = 25,
    in_field: str = "both",
) -> list[dict[str, object]]:
    q = (query or "").strip().lower()
    if not q:
        return []
    field = (in_field or "both").strip().lower()
    if field not in {"source", "target", "both"}:
        field = "both"

    out: list[dict[str, object]] = []
    for e in tm_entries:
        src = str(e.get("source") or "")
        tgt = str(e.get("target") or "")
        if field in {"source", "both"} and q in src.lower():
            out.append({"field": "source", "source": src, "target": tgt, "id": e.get("id")})
            continue
        if field in {"target", "both"} and q in tgt.lower():
            out.append({"field": "target", "source": src, "target": tgt, "id": e.get("id")})
            continue

    out.sort(key=lambda r: (r["field"], len(str(r.get("source") or "")) + len(str(r.get("target") or ""))))
    return out[:limit]


__all__ = [
    "Suggestion",
    "build_tm_from_segments",
    "suggest",
    "concordance",
]
