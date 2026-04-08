"""
Advanced UI Components for JPE Sims 4 Mod Translator.

This module provides sophisticated UI components built with ttkbootstrap
to enhance the user experience with modern, professional interfaces.
"""

import tkinter as tk
from tkinter import ttk
from typing import Callable, Optional, List, Any, Dict
import json
from datetime import datetime
from pathlib import Path

# Try to import ttkbootstrap components
try:
    import ttkbootstrap as ttkb
    from ttkbootstrap import Style
    from ttkbootstrap.widgets import Meter, DateEntry, Floodgauge
    ttkb_available = True
except ImportError:
    # ttkbootstrap is not available, set flag and use tkinter/ttk as fallback
    ttkb_available = False
    ttkb = None  # Use tkinter/ttk widgets directly when needed


def get_ttkb_or_ttk_widget(widget_type):
    """Get the ttkbootstrap version of a widget if available, otherwise tk/ttk version."""
    if ttkb_available:
        if widget_type == "Frame":
            return ttkb.Frame
        elif widget_type == "Label":
            return ttkb.Label
        elif widget_type == "Button":
            return ttkb.Button
        elif widget_type == "Entry":
            return ttkb.Entry
        elif widget_type == "Combobox":
            return ttkb.Combobox
        elif widget_type == "Notebook":
            return ttkb.Notebook
        elif widget_type == "Progressbar":
            return ttkb.Progressbar
        elif widget_type == "Checkbutton":
            return ttkb.Checkbutton
        elif widget_type == "Treeview":
            return ttkb.Treeview
        elif widget_type == "ScrollableFrame":
            return lambda parent: ttkb.Frame(parent)  # Simplified
        elif widget_type == "Spinbox":
            return ttkb.Spinbox
        else:
            # Default to tk/ttk
            if widget_type == "Frame":
                return ttk.Frame
            elif widget_type == "Label":
                return ttk.Label
            elif widget_type == "Button":
                return ttk.Button
            elif widget_type == "Entry":
                return ttk.Entry
            elif widget_type == "Combobox":
                return ttk.Combobox
            elif widget_type == "Notebook":
                return ttk.Notebook
            elif widget_type == "Progressbar":
                return ttk.Progressbar
            elif widget_type == "Checkbutton":
                return ttk.Checkbutton
            elif widget_type == "Treeview":
                return ttk.Treeview
            elif widget_type == "Spinbox":
                return tk.Spinbox
            else:
                return tk.Frame
    else:
        # Always return tk/ttk if ttkbootstrap is not available
        if widget_type == "Frame":
            return ttk.Frame
        elif widget_type == "Label":
            return ttk.Label
        elif widget_type == "Button":
            return ttk.Button
        elif widget_type == "Entry":
            return ttk.Entry
        elif widget_type == "Combobox":
            return ttk.Combobox
        elif widget_type == "Notebook":
            return ttk.Notebook
        elif widget_type == "Progressbar":
            return ttk.Progressbar
        elif widget_type == "Checkbutton":
            return ttk.Checkbutton
        elif widget_type == "Treeview":
            return ttk.Treeview
        elif widget_type == "Spinbox":
            return tk.Spinbox
        else:
            return tk.Frame


class ModernMenuBar:
    """A modern menu bar with ttkbootstrap styling."""
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        self.menubar = tk.Menu(parent, tearoff=0)
        self.parent.configure(menu=self.menubar)
        
        # Configure menu appearance with ttkbootstrap style if available
        if ttkb_available:
            try:
                style = Style()
                self.menubar.configure(bg=style.colors.inputbg, fg=style.colors.inputfg)
            except:
                # Use default colors if ttkbootstrap style isn't available
                pass
    
    def add_menu(self, label: str, items: List[Dict[str, Any]]) -> tk.Menu:
        """Add a menu with labeled items."""
        submenu = tk.Menu(self.menubar, tearoff=0)
        
        for item in items:
            if item.get('separator'):
                submenu.add_separator()
            else:
                command = item.get('command')
                accelerator = item.get('accelerator', '')
                label_text = item.get('label', '')
                
                if 'submenu' in item:
                    sub_submenu = tk.Menu(submenu, tearoff=0)
                    for sub_item in item['submenu']:
                        sub_submenu.add_command(
                            label=sub_item.get('label', ''),
                            command=sub_item.get('command'),
                            accelerator=sub_item.get('accelerator', '')
                        )
                    submenu.add_cascade(label=label_text, menu=sub_submenu)
                else:
                    submenu.add_command(
                        label=label_text,
                        command=command,
                        accelerator=accelerator
                    )
        
        self.menubar.add_cascade(label=label, menu=submenu)
        return submenu


