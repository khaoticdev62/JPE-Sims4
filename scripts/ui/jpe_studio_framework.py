"""
Comprehensive UI Framework for JPE Sims 4 Mod Translator Studio.

This module provides a complete, integrated UI framework that combines all
previous enhancements into a unified, professional application interface.
"""

import tkinter as tk
from tkinter import ttk
import sys
from pathlib import Path
from typing import Optional, Dict, Callable, Any, List
import json
from datetime import datetime
import threading
import queue

# Import existing UI components
from ui.theme_manager import theme_manager
from ui.enhanced_theme_manager import enhanced_ui_manager
from ui.animation_system import animation_manager
from ui.boot_animation import boot_animation_system
from ui.rich_console import rich_console_manager
from ui.file_monitor import file_monitor
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
from ui.jpe_branding import (
    BRAND_LIGHT,
    BRAND_DARK,
    BRAND_ACCENT,
    get_platform_font
)
from ui.ui_enhancements import initialize_enhanced_ui
from ui.font_manager import font_manager


class JPEMainMenu:
    """Main menu for the JPE Studio application."""
    
    def __init__(self, parent: tk.Widget, app_instance):
        self.parent = parent
        self.app = app_instance
        self.menu_bar = ModernMenuBar(parent)
        
        # Define file menu items
        file_menu_items = [
            {"label": "New Project", "command": app_instance.new_project, "accelerator": "Ctrl+N"},
            {"label": "Open Project...", "command": app_instance.open_project, "accelerator": "Ctrl+O"},
            {"label": "Save", "command": app_instance.save_file, "accelerator": "Ctrl+S"},
            {"label": "Save As...", "command": app_instance.save_file_as},
            {"separator": True},
            {"label": "Import Project", "command": app_instance.import_project},
            {"label": "Export Project", "command": app_instance.export_project},
            {"separator": True},
            {"label": "Exit", "command": app_instance.quit_application, "accelerator": "Alt+F4"}
        ]
        
        edit_menu_items = [
            {"label": "Undo", "command": app_instance.undo_action, "accelerator": "Ctrl+Z"},
            {"label": "Redo", "command": app_instance.redo_action, "accelerator": "Ctrl+Y"},
            {"separator": True},
            {"label": "Cut", "command": app_instance.cut_action, "accelerator": "Ctrl+X"},
            {"label": "Copy", "command": app_instance.copy_action, "accelerator": "Ctrl+C"},
            {"label": "Paste", "command": app_instance.paste_action, "accelerator": "Ctrl+V"},
            {"separator": True},
            {"label": "Find", "command": app_instance.find_action, "accelerator": "Ctrl+F"},
            {"label": "Replace", "command": app_instance.replace_action, "accelerator": "Ctrl+H"}
        ]
        
        view_menu_items = [
            {"label": "Zoom In", "command": app_instance.zoom_in, "accelerator": "Ctrl++"},
            {"label": "Zoom Out", "command": app_instance.zoom_out, "accelerator": "Ctrl+-"},
            {"separator": True},
            {"label": "Show Toolbar", "command": app_instance.toggle_toolbar},
            {"label": "Show Status Bar", "command": app_instance.toggle_status_bar},
            {"label": "Toggle Fullscreen", "command": app_instance.toggle_fullscreen, "accelerator": "F11"},
            {"separator": True},
            {"label": "Change Theme", "command": app_instance.change_theme}
        ]
        
        tools_menu_items = [
            {"label": "Translation Engine", "command": app_instance.open_translation_engine},
            {"label": "File Validator", "command": app_instance.open_file_validator},
            {"label": "Project Builder", "command": app_instance.open_project_builder},
            {"separator": True},
            {"label": "Plugin Manager", "command": app_instance.open_plugin_manager},
            {"label": "Template Manager", "command": app_instance.open_template_manager},
            {"separator": True},
            {"label": "Preferences", "command": app_instance.open_preferences}
        ]
        
        help_menu_items = [
            {"label": "User Manual", "command": app_instance.open_manual},
            {"label": "Video Tutorials", "command": app_instance.open_tutorials},
            {"label": "API Documentation", "command": app_instance.open_documentation},
            {"separator": True},
            {"label": "Send Feedback", "command": app_instance.send_feedback},
            {"label": "Report Issue", "command": app_instance.report_issue},
            {"separator": True},
            {"label": "Check for Updates", "command": app_instance.check_updates},
            {"label": "About JPE Studio", "command": app_instance.show_about}
        ]
        
        # Add menus
        self.menu_bar.add_menu("File", file_menu_items)
        self.menu_bar.add_menu("Edit", edit_menu_items)
        self.menu_bar.add_menu("View", view_menu_items)
        self.menu_bar.add_menu("Tools", tools_menu_items)
        self.menu_bar.add_menu("Help", help_menu_items)


