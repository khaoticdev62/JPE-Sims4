import sys
from pathlib import Path
import os
import math

# Add the project root to sys.path if the script is run directly
if __name__ == "__main__":
    project_root = Path(__file__).parent.parent
    sys.path.insert(0, str(project_root))

from asset_generator.base_renderer import AssetRenderer
from design_system.token_manager import design_token_manager
from PIL import Image, ImageDraw, ImageFont
from typing import Tuple, Dict, Any

class SliderGenerator(AssetRenderer):
    """
    Generates slider assets based on design tokens and specified properties.
    Supports different states (normal, focused, disabled).
    """
    def __init__(self, 
                 width: int, 
                 height: int, # Overall canvas height
                 track_height: int,
                 thumb_size: int,
                 value: int, 
                 min_value: int,
                 max_value: int,
                 track_color_token: str = "bg_medium",
                 fill_color_token: str = "primary_blue",
                 thumb_color_token: str = "primary_blue",
                 thumb_border_color_token: str = "none", # Default to no border
                 thumb_border_width: int = 0,
                 track_border_radius_token: str = "small",
                 state: str = "normal"): # normal, focused, disabled
        
        # Calculate effective canvas height to accommodate thumb if it's larger than track
        effective_height = max(height, thumb_size + thumb_border_width * 2) 

        super().__init__(width, effective_height, background_color="#00000000") # Start with transparent background

        self.width = width
        self.height = effective_height # Use the calculated effective height
        self.track_height = track_height
        self.thumb_size = thumb_size
        self.value = value
        self.min_value = min_value
        self.max_value = max_value
        self.state = state
        self.thumb_border_width = thumb_border_width # CORRECTED TYPO

        # Resolve colors based on state
        self.resolved_track_color = design_token_manager.get_color(track_color_token)
        self.resolved_fill_color = design_token_manager.get_color(fill_color_token)
        self.resolved_thumb_color = design_token_manager.get_color(thumb_color_token)
        self.resolved_thumb_border_color = design_token_manager.get_color(thumb_border_color_token)

        if self.state == "disabled":
            self.resolved_track_color = design_token_manager.get_color("bg_dark")
            self.resolved_fill_color = design_token_manager.get_color("text_secondary")
            self.resolved_thumb_color = design_token_manager.get_color("text_secondary")
            self.resolved_thumb_border_color = design_token_manager.get_color("neutral_gray")
        elif self.state == "focused":
            # For focused state, maybe a slightly different thumb color or border
            # For now, just keep same, but a more complex token system would define this
            pass 
        
        self.track_border_radius = design_token_manager.get_border_radius(track_border_radius_token)

    def generate_slider(self) -> Image.Image:
        """
        Generates the slider image.
        :return: A Pillow Image object representing the slider.
        """
        # Calculate vertical center of the track relative to the canvas
        track_center_y = self.height // 2 
        track_half_height = self.track_height // 2

        # 1. Draw Track Background
        track_bg_xy = (0, track_center_y - track_half_height, 
                       self.width, track_center_y + track_half_height)
        self.draw_rounded_rectangle(track_bg_xy, self.track_border_radius, self.resolved_track_color)

        # Calculate fill width
        fill_ratio = (self.value - self.min_value) / (self.max_value - self.min_value)
        fill_width = int(fill_ratio * self.width)
        
        # 2. Draw Filled Track Portion
        if fill_width > 0:
            track_fill_xy = (0, track_center_y - track_half_height, 
                             fill_width, track_center_y + track_half_height)
            self.draw_rounded_rectangle(track_fill_xy, self.track_border_radius, self.resolved_fill_color)

        # 3. Draw Thumb
        thumb_center_x = int(fill_ratio * self.width) # Thumb center is at the end of the fill
        thumb_radius = self.thumb_size // 2

        # Ensure thumb stays within bounds
        thumb_center_x = max(thumb_radius, min(thumb_center_x, self.width - thumb_radius))

        thumb_xy = (thumb_center_x - thumb_radius, track_center_y - thumb_radius,
                    thumb_center_x + thumb_radius, track_center_y + thumb_radius)
        
        self.draw.ellipse(thumb_xy, fill=self.resolved_thumb_color, 
                          outline=self.resolved_thumb_border_color if self.thumb_border_width > 0 else None, 
                          width=self.thumb_border_width)
        
        return self.get_image()

# Example Usage:
if __name__ == "__main__":
    # This ensures that the parent directory (project root) is in the Python path
    # even when slider_generator.py is run directly.
    project_root = Path(__file__).parent.parent.parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))

    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True)

    # Basic Slider - 50%
    slider_50 = SliderGenerator(
        width=300, height=40, track_height=8, thumb_size=20,
        value=50, min_value=0, max_value=100,
        track_color_token="bg_medium", fill_color_token="primary_blue",
        thumb_color_token="primary_blue", track_border_radius_token="small",
        state="normal"
    )
    slider_50.generate_slider().save(output_dir / "slider_50percent.png")
    print(f"Generated {output_dir / 'slider_50percent.png'}")

    # Slider - 80% with Accent color, focused state
    slider_80_focused = SliderGenerator(
        width=400, height=48, track_height=10, thumb_size=24,
        value=80, min_value=0, max_value=100,
        track_color_token="bg_dark", fill_color_token="accent_orange",
        thumb_color_token="accent_orange", thumb_border_color_token="primary_blue",
        thumb_border_width=2, track_border_radius_token="medium",
        state="focused"
    )
    slider_80_focused.generate_slider().save(output_dir / "slider_80percent_focused.png")
    print(f"Generated {output_dir / 'slider_80percent_focused.png'}")

    # Slider - Disabled state
    slider_disabled = SliderGenerator(
        width=300, height=40, track_height=8, thumb_size=20,
        value=25, min_value=0, max_value=100,
        track_color_token="bg_medium", fill_color_token="primary_blue",
        thumb_color_token="primary_blue", track_border_radius_token="small",
        state="disabled"
    )
    slider_disabled.generate_slider().save(output_dir / "slider_disabled.png")
    print(f"Generated {output_dir / 'slider_disabled.png'}")