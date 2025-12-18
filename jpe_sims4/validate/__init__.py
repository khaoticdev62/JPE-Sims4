from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Callable

from jpe_sims4.diagnostics import Diagnostic


_PLACEHOLDER_PATTERN = re.compile(r"(\{\{|\}\}|\{[^\{\}\n]{1,40}\}|%[sdfox]|\$\{[^\}\n]{1,40}\})")


def extract_placeholders(text: str) -> list[str]:
    return sorted(set(m.group(1) for m in _PLACEHOLDER_PATTERN.finditer(text)))


def _segment_fields(segment: dict[str, object]) -> tuple[str, str, str]:
    return (
        str(segment.get("file_path") or ""),
        str(segment.get("location") or ""),
        str(segment.get("id") or ""),
    )


def _parse_int(v: object) -> int | None:
    try:
        if v is None:
            return None
        s = str(v).strip()
        if not s:
            return None
        return int(s)
    except Exception:
        return None


def _parse_float(v: object) -> float | None:
    try:
        if v is None:
            return None
        s = str(v).strip()
        if not s:
            return None
        return float(s)
    except Exception:
        return None


def _rule_list(v: object) -> list[str]:
    if v is None:
        return []
    if isinstance(v, list):
        return [str(x) for x in v if str(x).strip()]
    s = str(v)
    if not s.strip():
        return []
    return [line.strip() for line in s.splitlines() if line.strip()]


def _bool(v: object, default: bool) -> bool:
    if v is None:
        return default
    if isinstance(v, bool):
        return v
    s = str(v).strip().lower()
    if s in {"1", "true", "yes", "y", "on"}:
        return True
    if s in {"0", "false", "no", "n", "off"}:
        return False
    return default


def _tokenize(text: str, rx: re.Pattern[str]) -> list[str]:
    return [m.group(0) for m in rx.finditer(text)]


def _normalize_diag(obj: object, *, segment: dict[str, object], default_category: str) -> Diagnostic | None:
    if isinstance(obj, Diagnostic):
        d = obj
    elif isinstance(obj, dict):
        d = Diagnostic(
            severity=str(obj.get("severity") or "ERROR"),
            category=str(obj.get("category") or "") or None,
            code=str(obj.get("code") or ""),
            message=str(obj.get("message") or ""),
            file_path=str(obj.get("file_path") or "") or None,
            location=str(obj.get("location") or "") or None,
            segment_id=str(obj.get("segment_id") or "") or None,
        )
    else:
        return None

    file_path, location, segment_id = _segment_fields(segment)
    severity = str(d.severity or "ERROR").upper()
    category = str(d.category or "").strip() or default_category
    code = str(d.code or "").strip() or "E_VALIDATION"
    message = str(d.message or "").strip() or "Validation issue."
    return Diagnostic(
        severity=severity,
        category=category,
        code=code,
        message=message,
        file_path=d.file_path if (d.file_path and str(d.file_path).strip()) else file_path,
        location=d.location if (d.location and str(d.location).strip()) else location,
        segment_id=d.segment_id if (d.segment_id and str(d.segment_id).strip()) else segment_id,
    )


@dataclass(frozen=True)
class Rule:
    rule_id: str
    apply: Callable[[dict[str, object], dict[str, object]], list[Diagnostic]]
    default_enabled: bool = True


def _enabled_rules(cfg_root: dict[str, object]) -> set[str] | None:
    raw = cfg_root.get("enabled_rules")
    if raw is None:
        return None
    return {s for s in _rule_list(raw)}


def _rule_config(cfg_root: dict[str, object], rule_id: str) -> dict[str, object]:
    out: dict[str, object] = {}

    nested = cfg_root.get("rules") if isinstance(cfg_root.get("rules"), dict) else None
    if isinstance(nested, dict) and isinstance(nested.get(rule_id), dict):
        out.update(dict(nested.get(rule_id) or {}))

    # Legacy keys mapped by rule.
    if rule_id == "max_target_len" and "max_target_len" in cfg_root:
        out.setdefault("max_target_len", cfg_root.get("max_target_len"))
    if rule_id == "max_expansion_ratio" and "max_expansion_ratio" in cfg_root:
        out.setdefault("max_expansion_ratio", cfg_root.get("max_expansion_ratio"))
    if rule_id == "forbidden_chars" and "forbidden_chars" in cfg_root:
        out.setdefault("forbidden_chars", cfg_root.get("forbidden_chars"))
    if rule_id == "forbidden_regexes" and "forbidden_regexes" in cfg_root:
        out.setdefault("forbidden_regexes", cfg_root.get("forbidden_regexes"))
    if rule_id == "preserve_whitespace" and "preserve_whitespace" in cfg_root:
        out.setdefault("preserve_whitespace", cfg_root.get("preserve_whitespace"))
    if rule_id == "token_regexes" and "token_regexes" in cfg_root:
        out.setdefault("token_regexes", cfg_root.get("token_regexes"))
    return out


