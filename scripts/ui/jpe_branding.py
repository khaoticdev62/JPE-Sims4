"""JPE Branding System - Constants and Styling for Boot Checklist and UI.

This module defines the official JPE branding colors, typography, and visual
identity constants as specified in the JPE Branding PRD and Style Guide.

All boot checklist components should use these constants to maintain consistent
branding across all interfaces (desktop, mobile, cloud).
"""

from typing import Dict, Tuple

# ============================================================================
# VERSION INFORMATION
# ============================================================================

BRANDING_VERSION = "1.0.0"
"""Official branding version. Bump when colors, logo, or typography changes."""

TAGLINE = "Read, write, and fix Sims 4 mods in Just Plain English."
"""Official JPE tagline for use in about dialogs and documentation."""

LEGAL_NOTICE = (
    "JPE Sims 4 Mod Translation Suite is an independent tool and is not "
    "endorsed by or affiliated with Electronic Arts Inc. or its licensors."
)
"""Legal compliance notice for all About dialogs and documentation."""

# ============================================================================
# PRIMARY BRAND PALETTE
# ============================================================================

BRAND_ACCENT = "#2EC4B6"
"""Brand accent color used for primary buttons, highlights, and JPE mark.
Teal/turquoise color - distinct from Sims 4 colors."""

BRAND_DARK = "#151A24"
"""Dark background color for header bars and dark UI contexts.
Near-black with slight blue tint for sophistication."""

BRAND_LIGHT = "#F5F7FA"
"""Light background color for documentation, containers, and light contexts.
Slightly blue-tinted off-white for elegance."""

# ============================================================================
# DIAGNOSTICS PALETTE
# ============================================================================
# Each severity level uses a distinct hue and shape for accessibility.
# Never rely on color alone - always combine with text labels and icon shapes.

DIAGNOSTIC_ERROR = "#E12D39"
"""Error severity color - strong stop color for critical issues.
Used with error icon shape (circle or diamond with X)."""

DIAGNOSTIC_WARNING = "#F5A623"
"""Warning severity color - caution color for compatibility issues.
Used with warning icon shape (triangle with exclamation)."""

DIAGNOSTIC_INFO = "#2680C2"
"""Info severity color - calm neutral for informational messages.
Used with info icon shape (circle with 'i')."""

DIAGNOSTIC_SUCCESS = "#2E8540"
"""Success severity color - go color for positive confirmations.
Used with success icon shape (circle or badge with checkmark)."""

# ============================================================================
# NEUTRAL PALETTE
# ============================================================================
# Provides stable base for UI components and text.

NEUTRAL_900 = "#111111"
"""Darkest neutral - primary text color."""

NEUTRAL_700 = "#444444"
"""Dark neutral - secondary text and key UI boundaries."""

NEUTRAL_500 = "#777777"
"""Medium neutral - tertiary text and disabled elements."""

NEUTRAL_300 = "#B0B0B0"
"""Light neutral - borders and dividers."""

NEUTRAL_100 = "#F0F0F0"
"""Lightest neutral - backgrounds and surfaces."""

# ============================================================================
# COLOR PALETTE AS DICTIONARY
# ============================================================================

PALETTE: Dict[str, str] = {
    # Brand colors
    "accent": BRAND_ACCENT,
    "brand_dark": BRAND_DARK,
    "brand_light": BRAND_LIGHT,

    # Diagnostic colors
    "error": DIAGNOSTIC_ERROR,
    "warning": DIAGNOSTIC_WARNING,
    "info": DIAGNOSTIC_INFO,
    "success": DIAGNOSTIC_SUCCESS,

    # Neutral colors
    "neutral_900": NEUTRAL_900,
    "neutral_700": NEUTRAL_700,
    "neutral_500": NEUTRAL_500,
    "neutral_300": NEUTRAL_300,
    "neutral_100": NEUTRAL_100,

    # Aliases for clarity
    "text_primary": NEUTRAL_900,
    "text_secondary": NEUTRAL_700,
    "text_tertiary": NEUTRAL_500,
    "border": NEUTRAL_300,
    "background": BRAND_LIGHT,
    "background_dark": BRAND_DARK,
}

# ============================================================================
# TYPOGRAPHY SPECIFICATIONS
# ============================================================================

# Platform-specific font specifications per Branding Style Guide

FONTS_WINDOWS = "Segoe UI"
"""Primary UI font for Windows desktop applications."""

FONTS_MACOS = "SF Pro Display"
"""Primary UI font for macOS applications."""

FONTS_LINUX = "Ubuntu"
"""Primary UI font for Linux desktop applications."""

FONTS_WEB = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
"""System font stack for web and cloud UIs."""

FONTS_MONO = "Consolas, Menlo, monospace"
"""Monospace font for code samples and IR representations."""

