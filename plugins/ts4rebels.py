from __future__ import annotations

import csv
import io
import json
import re

from jpe_sims4.apply import ApplyResult
from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.extractors import ExtractResult
from jpe_sims4.segments import Segment
from jpe_sims4.ts4rebels import plugin_diagnostics as ts4d
from jpe_sims4.validate import extract_placeholders


def register(registry) -> None:
    def extract_ts4rebels_metadata(file_path: str, content: bytes) -> ExtractResult:
        text = content.decode("utf-8", "replace")
        stripped = text.lstrip("\ufeff\r\n\t ")
        if stripped.startswith("{") or stripped.startswith("["):
            return _extract_json(file_path=file_path, text=stripped)
        return _extract_csv(file_path=file_path, text=text)

    def apply_ts4rebels_metadata(file_path: str, content: bytes, segments: list[dict[str, object]]) -> ApplyResult:
        text = content.decode("utf-8", "replace")
        stripped = text.lstrip("\ufeff\r\n\t ")
        if stripped.startswith("{") or stripped.startswith("["):
            return _apply_json(file_path=file_path, text=stripped, segments=segments)
        return _apply_csv(file_path=file_path, text=text, segments=segments)

    registry.register_extractor("ts4rebels-manifest", extract_ts4rebels_metadata)
    registry.register_extractor("ts4rebels-meta", extract_ts4rebels_metadata)
    registry.register_applier("ts4rebels-manifest", apply_ts4rebels_metadata)
    registry.register_applier("ts4rebels-meta", apply_ts4rebels_metadata)
    registry.register_validator(_validate_ts4rebels_segment)


_HAS_LETTERS = re.compile(r"[A-Za-z]")
_TRANSLATABLE_KEYS = {
    "title",
    "name",
    "label",
    "display_name",
    "description",
    "summary",
    "notes",
    "note",
    "collection",
    "pack",
}
_TRANSLATABLE_ARRAY_KEYS = {"strings"}
_VERSION_KEYS = {"schema_version", "manifest_version"}
_SUPPORTED_VERSIONS = {"1", "1.0", 1, 1.0}
_BBCODE_TAG = re.compile(r"\[(/?)([a-zA-Z]{1,20})(?:=[^\]\n]{0,200})?\]")
_EMOJI = re.compile(r":[a-z0-9_+\-]{2,40}:")


def _json_str(v: str) -> str:
    return json.dumps(v, ensure_ascii=False)


def _is_ts4rebels_segment(segment: dict[str, object]) -> bool:
    fp = str(segment.get("file_path") or "").lower().replace("\\", "/")
    name = fp.rsplit("/", 1)[-1]
    if "ts4rebels" not in name:
        return False
    return name.endswith(".json") or name.endswith(".csv")


def _bbcode_tokens(text: str) -> list[str]:
    toks: list[str] = []
    for m in _BBCODE_TAG.finditer(text):
        closing = m.group(1) == "/"
        tag = m.group(2).lower()
        toks.append(f"{'/' if closing else ''}{tag}")
    return sorted(toks)


def _emoji_tokens(text: str) -> list[str]:
    return sorted(m.group(0) for m in _EMOJI.finditer(text))


def _validate_ts4rebels_segment(segment: dict[str, object]) -> list[Diagnostic]:
    if not _is_ts4rebels_segment(segment):
        return []

    source = str(segment.get("source") or "")
    target = str(segment.get("target") or "")
    if not target.strip():
        return []

    file_path = str(segment.get("file_path") or "")
    location = str(segment.get("location") or "")
    segment_id = str(segment.get("id") or "")

    diagnostics: list[Diagnostic] = []

    src_bb = _bbcode_tokens(source)
    if src_bb:
        tgt_bb = _bbcode_tokens(target)
        if src_bb != tgt_bb:
            diagnostics.append(
                ts4d.token_mismatch(
                    message=f"BBCode tags differ (source={src_bb}, target={tgt_bb}).",
                    file_path=file_path,
                    location=location,
                    segment_id=segment_id,
                )
            )

    src_em = _emoji_tokens(source)
    if src_em:
        tgt_em = _emoji_tokens(target)
        if src_em != tgt_em:
            diagnostics.append(
                ts4d.token_mismatch(
                    message=f"Emoji tokens differ (source={src_em}, target={tgt_em}).",
                    file_path=file_path,
                    location=location,
                    segment_id=segment_id,
                )
            )

    return diagnostics


