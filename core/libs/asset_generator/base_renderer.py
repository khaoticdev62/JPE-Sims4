from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
from typing import Tuple, Dict, Any

class AssetRenderer:
    """
    Base class for rendering UI/UX assets using Pillow.
    Provides common drawing functionalities and handles canvas creation.
    """
    
    def __init__(self, width: int, height: int, background_color: str = "#00000000"):
        """
        Initializes the renderer with a canvas of specified dimensions.
        :param width: Width of the canvas.
        :param height: Height of the canvas.
        :param background_color: Background color of the canvas (RGBA hex or name).
        """
        self.width = width
        self.height = height
        self.image = Image.new("RGBA", (width, height), background_color)
        self.draw = ImageDraw.Draw(self.image)

    def _hex_to_rgba(self, hex_color: str) -> Tuple[int, int, int, int]:
        """Converts a hex color string (e.g., #RRGGBB or #RRGGBBAA) to an RGBA tuple."""
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 6:
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4)) + (255,)
        elif len(hex_color) == 8:
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4, 6))
        else:
            raise ValueError(f"Invalid hex color format: {hex_color}")

    def draw_rectangle(self, xy: Tuple[int, int, int, int], fill_color: str, outline_color: str = None, outline_width: int = 1):
        """Draws a rectangle on the canvas."""
        fill_rgba = self._hex_to_rgba(fill_color)
        if outline_color:
            outline_rgba = self._hex_to_rgba(outline_color)
            self.draw.rectangle(xy, fill=fill_rgba, outline=outline_rgba, width=outline_width)
        else:
            self.draw.rectangle(xy, fill=fill_rgba)

    def draw_rounded_rectangle(self, xy: Tuple[int, int, int, int], radius: int, fill_color: str, outline_color: str = None, outline_width: int = 1):
        """Draws a rounded rectangle on the canvas."""
        fill_rgba = self._hex_to_rgba(fill_color)
        if outline_color:
            outline_rgba = self._hex_to_rgba(outline_color)
            self.draw.rounded_rectangle(xy, radius, fill=fill_rgba, outline=outline_rgba, width=outline_width)
        else:
            self.draw.rounded_rectangle(xy, radius, fill=fill_rgba)

    def draw_text(self, xy: Tuple[int, int], text: str, font: ImageFont.ImageFont, fill_color: str, anchor: str = "mm"):
        """Draws text on the canvas using a pre-loaded font."""
        fill_rgba = self._hex_to_rgba(fill_color)
        self.draw.text(xy, text, font=font, fill=fill_rgba, anchor=anchor)

    def get_image(self) -> Image.Image:
        """Returns the Pillow Image object."""
        return self.image

    def save(self, file_path: Path, format: str = "PNG"):
        """Saves the generated image to a file."""
        self.image.save(file_path, format=format)
