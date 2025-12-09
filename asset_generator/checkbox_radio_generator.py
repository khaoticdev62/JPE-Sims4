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

class CheckboxRadioGenerator(AssetRenderer):
    """
    Generates checkbox and radio button assets based on design tokens and specified properties.
    Supports different states and types.
    """
    def __init__(self, 
                 control_type: str, # "checkbox" or "radio"
                 size: int, # Size of the control itself (e.g., 20px)
                 label: str,
                 label_color_token: str = "text_primary",
                 font_token: str = "body",
                 checked_color_token: str = "primary_blue",
                 unchecked_color_token: str = "border",
                 checkmark_color_token: str = "bg_light",
                 disabled_color_token: str = "bg_dark",
                 state: str = "unchecked", # "checked", "unchecked", "disabled_checked", "disabled_unchecked"
                 border_width: int = 2):
        
        self.control_type = control_type
        self.control_size = size
        self.label = label
        self.border_width = border_width
        self.state = state

        # Resolve colors based on state
        self.resolved_label_color = design_token_manager.get_color(label_color_token)
        self.resolved_checked_color = design_token_manager.get_color(checked_color_token)
        self.resolved_unchecked_color = design_token_manager.get_color(unchecked_color_token)
        self.resolved_checkmark_color = design_token_manager.get_color(checkmark_color_token)
        self.resolved_disabled_color = design_token_manager.get_color(disabled_color_token)

        self.resolved_control_bg_color = design_token_manager.get_color("bg_light")
        self.resolved_control_border_color = self.resolved_unchecked_color
        self.resolved_mark_color = self.resolved_checkmark_color

        if self.state == "checked":
            self.resolved_control_bg_color = self.resolved_checked_color
            self.resolved_control_border_color = self.resolved_checked_color
        elif self.state == "disabled_checked":
            self.resolved_control_bg_color = self.resolved_disabled_color
            self.resolved_control_border_color = self.resolved_disabled_color
            self.resolved_mark_color = design_token_manager.get_color("text_secondary") # Muted checkmark
        elif self.state == "disabled_unchecked":
            self.resolved_control_bg_color = design_token_manager.get_color("bg_medium")
            self.resolved_control_border_color = self.resolved_disabled_color
            self.resolved_label_color = design_token_manager.get_color("text_secondary")


        font_config = design_token_manager.get_typography(font_token)
        self.font_family = font_config.get("font_family", "Roboto") # Use Roboto by default
        self.font_size = font_config.get("font_size", 14)
        self.font_weight = font_config.get("font_weight", "normal") # Get font weight

        # Get Pillow font object from FontManager
        self.pillow_font = font_manager.get_font(self.font_family, self.font_size, self.font_weight)

        # Calculate total width and height
        # Need to know text width first to calculate total width
        # Use font obtained from font_manager
        text_bbox = ImageDraw.Draw(Image.new("RGBA", (1,1))).textbbox((0,0), self.label, font=self.pillow_font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        spacing_between_control_and_label = design_token_manager.get_spacing("s1") # 8px
        
        total_width = self.control_size + spacing_between_control_and_label + text_width
        total_height = max(self.control_size, text_height)

        super().__init__(total_width, total_height, background_color="#00000000") # Start with transparent background

    def generate_control(self) -> Image.Image:
        """
        Generates the checkbox or radio button image.
        :return: A Pillow Image object representing the control.
        """
        control_x_offset = 0
        control_y_offset = (self.height - self.control_size) // 2
        control_xy = (control_x_offset, control_y_offset, 
                      control_x_offset + self.control_size, control_y_offset + self.control_size)

        # 1. Draw Control Body
        if self.control_type == "checkbox":
            self.draw.rounded_rectangle(control_xy, radius=design_token_manager.get_border_radius("small"), 
                                        fill=self.resolved_control_bg_color, 
                                        outline=self.resolved_control_border_color, 
                                        width=self.border_width)
        elif self.control_type == "radio":
            self.draw.ellipse(control_xy, 
                              fill=self.resolved_control_bg_color, 
                              outline=self.resolved_control_border_color, 
                              width=self.border_width)
        
        # 2. Draw Checkmark/Dot if checked
        if "checked" in self.state:
            mark_size = self.control_size // 2
            mark_center_x = control_x_offset + self.control_size // 2
            mark_center_y = control_y_offset + self.control_size // 2

            if self.control_type == "checkbox":
                # Draw a simple checkmark (could be an icon from font, or drawn lines)
                # For simplicity, drawing an 'X' or 'V'
                checkmark_coords = [
                    (mark_center_x - mark_size // 2, mark_center_y),
                    (mark_center_x - mark_size // 4, mark_center_y + mark_size // 2),
                    (mark_center_x + mark_size // 2, mark_center_y - mark_size // 2),
                ]
                self.draw.line(checkmark_coords, fill=self.resolved_mark_color, width=self.border_width + 1)
                # Drawing a simple checkmark 'V'
                self.draw.line((mark_center_x - mark_size//2, mark_center_y,
                               mark_center_x - mark_size//4, mark_center_y + mark_size//2,
                               mark_center_x + mark_size//2, mark_center_y - mark_size//2),
                               fill=self.resolved_mark_color, width=self.border_width + 1, joint="curve")

            elif self.control_type == "radio":
                self.draw.ellipse((mark_center_x - mark_size // 2, mark_center_y - mark_size // 2,
                                   mark_center_x + mark_size // 2, mark_center_y + mark_size // 2),
                                  fill=self.resolved_mark_color)
        
        # 3. Draw Label Text
        text_start_x = control_x_offset + self.control_size + design_token_manager.get_spacing("s1")
        text_center_y = self.height // 2 # Center text vertically with the control

        self.draw.text(
            (text_start_x, text_center_y), 
            self.label, 
            font=self.pillow_font, # Pass pre-loaded font object
            fill=self.resolved_label_color,
            anchor="lm" # Left-middle anchor
        )
        
        return self.get_image()

# Example Usage:
if __name__ == "__main__":
    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True)

    # Checkbox - Unchecked
    cb_unchecked = CheckboxRadioGenerator(
        control_type="checkbox", size=20, label="Remember Me",
        state="unchecked", font_token="body", border_width=2
    )
    cb_unchecked.generate_control().save(output_dir / "checkbox_unchecked.png")
    print(f"Generated {output_dir / 'checkbox_unchecked.png'}")

    # Checkbox - Checked
    cb_checked = CheckboxRadioGenerator(
        control_type="checkbox", size=20, label="Remember Me",
        state="checked", font_token="body", border_width=2
    )
    cb_checked.generate_control().save(output_dir / "checkbox_checked.png")
    print(f"Generated {output_dir / 'checkbox_checked.png'}")

    # Checkbox - Disabled Checked
    cb_disabled_checked = CheckboxRadioGenerator(
        control_type="checkbox", size=20, label="Remember Me",
        state="disabled_checked", font_token="body", border_width=2
    )
    cb_disabled_checked.generate_control().save(output_dir / "checkbox_disabled_checked.png")
    print(f"Generated {output_dir / 'checkbox_disabled_checked.png'}")
    
    # Radio - Unchecked
    rb_unchecked = CheckboxRadioGenerator(
        control_type="radio", size=20, label="Option A",
        state="unchecked", font_token="body", border_width=2
    )
    rb_unchecked.generate_control().save(output_dir / "radio_unchecked_A.png")
    print(f"Generated {output_dir / 'radio_unchecked_A.png'}")

    # Radio - Checked
    rb_checked = CheckboxRadioGenerator(
        control_type="radio", size=20, label="Option B",
        state="checked", font_token="body", border_width=2
    )
    rb_checked.generate_control().save(output_dir / "radio_checked_B.png")
    print(f"Generated {output_dir / 'radio_checked_B.png'}")

    # Radio - Disabled Unchecked
    rb_disabled_unchecked = CheckboxRadioGenerator(
        control_type="radio", size=20, label="Option C",
        state="disabled_unchecked", font_token="body", border_width=2
    )
    rb_disabled_unchecked.generate_control().save(output_dir / "radio_disabled_unchecked_C.png")
    print(f"Generated {output_dir / 'radio_disabled_unchecked_C.png'}")
