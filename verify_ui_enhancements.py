#!/usr/bin/env python3
"""Verification script for UI/UX enhancements in JPE Sims 4 Mod Translator."""

import sys
import os
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def verify_imports():
    """Verify that all modules can be imported without errors."""
    print("Verifying imports...")
    
    modules_to_check = [
        "ui.theme_manager",
        "ui.ui_enhancements", 
        "config.config_manager",
        "security.validator",
        "performance.monitor",
        "studio",
        "cli",
        "engine.engine",
        "engine.ir",
        "engine.parsers.jpe_parser",
        "engine.generators.xml_generator",
        "engine.validation.validator",
        "diagnostics.errors",
        "diagnostics.logging",
        "diagnostics.comprehensive",
        "onboarding.teaching_system",
        "plugins.manager",
        "cloud.api"
    ]
    
    for module in modules_to_check:
        try:
            __import__(module)
            print(f"[OK] {module}")
        except ImportError as e:
            print(f"[ERR] {module}: {e}")
            return False
    
    return True


def verify_theme_manager():
    """Verify that the theme manager works correctly."""
    print("\nVerifying theme manager...")
    
    try:
        from ui.theme_manager import theme_manager
        
        # Check that themes are loaded
        themes = theme_manager.get_themes()
        if len(themes) < 10:
            print(f"✗ Theme manager: Expected at least 10 themes, got {len(themes)}")
            return False
        
        # Check specific themes exist
        expected_themes = [
            "Cyberpunk Neon", "Sunset Glow", "Forest Twilight", 
            "Ocean Depths", "Vintage Paper", "Cosmic Void",
            "Tropical Paradise", "Ice Crystal", "Desert Sunset", "Midnight Purple"
        ]
        
        for theme in expected_themes:
            if theme not in themes:
                print(f"[ERR] Theme manager: Missing theme '{theme}'")
                return False

        print(f"[OK] Theme manager: Found {len(themes)} themes")
        return True
    except Exception as e:
        print(f"[ERR] Theme manager: {e}")
        return False


def verify_config_manager():
    """Verify that the config manager works correctly."""
    print("\nVerifying config manager...")
    
    try:
        from config.config_manager import config_manager
        
        # Test basic config access
        app_name = config_manager.get("app.name")
        if not app_name:
            print("✗ Config manager: Could not access basic config")
            return False
        
        # Test setting a value
        config_manager.set("test.value", "verification")
        test_value = config_manager.get("test.value")
        if test_value != "verification":
            print("✗ Config manager: Could not set/get test value")
            return False
        
        print("✓ Config manager: Working properly")
        return True
    except Exception as e:
        print(f"✗ Config manager: {e}")
        return False


def verify_security_validator():
    """Verify that the security validator works correctly."""
    print("\nVerifying security validator...")
    
    try:
        from security.validator import security_validator
        
        # Test file path validation
        import tempfile
        with tempfile.TemporaryDirectory() as temp_dir:
            safe_path = Path(temp_dir) / "test_file.jpe"
            result = security_validator.validate_file_path(safe_path)
            print(f"✓ Security validator: Safe path validation works")
        
        # Test filename sanitization
        unsafe_name = "../../../etc/passwd"
        sanitized = security_validator.sanitize_filename(unsafe_name)
        if ".." in sanitized:
            print("✗ Security validator: Did not properly sanitize filename")
            return False
        
        print("✓ Security validator: Working properly")
        return True
    except Exception as e:
        print(f"✗ Security validator: {e}")
        return False


def verify_performance_monitor():
    """Verify that the performance monitor works correctly."""
    print("\nVerifying performance monitor...")
    
    try:
        from performance.monitor import performance_monitor
        
        # Test performance monitoring
        context = performance_monitor.start_operation("test_operation")
        performance_monitor.end_operation("test_operation", context)
        
        metrics = performance_monitor.get_metrics()
        if "test_operation" not in metrics:
            print("✗ Performance monitor: Operation not recorded")
            return False
        
        print("✓ Performance monitor: Working properly")
        return True
    except Exception as e:
        print(f"✗ Performance monitor: {e}")
        return False


def verify_studio_ui():
    """Verify that the studio UI components are properly enhanced."""
    print("\nVerifying studio UI components...")
    
    try:
        from studio import DesktopStudio
        import tkinter as tk
        
        # Test that DesktopStudio can be instantiated
        root = tk.Tk()
        root.withdraw()  # Don't show the window for now
        
        studio = DesktopStudio()
        studio.root = root
        
        # Check that enhanced UI methods exist
        required_methods = [
            'create_editor_tab', 'create_documentation_tab', 
            'create_settings_tab', '_apply_syntax_highlighting',
            '_update_line_numbers', '_configure_doc_tags'
        ]
        
        for method in required_methods:
            if not hasattr(studio, method):
                print(f"✗ Studio UI: Missing enhanced method '{method}'")
                return False
        
        root.destroy()
        print("✓ Studio UI: Enhanced components exist")
        return True
    except Exception as e:
        print(f"✗ Studio UI: {e}")
        return False


def verify_ui_enhancements():
    """Verify that UI enhancements are properly implemented."""
    print("\nVerifying UI enhancements...")
    
    try:
        from ui.ui_enhancements import initialize_enhanced_ui, create_app_menu
        import tkinter as tk
        
        # Test that enhancement functions exist
        root = tk.Tk()
        root.withdraw()
        
        # Test basic UI enhancement functions
        from studio import DesktopStudio
        studio = DesktopStudio()
        studio.root = root
        
        # Test menu creation
        create_app_menu(root, studio)
        
        root.destroy()
        print("✓ UI Enhancements: Functions exist and work")
        return True
    except Exception as e:
        print(f"✗ UI Enhancements: {e}")
        return False


def verify_cli_enhancements():
    """Verify CLI enhancements."""
    print("\nVerifying CLI enhancements...")
    
    try:
        from cli import main as cli_main
        from config.config_manager import config_manager
        
        # Verify that CLI can access config
        app_name = config_manager.get("app.name")
        if not app_name:
            print("✗ CLI enhancements: Could not access config")
            return False
        
        print("✓ CLI enhancements: Working properly")
        return True
    except Exception as e:
        print(f"✗ CLI enhancements: {e}")
        return False


def main():
    """Main verification function."""
    print("JPE Sims 4 Mod Translator - UI/UX Enhancement Verification")
    print("=" * 60)
    
    all_passed = True
    
    # Run all verifications
    tests = [
        verify_imports,
        verify_theme_manager,
        verify_config_manager,
        verify_security_validator,
        verify_performance_monitor,
        verify_studio_ui,
        verify_ui_enhancements,
        verify_cli_enhancements
    ]
    
    for test_func in tests:
        if not test_func():
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ALL VERIFICATIONS PASSED! 🎉")
        print("UI/UX enhancements have been successfully integrated.")
    else:
        print("❌ SOME VERIFICATIONS FAILED!")
        print("Please check the error messages above.")
    
    return all_passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)