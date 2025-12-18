from __future__ import annotations

import hashlib
from dataclasses import dataclass

from jpe_sims4.diagnostics import Diagnostic


@dataclass(frozen=True)
class GlossaryHit:
    entry_id: str
    source: str
    target: str
    note: str
    count: int
    case_sensitive: bool
    whole_word: bool


def glossary_entry_id(source: str, target: str) -> str:
    h = hashlib.sha1()
    h.update(source.strip().lower().encode("utf-8", "ignore"))
    h.update(b"\0")
    h.update(target.strip().lower().encode("utf-8", "ignore"))
    return h.hexdigest()[:16]


def _count_term_occurrences(*, text: str, term: str, case_sensitive: bool, whole_word: bool) -> int:
    text = str(text or "")
    term = str(term or "")
    if not text or not term:
        return 0

    haystack = text if case_sensitive else text.lower()
    needle = term if case_sensitive else term.lower()

    def is_word_char(ch: str) -> bool:
        return ch.isalnum() or ch == "_"

    start = 0
    count = 0
    while True:
        idx = haystack.find(needle, start)
        if idx < 0:
            return count
        end = idx + len(needle)
        start = end
        if not whole_word:
            count += 1
            continue
        before_ok = idx == 0 or not is_word_char(haystack[idx - 1])
        after_ok = end == len(haystack) or not is_word_char(haystack[end : end + 1])
        if before_ok and after_ok:
            count += 1


def glossary_hits(entries: list[dict[str, object]], source_text: str, *, limit: int = 20) -> list[GlossaryHit]:
    hits: list[GlossaryHit] = []
    for e in entries:
        if e.get("enabled") is False:
            continue
        mode = str(e.get("mode") or ("forbidden" if bool(e.get("forbidden") or False) else "preferred")).strip().lower()
        if mode == "forbidden":
            continue
        src = str(e.get("source") or "").strip()
        tgt = str(e.get("target") or "").strip()
        if not src or not tgt:
            continue
        case_sensitive = bool(e.get("case_sensitive") or False)
        whole_word = bool(e.get("whole_word") or False)
        count = _count_term_occurrences(
            text=source_text,
            term=src,
            case_sensitive=case_sensitive,
            whole_word=whole_word,
        )
        if count <= 0:
            continue
        hits.append(
            GlossaryHit(
                entry_id=str(e.get("id") or glossary_entry_id(src, tgt)),
                source=src,
                target=tgt,
                note=str(e.get("note") or ""),
                count=count,
                case_sensitive=case_sensitive,
                whole_word=whole_word,
            )
        )
    hits.sort(key=lambda h: (h.count, len(h.source), h.source.lower()), reverse=True)
    return hits[:limit]


def validate_segment_glossary(
    *,
    segment: dict[str, object],
    glossary_entries: list[dict[str, object]],
    max_warnings: int = 5,
) -> list[Diagnostic]:
    source = str(segment.get("source") or "")
    target = str(segment.get("target") or "")
    if not source.strip():
        return []

    warnings: list[Diagnostic] = []
    if target.strip():
        # Forbidden terms: warn if the target contains a forbidden term.
        for e in glossary_entries:
            if e.get("enabled") is False:
                continue
            mode = str(e.get("mode") or ("forbidden" if bool(e.get("forbidden") or False) else "preferred")).strip().lower()
            if mode != "forbidden":
                continue
            term = str(e.get("source") or "").strip()
            if not term:
                continue
            case_sensitive = bool(e.get("case_sensitive") or False)
            whole_word = bool(e.get("whole_word") or False)

            hay = target if case_sensitive else target.lower()
            needle = term if case_sensitive else term.lower()

            def is_word_char(ch: str) -> bool:
                return ch.isalnum() or ch == "_"

            start = 0
            found = False
            while True:
                idx = hay.find(needle, start)
                if idx < 0:
                    break
                end = idx + len(needle)
                start = end
                if not whole_word:
                    found = True
                    break
                before_ok = idx == 0 or not is_word_char(hay[idx - 1])
                after_ok = end == len(hay) or not is_word_char(hay[end : end + 1])
                if before_ok and after_ok:
                    found = True
                    break
            if not found:
                continue

            warnings.append(
                Diagnostic(
                    severity="WARNING",
                    category="GLOSSARY",
                    code="W_GLOSSARY_FORBIDDEN",
                    message=f"Target contains forbidden term '{term}'.",
                    file_path=str(segment.get("file_path") or ""),
                    location=str(segment.get("location") or ""),
                    segment_id=str(segment.get("id") or ""),
                )
            )
            if len(warnings) >= max_warnings:
                return warnings

    # Preferred terms: warn if expected target term is missing.
    for hit in glossary_hits(glossary_entries, source, limit=max_warnings):
        expected = hit.target
        if not expected.strip():
            continue
        contains = expected in target if hit.case_sensitive else expected.lower() in target.lower()
        if contains:
            continue
        warnings.append(
            Diagnostic(
                severity="WARNING",
                category="GLOSSARY",
                code="W_GLOSSARY_MISSING",
                message=f"Glossary term '{hit.source}' suggests '{hit.target}' but target does not contain it.",
                file_path=str(segment.get("file_path") or ""),
                location=str(segment.get("location") or ""),
                segment_id=str(segment.get("id") or ""),
            )
        )
    return warnings
