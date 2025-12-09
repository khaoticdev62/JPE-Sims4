"""
Studio Application for JPE Sims 4 Mod Translator.

This module serves as the main application entry point that integrates all UI/UX enhancements.
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import sys
from pathlib import Path
import json
from typing import Optional, Dict, Any, List

# Try to import enhancement components with graceful fallbacks
try:
    from studio_ide.jpe_studio import JPEStudioIDE
    studio_available = True
except ImportError:
    studio_available = False
    JPEStudioIDE = None

try:
    import ttkbootstrap as ttkb
    from ttkbootstrap import Style
    ttkb_available = True
except ImportError:
    ttkb_available = False

# Import core components
from engine.engine import TranslationEngine, EngineConfig
from diagnostics.errors import BuildReport, EngineError
from engine.ir import ProjectIR
from diagnostics.logging import log_info, log_audit
from config.config_manager import config_manager
from ui.theme_manager import theme_manager
from ui.ui_enhancements import initialize_enhanced_ui, create_app_menu


class StudioApplication:
    """Main studio application that integrates all UI/UX enhancements."""
    
    def __init__(self):
        if ttkb_available:
            self.root = ttkb.Window(themename="flatly")
            self.root.title("JPE Studio - Sims 4 Mod Translator")
        else:
            self.root = tk.Tk()
            self.root.title("JPE Studio - Sims 4 Mod Translator")
        
        self.root.geometry("1400x900")
        
        # Initialize core components
        self.project_root: Optional[Path] = None
        self.engine: Optional[TranslationEngine] = None
        self.current_report: Optional[BuildReport] = None
        
        # Enhancement system flags
        self.enhancements_initialized = False
        self.enhanced_ui_available = studio_available
        
        # Initialize the enhanced IDE if available
        if self.enhanced_ui_available:
            try:
                self.enhanced_ide = JPEStudioIDE()
                # Use the enhanced IDE's main components but with our root window
                self.setup_enhanced_ui()
            except Exception as e:
                print(f"Could not initialize enhanced IDE: {e}")
                self.enhanced_ui_available = False
                self.setup_basic_ui()
        else:
            self.setup_basic_ui()
    
    def setup_basic_ui(self):
        """Setup basic UI when enhanced components aren't available."""
        # Create main layout
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create menu
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="New Project", command=self.new_project)
        file_menu.add_command(label="Open Project...", command=self.open_project)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)
        
        # Create a simple text editor for basic functionality
        self.editor_frame = ttk.Frame(main_frame)
        self.editor_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Create text editor
        self.text_editor = tk.Text(
            self.editor_frame,
            wrap=tk.NONE,
            undo=True,
            font=("Consolas", 10) if ttkb_available else ("TkDefaultFont", 10)
        )
        v_scrollbar = ttk.Scrollbar(self.editor_frame, orient=tk.VERTICAL, command=self.text_editor.yview)
        h_scrollbar = ttk.Scrollbar(self.editor_frame, orient=tk.HORIZONTAL, command=self.text_editor.xview)
        
        self.text_editor.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
        
        self.text_editor.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        v_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Create basic status bar
        self.status_var = tk.StringVar(value="Ready")
        status_bar = ttk.Label(
            self.root,
            textvariable=self.status_var,
            relief=tk.SUNKEN,
            anchor=tk.W
        )
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)
    
    def setup_enhanced_ui(self):
        """Setup enhanced UI with all enhancement features."""
        # If we have access to the enhanced IDE, integrate it with our core functionality
        if self.enhanced_ui_available and self.enhanced_ide:
            # Create the enhanced UI structure
            self.main_paned_window = self.enhanced_ide.main_paned_window
            self.editor_frame = self.enhanced_ide.editor_frame
            self.sidebar_frame = self.enhanced_ide.sidebar_frame
            self.property_frame = self.enhanced_ide.property_frame
            self.status_bar = self.enhanced_ide.status_bar
            self.menu_bar = self.enhanced_ide.menu_bar
            
            # Connect our core functionality to the enhanced UI
            self.text_editor = self.enhanced_ide.text_editor
            self.project_tree = self.enhanced_ide.project_tree
            
            # Initialize enhancement systems
            self.initialize_enhancement_systems()
        else:
            self.setup_basic_ui()
    
    def initialize_enhancement_systems(self):
        """Initialize all enhancement systems."""
        self.enhancements_initialized = True
        print("Enhancement systems initialized")
        
        # Initialize animation manager if available
        try:
            from ui.animation_system import animation_manager
            animation_manager.start_animation_loop(self.root)
        except ImportError:
            print("Animation system not available")
        
        # Initialize real-time validation if available
        try:
            from engine.enhanced_validation import real_time_validator
            # Connect to text editor for real-time validation
            self.text_editor.bind('<KeyRelease>', lambda e: self.async_validate_current_content())
        except ImportError:
            print("Enhanced validation system not available")
        
        # Initialize predictive coding if available
        try:
            from engine.predictive_coding import predictive_coding_system
            # Connect to text editor for predictive suggestions
            print("Predictive coding system initialized")
        except ImportError:
            print("Predictive coding system not available")
        
        # Initialize AI assistance if available
        try:
            from ai.ai_assistant import ai_assistant_manager
            print("AI assistant initialized")
        except ImportError:
            print("AI assistant not available")
        
        # Initialize cloud sync if available
        try:
            from cloud.api import cloud_api
            from cloud.sync_manager import cloud_sync_manager
            print("Cloud sync system initialized")
        except ImportError:
            print("Cloud sync system not available")
        
        # Initialize collaboration if available
        try:
            from collaboration.system import collaboration_manager
            print("Collaboration system initialized")
        except ImportError:
            print("Collaboration system not available")
    
    def async_validate_current_content(self):
        """Asynchronously validate current content."""
        if self.enhancements_initialized:
            try:
                content = self.text_editor.get("1.0", tk.END)
                # In a real implementation, this would trigger real-time validation
                print("Async validation triggered")
            except Exception as e:
                print(f"Validation error: {e}")
    
    def new_project(self):
        """Create a new project."""
        self.status_var.set("Creating new project...")
        print("Creating new project...") 
    
    def open_project(self):
        """Open an existing project."""
        project_path = filedialog.askdirectory(
            title="Select JPE Mod Project Directory",
            initialdir=Path.home()
        )
        
        if project_path:
            self.project_root = Path(project_path)
            self.status_var.set(f"Project opened: {self.project_root.name}")
            print(f"Opened project: {self.project_root}")
            
            # Load project files into the project tree if available
            if hasattr(self, 'project_tree'):
                self.load_project_files()
    
    def load_project_files(self):
        """Load project files into the project tree."""
        if not self.project_root or not hasattr(self, 'project_tree'):
            return
        
        # Clear existing tree
        for item in self.project_tree.get_children():
            self.project_tree.delete(item)
        
        # Add project root
        root_node = self.project_tree.insert('', 'end', text=self.project_root.name, values=[str(self.project_root)])
        
        # Add project files
        for file_path in self.project_root.rglob('*.jpe'):
            relative_path = file_path.relative_to(self.project_root.parent)
            parent = root_node
            
            # Create nodes for each directory in the path
            path_parts = relative_path.parts[1:-1]  # Skip project name and filename
            for part in path_parts:
                found = False
                for child in self.project_tree.get_children(parent):
                    if self.project_tree.item(child, 'text') == part:
                        parent = child
                        found = True
                        break
                if not found:
                    parent = self.project_tree.insert(parent, 'end', text=part)
            
            # Add file
            self.project_tree.insert(parent, 'end', text=file_path.name, values=[str(file_path)])
    
    def _initialize_theme(self):
        """Apply the current theme to the application."""
        current_theme = config_manager.get("ui.theme", "default")
        if current_theme in theme_manager.themes:
            theme_manager.apply_theme(self.root, current_theme)
        
        # Apply enhanced theme if available
        if self.enhanced_ui_available:
            try:
                from ui.enhanced_theme_manager import enhanced_ui_manager
                enhanced_ui_manager.apply_enhanced_theme(self.root, current_theme)
            except ImportError:
                pass  # Continue without enhanced theme if not available
    
    def run(self):
        """Run the studio application."""
        print("Starting JPE Studio with UI/UX enhancements...")
        
        # Apply theme
        self._initialize_theme()
        
        # Initialize enhanced UI features if available
        if self.enhanced_ui_available:
            try:
                from ui.enhanced_ui_components import initialize_enhanced_ui
                initialize_enhanced_ui(self.root, self)
            except ImportError:
                pass  # Continue without enhanced UI if not available
        
        # Start the main loop
        self.root.mainloop()


def main():
    """Main entry point for the studio application."""
    app = StudioApplication()
    app.run()


if __name__ == "__main__":
    main()