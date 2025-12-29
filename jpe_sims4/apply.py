from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from typing import Any, Iterable

from jpe_sims4.diagnostics import Diagnostic


@dataclass(frozen=True)
class ApplyResult:
    content: bytes
    diagnostics: list[Diagnostic]
    applied: int


def _clean_text(s: str) -> str:
    s = s.replace("\r\n", "\n")
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()


def _parse_json_path(path: str) -> list[tuple[str, str]]:
    if not path.startswith("$"):
        raise ValueError("JSON path must start with '$'.")
    i = 1
    parts: list[tuple[str, str]] = []
    while i < len(path):
        if path[i] == ".":
            i += 1
            j = i
            while j < len(path) and re.match(r"[A-Za-z0-9_\-]", path[j]):
                j += 1
            if j == i:
                raise ValueError(f"Invalid JSON path at {i}.")
            parts.append(("key", path[i:j]))
            i = j
            continue
        if path[i] == "[":
            if i + 1 >= len(path):
                raise ValueError("Unterminated bracket token in JSON path.")
            quote = path[i + 1]
            if quote in {"'", '"'}:
                j = i + 2
                out = []
                esc = False
                while j < len(path):
                    ch = path[j]
                    if esc:
                        out.append(ch)
                        esc = False
                        j += 1
                        continue
                    if ch == "\\":
                        esc = True
                        j += 1
                        continue
                    if ch == quote:
                        break
                    out.append(ch)
                    j += 1
                if j >= len(path) or path[j] != quote:
                    raise ValueError("Unterminated string key in JSON path.")
                if j + 1 >= len(path) or path[j + 1] != "]":
                    raise ValueError("Unterminated bracket key in JSON path.")
                parts.append(("key", "".join(out)))
                i = j + 2
                continue

            j = path.find("]", i + 1)
            if j < 0:
                raise ValueError("Unterminated index in JSON path.")
            idx = path[i + 1 : j].strip()
            if not idx.isdigit():
                raise ValueError("JSON path indexes must be integers.")
            parts.append(("index", idx))
            i = j + 1
            continue
        raise ValueError(f"Unsupported JSON path token at {i}.")
    return parts


def _set_json_value(data: Any, path: str, value: str) -> bool:
    parts = _parse_json_path(path)
    cur: Any = data
    for kind, token in parts[:-1]:
        if kind == "key":
            if not isinstance(cur, dict) or token not in cur:
                return False
            cur = cur[token]
            continue
        if kind == "index":
            if not isinstance(cur, list):
                return False
            idx = int(token)
            if idx < 0 or idx >= len(cur):
                return False
            cur = cur[idx]
            continue
        return False

    last_kind, last_token = parts[-1] if parts else ("", "")
    if not parts:
        return False
    if last_kind == "key":
        if not isinstance(cur, dict) or last_token not in cur:
            return False
        cur[last_token] = value
        return True
    if last_kind == "index":
        if not isinstance(cur, list):
            return False
        idx = int(last_token)
        if idx < 0 or idx >= len(cur):
            return False
        cur[idx] = value
        return True
    return False


def apply_json(*, file_path: str, content: bytes, segments: Iterable[dict[str, object]]) -> ApplyResult:
    diagnostics: list[Diagnostic] = []
    try:
        data = json.loads(content.decode("utf-8", "replace"))
    except Exception as e:
        return ApplyResult(
            content=content,
            applied=0,
            diagnostics=[
                Diagnostic(
                    severity="ERROR",
                    category="PARSER_JSON",
                    code="E_JSON_PARSE",
                    message=str(e),
                    file_path=file_path,
                )
            ],
        )

    applied = 0
    for s in segments:
        target = str(s.get("target") or "")
        if not target.strip():
            continue
        loc = str(s.get("location") or "")
        ok = False
        try:
            ok = _set_json_value(data, loc, target)
        except Exception as e:
            diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="BUILD",
                    code="W_JSON_PATH",
                    message=str(e),
                    file_path=file_path,
                    location=loc,
                    segment_id=str(s.get("id") or ""),
                )
            )
        if ok:
            applied += 1
        else:
            diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="BUILD",
                    code="W_JSON_SET_FAILED",
                    message="Failed to apply translation at JSON path.",
                    file_path=file_path,
                    location=loc,
                    segment_id=str(s.get("id") or ""),
                )
            )

    out = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8") + b"\n"
    return ApplyResult(content=out, applied=applied, diagnostics=diagnostics)


