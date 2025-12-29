from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class FontLoadResult:
    root: str
    loaded_files: tuple[str, ...]
    errors: tuple[str, ...]


def default_fonts_dir() -> Path:
    return Path(__file__).resolve().parent / "resources" / "fonts"


def load_bundled_fonts(fonts_dir: Path | None = None) -> FontLoadResult:
    """
    Loads any `.ttf` / `.otf` fonts from `jpe_studio_qt/resources/fonts/`.

    The repo does not include font binaries by default; this is a hook to allow
    offline packaging (e.g., Inter + JetBrains Mono + Material Symbols) later.
    """
    fonts_dir = (fonts_dir or default_fonts_dir()).expanduser().resolve()
    loaded: list[str] = []
    errors: list[str] = []

    try:
        from PySide6.QtGui import QFontDatabase
    except Exception as e:  # pragma: no cover
        return FontLoadResult(root=str(fonts_dir), loaded_files=(), errors=(f"PySide6 not available: {e}",))

    if not fonts_dir.exists():
        return FontLoadResult(root=str(fonts_dir), loaded_files=(), errors=())

    for path in sorted(fonts_dir.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".ttf", ".otf"}:
            continue
        try:
            font_id = QFontDatabase.addApplicationFont(str(path))
            if font_id >= 0:
                loaded.append(str(path))
            else:
                errors.append(f"Failed to load font: {path}")
        except Exception as e:
            errors.append(f"Failed to load font: {path} ({e})")

    return FontLoadResult(root=str(fonts_dir), loaded_files=tuple(loaded), errors=tuple(errors))


def has_font_family(family: str) -> bool:
    try:
        from PySide6.QtGui import QFontDatabase
    except Exception:  # pragma: no cover
        return False
    try:
        families = set(f.lower() for f in QFontDatabase.families())
        target = family.lower()
        # Check for exact match or partial match (handles variations in font naming)
        return target in families or any(target.replace(" ", "") in f.replace(" ", "") for f in families)
    except Exception:  # pragma: no cover
        return False

