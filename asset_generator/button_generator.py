import sys
from pathlib import Path
import os
import math # Import math for angle calculations

# Add the project root to sys.path if the script is run directly
if __name__ == "__main__":
    project_root = Path(__file__).parent.parent
    sys.path.insert(0, str(project_root))

from asset_generator.base_renderer import AssetRenderer
from design_system.token_manager import design_token_manager
from design_system.font_manager import font_manager # ADDED: Correct import for font_manager
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from typing import Tuple, Dict, Any, Optional

class ButtonGenerator(AssetRenderer):
    """
    Generates button assets based on design tokens and specified properties.
    """
    def __init__(self, 
                 width: int, 
                 height: int, 
                 label: str, 
                 bg_color_token: str = "none", # Default to none if gradient is used
                 text_color_token: str = "bg_light", 
                 font_token: str = "body", 
                 border_radius_token: str = "medium", 
                 shadow_token: str = "none",
                 state: str = "normal", # normal, hover, pressed, disabled
                 gradient_start_color_token: Optional[str] = None, # New
                 gradient_end_color_token: Optional[str] = None, # New
                 gradient_direction: str = "top_to_bottom"): # New: "top_to_bottom", "left_to_right", "angle"
        
        # Determine effective background color based on state (only for solid colors)
        effective_bg_color_token = bg_color_token
        effective_text_color_token = text_color_token

        if state == "hover":
            if effective_bg_color_token == "primary_blue":
                effective_bg_color_token = "#1D4F89" # Darker primary blue
            elif effective_bg_color_token == "bg_light":
                effective_bg_color_token = "bg_medium"
            # Gradient states would need separate start/end tokens or a transformation
        elif state == "pressed":
            if effective_bg_color_token == "primary_blue":
                effective_bg_color_token = "#0F3A6B" 
            elif effective_bg_color_token == "bg_light":
                effective_bg_color_token = "bg_dark"
        elif state == "disabled":
            effective_bg_color_token = "bg_dark"
            effective_text_color_token = "text_secondary"
        
        super().__init__(width, height, background_color="#00000000") # Start with transparent background

        self.width = width
        self.height = height
        self.label = label
        self.bg_color = design_token_manager.get_color(effective_bg_color_token)
        self.text_color = design_token_manager.get_color(effective_text_color_token)
        self.border_radius = design_token_manager.get_border_radius(border_radius_token)
        self.shadow = design_token_manager.get_shadow(shadow_token)
        
        # Gradient properties
        self.gradient_start_color = design_token_manager.get_color(gradient_start_color_token) if gradient_start_color_token else None
        self.gradient_end_color = design_token_manager.get_color(gradient_end_color_token) if gradient_end_color_token else None
        self.gradient_direction = gradient_direction

        font_config = design_token_manager.get_typography(font_token)
        self.font_family = font_config.get("font_family", "Roboto") # Use Roboto by default
        self.font_size = font_config.get("font_size", 14)
        self.font_weight = font_config.get("font_weight", "normal")
        
        # Get Pillow font object from FontManager
        self.pillow_font = font_manager.get_font(self.font_family, self.font_size, self.font_weight)

    def _draw_shadow(self):
        """Draws a shadow layer beneath the main button shape."""
        if self.shadow["blur"] > 0:
            shadow_image = Image.new("RGBA", (self.width, self.height), (0, 0, 0, 0))
            shadow_draw = ImageDraw.Draw(shadow_image)
            
            # Use a slightly smaller rectangle for the shadow to avoid corners bleeding out too much
            shadow_xy = (
                self.shadow["offset_x"],
                self.shadow["offset_y"],
                self.width - self.shadow["offset_x"],
                self.height - self.shadow["offset_y"]
            )
            
            # Adjust radius for shadow to be slightly smaller than button radius
            shadow_radius = max(0, self.border_radius - 1)

            shadow_draw.rounded_rectangle(shadow_xy, 
                                        radius=shadow_radius, 
                                        fill=self._hex_to_rgba(self.shadow["color"]))
            
            # Apply blur
            shadow_image = shadow_image.filter(ImageFilter.GaussianBlur(self.shadow["blur"]))
            
            # Paste shadow onto main image
            self.image.paste(shadow_image, (0, 0), shadow_image)

    def _draw_linear_gradient(self, rect_xy: Tuple[int, int, int, int], start_color: str, end_color: str, direction: str = "top_to_bottom"):
        """Draws a linear gradient within the specified rectangle."""
        x1, y1, x2, y2 = rect_xy
        gradient_image = Image.new('RGBA', (x2 - x1, y2 - y1), (0, 0, 0, 0))
        gradient_draw = ImageDraw.Draw(gradient_image)

        start_rgb = self._hex_to_rgba(start_color)
        end_rgb = self._hex_to_rgba(end_color)

        if direction == "top_to_bottom":
            for i in range(gradient_image.size[1]):
                r = int(start_rgb[0] + (end_rgb[0] - start_rgb[0]) * (i / gradient_image.size[1]))
                g = int(start_rgb[1] + (end_rgb[1] - start_rgb[1]) * (i / gradient_image.size[1]))
                b = int(start_rgb[2] + (end_rgb[2] - start_rgb[2]) * (i / gradient_image.size[1]))
                a = int(start_rgb[3] + (end_rgb[3] - start_rgb[3]) * (i / gradient_image.size[1]))
                gradient_draw.line((0, i, gradient_image.size[0], i), fill=(r, g, b, a))
        elif direction == "left_to_right":
            for i in range(gradient_image.size[0]):
                r = int(start_rgb[0] + (end_rgb[0] - start_rgb[0]) * (i / gradient_image.size[0]))
                g = int(start_rgb[1] + (end_rgb[1] - start_rgb[1]) * (i / gradient_image.size[0]))
                b = int(start_rgb[2] + (end_rgb[2] - start_rgb[2]) * (i / gradient_image.size[0]))
                a = int(start_rgb[3] + (end_rgb[3] - start_rgb[3]) * (i / gradient_image.size[0]))
                gradient_draw.line((i, 0, i, gradient_image.size[1]), fill=(r, g, b, a))
        else: # Default or other angles
            # A more complex implementation would handle angles, for simplicity, fallback to top_to_bottom
            for i in range(gradient_image.size[1]):
                r = int(start_rgb[0] + (end_rgb[0] - start_rgb[0]) * (i / gradient_image.size[1]))
                g = int(start_rgb[1] + (end_rgb[1] - start_rgb[1]) * (i / gradient_image.size[1]))
                b = int(start_rgb[2] + (end_rgb[2] - start_rgb[2]) * (i / gradient_image.size[1]))
                a = int(start_rgb[3] + (end_rgb[3] - start_rgb[3]) * (i / gradient_image.size[1]))
                gradient_draw.line((0, i, gradient_image.size[0], i), fill=(r, g, b, a))
        
        # Create a mask for the rounded rectangle shape
        mask = Image.new("L", (x2 - x1, y2 - y1), 0) # L mode for grayscale mask
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle((0, 0, x2 - x1, y2 - y1), self.border_radius, fill=255)

        # Apply the mask to the gradient image
        self.image.paste(gradient_image, (x1, y1), mask=mask)

    def generate_button(self) -> Image.Image:
        """
        Generates the button image.
        :return: A Pillow Image object representing the button.
        """
        # 1. Draw Shadow first
        self._draw_shadow()

        # 2. Draw Button Background (solid color or gradient)
        button_xy = (0, 0, self.width, self.height)

        if self.gradient_start_color and self.gradient_end_color:
            self._draw_linear_gradient(button_xy, self.gradient_start_color, self.gradient_end_color, self.gradient_direction)
        else:
            self.draw_rounded_rectangle(button_xy, self.border_radius, self.bg_color)

        # 3. Draw Text
        
        text_bbox = self.draw.textbbox((0, 0), self.label, font=self.pillow_font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        text_x = (self.width - text_width) // 2 - text_bbox[0] # Adjust for font's own baseline/bearing
        text_y = (self.height - text_height) // 2 - text_bbox[1]

        self.draw.text((text_x, text_y), self.label, font=self.pillow_font, fill=self.text_color)
        
        return self.get_image()

# Example Usage:
if __name__ == "__main__":
    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True)

    # Normal Primary Button
    btn_normal = ButtonGenerator(
        width=150, height=40, label="Click Me",
        bg_color_token="primary_blue", text_color_token="bg_light",
        font_token="body", border_radius_token="medium", shadow_token="subtle",
        state="normal"
    )
    btn_normal.generate_button().save(output_dir / "button_primary_normal.png")
    print(f"Generated {output_dir / 'button_primary_normal.png'}")

    # Hover Primary Button
    btn_hover = ButtonGenerator(
        width=150, height=40, label="Hover Me",
        bg_color_token="primary_blue", text_color_token="bg_light",
        font_token="body", border_radius_token="medium", shadow_token="subtle",
        state="hover"
    )
    btn_hover.generate_button().save(output_dir / "button_primary_hover.png")
    print(f"Generated {output_dir / 'button_primary_hover.png'}")

    # Disabled Secondary Button
    btn_disabled = ButtonGenerator(
        width=180, height=40, label="Disabled Action",
        bg_color_token="bg_medium", text_color_token="text_primary",
        font_token="body", border_radius_token="medium", shadow_token="none",
        state="disabled"
    )
    btn_disabled.generate_button().save(output_dir / "button_secondary_disabled.png")
    print(f"Generated {output_dir / 'button_secondary_disabled.png'}")

    # Success Button with Semibold font
    btn_success = ButtonGenerator(
        width=160, height=40, label="Success!",
        bg_color_token="success", text_color_token="bg_light",
        font_token="semibold", border_radius_token="medium", shadow_token="subtle",
        state="normal"
    )
    btn_success.generate_button().save(output_dir / "button_success_semibold.png")
    print(f"Generated {output_dir / 'button_success_semibold.png'}")

    # Small button with H4 typography
    btn_small = ButtonGenerator(
        width=100, height=30, label="Short",
        bg_color_token="accent_orange", text_color_token="bg_light",
        font_token="H4", border_radius_token="small", shadow_token="none",
        state="normal"
    )
    btn_small.generate_button().save(output_dir / "button_small_h4.png")
    print(f"Generated {output_dir / 'button_small_h4.png'}")

    # NEW: Gradient Button - Primary
    btn_gradient = ButtonGenerator(
        width=200, height=50, label="Gradient Button",
        gradient_start_color_token="primary_blue", gradient_end_color_token="info",
        gradient_direction="left_to_right",
        text_color_token="bg_light", font_token="semibold",
        border_radius_token="medium", shadow_token="medium",
        state="normal"
    )
    btn_gradient.generate_button().save(output_dir / "button_gradient_primary.png")
    print(f"Generated {output_dir / 'button_gradient_primary.png'}")

    # NEW: Gradient Button - Warning
    btn_gradient_warning = ButtonGenerator(
        width=180, height=45, label="Warning Action",
        gradient_start_color_token="warning", gradient_end_color_token="accent_orange",
        gradient_direction="top_to_bottom",
        text_color_token="text_dark_gray", font_token="body",
        border_radius_token="small", shadow_token="subtle",
        state="normal"
    )
    btn_gradient_warning.generate_button().save(output_dir / "button_gradient_warning.png")
    print(f"Generated {output_dir / 'button_gradient_warning.png'}")