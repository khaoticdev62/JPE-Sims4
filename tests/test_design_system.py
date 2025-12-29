from __future__ import annotations

from jpe_studio_qt.design_system import DESIGN, mono_font_stack, ui_font_stack


def test_design_tokens_have_expected_roles() -> None:
    c = DESIGN.colors
    assert c.background.startswith("#")
    assert c.primary.startswith("#")
    assert c.code_primary_bg.startswith("#")


def test_font_stacks_are_strings() -> None:
    assert isinstance(ui_font_stack(), str)
    assert isinstance(mono_font_stack(), str)
    assert "Inter" in ui_font_stack()

