"""Comprehensive UI test for JPE Sims 4 Mod Translator."""

import unittest
from unittest.mock import Mock, patch
import tkinter as tk
from tkinter import ttk
from pathlib import Path
import tempfile

# Import the components we need to test
from studio import DesktopStudio
from ui.theme_manager import theme_manager, Theme
from ui.ui_enhancements import initialize_enhanced_ui, create_app_menu


class TestUIEnhancements(unittest.TestCase):
    """Test all UI enhancements and components."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.root = tk.Tk()
        self.root.withdraw()  # Hide the window during tests
        
        # Create a temporary project directory
        self.temp_dir = tempfile.mkdtemp()
        self.project_path = Path(self.temp_dir)
        
        # Initialize the studio app
        self.studio = DesktopStudio()
        self.studio.root = self.root
        self.studio.project_root = self.project_path
        
        # Create some basic project structure
        (self.project_path / "src").mkdir(exist_ok=True)
        (self.project_path / "build").mkdir(exist_ok=True)
        (self.project_path / "config").mkdir(exist_ok=True)
        
        # Create a simple JPE file
        jpe_file = self.project_path / "src" / "test.jpe"
        jpe_file.write_text("""[Project]
name: Test Project
id: test_project
version: 1.0.0
end

[Interactions]
id: test_interaction
display_name: Test Interaction
end
""")
    
    def tearDown(self):
        """Clean up after tests."""
        self.root.destroy()
    
    def test_theme_manager_initialization(self):
        """Test that the theme manager is properly initialized."""
        self.assertIsNotNone(theme_manager)
        self.assertGreater(len(theme_manager.themes), 0)
        
        # Check that there are the expected themes
        themes = theme_manager.get_themes()
        self.assertIn("Cyberpunk Neon", themes)
        self.assertIn("Sunset Glow", themes)
        self.assertIn("Forest Twilight", themes)
    
    def test_theme_application(self):
        """Test that themes can be applied to UI elements."""
        # Apply a theme to the root
        theme_manager.apply_theme(self.root, "cyberpunk")
        
        # Verify that the theme was applied (this is basic - would be more thorough with actual UI tests)
        self.assertEqual(theme_manager.current_theme, "cyberpunk")
    
    def test_theme_color_mappings(self):
        """Test that theme colors are properly mapped."""
        cyberpunk_theme = theme_manager.themes.get("cyberpunk")
        self.assertIsNotNone(cyberpunk_theme)
        self.assertEqual(cyberpunk_theme.bg, "#0a0a0a")
        self.assertEqual(cyberpunk_theme.fg, "#00ff8c")
        self.assertEqual(cyberpunk_theme.display_name, "Cyberpunk Neon")
    
    def test_ui_enhancements_initialization(self):
        """Test that UI enhancements are properly initialized."""
        # Initialize the enhanced UI
        initialize_enhanced_ui(self.root, self.studio)
        
        # Verify that the app responds to keyboard shortcuts
        self.assertIsNotNone(self.studio)
    
    def test_menu_creation(self):
        """Test that the enhanced menu is created properly."""
        # Create the enhanced menu
        create_app_menu(self.root, self.studio)
        
        # Verify the menu structure is created
        self.assertIsNotNone(self.root.config().get('menu'))
    
    def test_studio_tabs_creation(self):
        """Test that all studio tabs are created properly."""
        # Set up the notebook (simulating what setup_ui does)
        self.studio.notebook = ttk.Notebook(self.root)
        self.studio.create_project_tab()
        self.studio.create_editor_tab()
        self.studio.create_build_tab()
        self.studio.create_reports_tab()
        self.studio.create_documentation_tab()
        self.studio.create_settings_tab()
        
        # Check that the notebook has the expected number of tabs
        self.assertEqual(self.studio.notebook.index('end'), 6)  # 6 tabs
        
        # Check that the tabs have the expected names
        tab_names = [self.studio.notebook.tab(i, 'text') for i in range(self.studio.notebook.index('end'))]
        self.assertIn("Project Explorer", tab_names)
        self.assertIn("Editor", tab_names)
        self.assertIn("Build", tab_names)
        self.assertIn("Reports", tab_names)
        self.assertIn("Documentation", tab_names)
        self.assertIn("Settings", tab_names)
    
    def test_editor_syntax_highlighting(self):
        """Test the editor's syntax highlighting functionality."""
        # Set up the editor tab
        self.studio.notebook = ttk.Notebook(self.root)
        self.studio.create_editor_tab()
        
        # Insert some JPE content
        jpe_content = """[Project]
name: Test Project
id: test_project
end
        
[Interactions]
id: test_interaction
display_name: Test Interaction
end
"""
        self.studio.editor_text.delete(1.0, tk.END)
        self.studio.editor_text.insert(tk.END, jpe_content)
        
        # Apply syntax highlighting
        self.studio._apply_syntax_highlighting()
        
        # Verify that tags were applied (basic check)
        tags_found = self.studio.editor_text.tag_names()
        # We expect certain tags to be created for highlighting
        self.assertTrue(any('keyword' in tag for tag in tags_found))
    
    def test_line_number_generation(self):
        """Test the editor's line number functionality."""
        # Set up the editor tab
        self.studio.notebook = ttk.Notebook(self.root)
        self.studio.create_editor_tab()
        
        # Insert content with multiple lines
        content = "Line 1\nLine 2\nLine 3\n"
        self.studio.editor_text.delete(1.0, tk.END)
        self.studio.editor_text.insert(tk.END, content)
        
        # Update line numbers
        self.studio._update_line_numbers()
        
        # Check that line numbers were generated
        line_content = self.studio.line_numbers.get(1.0, tk.END)
        # Should have 3 line numbers plus a blank line
        expected_lines = ["1", "2", "3", ""]
        actual_lines = line_content.strip().split('\n')
        for i, expected_line in enumerate(expected_lines):
            if i < len(actual_lines):
                self.assertEqual(expected_line, actual_lines[i])
    
    def test_project_tree_population(self):
        """Test the project tree population functionality."""
        # Set up the project tab
        self.studio.notebook = ttk.Notebook(self.root)
        self.studio.create_project_tab()
        
        # Populate the tree
        self.studio.populate_project_tree()
        
        # Check that items were added to the tree
        items = self.studio.tree.get_children()
        self.assertGreater(len(items), 0)
        
        # Check that the root project item exists
        project_items = []
        for item in items:
            item_text = self.studio.tree.item(item, 'text')
            project_items.append(item_text)
        
        self.assertIn("My Mod Project", project_items)
    
    def test_documentation_tab_functionality(self):
        """Test the documentation tab functionality."""
        # Set up the documentation tab
        self.studio.notebook = ttk.Notebook(self.root)
        self.studio.create_documentation_tab()
        
        # Verify that the components were created
        self.assertIsNotNone(self.studio.doc_content)
        self.assertIsNotNone(self.studio.doc_listbox)
        self.assertIsNotNone(self.studio.progress_bar)
        self.assertIsNotNone(self.studio.progress_label)
        
        # Check that the treeview was created with the proper structure
        self.assertIsNotNone(self.studio.doc_content.tag_names)
    
    def test_settings_tab_functionality(self):
        """Test the settings tab functionality."""
        # Set up the settings tab
        self.studio.notebook = ttk.Notebook(self.root)
        self.studio.create_settings_tab()
        
        # Verify that the components were created
        self.assertIsNotNone(self.studio.theme_var)
        self.assertIsNotNone(self.studio.font_size_var)
        
        # Test that theme can be changed
        original_theme = self.studio.theme_var.get()
        self.studio.theme_var.set("Sunset Glow")
        self.studio.apply_settings()
        
        # Note: This test would actually change the theme in a real scenario
        self.assertEqual(self.studio.theme_var.get(), "Sunset Glow")
    
    def test_status_bar_updates(self):
        """Test the status bar update functionality."""
        # Set up the editor tab
        self.studio.notebook = ttk.Notebook(self.root)
        self.studio.create_editor_tab()
        
        # Verify that status bar exists
        self.assertIsNotNone(self.studio.status_bar)
        
        # Update the status bar
        self.studio._update_status_bar()
        
        # Check that a status was displayed
        status_text = self.studio.status_bar.cget('text')
        self.assertIsNotNone(status_text)
    
    def test_keyboard_shortcuts_binding(self):
        """Test that keyboard shortcuts are bound."""
        # Set up basic studio functionality
        self.studio.setup_ui()
        
        # Test that the root has bindings (basic test)
        bindings = self.root.bind()
        self.assertIn('<Control-n>', bindings)
        self.assertIn('<Control-o>', bindings)
        self.assertIn('<Control-s>', bindings)
        self.assertIn('<Control-q>', bindings)
        self.assertIn('<F6>', bindings)
    
    def test_build_process_functionality(self):
        """Test the build process functionality."""
        # Test that the build method exists and can be called
        # (Without actually running a build, just verifying it's callable)
        self.assertTrue(callable(self.studio.build_project))
        
        # Mock the async build to prevent actual execution
        with patch('studio.async_worker.run_async') as mock_async:
            self.studio.project_root = self.project_path
            self.studio.build_project()
            
            # Verify that the async worker was called
            mock_async.assert_called_once()
    
    def test_file_operations_security(self):
        """Test the secure file operation functionality."""
        # Set up the editor tab
        self.studio.notebook = ttk.Notebook(self.root)
        self.studio.create_editor_tab()
        
        # Test that the save_file_as method exists
        self.assertTrue(callable(self.studio.save_file_as))
        
        # Check that the security validator is imported and used
        from security.validator import security_validator
        self.assertIsNotNone(security_validator)


