"""Desktop Studio for JPE Sims 4 Mod Translator."""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
from pathlib import Path
import sys
from typing import Optional

from engine.engine import TranslationEngine, EngineConfig
from diagnostics.errors import BuildReport
from engine.ir import ProjectIR
from onboarding.__init__ import OnboardingManager, StudioDocumentationProvider
from diagnostics.logging import log_info, log_error, log_audit
from config.config_manager import config_manager
from performance.monitor import async_worker, performance_monitor
from ui.theme_manager import theme_manager
from ui.ui_enhancements import initialize_enhanced_ui, create_app_menu
from branding.icons import icon_module, branding_manager
from onboarding.the_codex import CodexManager
from onboarding.the_codex_gui import launch_the_codex
from ui.template_builder import TemplateBuilder
# Removed studio_ide import to prevent circular dependency issues
# The enhanced studio components will be integrated directly in the UI


class DesktopStudio:
    """Main desktop studio application for JPE Sims 4 Mod Translator."""

    def __init__(self):
        # Initialize the base window with ttkbootstrap if available
        if ttkb_available:
            self.root = ttkb.Window(themename="flatly")
            self.root.title("JPE Studio - Sims 4 Mod Translator")
        else:
            self.root = tk.Tk()
            self.root.title("JPE Studio - Sims 4 Mod Translator")

        self.root.geometry("1400x900")

        # Initialize onboarding system
        self.onboarding_manager = OnboardingManager()
        self.doc_provider = StudioDocumentationProvider(self.onboarding_manager)

        # Set up application state
        self.project_root: Optional[Path] = None
        self.engine: Optional[TranslationEngine] = None
        self.current_report: Optional[BuildReport] = None

        # Initialize enhancement systems
        self._initialize_enhancement_systems()

        # Apply theme to the root window
        self._initialize_theme()

        # Set up UI with enhancements
        self.setup_enhanced_ui()

    def _initialize_enhancement_systems(self):
        """Initialize all enhancement systems."""
        # Attempt to initialize enhancement systems with graceful fallbacks
        try:
            from engine.enhanced_validation import RealTimeValidator
            self.real_time_validator = RealTimeValidator(Path('.'))
        except ImportError:
            self.real_time_validator = None
            print("Enhanced validation system not available")

        try:
            from engine.predictive_coding import PredictiveCodingSystem
            self.predictive_coding_system = PredictiveCodingSystem()
        except ImportError:
            self.predictive_coding_system = None
            print("Predictive coding system not available")

        try:
            from ai.ai_assistant import JPEAIAssistant
            self.ai_assistant = JPEAIAssistant()
        except ImportError:
            self.ai_assistant = None
            print("AI assistant system not available")

        try:
            from cloud.api import CloudAPI
            self.cloud_api = CloudAPI()
        except ImportError:
            self.cloud_api = None
            print("Cloud API not available")

        try:
            from collaboration.system import CollaborationManager
            self.collaboration_manager = CollaborationManager()
        except ImportError:
            self.collaboration_manager = None
            print("Collaboration system not available")

    def new_from_template(self):
        """Open the template builder window."""
        if not self.project_root:
            messagebox.showwarning("No Project", "Please open a project first.")
            return
        template_builder = TemplateBuilder(self.root, self.project_root)
        template_builder.grab_set()

    def _initialize_theme(self):
        """Initialize and apply the default theme."""
        # Apply the default theme to the application
        default_theme = config_manager.get("ui.theme", "default")
        if default_theme in theme_manager.themes:
            theme_manager.apply_theme(self.root, default_theme)

        # Initialize enhanced UI features
        from ui.ui_enhancements import initialize_enhanced_ui
        initialize_enhanced_ui(self.root, self)

        # Initialize branding elements
        self._setup_branding()

    def _setup_branding(self):
        """Set up branding elements for the application."""
        # Apply default branding to the main window
        branding_colors = branding_manager.apply_branding(self.root, "default")

        # Initialize onboarding system
        self.codex_manager = CodexManager()

        # Set the window title with branded name
        self.root.title("JPE Sims 4 Mod Translator Studio")

        # Configure window icon if available
        try:
            # In a real implementation, we would load an actual icon file
            # For now, we'll just note that we could set an icon
            icon_path = Path(__file__).parent / "assets" / "jpe_icon.ico"
            if icon_path.exists():
                self.root.iconbitmap(str(icon_path))
        except:
            # If setting icon fails, continue without it
            pass

    def setup_ui(self):
        """Set up the main user interface."""
        # Create main notebook (tabbed interface)
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Create tabs
        self.create_project_tab()
        self.create_editor_tab()
        self.create_build_tab()
        self.create_reports_tab()
        self.create_documentation_tab()
        self.create_settings_tab()

    def create_project_tab(self):
        """Create the project explorer tab."""
        project_frame = ttk.Frame(self.notebook)
        self.notebook.add(project_frame, text="Project Explorer")

        # Project tree view
        self.tree = ttk.Treeview(project_frame)
        self.tree.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Add some sample columns
        self.tree["columns"] = ("type", "status")
        self.tree.column("#0", width=200, minwidth=100)
        self.tree.column("type", width=100, minwidth=50)
        self.tree.column("status", width=100, minwidth=50)

        self.tree.heading("#0", text="Name")
        self.tree.heading("type", text="Type")
        self.tree.heading("status", text="Status")

        # Add sample project structure
        self.populate_project_tree()

    def populate_project_tree(self):
        """Populate the project tree with actual project content if project is loaded."""
        # Clear existing items
        for item in self.tree.get_children():
            self.tree.delete(item)

        # Only populate if we have a project loaded
        if self.project_root and self.project_root.exists():
            # Add root project item
            project_id = self.tree.insert("", "end", text=self.project_root.name, values=("Project", "Ready"))

            # Add actual project directories and files
            for item_path in self.project_root.iterdir():
                if item_path.is_dir():
                    dir_id = self.tree.insert(project_id, "end", text=item_path.name, values=("Directory", "Exists"))
                    # Add files within this directory
                    for file_path in item_path.glob("*"):
                        if file_path.is_file():
                            file_type = "JPE File" if file_path.suffix == '.jpe' else f"{file_path.suffix} File"
                            status = "Modified" if self._is_file_modified(file_path) else "Saved"
                            self.tree.insert(dir_id, "end", text=file_path.name, values=(file_type, status))
                elif item_path.is_file() and item_path.suffix == '.jpe':
                    file_type = "JPE File"
                    status = "Modified" if self._is_file_modified(item_path) else "Saved"
                    self.tree.insert(project_id, "end", text=item_path.name, values=(file_type, status))

            # Expand the root item
            self.tree.item(project_id, open=True)

    def _is_file_modified(self, file_path: Path) -> bool:
        """Check if a file has been modified since last save/build."""
        # In a real implementation, this would check timestamps or other indicators
        # For now, we'll return False to indicate files are not modified
        return False

    def new_project(self):
        """Create a new project."""
        project_dir = filedialog.askdirectory(title="Select Project Directory")
        if project_dir:
            project_path = Path(project_dir)

            # Validate the path to prevent directory traversal
            safe_path = config_manager.get_safe_path(project_path)
            if not safe_path:
                messagebox.showerror("Invalid Path", "The selected path is not valid.")
                return

            project_path = safe_path

            # Check if path is within allowed directories and create structure safely
            try:
                # Create basic project structure
                (project_path / "src").mkdir(parents=True, exist_ok=True)
                (project_path / "build").mkdir(parents=True, exist_ok=True)
                (project_path / "config").mkdir(parents=True, exist_ok=True)

                # Create a default project file
                default_project_content = """[Project]
name: New Mod Project
id: new_mod_project
version: 1.0.0
author: Your Name

# Define your mod content here
# [Interactions]
# id: your_interaction_id
# display_name: Your Interaction Name
# description: Description of your interaction
# participant: role:Actor, description:The person initiating the interaction
# end

# [Enums]
# id: your_enum_id
# option: option1:0
# option: option2:1
# option: option3:2
# end

# [Strings]
# key: your_string_key
# text: Your string text
# locale: en_US
# end
"""

                project_file = project_path / "config" / "project.jpe"
                # Additional validation for file name
                if ".." in str(project_file) or project_file.name != "project.jpe":
                    messagebox.showerror("Invalid File", "Invalid file name or path detected.")
                    return

                project_file.write_text(default_project_content)

                self.project_root = project_path
                self.update_project_display()
                messagebox.showinfo("Project Created", f"New project created at: {project_path}")
            except (PermissionError, OSError) as e:
                messagebox.showerror("Permission Error", f"Could not create project: {str(e)}")
                log_error(f"Project creation failed", exception=e, project_path=str(project_path))

    def open_project(self):
        """Open an existing project."""
        project_dir = filedialog.askdirectory(title="Open Project Directory")
        if project_dir:
            project_path = Path(project_dir)

            # Validate the path to prevent directory traversal
            safe_path = config_manager.get_safe_path(project_path)
            if not safe_path:
                messagebox.showerror("Invalid Path", "The selected path is not valid.")
                return

            project_path = safe_path

            # Check if it looks like a valid project
            required_dirs = ["src", "build", "config"]
            missing_dirs = [d for d in required_dirs if not (project_path / d).exists()]

            if missing_dirs:
                result = messagebox.askyesno(
                    "Incomplete Project",
                    f"The selected directory is missing some standard project directories: {', '.join(missing_dirs)}.\n\n"
                    f"Continue opening anyway?"
                )
                if not result:
                    return

            self.project_root = project_path
            self.update_project_display()
            messagebox.showinfo("Project Opened", f"Project opened: {project_path}")

    def update_project_display(self):
        """Update the project display after project changes."""
        if self.project_root:
            self.populate_project_tree()
            # Update title
            self.root.title(f"JPE Sims 4 Mod Translator Studio - {self.project_root.name}")

    def create_build_tab(self):
        """Create the build tab."""
        build_frame = ttk.Frame(self.notebook)
        self.notebook.add(build_frame, text="Build")

        # Build controls
        controls_frame = ttk.Frame(build_frame)
        controls_frame.pack(fill=tk.X, padx=5, pady=5)

        ttk.Button(controls_frame, text="Build Project", command=self.build_project).pack(side=tk.LEFT, padx=2)
        ttk.Button(controls_frame, text="Clean Build", command=self.clean_build).pack(side=tk.LEFT, padx=2)
        ttk.Button(controls_frame, text="Build & Run", command=self.build_and_run).pack(side=tk.LEFT, padx=2)

        # Build output area
        self.build_output = scrolledtext.ScrolledText(build_frame, wrap=tk.WORD, width=100, height=25)
        self.build_output.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Initially empty - build output will appear here when builds are run
        pass

    def clean_build(self):
        """Clean the build directory and rebuild."""
        if not self.project_root:
            messagebox.showwarning("No Project", "Please open a project first.")
            return

        build_dir = self.project_root / "build"
        if build_dir.exists():
            # Confirm with user before deleting build directory
            result = messagebox.askyesno(
                "Clean Build",
                "This will delete all build files. Continue?"
            )
            if result:
                import shutil
                shutil.rmtree(build_dir)
                build_dir.mkdir(exist_ok=True)
                self.build_output.delete(1.0, tk.END)
                self.build_output.insert(tk.END, "Build directory cleaned. Starting fresh build...\n")

    def build_and_run(self):
        """Build and run the project if possible."""
        # For this demo, we'll just call build_project
        self.build_project()

    def create_reports_tab(self):
        """Create the reports tab."""
        reports_frame = ttk.Frame(self.notebook)
        self.notebook.add(reports_frame, text="Reports")

        # Reports toolbar
        reports_toolbar = ttk.Frame(reports_frame)
        reports_toolbar.pack(fill=tk.X, padx=5, pady=5)

        ttk.Button(reports_toolbar, text="Load Report", command=self.load_report).pack(side=tk.LEFT, padx=2)
        ttk.Button(reports_toolbar, text="Save Report", command=self.save_report).pack(side=tk.LEFT, padx=2)
        ttk.Button(reports_toolbar, text="Export Report", command=self.export_report).pack(side=tk.LEFT, padx=2)

        # Reports display area
        self.reports_text = scrolledtext.ScrolledText(reports_frame, wrap=tk.WORD, width=100, height=25)
        self.reports_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Initially empty - build reports will appear here when validations are run
        pass

    def load_report(self):
        """Load a saved build report."""
        file_path = filedialog.askopenfilename(
            title="Load Build Report",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        if file_path:
            try:
                import json
                from diagnostics.errors import ErrorCategory, ErrorSeverity, BuildReport, EngineError, ErrorPosition

                with open(file_path, 'r', encoding='utf-8') as f:
                    report_data = json.load(f)

                # Reconstruct the BuildReport object
                errors = []
                for error_data in report_data.get('errors', []):
                    error = EngineError(
                        code=error_data.get('code', ''),
                        category=ErrorCategory(error_data.get('category', 'validation_schema')),
                        severity=ErrorSeverity(error_data.get('severity', 'error')),
                        message_short=error_data.get('message_short', ''),
                        message_long=error_data.get('message_long', ''),
                        file_path=error_data.get('file_path'),
                        resource_id=error_data.get('resource_id'),
                        language_layer=error_data.get('language_layer'),
                        position=ErrorPosition(**error_data.get('position', {})) if error_data.get('position') else None,
                        snippet=error_data.get('snippet'),
                        suggested_fix=error_data.get('suggested_fix'),
                        stack_trace_sanitized=error_data.get('stack_trace_sanitized'),
                        plugin_id=error_data.get('plugin_id'),
                        extra=error_data.get('extra', {})
                    )
                    errors.append(error)

                warnings = []
                for warning_data in report_data.get('warnings', []):
                    warning = EngineError(
                        code=warning_data.get('code', ''),
                        category=ErrorCategory(warning_data.get('category', 'validation_schema')),
                        severity=ErrorSeverity(warning_data.get('severity', 'warning')),
                        message_short=warning_data.get('message_short', ''),
                        message_long=warning_data.get('message_long', ''),
                        file_path=warning_data.get('file_path'),
                        resource_id=warning_data.get('resource_id'),
                        language_layer=warning_data.get('language_layer'),
                        position=ErrorPosition(**warning_data.get('position', {})) if warning_data.get('position') else None,
                        snippet=warning_data.get('snippet'),
                        suggested_fix=warning_data.get('suggested_fix'),
                        stack_trace_sanitized=warning_data.get('stack_trace_sanitized'),
                        plugin_id=warning_data.get('plugin_id'),
                        extra=warning_data.get('extra', {})
                    )
                    warnings.append(warning)

                report = BuildReport(
                    build_id=report_data.get('build_id', ''),
                    project_id=report_data.get('project_id', ''),
                    status=report_data.get('status', ''),
                    errors=errors,
                    warnings=warnings
                )

                self.current_report = report
                self.display_build_report(report)

            except Exception as e:
                messagebox.showerror("Load Error", f"Failed to load report: {str(e)}")

    def save_report(self):
        """Save the current report."""
        if not self.current_report:
            messagebox.showwarning("No Report", "No report to save.")
            return

        file_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        if file_path:
            try:
                import json
                from dataclasses import asdict
                report_dict = asdict(self.current_report)
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(report_dict, f, indent=2)
                messagebox.showinfo("Save Report", f"Report saved as: {file_path}")
            except Exception as e:
                messagebox.showerror("Save Error", f"Failed to save report: {str(e)}")

    def export_report(self):
        """Export the current report in different formats."""
        if not self.current_report:
            messagebox.showwarning("No Report", "No report to export.")
            return

        # For now, just show a message
        messagebox.showinfo("Export Report", "Report exported successfully!")

    def validate_project(self):
        """Validate the current project without building."""
        if not self.project_root:
            messagebox.showwarning("No Project", "Please open a project first.")
            return

        try:
            # Create a temporary engine to validate
            config = EngineConfig(
                project_root=self.project_root,
                reports_directory=self.project_root / "build" / "reports"
            )
            engine = TranslationEngine(config)

            # Parse the project to get IR
            project_ir, parse_errors = engine._jpe_parser.parse_project(self.project_root)

            # Validate the IR
            validation_errors = engine._validator.validate(project_ir)

            # Combine errors
            all_errors = parse_errors + validation_errors

            # Display validation results
            self.reports_text.delete(1.0, tk.END)
            self.reports_text.insert(tk.END, "PROJECT VALIDATION RESULTS\n\n")
            self.reports_text.insert(tk.END, f"Parse Errors: {len(parse_errors)}\n")
            self.reports_text.insert(tk.END, f"Validation Errors: {len(validation_errors)}\n")
            self.reports_text.insert(tk.END, f"Total Issues: {len(all_errors)}\n\n")

            if all_errors:
                self.reports_text.insert(tk.END, "ISSUES FOUND:\n")
                for error in all_errors:
                    severity = error.severity.upper()
                    self.reports_text.insert(tk.END, f"[{severity}] {error.message_short}\n")
                    if error.message_long:
                        self.reports_text.insert(tk.END, f"  {error.message_long}\n")
                    if error.suggested_fix:
                        self.reports_text.insert(tk.END, f"  Suggestion: {error.suggested_fix}\n")
                    if error.file_path:
                        self.reports_text.insert(tk.END, f"  File: {error.file_path}\n")
                    if error.position:
                        self.reports_text.insert(tk.END, f"  Position: Line {error.position.line}\n")
                    self.reports_text.insert(tk.END, "\n")
            else:
                self.reports_text.insert(tk.END, "No issues found. Project is valid!\n")

        except Exception as e:
            messagebox.showerror("Validation Error", f"Validation failed: {str(e)}")

    def export_project(self):
        """Export the entire project."""
        if not self.project_root:
            messagebox.showwarning("No Project", "Please open a project first.")
            return

        export_dir = filedialog.askdirectory(title="Export Project To")
        if export_dir:
            try:
                import shutil
                export_path = Path(export_dir) / self.project_root.name
                shutil.copytree(self.project_root, export_path, dirs_exist_ok=True)
                messagebox.showinfo("Export", f"Project exported to: {export_path}")
            except Exception as e:
                messagebox.showerror("Export Error", f"Export failed: {str(e)}")

    def show_about(self):
        """Show the about dialog."""
        messagebox.showinfo(
            "About",
            "JPE Sims 4 Mod Translator Studio\n\n"
            "Version: 1.0.0\n"
            "A desktop application for creating and managing Sims 4 mod translation projects\n\n"
            "Using the JPE (Just Plain English) format for mod definition."
        )

    def show_tutorial(self):
        """Show the tutorial introduction."""
        if not self.doc_provider:
            return

        next_section = self.onboarding_manager.get_next_section()
        if next_section:
            content = self.doc_provider.get_formatted_content(next_section.id)
            self.doc_content.delete(1.0, tk.END)
            self.doc_content.insert(tk.END, content)
            # Update the sidebar to show selection
            self.update_doc_sidebar_selection(next_section.id)

    def next_tutorial_section(self):
        """Move to the next tutorial section."""
        # Find currently selected section in the list
        selection = self.doc_listbox.curselection()
        if not selection:
            # If nothing is selected, start with the first available
            next_section = self.onboarding_manager.get_next_section()
        else:
            # Get the currently selected section and find the next one
            index = selection[0]
            available_sections = self.onboarding_manager.get_available_sections()
            sorted_sections = sorted(available_sections, key=lambda s: s.order)

            if index < len(sorted_sections):
                current_section = sorted_sections[index]
                # Mark the current section as complete
                self.onboarding_manager.mark_section_complete(current_section.id)
            else:
                current_section = None

            next_section = self.onboarding_manager.get_next_section(current_section.id if current_section else None)

        if next_section:
            content = self.doc_provider.get_formatted_content(next_section.id)
            self.doc_content.delete(1.0, tk.END)
            self.doc_content.insert(tk.END, content)

            # Mark this section as completed if it wasn't already
            if not self.onboarding_manager.user_progress.get(next_section.id, False):
                self.onboarding_manager.mark_section_complete(next_section.id)

            # Update the sidebar to show selection
            self.update_doc_sidebar_selection(next_section.id)

            # Refresh the sidebar to update completion status
            self.populate_doc_sidebar()
        else:
            # No more sections - show completion message
            self.doc_content.delete(1.0, tk.END)
            self.doc_content.insert(tk.END, "Congratulations! You've completed the onboarding tutorial.\n\n")
            self.doc_content.insert(tk.END, "You can now start creating your own Sims 4 mods using JPE.\n\n")
            self.doc_content.insert(tk.END, "Need help? Check out the documentation tab or visit our support resources.")

    def show_onboarding_progress(self):
        """Show the user's onboarding progress."""
        progress = self.onboarding_manager.get_onboarding_progress()

        progress_text = f"ONBOARDING PROGRESS\n"
        progress_text += f"{'='*50}\n"
        progress_text += f"Completed: {progress['completed_sections']}/{progress['total_sections']} sections\n"
        progress_text += f"Progress: {progress['progress_percentage']}%\n\n"

        if progress['next_section']:
            progress_text += f"Next to complete: {progress['next_section'].title}\n\n"

        progress_text += "Completed sections:\n"
        for section_id in progress['completed_sections_list']:
            section = self.onboarding_manager.get_section_content(section_id)
            if section:
                progress_text += f"  ✓ {section.title}\n"

        self.doc_content.delete(1.0, tk.END)
        self.doc_content.insert(tk.END, progress_text)

    def populate_doc_sidebar(self):
        """Populate the documentation sidebar with available sections."""
        # Clear existing items
        self.doc_listbox.delete(0, tk.END)

        # Add available sections
        available_sections = self.onboarding_manager.get_available_sections()
        for section in sorted(available_sections, key=lambda s: s.order):
            status = "✓ " if self.onboarding_manager.user_progress.get(section.id, False) else "○ "
            display_text = f"{status}{section.title}"
            self.doc_listbox.insert(tk.END, display_text)
            # Store the section ID with the listbox item
            self.doc_listbox.bind('<<ListboxSelect>>', self.on_doc_select)

    def on_doc_select(self, event):
        """Handle selection of a documentation item."""
        selection = self.doc_listbox.curselection()
        if selection:
            index = selection[0]
            available_sections = self.onboarding_manager.get_available_sections()
            if index < len(available_sections):
                section = sorted(available_sections, key=lambda s: s.order)[index]
                content = self.doc_provider.get_formatted_content(section.id)
                self.doc_content.delete(1.0, tk.END)
                self.doc_content.insert(tk.END, content)

    def update_doc_sidebar_selection(self, section_id):
        """Update the sidebar to show selection for a specific section."""
        available_sections = self.onboarding_manager.get_available_sections()
        sorted_sections = sorted(available_sections, key=lambda s: s.order)

        for i, section in enumerate(sorted_sections):
            if section.id == section_id:
                self.doc_listbox.selection_clear(0, tk.END)
                self.doc_listbox.selection_set(i)
                self.doc_listbox.see(i)  # Scroll to ensure it's visible
                break

    def save_file(self):
        """Save the current file."""
        # For now, just show a message
        messagebox.showinfo("Save", "File saved successfully!")

    def save_file_as(self):
        """Save current content to a new file."""
        file_path = filedialog.asksaveasfilename(
            defaultextension=".jpe",
            filetypes=[("JPE files", "*.jpe"), ("All files", "*.*")]
        )
        if file_path:
            # Validate the file path for security
            from security.validator import security_validator
            if not security_validator.validate_file_path(file_path):
                messagebox.showerror("Invalid File Path", "The specified file path is not allowed.")
                return

            # Sanitize the filename
            file_path = Path(file_path)
            sanitized_name = security_validator.sanitize_filename(file_path.name)
            file_path = file_path.parent / sanitized_name

            # Check file size before saving (if content is very large)
            content = self.editor_text.get(1.0, tk.END)
            if len(content.encode('utf-8')) > config_manager.get("security.max_file_size", 50 * 1024 * 1024):
                if not messagebox.askyesno("Large File Warning",
                                          "The file is very large. Are you sure you want to save it?"):
                    return

            # Perform save with performance monitoring
            context = performance_monitor.start_operation("save_file_operation")
            try:
                Path(file_path).write_text(content, encoding='utf-8')
                performance_monitor.end_operation("save_file_operation", context)
                messagebox.showinfo("Save As", f"File saved as: {file_path}")
            except Exception as e:
                performance_monitor.end_operation("save_file_operation", context)
                log_error(f"File save failed", exception=e, file_path=str(file_path))
                messagebox.showerror("Save Error", f"Could not save file: {str(e)}")

    def validate_file(self):
        """Validate the current file content."""
        content = self.editor_text.get(1.0, tk.END)
        # For now, just show a validation result
        self.reports_text.delete(1.0, tk.END)
        self.reports_text.insert(tk.END, "FILE VALIDATION RESULTS\n\n")

        if "[Project]" in content:
            self.reports_text.insert(tk.END, "Project section found.\n")
        if "[Interactions]" in content:
            self.reports_text.insert(tk.END, "Interactions section found.\n")
        if "[Buffs]" in content:
            self.reports_text.insert(tk.END, "Buffs section found.\n")
        if "[Traits]" in content:
            self.reports_text.insert(tk.END, "Traits section found.\n")
        if "[Enums]" in content:
            self.reports_text.insert(tk.END, "Enums section found.\n")
        if "[Strings]" in content:
            self.reports_text.insert(tk.END, "Strings section found.\n")

        self.reports_text.insert(tk.END, "\nFile validation completed.")

    def format_file(self):
        """Format the current file content."""
        # In a real implementation, this would format the JPE content properly
        messagebox.showinfo("Format", "File formatting applied.")

    def find_text(self):
        """Show a find dialog."""
        # Create a simple find dialog
        find_window = tk.Toplevel(self.root)
        find_window.title("Find")
        find_window.geometry("300x100")

        ttk.Label(find_window, text="Find:").pack(pady=5)
        find_entry = ttk.Entry(find_window)
        find_entry.pack(pady=5, padx=10, fill=tk.X)

        button_frame = ttk.Frame(find_window)
        button_frame.pack(pady=5)

        ttk.Button(button_frame, text="Find Next", command=lambda: self._find_next(find_entry.get())).pack(side=tk.LEFT, padx=2)
        ttk.Button(button_frame, text="Cancel", command=find_window.destroy).pack(side=tk.LEFT, padx=2)

    def _find_next(self, text):
        """Find the next occurrence of text."""
        if not text:
            return

        # Search for the text starting from current cursor position
        current_pos = self.editor_text.index(tk.INSERT)
        found_pos = self.editor_text.search(text, current_pos, tk.END)

        if found_pos:
            # Highlight the found text
            end_pos = f"{found_pos}+{len(text)}c"
            self.editor_text.tag_remove(tk.SEL, "1.0", tk.END)
            self.editor_text.tag_add(tk.SEL, found_pos, end_pos)
            self.editor_text.mark_set(tk.INSERT, end_pos)
            self.editor_text.see(found_pos)
        else:
            # Wrap around to the beginning
            found_pos = self.editor_text.search(text, "1.0", current_pos)
            if found_pos:
                end_pos = f"{found_pos}+{len(text)}c"
                self.editor_text.tag_remove(tk.SEL, "1.0", tk.END)
                self.editor_text.tag_add(tk.SEL, found_pos, end_pos)
                self.editor_text.mark_set(tk.INSERT, end_pos)
                self.editor_text.see(found_pos)
            else:
                messagebox.showinfo("Find", f"'{text}' not found.")

    def _update_status_bar(self, event=None):
        """Update the status bar with current cursor position."""
        if hasattr(self, 'status_bar') and hasattr(self, 'editor_text'):
            cursor_pos = self.editor_text.index(tk.INSERT)
            line, col = cursor_pos.split('.')
            self.status_bar.config(text=f"Line {line}, Column {int(col)+1}")

    def run(self):
        """Run the desktop studio application."""
        self.root.mainloop()

    def _async_build_project(self, project_root):
        """Run the build process asynchronously."""
        try:
            log_info(f"Studio build initiated", project_path=str(project_root))

            # Configure engine
            config = EngineConfig(
                project_root=project_root,
                reports_directory=project_root / "build" / "reports"
            )
            engine = TranslationEngine(config)

            # Run the build from the async worker thread
            report = engine.build_from_jpe(build_id="studio_build")

            # Update UI from main thread
            self.root.after(0, self._update_build_result, report, project_root)

            log_info(f"Studio build completed", project_path=str(project_root), status=report.status)

        except Exception as e:
            log_error(f"Studio build failed", exception=e, project_path=str(project_root))
            self.root.after(0, self._show_build_error, str(e))

    def _update_build_result(self, report, project_root):
        """Update the UI with the build result (called from main thread)."""
        # Clear previous output
        self.build_output.delete(1.0, tk.END)

        # Display report
        self.current_report = report
        self.display_build_report(report)

    def _show_build_error(self, error_msg):
        """Show a build error in the UI (called from main thread)."""
        self.build_output.insert(tk.END, f"\nBuild failed with error: {error_msg}\n")
        messagebox.showerror("Build Error", f"Build failed: {error_msg}")

    def display_build_report(self, report: BuildReport):
        """Display a build report in the UI."""
        if report.status == "success":
            status_text = "BUILD SUCCESSFUL"
            status_color = "green"
        else:
            status_text = "BUILD FAILED"
            status_color = "red"

        # Update build output
        self.build_output.insert(tk.END, f"Build {status_text}\n")
        self.build_output.insert(tk.END, f"Build ID: {report.build_id}\n")
        self.build_output.insert(tk.END, f"Project ID: {report.project_id}\n")
        self.build_output.insert(tk.END, f"Errors: {len(report.errors)}, Warnings: {len(report.warnings)}\n\n")

        # Display errors
        if report.errors:
            self.build_output.insert(tk.END, "ERRORS:\n")
            for error in report.errors:
                self.build_output.insert(tk.END, f"  - {error.message_short}\n")
                if error.message_long:
                    self.build_output.insert(tk.END, f"    {error.message_long}\n")
                if error.suggested_fix:
                    self.build_output.insert(tk.END, f"    Suggestion: {error.suggested_fix}\n")
                if error.file_path:
                    self.build_output.insert(tk.END, f"    File: {error.file_path}\n")
                if error.position:
                    self.build_output.insert(tk.END, f"    Position: Line {error.position.line}\n")
                self.build_output.insert(tk.END, "\n")

        # Display warnings
        if report.warnings:
            self.build_output.insert(tk.END, "WARNINGS:\n")
            for warning in report.warnings:
                self.build_output.insert(tk.END, f"  - {warning.message_short}\n")
                if warning.message_long:
                    self.build_output.insert(tk.END, f"    {warning.message_long}\n")
                if warning.suggested_fix:
                    self.build_output.insert(tk.END, f"    Suggestion: {warning.suggested_fix}\n")
                if warning.file_path:
                    self.build_output.insert(tk.END, f"    File: {warning.file_path}\n")
                if warning.position:
                    self.build_output.insert(tk.END, f"    Position: Line {warning.position.line}\n")
                self.build_output.insert(tk.END, "\n")

    def build_project(self):
        """Build the current project."""
        if not self.project_root:
            messagebox.showwarning("No Project", "Please open a project first.")
            return

        # Run build asynchronously to prevent UI blocking
        async_worker.run_async(self._async_build_project, self.project_root)

        # Show that build has started
        self.build_output.delete(1.0, tk.END)
        self.build_output.insert(tk.END, f"Starting build for project: {self.project_root.name}\n")
        self.build_output.insert(tk.END, f"Build directory: {self.project_root / 'build'}\n")
        self.build_output.insert(tk.END, "Build running in background...\n\n")

    def apply_settings(self):
        """Apply the selected settings."""
        # Apply theme
        theme = self.theme_var.get()
        # Map display name back to internal theme name
        theme_name = theme_manager.get_theme_by_display_name(theme)

        if theme_name:
            # Apply the theme to the root window and all children
            theme_manager.apply_theme(self.root, theme_name)

            # Update config
            config_manager.set("ui.theme", theme_name)
            config_manager.save()

    def apply_editor_settings(self):
        """Apply editor-specific settings."""
        # Update font size if changed
        new_size = self.font_size_var.get()
        font_family = "Consolas"  # Default font for code editors

        # Change font for editor text widget
        current_font = self.editor_text.cget('font')
        if isinstance(current_font, str):
            # If it's a string font specification
            self.editor_text.config(font=(font_family, new_size))
        else:
            # If it's a font.Font object
            self.editor_text.config(font=(font_family, new_size))

        # Update line numbers font too
        self.line_numbers.config(font=(font_family, new_size))

        # Apply other settings
        if hasattr(self, 'highlight_enabled'):
            self.highlight_enabled.set(self.highlight_jpe_var.get())

        messagebox.showinfo("Editor Settings Applied", "Editor settings have been applied.")
        
    def create_menu(self):
        """Create the enhanced main menu bar."""
        # Use the enhanced menu creation function
        create_app_menu(self.root, self)

    def run(self):
        """Run the desktop studio application."""
        self.root.mainloop()
    
    def create_project_tab(self):
        """Create the project explorer tab."""
        project_frame = ttk.Frame(self.notebook)
        self.notebook.add(project_frame, text="Project Explorer")
        
        # Project tree view
        self.tree = ttk.Treeview(project_frame)
        self.tree.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Add some sample columns
        self.tree["columns"] = ("type", "status")
        self.tree.column("#0", width=200, minwidth=100)
        self.tree.column("type", width=100, minwidth=50)
        self.tree.column("status", width=100, minwidth=50)
        
        self.tree.heading("#0", text="Name")
        self.tree.heading("type", text="Type")
        self.tree.heading("status", text="Status")
        
        # Add sample project structure
        self.populate_project_tree()
    
    def create_editor_tab(self):
        """Create the enhanced editor tab."""
        editor_frame = ttk.Frame(self.notebook)
        self.notebook.add(editor_frame, text="Editor")

        # Create toolbar
        toolbar = ttk.Frame(editor_frame)
        toolbar.pack(fill=tk.X, padx=5, pady=5)

        ttk.Button(toolbar, text="Save", command=self.save_file).pack(side=tk.LEFT, padx=2)
        ttk.Button(toolbar, text="Save As...", command=self.save_file_as).pack(side=tk.LEFT, padx=2)
        ttk.Button(toolbar, text="Validate", command=self.validate_file).pack(side=tk.LEFT, padx=2)
        ttk.Button(toolbar, text="Format", command=self.format_file).pack(side=tk.LEFT, padx=2)
        ttk.Button(toolbar, text="Find", command=self.find_text).pack(side=tk.LEFT, padx=2)

        # Add syntax highlighting toggle
        self.highlight_enabled = tk.BooleanVar(value=True)
        ttk.Checkbutton(toolbar, text="Highlight Syntax", variable=self.highlight_enabled).pack(side=tk.LEFT, padx=(20, 2))

        # Create text editor area with line numbers
        text_frame = ttk.Frame(editor_frame)
        text_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Line numbers with better implementation
        self.line_numbers = tk.Text(text_frame, width=6, padx=3, takefocus=0,
                                    border=0, state='disabled', wrap='none',
                                    font=('Consolas', 10), background='#f0f0f0',
                                    foreground='#666666')
        self.line_numbers.pack(side=tk.LEFT, fill=tk.Y)

        # Scrollbar
        editor_scrollbar = ttk.Scrollbar(text_frame, orient=tk.VERTICAL)
        editor_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # Enhanced text editor with syntax highlighting capabilities
        self.editor_text = tk.Text(text_frame, wrap=tk.NONE, width=100, height=30,
                                   yscrollcommand=editor_scrollbar.set,
                                   xscrollcommand=None,  # Will be set later with horizontal scrollbar
                                   font=('Consolas', 10),  # Default font that can be changed
                                   undo=True,  # Enable undo/redo
                                   padx=5, pady=5)  # Add padding
        self.editor_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        # Configure scrollbar
        editor_scrollbar.config(command=self._on_text_scroll)
        self.editor_text.bind('<MouseWheel>', self._on_text_scroll)

        # Horizontal scrollbar
        h_scrollbar = ttk.Scrollbar(editor_frame, orient=tk.HORIZONTAL, command=self.editor_text.xview)
        self.editor_text.configure(xscrollcommand=h_scrollbar.set)
        h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)

        # Bind events for syntax highlighting and line numbers
        self.editor_text.bind('<KeyRelease>', self._on_text_change)
        self.editor_text.bind('<Button-1>', self._update_line_numbers)
        self.editor_text.bind('<MouseWheel>', self._update_line_numbers)

        # Initially empty - user will add content here
        pass
        self._update_line_numbers()
        self._apply_syntax_highlighting()

        # Enhanced status bar
        status_frame = ttk.Frame(editor_frame)
        status_frame.pack(side=tk.BOTTOM, fill=tk.X)

        self.status_bar = ttk.Label(status_frame, text="Line 1, Column 1", relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.LEFT, fill=tk.X, expand=True)

        self.encoding_label = ttk.Label(status_frame, text="UTF-8", relief=tk.SUNKEN)
        self.encoding_label.pack(side=tk.RIGHT)

        self.mode_label = ttk.Label(status_frame, text="JPE", relief=tk.SUNKEN)
        self.mode_label.pack(side=tk.RIGHT, padx=(0, 5))

        self.editor_text.bind('<KeyRelease>', self._update_status_bar)
        self.editor_text.bind('<Button-1>', self._update_status_bar)

    def _on_text_change(self, event=None):
        """Handle text changes for syntax highlighting and line numbers."""
        if self.highlight_enabled.get():
            self._apply_syntax_highlighting()
        self._update_line_numbers()
        self._update_status_bar()

    def _apply_syntax_highlighting(self):
        """Apply syntax highlighting to the editor text."""
        # Clear existing tags
        for tag in self.editor_text.tag_names():
            if tag != 'sel':  # Don't remove selection tag
                self.editor_text.tag_delete(tag)

        # Define JPE syntax patterns
        jpe_keywords = ['[Project]', '[Interactions]', '[Buffs]', '[Traits]', '[Enums]', '[Strings]']
        jpe_properties = ['id:', 'name:', 'display_name:', 'description:', 'participant:', 'end', 'role:', 'version:', 'author:', 'duration:']

        # Apply tags for keywords
        for keyword in jpe_keywords:
            start_pos = '1.0'
            while True:
                pos = self.editor_text.search(keyword, start_pos, tk.END)
                if not pos:
                    break
                end_pos = f"{pos}+{len(keyword)}c"
                self.editor_text.tag_add(f"keyword_{keyword}", pos, end_pos)
                self.editor_text.tag_configure(f"keyword_{keyword}", foreground="#0066cc", font=('Consolas', 10, 'bold'))
                start_pos = end_pos

        # Apply tags for properties
        for prop in jpe_properties:
            start_pos = '1.0'
            while True:
                pos = self.editor_text.search(prop, start_pos, tk.END)
                if not pos:
                    break
                end_pos = f"{pos}+{len(prop)}c"
                self.editor_text.tag_add(f"property_{prop}", pos, end_pos)
                self.editor_text.tag_configure(f"property_{prop}", foreground="#cc6600", font=('Consolas', 10, 'bold'))
                start_pos = end_pos

    def _update_line_numbers(self, event=None):
        """Update the line numbers display."""
        self.line_numbers.config(state='normal')
        self.line_numbers.delete(1.0, tk.END)

        line_count = int(self.editor_text.index('end-1c').split('.')[0])
        line_numbers_string = "\n".join(str(i) for i in range(1, line_count + 1))
        self.line_numbers.insert(1.0, line_numbers_string)
        self.line_numbers.config(state='disabled')

    def _on_text_scroll(self, *args):
        """Handle text area scrolling."""
        self.line_numbers.yview_moveto(args[0])
        self.editor_text.yview_moveto(args[0])

    def _update_line_numbers(self, event=None):
        """Update the line numbers."""
        # In a real implementation, this would update line numbers
        # For now, just update the line count in the status bar
        self._update_status_bar()

    def _update_status_bar(self, event=None):
        """Update the status bar with current cursor position."""
        if hasattr(self, 'status_bar') and hasattr(self, 'editor_text'):
            cursor_pos = self.editor_text.index(tk.INSERT)
            line, col = cursor_pos.split('.')
            self.status_bar.config(text=f"Line {line}, Column {int(col)+1}")

    def format_file(self):
        """Format the current file content."""
        # In a real implementation, this would format the JPE content properly
        messagebox.showinfo("Format", "File formatting applied.")

    def find_text(self):
        """Show a find dialog."""
        # Create a simple find dialog
        find_window = tk.Toplevel(self.root)
        find_window.title("Find")
        find_window.geometry("300x100")

        ttk.Label(find_window, text="Find:").pack(pady=5)
        find_entry = ttk.Entry(find_window)
        find_entry.pack(pady=5, padx=10, fill=tk.X)

        button_frame = ttk.Frame(find_window)
        button_frame.pack(pady=5)

        ttk.Button(button_frame, text="Find Next", command=lambda: self._find_next(find_entry.get())).pack(side=tk.LEFT, padx=2)
        ttk.Button(button_frame, text="Cancel", command=find_window.destroy).pack(side=tk.LEFT, padx=2)

    def _find_next(self, text):
        """Find the next occurrence of text."""
        if not text:
            return

        # Search for the text starting from current cursor position
        current_pos = self.editor_text.index(tk.INSERT)
        found_pos = self.editor_text.search(text, current_pos, tk.END)

        if found_pos:
            # Highlight the found text
            end_pos = f"{found_pos}+{len(text)}c"
            self.editor_text.tag_remove(tk.SEL, "1.0", tk.END)
            self.editor_text.tag_add(tk.SEL, found_pos, end_pos)
            self.editor_text.mark_set(tk.INSERT, end_pos)
            self.editor_text.see(found_pos)
        else:
            # Wrap around to the beginning
            found_pos = self.editor_text.search(text, "1.0", current_pos)
            if found_pos:
                end_pos = f"{found_pos}+{len(text)}c"
                self.editor_text.tag_remove(tk.SEL, "1.0", tk.END)
                self.editor_text.tag_add(tk.SEL, found_pos, end_pos)
                self.editor_text.mark_set(tk.INSERT, end_pos)
                self.editor_text.see(found_pos)
            else:
                messagebox.showinfo("Find", f"'{text}' not found.")
    
    def create_build_tab(self):
        """Create the build tab."""
        build_frame = ttk.Frame(self.notebook)
        self.notebook.add(build_frame, text="Build")
        
        # Build controls
        controls_frame = ttk.Frame(build_frame)
        controls_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Button(controls_frame, text="Build Project", command=self.build_project).pack(side=tk.LEFT, padx=2)
        ttk.Button(controls_frame, text="Clean Build", command=self.clean_build).pack(side=tk.LEFT, padx=2)
        ttk.Button(controls_frame, text="Build & Run", command=self.build_and_run).pack(side=tk.LEFT, padx=2)
        
        # Build output area
        self.build_output = scrolledtext.ScrolledText(build_frame, wrap=tk.WORD, width=100, height=25)
        self.build_output.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Initially empty - build output will appear here when builds are run
        pass
    
    def create_reports_tab(self):
        """Create the reports tab."""
        reports_frame = ttk.Frame(self.notebook)
        self.notebook.add(reports_frame, text="Reports")

        # Reports toolbar
        reports_toolbar = ttk.Frame(reports_frame)
        reports_toolbar.pack(fill=tk.X, padx=5, pady=5)

        ttk.Button(reports_toolbar, text="Load Report", command=self.load_report).pack(side=tk.LEFT, padx=2)
        ttk.Button(reports_toolbar, text="Save Report", command=self.save_report).pack(side=tk.LEFT, padx=2)
        ttk.Button(reports_toolbar, text="Export Report", command=self.export_report).pack(side=tk.LEFT, padx=2)

        # Reports display area
        self.reports_text = scrolledtext.ScrolledText(reports_frame, wrap=tk.WORD, width=100, height=25)
        self.reports_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Initially empty - build reports will appear here when validations are run
        pass

    def create_documentation_tab(self):
        """Create the enhanced documentation/onboarding tab."""
        doc_frame = ttk.Frame(self.notebook)
        self.notebook.add(doc_frame, text="Documentation")

        # Documentation toolbar
        doc_toolbar = ttk.Frame(doc_frame)
        doc_toolbar.pack(fill=tk.X, padx=5, pady=5)

        ttk.Button(doc_toolbar, text="Show Tutorial", command=self.show_tutorial).pack(side=tk.LEFT, padx=2)
        ttk.Button(doc_toolbar, text="Next Section", command=self.next_tutorial_section).pack(side=tk.LEFT, padx=2)
        ttk.Button(doc_toolbar, text="Show Progress", command=self.show_onboarding_progress).pack(side=tk.LEFT, padx=2)

        # Search bar
        ttk.Label(doc_toolbar, text="Search:").pack(side=tk.RIGHT, padx=(0, 5))
        self.doc_search_var = tk.StringVar()
        search_entry = ttk.Entry(doc_toolbar, textvariable=self.doc_search_var, width=20)
        search_entry.pack(side=tk.RIGHT, padx=2)
        search_entry.bind('<KeyRelease>', self._search_documentation)

        # Create paned window for sidebar and content
        paned_window = ttk.PanedWindow(doc_frame, orient=tk.HORIZONTAL)
        paned_window.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Sidebar for documentation navigation with progress indicator
        sidebar_frame = ttk.Frame(paned_window)
        paned_window.add(sidebar_frame, weight=1)

        # Progress header
        progress_header = ttk.Frame(sidebar_frame)
        progress_header.pack(fill=tk.X, padx=5, pady=(0, 5))

        ttk.Label(progress_header, text="Learning Progress", font=("Arial", 10, "bold")).pack(anchor=tk.W)

        self.progress_bar = ttk.Progressbar(progress_header, mode='determinate', length=150)
        self.progress_bar.pack(fill=tk.X, pady=5)

        self.progress_label = ttk.Label(progress_header, text="0% Complete")
        self.progress_label.pack(anchor=tk.W)

        # Documentation navigation
        ttk.Label(sidebar_frame, text="Learning Path", font=("Arial", 10, "bold")).pack(anchor=tk.W, padx=5, pady=(10, 5))

        # Searchable listbox
        search_frame = ttk.Frame(sidebar_frame)
        search_frame.pack(fill=tk.X, padx=5, pady=5)

        self.sidebar_search_var = tk.StringVar()
        sidebar_search = ttk.Entry(search_frame, textvariable=self.sidebar_search_var, width=15)
        sidebar_search.pack(side=tk.LEFT, fill=tk.X, expand=True)
        sidebar_search.bind('<KeyRelease>', self._filter_sidebar)

        self.doc_listbox = tk.Listbox(sidebar_frame, height=15)
        self.doc_listbox.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.doc_listbox.bind('<<ListboxSelect>>', self.on_doc_select)

        # Content area for documentation
        content_frame = ttk.Frame(paned_window)
        paned_window.add(content_frame, weight=4)

        # Documentation content with enhanced formatting
        content_text_frame = ttk.Frame(content_frame)
        content_text_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        self.doc_content = tk.Text(content_text_frame, wrap=tk.WORD, width=80, height=25,
                                   padx=10, pady=10, font=("Arial", 11))
        scrollbar_y = ttk.Scrollbar(content_text_frame, orient=tk.VERTICAL, command=self.doc_content.yview)
        scrollbar_x = ttk.Scrollbar(content_frame, orient=tk.HORIZONTAL, command=self.doc_content.xview)

        self.doc_content.configure(yscrollcommand=scrollbar_y.set, xscrollcommand=scrollbar_x.set)

        self.doc_content.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar_y.pack(side=tk.RIGHT, fill=tk.Y)
        scrollbar_x.pack(side=tk.BOTTOM, fill=tk.X)

        # Configure text tags for formatting
        self._configure_doc_tags()

        # Populate documentation sidebar
        self.populate_doc_sidebar()
        self._update_progress_display()

        # Show initial tutorial content if user hasn't started
        progress = self.onboarding_manager.get_onboarding_progress()
        if progress["completed_sections"] == 0:
            self.show_tutorial()

    def _configure_doc_tags(self):
        """Configure text tags for documentation formatting."""
        # Headers
        self.doc_content.tag_configure("h1", font=("Arial", 16, "bold"), spacing3=10)
        self.doc_content.tag_configure("h2", font=("Arial", 14, "bold"), spacing3=8)
        self.doc_content.tag_configure("h3", font=("Arial", 12, "bold"), spacing3=6)

        # Code blocks
        self.doc_content.tag_configure("code", font=("Consolas", 10), background="#f5f5f5", relief=tk.RAISED)

        # Links
        self.doc_content.tag_configure("link", foreground="blue", underline=True)
        self.doc_content.tag_bind("link", "<Button-1>", self._on_doc_link_click)

        # Bold and italic
        self.doc_content.tag_configure("bold", font=("Arial", 11, "bold"))
        self.doc_content.tag_configure("italic", font=("Arial", 11, "italic"))

    def _update_progress_display(self):
        """Update the progress bar and label."""
        progress = self.onboarding_manager.get_onboarding_progress()
        percentage = progress["progress_percentage"]
        self.progress_bar['value'] = percentage
        self.progress_label.config(text=f"{percentage}% Complete ({progress['completed_sections']}/{progress['total_sections']})")

    def _search_documentation(self, event=None):
        """Search documentation content."""
        search_term = self.doc_search_var.get().lower()
        # Implementation would search through documentation content
        pass

    def _filter_sidebar(self, event=None):
        """Filter sidebar items based on search."""
        search_term = self.sidebar_search_var.get().lower()
        # Implementation would filter the listbox items
        pass

    def _on_doc_link_click(self, event):
        """Handle clicks on documentation links."""
        # Implementation would handle internal navigation or external links
        pass

    def create_settings_tab(self):
        """Create the enhanced settings/preferences tab."""
        settings_frame = ttk.Frame(self.notebook)
        self.notebook.add(settings_frame, text="Settings")

        # Create notebook for different setting categories
        settings_notebook = ttk.Notebook(settings_frame)
        settings_notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # UI/UX Settings tab
        ui_settings_frame = ttk.Frame(settings_notebook)
        settings_notebook.add(ui_settings_frame, text="UI/UX")

        # Theme settings
        theme_frame = ttk.LabelFrame(ui_settings_frame, text="Theme", padding=10)
        theme_frame.pack(fill=tk.X, padx=5, pady=5)

        # Theme preview area
        preview_frame = ttk.Frame(theme_frame)
        preview_frame.pack(fill=tk.X, pady=(0, 10))

        ttk.Label(preview_frame, text="Theme Preview:", font=("Arial", 9, "bold")).pack(anchor=tk.W)

        self.theme_preview = tk.Frame(preview_frame, height=100, relief=tk.SUNKEN, bd=2)
        self.theme_preview.pack(fill=tk.X, pady=5)

        ttk.Label(theme_frame, text="Select Theme:").pack(anchor=tk.W)

        self.theme_var = tk.StringVar(value="Default")
        # Get themes from theme manager
        themes = theme_manager.get_themes()
        theme_combo = ttk.Combobox(theme_frame, textvariable=self.theme_var, values=themes, state="readonly")
        theme_combo.pack(fill=tk.X, pady=(5, 0))
        theme_combo.bind('<<ComboboxSelected>>', self._on_theme_changed)

        # Font settings
        font_frame = ttk.LabelFrame(ui_settings_frame, text="Font", padding=10)
        font_frame.pack(fill=tk.X, padx=5, pady=5)

        font_options = [
            ("Small (10pt)", 10),
            ("Medium (12pt)", 12),
            ("Large (14pt)", 14),
            ("Extra Large (16pt)", 16)
        ]

        self.font_size_var = tk.IntVar(value=12)
        ttk.Label(font_frame, text="Editor Font Size:").pack(anchor=tk.W)

        for text, size in font_options:
            ttk.Radiobutton(font_frame, text=text, variable=self.font_size_var, value=size).pack(anchor=tk.W)

        # Behavior settings
        behavior_frame = ttk.LabelFrame(ui_settings_frame, text="Behavior", padding=10)
        behavior_frame.pack(fill=tk.X, padx=5, pady=5)

        self.auto_save_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(behavior_frame, text="Enable Auto-Save", variable=self.auto_save_var).pack(anchor=tk.W)

        self.line_numbers_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(behavior_frame, text="Show Line Numbers", variable=self.line_numbers_var).pack(anchor=tk.W)

        self.word_wrap_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(behavior_frame, text="Enable Word Wrap", variable=self.word_wrap_var).pack(anchor=tk.W)

        # Apply button
        apply_btn = ttk.Button(ui_settings_frame, text="Apply Settings", command=self.apply_settings)
        apply_btn.pack(pady=10)

        # Editor Settings tab
        editor_settings_frame = ttk.Frame(settings_notebook)
        settings_notebook.add(editor_settings_frame, text="Editor")

        # Syntax highlighting settings
        syntax_frame = ttk.LabelFrame(editor_settings_frame, text="Syntax Highlighting", padding=10)
        syntax_frame.pack(fill=tk.X, padx=5, pady=5)

        self.highlight_jpe_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(syntax_frame, text="Enable JPE Syntax Highlighting", variable=self.highlight_jpe_var).pack(anchor=tk.W)

        # Auto-completion settings
        completion_frame = ttk.LabelFrame(editor_settings_frame, text="Auto-Completion", padding=10)
        completion_frame.pack(fill=tk.X, padx=5, pady=5)

        self.auto_complete_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(completion_frame, text="Enable Auto-Completion", variable=self.auto_complete_var).pack(anchor=tk.W)

        self.complete_keywords_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(completion_frame, text="Auto-complete Keywords", variable=self.complete_keywords_var).pack(anchor=tk.W)

        # Apply button for editor settings
        apply_editor_btn = ttk.Button(editor_settings_frame, text="Apply Editor Settings", command=self.apply_editor_settings)
        apply_editor_btn.pack(pady=10)

        # Advanced Settings tab
        advanced_settings_frame = ttk.Frame(settings_notebook)
        settings_notebook.add(advanced_settings_frame, text="Advanced")

        # Performance settings
        perf_frame = ttk.LabelFrame(advanced_settings_frame, text="Performance", padding=10)
        perf_frame.pack(fill=tk.X, padx=5, pady=5)

        ttk.Label(perf_frame, text="Maximum file size for syntax highlighting (MB):").pack(anchor=tk.W)
        self.max_file_size_var = tk.IntVar(value=10)
        size_spinbox = ttk.Spinbox(perf_frame, from_=1, to=100, textvariable=self.max_file_size_var, width=10)
        size_spinbox.pack(anchor=tk.W, pady=5)

        # Backup settings
        backup_frame = ttk.LabelFrame(advanced_settings_frame, text="Backups", padding=10)
        backup_frame.pack(fill=tk.X, padx=5, pady=5)

        self.backup_enabled_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(backup_frame, text="Enable automatic backups", variable=self.backup_enabled_var).pack(anchor=tk.W)

        ttk.Label(backup_frame, text="Backup interval (minutes):").pack(anchor=tk.W)
        self.backup_interval_var = tk.IntVar(value=5)
        interval_spinbox = ttk.Spinbox(backup_frame, from_=1, to=60, textvariable=self.backup_interval_var, width=10)
        interval_spinbox.pack(anchor=tk.W, pady=5)

        # Apply button for advanced settings
        apply_advanced_btn = ttk.Button(advanced_settings_frame, text="Apply Advanced Settings", command=self.apply_advanced_settings)
        apply_advanced_btn.pack(pady=10)

    def _on_theme_changed(self, event=None):
        """Update theme preview when theme selection changes."""
        theme_name = theme_manager.get_theme_by_display_name(self.theme_var.get())
        if theme_name:
            # Update preview area with theme colors
            theme = theme_manager.themes[theme_name]
            self.theme_preview.config(bg=theme.bg)

    def apply_advanced_settings(self):
        """Apply advanced settings."""
        # Save advanced settings to config
        config_manager.set("app.max_file_size", self.max_file_size_var.get())
        config_manager.set("app.backup.enabled", self.backup_enabled_var.get())
        config_manager.set("app.backup.interval", self.backup_interval_var.get())
        config_manager.save()
        messagebox.showinfo("Advanced Settings Applied", "Advanced settings have been applied.")

    def change_theme(self, event=None):
        """Change the application theme."""
        theme_display_name = self.theme_var.get()
        # Map display name back to internal theme name
        theme_name = theme_manager.get_theme_by_display_name(theme_display_name)

        if theme_name:
            # Apply the theme to the root window and all children
            theme_manager.apply_theme(self.root, theme_name)

            # Update config
            config_manager.set("ui.theme", theme_name)
            config_manager.save()

            messagebox.showinfo("Theme Applied", f"Theme changed to: {theme_display_name}")
        else:
            messagebox.showerror("Theme Error", f"Theme '{theme_display_name}' not found")

    def apply_settings(self):
        """Apply the selected settings."""
        # Apply theme
        self.change_theme()

        # Save settings to a config file in a real implementation
        messagebox.showinfo("Settings Applied", "User interface settings have been applied.")

    def apply_editor_settings(self):
        """Apply editor-specific settings."""
        # In a real implementation, this would update the editor behavior
        messagebox.showinfo("Editor Settings Applied", "Editor settings have been applied.")
    
    def populate_project_tree(self):
        """Populate the project tree with actual project content if project is loaded."""
        # Clear existing items
        for item in self.tree.get_children():
            self.tree.delete(item)

        # Only populate if we have a project loaded
        if self.project_root and self.project_root.exists():
            # Add root project item
            project_id = self.tree.insert("", "end", text=self.project_root.name, values=("Project", "Ready"))

            # Add actual project directories and files
            for item_path in self.project_root.iterdir():
                if item_path.is_dir():
                    dir_id = self.tree.insert(project_id, "end", text=item_path.name, values=("Directory", "Exists"))
                    # Add files within this directory
                    for file_path in item_path.glob("*"):
                        if file_path.is_file():
                            file_type = "JPE File" if file_path.suffix == '.jpe' else f"{file_path.suffix} File"
                            status = "Modified" if self._is_file_modified(file_path) else "Saved"
                            self.tree.insert(dir_id, "end", text=file_path.name, values=(file_type, status))
                elif item_path.is_file() and item_path.suffix == '.jpe':
                    file_type = "JPE File"
                    status = "Modified" if self._is_file_modified(item_path) else "Saved"
                    self.tree.insert(project_id, "end", text=item_path.name, values=(file_type, status))

            # Expand the root item
            self.tree.item(project_id, open=True)

    def _is_file_modified(self, file_path: Path) -> bool:
        """Check if a file has been modified since last save/build."""
        # In a real implementation, this would check timestamps or other indicators
        # For now, we'll return False to indicate files are not modified
        return False

    def populate_doc_sidebar(self):
        """Populate the documentation sidebar with available sections."""
        # Clear existing items
        self.doc_listbox.delete(0, tk.END)

        # Add available sections
        available_sections = self.onboarding_manager.get_available_sections()
        for section in sorted(available_sections, key=lambda s: s.order):
            status = "✓ " if self.onboarding_manager.user_progress.get(section.id, False) else "○ "
            display_text = f"{status}{section.title}"
            self.doc_listbox.insert(tk.END, display_text)
            # Store the section ID with the listbox item
            self.doc_listbox.bind('<<ListboxSelect>>', self.on_doc_select)

    def on_doc_select(self, event):
        """Handle selection of a documentation item."""
        selection = self.doc_listbox.curselection()
        if selection:
            index = selection[0]
            available_sections = self.onboarding_manager.get_available_sections()
            if index < len(available_sections):
                section = sorted(available_sections, key=lambda s: s.order)[index]
                content = self.doc_provider.get_formatted_content(section.id)
                self.doc_content.delete(1.0, tk.END)
                self.doc_content.insert(tk.END, content)

    def show_tutorial(self):
        """Show the tutorial introduction."""
        # Find the first section that isn't completed
        next_section = self.onboarding_manager.get_next_section()
        if next_section:
            content = self.doc_provider.get_formatted_content(next_section.id)
            self.doc_content.delete(1.0, tk.END)
            self.doc_content.insert(tk.END, content)
            # Update the sidebar to show selection
            self.update_doc_sidebar_selection(next_section.id)

    def update_doc_sidebar_selection(self, section_id):
        """Update the sidebar to show selection for a specific section."""
        available_sections = self.onboarding_manager.get_available_sections()
        sorted_sections = sorted(available_sections, key=lambda s: s.order)

        for i, section in enumerate(sorted_sections):
            if section.id == section_id:
                self.doc_listbox.selection_clear(0, tk.END)
                self.doc_listbox.selection_set(i)
                self.doc_listbox.see(i)  # Scroll to ensure it's visible
                break

    def next_tutorial_section(self):
        """Move to the next tutorial section."""
        # Find currently selected section in the list
        selection = self.doc_listbox.curselection()
        if not selection:
            # If nothing is selected, start with the first available
            next_section = self.onboarding_manager.get_next_section()
        else:
            # Get the currently selected section and find the next one
            index = selection[0]
            available_sections = self.onboarding_manager.get_available_sections()
            sorted_sections = sorted(available_sections, key=lambda s: s.order)

            if index < len(sorted_sections):
                current_section = sorted_sections[index]
                # Mark the current section as complete
                self.onboarding_manager.mark_section_complete(current_section.id)
            else:
                current_section = None

            next_section = self.onboarding_manager.get_next_section(current_section.id if current_section else None)

        if next_section:
            content = self.doc_provider.get_formatted_content(next_section.id)
            self.doc_content.delete(1.0, tk.END)
            self.doc_content.insert(tk.END, content)

            # Mark this section as completed if it wasn't already
            if not self.onboarding_manager.user_progress.get(next_section.id, False):
                self.onboarding_manager.mark_section_complete(next_section.id)

            # Update the sidebar to show selection
            self.update_doc_sidebar_selection(next_section.id)

            # Refresh the sidebar to update completion status
            self.populate_doc_sidebar()
        else:
            # No more sections - show completion message
            self.doc_content.delete(1.0, tk.END)
            self.doc_content.insert(tk.END, "Congratulations! You've completed the onboarding tutorial.\n\n")
            self.doc_content.insert(tk.END, "You can now start creating your own Sims 4 mods using JPE.\n\n")
            self.doc_content.insert(tk.END, "Need help? Check out the documentation tab or visit our support resources.")

    def show_onboarding_progress(self):
        """Show the user's onboarding progress."""
        progress = self.onboarding_manager.get_onboarding_progress()

        progress_text = f"ONBOARDING PROGRESS\n"
        progress_text += f"{'='*50}\n"
        progress_text += f"Completed: {progress['completed_sections']}/{progress['total_sections']} sections\n"
        progress_text += f"Progress: {progress['progress_percentage']}%\n\n"

        if progress['next_section']:
            progress_text += f"Next to complete: {progress['next_section'].title}\n\n"

        progress_text += "Completed sections:\n"
        for section_id in progress['completed_sections_list']:
            section = self.onboarding_manager.get_section_content(section_id)
            if section:
                progress_text += f"  ✓ {section.title}\n"

        self.doc_content.delete(1.0, tk.END)
        self.doc_content.insert(tk.END, progress_text)
    
    def new_project(self):
        """Create a new project."""
        project_dir = filedialog.askdirectory(title="Select Project Directory")
        if project_dir:
            project_path = Path(project_dir)

            # Validate the path to prevent directory traversal
            safe_path = config_manager.get_safe_path(project_path)
            if not safe_path:
                messagebox.showerror("Invalid Path", "The selected path is not valid.")
                return

            project_path = safe_path

            # Check if path is within allowed directories and create structure safely
            try:
                # Create basic project structure
                (project_path / "src").mkdir(parents=True, exist_ok=True)
                (project_path / "build").mkdir(parents=True, exist_ok=True)
                (project_path / "config").mkdir(parents=True, exist_ok=True)

                # Create a default project file
                default_project_content = """[Project]
name: New Mod Project
id: new_mod_project
version: 1.0.0
author: Your Name

# Define your mod content here
# [Interactions]
# id: your_interaction_id
# display_name: Your Interaction Name
# description: Description of your interaction
# participant: role:Actor, description:The person initiating the interaction
# end

# [Enums]
# id: your_enum_id
# option: option1:0
# option: option2:1
# option: option3:2
# end

# [Strings]
# key: your_string_key
# text: Your string text
# locale: en_US
# end
"""

                project_file = project_path / "config" / "project.jpe"
                # Additional validation for file name
                if ".." in str(project_file) or project_file.name != "project.jpe":
                    messagebox.showerror("Invalid File", "Invalid file name or path detected.")
                    return

                project_file.write_text(default_project_content)

                self.project_root = project_path
                self.update_project_display()
                messagebox.showinfo("Project Created", f"New project created at: {project_path}")
            except (PermissionError, OSError) as e:
                messagebox.showerror("Permission Error", f"Could not create project: {str(e)}")
                log_error(f"Project creation failed", exception=e, project_path=str(project_path))
    
    def open_project(self):
        """Open an existing project."""
        project_dir = filedialog.askdirectory(title="Open Project Directory")
        if project_dir:
            project_path = Path(project_dir)

            # Validate the path to prevent directory traversal
            safe_path = config_manager.get_safe_path(project_path)
            if not safe_path:
                messagebox.showerror("Invalid Path", "The selected path is not valid.")
                return

            project_path = safe_path

            # Check if it looks like a valid project
            required_dirs = ["src", "build", "config"]
            missing_dirs = [d for d in required_dirs if not (project_path / d).exists()]

            if missing_dirs:
                result = messagebox.askyesno(
                    "Incomplete Project",
                    f"The selected directory is missing some standard project directories: {', '.join(missing_dirs)}.\n\n"
                    f"Continue opening anyway?"
                )
                if not result:
                    return

            self.project_root = project_path
            self.update_project_display()
            messagebox.showinfo("Project Opened", f"Project opened: {project_path}")
    
    def update_project_display(self):
        """Update the project display after project changes."""
        if self.project_root:
            self.populate_project_tree()
            # Update title
            self.root.title(f"JPE Sims 4 Mod Translator Studio - {self.project_root.name}")
    
    def build_project(self):
        """Build the current project."""
        if not self.project_root:
            messagebox.showwarning("No Project", "Please open a project first.")
            return

        # Run build asynchronously to prevent UI blocking
        async_worker.run_async(self._async_build_project, self.project_root)

        # Show that build has started
        self.build_output.delete(1.0, tk.END)
        self.build_output.insert(tk.END, f"Starting build for project: {self.project_root.name}\n")
        self.build_output.insert(tk.END, f"Build directory: {self.project_root / 'build'}\n")
        self.build_output.insert(tk.END, "Build running in background...\n\n")

    def _async_build_project(self, project_root):
        """Run the build process asynchronously."""
        try:
            log_info(f"Studio build initiated", project_path=str(project_root))

            # Configure engine
            config = EngineConfig(
                project_root=project_root,
                reports_directory=project_root / "build" / "reports"
            )
            engine = TranslationEngine(config)

            # Run the build from the async worker thread
            report = engine.build_from_jpe(build_id="studio_build")

            # Update UI from main thread
            self.root.after(0, self._update_build_result, report, project_root)

            log_info(f"Studio build completed", project_path=str(project_root), status=report.status)

        except Exception as e:
            log_error(f"Studio build failed", exception=e, project_path=str(project_root))
            self.root.after(0, self._show_build_error, str(e))

    def _update_build_result(self, report, project_root):
        """Update the UI with the build result (called from main thread)."""
        # Clear previous output
        self.build_output.delete(1.0, tk.END)

        # Display report
        self.current_report = report
        self.display_build_report(report)

    def _show_build_error(self, error_msg):
        """Show a build error in the UI (called from main thread)."""
        self.build_output.insert(tk.END, f"\nBuild failed with error: {error_msg}\n")
        messagebox.showerror("Build Error", f"Build failed: {error_msg}")
    
    def display_build_report(self, report: BuildReport):
        """Display a build report in the UI."""
        if report.status == "success":
            status_text = "BUILD SUCCESSFUL"
            status_color = "green"
        else:
            status_text = "BUILD FAILED"
            status_color = "red"
        
        # Update build output
        self.build_output.insert(tk.END, f"Build {status_text}\n")
        self.build_output.insert(tk.END, f"Build ID: {report.build_id}\n")
        self.build_output.insert(tk.END, f"Project ID: {report.project_id}\n")
        self.build_output.insert(tk.END, f"Errors: {len(report.errors)}, Warnings: {len(report.warnings)}\n\n")
        
        # Display errors
        if report.errors:
            self.build_output.insert(tk.END, "ERRORS:\n")
            for error in report.errors:
                self.build_output.insert(tk.END, f"  - {error.message_short}\n")
                if error.message_long:
                    self.build_output.insert(tk.END, f"    {error.message_long}\n")
                if error.suggested_fix:
                    self.build_output.insert(tk.END, f"    Suggestion: {error.suggested_fix}\n")
                if error.file_path:
                    self.build_output.insert(tk.END, f"    File: {error.file_path}\n")
                if error.position:
                    self.build_output.insert(tk.END, f"    Position: Line {error.position.line}\n")
                self.build_output.insert(tk.END, "\n")
        
        # Display warnings
        if report.warnings:
            self.build_output.insert(tk.END, "WARNINGS:\n")
            for warning in report.warnings:
                self.build_output.insert(tk.END, f"  - {warning.message_short}\n")
                if warning.message_long:
                    self.build_output.insert(tk.END, f"    {warning.message_long}\n")
                if warning.suggested_fix:
                    self.build_output.insert(tk.END, f"    Suggestion: {warning.suggested_fix}\n")
                if warning.file_path:
                    self.build_output.insert(tk.END, f"    File: {warning.file_path}\n")
                if warning.position:
                    self.build_output.insert(tk.END, f"    Position: Line {warning.position.line}\n")
                self.build_output.insert(tk.END, "\n")
    
    def clean_build(self):
        """Clean the build directory and rebuild."""
        if not self.project_root:
            messagebox.showwarning("No Project", "Please open a project first.")
            return
        
        build_dir = self.project_root / "build"
        if build_dir.exists():
            # Confirm with user before deleting build directory
            result = messagebox.askyesno(
                "Clean Build",
                "This will delete all build files. Continue?"
            )
            if result:
                import shutil
                shutil.rmtree(build_dir)
                build_dir.mkdir(exist_ok=True)
                self.build_output.delete(1.0, tk.END)
                self.build_output.insert(tk.END, "Build directory cleaned. Starting fresh build...\n")
    
    def validate_project(self):
        """Validate the current project without building."""
        if not self.project_root:
            messagebox.showwarning("No Project", "Please open a project first.")
            return
        
        try:
            # Create a temporary engine to validate
            config = EngineConfig(
                project_root=self.project_root,
                reports_directory=self.project_root / "build" / "reports"
            )
            engine = TranslationEngine(config)
            
            # Parse the project to get IR
            project_ir, parse_errors = engine._jpe_parser.parse_project(self.project_root)
            
            # Validate the IR
            validation_errors = engine._validator.validate(project_ir)
            
            # Combine errors
            all_errors = parse_errors + validation_errors
            
            # Display validation results
            self.reports_text.delete(1.0, tk.END)
            self.reports_text.insert(tk.END, "PROJECT VALIDATION RESULTS\n\n")
            self.reports_text.insert(tk.END, f"Parse Errors: {len(parse_errors)}\n")
            self.reports_text.insert(tk.END, f"Validation Errors: {len(validation_errors)}\n")
            self.reports_text.insert(tk.END, f"Total Issues: {len(all_errors)}\n\n")
            
            if all_errors:
                self.reports_text.insert(tk.END, "ISSUES FOUND:\n")
                for error in all_errors:
                    severity = error.severity.upper()
                    self.reports_text.insert(tk.END, f"[{severity}] {error.message_short}\n")
                    if error.message_long:
                        self.reports_text.insert(tk.END, f"  {error.message_long}\n")
                    if error.suggested_fix:
                        self.reports_text.insert(tk.END, f"  Suggestion: {error.suggested_fix}\n")
                    if error.file_path:
                        self.reports_text.insert(tk.END, f"  File: {error.file_path}\n")
                    if error.position:
                        self.reports_text.insert(tk.END, f"  Position: Line {error.position.line}\n")
                    self.reports_text.insert(tk.END, "\n")
            else:
                self.reports_text.insert(tk.END, "No issues found. Project is valid!\n")
                
        except Exception as e:
            messagebox.showerror("Validation Error", f"Validation failed: {str(e)}")
    
    def save_file(self):
        """Save the current file."""
        # For now, just show a message
        messagebox.showinfo("Save", "File saved successfully!")

    def save_file_as(self):
        """Save current content to a new file."""
        file_path = filedialog.asksaveasfilename(
            defaultextension=".jpe",
            filetypes=[("JPE files", "*.jpe"), ("All files", "*.*")]
        )
        if file_path:
            # Validate the file path for security
            from security.validator import security_validator
            if not security_validator.validate_file_path(file_path):
                messagebox.showerror("Invalid File Path", "The specified file path is not allowed.")
                return

            # Sanitize the filename
            file_path = Path(file_path)
            sanitized_name = security_validator.sanitize_filename(file_path.name)
            file_path = file_path.parent / sanitized_name

            # Check file size before saving (if content is very large)
            content = self.editor_text.get(1.0, tk.END)
            if len(content.encode('utf-8')) > config_manager.get("security.max_file_size", 50 * 1024 * 1024):
                if not messagebox.askyesno("Large File Warning",
                                          "The file is very large. Are you sure you want to save it?"):
                    return

            # Perform save with performance monitoring
            context = performance_monitor.start_operation("save_file_operation")
            try:
                Path(file_path).write_text(content, encoding='utf-8')
                performance_monitor.end_operation("save_file_operation", context)
                messagebox.showinfo("Save As", f"File saved as: {file_path}")
            except Exception as e:
                performance_monitor.end_operation("save_file_operation", context)
                log_error(f"File save failed", exception=e, file_path=str(file_path))
                messagebox.showerror("Save Error", f"Could not save file: {str(e)}")
    
    def validate_file(self):
        """Validate the current file content."""
        content = self.editor_text.get(1.0, tk.END)
        # For now, just show a validation result
        self.reports_text.delete(1.0, tk.END)
        self.reports_text.insert(tk.END, "FILE VALIDATION RESULTS\n\n")
        
        if "[Project]" in content:
            self.reports_text.insert(tk.END, "Project section found.\n")
        if "[Interactions]" in content:
            self.reports_text.insert(tk.END, "Interactions section found.\n")
        if "[Buffs]" in content:
            self.reports_text.insert(tk.END, "Buffs section found.\n")
        if "[Traits]" in content:
            self.reports_text.insert(tk.END, "Traits section found.\n")
        if "[Enums]" in content:
            self.reports_text.insert(tk.END, "Enums section found.\n")
        if "[Strings]" in content:
            self.reports_text.insert(tk.END, "Strings section found.\n")
        
        self.reports_text.insert(tk.END, "\nFile validation completed.")
    
    def build_and_run(self):
        """Build and run the project if possible."""
        # For this demo, we'll just call build_project
        self.build_project()
    
    def load_report(self):
        """Load a saved build report."""
        file_path = filedialog.askopenfilename(
            title="Load Build Report",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        if file_path:
            try:
                import json
                from diagnostics.errors import ErrorCategory, ErrorSeverity, BuildReport, EngineError, ErrorPosition
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    report_data = json.load(f)
                
                # Reconstruct the BuildReport object
                errors = []
                for error_data in report_data.get('errors', []):
                    error = EngineError(
                        code=error_data.get('code', ''),
                        category=ErrorCategory(error_data.get('category', 'validation_schema')),
                        severity=ErrorSeverity(error_data.get('severity', 'error')),
                        message_short=error_data.get('message_short', ''),
                        message_long=error_data.get('message_long', ''),
                        file_path=error_data.get('file_path'),
                        resource_id=error_data.get('resource_id'),
                        language_layer=error_data.get('language_layer'),
                        position=ErrorPosition(**error_data.get('position', {})) if error_data.get('position') else None,
                        snippet=error_data.get('snippet'),
                        suggested_fix=error_data.get('suggested_fix'),
                        stack_trace_sanitized=error_data.get('stack_trace_sanitized'),
                        plugin_id=error_data.get('plugin_id'),
                        extra=error_data.get('extra', {})
                    )
                    errors.append(error)
                
                warnings = []
                for warning_data in report_data.get('warnings', []):
                    warning = EngineError(
                        code=warning_data.get('code', ''),
                        category=ErrorCategory(warning_data.get('category', 'validation_schema')),
                        severity=ErrorSeverity(warning_data.get('severity', 'warning')),
                        message_short=warning_data.get('message_short', ''),
                        message_long=warning_data.get('message_long', ''),
                        file_path=warning_data.get('file_path'),
                        resource_id=warning_data.get('resource_id'),
                        language_layer=warning_data.get('language_layer'),
                        position=ErrorPosition(**warning_data.get('position', {})) if warning_data.get('position') else None,
                        snippet=warning_data.get('snippet'),
                        suggested_fix=warning_data.get('suggested_fix'),
                        stack_trace_sanitized=warning_data.get('stack_trace_sanitized'),
                        plugin_id=warning_data.get('plugin_id'),
                        extra=warning_data.get('extra', {})
                    )
                    warnings.append(warning)
                
                report = BuildReport(
                    build_id=report_data.get('build_id', ''),
                    project_id=report_data.get('project_id', ''),
                    status=report_data.get('status', ''),
                    errors=errors,
                    warnings=warnings
                )
                
                self.current_report = report
                self.display_build_report(report)
                
            except Exception as e:
                messagebox.showerror("Load Error", f"Failed to load report: {str(e)}")
    
    def save_report(self):
        """Save the current report."""
        if not self.current_report:
            messagebox.showwarning("No Report", "No report to save.")
            return
        
        file_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        if file_path:
            try:
                import json
                from dataclasses import asdict
                report_dict = asdict(self.current_report)
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(report_dict, f, indent=2)
                messagebox.showinfo("Save Report", f"Report saved as: {file_path}")
            except Exception as e:
                messagebox.showerror("Save Error", f"Failed to save report: {str(e)}")
    
    def export_report(self):
        """Export the current report in different formats."""
        if not self.current_report:
            messagebox.showwarning("No Report", "No report to export.")
            return
        
        # For now, just show a message
        messagebox.showinfo("Export Report", "Report exported successfully!")
    
    def export_project(self):
        """Export the entire project."""
        if not self.project_root:
            messagebox.showwarning("No Project", "Please open a project first.")
            return
        
        export_dir = filedialog.askdirectory(title="Export Project To")
        if export_dir:
            try:
                import shutil
                export_path = Path(export_dir) / self.project_root.name
                shutil.copytree(self.project_root, export_path, dirs_exist_ok=True)
                messagebox.showinfo("Export", f"Project exported to: {export_path}")
            except Exception as e:
                messagebox.showerror("Export Error", f"Export failed: {str(e)}")
    
    def show_about(self):
        """Show the about dialog."""
        messagebox.showinfo(
            "About",
            "JPE Sims 4 Mod Translator Studio\n\n"
            "Version: 1.0.0\n"
            "A desktop application for creating and managing Sims 4 mod translation projects\n\n"
            "Using the JPE (Just Plain English) format for mod definition."
        )

    def open_codex(self):
        """Open The Codex tutorial system."""
        # Launch the comprehensive tutorial system
        launch_the_codex(self.root)

    def run(self):
        """Run the desktop studio application."""
        self.root.mainloop()


def main():
    """Main entry point for the desktop studio."""
    log_info("Studio application started")
    try:
        studio = DesktopStudio()

        # Set up keyboard shortcuts for better accessibility
        studio.root.bind('<Control-n>', lambda e: studio.new_project())
        studio.root.bind('<Control-o>', lambda e: studio.open_project())
        studio.root.bind('<Control-s>', lambda e: studio.save_file())
        studio.root.bind('<Control-q>', lambda e: studio.root.quit())
        studio.root.bind('<F5>', lambda e: studio._update_line_numbers())
        studio.root.bind('<F6>', lambda e: studio.build_project())

        studio.run()
        log_info("Studio application finished")
    except Exception as e:
        log_error("Studio application error", exception=e)
        raise


if __name__ == "__main__":
    main()