def _apply_placeholder_parity(segment: dict[str, object], _cfg: dict[str, object]) -> list[Diagnostic]:
    target = str(segment.get("target") or "")
    if not target.strip():
        return []
    source = str(segment.get("source") or "")
    src_ph = extract_placeholders(source)
    tgt_ph = extract_placeholders(target)
    if src_ph == tgt_ph:
        return []
    file_path, location, segment_id = _segment_fields(segment)
    return [
        Diagnostic(
            severity="ERROR",
            category="VALIDATION",
            code="E_PLACEHOLDER_MISMATCH",
            message=f"Placeholders differ (source={src_ph}, target={tgt_ph}).",
            file_path=file_path,
            location=location,
            segment_id=segment_id,
        )
    ]


def _apply_token_regexes(segment: dict[str, object], cfg: dict[str, object]) -> list[Diagnostic]:
    target = str(segment.get("target") or "")
    if not target.strip():
        return []
    source = str(segment.get("source") or "")
    diagnostics: list[Diagnostic] = []
    for token_re in _rule_list(cfg.get("token_regexes")):
        try:
            rx = re.compile(token_re)
        except Exception:
            continue
        src_toks = _tokenize(source, rx)
        if not src_toks:
            continue
        tgt_toks = _tokenize(target, rx)
        if sorted(src_toks) != sorted(tgt_toks):
            file_path, location, segment_id = _segment_fields(segment)
            diagnostics.append(
                Diagnostic(
                    severity="ERROR",
                    category="VALIDATION",
                    code="E_TOKEN_MISMATCH",
                    message=f"Token mismatch for regex '{token_re}' (source={sorted(set(src_toks))}, target={sorted(set(tgt_toks))}).",
                    file_path=file_path,
                    location=location,
                    segment_id=segment_id,
                )
            )
    return diagnostics


def _apply_max_target_len(segment: dict[str, object], cfg: dict[str, object]) -> list[Diagnostic]:
    target = str(segment.get("target") or "")
    if not target.strip():
        return []
    max_len = _parse_int(cfg.get("max_target_len"))
    if max_len is None or max_len <= 0:
        return []
    if len(target) <= max_len:
        return []
    file_path, location, segment_id = _segment_fields(segment)
    return [
        Diagnostic(
            severity="ERROR",
            category="VALIDATION",
            code="E_TARGET_TOO_LONG",
            message=f"Target length {len(target)} exceeds max {max_len}.",
            file_path=file_path,
            location=location,
            segment_id=segment_id,
        )
    ]


def _apply_max_expansion_ratio(segment: dict[str, object], cfg: dict[str, object]) -> list[Diagnostic]:
    source = str(segment.get("source") or "")
    target = str(segment.get("target") or "")
    if not target.strip() or not source.strip():
        return []
    max_ratio = _parse_float(cfg.get("max_expansion_ratio"))
    if max_ratio is None or max_ratio <= 0:
        return []
    if len(target) <= int(len(source) * max_ratio):
        return []
    file_path, location, segment_id = _segment_fields(segment)
    return [
        Diagnostic(
            severity="WARNING",
            category="VALIDATION",
            code="W_TARGET_EXPANSION",
            message=f"Target length {len(target)} is > {max_ratio}x source length {len(source)}.",
            file_path=file_path,
            location=location,
            segment_id=segment_id,
        )
    ]


def _apply_forbidden_chars(segment: dict[str, object], cfg: dict[str, object]) -> list[Diagnostic]:
    target = str(segment.get("target") or "")
    if not target.strip():
        return []
    forbidden_chars = _rule_list(cfg.get("forbidden_chars"))
    if not forbidden_chars:
        return []
    found = sorted({c for c in forbidden_chars if c and c in target})
    if not found:
        return []
    file_path, location, segment_id = _segment_fields(segment)
    return [
        Diagnostic(
            severity="ERROR",
            category="VALIDATION",
            code="E_FORBIDDEN_CHAR",
            message=f"Target contains forbidden characters: {found}",
            file_path=file_path,
            location=location,
            segment_id=segment_id,
        )
    ]