class JPEToolBar:
    """Toolbar for the JPE Studio application."""
    
    def __init__(self, parent: tk.Widget, app_instance):
        self.parent = parent
        self.app = app_instance
        
        # Create toolbar frame
        self.toolbar_frame = ttk.Frame(parent)
        self.toolbar_frame.pack(side=tk.TOP, fill=tk.X)
        
        # Create toolbar buttons
        self.create_toolbar_buttons()
    
    def create_toolbar_buttons(self):
        """Create toolbar buttons."""
        button_config = [
            ("New", self.app.new_project, "New Project (Ctrl+N)"),
            ("Open", self.app.open_project, "Open Project (Ctrl+O)"),
            ("Save", self.app.save_file, "Save (Ctrl+S)"),
            ("Save As", self.app.save_file_as, "Save As..."),
            ("Separator", None, ""),
            ("Undo", self.app.undo_action, "Undo (Ctrl+Z)"),
            ("Redo", self.app.redo_action, "Redo (Ctrl+Y)"),
            ("Separator", None, ""),
            ("Build", self.app.build_project, "Build Project (F6)"),
            ("Validate", self.app.validate_project, "Validate Project (F5)"),
            ("Separator", None, ""),
            ("Settings", self.app.open_preferences, "Settings"),
            ("Help", self.app.show_help, "Help"),
        ]
        
        for config in button_config:
            if config[0] == "Separator":
                separator = ttk.Separator(self.toolbar_frame, orient=tk.VERTICAL)
                separator.pack(side=tk.LEFT, fill=tk.Y, padx=5, pady=5)
            else:
                btn = ttk.Button(
                    self.toolbar_frame,
                    text=config[0],
                    command=config[1],
                    takefocus=False
                )
                btn.pack(side=tk.LEFT, padx=2, pady=5)
                # Add tooltip functionality if available
                if hasattr(self.app, 'tooltip_manager'):
                    self.app.tooltip_manager.add_tooltip(btn, config[2])


class JPEStatusBar:
    """Status bar for the JPE Studio application."""
    
    def __init__(self, parent: tk.Widget, app_instance):
        self.parent = parent
        self.app = app_instance
        
        # Create status bar using the enhanced component
        self.status_bar = ModernStatusBar(parent)
        
        # Set initial status
        self.update_status("Ready")
        self.update_position(1, 1)
    
    def update_status(self, text: str):
        """Update the status text."""
        self.status_bar.set_status(text)
    
    def update_position(self, line: int, col: int):
        """Update the position indicator."""
        self.status_bar.set_position(line, col)
    
    def show_progress(self):
        """Show the progress bar."""
        self.status_bar.show_progress()
    
    def hide_progress(self):
        """Hide the progress bar."""
        self.status_bar.hide_progress()
    
    def update_progress(self, value: float):
        """Update the progress bar value."""
        self.status_bar.update_progress(value)


