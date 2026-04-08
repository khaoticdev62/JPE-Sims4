"""UI enhancement module for JPE Sims 4 Mod Translator."""

from ui.theme_manager import theme_manager
from config.config_manager import config_manager
from diagnostics.logging import log_info
import tkinter as tk
from tkinter import ttk


def initialize_enhanced_ui(root_window, studio_app):
    """Initialize all UI enhancements and accessibility features."""
    # Apply theme to the application
    theme_name = config_manager.get("ui.theme", "default")
    if theme_name in theme_manager.themes:
        theme_manager.apply_theme(root_window, theme_name)

    # Set up accessibility features
    setup_accessibility_features(root_window)

    # Enhance all tooltips and labels for better UX
    enhance_tooltips(studio_app)

    # Apply visual enhancements
    apply_visual_enhancements(root_window)

    log_info("Enhanced UI initialized successfully")


def setup_accessibility_features(window):
    """Set up accessibility features for better UX."""
    # Configure keyboard navigation
    window.focus_follows_mouse = True
    
    # Set up zoom capabilities
    window.bind("<Control-plus>", lambda e: adjust_font_size(window, 1))
    window.bind("<Control-minus>", lambda e: adjust_font_size(window, -1))
    window.bind("<Control-0>", lambda e: reset_font_size(window))
    
    # High contrast mode toggle
    window.bind("<F11>", lambda e: toggle_high_contrast_mode(window))


def adjust_font_size(window, factor):
    """Adjust font size for better accessibility."""
    # This would implement font size adjustment functionality
    pass


def reset_font_size(window):
    """Reset font size to default."""
    # This would reset the font size to default
    pass


def toggle_high_contrast_mode(window):
    """Toggle high contrast mode."""
    # This would toggle high contrast mode
    pass


def enhance_tooltips(studio_app):
    """Add tooltips to important UI elements."""
    # Add tooltips to buttons, menu items, etc.
    
    # Create a tooltip class
    class ToolTip:
        def __init__(self, widget, text):
            self.widget = widget
            self.text = text
            self.tooltip = None
            self.widget.bind("<Enter>", self.show_tooltip)
            self.widget.bind("<Leave>", self.hide_tooltip)
        
        def show_tooltip(self, event=None):
            x, y, _, _ = self.widget.bbox("insert") if hasattr(self.widget, 'bbox') else (0, 0, 0, 0)
            x += self.widget.winfo_rootx() + 20
            y += self.widget.winfo_rooty() + 20
            
            self.tooltip = tk.Toplevel(self.widget)
            self.tooltip.wm_overrideredirect(True)
            self.tooltip.wm_geometry(f"+{x}+{y}")
            
            label = tk.Label(self.tooltip, text=self.text, justify='left',
                            background="#ffffe0", relief='solid', borderwidth=1,
                            font=("Arial", 10, "normal"))
            label.pack(ipadx=1)
        
        def hide_tooltip(self, event=None):
            if self.tooltip:
                self.tooltip.destroy()
                self.tooltip = None
    
    # Add tooltips to various widgets
    # This is illustrative - we'd apply to actual buttons/elements in the studio app
    pass


def apply_visual_enhancements(window):
    """Apply visual enhancements for better user experience."""
    # Apply subtle animations and transitions
    # Enhance visual feedback for interactions
    # Add smooth scrolling where applicable
    
    # Example: Style all buttons consistently
    style = ttk.Style()
    style.configure(
        "Accent.TButton",
        background="#4CAF50",
        foreground="white",
        padding=(10, 5)
    )
    
    # Style for destructive actions
    style.configure(
        "Danger.TButton", 
        background="#f44336",
        foreground="white",
        padding=(10, 5)
    )


def create_status_bar_enhancement(window):
    """Create an enhanced status bar with more information."""
    # Create and return an enhanced status bar widget
    status_frame = ttk.Frame(window)
    
    # Add connection status
    conn_status = ttk.Label(status_frame, text="● Connected", foreground="green")
    conn_status.pack(side=tk.LEFT, padx=(10, 20))
    
    # Add file info
    file_info = ttk.Label(status_frame, text="Ready", relief=tk.SUNKEN)
    file_info.pack(side=tk.LEFT, fill=tk.X, expand=True)
    
    # Add current time
    time_label = ttk.Label(status_frame, text="", relief=tk.SUNKEN)
    time_label.pack(side=tk.RIGHT, padx=(10, 0))
    
    return status_frame


