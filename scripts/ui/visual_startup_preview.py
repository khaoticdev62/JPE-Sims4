"""
Visual Startup Screen Preview for JPE Sims 4 Mod Translator.

This module creates visual previews of the startup screen using Pillow, integrating with the 
design system and asset generation stack.
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from typing import Optional
from ui.jpe_branding import (
    BRAND_LIGHT, BRAND_DARK, BRAND_ACCENT,
    NEUTRAL_700, NEUTRAL_500,
    StartupScreenStyle,
    BootChecklistStyle
)
from design_system.font_manager import font_manager as design_font_manager


class VisualStartupPreviewGenerator:
    """
    Generates visual previews of the startup screen using Pillow, with support for
    the JPE design system and asset generation stack.
    """
    
    def __init__(self, output_dir: Optional[Path] = None):
        if output_dir is None:
            self.output_dir = Path(__file__).parent / "visual_previews" / "startup"
        else:
            self.output_dir = output_dir
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_startup_preview(self, width: int = 700, height: int = 600) -> Optional[Path]:
        """
        Generate a visual preview of the startup screen.
        
        Args:
            width: Width of the output image
            height: Height of the output image
            
        Returns:
            Path to the generated preview image
        """
        # Create a blank image with brand light background (matching StartupScreenStyle)
        img = Image.new('RGB', (width, height), color=BRAND_LIGHT)
        draw = ImageDraw.Draw(img)
        
        # Draw header section
        header_height = 150
        draw.rectangle([0, 0, width, header_height], fill=BRAND_LIGHT)
        
        # Title using brand accent color and appropriate font
        try:
            title_font = design_font_manager.get_font("JetBrains Mono", StartupScreenStyle.TITLE_FONT_SIZE, "bold")
        except:
            title_font = design_font_manager.get_font("Roboto", StartupScreenStyle.TITLE_FONT_SIZE, "bold")
        
        draw.text((30, 30), StartupScreenStyle.TITLE_TEXT, fill=BRAND_ACCENT, font=title_font)
        
        # Subtitle using neutral secondary text color
        try:
            subtitle_font = design_font_manager.get_font("Roboto", StartupScreenStyle.SUBTITLE_FONT_SIZE, "normal")
        except:
            subtitle_font = design_font_manager.get_font("JetBrains Mono", StartupScreenStyle.SUBTITLE_FONT_SIZE, "normal")
        
        draw.text((30, 70), StartupScreenStyle.SUBTITLE_TEXT, fill=NEUTRAL_700, font=subtitle_font)
        
        # Draw separator
        separator_y = 100
        draw.line([(30, separator_y), (width - 30, separator_y)], fill=NEUTRAL_500, width=1)
        
        # Simulate checklist items
        checklist_y = separator_y + 30
        checklist_height = height - checklist_y - 20
        
        # Draw checklist background
        draw.rectangle([20, checklist_y, width - 20, height - 20], fill="white", outline=NEUTRAL_500, width=1)
        
        # Sample checklist items with different statuses
        items = [
            ("System Requirements", "success"),
            ("Configuration", "success"),
            ("Security", "checking"),
            ("Themes", "pending"),
            ("Engine", "pending"),
            ("Plugins", "pending"),
            ("Cloud", "pending"),
            ("Onboarding", "pending"),
        ]
        
        item_y = checklist_y + 10
        item_height = 40
        item_padding = 8
        
        for item_name, status in items:
            # Status indicator - using BootChecklistStyle
            symbols = BootChecklistStyle.STATUS_SYMBOLS
            colors = BootChecklistStyle.STATUS_COLORS
            
            status_symbol = symbols.get(status, "○")
            status_color = colors.get(status, NEUTRAL_500)
            
            # Draw status symbol
            symbol_font = design_font_manager.get_font("JetBrains Mono", 14, "bold")
            draw.text((30, item_y + 5), status_symbol, fill=status_color, font=symbol_font)
            
            # Draw item name
            item_font = design_font_manager.get_font("Roboto", 10, "normal")
            draw.text((60, item_y + 5), item_name, fill=BRAND_DARK, font=item_font)
            
            # Draw progress bar for "checking" items
            if status == "checking":
                progress_x = 30
                progress_y = item_y + 25
                progress_width = width - 80
                progress_height = 6
                
                # Background
                draw.rectangle([progress_x, progress_y, progress_x + progress_width, progress_y + progress_height], 
                              fill=BootChecklistStyle.PROGRESS_BG)
                
                # Progress indicator (simulate 60% complete)
                progress_fill_width = int(progress_width * 0.6)
                draw.rectangle([progress_x, progress_y, progress_x + progress_fill_width, progress_y + progress_height], 
                              fill=BootChecklistStyle.PROGRESS_COLOR)
            
            item_y += item_height
        
        # Draw footer with branding
        footer_y = height - 40
        draw.rectangle([0, footer_y, width, height], fill=BRAND_DARK)
        
        try:
            footer_font = design_font_manager.get_font("Roboto", 9, "normal")
        except:
            footer_font = design_font_manager.get_font("JetBrains Mono", 9, "normal")
        
        draw.text((20, footer_y + 12), "JPE Sims 4 Mod Translator - Starting...", fill=BRAND_LIGHT, font=footer_font)
        
        # Save the image
        output_path = self.output_dir / "startup_preview.png"
        img.save(output_path)
        return output_path


def create_visual_startup_preview():
    """
    Create a visual preview of the startup screen.
    """
    preview_generator = VisualStartupPreviewGenerator()
    preview_path = preview_generator.generate_startup_preview()
    
    if preview_path:
        print(f"Generated startup screen preview: {preview_path}")
        return preview_path
    else:
        print("Failed to generate startup screen preview")
        return None


if __name__ == "__main__":
    print("Generating visual startup screen preview...")
    create_visual_startup_preview()
    print("Visual startup screen preview generated successfully!")