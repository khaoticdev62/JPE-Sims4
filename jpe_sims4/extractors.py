from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from typing import Any, Iterable

from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.segments import Segment


@dataclass(frozen=True)
class ExtractResult:
    segments: list[Segment]
    diagnostics: list[Diagnostic]


_HAS_LETTERS = re.compile(r"[A-Za-z]")
_QUOTED = re.compile(r"\"([^\"\n]{2,500})\"")
_JSON_SAFE_KEY = re.compile(r"^[A-Za-z0-9_\-]+$")


def _clean_text(s: str) -> str:
    s = s.replace("\r\n", "\n")
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()


def extract_from_xml(*, file_path: str, text: str) -> ExtractResult:
    diagnostics: list[Diagnostic] = []
    segments: list[Segment] = []

    try:
        root = ET.fromstring(text)
    except Exception as e:
        diagnostics.append(
            Diagnostic(
                severity="ERROR",
                category="PARSER_XML",
                code="E_XML_PARSE",
                message=str(e),
                file_path=file_path,
            )
        )
        return ExtractResult(segments=[], diagnostics=diagnostics)

    def walk(node: ET.Element, path: str) -> None:
        if node.text and _HAS_LETTERS.search(node.text):
            value = _clean_text(node.text)
            if value:
                segments.append(Segment.create(file_path=file_path, location=f"{path}/text()", source=value))

        for k, v in node.attrib.items():
            if v and _HAS_LETTERS.search(v):
                value = _clean_text(v)
                if value:
                    segments.append(Segment.create(file_path=file_path, location=f"{path}/@{k}", source=value))

        children = list(node)
        counts: dict[str, int] = {}
        for child in children:
            counts[child.tag] = counts.get(child.tag, 0) + 1
        seen: dict[str, int] = {}
        for child in children:
            seen[child.tag] = seen.get(child.tag, 0) + 1
            suffix = f"[{seen[child.tag]}]" if counts[child.tag] > 1 else ""
            child_path = f"{path}/{child.tag}{suffix}"
            walk(child, child_path)

        if node.tail and _HAS_LETTERS.search(node.tail):
            value = _clean_text(node.tail)
            if value:
                segments.append(Segment.create(file_path=file_path, location=f"{path}/tail()", source=value))

    walk(root, f"/{root.tag}")
    return ExtractResult(segments=segments, diagnostics=diagnostics)


def extract_from_json(*, file_path: str, text: str) -> ExtractResult:
    diagnostics: list[Diagnostic] = []
    segments: list[Segment] = []

    try:
        data = json.loads(text)
    except Exception as e:
        diagnostics.append(
            Diagnostic(
                severity="ERROR",
                category="PARSER_JSON",
                code="E_JSON_PARSE",
                message=str(e),
                file_path=file_path,
            )
        )
        return ExtractResult(segments=[], diagnostics=diagnostics)

    def walk(value: Any, path: str) -> None:
        if isinstance(value, str):
            if _HAS_LETTERS.search(value):
                cleaned = _clean_text(value)
                if cleaned:
                    segments.append(Segment.create(file_path=file_path, location=path, source=cleaned))
            return
        if isinstance(value, list):
            for i, item in enumerate(value):
                walk(item, f"{path}[{i}]")
            return
        if isinstance(value, dict):
            for k, item in value.items():
                if _JSON_SAFE_KEY.fullmatch(str(k)):
                    child_path = f"{path}.{k}"
                else:
                    kk = str(k).replace("\\", "\\\\").replace("'", "\\'")
                    child_path = f"{path}['{kk}']"
                walk(item, child_path)
            return

    walk(data, "$")
    return ExtractResult(segments=segments, diagnostics=diagnostics)


def extract_from_ini_like(*, file_path: str, text: str) -> ExtractResult:
    diagnostics: list[Diagnostic] = []
    segments: list[Segment] = []

    section = "global"
    occ: dict[tuple[str, str], int] = {}
    for i, line in enumerate(text.splitlines(), start=1):
        raw = line.strip()
        if not raw or raw.startswith("#") or raw.startswith(";"):
            continue
        if raw.startswith("[") and raw.endswith("]") and len(raw) >= 2:
            section = raw[1:-1].strip() or "global"
            continue
        if "=" not in raw:
            continue
        key, value = raw.split("=", 1)
        key = key.strip()
        if not key:
            continue
        value = value.strip().strip("\"'")
        if value and _HAS_LETTERS.search(value):
            cleaned = _clean_text(value)
            key_occ_key = (section, key)
            occ[key_occ_key] = occ.get(key_occ_key, 0) + 1
            suffix = f"[{occ[key_occ_key]}]" if occ[key_occ_key] > 1 else ""
            location = f"ini:[{section}].{key}{suffix}"
            legacy_location = f"line:{i}:{key}"
            segments.append(
                Segment.create(
                    file_path=file_path,
                    location=location,
                    source=cleaned,
                    id_aliases=[Segment.make_id(file_path, legacy_location, cleaned)],
                )
            )

    return ExtractResult(segments=segments, diagnostics=diagnostics)


def extract_from_jpe_like(*, file_path: str, text: str) -> ExtractResult:
    diagnostics: list[Diagnostic] = []
    segments: list[Segment] = []

    for i, line in enumerate(text.splitlines(), start=1):
        matches: list[str] = []
        for m in _QUOTED.finditer(line):
            val = _clean_text(m.group(1))
            if val and _HAS_LETTERS.search(val):
                matches.append(val)
        if not matches:
            continue
        total: dict[str, int] = {}
        for v in matches:
            total[v] = total.get(v, 0) + 1
        seen: dict[str, int] = {}
        for v in matches:
            seen[v] = seen.get(v, 0) + 1
            # Preserve legacy location format for unique sources. Disambiguate repeated sources.
            if total[v] == 1 or seen[v] == 1:
                loc = f"line:{i}:quoted"
            else:
                loc = f"line:{i}:quoted#{seen[v]}"
            segments.append(Segment.create(file_path=file_path, location=loc, source=v))

    return ExtractResult(segments=segments, diagnostics=diagnostics)


def extract_segments(*, file_path: str, kind: str, content: bytes) -> ExtractResult:
    try:
        from jpe_sims4.plugins import plugins

        reg = plugins().load()
        fn = reg.extractors.get(kind.lower())
        if fn is not None:
            res = fn(file_path, content)
            return ExtractResult(segments=list(res.segments), diagnostics=list(res.diagnostics))  # type: ignore[attr-defined]
    except Exception:
        pass

    text = content.decode("utf-8", "replace")
    if kind in {"xml", "jpe-xml"}:
        return extract_from_xml(file_path=file_path, text=text)
    if kind == "json":
        return extract_from_json(file_path=file_path, text=text)
    if kind in {"ini", "cfg"}:
        return extract_from_ini_like(file_path=file_path, text=text)
    if kind == "jpe":
        return extract_from_jpe_like(file_path=file_path, text=text)
    return ExtractResult(segments=[], diagnostics=[])


def dedupe_segments(segments: Iterable[Segment]) -> list[Segment]:
    seen: set[tuple[str, str, str]] = set()
    out: list[Segment] = []
    for s in segments:
        key = (s.file_path, s.location, s.source)
        if key in seen:
            continue
        seen.add(key)
        out.append(s)
    out.sort(key=lambda x: (x.file_path, x.location, x.id))
    return out
