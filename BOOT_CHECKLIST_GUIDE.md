# Boot Checklist System - User & Developer Guide

## Overview

The Boot Checklist System provides real-time visual feedback during application startup and installation. It displays component loading status with professional animations and clear progress indicators.

---

## 🎯 Features

### User Experience
- ✅ Real-time progress visualization
- ✅ Professional startup animations
- ✅ Clear component status indicators
- ✅ Detailed loading messages
- ✅ Performance metrics (load times)
- ✅ Scrollable checklist for many items
- ✅ Progress bar with percentage
- ✅ Status summary at the bottom

### Visual Design
- **Status Symbols**:
  - `○` Pending (Gray)
  - `◐` Checking/Loading (Orange)
  - `✓` Success (Green)
  - `⚠` Warning (Yellow)
  - `✗` Error (Red)

- **Color Scheme**:
  - Professional blue for headers
  - Light background (#F5F5F5)
  - Status-based colors for indicators
  - High contrast for accessibility

---

## 📦 Components

### 1. BootChecklist (`ui/boot_checklist.py`)

Main boot checklist system for application startup.

```python
from ui.boot_checklist import BootChecklist, create_standard_checklist

# Create standalone checklist window
checklist = BootChecklist(title="Initializing Application")

# Add items
checklist.add_item(
    "Loading Configuration",
    check_func=load_config,
    timeout=5.0
)

# Run the checklist
checklist.run(on_complete=on_startup_complete)
```

**Features:**
- Standalone window or embedded in parent widget
- Async execution in background thread
- Real-time status updates
- Timeout handling
- Performance timing

### 2. InstallerChecklist (`ui/installer_checklist.py`)

Installation wizard progress checklist.

```python
from ui.installer_checklist import InstallerChecklist

# Create embedded in installer
checklist = InstallerChecklist(parent_widget, "Installation Progress")
checklist.pack(fill=tk.BOTH, expand=True)

# Add installation steps
checklist.add_item("Creating Directories", create_dirs_func)
checklist.add_item("Installing Files", install_files_func)

# Run installation
checklist.run(on_complete=on_install_complete)
```

**Features:**
- Embeds in parent widget
- Ideal for multi-step wizards
- Professional styling
- Progress tracking

### 3. StartupScreen (`ui/startup_screen.py`)

Professional startup screen with integrated checklist.

```python
from ui.startup_screen import StartupScreen

# Create startup screen
startup = StartupScreen(root_window, on_ready=show_main_app)

# Run startup sequence
startup.run_startup()
```

**Features:**
- Branded header
- System checks
- All standard startup items
- Transitions to main app when complete

### 4. EnhancedInstallerWithChecklist (`ui/installer_enhanced.py`)

Complete installer wizard with boot checklist integration.

**Screens:**
1. Welcome screen
2. License agreement
3. Destination folder selection
4. Component selection
5. Installation summary
6. Installation progress (with checklist)
7. Completion screen

---

## 🚀 Usage Examples

### Example 1: Simple Standalone Checklist

```python
from ui.boot_checklist import BootChecklist
import tkinter as tk

def load_database():
    import time
    time.sleep(1)
    return "success", "Database connected"

# Create and run
checklist = BootChecklist(title="Database Initialization")
checklist.add_item("Connecting to Database", load_database)
checklist.run()
```

### Example 2: Custom Checklist Items

```python
from ui.boot_checklist import BootChecklist

def custom_check():
    # Perform custom operation
    try:
        result = perform_operation()
        return "success", f"Operation completed: {result}"
    except Exception as e:
        return "error", str(e)

checklist = BootChecklist()
checklist.add_item("Custom Operation", custom_check, timeout=10.0)
checklist.run(on_complete=lambda: print("Done!"))
```

### Example 3: Integration with Studio

```python
from ui.startup_screen import StartupScreen
import tkinter as tk

root = tk.Tk()

def show_main_app():
    # Create and show main application
    from studio import DesktopStudio
    app = DesktopStudio(root)
    app.setup_ui()

# Show startup screen first
startup = StartupScreen(root, on_ready=show_main_app)
startup.run_startup()

root.mainloop()
```

### Example 4: Custom Check Functions

```python
from ui.boot_checklist import BootChecklist, ChecklistItem
from typing import Tuple

def validate_environment() -> Tuple[str, str]:
    """Custom environment validation."""
    import os

    required_dirs = [".config", "projects", "logs"]
    missing = [d for d in required_dirs if not os.path.exists(d)]

    if missing:
        return "warning", f"Missing: {', '.join(missing)}"

    return "success", "Environment valid"

checklist = BootChecklist()
checklist.add_item("Environment Validation", validate_environment)
checklist.run()
```

---

## 🎨 Customization

### Custom Colors

```python
from ui.boot_checklist import BootChecklist

class CustomChecklist(BootChecklist):
    COLORS = {
        "pending": "#CCCCCC",
        "checking": "#0099FF",
        "success": "#00CC00",
        "warning": "#FFAA00",
        "error": "#FF3333"
    }

checklist = CustomChecklist()
# ... add items ...
checklist.run()
```

### Custom Symbols

```python
class CustomChecklist(BootChecklist):
    SYMBOLS = {
        "pending": "⭕",
        "checking": "🔄",
        "success": "✅",
        "warning": "⚠️",
        "error": "❌"
    }
```

### Custom Styling

```python
# Modify appearance after creation
checklist = BootChecklist()

# Change window size
checklist.root.geometry("800x600")

# Change colors programmatically
for item in checklist.items:
    item.status_label.config(fg="#custom_color")
```

---

## 📊 Standard Checklist Items

The `create_standard_checklist()` function includes these items:

1. **System Requirements** - Verify OS, Python, RAM
2. **Configuration** - Load settings and preferences
3. **Security** - Initialize security validators
4. **Theme System** - Load all UI themes
5. **Translation Engine** - Initialize core engine
6. **Plugins** - Discover and load plugins
7. **Cloud Client** - Initialize cloud API
8. **Onboarding System** - Load The Codex tutorials
9. **Documentation** - Load help system
10. **Finalization** - Complete startup

---

## 🔧 Check Function Requirements

Check functions should follow this pattern:

```python
def my_check_func() -> Tuple[str, str]:
    """
    Perform a check and return status.

    Returns:
        Tuple of (status, message) where status is one of:
        - "success": Operation completed successfully
        - "warning": Operation completed with warnings
        - "error": Operation failed

        message: Optional description of result
    """
    try:
        # Perform operation
        result = perform_operation()

        if result.success:
            return "success", "Operation completed"
        else:
            return "warning", "Operation completed with issues"

    except Exception as e:
        return "error", str(e)

# Or return just status
def simple_check():
    import time
    time.sleep(1)
    return "success"  # Default message used
```

---

## 🎬 Animation Details

### Loading Sequence

1. **Item Appears** - Added to checklist with `○` (pending)
2. **Checking Starts** - Symbol changes to `◐` (orange)
3. **Execution** - Function runs, time tracked
4. **Completion** - Symbol changes based on result
5. **Progress Update** - Progress bar advances

### Timing

- Default timeout: 5 seconds per item
- Execution time tracked and displayed
- Total estimated time calculated
- Smooth progress bar animation

### Visual Effects

- Color transitions for status changes
- Smooth progress bar movement
- Scrolling to current item
- Message updates in real-time

---

## 🧪 Testing

### Test Standalone Checklist

```python
import tkinter as tk
from ui.boot_checklist import create_standard_checklist

root = tk.Tk()
checklist = create_standard_checklist(root)
checklist.run()
root.mainloop()
```

### Test Installer

```python
from ui.installer_enhanced import EnhancedInstallerWithChecklist

installer = EnhancedInstallerWithChecklist()
installer.run()
```

### Test Startup Screen

```python
import tkinter as tk
from ui.startup_screen import StartupScreen

root = tk.Tk()

def done():
    print("Startup complete!")
    root.quit()

startup = StartupScreen(root, on_ready=done)
startup.run_startup()
root.mainloop()
```

---

## 🐛 Troubleshooting

### Checklist Not Showing Items

**Problem**: Items not appearing in checklist
```python
# Solution: Items must be added before calling run()
checklist = BootChecklist()
checklist.add_item(...)  # Add first
checklist.run()           # Then run
```

### Colors Not Updating

**Problem**: Status colors not changing
```python
# Solution: Ensure check function returns tuple
def my_check():
    return "success", "Done"  # Correct
    # return "success"        # Wrong - needs message
```

### Timeout Issues

**Problem**: Items timing out
```python
# Solution: Increase timeout
checklist.add_item("Slow Operation", slow_func, timeout=30.0)
```

### Blocked UI

**Problem**: UI freezing during checks
```python
# Solution: Ensure functions run in background (use threading if needed)
# BootChecklist handles threading automatically for standard functions
```

---

## 📈 Performance Considerations

### Best Practices

1. **Keep checks short** - Aim for 0.5-2 seconds per item
2. **Use async operations** - For long-running tasks
3. **Provide feedback** - Return descriptive messages
4. **Set appropriate timeouts** - Match expected duration
5. **Handle exceptions** - Return error status gracefully

### Optimization

```python
# Good: Fast check
def fast_check():
    # Simple validation, <500ms
    return "success"

# Bad: Slow check
def slow_check():
    # Heavy computation, >10s
    import time
    time.sleep(20)  # Too long!
    return "success"

# Solution: Move heavy work to separate thread
import threading

def optimized_check():
    result = {"status": "success"}

    def heavy_work():
        # This runs in background
        result["status"] = "success"

    thread = threading.Thread(target=heavy_work)
    thread.start()
    thread.join(timeout=5)  # Wait max 5 seconds

    return result["status"]
```

---

## 🔐 Security Considerations

### Safe Check Functions

```python
# Good: Validates input, handles errors
def safe_check(config_path: str):
    try:
        # Validate path is safe
        from security.validator import security_validator
        security_validator.validate_path(config_path)

        # Load config safely
        config = load_config(config_path)
        return "success", "Config loaded"

    except Exception as e:
        # Don't expose sensitive info
        return "error", "Config loading failed"

# Bad: No validation, exposes paths
def unsafe_check():
    try:
        config = load_config("/etc/sensitive/config")
        return "success", f"Loaded {config}"  # Exposes path!
    except Exception as e:
        return "error", str(e)  # Exposes error details
```

---

## 🌍 Internationalization

### Localizing Messages

```python
from ui.boot_checklist import BootChecklist

def translated_check():
    from i18n import get_string
    return "success", get_string("check.complete")

checklist = BootChecklist(title=get_string("startup.title"))
checklist.add_item(get_string("startup.config"), translated_check)
checklist.run()
```

---

## 📚 API Reference

### BootChecklist Class

```python
class BootChecklist:
    def __init__(self, parent: Optional[tk.Widget] = None,
                 title: str = "Initializing"):
        """Create boot checklist."""

    def add_item(self, name: str, check_func: Callable,
                 timeout: float = 5.0):
        """Add a checklist item."""

    def run(self, on_complete: Optional[Callable] = None):
        """Run the checklist."""

    def close(self):
        """Close the checklist window."""
```

### Check Function Signature

```python
from typing import Tuple, Union

def check_function() -> Union[str, Tuple[str, str]]:
    """
    Execute a check.

    Returns:
        str: Status only ("success", "warning", "error")
        Tuple[str, str]: (status, message)
    """
    pass
```

---

## 🎓 Learn More

- [Installation Guide](./INSTALLATION_GUIDE.md) - Setup instructions
- [Architecture](./ARCHITECTURE.md) - System design
- [Contributing](./CONTRIBUTING.md) - Development guidelines

---

## 💡 Tips & Tricks

### Add Custom Logging

```python
def logged_check():
    from diagnostics.logging import log_info

    log_info("Starting custom check")
    result = perform_check()
    log_info(f"Check result: {result}")

    return "success", "Check logged"
```

### Add Progress Updates

```python
def progress_check():
    import time

    steps = ["Step 1", "Step 2", "Step 3"]
    for step in steps:
        # Process step
        time.sleep(0.5)

    return "success", f"Completed {len(steps)} steps"
```

### Conditional Checks

```python
def conditional_check():
    import sys

    if sys.platform == "win32":
        # Windows-specific check
        return "success", "Windows detected"
    else:
        return "success", "Non-Windows detected"
```

---

## 📞 Support

For issues or questions:
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review [API_REFERENCE.md](./API_REFERENCE.md)
- File issue on [GitHub](https://github.com/khaoticdev62/JPE-Sims4)

---

**Version**: 1.0.0
**Last Updated**: December 2024