class JPENavigationPane:
    """Navigation pane for the JPE Studio application."""
    
    def __init__(self, parent: tk.Widget, app_instance):
        self.parent = parent
        self.app = app_instance
        
        # Create navigation frame
        self.nav_frame = ttk.Frame(parent)
        self.nav_frame.pack(side=tk.LEFT, fill=tk.Y, padx=5, pady=5)
        
        # Title
        nav_title = ttk.Label(
            self.nav_frame,
            text="Navigation",
            font=(get_platform_font(), 10, "bold")
        )
        nav_title.pack(fill=tk.X, pady=(0, 10))
        
        # Create navigation treeview
        self.tree = ttk.Treeview(self.nav_frame, height=20)
        self.tree.pack(fill=tk.BOTH, expand=True)
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(self.nav_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Setup treeview
        self.tree.heading("#0", text="Projects", anchor=tk.W)
        self.tree.column("#0", width=200)
        
        # Bind selection event
        self.tree.bind("<<TreeviewSelect>>", self.on_select)
        
        # Add sample nodes
        self.add_sample_nodes()
    
    def add_sample_nodes(self):
        """Add sample navigation nodes."""
        # Add projects root
        project_root = self.tree.insert("", tk.END, text="My Projects", open=True)
        
        # Add some sample projects
        project1 = self.tree.insert(project_root, tk.END, text="Project Alpha", values=["alpha"])
        project2 = self.tree.insert(project_root, tk.END, text="Project Beta", values=["beta"])
        
        # Add files under projects
        self.tree.insert(project1, tk.END, text="main.jpe")
        self.tree.insert(project1, tk.END, text="interactions.jpe")
        
        self.tree.insert(project2, tk.END, text="mod.jpe")
        self.tree.insert(project2, tk.END, text="traits.jpe")
        self.tree.insert(project2, tk.END, text="buffs.jpe")
        
        # Add other navigation items
        self.tree.insert("", tk.END, text="Templates", open=True)
        self.tree.insert("", tk.END, text="Recent Files", open=True)
    
    def on_select(self, event):
        """Handle tree selection events."""
        selection = self.tree.selection()
        if selection:
            item = selection[0]
            item_text = self.tree.item(item, "text")
            # Call appropriate function based on item selected
            if item_text.endswith(".jpe"):
                # Open file
                print(f"Opening file: {item_text}")
            elif "Project" in item_text:
                # Switch to project
                print(f"Switching to project: {item_text}")


class JPESideBar:
    """Sidebar with additional tools and information."""
    
    def __init__(self, parent: tk.Widget, app_instance):
        self.parent = parent
        self.app = app_instance
        
        # Create sidebar frame
        self.sidebar_frame = ttk.Frame(parent)
        self.sidebar_frame.pack(side=tk.RIGHT, fill=tk.Y, padx=5, pady=5)
        
        # Title
        sidebar_title = ttk.Label(
            self.sidebar_frame,
            text="Properties & Tools",
            font=(get_platform_font(), 10, "bold")
        )
        sidebar_title.pack(fill=tk.X, pady=(0, 10))
        
        # Create notebook with multiple tabs
        self.notebook = ttk.Notebook(self.sidebar_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Create properties tab
        self.properties_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.properties_tab, text="Properties")
        
        # Property panel
        self.prop_panel = ModernPropertyPanel(self.properties_tab)
        self.setup_properties()
        
        # Create tools tab
        self.tools_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.tools_tab, text="Tools")
        
        # Add tool buttons
        self.setup_tools_tab()
    
    def setup_properties(self):
        """Setup the properties panel."""
        # Add common properties
        self.prop_panel.add_property("Name", "text", "NewElement")
        self.prop_panel.add_property("ID", "text", "element123")
        self.prop_panel.add_property("Type", "choice", ["Interaction", "Buff", "Trait", "Statistic"])
        self.prop_panel.add_property("Visible", "boolean", True)
        self.prop_panel.add_property("Priority", "number", 10)
        self.prop_panel.add_property("Description", "text", "Enter description here...")
    
    def setup_tools_tab(self):
        """Setup the tools tab."""
        # Add tool buttons
        tools_frame = ttk.Frame(self.tools_tab)
        tools_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        ttk.Button(tools_frame, text="Asset Browser").pack(fill=tk.X, pady=2)
        ttk.Button(tools_frame, text="Color Picker").pack(fill=tk.X, pady=2)
        ttk.Button(tools_frame, text="Font Selector").pack(fill=tk.X, pady=2)
        ttk.Button(tools_frame, text="Theme Manager").pack(fill=tk.X, pady=2)
        ttk.Button(tools_frame, text="Validation Log").pack(fill=tk.X, pady=2)