def _parse_xml_step(step: str) -> tuple[str, int]:
    m = re.fullmatch(r"([^\[]+)(?:\[(\d+)\])?", step)
    if not m:
        raise ValueError(f"Invalid XML step: {step}")
    tag = m.group(1)
    index = int(m.group(2) or "1")
    if index < 1:
        raise ValueError("XML path indexes are 1-based.")
    return tag, index


def _find_xml_node(root: ET.Element, node_path: str) -> ET.Element | None:
    if not node_path.startswith("/"):
        return None
    parts = [p for p in node_path.split("/") if p]
    if not parts:
        return None
    root_step, root_idx = _parse_xml_step(parts[0])
    if root_step != root.tag or root_idx != 1:
        return None
    cur: ET.Element = root
    for step in parts[1:]:
        tag, idx = _parse_xml_step(step)
        matches = [c for c in list(cur) if c.tag == tag]
        if idx - 1 < 0 or idx - 1 >= len(matches):
            return None
        cur = matches[idx - 1]
    return cur


def apply_xml(*, file_path: str, content: bytes, segments: Iterable[dict[str, object]]) -> ApplyResult:
    diagnostics: list[Diagnostic] = []
    try:
        root = ET.fromstring(content.decode("utf-8", "replace"))
    except Exception as e:
        return ApplyResult(
            content=content,
            applied=0,
            diagnostics=[
                Diagnostic(
                    severity="ERROR",
                    category="PARSER_XML",
                    code="E_XML_PARSE",
                    message=str(e),
                    file_path=file_path,
                )
            ],
        )

    applied = 0
    for s in segments:
        target = str(s.get("target") or "")
        if not target.strip():
            continue
        loc = str(s.get("location") or "")
        segment_id = str(s.get("id") or "")

        if loc.endswith("/text()"):
            node = _find_xml_node(root, loc[: -len("/text()")])
            if node is None:
                diagnostics.append(
                    Diagnostic(
                        severity="WARNING",
                        category="BUILD",
                        code="W_XML_PATH",
                        message="XML node not found for text().",
                        file_path=file_path,
                        location=loc,
                        segment_id=segment_id,
                    )
                )
                continue
            node.text = target
            applied += 1
            continue

        if loc.endswith("/tail()"):
            node = _find_xml_node(root, loc[: -len("/tail()")])
            if node is None:
                diagnostics.append(
                    Diagnostic(
                        severity="WARNING",
                        category="BUILD",
                        code="W_XML_PATH",
                        message="XML node not found for tail().",
                        file_path=file_path,
                        location=loc,
                        segment_id=segment_id,
                    )
                )
                continue
            node.tail = target
            applied += 1
            continue

        m = re.search(r"/@([^/]+)$", loc)
        if m:
            node = _find_xml_node(root, loc[: m.start()])
            if node is None:
                diagnostics.append(
                    Diagnostic(
                        severity="WARNING",
                        category="BUILD",
                        code="W_XML_PATH",
                        message="XML node not found for attribute.",
                        file_path=file_path,
                        location=loc,
                        segment_id=segment_id,
                    )
                )
                continue
            node.set(m.group(1), target)
            applied += 1
            continue

        diagnostics.append(
            Diagnostic(
                severity="WARNING",
                category="BUILD",
                code="W_XML_LOCATION_UNSUPPORTED",
                message="Unsupported XML location format.",
                file_path=file_path,
                location=loc,
                segment_id=segment_id,
            )
        )

    out = ET.tostring(root, encoding="utf-8")
    if not out.endswith(b"\n"):
        out += b"\n"
    return ApplyResult(content=out, applied=applied, diagnostics=diagnostics)


def _split_value_and_comment(rhs: str) -> tuple[str, str]:
    in_quote: str | None = None
    for i, ch in enumerate(rhs):
        if ch in "\"'":
            if in_quote == ch:
                in_quote = None
            elif in_quote is None:
                in_quote = ch
        if in_quote is None and ch in ";#":
            if i == 0 or rhs[i - 1].isspace():
                return rhs[:i].rstrip(), rhs[i:]
    return rhs.rstrip(), ""


