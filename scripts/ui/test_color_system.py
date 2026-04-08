"""
Test script for the color management system in JPE Sims 4 Mod Translator.
"""

import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def test_color_system():
    """Test the color management system."""
    print("Testing Color Management System for JPE Sims 4 Mod Translator...")
    
    # Test 1: Import color manager
    try:
        from ui.color_manager import color_manager, ColorSwatch
        print("✓ Color manager imported successfully")
        
        # Test number of swatches
        all_swatches = color_manager.get_all_swatches()
        print(f"✓ Total color swatches: {len(all_swatches)}")
        
        if len(all_swatches) >= 50:
            print("✓ More than 50 color swatches available as required")
        else:
            print(f"✗ Only {len(all_swatches)} color swatches available, need at least 50")
            return False
        
        # Test getting swatch by name
        swatch = color_manager.get_swatch_by_name("Red")
        if swatch:
            print(f"✓ Found swatch: {swatch.name} with hex {swatch.hex_code}")
        else:
            print("✗ Could not find 'Red' swatch")
            return False
        
        # Test getting swatches by category
        red_swatches = color_manager.get_swatches_by_category("Red")
        if red_swatches:
            print(f"✓ Found {len(red_swatches)} swatches in Red category")
        else:
            print("✗ Could not find swatches in Red category")
            return False
        
        # Test getting all categories
        categories = color_manager.get_all_categories()
        if categories:
            print(f"✓ Found {len(categories)} color categories: {categories}")
        else:
            print("✗ Could not find any color categories")
            return False
        
    except Exception as e:
        print(f"✗ Error testing color manager: {e}")
        return False
    
    # Test 2: Import visual color swatches
    try:
        from ui.visual_color_swatches import VisualColorSwatchPreview, create_visual_color_previews
        print("✓ Visual color swatch components imported successfully")
        
        # Test creating previews
        preview_gen = VisualColorSwatchPreview()
        
        # Generate preview for a category
        category_preview = preview_gen.generate_category_preview("Red")
        if category_preview:
            print(f"✓ Generated category preview: {category_preview}")
        else:
            print("✗ Failed to generate category preview")
            return False
        
        # Generate complete collection preview
        collection_preview = preview_gen.generate_all_categories_preview()
        if collection_preview:
            print(f"✓ Generated complete collection preview: {collection_preview}")
        else:
            print("✗ Failed to generate collection preview")
            return False
        
    except Exception as e:
        print(f"✗ Error testing visual color swatches: {e}")
        return False
    
    # Test 3: Import color theme customizer
    try:
        from ui.color_theme_customizer import (
            ColorThemeCustomizer, 
            show_color_theme_customizer,
            create_color_customizer_tab
        )
        print("✓ Color theme customizer components imported successfully")
    except Exception as e:
        print(f"✗ Error testing color theme customizer: {e}")
        return False
    
    # Test 4: Import UI enhancements
    try:
        from ui import (
            ColorSwatch,
            ColorManager,
            color_manager,
            VisualColorSwatchPreview,
            create_visual_color_previews,
            ColorThemeCustomizer,
            show_color_theme_customizer,
            create_color_customizer_tab
        )
        print("✓ All color UI/UX components accessible through UI package")
    except Exception as e:
        print(f"✗ Error importing color components through UI package: {e}")
        return False
    
    # Test 5: Test color utilities
    try:
        # Test generating color variants
        variants = color_manager.generate_color_variants("#FF0000", 5)
        if len(variants) == 5:
            print(f"✓ Generated color variants: {variants}")
        else:
            print("✗ Failed to generate correct number of color variants")
            return False
        
        # Test finding closest colors
        closest = color_manager.find_closest_colors("#FF0000", 3)
        if len(closest) >= 3:
            print(f"✓ Found closest colors: {[c.name for c in closest]}")
        else:
            print("✗ Failed to find sufficient closest colors")
            return False
            
    except Exception as e:
        print(f"✗ Error testing color utilities: {e}")
        return False
    
    print("\n✓ All color management system tests passed!")
    return True


if __name__ == "__main__":
    success = test_color_system()
    if success:
        print("\nAll color management components are working correctly!")
    else:
        print("\nSome color management components failed!")
        sys.exit(1)