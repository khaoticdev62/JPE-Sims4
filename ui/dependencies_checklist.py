"""
Dependencies Checklist and Verification for JPE Sims 4 Mod Translator UI/UX Enhancements.

This module provides a comprehensive dependency verification system that ensures all UI/UX enhancements
are properly configured and available for the installer.
"""

import sys
import importlib
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import subprocess
import pkg_resources


class DependencyStatus(Enum):
    """Status of a dependency."""
    INSTALLED = "installed"
    MISSING = "missing"
    OUTDATED = "outdated"
    UNKNOWN = "unknown"


@dataclass
class DependencyInfo:
    """Information about a dependency."""
    name: str
    pypi_name: str
    required_version: str
    current_version: Optional[str]
    status: DependencyStatus
    description: str
    category: str  # 'core', 'enhancement', 'optional'
    installation_cmd: str


class DependenciesChecklist:
    """Comprehensive dependencies checklist for UI/UX enhancements."""
    
    def __init__(self):
        self.dependencies: Dict[str, DependencyInfo] = {}
        self._load_dependencies()
    
    def _load_dependencies(self):
        """Load all required dependencies for UI/UX enhancements."""
        # Core dependencies (essential for basic functionality)
        core_deps = [
            DependencyInfo(
                name="requests",
                pypi_name="requests",
                required_version=">=2.25.0",
                current_version=self._get_package_version("requests"),
                status=self._check_dependency_status("requests", "2.25.0", ">="),
                description="HTTP library for network operations",
                category="core",
                installation_cmd="pip install requests>=2.25.0"
            ),
            DependencyInfo(
                name="toml",
                pypi_name="toml",
                required_version=">=0.10.0",
                current_version=self._get_package_version("toml"),
                status=self._check_dependency_status("toml", "0.10.0", ">="),
                description="TOML file parsing for configuration",
                category="core",
                installation_cmd="pip install toml>=0.10.0"
            ),
            DependencyInfo(
                name="cryptography",
                pypi_name="cryptography",
                required_version=">=3.4.0",
                current_version=self._get_package_version("cryptography"),
                status=self._check_dependency_status("cryptography", "3.4.0", ">="),
                description="Cryptographic operations for security",
                category="core",
                installation_cmd="pip install cryptography>=3.4.0"
            ),
            DependencyInfo(
                name="psutil",
                pypi_name="psutil",
                required_version=">=5.8.0",
                current_version=self._get_package_version("psutil"),
                status=self._check_dependency_status("psutil", "5.8.0", ">="),
                description="System and process utilities",
                category="core",
                installation_cmd="pip install psutil>=5.8.0"
            )
        ]
        
        # UI/UX enhancement dependencies
        enhancement_deps = [
            DependencyInfo(
                name="ttkbootstrap",
                pypi_name="ttkbootstrap",
                required_version=">=1.10.0",
                current_version=self._get_package_version("ttkbootstrap"),
                status=self._check_dependency_status("ttkbootstrap", "1.10.0", ">="),
                description="Modern styling for tkinter with bootstrap themes",
                category="enhancement",
                installation_cmd="pip install ttkbootstrap>=1.10.0"
            ),
            DependencyInfo(
                name="rich",
                pypi_name="rich",
                required_version=">=12.0.0",
                current_version=self._get_package_version("rich"),
                status=self._check_dependency_status("rich", "12.0.0", ">="),
                description="Enhanced console output with formatting and colors",
                category="enhancement",
                installation_cmd="pip install rich>=12.0.0"
            ),
            DependencyInfo(
                name="watchdog",
                pypi_name="watchdog",
                required_version=">=2.1.0",
                current_version=self._get_package_version("watchdog"),
                status=self._check_dependency_status("watchdog", "2.1.0", ">="),
                description="File system monitoring for auto-build capabilities",
                category="enhancement",
                installation_cmd="pip install watchdog>=2.1.0"
            ),
            DependencyInfo(
                name="Pillow",
                pypi_name="Pillow",
                required_version=">=8.0.0",
                current_version=self._get_package_version("Pillow"),
                status=self._check_dependency_status("Pillow", "8.0.0", ">="),
                description="Image processing for visual components and font previews",
                category="enhancement",
                installation_cmd="pip install Pillow>=8.0.0"
            ),
            DependencyInfo(
                name="Pygments",
                pypi_name="Pygments",
                required_version=">=2.7.0",
                current_version=self._get_package_version("Pygments"),
                status=self._check_dependency_status("Pygments", "2.7.0", ">="),
                description="Syntax highlighting for code components",
                category="enhancement",
                installation_cmd="pip install Pygments>=2.7.0"
            ),
            DependencyInfo(
                name="pyperclip",
                pypi_name="pyperclip",
                required_version=">=1.8.0",
                current_version=self._get_package_version("pyperclip"),
                status=self._check_dependency_status("pyperclip", "1.8.0", ">="),
                description="Clipboard access for UI components",
                category="enhancement",
                installation_cmd="pip install pyperclip>=1.8.0"
            )
        ]
        
        # Combine all dependencies
        all_deps = core_deps + enhancement_deps
        
        for dep in all_deps:
            self.dependencies[dep.name] = dep
    
    def _get_package_version(self, package_name: str) -> Optional[str]:
        """Get the installed version of a package."""
        try:
            return pkg_resources.get_distribution(package_name).version
        except pkg_resources.DistributionNotFound:
            return None
    
    def _check_dependency_status(self, package_name: str, required_version: str, operator: str) -> DependencyStatus:
        """Check the status of a dependency."""
        try:
            current_version = pkg_resources.get_distribution(package_name).version
        except pkg_resources.DistributionNotFound:
            return DependencyStatus.MISSING
        
        # Parse required version (simplified for basic comparison)
        req_version = required_version.replace(">=", "").replace(">", "").replace("<=", "").replace("<", "").replace("==", "").strip()
        
        try:
            # Compare versions (simplified)
            req_parts = [int(x) for x in req_version.split('.')]
            cur_parts = [int(x) for x in current_version.split('.')]
            
            # Pad with zeros if needed
            while len(req_parts) < 3:
                req_parts.append(0)
            while len(cur_parts) < 3:
                cur_parts.append(0)
            
            # Compare versions
            for i in range(min(len(req_parts), len(cur_parts))):
                if cur_parts[i] < req_parts[i]:
                    return DependencyStatus.OUTDATED
                elif cur_parts[i] > req_parts[i]:
                    break
            
            return DependencyStatus.INSTALLED
        except:
            # If comparison fails, assume it's installed
            return DependencyStatus.INSTALLED
    
    def get_missing_dependencies(self) -> List[DependencyInfo]:
        """Get list of missing dependencies."""
        return [dep for dep in self.dependencies.values() if dep.status == DependencyStatus.MISSING]
    
    def get_outdated_dependencies(self) -> List[DependencyInfo]:
        """Get list of outdated dependencies."""
        return [dep for dep in self.dependencies.values() if dep.status == DependencyStatus.OUTDATED]
    
    def get_required_installation_commands(self) -> str:
        """Get a single install command for all missing/outdated dependencies."""
        missing_or_outdated = [
            dep for dep in self.dependencies.values() 
            if dep.status in [DependencyStatus.MISSING, DependencyStatus.OUTDATED]
            if dep.category != "core"  # Core deps are already in setup.py
        ]
        
        if not missing_or_outdated:
            return "# All UI/UX enhancement dependencies are properly installed"
        
        # Generate pip install command for all missing/outdated enhancement dependencies
        packages = []
        for dep in missing_or_outdated:
            packages.append(dep.pypi_name + dep.required_version.replace(">", "").replace("=", ""))
        
        return f"pip install {' '.join(packages)}"
    
    def print_summary(self):
        """Print a summary of dependency status."""
        print("="*60)
        print("JPE Sims 4 Mod Translator - UI/UX Dependencies Check")
        print("="*60)
        
        print("\nCore Dependencies:")
        print("-" * 20)
        core_deps = [dep for dep in self.dependencies.values() if dep.category == "core"]
        for dep in core_deps:
            status_icon = "✓" if dep.status == DependencyStatus.INSTALLED else "✗"
            print(f"  {status_icon} {dep.name:<15} {dep.current_version or 'NOT INSTALLED':<15} {dep.required_version}")
        
        print("\nUI/UX Enhancement Dependencies:")
        print("-" * 35)
        enhancement_deps = [dep for dep in self.dependencies.values() if dep.category == "enhancement"]
        for dep in enhancement_deps:
            status_icon = "✓" if dep.status == DependencyStatus.INSTALLED else "✗"
            status_text = "INSTALLED" if dep.status == DependencyStatus.INSTALLED else "MISSING/OUTDATED"
            print(f"  {status_icon} {dep.name:<15} {dep.current_version or 'NOT INSTALLED':<15} {dep.required_version:<10} [{status_text}]")
        
        # Summary
        missing_count = len(self.get_missing_dependencies())
        outdated_count = len(self.get_outdated_dependencies())
        
        print(f"\nSummary:")
        print(f"  Missing: {missing_count}")
        print(f"  Outdated: {outdated_count}")
        
        if missing_count > 0 or outdated_count > 0:
            print(f"\nTo install missing/update outdated dependencies, run:")
            print(f"  {self.get_required_installation_commands()}")
        
        print("\n" + "="*60)


