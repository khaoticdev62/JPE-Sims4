from __future__ import annotations

from collections import defaultdict

from .diagnostics import Diagnostic, DiagSeverity, Span
from .registry import LexiconRegistry


def normalize_to_canonical(
    input_text: str,
    registry: LexiconRegistry,
    *,
    strict: bool = True,
) -> tuple[str, list[Diagnostic]]:
    """Normalize AAVE-ish JPE into canonical JPE.

    This is a **preparse** transformation. It aims to be deterministic:
    - Longest-match alias tokenization
    - Ambiguity produces diagnostics (error in strict mode, warn otherwise)
    """
    diags: list[Diagnostic] = []

    # Blocked term scan first
    for term, span in registry.find_blocked(input_text):
        diags.append(
            Diagnostic(
                "AAVE900_BLOCKED_TERM",
                DiagSeverity.ERROR if strict else DiagSeverity.WARNING,
                f"Blocked term encountered: '{term}'",
                span=span,
                hint="Remove or replace this term before compiling.",
            )
        )

    matches = registry.match_aliases(input_text)
    if not matches:
        # Nothing to normalize
        return input_text, diags

    # Group matches by exact span; multiple entries => ambiguity.
    by_span: dict[tuple[int, int], list] = defaultdict(list)
    for m in matches:
        by_span[(m.start_char, m.end_char)].append(m)

    # Decide replacements
    replacements: list[tuple[int, int, str, dict]] = []
    for (s, e), group in by_span.items():
        if len(group) == 1:
            m = group[0]
            replacements.append(
                (s, e, m.entry.canonical, {"reversible_key": m.entry.reversible_key})
            )
            continue

        # Ambiguous alias: choose the most popular entry, but diagnose
        group_sorted = sorted(group, key=lambda m: m.entry.popularity, reverse=True)
        chosen = group_sorted[0]
        candidates = [
            {
                "canonical": m.entry.canonical,
                "reversible_key": m.entry.reversible_key,
                "popularity": m.entry.popularity,
            }
            for m in group_sorted
        ]
        diags.append(
            Diagnostic(
                "AAVE001_AMBIGUOUS_ALIAS",
                DiagSeverity.ERROR if strict else DiagSeverity.WARNING,
                f"Alias '{input_text[s:e]}' is ambiguous; normalized to '{chosen.entry.canonical}'.",
                span=Span(s, e),
                hint="Choose a more specific phrase or use canonical wording.",
                metadata={"candidates": candidates},
            )
        )
        replacements.append(
            (s, e, chosen.entry.canonical, {"ambiguous": True, "candidates": candidates})
        )

    out = input_text
    sorted_replacements = sorted(replacements, key=lambda x: x[0], reverse=True)
    for s, e, repl, meta in sorted_replacements:
        out = out[:s] + repl + out[e:]

    # Apply phrase rewrite rules after token substitution
    out = registry.rule_engine.process(out)

    # If strict and any ERROR diags, still return normalized output (useful for editor quick-fix),
    # but caller should treat errors as build-blocking.
    return out, diags