class ModernStatusBar:
    """A modern status bar with ttkbootstrap styling."""
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        Frame = get_ttkb_or_ttk_widget("Frame")
        self.status_frame = Frame(parent)
        self.status_frame.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Status label
        Label = get_ttkb_or_ttk_widget("Label")
        if ttkb_available:
            self.status_label = Label(
                self.status_frame,
                text="Ready",
                bootstyle="secondary"
            )
        else:
            self.status_label = Label(
                self.status_frame,
                text="Ready"
            )
        self.status_label.pack(side=tk.LEFT, padx=5, pady=2)
        
        # Progress indicator (hidden by default)
        Progressbar = get_ttkb_or_ttk_widget("Progressbar")
        self.progress_var = tk.DoubleVar()
        if ttkb_available:
            self.progress_bar = Progressbar(
                self.status_frame,
                variable=self.progress_var,
                bootstyle="success",
                length=150
            )
        else:
            self.progress_bar = Progressbar(
                self.status_frame,
                variable=self.progress_var,
                length=150
            )
        self.progress_bar.pack(side=tk.RIGHT, padx=5, pady=2)
        self.progress_bar.pack_forget()  # Hide by default
        
        # Position label
        if ttkb_available:
            self.position_label = Label(
                self.status_frame,
                text="Ln 1, Col 1",
                bootstyle="secondary"
            )
        else:
            self.position_label = Label(
                self.status_frame,
                text="Ln 1, Col 1"
            )
        self.position_label.pack(side=tk.RIGHT, padx=5, pady=2)
    
    def set_status(self, text: str):
        """Set the status text."""
        self.status_label.config(text=text)
    
    def set_position(self, line: int, col: int):
        """Set the position indicator."""
        self.position_label.config(text=f"Ln {line}, Col {col}")
    
    def show_progress(self):
        """Show the progress bar."""
        self.progress_bar.pack(side=tk.RIGHT, padx=5, pady=2)
    
    def hide_progress(self):
        """Hide the progress bar."""
        self.progress_bar.pack_forget()
    
    def update_progress(self, value: float):
        """Update the progress bar value (0-100)."""
        self.progress_var.set(value)


class ModernTabView:
    """A modern tab view with ttkbootstrap styling."""
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        Notebook = get_ttkb_or_ttk_widget("Notebook")
        if ttkb_available:
            self.notebook = Notebook(parent)
        else:
            self.notebook = Notebook(parent)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.tabs = {}
    
    def add_tab(self, name: str, content_creator: Callable[[ttk.Frame], tk.Widget]) -> ttk.Frame:
        """Add a tab with content created by the provided function."""
        Frame = get_ttkb_or_ttk_widget("Frame")
        tab_frame = Frame(self.notebook)
        
        # Create content using the provided function
        content_widget = content_creator(tab_frame)
        content_widget.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.notebook.add(tab_frame, text=name)
        self.tabs[name] = tab_frame
        return tab_frame
    
    def select_tab(self, name: str):
        """Select a specific tab."""
        if name in self.tabs:
            self.notebook.select(self.tabs[name])
    
    def close_tab(self, name: str):
        """Close a specific tab."""
        if name in self.tabs:
            tab_idx = None
            for i in range(self.notebook.index("end")):
                if self.notebook.tab(i, "text") == name:
                    tab_idx = i
                    break
            
            if tab_idx is not None:
                self.notebook.forget(tab_idx)
                del self.tabs[name]