def _apply_forbidden_regexes(segment: dict[str, object], cfg: dict[str, object]) -> list[Diagnostic]:
    target = str(segment.get("target") or "")
    if not target.strip():
        return []
    for rex in _rule_list(cfg.get("forbidden_regexes")):
        try:
            rx = re.compile(rex)
        except Exception:
            continue
        if rx.search(target):
            file_path, location, segment_id = _segment_fields(segment)
            return [
                Diagnostic(
                    severity="ERROR",
                    category="VALIDATION",
                    code="E_FORBIDDEN_PATTERN",
                    message=f"Target matches forbidden pattern: {rex}",
                    file_path=file_path,
                    location=location,
                    segment_id=segment_id,
                )
            ]
    return []


def _apply_preserve_whitespace(segment: dict[str, object], cfg: dict[str, object]) -> list[Diagnostic]:
    source = str(segment.get("source") or "")
    target = str(segment.get("target") or "")
    if not target.strip():
        return []
    if not _bool(cfg.get("preserve_whitespace"), True):
        return []
    if (source.startswith(" ") != target.startswith(" ")) or (source.endswith(" ") != target.endswith(" ")):
        file_path, location, segment_id = _segment_fields(segment)
        return [
            Diagnostic(
                severity="WARNING",
                category="VALIDATION",
                code="W_WHITESPACE_CHANGED",
                message="Leading/trailing whitespace differs between source and target.",
                file_path=file_path,
                location=location,
                segment_id=segment_id,
            )
        ]
    return []


_RULES: list[Rule] = [
    Rule("placeholder_parity", _apply_placeholder_parity, default_enabled=True),
    Rule("token_regexes", _apply_token_regexes, default_enabled=True),
    Rule("max_target_len", _apply_max_target_len, default_enabled=False),
    Rule("max_expansion_ratio", _apply_max_expansion_ratio, default_enabled=False),
    Rule("forbidden_chars", _apply_forbidden_chars, default_enabled=False),
    Rule("forbidden_regexes", _apply_forbidden_regexes, default_enabled=False),
    Rule("preserve_whitespace", _apply_preserve_whitespace, default_enabled=True),
]


def validate_segment(
    *,
    segment: dict[str, object],
    glossary_entries: list[dict[str, object]] | None = None,
    rules: dict[str, object] | None = None,
) -> list[Diagnostic]:
    cfg_root = dict(rules or {})
    enabled = _enabled_rules(cfg_root)
    diagnostics: list[Diagnostic] = []

    for rule in _RULES:
        if enabled is not None and rule.rule_id not in enabled:
            continue
        if enabled is None and not rule.default_enabled and rule.rule_id not in cfg_root and "rules" not in cfg_root:
            continue
        cfg = _rule_config(cfg_root, rule.rule_id)
        if rule.rule_id == "token_regexes" and not _rule_list(cfg.get("token_regexes")):
            continue
        diagnostics.extend(rule.apply(segment, cfg))

    try:
        from jpe_sims4.plugins import plugins

        reg = plugins().load()
        for fn in reg.validators:
            for obj in list(fn(segment) or []):
                d = _normalize_diag(obj, segment=segment, default_category="PLUGIN")
                if d is not None:
                    diagnostics.append(d)
    except Exception:
        pass

    if glossary_entries:
        try:
            from jpe_sims4.glossary import validate_segment_glossary

            for obj in list(validate_segment_glossary(segment=segment, glossary_entries=glossary_entries) or []):
                d = _normalize_diag(obj, segment=segment, default_category="GLOSSARY")
                if d is not None:
                    diagnostics.append(d)
        except Exception:
            pass

    normalized: list[Diagnostic] = []
    for obj in diagnostics:
        d = _normalize_diag(obj, segment=segment, default_category=str(getattr(obj, "category", "") or "VALIDATION"))
        if d is not None:
            normalized.append(d)
    return normalized


def validate_project_segments(
    segments: list[dict[str, object]],
    *,
    glossary_entries: list[dict[str, object]] | None = None,
    rules: dict[str, object] | None = None,
) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    for s in segments:
        diagnostics.extend(validate_segment(segment=s, glossary_entries=glossary_entries, rules=rules))
    return diagnostics


__all__ = ["extract_placeholders", "validate_project_segments", "validate_segment"]