def apply_ini_like(*, file_path: str, content: bytes, segments: Iterable[dict[str, object]]) -> ApplyResult:
    diagnostics: list[Diagnostic] = []
    lines = content.decode("utf-8", "replace").splitlines()
    applied = 0

    for s in segments:
        target = str(s.get("target") or "")
        if not target.strip():
            continue
        loc = str(s.get("location") or "")
        segment_id = str(s.get("id") or "")
        legacy = re.fullmatch(r"line:(\d+):(.+)", loc)
        if legacy:
            line_no = int(legacy.group(1))
            key = legacy.group(2).strip()
            if line_no < 1 or line_no > len(lines):
                diagnostics.append(
                    Diagnostic(
                        severity="WARNING",
                        category="BUILD",
                        code="W_INI_LINE_RANGE",
                        message="INI location line out of range.",
                        file_path=file_path,
                        location=loc,
                        segment_id=segment_id,
                    )
                )
                continue

            original = lines[line_no - 1]
            pattern = re.compile(rf"^(?P<prefix>\s*{re.escape(key)}\s*=\s*)(?P<rhs>.*)$")
            mm = pattern.match(original)
            if not mm:
                diagnostics.append(
                    Diagnostic(
                        severity="WARNING",
                        category="BUILD",
                        code="W_INI_KEY_MISMATCH",
                        message="INI key not found on expected line.",
                        file_path=file_path,
                        location=loc,
                        segment_id=segment_id,
                    )
                )
                continue

            prefix = mm.group("prefix")
            rhs = mm.group("rhs")
            value_part, comment = _split_value_and_comment(rhs)
            value_part = value_part.strip()
            quote = ""
            if (value_part.startswith('"') and value_part.endswith('"')) or (value_part.startswith("'") and value_part.endswith("'")):
                quote = value_part[0]
            new_value = f"{quote}{target}{quote}" if quote else target
            lines[line_no - 1] = f"{prefix}{new_value}{(' ' if comment and not comment.startswith(' ') else '')}{comment}".rstrip()
            applied += 1
            continue

        modern = re.fullmatch(r"ini:\[(?P<section>[^\]]*)\]\.(?P<key>[^[]+?)(?:\[(?P<occ>\d+)\])?", loc)
        if not modern:
            diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="BUILD",
                    code="W_INI_LOCATION",
                    message="Unsupported INI location format.",
                    file_path=file_path,
                    location=loc,
                    segment_id=segment_id,
                )
            )
            continue

        section = (modern.group("section") or "").strip() or "global"
        key = (modern.group("key") or "").strip()
        occ = int(modern.group("occ") or "1")
        if occ < 1:
            diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="BUILD",
                    code="W_INI_LOCATION",
                    message="INI occurrence index must be >= 1.",
                    file_path=file_path,
                    location=loc,
                    segment_id=segment_id,
                )
            )
            continue

        cur_section = "global"
        seen = 0
        target_line_index: int | None = None
        for idx, line in enumerate(lines):
            raw = line.strip()
            if raw.startswith("[") and raw.endswith("]") and len(raw) >= 2:
                cur_section = raw[1:-1].strip() or "global"
                continue
            if cur_section != section:
                continue
            if not raw or raw.startswith("#") or raw.startswith(";") or raw.startswith("["):
                continue
            if "=" not in raw:
                continue
            lhs, _rhs = raw.split("=", 1)
            if lhs.strip() != key:
                continue
            seen += 1
            if seen == occ:
                target_line_index = idx
                break

        if target_line_index is None:
            diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="BUILD",
                    code="W_INI_KEY_MISMATCH",
                    message="INI key not found for section/key occurrence.",
                    file_path=file_path,
                    location=loc,
                    segment_id=segment_id,
                )
            )
            continue

        original = lines[target_line_index]
        pattern = re.compile(rf"^(?P<prefix>\s*{re.escape(key)}\s*=\s*)(?P<rhs>.*)$")
        mm = pattern.match(original)
        if not mm:
            diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="BUILD",
                    code="W_INI_KEY_MISMATCH",
                    message="INI key not found on expected line.",
                    file_path=file_path,
                    location=loc,
                    segment_id=segment_id,
                )
            )
            continue

        prefix = mm.group("prefix")
        rhs = mm.group("rhs")
        value_part, comment = _split_value_and_comment(rhs)
        value_part = value_part.strip()
        quote = ""
        if (value_part.startswith('"') and value_part.endswith('"')) or (value_part.startswith("'") and value_part.endswith("'")):
            quote = value_part[0]
        new_value = f"{quote}{target}{quote}" if quote else target
        lines[target_line_index] = f"{prefix}{new_value}{(' ' if comment and not comment.startswith(' ') else '')}{comment}".rstrip()
        applied += 1

    out = ("\n".join(lines) + "\n").encode("utf-8")
    return ApplyResult(content=out, applied=applied, diagnostics=diagnostics)


