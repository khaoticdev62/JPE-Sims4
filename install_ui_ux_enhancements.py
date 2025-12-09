#!/usr/bin/env python3
"""
Dependency Installer for JPE Sims 4 Mod Translator UI/UX Enhancements
"""

import subprocess
import sys
from pathlib import Path

def install_dependencies():
    """Install all UI/UX enhancement dependencies."""
    # Read requirements from file
    requirements_path = Path("ui_ux_requirements.txt")
    if not requirements_path.exists():
        print("Error: ui_ux_requirements.txt not found!")
        return False
    
    print("Installing UI/UX Enhancement Dependencies...")
    print("This may take a few minutes...")
    
    try:
        # Install from requirements file
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_path)
        ], check=True, capture_output=True, text=True)
        
        print("✓ Successfully installed UI/UX enhancement dependencies!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"✗ Error installing dependencies: {e}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

def verify_installation():
    """Verify that installation was successful."""
    print("\nVerifying installation...")
    
    try:
        # Attempt to import key components
        import ttkbootstrap
        import rich
        import watchdog
        import PIL
        import pygments
        import pyperclip
        
        print("✓ All UI/UX enhancement dependencies successfully imported!")
        return True
    except ImportError as e:
        print(f"✗ Verification failed - missing dependency: {e}")
        return False

if __name__ == "__main__":
    print("JPE Sims 4 Mod Translator - UI/UX Enhancement Installer")
    print("=" * 60)
    
    success = install_dependencies()
    if success:
        verification_success = verify_installation()
        if verification_success:
            print("\n✓ Installation completed successfully!")
            print("The JPE Sims 4 Mod Translator now has all UI/UX enhancements enabled.")
        else:
            print("\n✗ Installation partially completed - verification failed")
            sys.exit(1)
    else:
        print("\n✗ Installation failed")
        sys.exit(1)