class JPEWorkspaceTabs:
    """Workspace tabs for the JPE Studio application."""
    
    def __init__(self, parent: tk.Widget, app_instance):
        self.parent = parent
        self.app = app_instance
        
        # Create tab view using the enhanced component
        self.tab_view = ModernTabView(parent)
        
        # Add initial tabs
        self.add_default_tabs()
    
    def add_default_tabs(self):
        """Add default workspace tabs."""
        # Add a sample editor tab
        def create_editor_tab(parent):
            editor_frame = ttk.Frame(parent)
            
            # Create a text editor area
            text_frame = ttk.Frame(editor_frame)
            text_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
            
            text_widget = tk.Text(text_frame, wrap=tk.WORD)
            v_scroll = ttk.Scrollbar(text_frame, orient=tk.VERTICAL, command=text_widget.yview)
            h_scroll = ttk.Scrollbar(text_frame, orient=tk.HORIZONTAL, command=text_widget.xview)
            
            text_widget.configure(yscrollcommand=v_scroll.set, xscrollcommand=h_scroll.set)
            
            text_widget.grid(row=0, column=0, sticky="nsew")
            v_scroll.grid(row=0, column=1, sticky="ns")
            h_scroll.grid(row=1, column=0, sticky="ew")
            
            text_frame.grid_rowconfigure(0, weight=1)
            text_frame.grid_columnconfigure(0, weight=1)
            
            # Add sample content
            sample_content = """define interaction GreetNeighbor
    name: "GreetNeighborInteraction"
    display_name: "Greet Neighbor"
    description: "Politely greet a nearby neighbor"
    class: "GreetNeighborInteraction"
    
    target: Actor
    icon: "ui/icon_GreetNeighbor"
    
    test_set: GreetNeighborTestSet
    
    loot_actions:
        - show_message: "Hello, nice to meet you!"
        - add_statistic_change: social, 5
        - trigger_animation: wave_hello
        
define test_set GreetNeighborTestSet
    tests:
        - actor_is_human: true
        - actor_has_relationship: target, positive
        - distance_to_target: < 5.0
end"""
            text_widget.insert("1.0", sample_content)
            
            return editor_frame
        
        self.tab_view.add_tab("main.jpe", create_editor_tab)
        self.tab_view.add_tab("untitled", create_editor_tab)