def _maybe_segment(*, file_path: str, location: str, value: str, diagnostics: list[Diagnostic], segments: list[Segment]) -> None:
    cleaned = (value or "").replace("\r\n", "\n").strip()
    if not cleaned or not _HAS_LETTERS.search(cleaned):
        return
    seg = Segment.create(file_path=file_path, location=location, source=cleaned)
    segments.append(seg)
    ph = extract_placeholders(cleaned)
    if ph:
        diagnostics.append(
            ts4d.placeholder_hint(
                message=f"Detected placeholders: {ph}",
                file_path=file_path,
                location=location,
                segment_id=seg.id,
            )
        )


def _extract_json(*, file_path: str, text: str) -> ExtractResult:
    diagnostics: list[Diagnostic] = []
    segments: list[Segment] = []

    try:
        data = json.loads(text)
    except Exception as e:
        return ExtractResult(segments=[], diagnostics=[ts4d.parse_failed(message=str(e), file_path=file_path)])

    if isinstance(data, dict):
        for k in _VERSION_KEYS:
            if k in data:
                v = data.get(k)
                if v not in _SUPPORTED_VERSIONS:
                    diagnostics.append(
                        ts4d.unsupported_version(
                            message=f"Unsupported TS4Rebels manifest version: {v!r} (supported={sorted([str(x) for x in _SUPPORTED_VERSIONS])}).",
                            file_path=file_path,
                        )
                    )
                break

    def walk(node: object, path: str) -> None:
        if isinstance(node, dict):
            for k, v in node.items():
                if k in _TRANSLATABLE_KEYS and isinstance(v, str):
                    _maybe_segment(file_path=file_path, location=f"{path}.{k}", value=v, diagnostics=diagnostics, segments=segments)
                if k in _TRANSLATABLE_ARRAY_KEYS and isinstance(v, list):
                    for i, item in enumerate(v):
                        if isinstance(item, str):
                            _maybe_segment(
                                file_path=file_path,
                                location=f"{path}.{k}[{i}]",
                                value=item,
                                diagnostics=diagnostics,
                                segments=segments,
                            )
                        else:
                            walk(item, f"{path}.{k}[{i}]")
                    continue

                if isinstance(v, list):
                    walk_list(v, f"{path}.{k}")
                elif isinstance(v, dict):
                    walk(v, f"{path}.{k}")
            return
        if isinstance(node, list):
            walk_list(node, path)
            return

    def walk_list(items: list[object], path: str) -> None:
        for i, item in enumerate(items):
            if isinstance(item, dict):
                selector = None
                fn = item.get("file_name")
                sha = item.get("sha256")
                if isinstance(fn, str) and fn.strip():
                    selector = f"[file_name={_json_str(fn.strip())}]"
                elif isinstance(sha, str) and sha.strip():
                    selector = f"[sha256={_json_str(sha.strip())}]"
                else:
                    selector = f"[{i}]"
                walk(item, f"{path}{selector}")
            else:
                walk(item, f"{path}[{i}]")

    walk(data, "$")
    return ExtractResult(segments=segments, diagnostics=diagnostics)


def _extract_csv(*, file_path: str, text: str) -> ExtractResult:
    diagnostics: list[Diagnostic] = []
    segments: list[Segment] = []

    try:
        buf = io.StringIO(text)
        reader = csv.DictReader(buf)
        rows = list(reader)
    except Exception as e:
        return ExtractResult(segments=[], diagnostics=[ts4d.parse_failed(message=str(e), file_path=file_path)])

    for i, row in enumerate(rows, start=1):
        file_name = str((row or {}).get("file_name") or "").strip()
        if file_name:
            row_loc = f"row[file_name={_json_str(file_name)}]"
        else:
            row_loc = f"row[index={i}]"

        for k in sorted(_TRANSLATABLE_KEYS):
            if k not in row:
                continue
            v = row.get(k)
            if isinstance(v, str):
                _maybe_segment(file_path=file_path, location=f"{row_loc}.{k}", value=v, diagnostics=diagnostics, segments=segments)

    return ExtractResult(segments=segments, diagnostics=diagnostics)


