"""
Color Management System for JPE Sims 4 Mod Translator.

This module provides an extensive collection of color swatches and color management
utilities that expand customization options beyond the existing theme system.
"""

import json
import colorsys
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class ColorSwatch:
    """Represents a color swatch with its properties."""
    name: str
    hex_code: str
    category: str
    description: str
    is_accent: bool = False


class ColorManager:
    """Manages color swatches and provides color utilities for the application."""
    
    def __init__(self):
        self.swatches: Dict[str, ColorSwatch] = {}
        self.category_map: Dict[str, List[str]] = {}
        self._load_default_swatches()
    
    def _load_default_swatches(self):
        """Load the default collection of color swatches."""
        # Define 50+ additional color swatches organized by category
        swatches_data = [
            # Red family
            ColorSwatch("Crimson", "#DC143C", "Red", "Vivid red with blue undertones", True),
            ColorSwatch("FireBrick", "#B22222", "Red", "Strong red color", True),
            ColorSwatch("IndianRed", "#CD5C5C", "Red", "Medium reddish color", True),
            ColorSwatch("LightCoral", "#F08080", "Red", "Light coral color", True),
            ColorSwatch("Salmon", "#FA8072", "Red", "Slightly desaturated orangey-red", True),
            ColorSwatch("DarkSalmon", "#E9967A", "Red", "Dark variant of salmon", True),
            ColorSwatch("LightSalmon", "#FFA07A", "Red", "Light variant of salmon", True),
            ColorSwatch("Red", "#FF0000", "Red", "Pure red color", True),
            ColorSwatch("OrangeRed", "#FF4500", "Red", "Red-orange color", True),
            ColorSwatch("Tomato", "#FF6347", "Red", "Bright red-orange color", True),
            ColorSwatch("Coral", "#FF7F50", "Red", "Soft orangey-red color", True),
            
            # Orange family
            ColorSwatch("DarkOrange", "#FF8C00", "Orange", "Dark orange color", True),
            ColorSwatch("Orange", "#FFA500", "Orange", "Pure orange color", True),
            ColorSwatch("Gold", "#FFD700", "Orange", "Rich golden color", True),
            ColorSwatch("Khaki", "#F0E68C", "Orange", "Light yellow-brown color", True),
            ColorSwatch("PeachPuff", "#FFDAB9", "Orange", "Soft peach color", True),
            ColorSwatch("Moccasin", "#FFE4B5", "Orange", "Light brownish color", True),
            ColorSwatch("PapayaWhip", "#FFEFD5", "Orange", "Light creamy color", True),
            ColorSwatch("BlanchedAlmond", "#FFEBCD", "Orange", "Off-white with warm undertones", True),
            ColorSwatch("NavajoWhite", "#FFDEAD", "Orange", "Light brownish-white", True),
            ColorSwatch("Linen", "#FDF0E0", "Orange", "Off-white color", True),
            
            # Yellow family
            ColorSwatch("Yellow", "#FFFF00", "Yellow", "Pure yellow color", True),
            ColorSwatch("LemonChiffon", "#FFFACD", "Yellow", "Light yellow color", True),
            ColorSwatch("LightGoldenrodYellow", "#FAFAD2", "Yellow", "Soft yellow", True),
            ColorSwatch("LightYellow", "#FFFFE0", "Yellow", "Very pale yellow", True),
            ColorSwatch("PaleGoldenrod", "#EEE8AA", "Yellow", "Soft golden color", True),
            ColorSwatch("Khaki", "#F0E68C", "Yellow", "Yellow-brown color", True),
            ColorSwatch("DarkKhaki", "#BDB76B", "Yellow", "Dark yellow-brown color", True),
            ColorSwatch("Gold", "#FFD700", "Yellow", "Rich golden color", True),
            ColorSwatch("Goldenrod", "#DAA520", "Yellow", "Golden-brown color", True),
            ColorSwatch("DarkGoldenrod", "#B8860B", "Yellow", "Dark golden-brown color", True),
            
            # Green family
            ColorSwatch("LimeGreen", "#32CD32", "Green", "Bright green color", True),
            ColorSwatch("Lime", "#00FF00", "Green", "Pure lime color", True),
            ColorSwatch("LawnGreen", "#7CFC00", "Green", "Grassy green color", True),
            ColorSwatch("Chartreuse", "#7FFF00", "Green", "Yellow-green color", True),
            ColorSwatch("GreenYellow", "#ADFF2F", "Green", "Yellowish green color", True),
            ColorSwatch("YellowGreen", "#9ACD32", "Green", "Greenish yellow color", True),
            ColorSwatch("OliveDrab", "#6B8E23", "Green", "Brownish green color", True),
            ColorSwatch("Olive", "#808000", "Green", "Slightly yellowish green", True),
            ColorSwatch("DarkOliveGreen", "#556B2F", "Green", "Dark brownish green color", True),
            ColorSwatch("DarkSeaGreen", "#8FBC8F", "Green", "Dark seafoam green color", True),
            ColorSwatch("SeaGreen", "#2E8B57", "Green", "Ocean green color", True),
            ColorSwatch("DarkGreen", "#006400", "Green", "Deep green color", True),
            
            # Blue family
            ColorSwatch("MediumBlue", "#0000CD", "Blue", "Medium blue color", True),
            ColorSwatch("DarkBlue", "#00008B", "Blue", "Deep blue color", True),
            ColorSwatch("Navy", "#000080", "Blue", "Dark blue color", True),
            ColorSwatch("RoyalBlue", "#4169E1", "Blue", "Rich blue color", True),
            ColorSwatch("SteelBlue", "#4682B4", "Blue", "Blue-gray color", True),
            ColorSwatch("CornflowerBlue", "#6495ED", "Blue", "Bright blue color", True),
            ColorSwatch("DodgerBlue", "#1E90FF", "Blue", "Bright blue color", True),
            ColorSwatch("DeepSkyBlue", "#00BFFF", "Blue", "Vivid blue color", True),
            ColorSwatch("LightSkyBlue", "#87CEFA", "Blue", "Soft blue color", True),
            ColorSwatch("SkyBlue", "#87CEEB", "Blue", "Light blue color", True),
            ColorSwatch("LightBlue", "#ADD8E6", "Blue", "Pale blue color", True),
            
            # Purple family
            ColorSwatch("Purple", "#800080", "Purple", "Rich purple color", True),
            ColorSwatch("Indigo", "#4B0082", "Purple", "Deep purple-blue color", True),
            ColorSwatch("DarkSlateBlue", "#483D8B", "Purple", "Dark grayish blue color", True),
            ColorSwatch("BlueViolet", "#8A2BE2", "Purple", "Blue-violet color", True),
            ColorSwatch("DarkOrchid", "#9932CC", "Purple", "Dark orchid color", True),
            ColorSwatch("Fuchsia", "#FF00FF", "Purple", "Vivid magenta color", True),
            ColorSwatch("Violet", "#EE82EE", "Purple", "Light purple color", True),
            ColorSwatch("Plum", "#DDA0DD", "Purple", "Medium purple color", True),
            ColorSwatch("Orchid", "#DA70D6", "Purple", "Medium orchid color", True),
            ColorSwatch("MediumVioletRed", "#C71585", "Purple", "Rich pinkish-purple color", True),
            ColorSwatch("DeepPink", "#FF1493", "Purple", "Rich pink color", True),
            ColorSwatch("HotPink", "#FF69B4", "Purple", "Bright pink color", True),
            
            # Brown family
            ColorSwatch("SaddleBrown", "#8B4513", "Brown", "Dark brown color", True),
            ColorSwatch("Sienna", "#A0522D", "Brown", "Reddish-brown color", True),
            ColorSwatch("Chocolate", "#D2691E", "Brown", "Rich brown color", True),
            ColorSwatch("Peru", "#CD853F", "Brown", "Brownish color", True),
            ColorSwatch("SandyBrown", "#F4A460", "Brown", "Light brown color", True),
            ColorSwatch("BurlyWood", "#DEB887", "Brown", "Light brown color", True),
            ColorSwatch("Tan", "#D2B48C", "Brown", "Brownish-yellow color", True),
            ColorSwatch("RosyBrown", "#BC8F8F", "Brown", "Brownish-pink color", True),
            ColorSwatch("Wheat", "#F5DEB3", "Brown", "Light brownish color", True),
            ColorSwatch("SaddleBrown", "#8B4513", "Brown", "Dark brown color", True),
            
            # Gray family
            ColorSwatch("Silver", "#C0C0C0", "Gray", "Metallic gray color", True),
            ColorSwatch("LightGray", "#D3D3D3", "Gray", "Light gray color", True),
            ColorSwatch("Gainsboro", "#DCDCDC", "Gray", "Very light gray color", True),
            ColorSwatch("Gray", "#808080", "Gray", "Middle gray color", True),
            ColorSwatch("DimGray", "#696969", "Gray", "Dark gray color", True),
            ColorSwatch("DarkGray", "#A9A9A9", "Gray", "Dark gray color", True),
            ColorSwatch("LightSlateGray", "#778899", "Gray", "Light bluish-gray color", True),
            ColorSwatch("SlateGray", "#708090", "Gray", "Medium bluish-gray color", True),
            ColorSwatch("DarkSlateGray", "#2F4F4F", "Gray", "Dark bluish-gray color", True),
        ]
        
        # Add all swatches to the collection
        for swatch in swatches_data:
            self.swatches[swatch.name.lower()] = swatch
            
            # Group by category
            if swatch.category not in self.category_map:
                self.category_map[swatch.category] = []
            self.category_map[swatch.category].append(swatch.name.lower())
    
    def get_swatch_by_name(self, name: str) -> Optional[ColorSwatch]:
        """Get a color swatch by its name (case-insensitive)."""
        return self.swatches.get(name.lower())
    
    def get_swatches_by_category(self, category: str) -> List[ColorSwatch]:
        """Get all swatches in a specific category."""
        swatch_names = self.category_map.get(category, [])
        return [self.swatches[name] for name in swatch_names]
    
    def get_all_categories(self) -> List[str]:
        """Get list of all color categories."""
        return list(self.category_map.keys())
    
    def get_all_swatches(self) -> List[ColorSwatch]:
        """Get all color swatches."""
        return list(self.swatches.values())
    
    def get_hex_color(self, name: str) -> Optional[str]:
        """Get the hex code for a color by name."""
        swatch = self.get_swatch_by_name(name)
        return swatch.hex_code if swatch else None
    
    def generate_color_variants(self, base_hex: str, count: int = 5) -> List[str]:
        """
        Generate variants of a base color by adjusting its lightness and saturation.
        
        Args:
            base_hex: Base color in hex format (e.g., "#FF0000")
            count: Number of variants to generate
            
        Returns:
            List of hex codes for color variants
        """
        # Convert hex to RGB
        base_hex = base_hex.lstrip('#')
        rgb = tuple(int(base_hex[i:i+2], 16) for i in (0, 2, 4))
        h, l, s = colorsys.rgb_to_hls(*[x/255.0 for x in rgb])
        
        variants = []
        for i in range(count):
            # Adjust lightness to create variants
            factor = 0.7 + (i * 0.1)  # Range from 0.7 to 1.1
            new_l = max(0.1, min(0.9, l * factor))  # Keep lightness in range [0.1, 0.9]
            
            # Convert back to RGB and hex
            new_rgb = [int(x * 255) for x in colorsys.hls_to_rgb(h, new_l, s)]
            hex_code = f"#{new_rgb[0]:02x}{new_rgb[1]:02x}{new_rgb[2]:02x}"
            variants.append(hex_code)
        
        return variants
    
    def find_closest_colors(self, target_hex: str, count: int = 5) -> List[ColorSwatch]:
        """
        Find the closest colors to a target hex color from the swatch collection.
        
        Args:
            target_hex: Target color in hex format
            count: Number of closest colors to return
            
        Returns:
            List of closest ColorSwatch objects
        """
        def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
            hex_color = hex_color.lstrip('#')
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        
        def color_distance(c1: str, c2: str) -> float:
            r1, g1, b1 = hex_to_rgb(c1)
            r2, g2, b2 = hex_to_rgb(c2)
            return ((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) ** 0.5
        
        target_rgb = hex_to_rgb(target_hex)
        
        # Calculate distances to all swatches
        distances = []
        for swatch in self.swatches.values():
            distance = color_distance(target_hex, swatch.hex_code)
            distances.append((distance, swatch))
        
        # Sort by distance and return top N
        distances.sort(key=lambda x: x[0])
        return [swatch for _, swatch in distances[:count]]


# Global color manager instance
color_manager = ColorManager()