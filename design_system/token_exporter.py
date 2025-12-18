import json
from pathlib import Path
from typing import Dict, Any, Tuple
import sys
import os

# Add the project root to sys.path if the script is run directly
if __name__ == "__main__":
    project_root = Path(__file__).parent.parent
    sys.path.insert(0, str(project_root))

from design_system.token_manager import design_token_manager

class TokenExporter:
    """
    Exports design tokens into various frontend formats.
    """

    def __init__(self):
        self.tokens = design_token_manager.get_all_tokens()

    def _to_camel_case(self, snake_str: str) -> str:
        """Converts a snake_case string to camelCase."""
        components = snake_str.split('_')
        return components[0] + ''.join(x.title() for x in components[1:])

    def _hex_to_rgba_css(self, hex_color: str) -> str:
        """Converts a hex color string to an rgba() CSS string."""
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 6:
            r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
            return f"rgb({r}, {g}, {b})"
        elif len(hex_color) == 8:
            r, g, b, a = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16), int(hex_color[6:8], 16)
            alpha = round(a / 255, 2)
            return f"rgba({r}, {g}, {b}, {alpha})"
        return hex_color # Return as is if not a valid hex format

    def to_css_variables(self) -> str:
        """
        Converts design tokens into a CSS variables string.
        """
        css_output = []
        css_output.append(":root {")

        # Colors
        for key, value in self.tokens.get("colors", {}).items():
            css_output.append(f"  --jpe-color-{key.replace('_', '-')}: {self._hex_to_rgba_css(value)};")

        # Typography
        for key, value in self.tokens.get("typography", {}).items():
            css_output.append(f"  --jpe-font-{key.replace('_', '-')}-family: \"{value.get('font_family')}\";")
            css_output.append(f"  --jpe-font-{key.replace('_', '-')}-size: {value.get('font_size')}px;")
            css_output.append(f"  --jpe-font-{key.replace('_', '-')}-weight: {value.get('font_weight')};")

        # Spacing
        for key, value in self.tokens.get("spacing", {}).items():
            css_output.append(f"  --jpe-spacing-{key.replace('_', '-')}: {value}px;")

        # Border Radii
        for key, value in self.tokens.get("border_radii", {}).items():
            css_output.append(f"  --jpe-border-radius-{key.replace('_', '-')}: {value}px;")

        # Shadows
        for key, value in self.tokens.get("shadows", {}).items():
            if key == "none":
                css_output.append(f"  --jpe-shadow-{key.replace('_', '-')}: none;")
            else:
                offset_x = f"{value.get('offset_x', 0)}px"
                offset_y = f"{value.get('offset_y', 0)}px"
                blur = f"{value.get('blur', 0)}px"
                color = self._hex_to_rgba_css(value.get('color', '#00000000'))
                css_output.append(f"  --jpe-shadow-{key.replace('_', '-')}: {offset_x} {offset_y} {blur} {color};")

        css_output.append("}")
        return "\n".join(css_output)

    def to_react_native_theme(self) -> str:
        """
        Converts design tokens into a JavaScript object string suitable for React Native.
        """
        theme_object = {
            "colors": {},
            "typography": {},
            "spacing": {},
            "borderRadii": {},
            "shadows": {}
        }

        # Colors
        for key, value in self.tokens.get("colors", {}).items():
            theme_object["colors"][self._to_camel_case(key)] = value # RN uses direct hex/rgba strings

        # Typography
        for key, value in self.tokens.get("typography", {}).items():
            camel_key = self._to_camel_case(key)
            theme_object["typography"][camel_key] = {
                "fontFamily": value.get("font_family"),
                "fontSize": value.get("font_size"),
                "fontWeight": value.get("font_weight") # RN uses string for fontWeight
            }

        # Spacing
        for key, value in self.tokens.get("spacing", {}).items():
            theme_object["spacing"][self._to_camel_case(key)] = value

        # Border Radii
        for key, value in self.tokens.get("border_radii", {}).items():
            theme_object["borderRadii"][self._to_camel_case(key)] = value

        # Shadows (generic object, RN app will map to platform-specific shadow props)
        for key, value in self.tokens.get("shadows", {}).items():
            camel_key = self._to_camel_case(key)
            if key == "none":
                theme_object["shadows"][camel_key] = {} # Or null, depending on how RN app handles 'none'
            else:
                theme_object["shadows"][camel_key] = {
                    "offsetX": value.get("offset_x", 0),
                    "offsetY": value.get("offset_y", 0),
                    "blur": value.get("blur", 0),
                    "color": value.get("color", "#00000000") # Keep as hex/rgba for RN consumption
                }
        
        # Convert the Python dict to a pretty-printed JSON string, then to JS object
        json_str = json.dumps(theme_object, indent=2)
        js_str = f"const designTokens = {json_str};\n\nexport default designTokens;"
        return js_str


# Example Usage:
if __name__ == "__main__":
    exporter = TokenExporter()
    
    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True)

    # CSS Variables Export
    css_variables = exporter.to_css_variables()
    output_css_file = output_dir / "jpe_design_tokens.css"
    with open(output_css_file, "w", encoding="utf-8") as f:
        f.write(css_variables)
    print(f"Generated CSS variables to {output_css_file}")

    # React Native Theme Export
    rn_theme = exporter.to_react_native_theme()
    output_rn_file = output_dir / "jpe_design_tokens.js"
    with open(output_rn_file, "w", encoding="utf-8") as f:
        f.write(rn_theme)
    print(f"Generated React Native theme to {output_rn_file}")
