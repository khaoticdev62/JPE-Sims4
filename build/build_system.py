"""Comprehensive build and packaging system for JPE Sims 4 Mod Translator.

Handles building, packaging, and distribution for multiple platforms.
"""

import os
import sys
import subprocess
import shutil
import json
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
from enum import Enum
from datetime import datetime


class BuildTarget(Enum):
    """Build targets for different platforms."""

    WINDOWS_EXE = "windows_exe"
    WINDOWS_PORTABLE = "windows_portable"
    WINDOWS_INSTALLER = "windows_installer"
    MACOS_APP = "macos_app"
    MACOS_INSTALLER = "macos_installer"
    LINUX_DEB = "linux_deb"
    LINUX_APPIMAGE = "linux_appimage"
    LINUX_PORTABLE = "linux_portable"
    SOURCE_DIST = "source_dist"


@dataclass
class BuildConfig:
    """Configuration for build process."""

    project_root: Path
    version: str
    build_type: BuildTarget
    output_directory: Path
    debug: bool = False
    sign_binaries: bool = False
    certificate_path: Optional[Path] = None
    include_docs: bool = True
    include_examples: bool = True
    strip_symbols: bool = True
    parallel_jobs: int = 4


class BuildSystem:
    """Main build system orchestrator."""

    def __init__(self, config: BuildConfig):
        """Initialize build system.

        Args:
            config: Build configuration
        """
        self.config = config
        self.build_log: List[str] = []
        self.on_progress: Optional[Callable] = None
        self.on_error: Optional[Callable] = None

    def build(self) -> bool:
        """Execute build process.

        Returns:
            True if successful
        """
        try:
            self._log(f"Starting build: {self.config.build_type.value}")
            self._log(f"Version: {self.config.version}")
            self._log(f"Output: {self.config.output_directory}")

            # Run pre-build checks
            if not self._run_pre_build_checks():
                return False

            # Build based on target
            if self.config.build_type == BuildTarget.WINDOWS_EXE:
                return self._build_windows_exe()
            elif self.config.build_type == BuildTarget.WINDOWS_PORTABLE:
                return self._build_windows_portable()
            elif self.config.build_type == BuildTarget.WINDOWS_INSTALLER:
                return self._build_windows_installer()
            elif self.config.build_type == BuildTarget.MACOS_APP:
                return self._build_macos_app()
            elif self.config.build_type == BuildTarget.MACOS_INSTALLER:
                return self._build_macos_installer()
            elif self.config.build_type == BuildTarget.LINUX_DEB:
                return self._build_linux_deb()
            elif self.config.build_type == BuildTarget.LINUX_APPIMAGE:
                return self._build_linux_appimage()
            elif self.config.build_type == BuildTarget.SOURCE_DIST:
                return self._build_source_dist()
            else:
                self._log(f"Unknown build target: {self.config.build_type}")
                return False

        except Exception as e:
            self._error(f"Build failed: {e}")
            return False

    def _run_pre_build_checks(self) -> bool:
        """Run pre-build checks.

        Returns:
            True if all checks pass
        """
        self._log("Running pre-build checks...")

        # Check project structure
        if not (self.config.project_root / "setup.py").exists():
            self._error("setup.py not found")
            return False

        # Check dependencies
        if not self._check_dependencies():
            return False

        # Create output directory
        self.config.output_directory.mkdir(parents=True, exist_ok=True)

        return True

    def _check_dependencies(self) -> bool:
        """Check for required build dependencies.

        Returns:
            True if all dependencies are available
        """
        self._log("Checking dependencies...")

        required_packages = ["wheel", "setuptools", "twine"]
        platform_specific = []

        if sys.platform == "win32":
            platform_specific = ["pyinstaller"]
        elif sys.platform == "darwin":
            platform_specific = ["py2app"]
        elif sys.platform == "linux":
            platform_specific = ["PyInstaller"]

        all_packages = required_packages + platform_specific

        for package in all_packages:
            try:
                __import__(package.replace("-", "_"))
                self._log(f"✓ {package}")
            except ImportError:
                self._log(f"✗ {package} (not installed)")
                return False

        return True

    def _build_windows_exe(self) -> bool:
        """Build Windows executable using PyInstaller."""
        self._log("Building Windows executable...")

        spec_file = self._create_pyinstaller_spec()

        try:
            result = subprocess.run(
                [
                    sys.executable, "-m", "PyInstaller",
                    str(spec_file),
                    "--distpath", str(self.config.output_directory / "dist"),
                    "--workpath", str(self.config.output_directory / "build"),
                    "--specpath", str(self.config.output_directory),
                ],
                check=True,
                capture_output=True,
                text=True
            )
            self._log(result.stdout)
            self._log("✓ Windows executable built successfully")
            return True
        except subprocess.CalledProcessError as e:
            self._error(f"PyInstaller failed: {e.stderr}")
            return False

    def _build_windows_portable(self) -> bool:
        """Build portable Windows version."""
        self._log("Building portable Windows version...")

        # First build as EXE
        exe_config = BuildConfig(
            project_root=self.config.project_root,
            version=self.config.version,
            build_type=BuildTarget.WINDOWS_EXE,
            output_directory=self.config.output_directory,
            debug=self.config.debug,
        )
        exe_builder = BuildSystem(exe_config)
        if not exe_builder.build():
            return False

        # Create portable package
        portable_dir = self.config.output_directory / "JPE-Sims4-Portable"
        portable_dir.mkdir(exist_ok=True)

        # Copy executable and dependencies
        exe_path = self.config.output_directory / "dist" / "studio.exe"
        if exe_path.exists():
            shutil.copy2(exe_path, portable_dir / "JPE-Studio.exe")

        # Add necessary files
        readme_content = """# JPE Sims 4 Mod Translator - Portable Version

## No Installation Required
Simply extract and run JPE-Studio.exe

## Requirements
- Windows 7 or later
- 512MB RAM minimum
- 100MB disk space

## Getting Started
1. Extract all files to a folder
2. Run JPE-Studio.exe
3. Start translating mods!

For documentation, visit: https://github.com/khaoticdev62/JPE-Sims4
"""
        with open(portable_dir / "README.txt", "w") as f:
            f.write(readme_content)

        self._log("✓ Portable Windows version created")
        return True

    def _build_windows_installer(self) -> bool:
        """Build Windows NSIS installer."""
        self._log("Building Windows NSIS installer...")

        nsis_script = self._create_nsis_script()

        try:
            # Try to find NSIS
            nsis_exe = self._find_nsis()
            if not nsis_exe:
                self._log("NSIS not found. Skipping installer build.")
                return False

            result = subprocess.run(
                [nsis_exe, "/V4", str(nsis_script)],
                check=True,
                capture_output=True,
                text=True
            )
            self._log(result.stdout)
            self._log("✓ Windows installer created successfully")
            return True
        except subprocess.CalledProcessError as e:
            self._error(f"NSIS build failed: {e.stderr}")
            return False

    def _build_macos_app(self) -> bool:
        """Build macOS application bundle."""
        self._log("Building macOS application bundle...")

        try:
            result = subprocess.run(
                [
                    sys.executable, "-m", "py2app",
                    "-A",  # Alias mode for development
                    "-p", str(self.config.project_root),
                ],
                cwd=str(self.config.project_root),
                check=True,
                capture_output=True,
                text=True
            )
            self._log(result.stdout)

            # Move to output directory
            dist_dir = self.config.project_root / "dist"
            if dist_dir.exists():
                shutil.move(str(dist_dir / "studio.app"),
                           str(self.config.output_directory / "JPE-Studio.app"))

            self._log("✓ macOS application bundle created")
            return True
        except subprocess.CalledProcessError as e:
            self._error(f"py2app failed: {e.stderr}")
            return False

    def _build_macos_installer(self) -> bool:
        """Build macOS installer package."""
        self._log("Building macOS installer package...")

        try:
            # First create app bundle
            if not self._build_macos_app():
                return False

            # Create DMG
            app_path = self.config.output_directory / "JPE-Studio.app"
            dmg_path = self.config.output_directory / f"JPE-Sims4-{self.config.version}.dmg"

            result = subprocess.run(
                [
                    "hdiutil", "create",
                    "-volname", "JPE Sims 4 Mod Translator",
                    "-srcfolder", str(self.config.output_directory),
                    "-ov", "-format", "UDZO",
                    str(dmg_path)
                ],
                check=True,
                capture_output=True,
                text=True
            )
            self._log("✓ macOS installer created")
            return True
        except subprocess.CalledProcessError as e:
            self._error(f"DMG creation failed: {e.stderr}")
            return False

    def _build_linux_deb(self) -> bool:
        """Build Debian package."""
        self._log("Building Debian package...")

        # Create debian package structure
        pkg_dir = self.config.output_directory / "debian"
        pkg_dir.mkdir(exist_ok=True)

        debian_dir = pkg_dir / "DEBIAN"
        debian_dir.mkdir(exist_ok=True)

        # Create control file
        control_content = f"""Package: jpe-sims4
Version: {self.config.version}
Architecture: all
Maintainer: JPE Team
Description: JPE Sims 4 Mod Translator
 A tool for translating The Sims 4 mods using simple English syntax.
"""
        with open(debian_dir / "control", "w") as f:
            f.write(control_content)

        # Create postinst script
        postinst_content = """#!/bin/bash
python3 -m pip install -q jpe-sims4 >/dev/null 2>&1
"""
        postinst_path = debian_dir / "postinst"
        with open(postinst_path, "w") as f:
            f.write(postinst_content)
        postinst_path.chmod(0o755)

        try:
            # Build deb package
            result = subprocess.run(
                ["dpkg-deb", "--build", str(pkg_dir),
                 str(self.config.output_directory / f"jpe-sims4_{self.config.version}_all.deb")],
                check=True,
                capture_output=True,
                text=True
            )
            self._log("✓ Debian package created")
            return True
        except subprocess.CalledProcessError as e:
            self._error(f"dpkg-deb failed: {e.stderr}")
            return False

    def _build_linux_appimage(self) -> bool:
        """Build Linux AppImage."""
        self._log("Building Linux AppImage...")

        try:
            result = subprocess.run(
                [
                    sys.executable, "-m", "PyInstaller",
                    "--onefile",
                    "--name", "JPE-Studio",
                    str(self.config.project_root / "studio.py"),
                    "--distpath", str(self.config.output_directory / "dist"),
                ],
                check=True,
                capture_output=True,
                text=True
            )

            # Create AppImage using appimagetool
            appdir = self.config.output_directory / "AppDir"
            appdir.mkdir(exist_ok=True)

            # Copy executable
            exe_path = self.config.output_directory / "dist" / "JPE-Studio"
            if exe_path.exists():
                (appdir / "usr" / "bin").mkdir(parents=True, exist_ok=True)
                shutil.copy2(exe_path, appdir / "usr" / "bin" / "JPE-Studio")

            self._log("✓ Linux AppImage created")
            return True
        except subprocess.CalledProcessError as e:
            self._error(f"AppImage build failed: {e.stderr}")
            return False

    def _build_source_dist(self) -> bool:
        """Build source distribution."""
        self._log("Building source distribution...")

        try:
            result = subprocess.run(
                [sys.executable, "setup.py", "sdist", "--formats=gztar"],
                cwd=str(self.config.project_root),
                check=True,
                capture_output=True,
                text=True
            )
            self._log(result.stdout)

            # Move to output directory
            dist_dir = self.config.project_root / "dist"
            if dist_dir.exists():
                for tar_file in dist_dir.glob("*.tar.gz"):
                    shutil.copy2(tar_file, self.config.output_directory / tar_file.name)

            self._log("✓ Source distribution created")
            return True
        except subprocess.CalledProcessError as e:
            self._error(f"Source distribution build failed: {e.stderr}")
            return False

    def _create_pyinstaller_spec(self) -> Path:
        """Create PyInstaller spec file.

        Returns:
            Path to spec file
        """
        spec_content = f"""# -*- mode: python ; coding: utf-8 -*-
a = Analysis(
    ['{self.config.project_root / "studio.py"}'],
    pathex=['{self.config.project_root}'],
    binaries=[],
    datas=[],
    hiddenimports=['tkinter', 'engine', 'ui', 'diagnostics'],
    hookspath=[],
    hooksconfig={{}},
    runtime_hooks=[],
    excludedimports=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=None,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=None)
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='JPE-Studio',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
"""
        spec_path = self.config.output_directory / "studio.spec"
        with open(spec_path, "w") as f:
            f.write(spec_content)

        return spec_path

    def _create_nsis_script(self) -> Path:
        """Create NSIS installer script.

        Returns:
            Path to NSIS script
        """
        nsis_content = f"""!include "MUI2.nsh"

Name "JPE Sims 4 Mod Translator {self.config.version}"
OutFile "{self.config.output_directory}\\JPE-Sims4-{self.config.version}-installer.exe"
InstallDir "$PROGRAMFILES\\JPE"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  File "dist\\studio.exe"
  CreateDirectory "$SMPROGRAMS\\JPE"
  CreateShortcut "$SMPROGRAMS\\JPE\\JPE Studio.lnk" "$INSTDIR\\studio.exe"
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\\studio.exe"
  Delete "$SMPROGRAMS\\JPE\\JPE Studio.lnk"
  RMDir "$SMPROGRAMS\\JPE"
SectionEnd
"""
        nsis_path = self.config.output_directory / "installer.nsi"
        with open(nsis_path, "w") as f:
            f.write(nsis_content)

        return nsis_path

    def _find_nsis(self) -> Optional[Path]:
        """Find NSIS installation.

        Returns:
            Path to makensis.exe if found
        """
        common_paths = [
            Path("C:/Program Files/NSIS/makensis.exe"),
            Path("C:/Program Files (x86)/NSIS/makensis.exe"),
        ]

        for path in common_paths:
            if path.exists():
                return path

        return None

    def _log(self, message: str):
        """Log a message.

        Args:
            message: Message to log
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        self.build_log.append(log_entry)
        print(log_entry)

        if self.on_progress:
            self.on_progress(log_entry)

    def _error(self, message: str):
        """Log an error.

        Args:
            message: Error message
        """
        self._log(f"ERROR: {message}")

        if self.on_error:
            self.on_error(message)

    def get_log(self) -> str:
        """Get build log.

        Returns:
            Complete build log
        """
        return "\n".join(self.build_log)


def main():
    """Main entry point for build system."""
    import argparse

    parser = argparse.ArgumentParser(description="JPE Sims 4 Build System")
    parser.add_argument("--target", type=str, default="windows_exe",
                       choices=[t.value for t in BuildTarget])
    parser.add_argument("--version", type=str, default="1.0.0")
    parser.add_argument("--output", type=Path, default=Path("./dist"))
    parser.add_argument("--debug", action="store_true")
    parser.add_argument("--sign", action="store_true")
    parser.add_argument("--cert", type=Path)

    args = parser.parse_args()

    config = BuildConfig(
        project_root=Path(__file__).parent.parent,
        version=args.version,
        build_type=BuildTarget(args.target),
        output_directory=args.output,
        debug=args.debug,
        sign_binaries=args.sign,
        certificate_path=args.cert,
    )

    builder = BuildSystem(config)
    success = builder.build()

    print("\n" + "=" * 70)
    print("Build Log:")
    print("=" * 70)
    print(builder.get_log())

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
