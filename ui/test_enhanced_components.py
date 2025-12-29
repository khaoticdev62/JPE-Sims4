"""
Test script for the UI/UX enhancement tools in JPE Sims 4 Mod Translator.
"""

import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def test_enhanced_components():
    """Test the enhanced UI/UX components."""
    print("Testing UI/UX Enhancement Tools for JPE Sims 4 Mod Translator...")
    
    # Test 1: Import enhanced theme manager
    try:
        from ui.enhanced_theme_manager import (
            EnhancedTheme,
            EnhancedThemeManager,
            EnhancedUIManager,
            enhanced_ui_manager
        )
        print("✓ Enhanced theme manager imported successfully")
        
        # Test EnhancedTheme
        theme = EnhancedTheme(
            name="test",
            display_name="Test Theme",
            description="Test theme for verification",
            ttkbootstrap_theme="flatly",
            custom_colors={"primary": "#2EC4B6"}
        )
        print(f"✓ EnhancedTheme created: {theme.name}")
        
        # Test EnhancedThemeManager
        etm = EnhancedThemeManager()
        print(f"✓ EnhancedThemeManager created with {len(etm.get_available_enhanced_themes())} enhanced themes")
        
        # Test EnhancedUIManager
        euim = EnhancedUIManager()
        print(f"✓ EnhancedUIManager created: {euim.enhanced_theme_manager}")
        
        # Test global instance
        print(f"✓ Global enhanced UI manager: {enhanced_ui_manager}")
        
    except Exception as e:
        print(f"✗ Error testing enhanced theme manager: {e}")
        return False
    
    # Test 2: Import rich console components
    try:
        from ui.rich_console import (
            RichConsoleManager,
            RichBuildReporter,
            rich_console_manager,
            rich_build_reporter
        )
        print("✓ Rich console components imported successfully")
        
        # Test RichConsoleManager
        rcm = RichConsoleManager()
        print(f"✓ RichConsoleManager created with console: {rcm.console}")
        
        # Test RichBuildReporter
        rbr = RichBuildReporter(rcm)
        print(f"✓ RichBuildReporter created: {rbr}")
        
        # Test global instances
        print(f"✓ Global rich console manager: {rich_console_manager}")
        print(f"✓ Global rich build reporter: {rich_build_reporter}")
        
    except Exception as e:
        print(f"✗ Error testing rich console components: {e}")
        return False
    
    # Test 3: Import file monitor components
    try:
        from ui.file_monitor import (
            FileEvent,
            FileEventType,
            FileMonitor,
            ModProjectMonitor,
            FileChangeNotifier,
            file_monitor
        )
        print("✓ File monitor components imported successfully")
        
        # Test FileEventType
        ftype = FileEventType.MODIFIED
        print(f"✓ FileEventType: {ftype}")
        
        # Test FileEvent
        from datetime import datetime
        fe = FileEvent(
            event_type=ftype,
            file_path="test.txt",
            timestamp=datetime.now()
        )
        print(f"✓ FileEvent created: {fe.event_type} for {fe.file_path}")
        
        # Test FileMonitor
        fm = FileMonitor()
        print(f"✓ FileMonitor created: {fm.is_active()}")
        
        # Test FileChangeNotifier
        fcn = FileChangeNotifier()
        print(f"✓ FileChangeNotifier created with {len(fcn.notifications)} notifications")
        
        # Test global instance
        print(f"✓ Global file monitor: {file_monitor}")
        
        # Test ModProjectMonitor (requires a path)
        # We won't actually create one since it needs a real project path
        print("✓ ModProjectMonitor class available")
        
    except Exception as e:
        print(f"✗ Error testing file monitor components: {e}")
        return False
    
    # Test 4: Import UI enhancements
    try:
        from ui import (
            EnhancedTheme,
            EnhancedThemeManager,
            EnhancedUIManager,
            RichConsoleManager,
            RichBuildReporter,
            FileEvent,
            FileEventType,
            FileMonitor,
            ModProjectMonitor,
            FileChangeNotifier,
            enhanced_ui_manager,
            rich_console_manager,
            file_monitor
        )
        print("✓ All enhanced UI/UX components accessible through UI package")
    except Exception as e:
        print(f"✗ Error importing enhanced UI components through UI package: {e}")
        return False
    
    print("\n✓ All UI/UX enhancement component tests passed!")
    return True


def demo_enhanced_features():
    """Demonstrate some enhanced features."""
    print("\nDemonstrating Enhanced Features...")
    
    try:
        # Demonstrate rich console functionality
        from ui.rich_console import rich_console_manager
        
        print("Testing Rich Console Features:")
        rich_console_manager.print_success("Enhanced UI is working properly!")
        rich_console_manager.print_info("This is informational output")
        rich_console_manager.print_warning("This is a warning message")
        rich_console_manager.print_error("This is an error message", "Demo Error")
        
        # Test progress bar
        print("\nTesting Progress Bar:")
        with rich_console_manager.create_progress_context("Demo Process...") as progress:
            # Simulate progress (in a real test this would be actual work)
            print("Progress bar context created successfully")
        
        print("✓ Rich console features demonstrated")
        
        # Test theme manager
        from ui.enhanced_theme_manager import enhanced_ui_manager
        print(f"✓ Enhanced UI manager has {len(enhanced_ui_manager.enhanced_theme_manager.get_available_enhanced_themes())} themes")
        
    except Exception as e:
        print(f"✗ Error in enhanced features demo: {e}")
        return False
    
    return True


if __name__ == "__main__":
    success1 = test_enhanced_components()
    success2 = demo_enhanced_features()
    
    if success1 and success2:
        print("\nAll enhanced UI/UX components are working correctly!")
    else:
        print("\nSome enhanced UI/UX components failed!")
        sys.exit(1)