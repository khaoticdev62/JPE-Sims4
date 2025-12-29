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
from design_system.font_manager import font_manager
from PIL import Image, ImageDraw, ImageFont
from typing import List, Tuple, Dict, Any, Optional

class TabBarGenerator(AssetRenderer):
    """
    Generates tab bar assets based on design tokens and specified properties.
    Supports active/inactive states and various styling options.
    """
    def __init__(self, 
                 width: int, 
                 height: int, 
                 tab_labels: List[str],
                 active_tab_index: int = 0,
                 bg_color_token: str = "bg_medium",
                 tab_text_color_normal_token: str = "text_secondary",
                 tab_text_color_active_token: str = "primary_blue",
                 indicator_color_token: str = "primary_blue",
                 font_token: str = "body",
                 tab_padding_horizontal: Optional[int] = None, # Will use spacing tokens if None
                 tab_padding_vertical: Optional[int] = None, # Will use spacing tokens if None
                 corner_radius_token: str = "none"): # "small", "medium", "large" or "none"
        
        super().__init__(width, height, background_color="#00000000") # Start with transparent background

        self.width = width
        self.height = height
        self.tab_labels = tab_labels
        self.active_tab_index = active_tab_index
        self.bg_color = design_token_manager.get_color(bg_color_token)
        self.tab_text_color_normal = design_token_manager.get_color(tab_text_color_normal_token)
        self.tab_text_color_active = design_token_manager.get_color(tab_text_color_active_token)
        self.indicator_color = design_token_manager.get_color(indicator_color_token)
        self.corner_radius = design_token_manager.get_border_radius(corner_radius_token)
        
        font_config = design_token_manager.get_typography(font_token)
        self.font_family = font_config.get("font_family", "Roboto")
        self.font_size = font_config.get("font_size", 14)
        self.font_weight = font_config.get("font_weight", "normal")
        self.pillow_font = font_manager.get_font(self.font_family, self.font_size, self.font_weight)

        self.tab_padding_horizontal = tab_padding_horizontal if tab_padding_horizontal is not None else design_token_manager.get_spacing("s2") # Default to 16px
        self.tab_padding_vertical = tab_padding_vertical if tab_padding_vertical is not None else design_token_manager.get_spacing("s1") # Default to 8px


    def generate_tab_bar(self) -> Image.Image:
        """
        Generates the tab bar image.
        :return: A Pillow Image object representing the tab bar.
        """
        # 1. Draw Tab Bar Background
        tab_bar_xy = (0, 0, self.width, self.height)
        self.draw_rounded_rectangle(tab_bar_xy, self.corner_radius, self.bg_color)

        num_tabs = len(self.tab_labels)
        if num_tabs == 0:
            return self.get_image() # Return empty tab bar if no labels

        tab_width = self.width / num_tabs
        
        for i, label in enumerate(self.tab_labels):
            tab_x1 = i * tab_width
            tab_x2 = (i + 1) * tab_width
            tab_y1 = 0
            tab_y2 = self.height

            # Determine text color for this tab
            text_color = self.tab_text_color_active if i == self.active_tab_index else self.tab_text_color_normal

            # Draw tab label
            text_bbox = self.draw.textbbox((0, 0), label, font=self.pillow_font)
            text_w = text_bbox[2] - text_bbox[0]
            text_h = text_bbox[3] - text_bbox[1]
            
            text_x = tab_x1 + (tab_width - text_w) // 2 - text_bbox[0]
            text_y = (tab_y1 + tab_y2 - text_h) // 2 - text_bbox[1]

            self.draw.text((text_x, text_y), label, font=self.pillow_font, fill=text_color)

            # Draw active tab indicator
            if i == self.active_tab_index:
                indicator_height = 4
                indicator_y = self.height - indicator_height
                # Draw a rectangle for the indicator
                self.draw.rounded_rectangle(
                    (tab_x1, indicator_y, tab_x2, self.height), 
                    radius=self.corner_radius, # Use same corner radius or a smaller one
                    fill=self.indicator_color
                )
        
        return self.get_image()

# Example Usage:
if __name__ == "__main__":
    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True)

    # Basic Tab Bar - First tab active
    tab_bar_1 = TabBarGenerator(
        width=400, height=50, 
        tab_labels=["Projects", "Editor", "Settings"],
        active_tab_index=0,
        bg_color_token="bg_light",
        tab_text_color_normal_token="text_secondary",
        tab_text_color_active_token="primary_blue",
        indicator_color_token="primary_blue",
        font_token="body",
        corner_radius_token="small"
    )
    tab_bar_1.generate_tab_bar().save(output_dir / "tab_bar_projects_active.png")
    print(f"Generated {output_dir / 'tab_bar_projects_active.png'}")

    # Tab Bar - Middle tab active
    tab_bar_2 = TabBarGenerator(
        width=400, height=50, 
        tab_labels=["Projects", "Editor", "Settings"],
        active_tab_index=1,
        bg_color_token="bg_dark",
        tab_text_color_normal_token="text_light_gray",
        tab_text_color_active_token="bg_light",
        indicator_color_token="accent_orange",
        font_token="body",
        corner_radius_token="small"
    )
    tab_bar_2.generate_tab_bar().save(output_dir / "tab_bar_editor_active.png")
    print(f"Generated {output_dir / 'tab_bar_editor_active.png'}")

    # Tab Bar - Last tab active, different labels
    tab_bar_3 = TabBarGenerator(
        width=600, height=60, 
        tab_labels=["Home", "Profile", "Notifications", "Messages"],
        active_tab_index=3,
        bg_color_token="primary_blue",
        tab_text_color_normal_token="bg_medium",
        tab_text_color_active_token="bg_light",
        indicator_color_token="success",
        font_token="semibold",
        corner_radius_token="none" # No corner radius
    )
    tab_bar_3.generate_tab_bar().save(output_dir / "tab_bar_messages_active.png")
    print(f"Generated {output_dir / 'tab_bar_messages_active.png'}")
