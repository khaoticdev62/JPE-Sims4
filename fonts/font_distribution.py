"""
Font Distribution System for JPE Sims 4 Mod Translator.

This module handles the distribution and installation of bundled fonts
that come with the application.
"""

import os
import sys
from pathlib import Path
import shutil
import zipfile
from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class BundledFont:
    """Information about a bundled font."""
    name: str
    file_name: str
    family: str
    style: str
    category: str  # 'serif', 'sans-serif', 'monospace', 'display', 'script'
    license: str
    description: str
    source: str  # Where to obtain the font


class FontDistributionManager:
    """Manages the distribution of bundled fonts with the application."""
    
    def __init__(self, fonts_dir: Optional[Path] = None):
        if fonts_dir is None:
            self.fonts_dir = Path(__file__).parent / "bundled_fonts"
        else:
            self.fonts_dir = fonts_dir
            
        self.fonts_dir.mkdir(exist_ok=True)
        self.bundled_fonts: List[BundledFont] = []
        self._load_bundled_fonts()
    
    def _load_bundled_fonts(self):
        """Load information about bundled fonts."""
        # Define a comprehensive collection of compatible fonts
        # These are well-known open-source fonts that are compatible with the application
        
        self.bundled_fonts = [
            # Sans-serif fonts
            BundledFont(
                name="Roboto",
                file_name="Roboto-Regular.ttf",
                family="Roboto",
                style="Regular",
                category="sans-serif",
                license="Apache 2.0",
                description="A neo-grotesque sans-serif typeface designed by Christian Robertson",
                source="Google Fonts"
            ),
            BundledFont(
                name="Open Sans",
                file_name="OpenSans-Regular.ttf",
                family="Open Sans",
                style="Regular",
                category="sans-serif",
                license="Apache 2.0",
                description="Humanist sans-serif typeface designed by Steve Matteson",
                source="Google Fonts"
            ),
            BundledFont(
                name="Lato",
                file_name="Lato-Regular.ttf",
                family="Lato",
                style="Regular",
                category="sans-serif",
                license="Open Font License",
                description="Semi-rounded humanist sans-serif designed by Łukasz Dziedzic",
                source="Google Fonts"
            ),
            BundledFont(
                name="Source Sans Pro",
                file_name="SourceSansPro-Regular.ttf",
                family="Source Sans Pro",
                style="Regular",
                category="sans-serif",
                license="Open Font License",
                description="Simple, straightforward sans serif family designed by Paul D. Hunt",
                source="Adobe Fonts"
            ),
            BundledFont(
                name="Ubuntu",
                file_name="Ubuntu-Regular.ttf",
                family="Ubuntu",
                style="Regular",
                category="sans-serif",
                license="Ubuntu Font License",
                description="Modern, friendly and highly legible typeface designed by Dalton Maag",
                source="Ubuntu Project"
            ),
            BundledFont(
                name="Fira Sans",
                file_name="FiraSans-Regular.ttf",
                family="Fira Sans",
                style="Regular",
                category="sans-serif",
                license="Mozilla Public License",
                description="Humanist sans-serif family designed by Carrois Apostrophe for Mozilla",
                source="Mozilla"
            ),
            BundledFont(
                name="Noto Sans",
                file_name="NotoSans-Regular.ttf",
                family="Noto Sans",
                style="Regular",
                category="sans-serif",
                license="SIL Open Font License",
                description="Google's font family that aims to support all languages",
                source="Google Fonts"
            ),
            
            # Serif fonts
            BundledFont(
                name="Roboto Slab",
                file_name="RobotoSlab-Regular.ttf",
                family="Roboto Slab",
                style="Regular",
                category="serif",
                license="Apache 2.0",
                description="Slab-serif version of Roboto designed by Christian Robertson",
                source="Google Fonts"
            ),
            BundledFont(
                name="Merriweather",
                file_name="Merriweather-Regular.ttf",
                family="Merriweather",
                style="Regular",
                category="serif",
                license="SIL Open Font License",
                description="Serif typeface designed by Eben Sorkin for online reading",
                source="Google Fonts"
            ),
            BundledFont(
                name="Source Serif Pro",
                file_name="SourceSerifPro-Regular.ttf",
                family="Source Serif Pro",
                style="Regular",
                category="serif",
                license="Open Font License",
                description="Traditional-style serif designed by Frank Grießhammer",
                source="Adobe Fonts"
            ),
            BundledFont(
                name="Crimson Text",
                file_name="CrimsonText-Regular.ttf",
                family="Crimson Text",
                style="Regular",
                category="serif",
                license="SIL Open Font License",
                description="Designed for body text in books and journals by Sebastian Kosch",
                source="Google Fonts"
            ),
            BundledFont(
                name="PT Serif",
                file_name="PTSerif-Regular.ttf",
                family="PT Serif",
                style="Regular",
                category="serif",
                license="Open Font License",
                description="Classical proportional uppercase and modern lowercase serif by ParaType",
                source="Google Fonts"
            ),
            
            # Monospace fonts
            BundledFont(
                name="Roboto Mono",
                file_name="RobotoMono-Regular.ttf",
                family="Roboto Mono",
                style="Regular",
                category="monospace",
                license="Apache 2.0",
                description="Monospaced version of Roboto designed for code and technical text",
                source="Google Fonts"
            ),
            BundledFont(
                name="Fira Code",
                file_name="FiraCode-Regular.ttf",
                family="Fira Code",
                style="Regular",
                category="monospace",
                license="Mozilla Public License",
                description="Monospaced font with programming ligatures by Nikita Prokopov",
                source="GitHub"
            ),
            BundledFont(
                name="Source Code Pro",
                file_name="SourceCodePro-Regular.ttf",
                family="Source Code Pro",
                style="Regular",
                category="monospace",
                license="Open Font License",
                description="Monospaced font family for user interface and coding environments",
                source="Adobe Fonts"
            ),
            BundledFont(
                name="Ubuntu Mono",
                file_name="UbuntuMono-Regular.ttf",
                family="Ubuntu Mono",
                style="Regular",
                category="monospace",
                license="Ubuntu Font License",
                description="Monospace derivative of Ubuntu font family",
                source="Ubuntu Project"
            ),
            BundledFont(
                name="Inconsolata",
                file_name="Inconsolata-Regular.ttf",
                family="Inconsolata",
                style="Regular",
                category="monospace",
                license="SIL Open Font License",
                description="Monospace font by Raph Levien designed for code",
                source="Google Fonts"
            ),
            BundledFont(
                name="Cousine",
                file_name="Cousine-Regular.ttf",
                family="Cousine",
                style="Regular",
                category="monospace",
                license="Apache 2.0",
                description="Metric-compatible with Courier New by Steve Matteson",
                source="Google Fonts"
            ),
            
            # Display/fonts for headings
            BundledFont(
                name="Oswald",
                file_name="Oswald-Regular.ttf",
                family="Oswald",
                style="Regular",
                category="display",
                license="SIL Open Font License",
                description="Semi-condensed uppercase font by Vernon Adams",
                source="Google Fonts"
            ),
            BundledFont(
                name="Montserrat",
                file_name="Montserrat-Regular.ttf",
                family="Montserrat",
                style="Regular",
                category="display",
                license="SIL Open Font License",
                description="Geometric sans-serif inspired by old posters and signs from Montserrat neighborhood",
                source="Google Fonts"
            ),
            BundledFont(
                name="Raleway",
                file_name="Raleway-Regular.ttf",
                family="Raleway",
                style="Regular",
                category="display",
                license="SIL Open Font License",
                description="Elegant and simple typeface by Matt McInerney",
                source="Google Fonts"
            ),
            BundledFont(
                name="Playfair Display",
                file_name="PlayfairDisplay-Regular.ttf",
                family="Playfair Display",
                style="Regular",
                category="display",
                license="SIL Open Font License",
                description="Transitional serif typeface designed for headings by Claus Eggers Sørensen",
                source="Google Fonts"
            ),
        ]
    
    def get_bundled_fonts_by_category(self, category: str) -> List[BundledFont]:
        """Get bundled fonts by category."""
        return [font for font in self.bundled_fonts if font.category == category]
    
    def get_all_bundled_fonts(self) -> List[BundledFont]:
        """Get all bundled fonts."""
        return self.bundled_fonts.copy()
    
    def get_font_path(self, font_file_name: str) -> Optional[Path]:
        """Get the path to a bundled font file."""
        font_path = self.fonts_dir / font_file_name
        if font_path.exists():
            return font_path
        return None
    
    def create_bundled_fonts_info(self) -> Dict[str, List[Dict]]:
        """Create information about bundled fonts in a structured format."""
        categories = {}
        for font in self.bundled_fonts:
            if font.category not in categories:
                categories[font.category] = []
            categories[font.category].append({
                "name": font.name,
                "family": font.family,
                "style": font.style,
                "license": font.license,
                "description": font.description,
                "source": font.source
            })
        return categories
    
    def get_license_compliance_info(self) -> str:
        """Generate license compliance information for bundled fonts."""
        info = "Font License Compliance Information\n"
        info += "=" * 40 + "\n\n"
        
        for font in self.bundled_fonts:
            info += f"Font: {font.name} ({font.family} {font.style})\n"
            info += f"Category: {font.category}\n"
            info += f"License: {font.license}\n"
            info += f"Source: {font.source}\n"
            info += f"Description: {font.description}\n"
            info += "-" * 40 + "\n\n"
        
        return info


# Create a global instance
font_distribution_manager = FontDistributionManager()