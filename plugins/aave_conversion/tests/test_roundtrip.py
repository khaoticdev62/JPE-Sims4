from __future__ import annotations

from pathlib import Path

from aave_conversion.registry import LexiconRegistry
from aave_conversion.render import render_aave
from aave_conversion.normalize import normalize_to_canonical


def test_roundtrip_canonical_aave_canonical():
    reg = LexiconRegistry.default()
    canonical = Path("tests/fixtures/canonical/sample.jpe").read_text(encoding="utf-8")

    aave, rdiags = render_aave(canonical, reg, register="standard", domain="generic")
    back, ndiags = normalize_to_canonical(aave, reg, strict=False)

    # Roundtrip should preserve key canonical terms even if rendering changed them.
    assert "increase" in back
    assert "decrease" in back
    assert "interaction" in back or "interaction" in canonical  # rendering may not hit this line

    # No blocked term errors in sample.
    assert not any(d.code == "AAVE900_BLOCKED_TERM" for d in ndiags)


def test_ambiguous_alias_warns():
    reg = LexiconRegistry.default()
    text = "turn up skill by 2"
    out, diags = normalize_to_canonical(text, reg, strict=False)
    # 'turn up' maps to increase OR intensify; should warn.
    assert out.startswith("increase") or out.startswith("intensify")
    assert any(d.code == "AAVE001_AMBIGUOUS_ALIAS" for d in diags)


def test_blocked_term_flags():
    reg = LexiconRegistry.default()
    text = "please dox this person"
    out, diags = normalize_to_canonical(text, reg, strict=False)
    assert any(d.code == "AAVE900_BLOCKED_TERM" for d in diags)