_QUOTED = re.compile(r"\"([^\"\n]{0,2000})\"")


def apply_jpe_like(*, file_path: str, content: bytes, segments: Iterable[dict[str, object]]) -> ApplyResult:
    diagnostics: list[Diagnostic] = []
    lines = content.decode("utf-8", "replace").splitlines(keepends=False)
    applied = 0

    def _sort_key(seg: dict[str, object]) -> tuple[int, int]:
        loc = str(seg.get("location") or "")
        m = re.fullmatch(r"line:(\d+):quoted(?:#(\d+))?", loc)
        if not m:
            return (0, 0)
        line_no = int(m.group(1))
        occ = int(m.group(2) or "1")
        return (line_no, -occ)

    for s in sorted(list(segments), key=_sort_key):
        target = str(s.get("target") or "")
        if not target.strip():
            continue
        loc = str(s.get("location") or "")
        source = str(s.get("source") or "")
        segment_id = str(s.get("id") or "")
        m = re.fullmatch(r"line:(\d+):quoted(?:#(\d+))?", loc)
        if not m:
            diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="BUILD",
                    code="W_JPE_LOCATION",
                    message="Unsupported JPE location format.",
                    file_path=file_path,
                    location=loc,
                    segment_id=segment_id,
                )
            )
            continue
        line_no = int(m.group(1))
        occ = int(m.group(2) or "1")
        if occ < 1:
            diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="BUILD",
                    code="W_JPE_LOCATION",
                    message="JPE occurrence index must be >= 1.",
                    file_path=file_path,
                    location=loc,
                    segment_id=segment_id,
                )
            )
            continue
        if line_no < 1 or line_no > len(lines):
            diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="BUILD",
                    code="W_JPE_LINE_RANGE",
                    message="JPE line out of range.",
                    file_path=file_path,
                    location=loc,
                    segment_id=segment_id,
                )
            )
            continue

        line = lines[line_no - 1]
        replaced = False
        pieces: list[str] = []
        last = 0
        seen = 0
        for mm in _QUOTED.finditer(line):
            pieces.append(line[last : mm.start(1)])
            inner = mm.group(1)
            if _clean_text(inner) == source:
                seen += 1
            if not replaced and _clean_text(inner) == source and seen == occ:
                pieces.append(target)
                replaced = True
                applied += 1
            else:
                pieces.append(inner)
            last = mm.end(1)
        pieces.append(line[last:])
        if replaced:
            lines[line_no - 1] = "".join(pieces)
        else:
            diagnostics.append(
                Diagnostic(
                    severity="WARNING",
                    category="BUILD",
                    code="W_JPE_QUOTED_NOT_FOUND",
                    message="Quoted source not found on expected line.",
                    file_path=file_path,
                    location=loc,
                    segment_id=segment_id,
                )
            )

    out = ("\n".join(lines) + "\n").encode("utf-8")
    return ApplyResult(content=out, applied=applied, diagnostics=diagnostics)


def apply_translations(*, file_path: str, kind: str, content: bytes, segments: Iterable[dict[str, object]]) -> ApplyResult:
    kind = kind.lower()
    try:
        from jpe_sims4.plugins import plugins

        reg = plugins().load()
        fn = reg.appliers.get(kind)
        if fn is not None:
            res = fn(file_path, content, list(segments))
            return ApplyResult(content=res.content, diagnostics=list(res.diagnostics), applied=int(res.applied))  # type: ignore[attr-defined]
    except Exception:
        pass

    if kind in {"xml", "jpe-xml"}:
        return apply_xml(file_path=file_path, content=content, segments=segments)
    if kind == "json":
        return apply_json(file_path=file_path, content=content, segments=segments)
    if kind in {"ini", "cfg"}:
        return apply_ini_like(file_path=file_path, content=content, segments=segments)
    if kind == "jpe":
        return apply_jpe_like(file_path=file_path, content=content, segments=segments)
    return ApplyResult(content=content, diagnostics=[], applied=0)
