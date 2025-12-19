"""Design system tokens for JPE Studio Qt - Complete design token definitions.

This module provides all design tokens for the JPE Studio design system:
- Color tokens (backgrounds, surfaces, text, accents, status)
- Typography tokens (font families, text styles)
- Spacing tokens (4px base grid)
- Radius tokens (border radius scale)
- Shadow tokens (shadows and glow effects)

All components should import from this module to ensure design consistency.
"""

from __future__ import annotations
from dataclasses import dataclass


@dataclass(frozen=True)
class ColorTokens:
    """Design system color tokens - JPE Studio brand palette.

    Color philosophy:
    - Deep purple-black backgrounds (#110B1B → #191024)
    - Purple-tinted surfaces (#251A3A → #2A1C40)
    - Neon purple accent (#9D5CFF with variants)
    - Soft white text with blue-grey secondaries
    - Muted status colors for dark UI
    """

    # Backgrounds (deep purple-black progression)
    bg_0: str = "#110B1B"  # Deepest purple-black (app background)
    bg_1: str = "#191024"  # Secondary background (slightly lighter)

    # Surfaces (glassmorphism panels)
    surface_0: str = "#251A3A"  # Card/dialog base
    surface_1: str = "#2A1C40"  # Raised panel / hover state

    # Strokes (borders and dividers)
    stroke_0: str = "rgba(148,163,184,0.14)"  # Subtle borders
    stroke_1: str = "rgba(148,163,184,0.24)"  # Emphasized borders

    # Text hierarchy
    text_primary: str = "#F5F5F8"      # Primary text (soft white)
    text_secondary: str = "#94A3B8"    # Secondary text (blue-grey)
    text_tertiary: str = "#64748B"     # Tertiary text (dimmer)
    text_disabled: str = "#475569"     # Disabled state

    # Accent (neon purple)
    accent_primary: str = "#9D5CFF"              # Primary neon purple
    accent_hover: str = "#B584FF"                # Lighter on hover
    accent_pressed: str = "#8638FA"              # Darker when pressed
    accent_glow: str = "rgba(157,92,255,0.25)"   # Glow/aura effect
    accent_bg: str = "rgba(157,92,255,0.12)"     # Background tint

    # Status colors (muted for dark UI)
    success: str = "#22C55E"           # Green
    success_bg: str = "rgba(34,197,94,0.12)"

    error: str = "#EF4444"             # Red
    error_bg: str = "rgba(239,68,68,0.12)"

    warning: str = "#E5940C"           # Amber
    warning_bg: str = "rgba(229,148,12,0.12)"

    info: str = "#60A5FA"              # Blue
    info_bg: str = "rgba(96,165,250,0.12)"

    # Glassmorphism overlays
    glass_overlay: str = "rgba(37,26,58,0.85)"   # For modals/dialogs
    glass_border: str = "rgba(157,92,255,0.15)"  # Glass edge glow


@dataclass(frozen=True)
class TypographyTokens:
    """Typography scale and font families.

    Font families:
    - Inter: UI text (system fallback if unavailable)
    - JetBrains Mono: Code/monospace

    Text styles format: (font_size_pt, font_weight, line_height_multiplier)
    """

    # Font families
    ui_font: str = "Inter"           # UI text (system fallback if unavailable)
    code_font: str = "JetBrains Mono"  # Code/monospace

    # Text styles (size, weight, line-height)
    # Format: (font_size_pt, font_weight, line_height_multiplier)

    title_xl: tuple = (28, 700, 1.3)    # Screen titles
    title_l: tuple = (22, 600, 1.3)     # Section titles
    title_m: tuple = (16, 600, 1.4)     # Card titles
    title_s: tuple = (14, 600, 1.4)     # Small headings

    body_l: tuple = (15, 400, 1.5)      # Large body text
    body: tuple = (13, 400, 1.5)        # Default body
    body_s: tuple = (12, 400, 1.5)      # Small body

    caption: tuple = (11, 500, 1.4)     # Captions/labels
    caption_s: tuple = (10, 500, 1.3)   # Tiny labels

    mono_body: tuple = (13, 400, 1.6)   # Code blocks
    mono_caption: tuple = (11, 400, 1.5) # Inline code