class ModernToolbox:
    """A modern toolbox with categorized tools using ttkbootstrap styling."""
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        Frame = get_ttkb_or_ttk_widget("Frame")
        self.toolbox_frame = Frame(parent)
        self.toolbox_frame.pack(side=tk.LEFT, fill=tk.Y, padx=5, pady=5)
        
        # Create collapsible sections for different tool categories
        self.sections = {}
    
    def add_section(self, name: str) -> ttk.Frame:
        """Add a collapsible section to the toolbox."""
        Frame = get_ttkb_or_ttk_widget("Frame")
        Button = get_ttkb_or_ttk_widget("Button")
        
        # Section frame
        section_frame = Frame(self.toolbox_frame)
        section_frame.pack(fill=tk.X, pady=2)
        
        # Section header with toggle
        header_frame = Frame(section_frame)
        header_frame.pack(fill=tk.X)
        
        if ttkb_available:
            toggle_btn = Button(
                header_frame,
                text=f"▼ {name}",
                bootstyle="outline-secondary",
                width=20
            )
        else:
            toggle_btn = Button(
                header_frame,
                text=f"▼ {name}",
                width=20
            )
        toggle_btn.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Content frame (initially collapsed)
        content_frame = Frame(section_frame)
        # content_frame.pack(fill=tk.BOTH, expand=True, padx=0, pady=2)  # Hidden initially
        
        # Toggle functionality
        is_expanded = tk.BooleanVar(value=False)
        
        def toggle_content():
            is_expanded.set(not is_expanded.get())
            if is_expanded.get():
                content_frame.pack(fill=tk.BOTH, expand=True, padx=0, pady=2)
                if ttkb_available:
                    toggle_btn.config(text=f"▲ {name}")
                else:
                    toggle_btn.config(text=f"▲ {name}")
            else:
                content_frame.pack_forget()
                if ttkb_available:
                    toggle_btn.config(text=f"▼ {name}")
                else:
                    toggle_btn.config(text=f"▼ {name}")
        
        toggle_btn.config(command=toggle_content)
        
        self.sections[name] = {
            'header': header_frame,
            'content': content_frame,
            'toggle_btn': toggle_btn,
            'is_expanded': is_expanded
        }
        
        return content_frame
    
    def add_tool(self, section_name: str, tool_name: str, command: Callable, icon: str = None):
        """Add a tool to a specific section."""
        if section_name not in self.sections:
            content_frame = self.add_section(section_name)
        else:
            content_frame = self.sections[section_name]['content']
        
        Button = get_ttkb_or_ttk_widget("Button")
        # Create tool button
        tool_text = f" {tool_name}" if not icon else f"{icon} {tool_name}"
        if ttkb_available:
            tool_btn = Button(
                content_frame,
                text=tool_text,
                command=command,
                bootstyle="outline-secondary",
                width=20
            )
        else:
            tool_btn = Button(
                content_frame,
                text=tool_text,
                command=command,
                width=20
            )
        tool_btn.pack(fill=tk.X, pady=1)


