"""
Collaboration UI Components for JPE Sims 4 Mod Translator.

This module provides UI components for managing collaboration features.
"""

import tkinter as tk
from tkinter import ttk
import asyncio
from typing import List, Optional, Dict, Any, Callable
from pathlib import Path

from collaboration.system import CollaborationManager, CollaborationRole
from ui.advanced_ui_components import ModernStatusBar, ModernDialog
from ui.color_manager import ColorManager


class CollaborationUIManager:
    """Manages UI components for collaboration features."""
    
    def __init__(self, main_window: tk.Tk):
        self.main_window = main_window
        self.collaboration_manager = CollaborationManager()
        self.status_bar: Optional[ModernStatusBar] = None
        self.collaborators_frame: Optional[tk.Frame] = None
        self.collaborators_labels: List[tk.Label] = []
        self.connect_dialog: Optional[tk.Toplevel] = None
        self.sentinel_logger = SentinelExceptionLogger()
    
    def setup_collaboration_ui(self, status_bar: ModernStatusBar):
        """Setup collaboration-specific UI elements."""
        self.status_bar = status_bar
        
        # Create collaborators display in status bar
        self.collaborators_frame = tk.Frame(status_bar.status_frame)
        self.collaborators_frame.pack(side=tk.RIGHT, padx=10)
        
        # Add collaborators label
        tk.Label(
            self.collaborators_frame,
            text="Collaborators:",
            font=("TkDefaultFont", 8)
        ).pack(side=tk.LEFT)
        
        # Add a placeholder for collaborator indicators
        self.collaborators_labels = []
    
    def update_collaborators_display(self):
        """Update the display of collaborators."""
        if not self.collaborators_frame:
            return
        
        # Clear existing labels
        for label in self.collaborators_labels:
            label.destroy()
        self.collaborators_labels = []
        
        # Get current collaborators
        collaborators = self.collaboration_manager.get_collaborators()
        
        # Create labels for each collaborator
        for i, collaborator in enumerate(collaborators):
            # Use different styling for self vs others
            is_self = collaborator.get("role") == "self"
            bg_color = "#4a90e2" if is_self else "#2ecc71"  # Blue for self, green for others
            fg_color = "white"
            
            label = tk.Label(
                self.collaborators_frame,
                text=f"● {collaborator['username']}",
                bg=bg_color,
                fg=fg_color,
                font=("TkDefaultFont", 8)
            )
            label.pack(side=tk.LEFT, padx=2)
            self.collaborators_labels.append(label)
    
    async def show_connect_dialog(self):
        """Show a dialog to connect to a collaboration session."""
        if self.connect_dialog:
            self.connect_dialog.lift()
            return
        
        self.connect_dialog = tk.Toplevel(self.main_window)
        self.connect_dialog.title("Connect to Collaboration Session")
        self.connect_dialog.geometry("400x300")
        self.connect_dialog.transient(self.main_window)
        self.connect_dialog.grab_set()
        
        # Center dialog
        self.connect_dialog.geometry("+%d+%d" % (
            self.main_window.winfo_rootx() + 50,
            self.main_window.winfo_rooty() + 50
        ))
        
        # Main frame
        main_frame = ttk.Frame(self.connect_dialog, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Connection options
        server_frame = ttk.LabelFrame(main_frame, text="Server Connection", padding=10)
        server_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(server_frame, text="Server URL:").pack(anchor=tk.W)
        server_url_var = tk.StringVar(value="ws://localhost:8765")
        server_url_entry = ttk.Entry(server_frame, textvariable=server_url_var, width=40)
        server_url_entry.pack(fill=tk.X, pady=(5, 10))
        
        ttk.Label(server_frame, text="Username:").pack(anchor=tk.W)
        username_var = tk.StringVar()
        username_entry = ttk.Entry(server_frame, textvariable=username_var, width=40)
        username_entry.pack(fill=tk.X, pady=(5, 10))
        
        # Project options
        project_frame = ttk.LabelFrame(main_frame, text="Project Options", padding=10)
        project_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(project_frame, text="Project ID:").pack(anchor=tk.W)
        project_id_var = tk.StringVar()
        project_id_entry = ttk.Entry(project_frame, textvariable=project_id_var, width=40)
        project_id_entry.pack(fill=tk.X, pady=(5, 10))
        
        role_var = tk.StringVar(value="editor")
        ttk.Label(project_frame, text="Role:").pack(anchor=tk.W)
        role_combo = ttk.Combobox(
            project_frame,
            textvariable=role_var,
            values=["viewer", "editor", "owner"],
            state="readonly",
            width=37
        )
        role_combo.pack(fill=tk.X, pady=(5, 10))
        
        # Status label
        status_var = tk.StringVar(value="Ready to connect")
        status_label = ttk.Label(main_frame, textvariable=status_var, foreground="blue")
        status_label.pack(pady=5)
        
        # Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(10, 0))
        
        async def connect():
            """Handle connection to collaboration server."""
            server_url = server_url_var.get()
            username = username_var.get()
            project_id = project_id_var.get()
            role = role_var.get()
            
            if not server_url or not username or not project_id:
                status_var.set("Please fill in all fields")
                return
            
            try:
                status_var.set("Connecting...")
                
                # Connect to server
                success = await self.collaboration_manager.connect_to_collaboration(server_url)
                if not success:
                    status_var.set("Connection failed")
                    return
                
                # Join project
                join_success = await self.collaboration_manager.join_project(project_id, username, role)
                if join_success:
                    status_var.set("Connected to collaboration session!")
                    self.update_collaborators_display()
                    
                    # After a short delay, destroy the dialog
                    self.connect_dialog.after(1000, self.connect_dialog.destroy)
                else:
                    status_var.set("Failed to join project")
            
            except Exception as e:
                self.sentinel_logger.log_exception(
                    e,
                    context_info={
                        "server_url": server_url,
                        "username": username,
                        "project_id": project_id
                    }
                )
                status_var.set(f"Connection error: {str(e)}")
        
        async def disconnect():
            """Handle disconnection from collaboration server."""
            try:
                await self.collaboration_manager.leave_project()
                status_var.set("Disconnected from collaboration session")
                self.update_collaborators_display()
            except Exception as e:
                self.sentinel_logger.log_exception(
                    e,
                    context_info={"action": "disconnect"}
                )
                status_var.set(f"Disconnection error: {str(e)}")
        
        ttk.Button(button_frame, text="Connect", command=lambda: asyncio.create_task(connect())).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(button_frame, text="Disconnect", command=lambda: asyncio.create_task(disconnect())).pack(side=tk.LEFT, padx=(0, 5))
        
        ttk.Button(button_frame, text="Cancel", command=self.connect_dialog.destroy).pack(side=tk.RIGHT)
    
    def add_collaboration_menu(self, menubar: tk.Menu):
        """Add collaboration menu to the application menubar."""
        collaboration_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Collaboration", menu=collaboration_menu)
        
        collaboration_menu.add_command(
            label="Connect to Session...",
            command=lambda: asyncio.create_task(self.show_connect_dialog())
        )
        
        collaboration_menu.add_command(
            label="Share Current Project",
            command=self.share_current_project
        )
        
        collaboration_menu.add_separator()
        
        collaboration_menu.add_command(
            label="Show Collaborators",
            command=self.show_collaborators_window
        )
        
        collaboration_menu.add_command(
            label="Invite Collaborator",
            command=self.invite_collaborator
        )
    
    def share_current_project(self):
        """Share the current project with collaborators."""
        # This would typically open a dialog to set up a sharing session
        dialog = ModernDialog(self.main_window, "Share Project")
        
        share_frame = ttk.Frame(dialog.content_frame)
        share_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        ttk.Label(share_frame, text="Share Current Project").pack(anchor=tk.W)
        
        # Project sharing options would go here
        options_frame = ttk.Frame(share_frame)
        options_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        ttk.Label(options_frame, text="Project ID: ").pack(anchor=tk.W)
        project_id_var = tk.StringVar(value=f"project_{int(time.time())}")
        ttk.Entry(options_frame, textvariable=project_id_var, state="readonly").pack(fill=tk.X)
        
        ttk.Label(options_frame, text="Access Level:").pack(anchor=tk.W, pady=(10, 0))
        access_var = tk.StringVar(value="editor")
        access_combo = ttk.Combobox(
            options_frame,
            textvariable=access_var,
            values=["viewer", "editor", "owner"],
            state="readonly"
        )
        access_combo.pack(fill=tk.X)
        
        dialog.add_content(share_frame)
        result = dialog.show()
        
        if result:
            print(f"Sharing project with ID: {project_id_var.get()}, access: {access_var.get()}")
    
    def show_collaborators_window(self):
        """Show a window with the list of collaborators."""
        collab_win = tk.Toplevel(self.main_window)
        collab_win.title("Project Collaborators")
        collab_win.geometry("300x200")
        
        # Center window
        x = self.main_window.winfo_x() + 50
        y = self.main_window.winfo_y() + 50
        collab_win.geometry(f"+{x}+{y}")
        
        # Create treeview for collaborators
        tree = ttk.Treeview(collab_win, columns=("Username", "Role", "Status"), show="headings")
        tree.heading("Username", text="Username")
        tree.heading("Role", text="Role")
        tree.heading("Status", text="Status")
        
        # Add sample data
        collaborators = self.collaboration_manager.get_collaborators()
        for collab in collaborators:
            status = "Online" if collab.get("role") != "self" else "You"
            tree.insert("", "end", values=(collab["username"], collab.get("role", "unknown"), status))
        
        tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
    
    def invite_collaborator(self):
        """Invite a collaborator to the project."""
        # This would open an invitation dialog
        dialog = ModernDialog(self.main_window, "Invite Collaborator")
        
        invite_frame = ttk.Frame(dialog.content_frame)
        invite_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        ttk.Label(invite_frame, text="Invite Collaborator").pack(anchor=tk.W)
        
        email_var = tk.StringVar()
        ttk.Label(invite_frame, text="Email Address:").pack(anchor=tk.W, pady=(10, 0))
        email_entry = ttk.Entry(invite_frame, textvariable=email_var)
        email_entry.pack(fill=tk.X)
        
        access_var = tk.StringVar(value="editor")
        ttk.Label(invite_frame, text="Access Level:").pack(anchor=tk.W, pady=(10, 0))
        access_combo = ttk.Combobox(
            invite_frame,
            textvariable=access_var,
            values=["viewer", "editor", "owner"],
            state="readonly"
        )
        access_combo.pack(fill=tk.X)
        
        dialog.add_content(invite_frame)
        result = dialog.show()
        
        if result:
            print(f"Inviting {email_var.get()} with access level {access_var.get()}")


class RealTimeEditorDecorator:
    """Decorator for editor components to add real-time collaboration features."""
    
    def __init__(self, text_widget: tk.Text, collaboration_manager: CollaborationManager):
        self.text_widget = text_widget
        self.collaboration_manager = collaboration_manager
        self.local_changes_pending = False
        
        # Bind events for collaboration features
        self.text_widget.bind('<KeyPress>', self.on_key_press)
        self.text_widget.bind('<Button-1>', self.on_click)  # For mouse clicks
        self.text_widget.bind('<Motion>', self.on_mouse_move)  # For cursor movement
    
    def on_key_press(self, event):
        """Handle key press events for collaboration."""
        # Schedule a delayed check to see if document was modified
        self.text_widget.after(100, self.check_for_document_changes)
    
    def on_click(self, event):
        """Handle mouse click events for cursor position sharing."""
        # Calculate cursor position
        pos = self.text_widget.index(tk.INSERT)
        line, col = pos.split('.')
        
        # Share cursor position with collaborators
        # In a real implementation, this would send the position to the server
        # For now, just log it
        print(f"Cursor moved to line {line}, column {col}")
    
    def on_mouse_move(self, event):
        """Handle mouse movement events."""
        # We don't necessarily need to report every mouse movement
        # but could use this for more detailed cursor tracking
        pass
    
    def check_for_document_changes(self):
        """Check if the document has changed and send updates to collaborators."""
        # This is a simplified version - in a real implementation, we'd need to track
        # the actual changes made to the document and send them to collaborators
        # For now, we'll just log the event
        if self.local_changes_pending:
            # In a real implementation, we would send the changes to collaborators
            content = self.text_widget.get("1.0", tk.END)
            print(f"Local changes detected, content length: {len(content)}")
            self.local_changes_pending = False


# Global instance
collaboration_ui_manager = CollaborationUIManager(None)  # Will be initialized with main window later