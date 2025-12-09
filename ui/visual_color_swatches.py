"""
Visual Color Swatch Preview Generator for JPE Sims 4 Mod Translator.

This module creates visual previews of color swatches using Pillow, integrating with the 
design system and asset generation stack.
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from typing import Optional, List, Dict
from ui.color_manager import color_manager, ColorSwatch
from design_system.font_manager import font_manager as design_font_manager


class VisualColorSwatchPreview:
    """
    Generates visual previews of color swatches using Pillow, with support for
    the JPE design system and asset generation stack.
    """
    
    def __init__(self, output_dir: Optional[Path] = None):
        if output_dir is None:
            self.output_dir = Path(__file__).parent / "visual_previews" / "color_swatches"
        else:
            self.output_dir = output_dir
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_category_preview(self, category: str, width: int = 800, height: int = 600) -> Optional[Path]:
        """
        Generate a visual preview of all colors in a specific category.
        
        Args:
            category: Color category to preview
            width: Width of the output image
            height: Height of the output image
            
        Returns:
            Path to the generated preview image
        """
        swatches = color_manager.get_swatches_by_category(category)
        if not swatches:
            print(f"No swatches found for category: {category}")
            return None
        
        # Create a blank image with light background
        bg_color = "#f8f9fa"
        img = Image.new('RGB', (width, height), color=bg_color)
        draw = ImageDraw.Draw(img)
        
        # Title
        try:
            title_font = design_font_manager.get_font("JetBrains Mono", 24, "bold")
        except:
            title_font = design_font_manager.get_font("Roboto", 24, "bold")
        
        draw.text((20, 20), f"Color Swatches: {category}", fill="#2c3e50", font=title_font)
        
        # Draw a separator
        draw.line([(20, 60), (width - 20, 60)], fill="#bdc3c7", width=2)
        
        # Layout swatches in a grid
        swatch_size = 80
        swatch_padding = 20
        swatches_per_row = (width - 40) // (swatch_size + swatch_padding)
        
        x_start = 20
        y_start = 80
        
        current_x = x_start
        current_y = y_start
        
        for i, swatch in enumerate(swatches):
            # Draw color swatch
            swatch_x1 = current_x
            swatch_y1 = current_y
            swatch_x2 = swatch_x1 + swatch_size
            swatch_y2 = swatch_y1 + swatch_size
            
            # Draw the color swatch
            draw.rectangle([swatch_x1, swatch_y1, swatch_x2, swatch_y2], 
                          fill=swatch.hex_code, outline="#2c3e50", width=2)
            
            # Draw color name below the swatch
            try:
                name_font = design_font_manager.get_font("Roboto", 9, "normal")
            except:
                name_font = design_font_manager.get_font("JetBrains Mono", 9, "normal")
            
            # Truncate name if too long
            name = swatch.name
            max_name_width = swatch_size
            truncated_name = self._truncate_text(draw, name, name_font, max_name_width)
            
            draw.text((swatch_x1 + 5, swatch_y2 + 5), truncated_name, fill="#2c3e50", font=name_font)
            
            # Draw hex code below name
            try:
                hex_font = design_font_manager.get_font("JetBrains Mono", 8, "normal")
            except:
                hex_font = design_font_manager.get_font("Roboto", 8, "normal")
            
            draw.text((swatch_x1 + 5, swatch_y2 + 20), swatch.hex_code, fill="#7f8c8d", font=hex_font)
            
            # Move to next position
            current_x += swatch_size + swatch_padding
            
            # If we're at the end of a row, move to next row
            if (i + 1) % swatches_per_row == 0:
                current_x = x_start
                current_y += swatch_size + 45  # Include space for text
            
            # If we're running out of vertical space, stop
            if current_y + swatch_size + 45 > height - 40:
                break
        
        # Add total count
        count_font = design_font_manager.get_font("Roboto", 12, "normal")
        draw.text((width - 200, height - 30), f"Total: {len(swatches)} colors", 
                 fill="#7f8c8d", font=count_font)
        
        # Save the image
        output_path = self.output_dir / f"{category.lower()}_color_preview.png"
        img.save(output_path)
        return output_path
    
    def generate_all_categories_preview(self, width: int = 1200, height: int = 800) -> Optional[Path]:
        """
        Generate a comprehensive preview showing all color categories.
        
        Args:
            width: Width of the output image
            height: Height of the output image
            
        Returns:
            Path to the generated preview image
        """
        categories = color_manager.get_all_categories()
        
        # Create a blank image with light background
        bg_color = "#f8f9fa"
        img = Image.new('RGB', (width, height), color=bg_color)
        draw = ImageDraw.Draw(img)
        
        # Title
        try:
            title_font = design_font_manager.get_font("JetBrains Mono", 28, "bold")
        except:
            title_font = design_font_manager.get_font("Roboto", 28, "bold")
        
        draw.text((20, 20), "All Color Swatches - Complete Collection", fill="#2c3e50", font=title_font)
        
        # Draw a separator
        draw.line([(20, 70), (width - 20, 70)], fill="#bdc3c7", width=2)
        
        # Category headers
        y_pos = 90
        header_font = design_font_manager.get_font("Roboto", 16, "bold") if design_font_manager else None
        if not header_font:
            try:
                header_font = design_font_manager.get_font("JetBrains Mono", 16, "bold")
            except:
                header_font = design_font_manager.get_font("Roboto", 16, "bold")
        
        # Calculate layout parameters
        category_width = (width - 40) // 3  # 3 categories per row
        swatch_height = 40
        swatch_padding = 10
        
        for i, category in enumerate(categories):
            swatches = color_manager.get_swatches_by_category(category)
            
            # Calculate position in grid (3 categories per row)
            col = i % 3
            row = i // 3
            
            x_start = 20 + col * category_width
            y_start = 90 + row * (swatch_height * 6 + 80)  # 5 swatches per category + padding
            
            # Draw category header
            draw.text((x_start, y_start), f"{category} ({len(swatches)} colors)", 
                     fill="#2c3e50", font=header_font)
            
            # Draw a line under the header
            draw.line([(x_start, y_start + 25), (x_start + category_width - 20, y_start + 25)], 
                     fill="#bdc3c7", width=1)
            
            # Draw up to 5 swatches for the category
            for j, swatch in enumerate(swatches[:5]):  # Limit to 5 swatches per category for overview
                swatch_y = y_start + 40 + (j * (swatch_height + swatch_padding))
                
                # Draw swatch rectangle
                swatch_rect = [x_start, swatch_y, x_start + 30, swatch_y + swatch_height - 5]
                draw.rectangle(swatch_rect, fill=swatch.hex_code, outline="#2c3e50", width=1)
                
                # Draw color name
                name_font = design_font_manager.get_font("Roboto", 10, "normal")
                draw.text((x_start + 40, swatch_y + 5), f"{swatch.name} {swatch.hex_code}", 
                         fill="#2c3e50", font=name_font)
        
        # Add total count
        total_colors = sum(len(color_manager.get_swatches_by_category(cat)) for cat in categories)
        count_font = design_font_manager.get_font("Roboto", 14, "normal")
        draw.text((width - 300, height - 30), f"Total: {len(categories)} categories, {total_colors} colors", 
                 fill="#7f8c8d", font=count_font)
        
        # Save the image
        output_path = self.output_dir / "complete_color_collection_preview.png"
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
    
    def generate_color_combination_preview(self, color1: str, color2: str, color3: str = None, 
                                          width: int = 600, height: int = 200) -> Optional[Path]:
        """
        Generate a preview showing how colors work together in combinations.
        
        Args:
            color1, color2, color3: Hex codes for colors to combine
            width: Width of the output image
            height: Height of the output image
            
        Returns:
            Path to the generated preview image
        """
        # Create a blank image
        img = Image.new('RGB', (width, height), color="#ffffff")
        draw = ImageDraw.Draw(img)
        
        # Title
        try:
            title_font = design_font_manager.get_font("JetBrains Mono", 18, "bold")
        except:
            title_font = design_font_manager.get_font("Roboto", 18, "bold")
        
        draw.text((20, 20), "Color Combination Preview", fill="#2c3e50", font=title_font)
        
        # Calculate color segment widths
        segments = 3 if color3 else 2
        segment_width = width // segments
        
        # Draw first color
        draw.rectangle([0, 60, segment_width, height - 20], fill=color1)
        draw.text((10, height - 40), f"Primary: {color1}", fill=self._get_text_color(color1), font=title_font)
        
        # Draw second color
        draw.rectangle([segment_width, 60, segment_width * 2, height - 20], fill=color2)
        draw.text((segment_width + 10, height - 40), f"Secondary: {color2}", fill=self._get_text_color(color2), font=title_font)
        
        # Draw third color if provided
        if color3:
            draw.rectangle([segment_width * 2, 60, segment_width * 3, height - 20], fill=color3)
            draw.text((segment_width * 2 + 10, height - 40), f"Accent: {color3}", fill=self._get_text_color(color3), font=title_font)
        
        # Draw separator
        draw.line([(0, 60), (width, 60)], fill="#bdc3c7", width=2)
        
        # Save the image
        color1_clean = color1.replace("#", "")
        color2_clean = color2.replace("#", "")
        color3_clean = color3.replace("#", "") if color3 else "none"
        output_path = self.output_dir / f"combo_{color1_clean}_{color2_clean}_{color3_clean}.png"
        img.save(output_path)
        return output_path
    
    def _get_text_color(self, bg_color: str) -> str:
        """
        Determine whether to use light or dark text based on background color.
        """
        # Convert hex to RGB
        bg_color = bg_color.lstrip('#')
        rgb = tuple(int(bg_color[i:i+2], 16) for i in (0, 2, 4))
        
        # Calculate luminance
        luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255
        
        # Return white for dark backgrounds, black for light backgrounds
        return "#ffffff" if luminance < 0.5 else "#000000"


def create_visual_color_previews():
    """
    Create visual previews for all color categories and the complete collection.
    """
    preview_generator = VisualColorSwatchPreview()
    preview_paths = []
    
    # Generate previews for each category
    categories = color_manager.get_all_categories()
    print(f"Generating previews for {len(categories)} categories:")
    
    for category in categories:
        preview_path = preview_generator.generate_category_preview(category)
        if preview_path:
            preview_paths.append(preview_path)
            print(f"  - {category}: {preview_path}")
    
    # Generate complete collection preview
    print("\nGenerating complete collection preview...")
    complete_preview = preview_generator.generate_all_categories_preview()
    if complete_preview:
        preview_paths.append(complete_preview)
        print(f"  - Complete Collection: {complete_preview}")
    
    print(f"\nGenerated {len(preview_paths)} color preview images")
    return preview_paths


if __name__ == "__main__":
    print("Generating visual color swatch previews...")
    create_visual_color_previews()
    print("Visual color swatch previews generated successfully!")