def _parse_selector(s: str) -> tuple[str, str] | tuple[None, None]:
    if "=" not in s:
        return (None, None)
    k, rhs = s.split("=", 1)
    k = k.strip()
    rhs = rhs.strip()
    if not k or not rhs:
        return (None, None)
    if rhs.startswith('"'):
        try:
            return (k, json.loads(rhs))
        except Exception:
            return (None, None)
    return (k, rhs)


def _iter_tokens(path: str) -> list[tuple[str, object]]:
    if not path.startswith("$"):
        raise ValueError("TS4Rebels path must start with '$'.")
    tokens: list[tuple[str, object]] = []
    i = 1
    while i < len(path):
        if path[i] == ".":
            i += 1
            j = i
            while j < len(path) and re.match(r"[A-Za-z0-9_\-]", path[j]):
                j += 1
            if j == i:
                raise ValueError("Invalid path key.")
            tokens.append(("key", path[i:j]))
            i = j
            continue
        if path[i] == "[":
            j = path.find("]", i + 1)
            if j < 0:
                raise ValueError("Unterminated selector.")
            inner = path[i + 1 : j].strip()
            if inner.isdigit():
                tokens.append(("index", int(inner)))
            else:
                k, v = _parse_selector(inner)
                if k is None:
                    raise ValueError("Invalid selector.")
                tokens.append(("select", (k, v)))
            i = j + 1
            continue
        raise ValueError("Unsupported path token.")
    return tokens


def _set_value_at_path(data: object, path: str, value: str) -> bool:
    tokens = _iter_tokens(path)
    if not tokens:
        return False

    cur: object = data
    for kind, tok in tokens[:-1]:
        if kind == "key":
            if not isinstance(cur, dict):
                return False
            cur = cur.get(str(tok))
            continue
        if kind == "index":
            if not isinstance(cur, list):
                return False
            idx = int(tok)
            if idx < 0 or idx >= len(cur):
                return False
            cur = cur[idx]
            continue
        if kind == "select":
            if not isinstance(cur, list):
                return False
            k, v = tok
            found = None
            for item in cur:
                if isinstance(item, dict) and item.get(k) == v:
                    found = item
                    break
            if found is None:
                return False
            cur = found
            continue
        return False

    last_kind, last_tok = tokens[-1]
    if last_kind == "key" and isinstance(cur, dict):
        cur[str(last_tok)] = value
        return True
    if last_kind == "index" and isinstance(cur, list):
        idx = int(last_tok)
        if idx < 0 or idx >= len(cur):
            return False
        cur[idx] = value
        return True
    return False


def _apply_json(*, file_path: str, text: str, segments: list[dict[str, object]]) -> ApplyResult:
    diagnostics: list[Diagnostic] = []

    # Best-effort formatting preservation: patch only the specific JSON string literal when possible.
    # Fallback to structured parse+dump if we can't patch (e.g., index selectors).
    try:
        data = json.loads(text)
    except Exception as e:
        return ApplyResult(
            content=text.encode("utf-8"),
            applied=0,
            diagnostics=[ts4d.parse_failed(message=str(e), file_path=file_path)],
        )

    patchable: list[tuple[str, str, str, str]] = []
    needs_structured = False
    for s in segments:
        target = str(s.get("target") or "")
        if not target.strip():
            continue
        loc = str(s.get("location") or "")
        segment_id = str(s.get("id") or "")
        try:
            tokens = _iter_tokens(loc)
        except Exception:
            needs_structured = True
            continue
        last_key = None
        selector = None
        for kind, tok in tokens:
            if kind == "key":
                last_key = str(tok)
            elif kind == "select":
                selector = tok
            elif kind == "index":
                needs_structured = True
        if selector and last_key and selector[0] in {"file_name", "sha256"}:
            patchable.append((selector[0], str(selector[1]), last_key, segment_id))
        else:
            needs_structured = True

    if not needs_structured and patchable:
        out, applied, diags = _patch_json_strings(
            text=text,
            patchable=patchable,
            segments_by_id={str(s.get("id") or ""): s for s in segments},
            file_path=file_path,
        )
        return ApplyResult(content=out.encode("utf-8"), applied=applied, diagnostics=diags)

    applied = 0
    for s in segments:
        target = str(s.get("target") or "")
        if not target.strip():
            continue
        loc = str(s.get("location") or "")
        segment_id = str(s.get("id") or "")
        try:
            ok = _set_value_at_path(data, loc, target)
        except Exception as e:
            diagnostics.append(
                ts4d.apply_failed(message=str(e), file_path=file_path, location=loc, segment_id=segment_id)
            )
            continue
        if ok:
            applied += 1
        else:
            diagnostics.append(
                ts4d.apply_failed(
                    message="Failed to apply translation at TS4Rebels path.",
                    file_path=file_path,
                    location=loc,
                    segment_id=segment_id,
                )
            )

    out = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8") + b"\n"
    return ApplyResult(content=out, applied=applied, diagnostics=diagnostics)


