import sys
from pathlib import Path
import os

# Add the project root to sys.path if the script is run directly
if __name__ == "__main__":
    project_root = Path(__file__).parent.parent
    sys.path.insert(0, str(project_root))

from asset_generator.base_renderer import AssetRenderer
from design_system.token_manager import design_token_manager
from design_system.font_manager import font_manager # New Import
from PIL import Image, ImageDraw, ImageFont
from typing import Tuple, Dict, Any

class ProgressBarGenerator(AssetRenderer):
    """
    Generates progress bar assets based on design tokens and specified properties.
    """
    def __init__(self, 
                 width: int, 
                 height: int, 
                 value: int, 
                 max_value: int,
                 bg_color_token: str, 
                 fill_color_token: str, 
                 border_radius_token: str,
                 label: str = "",
                 label_color_token: str = "text_primary",
                 font_token: str = "small"):
        
        super().__init__(width, height, background_color="#00000000") # Start with transparent background

        self.width = width
        self.height = height
        self.value = value
        self.max_value = max_value
        self.bg_color = design_token_manager.get_color(bg_color_token)
        self.fill_color = design_token_manager.get_color(fill_color_token)
        self.border_radius = design_token_manager.get_border_radius(border_radius_token)
        self.label = label
        self.label_color = design_token_manager.get_color(label_color_token)

        font_config = design_token_manager.get_typography(font_token)
        self.font_family = font_config.get("font_family", "Roboto") # Use Roboto by default
        self.font_size = font_config.get("font_size", 12)
        self.font_weight = font_config.get("font_weight", "normal") # Get font weight
        
        # Get Pillow font object from FontManager
        self.pillow_font = font_manager.get_font(self.font_family, self.font_size, self.font_weight)


    def generate_progressbar(self) -> Image.Image:
        """
        Generates the progress bar image.
        :return: A Pillow Image object representing the progress bar.
        """
        # Draw the background track
        track_xy = (0, 0, self.width, self.height)
        self.draw_rounded_rectangle(track_xy, self.border_radius, self.bg_color)

        # Calculate fill width
        fill_width = int((self.value / self.max_value) * self.width)
        fill_xy = (0, 0, fill_width, self.height)
        
        # Draw the filled portion (only if there's progress)
        if fill_width > 0:
            # For the filled portion, ensure its corners don't extend beyond the track's radius
            # This is a simplified approach, a more complex one would involve creating a mask
            # For now, we'll draw a slightly smaller rounded rect within the filled area
            fill_radius = self.border_radius # Use the same radius

            self.draw_rounded_rectangle(fill_xy, fill_radius, self.fill_color)
            
            # If the fill is very narrow, draw a square end instead of rounded to avoid issues
            if fill_width < self.border_radius * 2 and fill_width > 0:
                 self.draw.rectangle((0, 0, fill_width, self.height), fill=self.fill_color)

        # Draw Label if present
        if self.label:
            text_bbox = self.draw.textbbox((0, 0), self.label, font=self.pillow_font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
            
            text_x = (self.width - text_width) // 2 - text_bbox[0]
            text_y = (self.height - text_height) // 2 - text_bbox[1]

            self.draw.text((text_x, text_y), self.label, font=self.pillow_font, fill=self.label_color)

        return self.get_image()

# Example Usage:
if __name__ == "__main__":
    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True)

    # Basic Progress Bar - 50%
    pb_50 = ProgressBarGenerator(
        width=300, height=20, value=50, max_value=100,
        bg_color_token="bg_medium", fill_color_token="primary_blue",
        border_radius_token="small", label="50%"
    )
    pb_50.generate_progressbar().save(output_dir / "progressbar_50percent.png")
    print(f"Generated {output_dir / 'progressbar_50percent.png'}")

    # Progress Bar - 80% with Success color
    pb_80_success = ProgressBarGenerator(
        width=400, height=24, value=80, max_value=100,
        bg_color_token="bg_dark", fill_color_token="success",
        border_radius_token="medium", label="80% Complete",
        label_color_token="bg_light", font_token="body"
    )
    pb_80_success.generate_progressbar().save(output_dir / "progressbar_80percent_success.png")
    print(f"Generated {output_dir / 'progressbar_80percent_success.png'}")

    # Progress Bar - 10% with Warning color, smaller
    pb_10_warning = ProgressBarGenerator(
        width=200, height=16, value=10, max_value=100,
        bg_color_token="bg_medium", fill_color_token="warning",
        border_radius_token="small"
    )
    pb_10_warning.generate_progressbar().save(output_dir / "progressbar_10percent_warning.png")
    print(f"Generated {output_dir / 'progressbar_10percent_warning.png'}")

    # Progress Bar - 100%
    pb_100 = ProgressBarGenerator(
        width=300, height=20, value=100, max_value=100,
        bg_color_token="bg_medium", fill_color_token="primary_blue",
        border_radius_token="small", label="DONE!"
    )
    pb_100.generate_progressbar().save(output_dir / "progressbar_100percent.png")
    print(f"Generated {output_dir / 'progressbar_100percent.png'}")