# Font sizes (in pixels) for screen UI
FONT_SIZE_H1 = 20
"""Primary heading size."""

FONT_SIZE_H2 = 16
"""Secondary heading size."""

FONT_SIZE_H3 = 14
"""Tertiary heading size."""

FONT_SIZE_BODY = 13
"""Primary body text size."""

FONT_SIZE_SMALL = 11
"""Secondary label size."""

FONT_SIZE_MONO = 12
"""Code sample size."""

# ============================================================================
# BOOT CHECKLIST SPECIFIC STYLING
# ============================================================================

class BootChecklistStyle:
    """Style constants specific to the boot checklist display."""

    # Window styling
    WINDOW_BG = BRAND_LIGHT
    WINDOW_WIDTH = 700
    WINDOW_HEIGHT = 600
    WINDOW_TITLE = "JPE Sims 4 Mod Translator - Starting..."

    # Header styling
    HEADER_BG = BRAND_LIGHT
    HEADER_FG = BRAND_DARK
    HEADER_FONT_SIZE = FONT_SIZE_H1

    # Subtitle styling
    SUBTITLE_FG = NEUTRAL_700
    SUBTITLE_FONT_SIZE = FONT_SIZE_SMALL

    # Status symbols with proper accessibility
    # Combine shapes AND colors - never rely on color alone
    STATUS_SYMBOLS = {
        "pending": "○",      # Hollow circle (neutral)
        "checking": "◐",     # Half circle (in progress)
        "success": "✓",      # Checkmark (clear success)
        "warning": "⚠",      # Triangle exclamation (caution)
        "error": "✗",        # X mark (stop)
    }

    # Status colors - always paired with symbol and text label
    STATUS_COLORS = {
        "pending": NEUTRAL_500,
        "checking": DIAGNOSTIC_WARNING,
        "success": DIAGNOSTIC_SUCCESS,
        "warning": DIAGNOSTIC_WARNING,
        "error": DIAGNOSTIC_ERROR,
    }

    # Item styling
    ITEM_BG = "white"
    ITEM_PADDING = 8
    ITEM_SPACING = 5
    ITEM_FONT_SIZE = FONT_SIZE_BODY

    # Message styling
    MESSAGE_FONT_SIZE = FONT_SIZE_SMALL
    MESSAGE_COLOR = NEUTRAL_700

    # Progress bar styling
    PROGRESS_COLOR = BRAND_ACCENT
    PROGRESS_BG = NEUTRAL_300

    # Status label styling
    STATUS_LABEL_COLOR = NEUTRAL_700
    STATUS_LABEL_FONT_SIZE = FONT_SIZE_SMALL

    # Timing display styling
    TIMING_COLOR = NEUTRAL_500
    TIMING_FONT_SIZE = FONT_SIZE_SMALL

    # Clear space (minimum spacing around logo)
    # Equal to height of "J" in JPE wordmark
    LOGO_CLEAR_SPACE = 30


class InstallerChecklistStyle:
    """Style constants specific to the installer checklist."""

    WINDOW_BG = BRAND_LIGHT
    HEADER_BG = BRAND_LIGHT
    HEADER_FG = BRAND_DARK
    ITEM_BG = "white"
    PROGRESS_COLOR = BRAND_ACCENT
    STATUS_LABEL_COLOR = NEUTRAL_700

    STATUS_SYMBOLS = BootChecklistStyle.STATUS_SYMBOLS
    STATUS_COLORS = BootChecklistStyle.STATUS_COLORS


class StartupScreenStyle:
    """Style constants specific to the startup screen."""

    WINDOW_BG = BRAND_LIGHT
    WINDOW_WIDTH = 700
    WINDOW_HEIGHT = 600

    TITLE_TEXT = "JPE Sims 4 Mod Translator"
    TITLE_COLOR = BRAND_ACCENT
    TITLE_FONT_SIZE = FONT_SIZE_H1

    SUBTITLE_TEXT = "Initializing application..."
    SUBTITLE_COLOR = NEUTRAL_700
    SUBTITLE_FONT_SIZE = FONT_SIZE_SMALL

    HEADER_BG = BRAND_LIGHT
    HEADER_PADDING = (30, 20)

    CHECKLIST_BG = "white"
    PROGRESS_COLOR = BRAND_ACCENT


