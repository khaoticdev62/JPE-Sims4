from pathlib import Path
from typing import Optional, Tuple
from lxml import etree # Using lxml for robust XML parsing
import re # For color validation
import sys # New Import
import os # New Import

# Add the project root to sys.path if the script is run directly
if __name__ == "__main__":
    project_root = Path(__file__).parent.parent
    sys.path.insert(0, str(project_root))

from design_system.token_manager import design_token_manager

class SVGIconProcessor:
    """
    Processes SVG files to apply color tokens and resizing.
    """
    def __init__(self):
        pass

    def _hex_to_rgb_or_rgba(self, hex_color: str) -> str:
        """Converts hex color to rgb() or rgba() string suitable for SVG fill/stroke."""
        hex_color = hex_color.lstrip('#')
        if not re.fullmatch(r'([0-9a-fA-F]{3}){1,2}|([0-9a-fA-F]{4}){1,2}', hex_color):
            # Not a valid hex code, return as is (e.g., 'none', 'currentColor')
            return hex_color

        if len(hex_color) == 3:
            return f"#{hex_color[0]}{hex_color[0]}{hex_color[1]}{hex_color[1]}{hex_color[2]}{hex_color[2]}"
        elif len(hex_color) == 4: # #RGBA
            return f"#{hex_color[0]}{hex_color[0]}{hex_color[1]}{hex_color[1]}{hex_color[2]}{hex_color[2]}{hex_color[3]}{hex_color[3]}"
        elif len(hex_color) == 6:
            return f"#{hex_color}"
        elif len(hex_color) == 8: # #RRGGBBAA
            return f"#{hex_color}"
        return hex_color # Fallback

    def process_svg(self, 
                    svg_path: Path, 
                    size: int, 
                    color: str, 
                    background_color: str = "none", 
                    output_format: str = "svg") -> str:
        """
        Loads an SVG file, applies a fill/stroke color, resizes it, and adds a background color.
        :param svg_path: Path to the source SVG file.
        :param size: The desired width and height for the output SVG.
        :param color: The fill/stroke color to apply to SVG elements (hex string).
        :param background_color: The background color to add to the SVG (hex string or "none").
        :param output_format: Currently only 'svg' is fully supported for SVG source.
        :return: The modified SVG XML as a string.
        """
        if not svg_path.exists():
            raise FileNotFoundError(f"SVG source file not found: {svg_path}")
        
        if output_format != "svg":
            # As discussed, SVG-to-PNG conversion from SVG source is not implemented directly here
            raise ValueError("SVGIconProcessor currently only supports 'svg' as output_format for SVG sources.")

        parser = etree.XMLParser(remove_blank_text=True)
        tree = etree.parse(str(svg_path), parser)
        root = tree.getroot()

        # Define SVG namespace
        SVG_NAMESPACE = "http://www.w3.org/2000/svg"
        # nsmap = {'svg': SVG_NAMESPACE} # No need to pass nsmap to xpath directly if using full URI

        # 1. Apply size and viewBox
        original_width = root.get('width')
        original_height = root.get('height')
        
        root.set('width', f"{size}px")
        root.set('height', f"{size}px")
        
        if not root.get('viewBox') and original_width and original_height and original_width.endswith('px') and original_height.endswith('px'):
             root.set('viewBox', f"0 0 {int(original_width[:-2])} {int(original_height[:-2])}")
        
        # 2. Add background color if specified
        bg_rect = None # Initialize bg_rect
        if background_color != "none":
            # Create a rect element for the background using the full SVG namespace URI
            bg_rect = etree.Element("{%s}rect" % SVG_NAMESPACE,
                                    x="0", y="0",
                                    width="100%", height="100%",
                                    fill=self._hex_to_rgb_or_rgba(background_color))
            root.insert(0, bg_rect)

        # 3. Apply foreground color to paths and other shapes
        # Use a list of tag names with their full namespace URI
        colorable_tags = [
            "{%s}path" % SVG_NAMESPACE,
            "{%s}rect" % SVG_NAMESPACE,
            "{%s}circle" % SVG_NAMESPACE,
            "{%s}ellipse" % SVG_NAMESPACE,
            "{%s}polygon" % SVG_NAMESPACE,
            "{%s}line" % SVG_NAMESPACE,
            "{%s}polyline" % SVG_NAMESPACE,
            "{%s}text" % SVG_NAMESPACE
        ]
        
        # Find all elements that can be colored
        elements_to_color = [el for el in root.iter() if el.tag in colorable_tags]
        
        color_rgb = self._hex_to_rgb_or_rgba(color)

        for element in elements_to_color:
            # Skip the background rectangle if it's one of the selected elements
            if element is bg_rect:
                continue

            current_fill = element.get('fill')
            current_stroke = element.get('stroke')

            if current_fill not in ["none", "transparent", "currentColor"] and current_fill is not None:
                element.set('fill', color_rgb)
            elif current_fill is None: # If no fill is explicitly set, set it
                 element.set('fill', color_rgb)
            
            if current_stroke not in ["none", "transparent", "currentColor"] and current_stroke is not None:
                element.set('stroke', color_rgb)
            elif current_stroke is None and current_fill is None: # If neither fill nor stroke, set stroke
                element.set('stroke', color_rgb)
            
            if element.tag == "{%s}text" % SVG_NAMESPACE:
                element.set('fill', color_rgb)


        return etree.tostring(root, pretty_print=True, encoding='unicode')

# Example Usage:
if __name__ == "__main__":
    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True)
    
    # Create a dummy SVG for testing
    dummy_svg_content = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM11 16H13V18H11V16ZM11 6H13V14H11V6Z" fill="#333333"/>
</svg>"""
    dummy_svg_path = output_dir / "dummy_info_icon.svg"
    with open(dummy_svg_path, "w") as f:
        f.write(dummy_svg_content)

    processor = SVGIconProcessor()

    # Process and save an SVG icon with new color and size
    processed_svg_content = processor.process_svg(
        svg_path=dummy_svg_path,
        size=48,
        color=design_token_manager.get_color("primary_blue"),
        background_color=design_token_manager.get_color("bg_light")
    )
    output_svg_path = output_dir / "processed_info_icon.svg"
    with open(output_svg_path, "w", encoding="utf-8") as f:
        f.write(processed_svg_content)
    print(f"Generated {output_svg_path}")

    # Process another SVG icon with a warning color
    processed_svg_content_warning = processor.process_svg(
        svg_path=dummy_svg_path,
        size=32,
        color=design_token_manager.get_color("warning")
    )
    output_svg_path_warning = output_dir / "processed_warning_icon.svg"
    with open(output_svg_path_warning, "w", encoding="utf-8") as f:
        f.write(processed_svg_content_warning)
    print(f"Generated {output_svg_path_warning}")
