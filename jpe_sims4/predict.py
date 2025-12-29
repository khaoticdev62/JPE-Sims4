from __future__ import annotations

from dataclasses import dataclass

from jpe_sims4.tm import suggest


@dataclass(frozen=True)
class Prediction:
    score: int  # 0-100
    target: str
    reason: str


def predict_targets(
    tm_entries: list[dict[str, str]],
    *,
    source: str,
    partial_target: str = "",
    limit: int = 5,
    min_tm_score: int = 70,
) -> list[Prediction]:
    source = (source or "").strip()
    if not source:
        return []

    partial = (partial_target or "").strip()
    out: list[Prediction] = []
    seen: set[str] = set()

    for hit in suggest(tm_entries, source, limit=max(limit * 3, 10), min_score=min_tm_score):
        t = (hit.target or "").strip()
        if not t or t in seen:
            continue
        if partial and not t.lower().startswith(partial.lower()):
            continue
        seen.add(t)
        out.append(Prediction(score=int(hit.score), target=t, reason="tm"))
        if len(out) >= limit:
            break

    if partial and len(out) < limit:
        for e in tm_entries:
            t = (e.get("target") or "").strip()
            if not t or t in seen:
                continue
            if t.lower().startswith(partial.lower()):
                seen.add(t)
                out.append(Prediction(score=60, target=t, reason="prefix"))
                if len(out) >= limit:
                    break

    out.sort(key=lambda p: (p.score, len(p.target)), reverse=True)
    return out[:limit]

