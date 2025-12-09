import svgwrite
from pathlib import Path
from typing import Tuple, Dict, Any

class SVGAssetRenderer:
    """
    Base class for rendering UI/UX assets in SVG format.
    Provides common SVG drawing functionalities and handles document creation.
    """
    
    def __init__(self, width: int, height: int, background_color: str = "none"):
        """
        Initializes the SVG renderer with a document of specified dimensions.
        :param width: Width of the SVG document.
        :param height: Height of the SVG document.
        :param background_color: Background color of the SVG (CSS color string or 'none').
        """
        self.width = width
        self.height = height
        self.dwg = svgwrite.Drawing(size=(f"{width}px", f"{height}px"))
        
        if background_color != "none":
            self.dwg.add(self.dwg.rect(insert=(0, 0), size=(width, height), fill=background_color))

    def _hex_to_rgb_css(self, hex_color: str) -> str:
        """Converts a hex color string (e.g., #RRGGBB or #RRGGBBAA) to a CSS rgb() or rgba() string."""
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 6:
            r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
            return f"rgb({r}, {g}, {b})"
        elif len(hex_color) == 8:
            r, g, b, a = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16), int(hex_color[6:8], 16)
            alpha = round(a / 255, 2)
            return f"rgba({r}, {g}, {b}, {alpha})"
        return hex_color # Return as is if not a valid hex format

    def add_rect(self, xy: Tuple[int, int], size: Tuple[int, int], fill_color: str, stroke_color: str = None, stroke_width: int = 0, rx: int = 0, ry: int = 0):
        """Adds a rectangle to the SVG document."""
        self.dwg.add(svgwrite.shapes.Rect(
            insert=xy,
            size=size,
            rx=rx, ry=ry,
            fill=self._hex_to_rgb_css(fill_color),
            stroke=self._hex_to_rgb_css(stroke_color) if stroke_color else "none",
            stroke_width=stroke_width
        ))

    def add_text(self, xy: Tuple[int, int], text: str, font_size: int, fill_color: str, font_family: str = "sans-serif", font_weight: str = "normal", text_anchor: str = "middle", alignment_baseline: str = "middle"):
        """Adds text to the SVG document."""
        self.dwg.add(svgwrite.text.Text(
            text,
            insert=xy,
            font_size=f"{font_size}px",
            font_family=font_family,
            font_weight=font_weight,
            fill=self._hex_to_rgb_css(fill_color),
            text_anchor=text_anchor,
            alignment_baseline=alignment_baseline
        ))

    def save(self, file_path: Path):
        """Saves the SVG document to a file."""
        self.dwg.saveas(file_path)