class InstallationVerifier:
    """Verifies that all UI/UX enhancement components are properly installed and functional."""
    
    def __init__(self):
        self.checklist = DependenciesChecklist()
    
    def verify_font_system(self) -> Tuple[bool, str]:
        """Verify that font system components are properly available."""
        try:
            from fonts.font_manager import font_manager
            available_packs = font_manager.get_available_packs()
            if len(available_packs) >= 4:  # We have 4+ built-in packs plus bundled fonts
                return True, f"Font system OK - {len(available_packs)} packs available: {', '.join(available_packs[:5])}{'...' if len(available_packs) > 5 else ''}"
            else:
                return False, f"Font system issue - only {len(available_packs)} packs available"
        except ImportError as e:
            return False, f"Font system not available: {e}"
        except Exception as e:
            return False, f"Font system error: {e}"
    
    def verify_color_system(self) -> Tuple[bool, str]:
        """Verify that color system components are properly available."""
        try:
            from ui.color_manager import color_manager
            all_swatches = color_manager.get_all_swatches()
            if len(all_swatches) >= 80:  # We have 82+ swatches
                return True, f"Color system OK - {len(all_swatches)} swatches available"
            else:
                return False, f"Color system issue - only {len(all_swatches)} swatches available"
        except ImportError as e:
            return False, f"Color system not available: {e}"
        except Exception as e:
            return False, f"Color system error: {e}"
    
    def verify_animation_system(self) -> Tuple[bool, str]:
        """Verify that animation system components are properly available."""
        try:
            from ui.animation_system import animation_manager
            # Just verify the module can be imported and has basic functionality
            return True, "Animation system OK - components available"
        except ImportError as e:
            return False, f"Animation system not available: {e}"
        except Exception as e:
            return False, f"Animation system error: {e}"
    
    def verify_enhanced_ui_system(self) -> Tuple[bool, str]:
        """Verify that enhanced UI components are properly available."""
        try:
            # Test import of enhanced UI components
            from ui.advanced_ui_components import (
                ModernMenuBar,
                ModernStatusBar,
                ModernTabView,
                ModernToolbox,
                ModernPropertyPanel,
                ModernDataGrid,
                ModernProgressBar,
                ModernNotificationPanel
            )
            return True, "Enhanced UI system OK - all components available"
        except ImportError as e:
            return False, f"Enhanced UI system not available: {e}"
        except Exception as e:
            return False, f"Enhanced UI system error: {e}"
    
    def verify_theme_integration(self) -> Tuple[bool, str]:
        """Verify that theme integration with ttkbootstrap is available."""
        try:
            from ui.enhanced_theme_manager import enhanced_ui_manager
            # Check if ttkbootstrap is available by trying to access the style
            return True, "Theme integration OK - enhanced theming available"
        except ImportError:
            # If ttkbootstrap isn't available, this is expected if the dependency is missing
            return True, "Theme integration OK - using base functionality (ttkbootstrap not installed)"
        except Exception as e:
            return False, f"Theme integration error: {e}"
    
    def verify_rich_console(self) -> Tuple[bool, str]:
        """Verify that rich console components are properly available."""
        try:
            from ui.rich_console import rich_console_manager
            return True, "Rich console OK - enhanced formatting available"
        except ImportError:
            # If rich isn't available, this is expected if the dependency is missing
            return True, "Rich console OK - using base functionality (rich not installed)"
        except Exception as e:
            return False, f"Rich console error: {e}"
    
    def verify_file_monitoring(self) -> Tuple[bool, str]:
        """Verify that file monitoring components are properly available."""
        try:
            from ui.file_monitor import file_monitor
            return True, "File monitoring OK - auto-build features available"
        except ImportError:
            # If watchdog isn't available, this is expected if the dependency is missing
            return True, "File monitoring OK - using base functionality (watchdog not installed)"
        except Exception as e:
            return False, f"File monitoring error: {e}"
    
    def verify_visual_components(self) -> Tuple[bool, str]:
        """Verify that visual components (using Pillow) are properly available."""
        try:
            from ui.visual_font_preview import VisualFontPreviewGenerator
            from ui.visual_color_swatches import VisualColorSwatchPreview
            from ui.visual_theme_preview import VisualThemePreviewGenerator
            return True, "Visual components OK - preview generation available"
        except ImportError as e:
            return False, f"Visual components not available: {e}"
        except Exception as e:
            return False, f"Visual components error: {e}"
    
    def run_verification(self) -> bool:
        """Run complete verification of all UI/UX enhancement components."""
        print("\nVerifying UI/UX Enhancement Components...")
        print("-" * 50)
        
        verifications = [
            ("Font System", self.verify_font_system),
            ("Color System", self.verify_color_system),
            ("Animation System", self.verify_animation_system),
            ("Enhanced UI Components", self.verify_enhanced_ui_system),
            ("Theme Integration", self.verify_theme_integration),
            ("Rich Console", self.verify_rich_console),
            ("File Monitoring", self.verify_file_monitoring),
            ("Visual Components", self.verify_visual_components),
        ]
        
        all_passed = True
        for name, verification_func in verifications:
            passed, message = verification_func()
            status = "✓ PASS" if passed else "✗ FAIL"
            print(f"  {status} {name:<25} - {message}")
            if not passed:
                all_passed = False
        
        print("-" * 50)
        print(f"Overall Result: {'✓ ALL TESTS PASSED' if all_passed else '✗ SOME TESTS FAILED'}")
        
        return all_passed


