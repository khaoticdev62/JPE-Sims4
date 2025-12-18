from __future__ import annotations

from dataclasses import dataclass
import json
import re
from pathlib import Path


_RX_TITLE = re.compile(r"<title>(.*?)</title>", re.IGNORECASE | re.DOTALL)
_RX_GOOGLE_FONT_FAMILY = re.compile(r"family=([^:&]+)")
_RX_TW_COLOR = re.compile(r'"([^"]+)"\s*:\s*"(#[0-9a-fA-F]{6}|rgba\([^)]+\))"')
_RX_TW_CONFIG_BLOCK = re.compile(r"tailwind\\.config\\s*=\\s*\\{.*?\\}\\s*</script>", re.DOTALL)


@dataclass(frozen=True)
class AssetSpec:
    asset_id: str
    folder: str
    code_html: str | None
    screen_png: str | None
    title: str | None
    fonts: tuple[str, ...]
    uses_material_symbols: bool
    tailwind_colors: dict[str, str]

    def to_dict(self) -> dict[str, object]:
        return {
            "asset_id": self.asset_id,
            "folder": self.folder,
            "code_html": self.code_html,
            "screen_png": self.screen_png,
            "title": self.title,
            "fonts": list(self.fonts),
            "uses_material_symbols": self.uses_material_symbols,
            "tailwind_colors": dict(self.tailwind_colors),
        }


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def parse_code_html(path: Path) -> dict[str, object]:
    """
    Parses a single asset `code.html` and extracts the design tokens we can reliably
    infer without a full HTML/JS parser.
    """
    html = _read_text(path)

    title = None
    m = _RX_TITLE.search(html)
    if m:
        title = " ".join(m.group(1).strip().split())

    fonts: list[str] = []
    for fam in _RX_GOOGLE_FONT_FAMILY.findall(html):
        fam = fam.replace("+", " ")
        fam = fam.split(":", 1)[0].strip()
        if fam and fam not in fonts:
            fonts.append(fam)

    uses_material = "Material+Symbols+Outlined" in html or "material-symbols-outlined" in html

    colors: dict[str, str] = {}
    config_block = None
    m2 = _RX_TW_CONFIG_BLOCK.search(html)
    if m2:
        config_block = m2.group(0)
    if config_block is None:
        config_block = html
    for key, val in _RX_TW_COLOR.findall(config_block):
        if key not in colors:
            colors[key] = val

    return {
        "title": title,
        "fonts": fonts,
        "uses_material_symbols": uses_material,
        "tailwind_colors": colors,
    }


def scan_assets_folder(root: Path) -> list[AssetSpec]:
    """
    Scans `JPE assets folder/` and returns an inventory of screens/variants.

    Asset identity is derived from the relative folder path that contains `code.html`.
    """
    root = root.expanduser().resolve()
    if not root.exists():
        raise FileNotFoundError(root)

    out: list[AssetSpec] = []
    for code in sorted(root.rglob("code.html")):
        rel_folder = code.parent.relative_to(root).as_posix()
        asset_id = rel_folder
        screen = code.parent / "screen.png"
        parsed = parse_code_html(code)
        out.append(
            AssetSpec(
                asset_id=asset_id,
                folder=str(code.parent),
                code_html=str(code),
                screen_png=str(screen) if screen.exists() else None,
                title=str(parsed.get("title") or "") or None,
                fonts=tuple(parsed.get("fonts") or ()),
                uses_material_symbols=bool(parsed.get("uses_material_symbols")),
                tailwind_colors=dict(parsed.get("tailwind_colors") or {}),
            )
        )

    return out


def summarize_tokens(assets: list[AssetSpec]) -> dict[str, object]:
    fonts: dict[str, int] = {}
    colors: dict[str, dict[str, int]] = {}
    for a in assets:
        for f in a.fonts:
            fonts[f] = fonts.get(f, 0) + 1
        for k, v in a.tailwind_colors.items():
            colors.setdefault(k, {})
            colors[k][v] = colors[k].get(v, 0) + 1

    top_fonts = sorted(fonts.items(), key=lambda kv: (-kv[1], kv[0]))
    primary_variants = colors.get("primary", {})
    top_primary = sorted(primary_variants.items(), key=lambda kv: (-kv[1], kv[0]))
    return {
        "assets_count": len(assets),
        "fonts": top_fonts,
        "color_keys": sorted(colors.keys()),
        "primary_variants": top_primary,
        "colors": colors,
    }


def write_manifest(*, assets_root: Path, out_json: Path) -> dict[str, object]:
    assets = scan_assets_folder(assets_root)
    payload = {
        "assets_root": str(assets_root.expanduser().resolve()),
        "assets": [a.to_dict() for a in assets],
        "summary": summarize_tokens(assets),
    }
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    return payload
