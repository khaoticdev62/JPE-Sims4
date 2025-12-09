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

class TextInputGenerator(AssetRenderer):
    """
    Generates text input field assets based on design tokens and specified properties.
    Supports different states (normal, focused, error, disabled).
    """
    def __init__(self, 
                 width: int, 
                 height: int, 
                 placeholder: str,
                 text_color_token: str = "text_primary",
                 placeholder_color_token: str = "text_secondary",
                 bg_color_token: str = "bg_light",
                 border_color_token: str = "border",
                 border_width: int = 1,
                 border_radius_token: str = "small",
                 font_token: str = "body",
                 state: str = "normal"): # normal, focused, error, disabled
        
        super().__init__(width, height, background_color="#00000000") # Start with transparent background

        self.width = width
        self.height = height
        self.placeholder = placeholder
        self.border_width = border_width
        self.state = state

        # Resolve colors based on state
        self.resolved_text_color = design_token_manager.get_color(text_color_token)
        self.resolved_placeholder_color = design_token_manager.get_color(placeholder_color_token)
        self.resolved_bg_color = design_token_manager.get_color(bg_color_token)
        self.resolved_border_color = design_token_manager.get_color(border_color_token)

        if self.state == "focused":
            self.resolved_border_color = design_token_manager.get_color("primary_blue")
        elif self.state == "error":
            self.resolved_border_color = design_token_manager.get_color("error")
        elif self.state == "disabled":
            self.resolved_bg_color = design_token_manager.get_color("bg_dark")
            self.resolved_border_color = design_token_manager.get_color("bg_medium")
            self.resolved_placeholder_color = design_token_manager.get_color("text_secondary")
        
        self.border_radius = design_token_manager.get_border_radius(border_radius_token)
        
        font_config = design_token_manager.get_typography(font_token)
        self.font_family = font_config.get("font_family", "Roboto") # Use Roboto by default
        self.font_size = font_config.get("font_size", 14)
        self.font_weight = font_config.get("font_weight", "normal") # Get font weight
        
        # Get Pillow font object from FontManager
        self.pillow_font = font_manager.get_font(self.font_family, self.font_size, self.font_weight)

    def generate_text_input(self) -> Image.Image:
        """
        Generates the text input field image.
        :return: A Pillow Image object representing the text input.
        """
        # 1. Draw Background
        input_rect_xy = (0, 0, self.width, self.height)
        self.draw_rounded_rectangle(input_rect_xy, self.border_radius, self.resolved_bg_color)

        # 2. Draw Border
        if self.border_width > 0:
            self.draw_rounded_rectangle(input_rect_xy, self.border_radius, 
                                        fill_color=self.resolved_bg_color, # Fill with background color
                                        outline_color=self.resolved_border_color, 
                                        outline_width=self.border_width)

        # 3. Draw Placeholder Text (with padding)
        text_padding_left = design_token_manager.get_spacing("s1") # e.g., 8px
        
        # Position text
        text_x = text_padding_left
        text_y = self.height // 2 # vertically center

        self.draw.text(
            (text_x, text_y), 
            self.placeholder, 
            font=self.pillow_font, # Pass pre-loaded font object
            fill=self.resolved_placeholder_color,
            anchor="lm" # Left-middle anchor
        )
        
        return self.get_image()

# Example Usage:
if __name__ == "__main__":
    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True)

    # Normal state
    ti_normal = TextInputGenerator(
        width=250, height=40, placeholder="Enter text...",
        bg_color_token="bg_light", border_color_token="border",
        border_radius_token="small", font_token="body", state="normal"
    )
    ti_normal.generate_text_input().save(output_dir / "text_input_normal.png")
    print(f"Generated {output_dir / 'text_input_normal.png'}")

    # Focused state
    ti_focused = TextInputGenerator(
        width=250, height=40, placeholder="Focused input",
        bg_color_token="bg_light", border_color_token="border",
        border_radius_token="small", font_token="body", state="focused"
    )
    ti_focused.generate_text_input().save(output_dir / "text_input_focused.png")
    print(f"Generated {output_dir / 'text_input_focused.png'}")

    # Error state
    ti_error = TextInputGenerator(
        width=250, height=40, placeholder="Invalid entry",
        bg_color_token="bg_light", border_color_token="border",
        border_radius_token="small", font_token="body", state="error"
    )
    ti_error.generate_text_input().save(output_dir / "text_input_error.png")
    print(f"Generated {output_dir / 'text_input_error.png'}")

    # Disabled state
    ti_disabled = TextInputGenerator(
        width=250, height=40, placeholder="Disabled input",
        bg_color_token="bg_light", border_color_token="border",
        border_radius_token="small", font_token="body", state="disabled"
    )
    ti_disabled.generate_text_input().save(output_dir / "text_input_disabled.png")
    print(f"Generated {output_dir / 'text_input_disabled.png'}")
