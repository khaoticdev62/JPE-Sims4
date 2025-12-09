"""
Visual Theme Preview Generator for JPE Sims 4 Mod Translator.

This module creates visual previews of UI themes using Pillow, integrating with the 
design system and asset generation stack.
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from typing import Optional, List
from ui.theme_manager import theme_manager
from design_system.font_manager import font_manager as design_font_manager


class VisualThemePreviewGenerator:
    """
    Generates visual previews of UI themes using Pillow, with support for
    the JPE design system and asset generation stack.
    """
    
    def __init__(self, output_dir: Optional[Path] = None):
        if output_dir is None:
            self.output_dir = Path(__file__).parent / "visual_previews" / "themes"
        else:
            self.output_dir = output_dir
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_theme_preview(self, theme_name: str, width: int = 800, height: int = 600) -> Optional[Path]:
        """
        Generate a visual preview of a UI theme with sample UI elements.
        
        Args:
            theme_name: Name of the theme to preview
            width: Width of the output image
            height: Height of the output image
            
        Returns:
            Path to the generated preview image
        """
        # Get theme
        if theme_name not in theme_manager.themes:
            print(f"Theme '{theme_name}' not found")
            return None
        
        theme = theme_manager.themes[theme_name]
        
        # Create a blank image with theme background color
        img = Image.new('RGB', (width, height), color=theme.bg)
        draw = ImageDraw.Draw(img)
        
        # Title
        try:
            title_font = design_font_manager.get_font("JetBrains Mono", 36, "bold")
        except:
            title_font = design_font_manager.get_font("Roboto", 36, "bold")
        
        draw.text((20, 20), f"Theme: {theme.display_name}", fill=theme.fg, font=title_font)
        
        # Draw a separator
        draw.line([(20, 70), (width - 20, 70)], fill=theme.select_bg, width=2)
        
        # Sample UI elements
        y_pos = 100
        
        # Sample text
        try:
            text_font = design_font_manager.get_font("JetBrains Mono", 16, "normal")
        except:
            text_font = design_font_manager.get_font("Roboto", 16, "normal")
        
        draw.text((40, y_pos), "Sample Text", fill=theme.fg, font=text_font)
        y_pos += 40
        
        # Sample button representation
        button_color = theme.button_bg
        button_text_color = theme.button_fg
        button_pos = (40, y_pos, 200, y_pos + 40)
        draw.rectangle(button_pos, fill=button_color, outline=theme.select_bg, width=2)
        draw.text((button_pos[0] + 10, button_pos[1] + 10), "Sample Button", fill=button_text_color, font=text_font)
        y_pos += 60
        
        # Sample entry field representation
        entry_color = theme.entry_bg
        entry_text_color = theme.entry_fg
        entry_pos = (40, y_pos, 300, y_pos + 30)
        draw.rectangle(entry_pos, fill=entry_color, outline=theme.select_bg, width=1)
        draw.text((entry_pos[0] + 5, entry_pos[1] + 5), "Sample Entry Field", fill=entry_text_color, font=text_font)
        y_pos += 50
        
        # Sample listbox representation
        listbox_color = theme.entry_bg
        listbox_text_color = theme.entry_fg
        listbox_pos = (40, y_pos, 250, y_pos + 100)
        draw.rectangle(listbox_pos, fill=listbox_color, outline=theme.select_bg, width=1)
        
        # Draw sample list items
        list_items = ["Item 1", "Item 2", "Item 3", "Item 4"]
        for i, item in enumerate(list_items):
            item_y = listbox_pos[1] + 5 + (i * 20)
            draw.text((listbox_pos[0] + 5, item_y), item, fill=listbox_text_color if i % 2 == 0 else theme.fg, font=text_font)
        y_pos += 120
        
        # Add theme description
        desc_font = design_font_manager.get_font("Roboto", 12, "normal")
        # Truncate description if necessary
        description = theme.description
        max_desc_width = width - 40
        truncated_desc = self._truncate_text(draw, description, desc_font, max_desc_width)
        draw.text((20, y_pos + 20), f"Description: {truncated_desc}", fill=theme.fg, font=desc_font)
        
        # Add color palette information
        color_y = height - 80
        color_width = 40
        color_height = 40
        
        # Draw sample color boxes
        colors = [
            ("Background", theme.bg),
            ("Foreground", theme.fg),
            ("Select BG", theme.select_bg),
            ("Select FG", theme.select_fg),
            ("Button BG", theme.button_bg),
            ("Button FG", theme.button_fg),
        ]
        
        for i, (name, color) in enumerate(colors):
            col_x = 20 + (i % 3) * (color_width + 10)
            col_y = color_y + (i // 3) * (color_height + 20)
            
            # Draw color box
            draw.rectangle([col_x, col_y, col_x + color_width, col_y + color_height], fill=color, outline="gray", width=1)
            
            # Draw color name
            draw.text((col_x, col_y + color_height + 5), name, fill=theme.fg, font=desc_font)
        
        # Save the image
        output_path = self.output_dir / f"{theme_name}_theme_preview.png"
        img.save(output_path)
        return output_path
    
    def _truncate_text(self, draw: ImageDraw.Draw, text: str, font: ImageFont.ImageFont, max_width: int) -> str:
        """
        Truncate text to fit within the specified width.
        """
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        
        if text_width <= max_width:
            return text
        
        # Truncate text and add ellipsis
        truncated = text
        while len(truncated) > 3:
            truncated = truncated[:-4] + "..."
            bbox = draw.textbbox((0, 0), truncated, font=font)
            text_width = bbox[2] - bbox[0]
            if text_width <= max_width:
                break
        
        return truncated
    
    def generate_all_theme_previews(self) -> List[Path]:
        """
        Generate previews for all available themes.
        
        Returns:
            List of paths to generated preview images
        """
        preview_paths = []
        
        for theme_name in theme_manager.themes.keys():
            preview_path = self.generate_theme_preview(theme_name)
            if preview_path:
                preview_paths.append(preview_path)
        
        return preview_paths


def create_visual_theme_previews():
    """
    Create visual previews for all themes in the system.
    """
    preview_generator = VisualThemePreviewGenerator()
    preview_paths = preview_generator.generate_all_theme_previews()
    
    print(f"Generated {len(preview_paths)} theme previews:")
    for path in preview_paths:
        print(f"  - {path}")
    
    return preview_paths


if __name__ == "__main__":
    print("Generating visual theme previews...")
    create_visual_theme_previews()
    print("Visual theme previews generated successfully!")