_CSV_LOC = re.compile(r"^row\[(.+)\]\.([A-Za-z0-9_\-]+)$")


def _apply_csv(*, file_path: str, text: str, segments: list[dict[str, object]]) -> ApplyResult:
    diagnostics: list[Diagnostic] = []
    try:
        buf = io.StringIO(text)
        reader = csv.DictReader(buf)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)
    except Exception as e:
        return ApplyResult(content=text.encode("utf-8"), applied=0, diagnostics=[ts4d.parse_failed(message=str(e), file_path=file_path)])

    applied = 0
    by_file_name: dict[str, dict[str, str]] = {}
    for r in rows:
        fn = str((r or {}).get("file_name") or "").strip()
        if fn:
            by_file_name[fn] = r

    for s in segments:
        target = str(s.get("target") or "")
        if not target.strip():
            continue
        loc = str(s.get("location") or "")
        segment_id = str(s.get("id") or "")
        m = _CSV_LOC.fullmatch(loc)
        if not m:
            continue
        selector_raw = m.group(1).strip()
        col = m.group(2)
        row: dict[str, str] | None = None
        if selector_raw.startswith("file_name="):
            _k, v = _parse_selector(selector_raw)
            if isinstance(v, str):
                row = by_file_name.get(v)
        elif selector_raw.startswith("index="):
            _k, v = _parse_selector(selector_raw)
            try:
                idx = int(v)
                row = rows[idx - 1] if 1 <= idx <= len(rows) else None
            except Exception:
                row = None
        if row is None or col not in row:
            diagnostics.append(
                ts4d.apply_failed(
                    message="Failed to apply translation at CSV row/column.",
                    file_path=file_path,
                    location=loc,
                    segment_id=segment_id,
                )
            )
            continue
        row[col] = target
        applied += 1

    out_buf = io.StringIO()
    writer = csv.DictWriter(out_buf, fieldnames=fieldnames, lineterminator="\n")
    writer.writeheader()
    for r in rows:
        writer.writerow(r)
    return ApplyResult(content=out_buf.getvalue().encode("utf-8"), applied=applied, diagnostics=diagnostics)


def _patch_json_strings(
    *,
    text: str,
    patchable: list[tuple[str, str, str, str]],
    segments_by_id: dict[str, dict[str, object]],
    file_path: str,
) -> tuple[str, int, list[Diagnostic]]:
    diags: list[Diagnostic] = []
    objects = _index_json_objects(text)

    by_selector: dict[tuple[str, str], list[dict[str, object]]] = {}
    for obj in objects:
        for k in ("file_name", "sha256"):
            v = obj.get(k)
            if isinstance(v, str) and v:
                by_selector.setdefault((k, v), []).append(obj)

    replacements: list[tuple[int, int, str]] = []
    applied = 0

    for sel_key, sel_value, field, segment_id in patchable:
        seg = segments_by_id.get(segment_id) or {}
        target = str(seg.get("target") or "")
        location = str(seg.get("location") or "")
        if not target.strip():
            continue

        candidates = by_selector.get((sel_key, sel_value)) or []
        obj = candidates[0] if candidates else None
        if obj is None:
            diags.append(
                ts4d.apply_failed(
                    message=f"Selector not found in JSON: {sel_key}={sel_value!r}",
                    file_path=file_path,
                    location=location,
                    segment_id=segment_id,
                )
            )
            continue

        fields = obj.get("_fields") or {}
        span = (fields or {}).get(field)
        if not span:
            diags.append(
                ts4d.apply_failed(
                    message=f"Field not found or not a string: {field!r}",
                    file_path=file_path,
                    location=location,
                    segment_id=segment_id,
                )
            )
            continue
        start, end = span
        replacements.append((int(start), int(end), json.dumps(target, ensure_ascii=False)))
        applied += 1

    # Apply from end to start so offsets remain valid.
    out = text
    for start, end, rep in sorted(replacements, key=lambda x: x[0], reverse=True):
        if start < 0 or end < start or end > len(out):
            continue
        out = out[:start] + rep + out[end:]

    return out, applied, diags


