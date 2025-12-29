from __future__ import annotations

from pathlib import Path

import pytest

from jpe_studio_qt.assets_inventory import parse_code_html, scan_assets_folder


def _assets_root() -> Path:
    return Path(__file__).resolve().parents[1] / "JPE assets folder"


def test_assets_folder_scan_smoke() -> None:
    root = _assets_root()
    if not root.exists():
        pytest.skip("JPE assets folder not present in this environment")
    assets = scan_assets_folder(root)
    assert assets, "expected at least one asset spec"
    assert any(a.screen_png for a in assets), "expected at least one screen.png reference"


def test_parse_tailwind_colors_smoke() -> None:
    root = _assets_root()
    if not root.exists():
        pytest.skip("JPE assets folder not present in this environment")
    html = root / "dual-pane_jpe" / "xml_editor_1" / "code.html"
    parsed = parse_code_html(html)
    colors = parsed.get("tailwind_colors") or {}
    assert isinstance(colors, dict)
    assert "primary" in colors
    assert colors["primary"].startswith("#")

