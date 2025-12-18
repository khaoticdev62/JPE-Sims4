from __future__ import annotations

from dataclasses import dataclass

from jpe_studio_qt.design_system import DESIGN

# ASCII-clean fallbacks (via unicode escapes) used when the Material Symbols font
# is not available. When the font is installed, Qt will render ligatures like
# "search" into icons and these fallbacks won't be shown.
_FALLBACK_GLYPHS: dict[str, str] = {
    "menu": "\u2630",  # ☰
    "search": "\U0001F50D",  # 🔍
    "handyman": "\U0001F6E0",  # 🛠
    "save": "\U0001F4BE",  # 💾
    "notifications": "\U0001F514",  # 🔔
    "delete": "\U0001F5D1",  # 🗑
    "ios_share": "\u21AA",  # ↪
    "arrow_back": "\u2190",  # ←
    "arrow_right": "\u2192",  # →
    "chevron_right": "\u203A",  # ›
    "folder_open": "\U0001F4C2",  # 📂
    "folder": "\U0001F4C1",  # 📁
    "translate": "\U0001F310",  # 🌐
    "bug_report": "\U0001F41B",  # 🐛
    "settings": "\u2699",  # ⚙
    "check_circle": "\u2714",  # ✔
    "warning": "\u26A0",  # ⚠
    "error": "\u2716",  # ✖
    "info": "i",
    "more_vert": "\u22EE",  # ⋮
    "add": "+",
    "play_arrow": "\u25B6",  # ▶
    "refresh": "\u27F3",  # ⟳
    "expand_more": "\u25BC",  # ▼
    "expand_less": "\u25B2",  # ▲
    "view_sidebar": "\u25A4",  # ▤
    "splitscreen": "\u21F5",  # ⇵
    "terminal": ">_",
    "difference": "\u2260",  # ≠
    "history": "\u23F2",  # ⏲
    "edit_document": "\u270E",  # ✎
    "deployed_code": "</>",
    "tune": "\u2637",  # ☷
    "cloud": "\u2601",  # ☁
    "analytics": "\u25A6",  # ▦
    "menu_book": "\u263C",  # ☼
    "forum": "\u2709",  # ✉
    "folder_managed": "\u25A3",  # ▣
    "inventory_2": "\u25A7",  # ▧
}


@dataclass(frozen=True)
class IconSpec:
    name: str
    size_px: int = 20
    filled: bool = False


def icon_text(name: str) -> str:
    """
    Returns the label text to render for an icon.

    With Material Symbols installed, Qt will render ligatures such as "menu" into
    the correct glyph. Without it, we fall back to a unicode approximation.
    """
    return _FALLBACK_GLYPHS.get(name, name)


def icon_font_family() -> str:
    # Check if the main Material Symbols font is available, if not, return a generic fallback
    from jpe_studio_qt.fonts import has_font_family
    family = DESIGN.typography.icon_font
    if has_font_family(family):
        return family
    else:
        # Try alternative names that might be registered by the font file
        alt_names = ["Material Symbols Outlined", "MaterialSymbolsOutlined", "Material Symbols"]
        for alt_name in alt_names:
            if has_font_family(alt_name):
                return alt_name
        # If no Material Symbols font found, return a generic font
        return "Arial"  # fallback font

