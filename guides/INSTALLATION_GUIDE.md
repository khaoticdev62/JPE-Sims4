# Installation Guide - JPE Sims 4 Mod Translator

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Desktop Installation](#desktop-installation)
3. [Mobile Installation](#mobile-installation)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)
6. [Uninstallation](#uninstallation)

---

## System Requirements

### Desktop Application

#### Minimum Requirements
- **OS**: Windows 7+, macOS 10.12+, or Linux (Ubuntu 18.04+)
- **Python**: 3.8 or higher
- **RAM**: 512 MB
- **Disk Space**: 500 MB

#### Recommended Requirements
- **OS**: Windows 10+, macOS 11+, or Linux (Ubuntu 20.04+)
- **Python**: 3.11 or higher
- **RAM**: 4 GB
- **Disk Space**: 2 GB
- **CPU**: Intel i5 or equivalent

#### Supported Platforms
- Windows 10, 11
- macOS 10.14+
- Ubuntu 18.04+
- Fedora 32+
- Debian 10+

### Mobile Applications

#### iOS
- iOS 14.0 or later
- iPhone 6s or newer
- iPad (5th generation) or newer
- 200 MB free storage

#### Android
- Android 8.0 or later
- 1.5 GB RAM minimum
- 300 MB free storage

---

## Desktop Installation

### Option 1: Using PyPI (Recommended)

The simplest way to install for end users.

#### 1. Install Python
- Download from [python.org](https://www.python.org)
- Run the installer
- ✅ Check "Add Python to PATH"
- Complete the installation

#### 2. Install JPE Sims 4 Mod Translator
```bash
pip install jpe-sims4
```

#### 3. Launch the Application
```bash
jpe-studio
```

### Option 2: Using the Installer Wizard

For users who prefer a guided installation.

#### 1. Download the Installer
- Visit the GitHub releases page
- Download the latest `jpe-installer.exe` (Windows)

#### 2. Run the Installer
- Double-click the installer
- Follow the setup wizard
- Choose installation directory
- Complete the installation

#### 3. Launch from Start Menu
- Windows: Start Menu → JPE Sims 4 Mod Translator
- Or use the desktop shortcut

### Option 3: From Source (Development)

For developers who want to contribute or use the latest version.

#### 1. Clone the Repository
```bash
git clone https://github.com/khaoticdev62/JPE-Sims4.git
cd "JPE-Sims4"
```

#### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install Development Dependencies
```bash
pip install -e ".[dev]"
```

#### 4. Run Tests (Optional)
```bash
python run_tests.py
```

#### 5. Launch the Application
```bash
python studio.py
```

---

## Mobile Installation

### iOS Installation

#### From App Store
1. Open App Store
2. Search for "JPE Sims 4 Mod Translator"
3. Tap "Get" then "Install"
4. Sign in with Apple ID if prompted
5. Wait for installation to complete

#### Building from Source
```bash
cd ios_app
# Requires Xcode 12.5+
open jpe_sims4_ios.xcodeproj
# Build and run in Xcode
```

### Android Installation (React Native)

#### Using APK
1. Download the latest APK from releases
2. Transfer to Android device
3. Open file manager on device
4. Tap the APK file
5. Tap "Install"
6. Grant necessary permissions

#### Building from Source
```bash
cd mobile_app
npm install
npm run android:build
```

---

## Verification

### Verify Desktop Installation

#### 1. Check Python Installation
```bash
python --version
# Should show 3.8 or higher
```

#### 2. Check JPE Installation
```bash
pip show jpe-sims4
# Should display package information
```

#### 3. Test Command Line Tools
```bash
# Should show version info
jpe-sims4 --version

# Should show help
jpe-sims4 --help
```

#### 4. Launch the Studio Application
```bash
jpe-studio
```

If the application launches without errors, installation is successful.

### Verify Mobile Installation

#### iOS
1. Locate app on home screen
2. Tap to launch
3. Grant requested permissions
4. Create or import a test project

#### Android
1. Open app drawer
2. Tap JPE Sims 4 Mod Translator
3. Grant requested permissions
4. Create or import a test project

---

## First-Time Setup

### Initial Configuration

#### 1. Launch the Application
```bash
jpe-studio
```

#### 2. Select a Theme (Optional)
- Go to Settings → Appearance
- Choose from 10 available themes
- Click "Apply"

#### 3. Create Your First Project
- Click "New Project"
- Enter project details:
  - Project Name: `My First Mod`
  - Project ID: `my_first_mod`
  - Author: Your name
  - Description: (optional)
- Click "Create"

#### 4. Create a Source File
- In the Project Explorer, right-click `src/` folder
- Select "New File"
- Name it `interactions.jpe`
- Add sample content:
  ```
  [Project]
  name: My First Mod
  id: my_first_mod
  version: 1.0.0
  author: Your Name
  end

  [Interactions]
  id: wave_hello
  display_name: Wave Hello
  description: A simple greeting
  end
  ```

#### 5. Test the Build
- Click the "Build" button
- View the build report
- Check `build/` folder for generated XML files

### Cloud Synchronization Setup (Optional)

#### 1. Enable Cloud Sync
- Go to Settings → Cloud
- Click "Enable Cloud Sync"

#### 2. Create or Sign In
- Click "Create Account" or "Sign In"
- Enter email and password
- Verify email (check inbox)

#### 3. Choose Sync Settings
- Select sync frequency (immediate, hourly, daily)
- Choose projects to synchronize
- Click "Save"

---

## Troubleshooting

### Python Not Found

**Error**: `python: command not found`

**Solution**:
1. Verify Python is installed: https://www.python.org
2. Check "Add Python to PATH" during installation
3. Restart command prompt after installation
4. Try using `python3` instead of `python`

### Permission Denied

**Error**: `Permission denied: 'jpe-studio'`

**Solution on macOS/Linux**:
```bash
# Make executable
chmod +x /usr/local/bin/jpe-studio

# Or install with --user flag
pip install --user jpe-sims4
```

### Module Not Found

**Error**: `ModuleNotFoundError: No module named 'jpe_sims4'`

**Solution**:
```bash
# Reinstall the package
pip uninstall jpe-sims4
pip install jpe-sims4 --upgrade
```

### Application Won't Start

**Problem**: Studio application fails to launch

**Solutions**:
1. Check Python version: `python --version` (3.8+)
2. Verify installation: `pip show jpe-sims4`
3. Check logs: Look in `logs/studio.log`
4. Try verbose mode: `jpe-studio --verbose`
5. Reinstall:
   ```bash
   pip uninstall jpe-sims4
   pip install jpe-sims4 --upgrade
   ```

### Cloud Sync Issues

**Problem**: Unable to connect to cloud services

**Solutions**:
1. Check internet connection
2. Verify credentials in Settings
3. Check cloud service status
4. Try signing out and in again
5. Check `logs/cloud.log` for error details

### Out of Memory

**Problem**: Application crashes with memory errors

**Solutions**:
1. Close other applications
2. Check available disk space
3. Increase Python heap: Set `PYTHONHASHSEED=random`
4. Work with smaller projects
5. Check for memory leaks in logs

---

## Uninstallation

### Uninstall on Windows

#### Using pip
```bash
pip uninstall jpe-sims4
```

#### Using Add/Remove Programs
1. Press `Windows + R`
2. Type `appwiz.cpl`
3. Find "JPE Sims 4 Mod Translator"
4. Click "Uninstall"
5. Follow the wizard

#### Removing Configuration Files (Optional)
```
C:\Users\YourUsername\AppData\Local\JPE\
```

### Uninstall on macOS

```bash
# Using pip
pip uninstall jpe-sims4

# Remove application from Applications
rm -rf /Applications/JPE\ Sims\ 4\ Mod\ Translator.app

# Remove configuration files
rm -rf ~/Library/Application\ Support/JPE/
```

### Uninstall on Linux

```bash
# Using pip
pip uninstall jpe-sims4

# Remove from PATH
rm -f /usr/local/bin/jpe-studio
rm -f /usr/local/bin/jpe-sims4

# Remove configuration files
rm -rf ~/.local/share/jpe/
rm -rf ~/.config/jpe/
```

---

## Next Steps

After successful installation:

1. **Read The Codex**: Launch The Codex tutorial from the Help menu
2. **Review Examples**: Check the `examples/` directory for sample projects
3. **Create Your First Mod**: Follow the "First-Time Setup" section
4. **Explore Documentation**: Read [DOCUMENTATION.md](./DOCUMENTATION.md)
5. **Join Community**: Visit GitHub discussions for help and ideas

---

## Getting Help

- 📖 **Documentation**: Read included markdown files
- 🐛 **Issues**: Report bugs on GitHub Issues
- 💬 **Discussions**: Ask questions on GitHub Discussions
- 🆘 **Logs**: Check `logs/` directory for troubleshooting

---

**Version**: 1.0.0 | **Last Updated**: December 2024
