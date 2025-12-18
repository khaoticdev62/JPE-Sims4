from pathlib import Path
from PIL import ImageFont
from typing import Dict, Any, Optional
import os

class FontManager:
    """
    Manages loading and providing access to bundled font files.
    Ensures consistent font usage across asset generation.
    """
    _instance = None
    _loaded_fonts: Dict[str, ImageFont.ImageFont] = {} # Cache for loaded fonts

    FONT_BASE_DIR = Path(__file__).parent / "fonts"

    # Define a mapping from generic font_weight strings to specific font filenames
    # This assumes a consistent naming convention for bundled fonts.
    FONT_WEIGHT_MAP = {
        "roboto": {
            "normal": "Roboto-Regular.ttf",
            "regular": "Roboto-Regular.ttf",
            "500": "Roboto-Medium.ttf", # Roboto Medium often maps to 500
            "600": "Roboto-Bold.ttf", # Roboto Bold often maps to 600 or semibold
            "bold": "Roboto-Bold.ttf"
        },
        "jetbrains mono": { # ADDED: JetBrains Mono
            "normal": "JetBrainsMono-Regular.ttf",
            "regular": "JetBrainsMono-Regular.ttf",
            "medium": "JetBrainsMono-Medium.ttf",
            "500": "JetBrainsMono-Medium.ttf",
            "bold": "JetBrainsMono-Bold.ttf",
            "600": "JetBrainsMono-Bold.ttf"
        },
        # Can add other font families here
        "segoe ui": { # Fallback for system fonts if needed, but less robust
            "normal": "segoeui.ttf",
            "bold": "segoeuib.ttf"
        }
    }

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FontManager, cls).__new__(cls)
            cls._instance._loaded_fonts = {} # Initialize cache on first creation
        return cls._instance

    def get_font(self, 
                 font_family: str, 
                 font_size: int, 
                 font_weight: str = "normal") -> ImageFont.ImageFont:
        """
        Retrieves a Pillow ImageFont object for the specified family, size, and weight.
        Manages loading and caching of font files.
        """
        cache_key = f"{font_family}-{font_size}-{font_weight}"
        if cache_key in self._loaded_fonts:
            return self._loaded_fonts[cache_key]

        font_filename = None
        # Normalize font_family and font_weight for lookup
        normalized_family = font_family.lower()
        normalized_weight = font_weight.lower()

        if normalized_family in self.FONT_WEIGHT_MAP:
            font_filename = self.FONT_WEIGHT_MAP[normalized_family].get(normalized_weight)
            if not font_filename:
                # Try to fall back to 'normal' or 'bold' if specific weight not found
                if normalized_weight in ["500", "600", "semibold"]:
                    font_filename = self.FONT_WEIGHT_MAP[normalized_family].get("bold") or self.FONT_WEIGHT_MAP[normalized_family].get("regular")
                else:
                    font_filename = self.FONT_WEIGHT_MAP[normalized_family].get("normal") or self.FONT_WEIGHT_MAP[normalized_family].get("regular")

        font_path: Optional[Path] = None
        if font_filename:
            # Check bundled fonts directory (direct in FONT_BASE_DIR)
            bundled_path_direct = self.FONT_BASE_DIR / font_filename
            # Check bundled fonts directory (within font family subdirectory)
            bundled_path_subdir = self.FONT_BASE_DIR / normalized_family.capitalize() / font_filename

            if bundled_path_direct.exists():
                font_path = bundled_path_direct
            elif bundled_path_subdir.exists(): 
                font_path = bundled_path_subdir
            # If not found in bundled, and it's a system font (e.g., Segoe UI), try system path
            elif normalized_family == "segoe ui" and os.name == 'nt': # Windows
                system_font_path = Path(os.environ.get("WINDIR")) / "Fonts" / font_filename
                if system_font_path.exists():
                    font_path = system_font_path

        if font_path and font_path.exists():
            try:
                font = ImageFont.truetype(str(font_path), font_size)
                self._loaded_fonts[cache_key] = font
                return font
            except IOError as e:
                print(f"Error loading font {font_path}: {e}. Falling back to default.")
        
        print(f"Warning: Specific font '{font_family}' (weight: '{font_weight}', size: {font_size}) not found or could not be loaded. Using default Pillow font.")
        font = ImageFont.load_default(size=font_size) # Fallback if specific font fails
        self._loaded_fonts[cache_key] = font
        return font

# Global instance for easy access
font_manager = FontManager()

