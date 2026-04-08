from __future__ import annotations

from pathlib import Path

from aave_conversion.pack import load_pack


def test_pack_loads_cleanly():
    p = Path("aave_conversion/dictionary/core.pack.yaml")
    pack, diags = load_pack(p)
    assert pack is not None
    # no fatal errors
    assert not any(d.severity.value == "error" for d in diags)
