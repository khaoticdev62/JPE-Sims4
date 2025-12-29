"""Build script for JPE Sims 4 Mod Translator."""

import subprocess
import sys
from pathlib import Path


def run_tests():
    """Run the test suite."""
    print("Running tests...")
    result = subprocess.run([sys.executable, "run_tests.py"])
    return result.returncode == 0


def build_package():
    """Build the package distributions."""
    print("Building package...")
    result = subprocess.run([sys.executable, "-m", "build"])
    return result.returncode == 0


def install_package():
    """Install the package in development mode."""
    print("Installing package in development mode...")
    result = subprocess.run([sys.executable, "-m", "pip", "install", "-e", "."])
    return result.returncode == 0


def check_code_quality():
    """Check code quality (basic import test)."""
    print("Checking code quality...")
    try:
        # Test imports
        import engine.ir
        import engine.parsers.jpe_parser
        import engine.generators.xml_generator
        import engine.validation.validator
        import engine.engine
        import diagnostics.errors
        import diagnostics.comprehensive
        import plugins
        import cloud.api
        import onboarding
        import cli
        import studio
        
        print("All modules imported successfully")
        return True
    except ImportError as e:
        print(f"Import error: {e}")
        return False


def main():
    """Main build process."""
    print("Starting build process for JPE Sims 4 Mod Translator...")
    
    # Run checks
    if not check_code_quality():
        print("Code quality check failed!")
        return False
    
    # Run tests
    if not run_tests():
        print("Tests failed!")
        return False
    
    # Install in development mode
    if not install_package():
        print("Failed to install package!")
        return False
    
    print("Build completed successfully!")
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)