"""
Test script for the font pack system in JPE Sims 4 Mod Translator.
"""

import tkinter as tk
from tkinter import ttk
import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def test_font_system():
    """Test the font pack system."""
    print("Testing Font Pack System for JPE Sims 4 Mod Translator...")

    # Test 1: Import font manager
    try:
        from fonts.font_manager import font_manager
        print("✓ Font manager imported successfully")

        # Test available packs
        packs = font_manager.get_available_packs()
        print(f"✓ Available font packs: {packs}")

        # Test setting a pack
        font_manager.set_current_pack("modern")
        print("✓ Successfully set 'modern' font pack")

        # Test getting a font (but only if we have a tkinter root)
        try:
            import tkinter as tk
            # Create a temporary root to test font creation
            temp_root = tk.Tk()
            temp_root.withdraw()  # Hide the window

            font_obj = font_manager.get_font("default")
            if font_obj:
                print(f"✓ Successfully retrieved default font: {font_obj.actual()}")
            else:
                print("✗ Failed to retrieve default font")

            temp_root.destroy()
        except tk.TclError:
            print("! Font object test skipped (no display available)")

    except Exception as e:
        print(f"✗ Error testing font manager: {e}")
        return False
    
    # Test 2: Import font config
    try:
        from fonts.font_config import (
            get_current_font_pack,
            set_current_font_pack,
            get_font_size_multiplier,
            set_font_size_multiplier
        )
        print("✓ Font config imported successfully")
        
        # Test config functions
        current_pack = get_current_font_pack()
        print(f"✓ Current font pack: {current_pack}")
        
        set_current_font_pack("readable")
        new_pack = get_current_font_pack()
        print(f"✓ Set font pack to 'readable': {new_pack}")
        
        size_mult = get_font_size_multiplier()
        print(f"✓ Current size multiplier: {size_mult}")
    except Exception as e:
        print(f"✗ Error testing font config: {e}")
        return False
    
    # Test 3: Import font integration
    try:
        from fonts.font_integration import font_theme_integration
        print("✓ Font integration imported successfully")
    except Exception as e:
        print(f"✗ Error testing font integration: {e}")
        return False
    
    # Test 4: Import font installer
    try:
        from fonts.font_installer import get_system_font_dir, is_font_installed
        print("✓ Font installer imported successfully")
        
        font_dir = get_system_font_dir()
        print(f"✓ System font directory: {font_dir}")
    except Exception as e:
        print(f"✗ Error testing font installer: {e}")
        return False
    
    # Test 5: Import font settings
    try:
        from fonts.font_settings import FontSettingsPanel
        print("✓ Font settings imported successfully")
    except Exception as e:
        print(f"✗ Error testing font settings: {e}")
        return False
    
    # Test 6: Integration with theme manager
    try:
        from ui.theme_manager import theme_manager
        print("✓ Theme manager imported successfully")
        
        # Test that themes have font_pack attribute
        for theme_name, theme in theme_manager.themes.items():
            if hasattr(theme, 'font_pack') and theme.font_pack:
                print(f"✓ Theme '{theme_name}' has associated font pack: {theme.font_pack}")
            else:
                print(f"! Theme '{theme_name}' has no associated font pack")
    except Exception as e:
        print(f"✗ Error testing theme manager integration: {e}")
        return False
    
    print("\n✓ All font system tests passed!")
    return True


def test_font_ui():
    """Test the font system with a simple UI."""
    try:
        from fonts.font_manager import font_manager
        from fonts.font_preview import FontPreviewWindow
        print("\nCreating font preview window...")
        
        root = tk.Tk()
        root.title("Font System Test")
        root.geometry("800x200")
        
        # Create some test widgets with different fonts
        default_font = font_manager.get_font("default")
        header_font = font_manager.get_font("header")
        mono_font = font_manager.get_font("monospace")
        
        tk.Label(root, text="Default Font Test", font=default_font).pack(pady=5)
        tk.Label(root, text="Header Font Test", font=header_font).pack(pady=5)
        tk.Label(root, text="Monospace Font Test", font=mono_font).pack(pady=5)
        
        # Button to open font preview
        def open_preview():
            FontPreviewWindow(root)
        
        tk.Button(root, text="Open Font Preview", command=open_preview).pack(pady=10)
        
        print("✓ Font UI test created successfully")
        
        # Only run the UI if this is the main script
        if __name__ == "__main__":
            print("Displaying font test UI. Close the window to continue...")
            root.mainloop()
    except Exception as e:
        print(f"✗ Error testing font UI: {e}")
        return False
    
    return True


if __name__ == "__main__":
    success = test_font_system()
    if success:
        test_font_ui()
    else:
        print("Font system tests failed!")
        sys.exit(1)