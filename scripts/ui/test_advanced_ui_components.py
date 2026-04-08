"""
Test script for the advanced UI components in JPE Sims 4 Mod Translator.
"""

import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def test_advanced_ui_components():
    """Test the advanced UI components."""
    print("Testing Advanced UI Components for JPE Sims 4 Mod Translator...")
    
    # Test 1: Import advanced UI components
    try:
        from ui.advanced_ui_components import (
            ModernMenuBar,
            ModernStatusBar,
            ModernTabView,
            ModernToolbox,
            ModernPropertyPanel,
            ModernDialog,
            ModernDataGrid,
            ModernProgressBar,
            ModernNotificationPanel,
            create_modern_ui_demo
        )
        print("✓ Advanced UI components imported successfully")
        
        # Test that classes exist
        classes = [
            ModernMenuBar,
            ModernStatusBar,
            ModernTabView,
            ModernToolbox,
            ModernPropertyPanel,
            ModernDialog,
            ModernDataGrid,
            ModernProgressBar,
            ModernNotificationPanel
        ]
        print(f"✓ All {len(classes)} advanced UI classes available")
        
    except Exception as e:
        print(f"✗ Error testing advanced UI components: {e}")
        return False
    
    # Test 2: Import through UI package
    try:
        from ui import (
            ModernMenuBar,
            ModernStatusBar,
            ModernTabView,
            ModernToolbox,
            ModernPropertyPanel,
            ModernDialog,
            ModernDataGrid,
            ModernProgressBar,
            ModernNotificationPanel,
        )
        print("✓ All advanced UI components accessible through UI package")
    except Exception as e:
        print(f"✗ Error importing advanced UI components through UI package: {e}")
        return False
    
    # Test 3: Create instances of components
    try:
        import tkinter as tk
        
        # Create a root window for testing
        root = tk.Tk()
        root.withdraw()  # Hide the root window during tests
        
        # Test ModernMenuBar
        menu_bar = ModernMenuBar(root)
        print("✓ ModernMenuBar created successfully")
        
        # Test ModernStatusBar
        status_frame = tk.Frame(root)
        status_bar = ModernStatusBar(status_frame)
        status_bar.set_status("Test status")
        status_bar.set_position(10, 20)
        print("✓ ModernStatusBar created and updated successfully")
        
        # Test ModernTabView
        tab_frame = tk.Frame(root)
        tab_view = ModernTabView(tab_frame)
        print("✓ ModernTabView created successfully")
        
        # Test ModernToolbox
        toolbox_frame = tk.Frame(root)
        toolbox = ModernToolbox(toolbox_frame)
        section = toolbox.add_section("Tools")
        print("✓ ModernToolbox created and section added successfully")
        
        # Test ModernPropertyPanel
        prop_frame = tk.Frame(root)
        prop_panel = ModernPropertyPanel(prop_frame)
        prop_panel.add_property("Test Prop", "text", "Test Value")
        print("✓ ModernPropertyPanel created and property added successfully")
        
        # Test ModernProgressBar
        prog_frame = tk.Frame(root)
        prog_bar = ModernProgressBar(prog_frame)
        prog_bar.update(50)
        print("✓ ModernProgressBar created and updated successfully")
        
        # Test ModernNotificationPanel
        notif_frame = tk.Frame(root)
        notif_panel = ModernNotificationPanel(notif_frame)
        notif_panel.add_notification("Test notification", "info", 1000)
        print("✓ ModernNotificationPanel created and notification added successfully")
        
        # Test ModernDataGrid
        grid_frame = tk.Frame(root)
        data_grid = ModernDataGrid(grid_frame, ["Col1", "Col2", "Col3"])
        data_grid.add_row(["Row1-Col1", "Row1-Col2", "Row1-Col3"])
        print("✓ ModernDataGrid created and row added successfully")
        
        # Clean up
        root.destroy()
        
        print("✓ All advanced UI component instantiation tests passed!")
        
    except Exception as e:
        print(f"✗ Error in advanced UI component instantiation tests: {e}")
        return False
    
    print("\n✓ All advanced UI component tests passed!")
    return True


def demo_advanced_ui():
    """Demonstrate the advanced UI components."""
    print("\nDemonstrating Advanced UI Components...")
    
    try:
        from ui.advanced_ui_components import create_modern_ui_demo
        print("✓ Advanced UI demo function available")
        
        # Only show the demo if running directly
        if __name__ == "__main__":
            print("Opening advanced UI demo...")
            app = create_modern_ui_demo()
            app.mainloop()
        else:
            print("- Demo available via create_modern_ui_demo()")
        
    except Exception as e:
        print(f"✗ Error in advanced UI demo: {e}")
        return False
    
    return True


if __name__ == "__main__":
    success1 = test_advanced_ui_components()
    success2 = demo_advanced_ui()
    
    if success1 and success2:
        print("\nAll advanced UI components are working correctly!")
    else:
        print("\nSome advanced UI components failed!")
        sys.exit(1)