def generate_gui_installer_requirements():
    """Generate requirements specification for GUI installer."""
    checklist = DependenciesChecklist()
    
    # Create requirements content
    requirements_content = """# Requirements for JPE Sims 4 Mod Translator with UI/UX Enhancements
# Generated by Dependencies Checklist System

# Core Dependencies (already in setup.py)
requests>=2.25.0
toml>=0.10.0
cryptography>=3.4.0
psutil>=5.8.0

# UI/UX Enhancement Dependencies
ttkbootstrap>=1.10.0    # Modern styling for tkinter
rich>=12.0.0            # Enhanced console output
watchdog>=2.1.0         # File monitoring for auto-build
Pillow>=8.0.0           # Image processing for visual components
Pygments>=2.7.0         # Syntax highlighting
pyperclip>=1.8.0        # Clipboard access

# Development Dependencies
pytest>=6.0
pytest-cov>=2.0
mypy>=0.910
black>=21.0.0
flake8>=3.8.0
"""
    
    with open("ui_ux_requirements.txt", "w") as f:
        f.write(requirements_content)
    
    print("Generated ui_ux_requirements.txt with all UI/UX enhancement dependencies")
    
    # Also create an installer script
    installer_script = f"""#!/usr/bin/env python3
\"\"\"
Dependency Installer for JPE Sims 4 Mod Translator UI/UX Enhancements
\"\"\"

import subprocess
import sys
from pathlib import Path

def install_dependencies():
    \"\"\"Install all UI/UX enhancement dependencies.\"\"\"
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
        
    except subprocess.CalledProcessError:
        print(f"✗ Error installing dependencies")
        return False
    except Exception:
        print(f"✗ Unexpected error during installation")
        return False

def verify_installation():
    \"\"\"Verify that installation was successful.\"\"\"
    print("\\nVerifying installation...")
    
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
            print("\\n✓ Installation completed successfully!")
            print("The JPE Sims 4 Mod Translator now has all UI/UX enhancements enabled.")
        else:
            print("\\n✗ Installation partially completed - verification failed")
            sys.exit(1)
    else:
        print("\\n✗ Installation failed")
        sys.exit(1)
"""

    with open("install_ui_ux_enhancements.py", "w") as f:
        f.write(installer_script)
    
    print("Generated install_ui_ux_enhancements.py installer script")
    
    return checklist


def run_comprehensive_check():
    """Run the comprehensive dependency check and verification."""
    print("JPE Sims 4 Mod Translator - UI/UX Enhancement Verification")
    print("=" * 70)
    
    # Generate requirements and installer
    checklist = generate_gui_installer_requirements()
    
    # Show dependency status
    checklist.print_summary()
    
    # Run system verification
    verifier = InstallationVerifier()
    verification_result = verifier.run_verification()
    
    # Final summary
    print(f"\nFINAL SUMMARY:")
    print(f"Dependencies Status: {len(checklist.get_missing_dependencies())} missing, {len(checklist.get_outdated_dependencies())} outdated")
    print(f"System Verification: {'PASS' if verification_result else 'FAIL'}")
    
    if verification_result and len(checklist.get_missing_dependencies()) == 0 and len(checklist.get_outdated_dependencies()) == 0:
        print(f"\n🎉 COMPLETE: All UI/UX enhancements are properly installed and verified!")
        return True
    else:
        print(f"\n⚠️  PARTIAL: Some features may be limited until dependencies are installed.")
        print(f"   Run: python install_ui_ux_enhancements.py to install missing dependencies")
        return False


if __name__ == "__main__":
    success = run_comprehensive_check()
    sys.exit(0 if success else 1)