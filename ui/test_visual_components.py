"""
Test script for the visual UI/UX components in JPE Sims 4 Mod Translator.
"""

import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def test_visual_ui_components():
    """Test the visual UI/UX components."""
    print("Testing Visual UI/UX Components for JPE Sims 4 Mod Translator...")
    
    # Test 1: Import visual theme components
    try:
        from ui.visual_theme_preview import VisualThemePreviewGenerator, create_visual_theme_previews
        print("✓ Visual theme preview components imported successfully")
        
        # Test creating previews
        preview_gen = VisualThemePreviewGenerator()
        preview_paths = preview_gen.generate_all_theme_previews()
        print(f"✓ Generated {len(preview_paths)} theme previews")
        
    except Exception as e:
        print(f"✗ Error testing visual theme components: {e}")
        return False
    
    # Test 2: Import visual template components
    try:
        from ui.visual_template_preview import VisualTemplatePreviewGenerator, create_visual_template_previews
        print("✓ Visual template preview components imported successfully")
        
        # Test creating previews
        template_preview_gen = VisualTemplatePreviewGenerator()
        template_preview_paths = template_preview_gen.generate_all_sample_previews()
        print(f"✓ Generated {len(template_preview_paths)} template previews")
        
    except Exception as e:
        print(f"✗ Error testing visual template components: {e}")
        return False
    
    # Test 3: Import visual startup components
    try:
        from ui.visual_startup_preview import VisualStartupPreviewGenerator, create_visual_startup_preview
        print("✓ Visual startup preview components imported successfully")
        
        # Test creating preview
        startup_preview_gen = VisualStartupPreviewGenerator()
        startup_preview_path = startup_preview_gen.generate_startup_preview()
        if startup_preview_path:
            print(f"✓ Generated startup preview: {startup_preview_path}")
        else:
            print("✗ Failed to generate startup preview")
            return False
        
    except Exception as e:
        print(f"✗ Error testing visual startup components: {e}")
        return False
    
    # Test 4: Import UI enhancements
    try:
        from ui import (
            VisualThemePreviewGenerator,
            create_visual_theme_previews,
            VisualTemplatePreviewGenerator,
            create_visual_template_previews,
            VisualStartupPreviewGenerator,
            create_visual_startup_preview,
            VisualCollaborativeEditorPreviewGenerator,
            create_visual_collaborative_editor_preview
        )
        print("✓ All visual UI/UX components accessible through UI package")
    except Exception as e:
        print(f"✗ Error importing visual components through UI package: {e}")
        return False

    # Test 5: Test collaborative editor preview
    try:
        from ui.visual_collaborative_editor import create_visual_collaborative_editor_preview
        print("✓ Visual collaborative editor components imported successfully")

        # Test creating preview
        collab_preview_path = create_visual_collaborative_editor_preview()
        if collab_preview_path:
            print(f"✓ Generated collaborative editor preview: {collab_preview_path}")
        else:
            print("✗ Failed to generate collaborative editor preview")
            return False

    except Exception as e:
        print(f"✗ Error testing visual collaborative editor components: {e}")
        return False
    
    print("\n✓ All visual UI/UX component tests passed!")
    return True


if __name__ == "__main__":
    success = test_visual_ui_components()
    if success:
        print("\nAll visual UI/UX components are working correctly!")
    else:
        print("\nSome visual UI/UX components failed!")
        sys.exit(1)