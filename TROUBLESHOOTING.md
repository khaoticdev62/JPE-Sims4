# Troubleshooting Guide - JPE Sims 4 Mod Translator

## Quick Help Index

- [Installation Problems](#installation-problems)
- [Application Issues](#application-issues)
- [Build & Compilation](#build--compilation)
- [Cloud Synchronization](#cloud-synchronization)
- [Mobile Apps](#mobile-apps)
- [Plugin Problems](#plugin-problems)
- [Performance Issues](#performance-issues)
- [File & Project Issues](#file--project-issues)
- [Diagnostic Tools](#diagnostic-tools)
- [Advanced Troubleshooting](#advanced-troubleshooting)

---

## Installation Problems

### Python Not Found

**Error**: `python: command not found` or `python is not recognized as an internal or external command`

**Solution**:
1. Install Python from [python.org](https://www.python.org/downloads/)
2. During installation, **check** "Add Python to PATH"
3. Restart your terminal/command prompt
4. Try: `python --version`

**Alternative**:
```bash
# Try python3
python3 --version

# Or specify full path
C:\Python311\python.exe --version  # Windows
/usr/bin/python3 --version         # macOS/Linux
```

### Pip Installation Failed

**Error**: `ERROR: Could not install packages due to an error`

**Solutions**:
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Try installing again
pip install jpe-sims4

# If still failing, try with --user flag
pip install --user jpe-sims4

# Or clear cache
pip install --no-cache-dir jpe-sims4
```

### Permission Denied (macOS/Linux)

**Error**: `Permission denied` when installing or running

**Solution**:
```bash
# Option 1: Use --user flag
pip install --user jpe-sims4

# Option 2: Fix file permissions
sudo chmod +x /usr/local/bin/jpe-studio

# Option 3: Use virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate
pip install jpe-sims4
```

### Conflicting Dependencies

**Error**: `ERROR: pip's dependency resolver does not currently take into account all the packages that are installed`

**Solution**:
```bash
# Create fresh virtual environment
python -m venv venv_new

# Activate it
# Windows: venv_new\Scripts\activate
# macOS/Linux: source venv_new/bin/activate

# Install afresh
pip install jpe-sims4
```

### Module Import Error

**Error**: `ModuleNotFoundError: No module named 'jpe_sims4'` or similar

**Solutions**:
```bash
# Verify installation
pip show jpe-sims4

# Reinstall
pip uninstall jpe-sims4 -y
pip install jpe-sims4

# Check Python path
python -c "import sys; print(sys.path)"

# Try installing in development mode (if from source)
cd path/to/JPE-Sims4
pip install -e .
```

---

## Application Issues

### Studio Won't Start

**Error**: Application fails to launch or crashes immediately

**Diagnostic Steps**:
```bash
# 1. Check Python version
python --version  # Must be 3.8+

# 2. Try verbose mode
jpe-studio --verbose

# 3. Check for errors
jpe-studio --debug

# 4. Check logs
cat logs/studio.log       # macOS/Linux
type logs\studio.log      # Windows
```

**Solutions**:
```bash
# Reinstall tkinter (if missing)
# Windows: Usually included
# macOS: brew install python-tk
# Ubuntu: sudo apt-get install python3-tk
# Fedora: sudo dnf install python3-tkinter

# Clear application cache
rm -rf ~/.cache/jpe/          # macOS/Linux
del %LOCALAPPDATA%\jpe\cache  # Windows

# Reinstall cleanly
pip uninstall jpe-sims4
pip cache purge
pip install jpe-sims4
```

### Settings Not Saved

**Problem**: Theme or settings revert after restart

**Solution**:
```bash
# Check config file permissions
ls -la ~/.config/jpe/settings.json  # macOS/Linux

# Ensure write permissions
chmod 644 ~/.config/jpe/settings.json

# On Windows, check AppData folder
# %LOCALAPPDATA%\jpe\settings.json
```

### Theme Not Applying

**Problem**: Selected theme doesn't appear or wrong colors show

**Solution**:
1. Go to Settings → Appearance
2. Clear all theme caches
3. Select theme again
4. Restart application

```bash
# Or clear cache manually
rm -rf ~/.cache/jpe/themes/
```

### UI Looks Corrupted

**Problem**: Text overlapping, missing icons, or weird colors

**Solutions**:
1. Try different theme: Settings → Appearance
2. Increase UI scaling: Settings → Display
3. Update Tkinter:
   ```bash
   pip install --upgrade tk
   ```
4. Reinstall application:
   ```bash
   pip uninstall jpe-sims4
   pip install jpe-sims4
   ```

---

## Build & Compilation

### Build Fails Immediately

**Error**: Build starts but fails without clear message

**Diagnostic Steps**:
```bash
# 1. Check project structure
ls src/  # Should have .jpe files

# 2. Validate project manually
jpe-sims4 validate .

# 3. Check specific file
jpe-sims4 validate src/interactions.jpe
```

**Common Issues**:
- Missing `src/` directory
- Empty JPE files
- Wrong file encoding (use UTF-8)
- File format issues

### Syntax Errors in JPE Files

**Error**: `ParseError` or `SyntaxError` during build

**Solutions**:
1. Check error message for location
2. Open file at line number
3. Common issues:
   ```
   Missing [Interactions] block start
   Missing 'end' statement
   Incorrect indentation
   Quotes not matching
   Invalid characters
   ```

**Example Fix**:
```
❌ WRONG
[Interactions
id: my_interaction
end

✅ CORRECT
[Interactions]
id: my_interaction
end
```

### Validation Errors

**Error**: Build passes parsing but fails validation

**Common Validation Issues**:
1. **Duplicate IDs**: Each object must have unique ID
2. **Missing Required Fields**: id, display_name, etc.
3. **Invalid References**: Buff/Trait doesn't exist
4. **Format Issues**: Value doesn't match expected type

**Debugging**:
```bash
# Get detailed error report
jpe-sims4 validate . --verbose

# Check specific object
jpe-sims4 info . --show-validation
```

### No Output Generated

**Problem**: Build succeeds but no XML files created

**Solutions**:
1. Check output directory: `build/`
   ```bash
   ls build/  # Should see .xml files
   ```

2. Check build log:
   ```bash
   cat build/build_report.json
   ```

3. Verify generators are configured:
   ```bash
   jpe-sims4 info . --show-plugins
   ```

### Memory/Performance During Build

**Error**: Build crashes or takes very long time

**Solutions**:
```bash
# Monitor memory usage
# Windows: Task Manager
# macOS: Activity Monitor
# Linux: top or htop

# Try building with fewer files
# Split large projects

# Close other applications
# Free up RAM

# Try different Python version
# 3.11 is faster than 3.8
```

---

## Cloud Synchronization

### Can't Connect to Cloud

**Error**: `ConnectionError` or `Network error`

**Diagnostic Steps**:
```bash
# 1. Check internet connection
ping google.com

# 2. Check cloud service status
# Visit: https://status.example.com/

# 3. Check API connectivity
curl https://api.example.com/health

# 4. Check credentials
jpe-sims4 cloud --check-auth
```

**Solutions**:
1. Check firewall settings
2. Verify VPN if using one
3. Try different network (mobile hotspot)
4. Restart application
5. Sign out and sign back in

### Authentication Failed

**Error**: `AuthenticationError` or `Invalid credentials`

**Solutions**:
```bash
# 1. Sign out
jpe-sims4 cloud --signout

# 2. Sign in again
jpe-sims4 cloud --signin
```

**If still failing**:
1. Reset password on website
2. Clear stored credentials:
   ```bash
   rm ~/.config/jpe/credentials.json  # macOS/Linux
   del %LOCALAPPDATA%\jpe\credentials.json  # Windows
   ```
3. Sign in again

### Sync Stuck or Not Progressing

**Error**: Sync shows progress but doesn't complete

**Solutions**:
1. Cancel sync: Ctrl+C
2. Wait 30 seconds
3. Try again

```bash
# Force sync reset
jpe-sims4 cloud --reset-sync

# Or through GUI: Settings → Cloud → Reset
```

### Conflicts Not Resolving

**Problem**: Cloud conflict dialog keeps appearing

**Solutions**:
1. Choose resolution (local/remote)
2. Complete sync
3. If still stuck:
   ```bash
   jpe-sims4 cloud --clear-conflicts
   ```

### Slow Upload/Download

**Problem**: Cloud operations very slow

**Solutions**:
1. Check internet speed (speedtest.net)
2. Close bandwidth-heavy apps
3. Try different network
4. Check file size: `build/` shouldn't exceed 50MB
5. Split large projects

---

## Mobile Apps

### iOS App Won't Launch

**Error**: App crashes on startup

**Solutions**:
1. Force quit and restart
2. Reinstall app
3. Check iOS version (14.0+)
4. Check available storage (200MB+)

**If persists**:
1. Delete app
2. Restart device
3. Reinstall from App Store

### Android App Crashes

**Problem**: App force closes

**Solutions**:
```bash
# Clear app cache (Android settings)
Settings → Apps → JPE Sims 4 → Storage → Clear Cache

# Or uninstall and reinstall
```

### Mobile Sync Not Working

**Error**: Files not syncing to mobile device

**Solutions**:
1. Check internet connection
2. Verify logged in to cloud account
3. Enable cloud sync in settings
4. Try pulling manually: Menu → Sync → Pull
5. Check available storage

### Offline Mode Not Working

**Problem**: Can't access projects without internet

**Solutions**:
1. Download projects while online first
2. Check offline storage setting
3. Ensure sufficient device storage
4. Disable and re-enable offline mode

---

## Plugin Problems

### Plugin Won't Load

**Error**: Plugin not appearing in plugin list

**Solutions**:
1. Check plugin file location: `plugins/` directory
2. Verify file naming: `my_plugin.py`
3. Check Python syntax:
   ```bash
   python -m py_compile plugins/my_plugin.py
   ```
4. Check inheritance from proper base class

```python
# Must inherit from correct class
from jpe_sims4.plugins.base import ParserPlugin  # Not "BasePlugin"

class MyParser(ParserPlugin):
    format_name = "myformat"
```

### Plugin Execution Fails

**Error**: Plugin crashes during build

**Debugging**:
```bash
# Enable verbose logging
jpe-sims4 build . --verbose

# Check plugin logs
cat logs/plugins.log
```

**Common Issues**:
- Missing dependencies
- Incorrect method signature
- Not inheriting properly
- Version incompatibility

### Plugin Version Mismatch

**Error**: Plugin incompatible with current version

**Solution**:
```bash
# Check plugin version
cat plugins/my_plugin.py  # Look for version field

# Update plugin
pip install --upgrade my-jpe-plugin

# Or update main package
pip install --upgrade jpe-sims4
```

---

## Performance Issues

### Application Slow/Sluggish

**Problem**: UI unresponsive or freezes

**Solutions**:
1. Close other applications
2. Check CPU usage: Task Manager (Windows), Activity Monitor (macOS)
3. Check RAM: Must have 2GB+ free
4. Reduce project size
5. Update Python: `pip install --upgrade python`

### Build Takes Too Long

**Problem**: Compilation slow for medium/large projects

**Solutions**:
```bash
# Monitor build
jpe-sims4 build . --verbose

# If stuck in validation
# Some files may have deep nesting

# Split into smaller projects

# Check for plugins causing slowdown
# Disable unnecessary plugins
```

### Memory Leak

**Problem**: Memory usage keeps increasing

**Solutions**:
1. Restart application
2. Clear cache:
   ```bash
   rm -rf ~/.cache/jpe/
   ```
3. Check for problematic plugins
4. Report to developers with logs

---

## File & Project Issues

### Can't Create New Project

**Error**: Project creation fails

**Solutions**:
1. Check directory permissions
2. Ensure disk space (500MB+)
3. Use ASCII characters for project names (no unicode)
4. Check file path length (Windows limit: 260 chars)

### Can't Open Existing Project

**Error**: `ProjectNotFound` or `InvalidProject`

**Solutions**:
1. Verify project directory exists
2. Check `config/project.json` exists
3. Verify file permissions (read access)
4. Check file encoding (UTF-8)

### Files Disappearing

**Problem**: Project files deleted unexpectedly

**Solutions**:
1. Check recent commits if using git
2. Check `~/.config/jpe/backups/` for auto-backups
3. Use file recovery tool (Recuva, etc.)
4. Check cloud backup if enabled

### Project Won't Import

**Error**: Error importing project from zip/backup

**Solutions**:
1. Verify file isn't corrupted
2. Check zip contains proper structure:
   ```
   project/
   ├── config/
   ├── src/
   ├── build/
   └── config.json
   ```
3. Try importing individual files
4. Check disk space

---

## Diagnostic Tools

### Generate Diagnostic Report

```bash
# Run diagnostic
jpe-sims4 diagnose --output report.txt

# Or through GUI
Settings → Diagnostics → Generate Report
```

### Check System Requirements

```bash
# Python version
python --version

# Required modules
python -c "import tkinter; print('Tkinter OK')"
python -c "import requests; print('Requests OK')"

# Disk space
# Windows: diskpart
# macOS: df -h
# Linux: df -h

# RAM available
# Windows: wmic os get totalvisiblememory
# macOS: vm_stat
# Linux: free -h
```

### View Application Logs

```bash
# Studio logs
cat logs/studio.log  # Last session

# Build logs
cat build/build.log

# Cloud logs
cat logs/cloud.log

# Plugin logs
cat logs/plugins.log

# All logs
ls -la logs/
```

### Enable Debug Mode

```bash
# Run with debug output
jpe-studio --debug

# Or set environment variable
# Windows:
set JPE_DEBUG=1
jpe-studio

# macOS/Linux:
export JPE_DEBUG=1
jpe-studio
```

---

## Advanced Troubleshooting

### Check for Corrupted Installation

```bash
# Verify package integrity
pip check

# Verify individual modules
python -m py_compile jpe_sims4/__init__.py
python -m py_compile jpe_sims4/engine/__init__.py
python -m py_compile jpe_sims4/studio.py
```

### Reset to Default Settings

```bash
# Backup current settings
cp ~/.config/jpe/settings.json ~/.config/jpe/settings.json.bak

# Remove settings file
rm ~/.config/jpe/settings.json

# Application will recreate with defaults on restart
jpe-studio
```

### Build from Source (Development)

```bash
# Clone repository
git clone https://github.com/khaoticdev62/JPE-Sims4.git
cd JPE-Sims4

# Create virtual environment
python -m venv venv

# Activate
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Install development version
pip install -e ".[dev]"

# Run with development Python
python studio.py
```

### Collect Error Details for Report

When reporting issues, include:

```
- Python version: python --version
- JPE version: pip show jpe-sims4
- OS and version: Windows 10, macOS 12, Ubuntu 22.04, etc.
- Error message: Complete text of error
- Steps to reproduce: Exact steps to trigger error
- Logs: Content of logs/ directory files
- Screenshots: Visual representation if applicable
```

### Clean Installation

If all else fails:

```bash
# Backup your projects
cp -r ~/.config/jpe/projects ~/backup_projects

# Uninstall everything JPE-related
pip uninstall jpe-sims4 -y

# Remove configuration
rm -rf ~/.config/jpe/       # macOS/Linux
del %LOCALAPPDATA%\jpe      # Windows

# Clear Python cache
rm -rf __pycache__
find . -type d -name __pycache__ -exec rm -r {} +

# Reinstall
pip install jpe-sims4

# Restore projects
cp ~/backup_projects/* ~/.config/jpe/projects/
```

---

## Getting More Help

### Online Resources

- 📖 [Full Documentation](./DOCUMENTATION.md)
- 🛠️ [API Reference](./API_REFERENCE.md)
- 📐 [Architecture Guide](./ARCHITECTURE.md)
- 💬 [GitHub Discussions](https://github.com/khaoticdev62/JPE-Sims4/discussions)
- 🐛 [Report Issues](https://github.com/khaoticdev62/JPE-Sims4/issues)

### Check These First

1. Search existing [GitHub Issues](https://github.com/khaoticdev62/JPE-Sims4/issues)
2. Check [Changelog](./CHANGELOG.md) for known issues
3. Review [API Reference](./API_REFERENCE.md) for correct usage
4. Read relevant documentation file

### Report a Bug

Include in bug report:
- What version? (`jpe-sims4 --version`)
- What OS? (Windows 10, macOS 12, Ubuntu 22.04)
- What Python? (`python --version`)
- What happened? (Steps to reproduce)
- What error? (Full error message)
- Log files? (Content of `logs/`)

---

**Last Updated**: December 2024
**Version**: 1.0.0

If you need additional help, visit our [GitHub repository](https://github.com/khaoticdev62/JPE-Sims4).