class InstallerStyle:
    """Style constants specific to the enhanced installer wizard."""

    WINDOW_WIDTH = 750
    WINDOW_HEIGHT = 650

    # Header styling
    HEADER_BG = BRAND_LIGHT
    HEADER_PADDING = (20, 20)

    TITLE_TEXT = "JPE Sims 4 Mod Translator"
    TITLE_COLOR = BRAND_ACCENT
    TITLE_FONT_SIZE = FONT_SIZE_H1

    SUBTITLE_COLOR = NEUTRAL_700
    SUBTITLE_FONT_SIZE = FONT_SIZE_SMALL

    # Page styling
    PAGE_BG = "white"
    PAGE_PADDING = (30, 20)

    # Button styling
    BUTTON_ACCENT_COLOR = BRAND_ACCENT
    BUTTON_TEXT_COLOR = "white"

    # Content styling
    CONTENT_BG = "white"
    CONTENT_PADDING = (20, 20)


# ============================================================================
# DIAGNOSTIC ICONS
# ============================================================================
# As specified in Icon System PRD: shapes + colors + text labels
# Never use color alone to indicate severity

DIAGNOSTIC_ICONS = {
    "error": {
        "symbol": "✗",
        "color": DIAGNOSTIC_ERROR,
        "shape": "circle",
        "label": "ERROR",
    },
    "warning": {
        "symbol": "⚠",
        "color": DIAGNOSTIC_WARNING,
        "shape": "triangle",
        "label": "WARNING",
    },
    "info": {
        "symbol": "ℹ",
        "color": DIAGNOSTIC_INFO,
        "shape": "circle",
        "label": "INFO",
    },
    "success": {
        "symbol": "✓",
        "color": DIAGNOSTIC_SUCCESS,
        "shape": "circle",
        "label": "SUCCESS",
    },
}

# ============================================================================
# ACCESSIBILITY REQUIREMENTS
# ============================================================================

class AccessibilityRequirements:
    """Accessibility standards per Branding PRD section 8."""

    # Contrast ratios (WCAG AA minimum)
    MIN_CONTRAST_RATIO = 4.5

    # Icons must be distinguishable by shape AND color
    ICON_ALWAYS_HAS_LABEL = True
    ICON_ALWAYS_HAS_SHAPE = True

    # Logos never used as sole identifier
    TEXT_ALWAYS_ACCOMPANIES_LOGO = True

    # Diagnostic colors always paired with text labels
    DIAGNOSTIC_COLOR_NEVER_ALONE = True


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_status_color(status: str) -> str:
    """Get the diagnostic color for a status.

    Args:
        status: One of 'success', 'warning', 'error', 'checking', 'pending'

    Returns:
        Hex color code for the status.
    """
    return BootChecklistStyle.STATUS_COLORS.get(status, NEUTRAL_500)


def get_status_symbol(status: str) -> str:
    """Get the Unicode symbol for a status.

    Args:
        status: One of 'success', 'warning', 'error', 'checking', 'pending'

    Returns:
        Unicode symbol character.
    """
    return BootChecklistStyle.STATUS_SYMBOLS.get(status, "○")


def get_platform_font() -> str:
    """Get the appropriate font for the current platform.

    Returns:
        Font name appropriate for the platform.
    """
    import sys

    if sys.platform == "win32":
        return FONTS_WINDOWS
    elif sys.platform == "darwin":
        return FONTS_MACOS
    else:
        return FONTS_LINUX


def create_color_palette() -> Dict[str, str]:
    """Get the complete color palette as a dictionary.

    Returns:
        Dictionary of color name to hex value mappings.
    """
    return PALETTE.copy()


# ============================================================================
# EXPORT ALL CONSTANTS
# ============================================================================

__all__ = [
    # Version
    "BRANDING_VERSION",
    "TAGLINE",
    "LEGAL_NOTICE",

    # Brand palette
    "BRAND_ACCENT",
    "BRAND_DARK",
    "BRAND_LIGHT",

    # Diagnostic palette
    "DIAGNOSTIC_ERROR",
    "DIAGNOSTIC_WARNING",
    "DIAGNOSTIC_INFO",
    "DIAGNOSTIC_SUCCESS",

    # Neutral palette
    "NEUTRAL_900",
    "NEUTRAL_700",
    "NEUTRAL_500",
    "NEUTRAL_300",
    "NEUTRAL_100",

    # Palette dict
    "PALETTE",

    # Typography
    "FONTS_WINDOWS",
    "FONTS_MACOS",
    "FONTS_LINUX",
    "FONTS_WEB",
    "FONTS_MONO",
    "FONT_SIZE_H1",
    "FONT_SIZE_H2",
    "FONT_SIZE_H3",
    "FONT_SIZE_BODY",
    "FONT_SIZE_SMALL",
    "FONT_SIZE_MONO",

    # Style classes
    "BootChecklistStyle",
    "InstallerChecklistStyle",
    "StartupScreenStyle",
    "InstallerStyle",

    # Icons
    "DIAGNOSTIC_ICONS",

    # Accessibility
    "AccessibilityRequirements",

    # Functions
    "get_status_color",
    "get_status_symbol",
    "get_platform_font",
    "create_color_palette",
]