def _index_json_objects(text: str) -> list[dict[str, object]]:
    objects: list[dict[str, object]] = []

    class Ctx:
        __slots__ = ("kind", "state", "current_key", "obj")

        def __init__(self, kind: str) -> None:
            self.kind = kind  # object|array
            self.state = "expect_key_or_end" if kind == "object" else "value"
            self.current_key: str | None = None
            self.obj: dict[str, object] | None = None

    stack: list[Ctx] = []
    i = 0
    n = len(text)

    def parse_string(start: int) -> tuple[int, str, str]:
        j = start + 1
        esc = False
        while j < n:
            ch = text[j]
            if esc:
                esc = False
                j += 1
                continue
            if ch == "\\":
                esc = True
                j += 1
                continue
            if ch == '"':
                raw = text[start : j + 1]
                try:
                    val = json.loads(raw)
                except Exception:
                    val = raw[1:-1]
                return j + 1, raw, str(val)
            j += 1
        raise ValueError("Unterminated string literal.")

    def skip_ws(pos: int) -> int:
        while pos < n and text[pos] in " \t\r\n":
            pos += 1
        return pos

    while i < n:
        ch = text[i]
        if ch in " \t\r\n":
            i += 1
            continue

        if ch == "{":
            ctx = Ctx("object")
            ctx.obj = {"_start": i, "_fields": {}}
            stack.append(ctx)
            i += 1
            continue
        if ch == "[":
            stack.append(Ctx("array"))
            i += 1
            continue
        if ch == "}" and stack and stack[-1].kind == "object":
            ctx = stack.pop()
            if ctx.obj is not None:
                ctx.obj["_end"] = i + 1
                objects.append(ctx.obj)
            i += 1
            continue
        if ch == "]" and stack and stack[-1].kind == "array":
            stack.pop()
            i += 1
            continue

        top = stack[-1] if stack else None
        if top is None:
            i += 1
            continue

        if top.kind == "object":
            if top.state == "expect_key_or_end":
                if ch == "}":
                    i += 1
                    continue
                if ch == ",":
                    i += 1
                    continue
                if ch == '"':
                    i2, _raw, val = parse_string(i)
                    top.current_key = val
                    top.state = "expect_colon"
                    i = i2
                    continue
                i += 1
                continue
            if top.state == "expect_colon":
                i = skip_ws(i)
                if i < n and text[i] == ":":
                    top.state = "expect_value"
                    i += 1
                else:
                    i += 1
                continue
            if top.state == "expect_value":
                i = skip_ws(i)
                if i >= n:
                    break
                ch2 = text[i]
                if ch2 == '"':
                    i2, raw, val = parse_string(i)
                    key = top.current_key
                    if key and top.obj is not None:
                        if key in {"file_name", "sha256"}:
                            top.obj[key] = val
                        if key in (_TRANSLATABLE_KEYS | _TRANSLATABLE_ARRAY_KEYS | {"file_name", "sha256"}):
                            fields = top.obj.get("_fields")
                            if isinstance(fields, dict):
                                fields[key] = (i, i + len(raw))
                    top.current_key = None
                    top.state = "expect_comma_or_end"
                    i = i2
                    continue
                if ch2 in "{[":
                    top.current_key = None
                    top.state = "expect_comma_or_end"
                    i += 1
                    continue
                # primitive
                j = i
                while j < n and text[j] not in ",}]":
                    j += 1
                top.current_key = None
                top.state = "expect_comma_or_end"
                i = j
                continue
            if top.state == "expect_comma_or_end":
                i = skip_ws(i)
                if i < n and text[i] == ",":
                    top.state = "expect_key_or_end"
                    i += 1
                    continue
                if i < n and text[i] == "}":
                    i += 1
                    continue
                i += 1
                continue

        # array: nothing special; nested objects will be indexed by braces handling above
        i += 1

    return objects
