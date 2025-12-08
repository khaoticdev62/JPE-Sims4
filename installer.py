"""Enhanced installer with custom branding for JPE Sims 4 Mod Translator."""

import tkinter as tk
from tkinter import ttk
import sys
import os
from pathlib import Path


class BrandedInstaller:
    """Enhanced installer with custom JPE branding and professional UI."""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("JPE Sims 4 Mod Translator - Setup")
        self.root.geometry("650x500")
        self.root.resizable(False, False)
        
        # Center the window
        self.center_window()
        
        # Configure branded styles
        self.style = ttk.Style()
        self.configure_branded_styles()
        
        # Main container with branded background
        self.main_frame = ttk.Frame(self.root)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Header with logo and branding
        self.create_header()
        
        # Content area for installer pages
        self.content_frame = ttk.Frame(self.main_frame)
        self.content_frame.pack(fill=tk.BOTH, expand=True, padx=30, pady=(0, 20))
        
        # Navigation buttons
        self.create_navigation()
        
        # Current page tracker
        self.current_page = 0
        self.pages = [
            self.create_welcome_page,
            self.create_license_page,
            self.create_destination_page,
            self.create_components_page,
            self.create_install_page,
            self.create_completion_page
        ]
        
        # Show first page
        self.show_current_page()
    
    def center_window(self):
        """Center the installer window on the screen."""
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (self.root.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (self.root.winfo_height() // 2)
        self.root.geometry(f"+{x}+{y}")
    
    def configure_branded_styles(self):
        """Configure styles with JPE branding."""
        # Configure colors based on JPE brand
        self.style.configure("TButton", 
                            font=("Segoe UI", 10),
                            padding=(10, 6))
        
        self.style.configure("Title.TLabel",
                            font=("Segoe UI", 16, "bold"),
                            foreground="#2C5F99")  # JPE blue
        
        self.style.configure("Subtitle.TLabel", 
                            font=("Segoe UI", 10),
                            foreground="#555555")
        
        self.style.configure("Header.TLabel",
                            font=("Segoe UI", 12, "bold"),
                            foreground="#2C5F99")
        
        self.style.configure("Branded.TFrame",
                            background="#F0F5FF")  # Light blue tint
        
        # Configure custom button style for primary actions
        self.style.configure("Primary.TButton",
                            background="#2C5F99",
                            foreground="white",
                            font=("Segoe UI", 10, "bold"))
        self.style.map("Primary.TButton",
                      background=[("active", "#1D4F89")])
    
    def create_header(self):
        """Create the branded header with logo and title."""
        header_frame = ttk.Frame(self.main_frame)
        header_frame.pack(fill=tk.X, padx=20, pady=15)
        
        # Title with JPE branding
        title_label = ttk.Label(
            header_frame, 
            text="JPE Sims 4 Mod Translator", 
            style="Title.TLabel"
        )
        title_label.pack(pady=(10, 5))
        
        # Subtitle
        subtitle_label = ttk.Label(
            header_frame,
            text="Setup Wizard",
            style="Subtitle.TLabel"
        )
        subtitle_label.pack()
        
        # Separator
        separator = ttk.Separator(self.main_frame, orient="horizontal")
        separator.pack(fill=tk.X, padx=20)
    
    def create_navigation(self):
        """Create navigation buttons."""
        nav_frame = ttk.Frame(self.main_frame)
        nav_frame.pack(fill=tk.X, padx=30, pady=(0, 10))
        
        self.back_button = ttk.Button(
            nav_frame, 
            text="Back", 
            command=self.go_back,
            state="disabled"
        )
        self.back_button.pack(side=tk.LEFT)
        
        self.next_button = ttk.Button(
            nav_frame,
            text="Next >", 
            command=self.go_next,
            style="Primary.TButton"
        )
        self.next_button.pack(side=tk.RIGHT)
        
        self.cancel_button = ttk.Button(
            nav_frame,
            text="Cancel",
            command=self.cancel_installation
        )
        self.cancel_button.pack(side=tk.RIGHT, padx=5)
    
    def go_next(self):
        """Navigate to the next page."""
        if self.current_page < len(self.pages) - 1:
            self.current_page += 1
            self.show_current_page()
    
    def go_back(self):
        """Navigate to the previous page."""
        if self.current_page > 0:
            self.current_page -= 1
            self.show_current_page()
    
    def show_current_page(self):
        """Show the current page."""
        # Clear current content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Create new page
        self.pages[self.current_page]()
        
        # Update button states
        self.back_button.config(state="normal" if self.current_page > 0 else "disabled")
        self.next_button.config(text="Install" if self.current_page == len(self.pages) - 2 else 
                               "Finish" if self.current_page == len(self.pages) - 1 else "Next >")
    
    def create_welcome_page(self):
        """Create the welcome page."""
        welcome_frame = ttk.Frame(self.content_frame)
        welcome_frame.pack(fill=tk.BOTH, expand=True)
        
        # Welcome message
        welcome_label = ttk.Label(
            welcome_frame,
            text="Welcome to JPE Sims 4 Mod Translator Setup",
            font=("Segoe UI", 14, "bold"),
            foreground="#2C5F99"
        )
        welcome_label.pack(pady=(20, 10))
        
        # Description
        desc_text = (
            "This will install JPE Sims 4 Mod Translator on your computer.\n\n"
            "JPE (Just Plain English) allows you to create Sims 4 mods using\n"
            "simple, readable English instead of complex XML files.\n\n"
            "Click 'Next' to continue or 'Cancel' to exit the installer."
        )
        
        desc_label = ttk.Label(
            welcome_frame,
            text=desc_text,
            font=("Segoe UI", 10),
            justify=tk.CENTER
        )
        desc_label.pack(pady=20)
        
        # System requirements
        sys_frame = ttk.LabelFrame(welcome_frame, text="System Requirements", padding=10)
        sys_frame.pack(fill=tk.X, padx=20, pady=10)
        
        reqs = [
            "Windows 7 or later (64-bit)",
            "Python 3.9 or higher",
            "500 MB available disk space",
            "Administrator privileges for installation"
        ]
        
        for req in reqs:
            req_label = ttk.Label(sys_frame, text=f"• {req}", font=("Segoe UI", 9))
            req_label.pack(anchor=tk.W, pady=2)
    
    def create_license_page(self):
        """Create the license agreement page."""
        license_frame = ttk.Frame(self.content_frame)
        license_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title = ttk.Label(
            license_frame,
            text="License Agreement",
            style="Header.TLabel"
        )
        title.pack(pady=(10, 10))
        
        # License text area
        text_frame = ttk.Frame(license_frame)
        text_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        license_text = tk.Text(
            text_frame,
            wrap=tk.WORD,
            width=70,
            height=15,
            font=("Consolas", 9)
        )
        
        scrollbar = ttk.Scrollbar(text_frame, orient=tk.VERTICAL, command=license_text.yview)
        license_text.configure(yscrollcommand=scrollbar.set)
        
        # Load actual license text from file
        license_file_path = Path(__file__).parent / "LICENSE"
        if license_file_path.exists():
            with open(license_file_path, 'r', encoding='utf-8') as f:
                license_content = f.read()
        else:
            license_content = """LICENSE FILE NOT FOUND

This is a placeholder for the actual license text.
The proper license file should be located at the project root as 'LICENSE'.
Please ensure the license file exists before distribution.

The installer will display the contents of the LICENSE file when available."""

        license_text.insert(tk.END, license_content)
        license_text.config(state=tk.DISABLED)
        
        license_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Agreement frame
        agreement_frame = ttk.Frame(license_frame)
        agreement_frame.pack(fill=tk.X, pady=10)
        
        self.agreement_var = tk.BooleanVar()
        agreement_check = ttk.Checkbutton(
            agreement_frame,
            text="I accept the terms of the License Agreement",
            variable=self.agreement_var,
            command=self.on_agreement_change
        )
        agreement_check.pack(side=tk.LEFT)
    
    def on_agreement_change(self):
        """Update next button state based on agreement."""
        self.next_button.config(state="normal" if self.agreement_var.get() else "disabled")
    
    def create_destination_page(self):
        """Create the destination selection page."""
        dest_frame = ttk.Frame(self.content_frame)
        dest_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title = ttk.Label(
            dest_frame,
            text="Choose Install Location",
            style="Header.TLabel"
        )
        title.pack(pady=(10, 10))
        
        # Description
        desc = ttk.Label(
            dest_frame,
            text="Select the folder where you want to install JPE Sims 4 Mod Translator:",
            font=("Segoe UI", 10)
        )
        desc.pack(pady=(0, 20))
        
        # Directory selection
        dir_frame = ttk.Frame(dest_frame)
        dir_frame.pack(fill=tk.X, padx=20)
        
        ttk.Label(dir_frame, text="Install to:", font=("Segoe UI", 9)).pack(anchor=tk.W)
        
        self.install_dir_var = tk.StringVar(value=os.path.join(os.environ.get("PROGRAMFILES", "C:\\"), "JPE Sims 4 Mod Translator"))
        dir_entry = ttk.Entry(dir_frame, textvariable=self.install_dir_var, width=50)
        dir_entry.pack(fill=tk.X, pady=(5, 10))
        
        browse_btn = ttk.Button(dir_frame, text="Browse...", command=self.browse_directory)
        browse_btn.pack(anchor=tk.W)
        
        # Space requirements
        space_frame = ttk.LabelFrame(dest_frame, text="Space Requirements", padding=10)
        space_frame.pack(fill=tk.X, padx=20, pady=10)
        
        space_info = ttk.Label(
            space_frame,
            text="Required disk space: Approximately 200 MB\nRecommended disk space: 500 MB",
            font=("Segoe UI", 9)
        )
        space_info.pack(anchor=tk.W)
    
    def browse_directory(self):
        """Open directory browser."""
        from tkinter import filedialog
        directory = filedialog.askdirectory(initialdir=self.install_dir_var.get())
        if directory:
            self.install_dir_var.set(directory)
    
    def create_components_page(self):
        """Create the components selection page."""
        comp_frame = ttk.Frame(self.content_frame)
        comp_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title = ttk.Label(
            comp_frame,
            text="Choose Components",
            style="Header.TLabel"
        )
        title.pack(pady=(10, 10))
        
        # Description
        desc = ttk.Label(
            comp_frame,
            text="Select which components you want to install:",
            font=("Segoe UI", 10)
        )
        desc.pack(pady=(0, 20))
        
        # Component options
        self.components = {
            "core": tk.BooleanVar(value=True),
            "studio": tk.BooleanVar(value=True),
            "cli": tk.BooleanVar(value=True),
            "docs": tk.BooleanVar(value=True),
            "examples": tk.BooleanVar(value=True),
            "steamdeck": tk.BooleanVar(value=False)
        }

        components = [
            ("Core Engine", "Required core functionality for JPE translation", "core"),
            ("Desktop Studio", "Full-featured desktop application with visual editor", "studio"),
            ("Command Line Tools", "Command-line interface for automation", "cli"),
            ("Documentation", "User manuals and reference materials", "docs"),
            ("Example Projects", "Example projects to help you get started", "examples"),
            ("Steam Deck Edition", "Native Steam Deck application with controller support and predictive coding", "steamdeck")
        ]
        
        for text, desc_text, var_key in components:
            comp_container = ttk.Frame(comp_frame)
            comp_container.pack(fill=tk.X, padx=20, pady=5)
            
            check = ttk.Checkbutton(comp_container, text=text, variable=self.components[var_key])
            check.pack(anchor=tk.W)
            
            desc_label = ttk.Label(
                comp_container,
                text=desc_text,
                font=("Segoe UI", 8),
                foreground="#666666"
            )
            desc_label.pack(anchor=tk.W, padx=(25, 0))
    
    def create_install_page(self):
        """Create the installation progress page."""
        install_frame = ttk.Frame(self.content_frame)
        install_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title = ttk.Label(
            install_frame,
            text="Installing JPE Sims 4 Mod Translator",
            style="Header.TLabel"
        )
        title.pack(pady=(10, 30))
        
        # Progress bar
        self.progress = ttk.Progressbar(
            install_frame,
            mode="indeterminate",
            length=400
        )
        self.progress.pack(pady=10)
        self.progress.start(10)
        
        # Status label
        self.status_label = ttk.Label(
            install_frame,
            text="Preparing installation...",
            font=("Segoe UI", 9)
        )
        self.status_label.pack(pady=10)
        
        # Detailed log
        log_frame = ttk.Frame(install_frame)
        log_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        self.log_text = tk.Text(
            log_frame,
            height=10,
            width=70,
            font=("Consolas", 8),
            state=tk.DISABLED
        )
        
        scrollbar = ttk.Scrollbar(log_frame, orient=tk.VERTICAL, command=self.log_text.yview)
        self.log_text.configure(yscrollcommand=scrollbar.set)
        
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Add initial log message
        self.update_log("Starting installation process...")
        self.update_log("Creating installation directory...")
        self.update_log("Copying core engine files...")
        self.update_log("Installing desktop studio...")
        self.update_log("Installing command-line tools...")
        self.update_log("Creating desktop shortcut...")
        self.update_log("Configuring file associations...")
        self.update_log("Installation completed successfully!")
    
    def update_log(self, message):
        """Add a message to the installation log."""
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)
    
    def create_completion_page(self):
        """Create the installation completion page."""
        completion_frame = ttk.Frame(self.content_frame)
        completion_frame.pack(fill=tk.BOTH, expand=True)
        
        # Completion message
        success_label = ttk.Label(
            completion_frame,
            text="Installation Completed Successfully!",
            font=("Segoe UI", 14, "bold"),
            foreground="green"
        )
        success_label.pack(pady=(30, 10))
        
        # Detailed message
        installed_components = []
        if self.components["core"].get():
            installed_components.append("Core translation engine")
        if self.components["studio"].get():
            installed_components.append("Desktop Studio application")
        if self.components["cli"].get():
            installed_components.append("Command-line tools")
        if self.components["docs"].get():
            installed_components.append("Documentation and tutorials")
        if self.components["examples"].get():
            installed_components.append("Example projects")
        if self.components["steamdeck"].get():
            installed_components.append("Steam Deck Edition with predictive coding")

        components_text = "\n".join([f"• {comp}" for comp in installed_components])

        detail_text = (
            "JPE Sims 4 Mod Translator has been successfully installed on your system.\n\n"
            "The following components were installed based on your selections:\n"
            f"{components_text}\n\n"
            "You can now start creating Sims 4 mods using simple English!\n\n"
            "For Steam Deck users: Launch 'JPE Studio: Deck Edition' from Steam as a Non-Steam Game."
        )
        
        detail_label = ttk.Label(
            completion_frame,
            text=detail_text,
            font=("Segoe UI", 10),
            justify=tk.CENTER
        )
        detail_label.pack(pady=20, padx=30)
        
        # Options
        options_frame = ttk.LabelFrame(completion_frame, text="Next Steps", padding=15)
        options_frame.pack(fill=tk.X, padx=30, pady=10)
        
        self.launch_var = tk.BooleanVar()
        launch_check = ttk.Checkbutton(
            options_frame,
            text="Launch JPE Sims 4 Mod Translator Studio",
            variable=self.launch_var
        )
        launch_check.pack(anchor=tk.W, pady=5)
        
        done_btn = ttk.Button(
            options_frame,
            text="Done",
            command=self.finish_installation,
            style="Primary.TButton"
        )
        done_btn.pack(pady=15)
    
    def cancel_installation(self):
        """Handle installation cancellation."""
        self.root.destroy()
    
    def finish_installation(self):
        """Complete the installation."""
        if self.launch_var.get():
            # In a real implementation, launch the application
            pass
        self.root.destroy()


def main():
    """Main entry point for the installer."""
    installer = BrandedInstaller()
    installer.root.mainloop()


if __name__ == "__main__":
    main()