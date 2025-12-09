"""Steam Deck App for JPE Sims 4 Mod Translator."""

import os
import sys
import subprocess
import platform
from pathlib import Path
import pygame  # For Steam Deck gamepad integration
from typing import List, Dict, Optional

# Import new UI/UX enhancements
try:
    import ttkbootstrap as ttkb
    from ttkbootstrap import Style
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
    from ui.rich_console import RichConsoleManager
    from ui.enhanced_theme_manager import enhanced_ui_manager
    from ui.file_monitor import file_monitor
    UI_X_AVAILABLE = True
except ImportError:
    UI_X_AVAILABLE = False
    # Fallback to pygame for UI if ttkbootstrap not available
    pass

from engine.engine import TranslationEngine, EngineConfig
from diagnostics.errors import BuildReport, EngineError, ErrorSeverity, ErrorCategory


class SteamDeckApp:
    """Steam Deck optimized application for JPE Sims 4 Mod Translator."""
    
    def __init__(self):
        # Check if we're actually on Steam Deck
        self.is_steam_deck = self._detect_steam_deck()

        # Initialize UI/UX enhancements first (try tkinter/ttkbootstrap for better experience)
        if UI_X_AVAILABLE:
            # Use enhanced UI with ttkbootstrap for better Steam Deck experience
            try:
                import tkinter as tk
                from tkinter import ttk

                # Initialize the main window using tkinter for enhanced UI
                self.root = tk.Tk()
                self.root.title("JPE Sims 4 Mod Translator - Steam Deck Edition")

                # Set display resolution appropriate for Steam Deck
                if self.is_steam_deck:
                    self.root.geometry("1280x800")  # Steam Deck's native resolution
                else:
                    self.root.geometry("1200x800")

                # Apply enhanced theme
                enhanced_ui_manager.enhanced_theme_manager.apply_enhanced_theme(
                    self.root,
                    "darkly"  # Use dark theme for better battery life on OLED
                )

                # Initialize enhanced UI components
                self.setup_enhanced_ui()

                # Set a flag to indicate we're using enhanced UI
                self.use_enhanced_ui = True

            except Exception:
                # Fallback to pygame if tkinter/ttkbootstrap initialization fails
                self._init_pygame_ui()
                self.use_enhanced_ui = False
        else:
            # Use pygame UI as fallback
            self._init_pygame_ui()
            self.use_enhanced_ui = False

        # Initialize core components
        self.project_root = None
        self.engine = None
        self.current_report = None

        # Initialize UI state
        self.current_screen = "main_menu"  # main_menu, project_list, project_editor, build_view

        # Start file monitor if available
        if UI_X_AVAILABLE:
            try:
                file_monitor.start_monitoring()
            except:
                pass  # File monitoring not available

    def _init_pygame_ui(self):
        """Initialize pygame UI as fallback."""
        # Initialize pygame for controller support
        pygame.init()
        pygame.joystick.init()

        # Initialize the Steam Deck display (480x854 rotated)
        if self.is_steam_deck:
            self.screen = pygame.display.set_mode((854, 480), pygame.FULLSCREEN)
        else:
            self.screen = pygame.display.set_mode((1200, 800))

        pygame.display.set_caption("JPE Sims 4 Mod Translator - Steam Deck Edition")

        # Initialize controller
        self.controller = None
        if pygame.joystick.get_count() > 0:
            self.controller = pygame.joystick.Joystick(0)
            self.controller.init()

        # Initialize UI components
        self.font = pygame.font.SysFont(None, 24)
        self.small_font = pygame.font.SysFont(None, 18)

    def setup_enhanced_ui(self):
        """Setup enhanced UI components with modern styling."""
        # Create main application structure
        main_paned = ttkb.PanedWindow(self.root, orient=tk.HORIZONTAL)
        main_paned.pack(fill=tk.BOTH, expand=True)

        # Left panel (toolbox)
        self.left_frame = ttkb.Frame()
        main_paned.add(self.left_frame, weight=1)

        # Center panel (main content)
        self.center_frame = ttkb.Frame()
        main_paned.add(self.center_frame, weight=3)

        # Right panel (properties)
        self.right_frame = ttkb.Frame()
        main_paned.add(self.right_frame, weight=1)

        # Create menu bar
        self.menu_bar = ModernMenuBar(self.root)
        self.menu_bar.add_menu("File", [
            {"label": "New Project", "command": self.new_project},
            {"label": "Open Project", "command": self.open_project},
            {"separator": True},
            {"label": "Exit", "command": self.quit_app}
        ])

        # Create status bar
        self.status_bar = ModernStatusBar(self.root)
        self.status_bar.set_status("JPE Sims 4 Mod Translator - Ready for Steam Deck")

        # Create toolbox
        self.toolbox = ModernToolbox(self.left_frame)

        # Create property panel
        self.property_panel = ModernPropertyPanel(self.right_frame)

        # Create tab view for main content
        self.tab_view = ModernTabView(self.center_frame)

        # Create notification panel
        self.notification_panel = ModernNotificationPanel(self.center_frame)

        # Create progress bar
        self.progress_bar = ModernProgressBar(self.center_frame, mode="determinate")

        # Add sample content to property panel
        self.property_panel.add_property("Project Name", "text", "")
        self.property_panel.add_property("Author", "text", "")
        self.property_panel.add_property("Version", "text", "1.0.0")
        self.property_panel.add_property("Enabled", "boolean", True)

    def new_project(self):
        """Handle new project creation."""
        if UI_X_AVAILABLE:
            self.notification_panel.add_notification("Creating new project...", "info", 3000)
        print("Creating new project...")

    def open_project(self):
        """Handle opening a project."""
        if UI_X_AVAILABLE:
            self.notification_panel.add_notification("Opening project...", "info", 3000)
        print("Opening project...")

    def quit_app(self):
        """Handle application exit."""
        if UI_X_AVAILABLE and hasattr(self, 'file_monitor'):
            file_monitor.stop_monitoring()
        self.root.quit()
        self.root.destroy()
        self.selected_item_index = 0
        self.scroll_offset = 0

        # Project list (will be populated when needed)
        self.projects = []
        self.load_recent_projects()
        
        # Color scheme optimized for Steam Deck OLED screen
        self.colors = {
            'background': (10, 10, 20),      # Dark background
            'primary': (44, 95, 153),        # JPE blue
            'secondary': (76, 175, 80),      # Success green
            'warning': (255, 152, 0),        # Warning orange
            'error': (244, 67, 54),          # Error red
            'text': (220, 220, 220),         # Light gray text
            'text_dim': (150, 150, 150),     # Dimmed text
            'surface': (30, 30, 40),         # UI surfaces
            'surface_hover': (50, 50, 60),   # Hover states
            'accent': (156, 39, 176),        # Accent color
        }
        
        self.running = True
    
    def _detect_steam_deck(self) -> bool:
        """Detect if running on Steam Deck."""
        try:
            # Check for Steam Deck specific indicators
            if platform.system() != "Linux":
                return False
            
            # Check for Valve manufacturer
            try:
                with open('/sys/devices/virtual/dmi/id/board_vendor', 'r') as f:
                    vendor = f.read().strip()
                    if 'Valve' in vendor:
                        return True
            except:
                pass
            
            # Check for SteamOS
            try:
                with open('/etc/os-release', 'r') as f:
                    content = f.read()
                    if 'SteamOS' in content or 'steamos' in content.lower():
                        return True
            except:
                pass
            
            # Check for Steam environment
            if os.environ.get('STEAM_RUNTIME') or os.environ.get('STEAM_COMPAT_DATA_PATH'):
                return True
                
            return False
        except:
            # If detection fails, assume not on Steam Deck
            return False
    
    def load_recent_projects(self):
        """Load recent projects from config or filesystem."""
        # Look for projects in common locations
        common_locations = [
            Path.home() / "Documents" / "JPE Projects",
            Path.home() / "Projects" / "JPE Sims 4 Mods",
            Path(".")  # Current directory
        ]
        
        for location in common_locations:
            if location.exists():
                # Find subdirectories that look like projects
                for item in location.iterdir():
                    if item.is_dir():
                        src_dir = item / "src"
                        config_dir = item / "config"
                        if src_dir.exists() and config_dir.exists():
                            # This looks like a project
                            self.projects.append({
                                'name': item.name,
                                'path': item,
                                'modified': self._get_last_modified(item)
                            })
    
    def _get_last_modified(self, project_path: Path) -> str:
        """Get the last modified date of a project."""
        import datetime
        try:
            # Find the most recently modified file in the project
            latest_time = 0
            for root, dirs, files in os.walk(project_path):
                for file in files:
                    if file.endswith(('.jpe', '.xml', '.jpe-xml')):
                        file_path = Path(root) / file
                        mtime = file_path.stat().st_mtime
                        if mtime > latest_time:
                            latest_time = mtime
            
            if latest_time > 0:
                return datetime.datetime.fromtimestamp(latest_time).strftime('%Y-%m-%d %H:%M')
            else:
                return "Unknown"
        except:
            return "Unknown"
    
    def handle_controller_input(self):
        """Handle Steam Deck controller input."""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                elif event.key == pygame.K_UP:
                    if self.current_screen == "project_list":
                        self.selected_item_index = max(0, self.selected_item_index - 1)
                elif event.key == pygame.K_DOWN:
                    if self.current_screen == "project_list":
                        self.selected_item_index = min(len(self.projects) - 1, self.selected_item_index + 1)
                elif event.key == pygame.K_RETURN:
                    if self.current_screen == "main_menu":
                        self.current_screen = "project_list"
                    elif self.current_screen == "project_list" and self.projects:
                        self.open_project(self.projects[self.selected_item_index]['path'])
                elif event.key == pygame.K_BACKSPACE or event.key == pygame.K_AC_BACK:
                    if self.current_screen != "main_menu":
                        self.current_screen = "main_menu"

            elif event.type == pygame.JOYBUTTONDOWN:
                # Handle controller button presses
                if event.button == 0:  # A button (confirm)
                    if self.current_screen == "main_menu":
                        self.current_screen = "project_list"
                    elif self.current_screen == "project_list" and self.projects:
                        self.open_project(self.projects[self.selected_item_index]['path'])
                elif event.button == 1:  # B button (back/cancel)
                    if self.current_screen != "main_menu":
                        self.current_screen = "main_menu"
                elif event.button == 10:  # Steam button (menu)
                    # Toggle menu or show options
                    self.show_options_menu()
                elif event.button == 7:  # Start button (context menu)
                    if self.current_screen == "project_list":
                        self.show_project_context_menu()

    def show_options_menu(self):
        """Show Steam Deck options menu."""
        # For now, just return to main menu
        self.current_screen = "main_menu"

    def show_project_context_menu(self):
        """Show context menu for selected project."""
        if self.projects and self.selected_item_index < len(self.projects):
            project = self.projects[self.selected_item_index]
            # Show options like "Open", "Delete", "Properties", etc.
            print(f"Context menu for project: {project['name']}")

    def open_project(self, project_path: Path):
        """Open a project for editing."""
        try:
            # Initialize engine with project
            config = EngineConfig(
                project_root=project_path,
                reports_directory=project_path / "build" / "reports"
            )
            self.engine = TranslationEngine(config)
            self.project_root = project_path

            # Set to project editor screen
            self.current_screen = "project_editor"
        except Exception as e:
            print(f"Error opening project: {e}")
            # In a real implementation, show an error message

    
    def draw_main_menu(self):
        """Draw the main menu screen."""
        self.screen.fill(self.colors['background'])

        # Draw title
        title_text = self.font.render("JPE Sims 4 Mod Translator", True, self.colors['primary'])
        title_rect = title_text.get_rect(center=(self.screen.get_width()//2, 80))
        self.screen.blit(title_text, title_rect)

        # Draw subtitle
        subtitle_text = self.small_font.render("Steam Deck Edition", True, self.colors['text_dim'])
        subtitle_rect = subtitle_text.get_rect(center=(self.screen.get_width()//2, 120))
        self.screen.blit(subtitle_text, subtitle_rect)

        # Draw menu options
        menu_options = [
            "Continue Project",
            "New Project",
            "Browse Projects",
            "Settings",
            "Quit"
        ]

        for i, option in enumerate(menu_options):
            color = self.colors['primary'] if i == self.selected_item_index else self.colors['text']

            # Highlight selected option
            if i == self.selected_item_index:
                rect = pygame.Rect(
                    100,
                    200 + i * 50,
                    self.screen.get_width() - 200,
                    40
                )
                pygame.draw.rect(self.screen, self.colors['surface_hover'], rect, border_radius=8)

            text = self.font.render(option, True, color)
            text_rect = text.get_rect(center=(self.screen.get_width()//2, 220 + i * 50))
            self.screen.blit(text, text_rect)

        # Draw controller hints
        hint_text = self.small_font.render("A: Select  |  D-PAD: Navigate  |  B: Back", True, self.colors['text_dim'])
        hint_rect = hint_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height() - 40))
        self.screen.blit(hint_text, hint_rect)

    def draw_project_list(self):
        """Draw the project list screen."""
        self.screen.fill(self.colors['background'])

        # Draw header
        header_text = self.font.render("Recent Projects", True, self.colors['primary'])
        self.screen.blit(header_text, (50, 50))

        if not self.projects:
            no_projects_text = self.font.render("No projects found", True, self.colors['text_dim'])
            self.screen.blit(no_projects_text, (50, 120))
            return

        # Draw projects list
        start_index = self.scroll_offset
        visible_count = min(8, len(self.projects) - start_index)  # Show up to 8 projects at a time

        for i in range(visible_count):
            idx = start_index + i
            if idx >= len(self.projects):
                break

            project = self.projects[idx]
            y_pos = 100 + i * 60

            # Highlight selected project
            if idx == self.selected_item_index:
                rect = pygame.Rect(30, y_pos - 5, self.screen.get_width() - 60, 55)
                pygame.draw.rect(self.screen, self.colors['surface_hover'], rect, border_radius=8)

            # Draw project name
            name_text = self.font.render(project['name'], True, self.colors['text'])
            self.screen.blit(name_text, (50, y_pos))

            # Draw project path (truncated if too long)
            path_str = str(project['path'])
            if len(path_str) > 50:
                path_str = path_str[:47] + "..."
            path_text = self.small_font.render(path_str, True, self.colors['text_dim'])
            self.screen.blit(path_text, (50, y_pos + 25))

    def draw_project_editor(self):
        """Draw the project editor screen."""
        self.screen.fill(self.colors['background'])

        if not self.project_root:
            no_project_text = self.font.render("No project opened", True, self.colors['error'])
            self.screen.blit(no_project_text, (50, 50))
            return

        # Draw project header
        project_text = self.font.render(f"Editing: {self.project_root.name}", True, self.colors['primary'])
        self.screen.blit(project_text, (50, 50))

        # Draw editor options
        options = [
            "Edit Project Files",
            "Validate Project",
            "Build Project",
            "View Reports",
            "Close Project"
        ]

        for i, option in enumerate(options):
            y_pos = 120 + i * 50
            color = self.colors['text']

            # Highlight selected option
            if i == self.selected_item_index:
                rect = pygame.Rect(50, y_pos - 10, self.screen.get_width() - 100, 45)
                pygame.draw.rect(self.screen, self.colors['surface_hover'], rect, border_radius=8)
                color = self.colors['primary']

            text = self.font.render(option, True, color)
            self.screen.blit(text, (70, y_pos))

    def draw_build_view(self):
        """Draw the build view screen."""
        self.screen.fill(self.colors['background'])

        if not self.engine or not self.project_root:
            no_project_text = self.font.render("No project to build", True, self.colors['error'])
            self.screen.blit(no_project_text, (50, 50))
            return

        # Draw build header
        build_text = self.font.render(f"Building: {self.project_root.name}", True, self.colors['primary'])
        self.screen.blit(build_text, (50, 50))

        # Simulate build output
        build_text = self.small_font.render("Build output will appear here...", True, self.colors['text'])
        self.screen.blit(build_text, (50, 100))

        # Draw progress bar simulation
        progress_rect = pygame.Rect(50, 150, self.screen.get_width() - 100, 20)
        pygame.draw.rect(self.screen, self.colors['surface'], progress_rect)
        progress_fill = pygame.Rect(50, 150, int((self.screen.get_width() - 100) * 0.6), 20)
        pygame.draw.rect(self.screen, self.colors['secondary'], progress_fill)

        # Draw sample build log
        log_lines = [
            "Initializing build environment...",
            "Parsing project files...",
            "Validating syntax and references...",
            "Generating Sims 4 XML files...",
            "Creating mod package...",
            "Build completed successfully!"
        ]

        for i, line in enumerate(log_lines):
            y_pos = 200 + i * 25
            log_text = self.small_font.render(line, True, self.colors['text_dim'])
            self.screen.blit(log_text, (50, y_pos))
    
    def draw_project_list(self):
        """Draw the project list screen."""
        self.screen.fill(self.colors['background'])
        
        # Draw header
        header_text = self.font.render("Recent Projects", True, self.colors['primary'])
        self.screen.blit(header_text, (50, 50))
        
        # Draw projects list
        start_index = self.scroll_offset
        visible_count = min(10, len(self.projects) - start_index)  # Show up to 10 projects at a time
        
        for i in range(visible_count):
            idx = start_index + i
            if idx >= len(self.projects):
                break
                
            project = self.projects[idx]
            y_pos = 100 + i * 50
            
            # Highlight selected project
            if idx == self.selected_item_index:
                rect = pygame.Rect(30, y_pos - 10, self.screen.get_width() - 60, 45)
                pygame.draw.rect(self.screen, self.colors['surface_hover'], rect, border_radius=8)
            
            # Draw project name
            name_text = self.font.render(project['name'], True, self.colors['text'])
            self.screen.blit(name_text, (50, y_pos))
            
            # Draw project path (truncated if too long)
            path_str = str(project['path'])
            if len(path_str) > 50:
                path_str = path_str[:47] + "..."
            path_text = self.small_font.render(path_str, True, self.colors['text_dim'])
            self.screen.blit(path_text, (50, y_pos + 25))
    
    def draw_project_editor(self):
        """Draw the project editor screen."""
        self.screen.fill(self.colors['background'])
        
        if not self.project_root:
            no_project_text = self.font.render("No project opened", True, self.colors['error'])
            self.screen.blit(no_project_text, (50, 50))
            return
        
        # Draw project header
        project_text = self.font.render(f"Editing: {self.project_root.name}", True, self.colors['primary'])
        self.screen.blit(project_text, (50, 50))
        
        # Draw editor options
        options = [
            "Edit Project Files",
            "Validate Project",
            "Build Project",
            "View Reports",
            "Close Project"
        ]
        
        for i, option in enumerate(options):
            y_pos = 120 + i * 50
            color = self.colors['text']
            
            # Highlight selected option
            if i == self.selected_item_index:
                rect = pygame.Rect(50, y_pos - 10, self.screen.get_width() - 100, 45)
                pygame.draw.rect(self.screen, self.colors['surface_hover'], rect, border_radius=8)
                color = self.colors['primary']
            
            text = self.font.render(option, True, color)
            self.screen.blit(text, (70, y_pos))
    
    def draw_build_view(self):
        """Draw the build view screen."""
        self.screen.fill(self.colors['background'])
        
        if not self.engine or not self.project_root:
            no_project_text = self.font.render("No project to build", True, self.colors['error'])
            self.screen.blit(no_project_text, (50, 50))
            return
        
        # Draw build header
        build_text = self.font.render(f"Building: {self.project_root.name}", True, self.colors['primary'])
        self.screen.blit(build_text, (50, 50))
        
        # Simulate build process
        build_text = self.small_font.render("Build in progress...", True, self.colors['text'])
        self.screen.blit(build_text, (50, 100))
        
        # Draw progress bar
        progress_rect = pygame.Rect(50, 150, self.screen.get_width() - 100, 20)
        pygame.draw.rect(self.screen, self.colors['surface'], progress_rect)
        progress_fill = pygame.Rect(50, 150, int((self.screen.get_width() - 100) * 0.6), 20)
        pygame.draw.rect(self.screen, self.colors['secondary'], progress_fill)
        
        # Draw build log (simulate)
        log_lines = [
            "Initializing build environment...",
            "Parsing project files...",
            "Validating syntax...",
            "Generating XML output...",
            "Packaging mod files...",
            "Build completed successfully!"
        ]
        
        for i, line in enumerate(log_lines):
            y_pos = 200 + i * 30
            log_text = self.small_font.render(line, True, self.colors['text_dim'])
            self.screen.blit(log_text, (50, y_pos))
    
    def run(self):
        """Main application loop."""
        if hasattr(self, 'use_enhanced_ui') and self.use_enhanced_ui:
            # Use enhanced UI with tkinter/ttkbootstrap
            self.root.mainloop()
        else:
            # Use pygame UI as fallback
            clock = pygame.time.Clock()

            while self.running:
                self.handle_controller_input()

                # Draw current screen
                if self.current_screen == "main_menu":
                    self.draw_main_menu()
                elif self.current_screen == "project_list":
                    self.draw_project_list()
                elif self.current_screen == "project_editor":
                    self.draw_project_editor()
                elif self.current_screen == "build_view":
                    self.draw_build_view()

                pygame.display.flip()
                clock.tick(60)  # 60 FPS

            pygame.quit()
            sys.exit()


def main():
    """Main entry point for Steam Deck application."""
    app = SteamDeckApp()
    app.run()


if __name__ == "__main__":
    main()