class ModernPropertyPanel:
    """A modern property panel with ttkbootstrap styling."""
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        Frame = get_ttkb_or_ttk_widget("Frame")
        self.panel_frame = Frame(parent)
        self.panel_frame.pack(side=tk.RIGHT, fill=tk.Y, padx=5, pady=5)
        
        # Title
        Label = get_ttkb_or_ttk_widget("Label")
        if ttkb_available:
            title_label = Label(
                self.panel_frame,
                text="Properties",
                font=("TkDefaultFont", 10, "bold"),
                bootstyle="primary"
            )
        else:
            title_label = Label(
                self.panel_frame,
                text="Properties",
                font=("TkDefaultFont", 10, "bold")
            )
        title_label.pack(fill=tk.X, pady=(0, 5))
        
        # Scrollable property area
        self.canvas = tk.Canvas(self.panel_frame, highlightthickness=0)
        if ttkb_available:
            scrollbar = ttkb.Scrollbar(self.panel_frame, orient="vertical", command=self.canvas.yview)
        else:
            scrollbar = ttk.Scrollbar(self.panel_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = Frame(self.canvas)
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        self.canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Properties dictionary
        self.properties = {}
    
    def add_property(self, name: str, value_type: str = "text", initial_value: Any = ""):
        """Add a property with the specified type."""
        Frame = get_ttkb_or_ttk_widget("Frame")
        prop_frame = Frame(self.scrollable_frame)
        prop_frame.pack(fill=tk.X, pady=2)
        
        Label = get_ttkb_or_ttk_widget("Label")
        Entry = get_ttkb_or_ttk_widget("Entry")
        Combobox = get_ttkb_or_ttk_widget("Combobox")
        Spinbox = get_ttkb_or_ttk_widget("Spinbox")
        
        # Property name
        if ttkb_available:
            name_label = Label(prop_frame, text=f"{name}:", width=12, anchor="w", bootstyle="secondary")
        else:
            name_label = Label(prop_frame, text=f"{name}:", width=12, anchor="w")
        name_label.pack(side=tk.LEFT, padx=(0, 5))
        
        # Property value based on type
        if value_type == "text":
            var = tk.StringVar(value=str(initial_value))
            if ttkb_available:
                entry = Entry(prop_frame, textvariable=var, width=15)
            else:
                entry = Entry(prop_frame, textvariable=var, width=15)
            entry.pack(side=tk.LEFT)
        elif value_type == "boolean":
            var = tk.BooleanVar(value=bool(initial_value))
            if ttkb_available:
                entry = ttkb.Checkbutton(prop_frame, variable=var)
            else:
                entry = ttk.Checkbutton(prop_frame, variable=var)
            entry.pack(side=tk.LEFT)
        elif value_type == "choice":
            var = tk.StringVar(value=str(initial_value))
            if ttkb_available:
                entry = Combobox(prop_frame, textvariable=var, values=initial_value, state="readonly", width=12)
            else:
                entry = Combobox(prop_frame, textvariable=var, values=initial_value, state="readonly", width=12)
            entry.pack(side=tk.LEFT)
        elif value_type == "number":
            var = tk.DoubleVar(value=float(initial_value))
            if ttkb_available:
                entry = Spinbox(prop_frame, textvariable=var, from_=0, to=100, width=12)
            else:
                entry = Spinbox(prop_frame, textvariable=var, from_=0, to=100, width=12)
            entry.pack(side=tk.LEFT)
        else:  # Default to text
            var = tk.StringVar(value=str(initial_value))
            if ttkb_available:
                entry = Entry(prop_frame, textvariable=var, width=15)
            else:
                entry = Entry(prop_frame, textvariable=var, width=15)
            entry.pack(side=tk.LEFT)
        
        # Store property
        self.properties[name] = {"variable": var, "widget": entry, "type": value_type}
        return var
    
    def get_property(self, name: str) -> Any:
        """Get the value of a property."""
        if name in self.properties:
            return self.properties[name]["variable"].get()
        return None
    
    def set_property(self, name: str, value: Any):
        """Set the value of a property."""
        if name in self.properties:
            self.properties[name]["variable"].set(value)


class ModernDialog:
    """A modern dialog using ttkbootstrap styling."""
    
    def __init__(self, parent: tk.Widget, title: str = "Dialog"):
        self.parent = parent
        self.result = None
        
        # Create toplevel window
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Center dialog
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx()+50, parent.winfo_rooty()+50))
        
        Frame = get_ttkb_or_ttk_widget("Frame")
        Button = get_ttkb_or_ttk_widget("Button")
        
        # Create main frame with ttkbootstrap styling
        self.main_frame = Frame(self.dialog)
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Content frame
        self.content_frame = Frame(self.main_frame)
        self.content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Button frame
        self.button_frame = Frame(self.main_frame)
        self.button_frame.pack(fill=tk.X, pady=(10, 0))
        
        # Add default buttons
        if ttkb_available:
            self.ok_btn = Button(
                self.button_frame,
                text="OK",
                command=self._ok_pressed,
                bootstyle="success"
            )
        else:
            self.ok_btn = Button(
                self.button_frame,
                text="OK",
                command=self._ok_pressed
            )
        self.ok_btn.pack(side=tk.RIGHT, padx=(5, 0))
        
        if ttkb_available:
            self.cancel_btn = Button(
                self.button_frame,
                text="Cancel", 
                command=self._cancel_pressed,
                bootstyle="secondary"
            )
        else:
            self.cancel_btn = Button(
                self.button_frame,
                text="Cancel", 
                command=self._cancel_pressed
            )
        self.cancel_btn.pack(side=tk.RIGHT)
    
    def add_content(self, widget: tk.Widget):
        """Add content to the dialog."""
        widget.pack(in_=self.content_frame, fill=tk.BOTH, expand=True)
    
    def _ok_pressed(self):
        """Handle OK button press."""
        self.result = True
        self.dialog.destroy()
    
    def _cancel_pressed(self):
        """Handle Cancel button press."""
        self.result = False
        self.dialog.destroy()
    
    def show(self) -> bool:
        """Show the dialog and return the result."""
        self.dialog.wait_window()
        return self.result