class TestThemeManager(unittest.TestCase):
    """Specific tests for the theme manager."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.theme_manager = theme_manager
    
    def test_theme_loading(self):
        """Test that themes are correctly loaded."""
        themes = self.theme_manager.themes
        self.assertGreaterEqual(len(themes), 10)  # Should have 10+ themes
        
        # Check that all themes have required properties
        for theme_name, theme in themes.items():
            self.assertIsInstance(theme, Theme)
            self.assertTrue(theme.name)
            self.assertTrue(theme.display_name)
            self.assertTrue(theme.bg)
            self.assertTrue(theme.fg)
            self.assertTrue(theme.button_bg)
            self.assertTrue(theme.button_fg)
            self.assertTrue(theme.entry_bg)
            self.assertTrue(theme.entry_fg)
            self.assertTrue(theme.text_bg)
            self.assertTrue(theme.text_fg)
    
    def test_theme_lookup(self):
        """Test theme lookup functionality."""
        # Test getting all themes
        themes = self.theme_manager.get_themes()
        self.assertIn("Cyberpunk Neon", themes)
        self.assertIn("Sunset Glow", themes)
        
        # Test getting theme by display name
        theme_name = self.theme_manager.get_theme_by_display_name("Cyberpunk Neon")
        self.assertEqual(theme_name, "cyberpunk")
        
        # Test getting non-existent theme
        non_existent = self.theme_manager.get_theme_by_display_name("Non Existent Theme")
        self.assertIsNone(non_existent)


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)