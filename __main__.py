"""Main initialization module for JPE Sims 4 Mod Translator."""

import os
import sys
from pathlib import Path


def initialize_app():
    """Initialize the application with all security and performance measures."""
    # Initialize config
    from config.config_manager import config_manager
    
    # Set up proper permissions for config directory
    config_dir = config_manager.config_dir
    if not config_dir.exists():
        config_dir.mkdir(parents=True, exist_ok=True)
        # On Unix systems, set secure permissions
        if hasattr(os, 'chmod'):
            try:
                os.chmod(config_dir, 0o700)  # Read/write/execute for owner only
            except:
                pass  # Continue even if chmod fails
    
    # Initialize security validator
    from security.validator import security_validator
    
    # Initialize performance monitoring
    from performance.monitor import performance_monitor
    
    # Set up logging
    from diagnostics.logging import log_info
    log_info("Application initialized", version=config_manager.get("app.version"))
    
    # Initialize theme manager
    from ui.theme_manager import theme_manager
    
    # Initialize teaching system
    from onboarding.teaching_system import teaching_system, onboarding_system, test_system


def check_system_requirements() -> bool:
    """Check if the system meets minimum requirements."""
    import platform
    import psutil
    
    # Check OS version
    os_system = platform.system()
    os_release = platform.release()
    
    if os_system == "Windows":
        try:
            major_version = int(os_release.split('.')[0])
            if major_version < 6:  # Windows Vista is version 6.0
                print("Warning: Windows version may be too old")
                return False
        except (ValueError, IndexError):
            print("Warning: Could not determine Windows version")
            return False
    elif os_system not in ["Linux", "Darwin"]:
        print(f"Warning: {os_system} is not officially supported")
        return False
    
    # Check Python version
    python_version = sys.version_info
    if python_version < (3, 8):
        print("Error: Python 3.8 or higher is required")
        return False
    
    # Check available memory
    try:
        available_memory = psutil.virtual_memory().available
        if available_memory < 512 * 1024 * 1024:  # Less than 512MB
            print("Warning: Low available memory")
            return False
    except ImportError:
        # psutil not available, skip memory check
        pass
    
    # Check disk space in data directory
    data_dir = Path(config_manager.get("app.data_dir", str(Path.home() / ".jpe-sims4-data")))
    try:
        import shutil
        total, used, free = shutil.disk_usage(data_dir.parent)
        if free < 100 * 1024 * 1024:  # Less than 100MB
            print("Warning: Low disk space in data directory")
            return False
    except (OSError, AttributeError):
        # If we can't check disk space, assume it's OK
        pass
    
    return True


def main():
    """Main entry point for the application."""
    # Initialize all systems
    initialize_app()
    
    # Check system requirements
    if not check_system_requirements():
        print("System requirements not met. Please check warnings above.")
        sys.exit(1)
    
    # Check command-line arguments to determine startup mode
    if len(sys.argv) > 1:
        if sys.argv[1] == "cli":
            # Start CLI mode
            from cli import main as cli_main
            cli_main()
        elif sys.argv[1] == "studio":
            # Start Studio mode
            from studio import main as studio_main
            studio_main()
        else:
            # Default to Studio if argument doesn't match
            from studio import main as studio_main
            studio_main()
    else:
        # Default to Studio mode
        from studio import main as studio_main
        studio_main()


if __name__ == "__main__":
    main()