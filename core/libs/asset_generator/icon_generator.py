import sys
from pathlib import Path
import os
from typing import Union, Optional

# Add the project root to sys.path if the script is run directly
if __name__ == "__main__":
    project_root = Path(__file__).parent.parent
    sys.path.insert(0, str(project_root))

from asset_generator.base_renderer import AssetRenderer
from asset_generator.svg_renderer import SVGAssetRenderer
from asset_generator.svg_icon_processor import SVGIconProcessor # New Import
from design_system.token_manager import design_token_manager
from design_system.font_manager import font_manager
from PIL import Image
import svgwrite # New Import

class IconGenerator:
    """
    Generates icons based on design tokens and specified properties, supporting PNG and SVG output.
    Can generate icons from text or from an SVG source file.
    """
    def __init__(self, 
                 size: int, 
                 text: str = "", # Text is optional if svg_source_path is provided
                 color_token: str = "primary_blue", 
                 font_token: str = "body", 
                 background_color_token: str = "none", 
                 output_format: str = "png",
                 svg_source_path: Optional[Path] = None): # New argument
        
        self.icon_size = size
        self.text = text
        self.color = design_token_manager.get_color(color_token)
        
        font_config = design_token_manager.get_typography(font_token)
        self.font_family = font_config.get("font_family", "Roboto")
        self.font_size = int(self.icon_size * 0.7) 
        if self.font_size < 8: self.font_size = 8
        self.font_weight = font_config.get("font_weight", "normal")
        
        self.pillow_font = font_manager.get_font(self.font_family, self.font_size, self.font_weight)

        self.background_color_token = background_color_token
        self.output_format = output_format
        self.svg_source_path = svg_source_path # Store SVG source path


    def generate_icon(self) -> Union[Image.Image, str]: # Return type changed to str for SVG XML
        """
        Generates the icon image (PNG) or SVG document (as string).
        :return: A Pillow Image object or an SVG XML string.
        """
        # If an SVG source path is provided, process it
        if self.svg_source_path:
            if not self.svg_source_path.exists():
                raise FileNotFoundError(f"SVG source file not found: {self.svg_source_path}")
            
            # For SVG sources, we generate SVG output directly.
            # If PNG is requested from SVG source, user needs a separate SVG-to-PNG converter.
            if self.output_format == "png":
                 raise ValueError("PNG output from SVG source is not directly supported by this generator. Use an external tool for SVG to PNG conversion.")

            processor = SVGIconProcessor()
            svg_xml_string = processor.process_svg(
                svg_path=self.svg_source_path,
                size=self.icon_size,
                color=self.color,
                background_color=design_token_manager.get_color(self.background_color_token) if self.background_color_token != "none" else "none",
                output_format=self.output_format
            )
            return svg_xml_string

        # Else, fall back to text-based generation (existing logic)
        else:
            if self.output_format == "png":
                png_bg_color = design_token_manager.get_color(self.background_color_token) if self.background_color_token != "none" else "#00000000"
                renderer = AssetRenderer(self.icon_size, self.icon_size, background_color=png_bg_color)
                renderer.draw_text(
                    xy=(self.icon_size // 2, self.icon_size // 2), 
                    text=self.text, 
                    font=self.pillow_font, 
                    fill_color=self.color,
                    anchor="mm"
                )
                return renderer.get_image()
            
            elif self.output_format == "svg":
                svg_bg_color = design_token_manager.get_color(self.background_color_token) if self.background_color_token != "none" else "none"
                renderer = SVGAssetRenderer(self.icon_size, self.icon_size, background_color=svg_bg_color)
                renderer.add_text(
                    xy=(self.icon_size // 2, self.icon_size // 2),
                    text=self.text,
                    font_size=self.font_size,
                    fill_color=self.color,
                    font_family=self.font_family,
                    font_weight=self.font_weight,
                    text_anchor="middle",
                    alignment_baseline="middle"
                )
                return renderer.dwg # Return the svgwrite.Drawing object
            
            else:
                raise ValueError(f"Unsupported output format: {self.output_format}")

# Example Usage:
if __name__ == "__main__":
    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True)
    
    # Create a dummy SVG for testing SVG source
    dummy_svg_content = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM11 16H13V18H11V16ZM11 6H13V14H11V6Z" fill="#333333"/>
</svg>"""
    dummy_svg_path = output_dir / "dummy_info_icon.svg"
    with open(dummy_svg_path, "w") as f:
        f.write(dummy_svg_content)


    # Generate a small JPE blue icon (PNG from text)
    icon_jpe_png = IconGenerator(
        size=24, 
        text="J", 
        color_token="primary_blue",
        background_color_token="none",
        output_format="png"
    )
    icon_jpe_png.generate_icon().save(output_dir / "icon_jpe_24.png")
    print(f"Generated {output_dir / 'icon_jpe_24.png'}")

    # Generate a medium success icon (PNG from text)
    icon_success_png = IconGenerator(
        size=32, 
        text="✓", 
        color_token="bg_light",
        background_color_token="success",
        output_format="png"
    )
    icon_success_png.generate_icon().save(output_dir / "icon_success_32.png")
    print(f"Generated {output_dir / 'icon_success_32.png'}")

    # Generate a large warning icon (SVG from text)
    icon_warning_svg_text = IconGenerator(
        size=48, 
        text="!", 
        color_token="bg_light",
        background_color_token="warning",
        output_format="svg"
    )
    icon_warning_svg_text.generate_icon().save(output_dir / "icon_warning_48_text.svg")
    print(f"Generated {output_dir / 'icon_warning_48_text.svg'}")

    # NEW: Generate icon from SVG source file (SVG output)
    icon_from_svg_source = IconGenerator(
        size=64, 
        svg_source_path=dummy_svg_path,
        color_token="error",
        background_color_token="bg_medium",
        output_format="svg"
    )
    output_path_from_svg = output_dir / "icon_from_source_64.svg"
    with open(output_path_from_svg, "w", encoding="utf-8") as f:
        f.write(icon_from_svg_source.generate_icon())
    print(f"Generated {output_path_from_svg}")

    # NEW: Attempt to generate PNG from SVG source (should raise error)
    try:
        IconGenerator(
            size=32,
            svg_source_path=dummy_svg_path,
            color_token="info",
            output_format="png"
        ).generate_icon()
    except ValueError as e:
        print(f"\nExpected Error caught for PNG output from SVG source: {e}")
