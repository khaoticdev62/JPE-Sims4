from __future__ import annotations

from .diagnostics import Diagnostic, DiagSeverity
from .normalize import normalize_to_canonical
from .registry import LexiconRegistry


def lint_aave(text: str, registry: LexiconRegistry, *, strict: bool = False) -> list[Diagnostic]:
    """Lint AAVE-ish JPE. Primarily checks for ambiguity + blocked terms."""
    _, diags = normalize_to_canonical(text, registry, strict=strict)

    # Add additional heuristics here (register too heavy, domain mismatch, etc.)
    # For now, normalization diagnostics are the lint diagnostics.

    # Convert INFO "replaced" doesn't exist here; only warnings/errors show.
    return [d for d in diags if d.severity in (DiagSeverity.WARNING, DiagSeverity.ERROR)]