def create_app_menu(window, studio_app):
    """Create an enhanced application menu with all functionality."""
    menubar = tk.Menu(window, font=("Arial", 9))
    window.config(menu=menubar)
    
    # File menu
    file_menu = tk.Menu(menubar, tearoff=0)
    menubar.add_cascade(label="File", menu=file_menu)
    file_menu.add_command(label="New Project", command=studio_app.new_project, accelerator="Ctrl+N")
    file_menu.add_command(label="New from Template...", command=studio_app.new_from_template)
    file_menu.add_command(label="Open Project...", command=studio_app.open_project, accelerator="Ctrl+O")
    file_menu.add_separator()
    file_menu.add_command(label="Save", command=studio_app.save_file, accelerator="Ctrl+S")
    file_menu.add_command(label="Save As...", command=studio_app.save_file_as)
    file_menu.add_separator()
    file_menu.add_command(label="Exit", command=window.quit, accelerator="Ctrl+Q")
    
    # Project menu
    project_menu = tk.Menu(menubar, tearoff=0)
    menubar.add_cascade(label="Project", menu=project_menu)
    project_menu.add_command(label="Build Project", command=studio_app.build_project, accelerator="F6")
    project_menu.add_command(label="Validate Project", command=studio_app.validate_project)
    project_menu.add_command(label="Clean Build", command=lambda: studio_app.clean_build())
    
    # Tools menu
    tools_menu = tk.Menu(menubar, tearoff=0)
    menubar.add_cascade(label="Tools", menu=tools_menu)
    tools_menu.add_command(label="Teaching System", command=lambda: studio_app.create_teaching_interface())
    tools_menu.add_command(label="Test Mode", command=lambda: studio_app.create_test_mode_interface())
    tools_menu.add_command(label="Settings", command=lambda: studio_app.notebook.select(5))  # Settings tab
    
    # Help menu
    help_menu = tk.Menu(menubar, tearoff=0)
    menubar.add_cascade(label="Help", menu=help_menu)
    help_menu.add_command(label="The Codex", command=lambda: studio_app.open_codex())
    help_menu.add_command(label="Tutorial", command=studio_app.show_tutorial)
    help_menu.add_command(label="Documentation", command=lambda: studio_app.notebook.select(4))  # Documentation tab
    help_menu.add_separator()
    help_menu.add_command(label="About", command=studio_app.show_about)

    return menubar


def enhance_dialogs():
    """Create enhanced dialog templates for better UX."""
    # This function would define enhanced dialog patterns
    # with consistent styling and behavior
    pass


def integrate_font_settings(notebook):
    """Integrate font settings into the application's settings notebook."""
    try:
        from fonts.font_settings import create_font_settings_tab
        font_tab, font_panel = create_font_settings_tab(notebook)

        # Add the font settings tab to the notebook
        # In the actual application, this would be inserted at an appropriate position
        # For now, we'll just return the tab and panel for the calling code to handle
        return font_tab, font_panel
    except ImportError:
        # If font settings aren't available, return None
        return None, None


def get_current_font_info():
    """Get information about the current font settings."""
    try:
        from fonts.font_integration import get_current_font_info
        return get_current_font_info()
    except ImportError:
        # If font integration isn't available, return basic info
        return {
            "pack_name": "Not Available",
            "pack_description": "Font pack system not loaded",
            "fonts": {}
        }


def integrate_visual_font_selector(notebook):
    """Integrate visual font selector into the application's settings notebook."""
    try:
        from fonts.visual_font_selector import create_visual_font_selector_tab
        visual_selector_tab, visual_selector = create_visual_font_selector_tab(notebook)

        # Add the visual font selector tab to the notebook
        # In the actual application, this would be inserted at an appropriate position
        # For now, we'll just return the tab and panel for the calling code to handle
        return visual_selector_tab, visual_selector
    except ImportError:
        # If visual font selector isn't available, return None
        return None, None