class ModernDataGrid:
    """A modern data grid with ttkbootstrap styling."""
    
    def __init__(self, parent: tk.Widget, columns: List[str]):
        self.parent = parent
        
        Frame = get_ttkb_or_ttk_widget("Frame")
        Treeview = get_ttkb_or_ttk_widget("Treeview")
        
        # Create frame for treeview and scrollbar
        self.frame = Frame(parent)
        self.frame.pack(fill=tk.BOTH, expand=True)
        
        # Create treeview with ttkbootstrap styling
        self.tree = Treeview(
            self.frame,
            columns=columns,
            show="headings",
            height=10
        )
        
        # Configure column headings
        for col in columns:
            self.tree.heading(col, text=col, anchor=tk.W)
            self.tree.column(col, width=100, anchor=tk.W)
        
        # Add scrollbars
        if ttkb_available:
            v_scrollbar = ttkb.Scrollbar(self.frame, orient="vertical", command=self.tree.yview)
            h_scrollbar = ttkb.Scrollbar(self.frame, orient="horizontal", command=self.tree.xview)
        else:
            v_scrollbar = ttk.Scrollbar(self.frame, orient="vertical", command=self.tree.yview)
            h_scrollbar = ttk.Scrollbar(self.frame, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
        
        # Grid layout
        self.tree.grid(row=0, column=0, sticky="nsew")
        v_scrollbar.grid(row=0, column=1, sticky="ns")
        h_scrollbar.grid(row=1, column=0, sticky="ew")
        
        self.frame.grid_rowconfigure(0, weight=1)
        self.frame.grid_columnconfigure(0, weight=1)
    
    def add_row(self, values: List[Any]):
        """Add a row of data to the grid."""
        self.tree.insert("", tk.END, values=values)
    
    def clear(self):
        """Clear all data from the grid."""
        for item in self.tree.get_children():
            self.tree.delete(item)
    
    def bind_selection(self, callback: Callable):
        """Bind a callback to row selection events."""
        def on_select(event):
            selected_items = self.tree.selection()
            if selected_items:
                item = selected_items[0]
                values = self.tree.item(item)["values"]
                callback(values)
        
        self.tree.bind("<<TreeviewSelect>>", on_select)


class ModernProgressBar:
    """A modern progress bar with ttkbootstrap styling."""
    
    def __init__(self, parent: tk.Widget, mode: str = "determinate"):
        self.parent = parent
        Progressbar = get_ttkb_or_ttk_widget("Progressbar")
        
        if ttkb_available:
            bootstyle = "success-striped" if mode == "indeterminate" else "success"
            self.progress = Progressbar(
                parent,
                mode=mode,
                bootstyle=bootstyle
            )
        else:
            self.progress = Progressbar(
                parent,
                mode=mode
            )
        self.progress.pack(fill=tk.X, padx=5, pady=5)
        self.current_value = 0
    
    def update(self, value: float):
        """Update the progress bar value (0-100)."""
        self.current_value = value
        if self.progress.cget("mode") == "determinate":
            self.progress['value'] = value
    
    def start(self):
        """Start the progress bar (for indeterminate mode)."""
        if self.progress.cget("mode") == "indeterminate":
            self.progress.start()
    
    def stop(self):
        """Stop the progress bar (for indeterminate mode)."""
        if self.progress.cget("mode") == "indeterminate":
            self.progress.stop()


class ModernNotificationPanel:
    """A modern notification panel with ttkbootstrap styling."""
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        self.notifications = []
        
        Frame = get_ttkb_or_ttk_widget("Frame")
        self.frame = Frame(parent)
        self.frame.pack(fill=tk.X, pady=5)
        
        # Notification area
        self.canvas = tk.Canvas(self.frame, height=100, highlightthickness=0)
        if ttkb_available:
            scrollbar = ttkb.Scrollbar(self.frame, orient="vertical", command=self.canvas.yview)
        else:
            scrollbar = ttk.Scrollbar(self.frame, orient="vertical", command=self.canvas.yview)
        self.notifications_frame = Frame(self.canvas)
        
        self.notifications_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.create_window((0, 0), window=self.notifications_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        self.canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
    
    def add_notification(self, message: str, level: str = "info", duration: int = 5000):
        """Add a notification with specified level and duration."""
        Frame = get_ttkb_or_ttk_widget("Frame")
        Label = get_ttkb_or_ttk_widget("Label")
        Button = get_ttkb_or_ttk_widget("Button")
        
        # Create notification frame
        if ttkb_available:
            # Level-specific styling
            if level.lower() == "error":
                style = "danger-inverse"
            elif level.lower() == "warning":
                style = "warning-inverse" 
            elif level.lower() == "success":
                style = "success-inverse"
            else:  # info
                style = "info-inverse"
            
            notify_frame = Frame(self.notifications_frame, bootstyle=style)
        else:
            notify_frame = Frame(self.notifications_frame)
        notify_frame.pack(fill=tk.X, padx=2, pady=2)
        
        # Notification text
        if ttkb_available:
            notify_label = Label(
                notify_frame,
                text=message,
                bootstyle=style,
                font=("TkDefaultFont", 9)
            )
        else:
            notify_label = Label(
                notify_frame,
                text=message,
                font=("TkDefaultFont", 9)
            )
        notify_label.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5, pady=3)
        
        # Dismiss button
        if ttkb_available:
            dismiss_btn = Button(
                notify_frame,
                text="×",
                command=lambda: self.dismiss_notification(notify_frame),
                bootstyle="secondary",
                width=2
            )
        else:
            dismiss_btn = Button(
                notify_frame,
                text="×",
                command=lambda: self.dismiss_notification(notify_frame),
                width=2
            )
        dismiss_btn.pack(side=tk.RIGHT, padx=2)
        
        # Add to notifications list
        self.notifications.append({
            'frame': notify_frame,
            'message': message,
            'level': level,
            'timer': None
        })
        
        # Schedule auto-dismissal
        if duration > 0:
            timer_id = self.notifications_frame.after(duration, 
                                   lambda: self.dismiss_notification(notify_frame))
            self.notifications[-1]['timer'] = timer_id
    
    def dismiss_notification(self, frame):
        """Dismiss a specific notification."""
        frame.destroy()
        # Remove from notifications list
        for i, notify in enumerate(self.notifications):
            if notify['frame'] == frame:
                if notify['timer']:
                    self.notifications_frame.after_cancel(notify['timer'])
                del self.notifications[i]
                break


# Example usage and demonstration
def create_modern_ui_demo():
    """Create a demonstration of the modern UI components."""
    
    # Create root window
    root = tk.Tk()
    root.title("JPE Sims 4 Mod Translator - Modern UI Demo")
    root.geometry("1000x700")
    
    # If ttkbootstrap is available, use a theme
    if ttkb_available:
        style = Style(theme="flatly")
    
    # Create main application structure
    main_paned = ttk.PanedWindow(root, orient=tk.HORIZONTAL)
    main_paned.pack(fill=tk.BOTH, expand=True)
    
    # Left panel (toolbox)
    left_frame = tk.Frame()  # Use tk.Frame as base for paned window
    main_paned.add(left_frame, weight=1)
    
    # Center panel (main content)
    center_frame = tk.Frame()  # Use tk.Frame as base for paned window
    main_paned.add(center_frame, weight=3)
    
    # Right panel (properties)
    right_frame = tk.Frame()  # Use tk.Frame as base for paned window
    main_paned.add(right_frame, weight=1)
    
    # Create menu bar
    menu_bar = ModernMenuBar(root)
    menu_bar.add_menu("File", [
        {"label": "New Project", "command": lambda: print("New project")},
        {"label": "Open Project", "command": lambda: print("Open project")},
        {"separator": True},
        {"label": "Exit", "command": root.quit}
    ])
    
    menu_bar.add_menu("Edit", [
        {"label": "Undo", "accelerator": "Ctrl+Z"},
        {"label": "Redo", "accelerator": "Ctrl+Y"},
    ])
    
    # Create status bar
    status_bar = ModernStatusBar(root)
    status_bar.set_status("JPE Sims 4 Mod Translator - Ready")
    
    # Create toolbox
    toolbox = ModernToolbox(left_frame)
    
    # Add sections to toolbox
    general_tools = toolbox.add_section("General Tools")
    if ttkb_available:
        ttkb.Button(general_tools, text="Select Tool", bootstyle="outline-primary").pack(fill=tk.X, pady=1)
        ttkb.Button(general_tools, text="Move Tool", bootstyle="outline-primary").pack(fill=tk.X, pady=1)
        ttkb.Button(general_tools, text="Resize Tool", bootstyle="outline-primary").pack(fill=tk.X, pady=1)
        
        mod_tools = toolbox.add_section("Mod Tools")
        ttkb.Button(mod_tools, text="Create Interaction", bootstyle="outline-success").pack(fill=tk.X, pady=1)
        ttkb.Button(mod_tools, text="Create Buff", bootstyle="outline-success").pack(fill=tk.X, pady=1)
        ttkb.Button(mod_tools, text="Create Trait", bootstyle="outline-success").pack(fill=tk.X, pady=1)
    else:
        ttk.Button(general_tools, text="Select Tool").pack(fill=tk.X, pady=1)
        ttk.Button(general_tools, text="Move Tool").pack(fill=tk.X, pady=1)
        ttk.Button(general_tools, text="Resize Tool").pack(fill=tk.X, pady=1)
        
        mod_tools = toolbox.add_section("Mod Tools")
        ttk.Button(mod_tools, text="Create Interaction").pack(fill=tk.X, pady=1)
        ttk.Button(mod_tools, text="Create Buff").pack(fill=tk.X, pady=1)
        ttk.Button(mod_tools, text="Create Trait").pack(fill=tk.X, pady=1)
    
    # Create property panel
    prop_panel = ModernPropertyPanel(right_frame)
    prop_panel.add_property("Name", "text", "MyCustomMod")
    prop_panel.add_property("Author", "text", "Modder123")
    prop_panel.add_property("Enabled", "boolean", True)
    prop_panel.add_property("Difficulty", "choice", ["Easy", "Medium", "Hard"])
    prop_panel.add_property("Version", "text", "1.0.0")
    
    # Create tab view in center
    tab_view = ModernTabView(center_frame)
    
    def create_editor_content(parent):
        Frame = get_ttkb_or_ttk_widget("Frame")
        editor_frame = Frame(parent)
        
        # Create a text editor area
        text_frame = Frame(editor_frame)
        text_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        text_widget = tk.Text(text_frame, wrap=tk.WORD)
        if ttkb_available:
            v_scroll = ttkb.Scrollbar(text_frame, orient=tk.VERTICAL, command=text_widget.yview)
            h_scroll = ttkb.Scrollbar(text_frame, orient=tk.HORIZONTAL, command=text_widget.xview)
        else:
            v_scroll = ttk.Scrollbar(text_frame, orient=tk.VERTICAL, command=text_widget.yview)
            h_scroll = ttk.Scrollbar(text_frame, orient=tk.HORIZONTAL, command=text_widget.xview)
        
        text_widget.configure(yscrollcommand=v_scroll.set, xscrollcommand=h_scroll.set)
        
        text_widget.grid(row=0, column=0, sticky="nsew")
        v_scroll.grid(row=0, column=1, sticky="ns")
        h_scroll.grid(row=1, column=0, sticky="ew")
        
        text_frame.grid_rowconfigure(0, weight=1)
        text_frame.grid_columnconfigure(0, weight=1)
        
        # Add sample text
        sample_text = """define interaction GreetNeighbor
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
        text_widget.insert("1.0", sample_text)
        
        return editor_frame
    
    def create_preview_content(parent):
        Frame = get_ttkb_or_ttk_widget("Frame")
        preview_frame = Frame(parent)
        
        # Add a modern data grid
        grid = ModernDataGrid(preview_frame, ["Property", "Value", "Type"])
        grid.add_row(["name", "GreetNeighborInteraction", "string"])
        grid.add_row(["display_name", "Greet Neighbor", "string"])
        grid.add_row(["description", "Politely greet a nearby neighbor", "string"])
        grid.add_row(["target", "Actor", "reference"])
        
        return preview_frame
    
    def create_logs_content(parent):
        Frame = get_ttkb_or_ttk_widget("Frame")
        logs_frame = Frame(parent)
        
        # Add a text widget for logs
        logs_text = tk.Text(logs_frame, wrap=tk.WORD, height=20)
        if ttkb_available:
            logs_scroll = ttkb.Scrollbar(logs_frame, orient=tk.VERTICAL, command=logs_text.yview)
        else:
            logs_scroll = ttk.Scrollbar(logs_frame, orient=tk.VERTICAL, command=logs_text.yview)
        logs_text.configure(yscrollcommand=logs_scroll.set)
        
        logs_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        logs_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Add sample logs
        sample_logs = """[INFO] 2023-06-15 10:30:15 - JPE Sims 4 Mod Translator started
[INFO] 2023-06-15 10:30:16 - Loading project: MyCustomMod
[DEBUG] 2023-06-15 10:30:17 - Parsing interaction: GreetNeighbor
[SUCCESS] 2023-06-15 10:30:18 - Successfully parsed interaction
[INFO] 2023-06-15 10:30:19 - Validating mod structure
[SUCCESS] 2023-06-15 10:30:20 - All validations passed
[INFO] 2023-06-15 10:30:21 - Building mod package
[SUCCESS] 2023-06-15 10:30:25 - Mod package built successfully: MyCustomMod.package"""
        
        logs_text.insert("1.0", sample_logs)
        logs_text.config(state=tk.DISABLED)
        
        return logs_frame
    
    tab_view.add_tab("Editor", create_editor_content)
    tab_view.add_tab("Preview", create_preview_content)
    tab_view.add_tab("Logs", create_logs_content)
    
    # Create notification panel
    notification_panel = ModernNotificationPanel(root)
    notification_panel.add_notification("Welcome to JPE Sims 4 Mod Translator!", "info", 3000)
    notification_panel.add_notification("New update available: Version 1.1.0", "warning", 5000)
    
    # Add a progress bar for demonstration
    progress_frame = ttk.Frame(root)
    progress_frame.pack(fill=tk.X, padx=5, pady=5)
    
    ttk.Label(progress_frame, text="Build Progress:").pack(side=tk.LEFT)
    build_progress = ModernProgressBar(progress_frame, mode="determinate")
    build_progress.update(35)
    
    return root


if __name__ == "__main__":
    app = create_modern_ui_demo()
    app.mainloop()