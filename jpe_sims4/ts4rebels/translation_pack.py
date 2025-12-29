from __future__ import annotations

import csv
import io
import json
from dataclasses import dataclass
from pathlib import Path

from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.glossary import glossary_entry_id
from jpe_sims4.ts4rebels import plugin_diagnostics as ts4d
from jpe_sims4.workspace import update_segment_editor_fields


@dataclass(frozen=True)
class TranslationPackResult:
    pairs: list[tuple[str, str]]
    glossary_entries: list[dict[str, object]]
    diagnostics: list[Diagnostic]


_SOURCE_KEYS = ("source", "src", "original", "text")
_TARGET_KEYS = ("target", "tgt", "translation", "translated")
_TERM_KEYS = ("term", "source_term")
_TERM_TRANSLATION_KEYS = ("preferred", "translation", "target", "target_term")


def load_translation_pack(path: Path) -> TranslationPackResult:
    path = path.expanduser().resolve()
    try:
        content = path.read_bytes()
    except Exception as e:
        return TranslationPackResult(pairs=[], glossary_entries=[], diagnostics=[ts4d.parse_failed(message=str(e), file_path=str(path))])
    return parse_translation_pack(file_path=str(path), content=content)


def parse_translation_pack(*, file_path: str, content: bytes) -> TranslationPackResult:
    text = content.decode("utf-8", "replace")
    stripped = text.lstrip("\ufeff\r\n\t ")
    if stripped.startswith("{") or stripped.startswith("["):
        return _parse_json(file_path=file_path, text=stripped)
    return _parse_csv(file_path=file_path, text=text)


def _norm_key(k: object) -> str:
    return str(k or "").strip().lower()


def _pick(d: dict[str, object], keys: tuple[str, ...]) -> str | None:
    for k in keys:
        for kk, vv in d.items():
            if _norm_key(kk) == k:
                s = str(vv or "").strip()
                return s or None
    return None


def _parse_csv(*, file_path: str, text: str) -> TranslationPackResult:
    pairs: list[tuple[str, str]] = []
    glossary: list[dict[str, object]] = []
    diags: list[Diagnostic] = []

    try:
        reader = csv.DictReader(io.StringIO(text))
        rows = list(reader)
    except Exception as e:
        return TranslationPackResult(pairs=[], glossary_entries=[], diagnostics=[ts4d.parse_failed(message=str(e), file_path=file_path)])

    for row in rows:
        d = {str(k or ""): (v if v is not None else "") for k, v in (row or {}).items()}
        src = _pick(d, _SOURCE_KEYS)
        tgt = _pick(d, _TARGET_KEYS)
        if src and tgt:
            pairs.append((src, tgt))

        term = _pick(d, _TERM_KEYS)
        term_tgt = _pick(d, _TERM_TRANSLATION_KEYS)
        if term and term_tgt:
            glossary.append(
                {
                    "id": glossary_entry_id(term, term_tgt),
                    "source": term,
                    "target": term_tgt,
                    "note": "",
                    "enabled": True,
                    "case_sensitive": False,
                    "whole_word": False,
                }
            )

    return TranslationPackResult(pairs=pairs, glossary_entries=glossary, diagnostics=diags)


def _parse_json(*, file_path: str, text: str) -> TranslationPackResult:
    pairs: list[tuple[str, str]] = []
    glossary: list[dict[str, object]] = []
    diags: list[Diagnostic] = []
    try:
        data = json.loads(text)
    except Exception as e:
        return TranslationPackResult(pairs=[], glossary_entries=[], diagnostics=[ts4d.parse_failed(message=str(e), file_path=file_path)])

    def visit(node: object) -> None:
        if isinstance(node, dict):
            src = _pick(node, _SOURCE_KEYS)
            tgt = _pick(node, _TARGET_KEYS)
            if src and tgt:
                pairs.append((src, tgt))

            term = _pick(node, _TERM_KEYS)
            term_tgt = _pick(node, _TERM_TRANSLATION_KEYS)
            if term and term_tgt:
                glossary.append(
                    {
                        "id": glossary_entry_id(term, term_tgt),
                        "source": term,
                        "target": term_tgt,
                        "note": "",
                        "enabled": True,
                        "case_sensitive": False,
                        "whole_word": False,
                    }
                )

            for v in node.values():
                visit(v)
            return
        if isinstance(node, list):
            for item in node:
                visit(item)
            return

    visit(data)
    return TranslationPackResult(pairs=pairs, glossary_entries=glossary, diagnostics=diags)


def apply_translation_pack(
    *,
    project_segments: list[dict[str, object]],
    translation_pairs: list[tuple[str, str]],
    overwrite_targets: bool = False,
) -> int:
    by_source: dict[str, str] = {}
    for src, tgt in translation_pairs:
        src_s = str(src or "").strip()
        tgt_s = str(tgt or "").strip()
        if not src_s or not tgt_s:
            continue
        by_source.setdefault(src_s, tgt_s)

    updated = 0
    for seg in project_segments:
        src = str(seg.get("source") or "").strip()
        if not src:
            continue
        tgt = by_source.get(src)
        if not tgt:
            continue
        has_target = bool(str(seg.get("target") or "").strip())
        if has_target and not overwrite_targets:
            continue
        update_segment_editor_fields(
            seg,
            target=tgt,
            note=str(seg.get("note") or ""),
            status=str(seg.get("status") or "new"),
        )
        updated += 1

    return updated