# Example usage (for testing purposes, if you have Roboto fonts)
if __name__ == "__main__":
    # To run this example, you would need to place Roboto-Regular.ttf and Roboto-Bold.ttf
    # (and optionally Roboto-Medium.ttf) into the design_system/fonts/ directory.
    print(f"Font base directory: {FontManager.FONT_BASE_DIR}")
    FontManager.FONT_BASE_DIR.mkdir(parents=True, exist_ok=True) # Ensure dir exists

    # --- Test with JetBrains Mono ---
    # Assuming JetBrainsMono-Regular.ttf, -Medium.ttf, -Bold.ttf are in design_system/fonts/JetBrainsMono/
    print("\n--- Testing JetBrains Mono ---")
    jb_mono_dir = FontManager.FONT_BASE_DIR / "JetBrainsMono"
    jb_mono_dir.mkdir(parents=True, exist_ok=True) # Ensure dir exists

    mock_jb_regular_path = jb_mono_dir / "JetBrainsMono-Regular.ttf"
    mock_jb_medium_path = jb_mono_dir / "JetBrainsMono-Medium.ttf"
    mock_jb_bold_path = jb_mono_dir / "JetBrainsMono-Bold.ttf"

    if not mock_jb_regular_path.exists():
        print(f"NOTE: Please place 'JetBrainsMono-Regular.ttf' in {mock_jb_regular_path.parent} to test properly.")
    if not mock_jb_medium_path.exists():
        print(f"NOTE: Please place 'JetBrainsMono-Medium.ttf' in {mock_jb_medium_path.parent} to test properly.")
    if not mock_jb_bold_path.exists():
        print(f"NOTE: Please place 'JetBrainsMono-Bold.ttf' in {mock_jb_bold_path.parent} to test properly.")

    try:
        font_jb_regular = font_manager.get_font("JetBrains Mono", 16, "normal")
        print(f"Loaded JetBrains Mono Regular (16pt): {font_jb_regular}")
        font_jb_medium = font_manager.get_font("JetBrains Mono", 16, "medium")
        print(f"Loaded JetBrains Mono Medium (16pt): {font_jb_medium}")
        font_jb_bold = font_manager.get_font("JetBrains Mono", 16, "bold")
        print(f"Loaded JetBrains Mono Bold (16pt): {font_jb_bold}")
    except Exception as e:
        print(f"An error occurred during JetBrains Mono FontManager example usage: {e}")

    # --- Original Roboto Test Cases (kept for reference, will likely still warn without Roboto files) ---
    print("\n--- Testing Roboto (if files are present) ---")
    roboto_dir = FontManager.FONT_BASE_DIR / "Roboto"
    roboto_dir.mkdir(parents=True, exist_ok=True)

    mock_roboto_regular_path = roboto_dir / "Roboto-Regular.ttf"
    mock_roboto_bold_path = roboto_dir / "Roboto-Bold.ttf"
    mock_roboto_medium_path = roboto_dir / "Roboto-Medium.ttf"

    if not mock_roboto_regular_path.exists():
        print(f"NOTE: Please place 'Roboto-Regular.ttf' in {mock_roboto_regular_path.parent} to test Roboto properly.")
    if not mock_roboto_bold_path.exists():
        print(f"NOTE: Please place 'Roboto-Bold.ttf' in {mock_roboto_bold_path.parent} to test Roboto properly.")
    if not mock_roboto_medium_path.exists():
        print(f"NOTE: Please place 'Roboto-Medium.ttf' in {mock_roboto_medium_path.parent} to test Roboto properly.")

    try:
        font_roboto_regular = font_manager.get_font("Roboto", 16, "normal")
        print(f"Loaded Roboto Regular (16pt): {font_roboto_regular}")
    except Exception as e:
        print(f"An error occurred during Roboto FontManager example usage: {e}")

    # Test caching (with a non-existent font to show fallback)
    print("\n--- Testing Caching and Fallback ---")
    font_default = font_manager.get_font("NonExistentFont", 12)
    print(f"Loaded NonExistentFont (12pt): {font_default}")

    # Test caching for JetBrains Mono
    font_jb_regular_cached = font_manager.get_font("JetBrains Mono", 16, "normal")
    print(f"Loaded JetBrains Mono Regular (16pt) again (should be cached): {font_jb_regular_cached}")
    if mock_jb_regular_path.exists(): # Only assert if file actually exists
        assert font_jb_regular is font_jb_regular_cached # Check if it's the same object
