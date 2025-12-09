"""
Visual Font Preview Generator for JPE Sims 4 Mod Translator.

This module creates visual previews of fonts using Pillow, integrating with the 
design system font manager and asset generation system.
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from typing import Optional, Tuple, List
from fonts.font_manager import font_manager as app_font_manager
from design_system.font_manager import font_manager as design_font_manager


class VisualFontPreviewGenerator:
    """
    Generates visual previews of fonts using Pillow, with support for
    the JPE design system and asset generation stack.
    """
    
    def __init__(self, output_dir: Optional[Path] = None):
        if output_dir is None:
            self.output_dir = Path(__file__).parent / "visual_previews"
        else:
            self.output_dir = output_dir
        
        self.output_dir.mkdir(exist_ok=True)
    
    def generate_font_pack_preview(self, pack_name: str, width: int = 800, height: int = 600) -> Optional[Path]:
        """
        Generate a visual preview of a font pack with sample text.
        
        Args:
            pack_name: Name of the font pack to preview
            width: Width of the output image
            height: Height of the output image
            
        Returns:
            Path to the generated preview image
        """
        # Create a blank image with white background
        img = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(img)
        
        # Try to get the font pack
        font_pack = app_font_manager.font_packs.get(pack_name)
        if not font_pack:
            print(f"Font pack '{pack_name}' not found")
            return None
        
        # Title
        try:
            title_font = design_font_manager.get_font("JetBrains Mono", 36, "bold")
        except:
            title_font = design_font_manager.get_font("Roboto", 36, "bold")
        
        draw.text((20, 20), f"Font Pack: {pack_name}", fill='black', font=title_font)
        
        # Draw a separator
        draw.line([(20, 70), (width - 20, 70)], fill='gray', width=1)
        
        # Sample text positions
        y_pos = 90
        line_height = 40
        
        # Define sample texts for different font purposes
        samples = [
            ("default", "Sample default text: The quick brown fox jumps over the lazy dog"),
            ("header", "Sample header text: Heading Example"),
            ("monospace", "Sample monospace text: def function(): return True")
        ]
        
        # Try to preview each font type in the pack
        for font_key, sample_text in samples:
            if font_key in font_pack.fonts:
                font_def = font_pack.fonts[font_key]
                
                # Get font using design system font manager
                try:
                    # Map our font families to the design system's supported families
                    design_family = self._map_font_family(font_def.family)
                    pillow_font = design_font_manager.get_font(design_family, font_def.size, font_def.weight)
                except:
                    # Fallback to default font if mapping fails
                    pillow_font = design_font_manager.get_font("Roboto", font_def.size, font_def.weight)
                
                # Draw label for font type
                label_font = design_font_manager.get_font("JetBrains Mono", 14, "bold")
                draw.text((20, y_pos), f"{font_key.title()} Font:", fill='gray', font=label_font)
                
                y_pos += 20  # Add space for label
                
                # Draw the sample text
                try:
                    # Truncate text if it's too long
                    max_width = width - 40
                    truncated_text = self._truncate_text(draw, sample_text, pillow_font, max_width)
                    
                    draw.text((40, y_pos), truncated_text, fill='black', font=pillow_font)
                except Exception as e:
                    # If there's an issue with the specific font, use a default
                    fallback_font = design_font_manager.get_font("Roboto", font_def.size, font_def.weight)
                    truncated_text = self._truncate_text(draw, sample_text, fallback_font, max_width)
                    draw.text((40, y_pos), truncated_text, fill='black', font=fallback_font)
                
                y_pos += line_height
            
            y_pos += 10  # Add space between font types
        
        # Add pack description
        if hasattr(font_pack, 'description'):
            desc_font = design_font_manager.get_font("Roboto", 12, "normal")
            # Truncate description if necessary
            max_desc_width = width - 40
            truncated_desc = self._truncate_text(draw, font_pack.description, desc_font, max_desc_width)
            draw.text((20, y_pos + 20), f"Description: {truncated_desc}", fill='gray', font=desc_font)
        
        # Save the image
        output_path = self.output_dir / f"{pack_name}_preview.png"
        img.save(output_path)
        return output_path
    
    def _map_font_family(self, app_family: str) -> str:
        """
        Map application font families to design system font families.
        """
        family_mapping = {
            # Map common font families to supported design system fonts
            'Segoe UI': 'Roboto',
            'SF Pro Display': 'Roboto',
            'Ubuntu': 'Roboto',
            'Consolas': 'JetBrains Mono',
            'Menlo': 'JetBrains Mono',
            'Courier New': 'JetBrains Mono',
            # Default to Roboto if no specific mapping
        }
        
        return family_mapping.get(app_family, 'Roboto')
    
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
    
    def generate_all_font_pack_previews(self) -> List[Path]:
        """
        Generate previews for all available font packs.
        
        Returns:
            List of paths to generated preview images
        """
        preview_paths = []
        
        for pack_name in app_font_manager.get_available_packs():
            preview_path = self.generate_font_pack_preview(pack_name)
            if preview_path:
                preview_paths.append(preview_path)
        
        return preview_paths


def create_visual_font_previews():
    """
    Create visual previews for all font packs in the system.
    """
    preview_generator = VisualFontPreviewGenerator()
    preview_paths = preview_generator.generate_all_font_pack_previews()
    
    print(f"Generated {len(preview_paths)} font pack previews:")
    for path in preview_paths:
        print(f"  - {path}")
    
    return preview_paths


if __name__ == "__main__":
    print("Generating visual font previews...")
    create_visual_font_previews()
    print("Visual font previews generated successfully!")