class JPEStudioFramework:
    """Main JPE Studio Application Framework."""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("JPE Sims 4 Mod Studio")
        self.root.geometry("1400x900")
        self.root.mins("WM_DELETE_WINDOW", self.quit_application)
        
        # Initialize components
        self.menu_bar = None
        self.toolbar = None
        self.status_bar = None
        self.nav_pane = None
        self.side_bar = None
        self.workspace = None
        self.notification_panel = None
        
        # Create main layout
        self.main_frame = ttk.Frame(self.root)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Setup the application
        self.setup_ui()
        
        # Initialize enhanced UI
        initialize_enhanced_ui(self.root, self)
        
        # Apply theme
        self.apply_current_theme()
        
        # Create notification panel
        self.notification_panel = ModernNotificationPanel(self.root)
    
    def setup_ui(self):
        """Setup the main UI components."""
        # Create menu bar
        self.menu_bar = JPEMainMenu(self.root, self)
        
        # Create toolbar
        self.toolbar = JPEToolBar(self.main_frame, self)
        
        # Create center pane with paned window for navigation and main content
        center_pane = ttk.PanedWindow(self.main_frame, orient=tk.HORIZONTAL)
        center_pane.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Left pane for navigation
        nav_frame = ttk.Frame(center_pane)
        center_pane.add(nav_frame, weight=1)
        
        # Create navigation pane
        self.nav_pane = JPENavigationPane(nav_frame, self)
        
        # Center pane for main content
        main_content_frame = ttk.Frame(center_pane)
        center_pane.add(main_content_frame, weight=4)
        
        # Create workspace tabs
        self.workspace = JPEWorkspaceTabs(main_content_frame, self)
        
        # Create status bar
        self.status_bar = JPEStatusBar(self.root, self)
        
        # Create side bar
        self.side_bar = JPESideBar(self.main_frame, self)
        
        # Show welcome notification
        self.show_notification("Welcome to JPE Sims 4 Mod Studio!", "info")
    
    def apply_current_theme(self):
        """Apply the current theme to the application."""
        current_theme = theme_manager.current_theme or "ocean"
        theme_manager.apply_theme(self.root, current_theme)
        
        # Apply enhanced theme if available
        if hasattr(enhanced_ui_manager, 'enhanced_theme_manager'):
            enhanced_ui_manager.enhanced_theme_manager.apply_enhanced_theme(self.root, current_theme)
    
    def change_theme(self):
        """Open theme selection dialog."""
        from ui.theme_manager import ThemeManager
        tm = ThemeManager()
        
        # Create a simple theme selector dialog
        theme_window = tk.Toplevel(self.root)
        theme_window.title("Select Theme")
        theme_window.geometry("300x400")
        
        ttk.Label(theme_window, text="Select Application Theme", font=("Arial", 12, "bold")).pack(pady=10)
        
        theme_listbox = tk.Listbox(theme_window)
        theme_listbox.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        for theme_name in tm.get_themes():
            theme_listbox.insert(tk.END, theme_name)
        
        def apply_selected_theme():
            selection = theme_listbox.curselection()
            if selection:
                selected_theme = tm.get_themes()[selection[0]]
                theme_manager.apply_theme(self.root, selected_theme)
                if hasattr(enhanced_ui_manager, 'enhanced_theme_manager'):
                    enhanced_ui_manager.enhanced_theme_manager.apply_enhanced_theme(self.root, selected_theme)
                theme_window.destroy()
        
        ttk.Button(theme_window, text="Apply Theme", command=apply_selected_theme).pack(pady=10)
    
    def show_notification(self, message: str, level: str = "info", duration: int = 5000):
        """Show a notification message."""
        if self.notification_panel:
            self.notification_panel.add_notification(message, level, duration)
    
    def new_project(self):
        """Handle new project action."""
        self.show_notification("Creating new project...", "info")
        print("Creating new project...")
    
    def open_project(self):
        """Handle open project action."""
        self.show_notification("Opening project...", "info")
        print("Opening project...")
    
    def save_file(self):
        """Handle save file action."""
        self.show_notification("Saving file...", "info")
        print("Saving file...")
    
    def save_file_as(self):
        """Handle save file as action."""
        self.show_notification("Saving file as...", "info")
        print("Saving file as...")
    
    def import_project(self):
        """Handle import project action."""
        self.show_notification("Importing project...", "info")
        print("Importing project...")
    
    def export_project(self):
        """Handle export project action."""
        self.show_notification("Exporting project...", "info")
        print("Exporting project...")
    
    def undo_action(self):
        """Handle undo action."""
        self.show_notification("Undoing last action", "info")
        print("Undoing...")
    
    def redo_action(self):
        """Handle redo action."""
        self.show_notification("Redoing last action", "info")
        print("Redoing...")
    
    def cut_action(self):
        """Handle cut action."""
        print("Cutting selection...")
    
    def copy_action(self):
        """Handle copy action."""
        print("Copying selection...")
    
    def paste_action(self):
        """Handle paste action."""
        print("Pasting selection...")
    
    def find_action(self):
        """Handle find action."""
        print("Finding...")
    
    def replace_action(self):
        """Handle replace action."""
        print("Replacing...")
    
    def zoom_in(self):
        """Handle zoom in action."""
        self.show_notification("Zooming in", "info")
        print("Zooming in...")
    
    def zoom_out(self):
        """Handle zoom out action."""
        self.show_notification("Zooming out", "info")
        print("Zooming out...")
    
    def toggle_toolbar(self):
        """Handle toggle toolbar action."""
        print("Toggling toolbar...")
    
    def toggle_status_bar(self):
        """Handle toggle status bar action."""
        print("Toggling status bar...")
    
    def toggle_fullscreen(self):
        """Handle toggle fullscreen action."""
        current_state = self.root.attributes('-fullscreen')
        self.root.attributes('-fullscreen', not current_state)
    
    def open_translation_engine(self):
        """Handle open translation engine action."""
        self.show_notification("Opening translation engine...", "info")
        print("Opening translation engine...")
    
    def open_file_validator(self):
        """Handle open file validator action."""
        self.show_notification("Opening file validator...", "info")
        print("Opening file validator...")
    
    def open_project_builder(self):
        """Handle open project builder action."""
        self.show_notification("Opening project builder...", "info")
        print("Opening project builder...")
    
    def open_plugin_manager(self):
        """Handle open plugin manager action."""
        self.show_notification("Opening plugin manager...", "info")
        print("Opening plugin manager...")
    
    def open_template_manager(self):
        """Handle open template manager action."""
        self.show_notification("Opening template manager...", "info")
        print("Opening template manager...")
    
    def open_preferences(self):
        """Handle open preferences action."""
        self.show_notification("Opening preferences...", "info")
        print("Opening preferences...")
    
    def open_manual(self):
        """Handle open manual action."""
        self.show_notification("Opening user manual...", "info")
        print("Opening user manual...")
    
    def open_tutorials(self):
        """Handle open tutorials action."""
        self.show_notification("Opening video tutorials...", "info")
        print("Opening video tutorials...")
    
    def open_documentation(self):
        """Handle open documentation action."""
        self.show_notification("Opening API documentation...", "info")
        print("Opening API documentation...")
    
    def send_feedback(self):
        """Handle send feedback action."""
        self.show_notification("Sending feedback...", "info")
        print("Sending feedback...")
    
    def report_issue(self):
        """Handle report issue action."""
        self.show_notification("Reporting issue...", "info")
        print("Reporting issue...")
    
    def check_updates(self):
        """Handle check updates action."""
        self.show_notification("Checking for updates...", "info")
        print("Checking for updates...")
    
    def show_about(self):
        """Handle show about action."""
        about_window = tk.Toplevel(self.root)
        about_window.title("About JPE Studio")
        about_window.geometry("400x300")
        
        ttk.Label(about_window, text="JPE Sims 4 Mod Studio", font=("Arial", 16, "bold")).pack(pady=20)
        ttk.Label(about_window, text="Version 1.0.0", font=("Arial", 12)).pack(pady=5)
        ttk.Label(about_window, text="A professional tool for creating Sims 4 mods", font=("Arial", 10)).pack(pady=5)
        
        ttk.Label(about_window, text="", font=("Arial", 10)).pack(pady=20)
        ttk.Label(about_window, text="Developed by Tuwana Studios").pack()
        ttk.Label(about_window, text="© 2023 Tuwana Development Team").pack()
    
    def show_help(self):
        """Handle show help action."""
        self.show_notification("Showing help...", "info")
        print("Showing help...")
    
    def build_project(self):
        """Handle build project action."""
        self.show_notification("Building project...", "info", 3000)
        print("Building project...")
        # Simulate build process with progress updates
        if self.status_bar:
            self.status_bar.show_progress()
            for i in range(0, 101, 10):
                self.status_bar.update_progress(i)
                self.root.update()
                self.root.after(100)  # Simulate processing time
            self.root.after(500, lambda: self.status_bar.hide_progress())
    
    def validate_project(self):
        """Handle validate project action."""
        self.show_notification("Validating project...", "info", 3000)
        print("Validating project...")
    
    def quit_application(self):
        """Handle quit application action."""
        if tk.messagebox.askyesno("Quit", "Are you sure you want to quit?"):
            # Stop animation manager
            animation_manager.stop_animation_loop()
            
            # Stop file monitor
            file_monitor.stop_monitoring()
            
            # Close the application
            self.root.quit()
            self.root.destroy()
    
    def run(self):
        """Run the JPE Studio application."""
        self.root.mainloop()


def create_jpe_studio():
    """Create and return the JPE Studio application."""
    return JPEStudioFramework()


if __name__ == "__main__":
    # Initialize boot animation before starting the main app
    def start_studio():
        app = JPEStudioFramework()
        app.run()
    
    # Show boot animation and then start the studio
    boot_animation_system.show_boot_animation(start_studio)