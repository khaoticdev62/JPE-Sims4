"""
Windows Installer Script for JPE Sims 4 Mod Translator

This script creates a Windows installer for the JPE Sims 4 Mod Translator application.
It packages the application with all dependencies for easy distribution.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def install_pyinstaller():
    """Install PyInstaller if not already installed."""
    try:
        import PyInstaller
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"])
        import PyInstaller  # Verify installation

def create_executable():
    """Create standalone executables for the application."""
    print("Creating Windows executables...")
    
    # Create spec file for CLI tool
    cli_spec_content = f"""# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['cli.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('engine', 'engine'),
        ('diagnostics', 'diagnostics'), 
        ('plugins', 'plugins'),
        ('cloud', 'cloud'),
        ('onboarding', 'onboarding'),
    ],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={{}},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='jpe-sims4-cli',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)
"""
    
    # Create spec file for Studio
    studio_spec_content = f"""# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['studio.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('engine', 'engine'),
        ('diagnostics', 'diagnostics'), 
        ('plugins', 'plugins'),
        ('cloud', 'cloud'),
        ('onboarding', 'onboarding'),
    ],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={{}},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='jpe-sims4-studio',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # No console window for GUI app
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)
"""
    
    # Write spec files
    with open('jpe-sims4-cli.spec', 'w') as f:
        f.write(cli_spec_content)
    
    with open('jpe-sims4-studio.spec', 'w') as f:
        f.write(studio_spec_content)
    
    # Build executables
    print("Building CLI executable...")
    subprocess.run([sys.executable, "-m", "PyInstaller", "jpe-sims4-cli.spec"])
    
    print("Building Studio executable...")
    subprocess.run([sys.executable, "-m", "PyInstaller", "jpe-sims4-studio.spec"])

def create_installer():
    """Create a Windows installer using Inno Setup or similar."""
    print("Creating Windows installer...")
    
    # Create installer script for Inno Setup
    installer_script = r"""[Setup]
AppName=JPE Sims 4 Mod Translator
AppVersion=0.1.0
DefaultDirName={pf}\JPE Sims 4 Mod Translator
DefaultGroupName=JPE Sims 4 Mod Translator
OutputBaseFilename=jpe-sims4-installer
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "dist\jpe-sims4-cli.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist\jpe-sims4-studio.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.md"; DestDir: "{app}"; Flags: isreadme

[Icons]
Name: "{group}\JPE Sims 4 Studio"; Filename: "{app}\jpe-sims4-studio.exe"
Name: "{group}\JPE Sims 4 CLI"; Filename: "{app}\jpe-sims4-cli.exe"
Name: "{group}\Uninstall"; Filename: "{uninstallexe}"
Name: "{commondesktop}\JPE Sims 4 Studio"; Filename: "{app}\jpe-sims4-studio.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\jpe-sims4-studio.exe"; Description: "{cm:LaunchProgram,JPE Sims 4 Studio}"; Flags: nowait postinstall skipifsilent
"""
    
    with open('jpe-sims4-installer.iss', 'w') as f:
        f.write(installer_script)
    
    print("Inno Setup script created. To build the installer:")
    print("1. Install Inno Setup from: http://www.jrsoftware.org/isdl.php")  
    print("2. Run: iscc jpe-sims4-installer.iss")

def create_portable_zip():
    """Create a portable ZIP package."""
    print("Creating portable ZIP package...")
    
    # This would create a portable version in a real implementation
    # For now, just document the process
    portable_content = """
Portable Package Contents:
- jpe-sims4-cli.exe (command-line interface)
- jpe-sims4-studio.exe (desktop application)
- README.md
- docs/ (documentation)
- examples/ (example projects)

To use the portable version:
1. Extract the ZIP file to any location
2. Run jpe-sims4-studio.exe for the GUI
3. Run jpe-sims4-cli.exe for the command-line interface
"""
    
    with open('PORTABLE_PACKAGE_INFO.txt', 'w') as f:
        f.write(portable_content)

def main():
    """Main function to create Windows installer."""
    print("Building Windows installer for JPE Sims 4 Mod Translator...")
    
    # Install required tools
    install_pyinstaller()
    
    # Create executables
    create_executable()
    
    # Create installer script
    create_installer()
    
    # Create portable package info
    create_portable_zip()
    
    print("\nWindows installer creation completed!")
    print("Next steps:")
    print("1. Review the generated executables in the 'dist' folder")
    print("2. Install Inno Setup to build the final installer")
    print("3. Run 'iscc jpe-sims4-installer.iss' to create the .exe installer")

if __name__ == "__main__":
    main()