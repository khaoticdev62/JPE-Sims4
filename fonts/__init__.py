"""
Fonts Package for JPE Sims 4 Mod Translator.

This package provides a comprehensive font management system with multiple
font packs, installation utilities, and integration with the application's
UI system.
"""

# Import font managers and definitions
from .font_manager import font_manager, FontPack, FontDefinition, FontManager

# Import font configuration
try:
    from .font_config import (
        register_font_configs,
        get_current_font_pack,
        set_current_font_pack,
        get_font_size_multiplier,
        set_font_size_multiplier,
        load_fonts_from_config
    )
except ImportError as e:
    print(f"Warning: Could not import font_config: {e}")
    # Define placeholder functions if import fails
    def register_font_configs():
        pass
    def get_current_font_pack():
        return "modern"
    def set_current_font_pack(pack_name):
        pass
    def get_font_size_multiplier():
        return 1.0
    def set_font_size_multiplier(multiplier):
        pass
    def load_fonts_from_config():
        pass

# Import font integration
try:
    from .font_integration import (
        FontThemeIntegration,
        apply_fonts_to_widget,
        apply_fonts_recursive,
        get_current_font_info,
        font_theme_integration,
        apply_font_integration
    )
except ImportError as e:
    print(f"Warning: Could not import font_integration: {e}")
    # Define placeholder functions if import fails
    class FontThemeIntegration:
        pass
    def apply_fonts_to_widget(widget, font_key, size_override=None):
        pass
    def apply_fonts_recursive(widget, font_key, size_override=None):
        pass
    def get_current_font_info():
        return {}
    font_theme_integration = None
    def apply_font_integration(widget, theme_name):
        pass

# Import font preview
try:
    from .font_preview import FontPreviewWindow, show_font_preview
except ImportError as e:
    print(f"Warning: Could not import font_preview: {e}")
    # Define placeholder
    class FontPreviewWindow:
        def __init__(self, parent_window):
            pass
    def show_font_preview(parent_window):
        pass

# Import font installer
try:
    from .font_installer import (
        install_font_file,
        get_system_font_dir,
        is_font_installed,
        get_installed_fonts,
        FontInstallerGUI,
        show_font_installer
    )
except ImportError as e:
    print(f"Warning: Could not import font_installer: {e}")
    # Define placeholders
    def install_font_file(font_path):
        return False
    def get_system_font_dir():
        return None
    def is_font_installed(font_name):
        return False
    def get_installed_fonts():
        return []
    class FontInstallerGUI:
        def __init__(self, parent_window):
            pass
    def show_font_installer(parent_window):
        pass

# Import bundled font installer
try:
    from .bundled_font_installer import (
        BundledFontInstaller,
        show_bundled_font_installer,
        install_all_bundled_fonts,
        install_bundled_fonts_by_category
    )
except ImportError as e:
    print(f"Warning: Could not import bundled_font_installer: {e}")
    # Define placeholders
    class BundledFontInstaller:
        def __init__(self, parent_window=None):
            pass
    def show_bundled_font_installer(parent_window=None):
        pass
    def install_all_bundled_fonts():
        return {}
    def install_bundled_fonts_by_category(category):
        return {}

# Import font distribution
try:
    from .font_distribution import (
        font_distribution_manager,
        BundledFont,
        FontDistributionManager
    )
except ImportError as e:
    print(f"Warning: Could not import font_distribution: {e}")
    # Define placeholders
    class BundledFont:
        pass
    class FontDistributionManager:
        pass
    font_distribution_manager = None

# Import visual font preview
try:
    from .visual_font_preview import (
        VisualFontPreviewGenerator,
        create_visual_font_previews
    )
except ImportError as e:
    print(f"Warning: Could not import visual_font_preview: {e}")
    # Define placeholders
    class VisualFontPreviewGenerator:
        def __init__(self, output_dir=None):
            pass
        def generate_font_pack_preview(self, pack_name, width=800, height=600):
            return None
        def generate_all_font_pack_previews(self):
            return []
    def create_visual_font_previews():
        return []

# Import visual font selector
try:
    from .visual_font_selector import (
        VisualFontSelector,
        show_visual_font_selector,
        create_visual_font_selector_tab
    )
except ImportError as e:
    print(f"Warning: Could not import visual_font_selector: {e}")
    # Define placeholders
    class VisualFontSelector:
        def __init__(self, parent):
            pass
    def show_visual_font_selector(parent_window):
        pass
    def create_visual_font_selector_tab(notebook):
        import tkinter as tk
        import tkinter.ttk as ttk
        return ttk.Frame(notebook), None

# Import font settings
try:
    from .font_settings import FontSettingsPanel, create_font_settings_tab
except ImportError as e:
    print(f"Warning: Could not import font_settings: {e}")
    # Define placeholders
    class FontSettingsPanel:
        def __init__(self, parent):
            pass
    def create_font_settings_tab(notebook):
        import tkinter as tk
        import tkinter.ttk as ttk
        return ttk.Frame(notebook), None


__all__ = [
    # Font Manager
    'font_manager',
    'FontPack',
    'FontDefinition',
    'FontManager',

    # Font Config
    'register_font_configs',
    'get_current_font_pack',
    'set_current_font_pack',
    'get_font_size_multiplier',
    'set_font_size_multiplier',
    'load_fonts_from_config',

    # Font Integration
    'FontThemeIntegration',
    'apply_fonts_to_widget',
    'apply_fonts_recursive',
    'get_current_font_info',
    'font_theme_integration',
    'apply_font_integration',

    # Font Preview
    'FontPreviewWindow',
    'show_font_preview',

    # Font Installer
    'install_font_file',
    'get_system_font_dir',
    'is_font_installed',
    'get_installed_fonts',
    'FontInstallerGUI',
    'show_font_installer',

    # Bundled Font Installer
    'BundledFontInstaller',
    'show_bundled_font_installer',
    'install_all_bundled_fonts',
    'install_bundled_fonts_by_category',

    # Font Distribution
    'font_distribution_manager',
    'BundledFont',
    'FontDistributionManager',

    # Visual Font Components
    'VisualFontPreviewGenerator',
    'create_visual_font_previews',
    'VisualFontSelector',
    'show_visual_font_selector',
    'create_visual_font_selector_tab',

    # Font Settings
    'FontSettingsPanel',
    'create_font_settings_tab',
]