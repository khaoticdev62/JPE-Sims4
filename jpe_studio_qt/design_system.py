"""Design system tokens for JPE Studio Qt - DEPRECATED

DEPRECATED: This module is deprecated. Use jpe_studio_qt.design_tokens instead.
Kept for backward compatibility with existing code that imports from this module.
"""

from __future__ import annotations

# Import from the new design_tokens module for backward compatibility
from jpe_studio_qt.design_tokens import (
    DESIGN,
    COLORS,
    SPACING,
    RADIUS,
    SHADOWS,
    TYPOGRAPHY,
    ColorTokens,
    TypographyTokens,
    SpacingTokens,
    RadiusTokens,
    ShadowTokens,
    mono_font_stack,
    ui_font_stack,
)

__all__ = [
    "DESIGN",
    "COLORS",
    "SPACING",
    "RADIUS",
    "SHADOWS",
    "TYPOGRAPHY",
    "ColorTokens",
    "TypographyTokens",
    "SpacingTokens",
    "RadiusTokens",
    "ShadowTokens",
    "mono_font_stack",
    "ui_font_stack",
]
