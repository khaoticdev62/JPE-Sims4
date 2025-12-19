from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ColorTokens:
    # Shared desktop dark base (Stitch reference).
    background: str = "#170f23"
    surface: str = "#181023"
    surface_lighter: str = "#231b30"
    surface_active: str = "#31214a"
    surface_hover: str = "#36274a"
    border: str = "#472f6a"

    # Brand + states - CRITICAL FIX: Use #8638fa (Stitch), NOT #9d5cff
    primary: str = "#8638fa"  # Deep purple from Stitch designs
    primary_hover: str = "#9d5cff"  # Lighter variant
    primary_light: str = "#b584ff"  # For disabled states
    success: str = "#22c55e"
    warning: str = "#eab308"
    error: str = "#ef4444"
    info: str = "#4cc9f0"  # Info/blue state

    # Text.
    text: str = "#ffffff"
    text_muted: str = "rgba(255,255,255,0.55)"
    text_secondary: str = "#a78ecc"  # Purple-tinted muted text
    text_tertiary: str = "#6b5885"  # Darker muted

    # Badge backgrounds.
    primary_bg: str = "rgba(134, 56, 250, 0.15)"  # Updated for #8638fa
    success_bg: str = "rgba(34, 197, 94, 0.10)"
    warning_bg: str = "rgba(234, 179, 8, 0.10)"
    error_bg: str = "rgba(239, 68, 68, 0.10)"
    info_bg: str = "rgba(76, 201, 240, 0.10)"

    # Shadows (updated for #8638fa primary).
    shadow_sm: str = "0 2px 8px rgba(134, 56, 250, 0.15)"
    shadow_md: str = "0 4px 16px rgba(134, 56, 250, 0.20)"
    shadow_lg: str = "0 10px 24px rgba(134, 56, 250, 0.25)"
    shadow_fab: str = "0 6px 20px rgba(134, 56, 250, 0.40)"

    # Glass-morphism overlays (new).
    glass_overlay: str = "rgba(23, 15, 35, 0.7)"
    glass_border: str = "rgba(134, 56, 250, 0.2)"

    # Neon shadow colors (new).
    neon_shadow: str = "rgba(134, 56, 250, 0.5)"
    neon_shadow_strong: str = "rgba(134, 56, 250, 0.8)"

    # Code panes (dual-pane editor).
    code_primary_bg: str = "#130d1c"
    code_output_bg: str = "#0d0914"


@dataclass(frozen=True)
class TypographyTokens:
    # Assets use Inter + JetBrains Mono + Material Symbols.
    ui_font: str = "Inter"
    ui_fallback: tuple[str, ...] = ("Segoe UI",)
    mono_font: str = "JetBrains Mono"
    mono_fallback: tuple[str, ...] = ("Cascadia Mono", "Consolas")
    icon_font: str = "Material Symbols Outlined"


@dataclass(frozen=True)
class RadiusTokens:
    # Stitch uses minimal border radius (2px-16px)
    sm: int = 2
    md: int = 4
    lg: int = 8
    xl: int = 16
    pill: int = 999


@dataclass(frozen=True)
class SpacingTokens:
    xxs: int = 4  # Extra tight spacing
    xs: int = 8  # Updated from 6
    sm: int = 10
    md: int = 14
    lg: int = 18
    xl: int = 24


@dataclass(frozen=True)
class AnimationTokens:
    transition_fast: str = "150ms cubic-bezier(0.4, 0, 0.2, 1)"
    transition_base: str = "200ms cubic-bezier(0.4, 0, 0.2, 1)"
    transition_slow: str = "300ms cubic-bezier(0.4, 0, 0.2, 1)"


@dataclass(frozen=True)
class DesignSystem:
    colors: ColorTokens = ColorTokens()
    typography: TypographyTokens = TypographyTokens()
    radius: RadiusTokens = RadiusTokens()
    spacing: SpacingTokens = SpacingTokens()
    animation: AnimationTokens = AnimationTokens()


DESIGN = DesignSystem()


def ui_font_stack() -> str:
    t = DESIGN.typography
    parts = [t.ui_font, *t.ui_fallback]
    quoted = [f"\"{p}\"" if " " in p else p for p in parts]
    return ", ".join(quoted)


def mono_font_stack() -> str:
    t = DESIGN.typography
    parts = [t.mono_font, *t.mono_fallback]
    quoted = [f"\"{p}\"" if " " in p else p for p in parts]
    return ", ".join(quoted)