@dataclass(frozen=True)
class SpacingTokens:
    """Spacing scale (4px base unit).

    Use these values for margins, padding, and gaps.
    Based on 4px grid system.
    """

    xxs: int = 4    # Tight spacing
    xs: int = 8     # Small spacing
    sm: int = 12    # Medium-small
    md: int = 16    # Medium (default)
    lg: int = 24    # Large
    xl: int = 32    # Extra large
    xxl: int = 48   # Huge spacing
    xxxl: int = 64  # Massive spacing


@dataclass(frozen=True)
class RadiusTokens:
    """Border radius scale.

    Use larger radii for the JPE brand aesthetic (16-20px typical).
    """

    sm: int = 10    # Small rounded
    md: int = 14    # Medium rounded
    lg: int = 18    # Large rounded
    xl: int = 24    # Extra large rounded
    pill: int = 9999  # Fully rounded (pills/badges)


@dataclass(frozen=True)
class ShadowTokens:
    """Shadow and glow effects.

    Shadows use QSS box-shadow format.
    Glows are for QGraphicsDropShadowEffect parameters.
    """

    # Shadows (QSS format)
    shadow_soft: str = "0px 12px 40px rgba(0,0,0,0.55)"
    shadow_panel: str = "0px 8px 24px rgba(0,0,0,0.35)"
    shadow_button: str = "0px 4px 12px rgba(0,0,0,0.25)"

    # Glow effects (for QGraphicsDropShadowEffect)
    glow_accent_blur: int = 28
    glow_accent_color: str = "rgba(157,92,255,0.18)"
    glow_accent_spread: float = 0.25

    # Focus ring
    focus_blur: int = 4
    focus_color: str = "rgba(157,92,255,0.5)"
    focus_spread: float = 1.0


# Global singleton instances for easy import
COLORS = ColorTokens()
TYPOGRAPHY = TypographyTokens()
SPACING = SpacingTokens()
RADIUS = RadiusTokens()
SHADOWS = ShadowTokens()


# Legacy compatibility - these were used in existing components
class DesignSystemColors:
    """Legacy color interface for backward compatibility with existing components."""

    def __init__(self):
        self.background = COLORS.bg_0
        self.surface = COLORS.surface_0
        self.primary = COLORS.accent_primary
        self.primary_hover = COLORS.accent_hover
        self.primary_bg = COLORS.accent_bg
        self.text = COLORS.text_primary
        self.text_muted = COLORS.text_secondary
        self.text_secondary = COLORS.text_secondary
        self.text_tertiary = COLORS.text_tertiary
        self.success = COLORS.success
        self.success_bg = COLORS.success_bg
        self.error = COLORS.error
        self.error_bg = COLORS.error_bg
        self.warning = COLORS.warning
        self.warning_bg = COLORS.warning_bg
        self.info = COLORS.info
        self.info_bg = COLORS.info_bg
        # Additional attributes for backward compatibility
        self.surface_hover = COLORS.surface_1
        self.surface_active = COLORS.accent_bg
        self.code_primary_bg = COLORS.bg_1
        self.code_output_bg = COLORS.bg_1
        self.stroke = COLORS.stroke_0
        self.stroke_hover = COLORS.stroke_1


class DesignSystemSpacing:
    """Legacy spacing interface for backward compatibility."""

    def __init__(self):
        self.xxs = SPACING.xxs
        self.xs = SPACING.xs
        self.sm = SPACING.sm
        self.md = SPACING.md
        self.lg = SPACING.lg
        self.xl = SPACING.xl
        self.xxl = SPACING.xxl


class DesignSystemTypography:
    """Legacy typography interface for backward compatibility."""

    def __init__(self):
        self.icon_font = TYPOGRAPHY.code_font


class DesignSystem:
    """Legacy design system interface for backward compatibility with existing code."""

    def __init__(self):
        self.colors = DesignSystemColors()
        self.spacing = DesignSystemSpacing()
        self.radius = RADIUS  # Add radius tokens for backward compatibility
        self.typography = DesignSystemTypography()  # Add typography tokens


# Global DESIGN instance for legacy compatibility
DESIGN = DesignSystem()


# Helper functions for font stacks
def ui_font_stack() -> str:
    """Get the complete UI font stack with fallbacks."""
    fonts = ["Inter", "Segoe UI", "Arial"]
    return ", ".join([f'"{f}"' if " " in f else f for f in fonts])


def mono_font_stack() -> str:
    """Get the complete monospace font stack with fallbacks."""
    fonts = ["JetBrains Mono", "Cascadia Mono", "Consolas", "Courier New"]
    return ", ".join([f'"{f}"' if " " in f else f for f in fonts])
