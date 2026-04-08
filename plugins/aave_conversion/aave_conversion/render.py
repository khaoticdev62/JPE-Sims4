from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .diagnostics import Diagnostic, DiagSeverity, Span
from .registry import LexiconRegistry


DEFAULT_LOCKED_TOKEN_TYPES = {"keyword"}


def render_aave(
    canonical_text: str,
    registry: LexiconRegistry,
    *,
    register: str = "standard",
    domain: str = "generic",
    preserve_keywords: bool = True,
) -> tuple[str, list[Diagnostic]]:
    """Render canonical JPE into AAVE-ish JPE.

    This is a **postprocess** transformation. It should never break canonical parsing.
    We default to preserving keywords (and any entry marked locked).
    """
    diags: list[Diagnostic] = []
    text = canonical_text

    # Find canonical matches and replace from end → start to preserve spans.
    matches = registry.match_canonicals(text)
    # De-dup overlaps by taking longest (already greedy) and then sort by span.
    matches.sort(key=lambda m: (m.start_char, -(m.end_char - m.start_char)))

    replacements: list[tuple[int, int, str, str]] = []  # start,end,repl,canonical
    for m in matches:
        e = m.entry
        if preserve_keywords and (e.token_type in DEFAULT_LOCKED_TOKEN_TYPES or e.locked):
            continue
        if domain not in e.domains and "generic" not in e.domains:
            # Domain mismatch: skip quietly
            continue
        options = e.aliases.get(register) or e.aliases.get("standard") or []
        if not options:
            continue
        repl = options[0]
        replacements.append((m.start_char, m.end_char, repl, e.canonical))

    # Apply replacements back-to-front to avoid shifting indices
    out = text
    for s, e, repl, canon in sorted(replacements, key=lambda x: x[0], reverse=True):
        out = out[:s] + repl + out[e:]
        diags.append(
            Diagnostic(
                code="AAVE200_REPLACED",
                severity=DiagSeverity.INFO,
                message=f"Rendered '{canon}' as '{repl}'.",
                span=Span(s, s + len(repl)),
                metadata={
                    "canonical": canon,
                    "rendered": repl,
                    "register": register,
                    "domain": domain,
                },
            )
        )

    # Apply phrase rewrite rules after token substitution
    out = registry.rule_engine.process(out, domain=domain)

    return out, diags
