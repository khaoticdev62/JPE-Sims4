"""
Mobile and Cross-Platform Components for JPE Sims 4 Mod Translator.

This module provides components specifically designed for mobile interfaces
and cross-platform compatibility.
"""

import tkinter as tk
from tkinter import ttk
import sys
import platform
from pathlib import Path
from typing import Dict, List, Optional, Callable, Any, Tuple
from dataclasses import dataclass
import json


@dataclass
class PlatformInfo:
    """Information about the current platform."""
    name: str
    version: str
    architecture: str
    platform_details: str


class PlatformAdapter:
    """Adapter for platform-specific UI behaviors and styling."""
    
    def __init__(self):
        self.current_platform = self._detect_platform()
        self.platform_config = self._get_platform_config(self.current_platform)
    
    def _detect_platform(self) -> PlatformInfo:
        """Detect the current platform and return platform information."""
        system = platform.system().lower()
        version = platform.version()
        architecture = platform.architecture()[0]
        platform_details = platform.platform()
        
        return PlatformInfo(
            name=system,
            version=version,
            architecture=architecture,
            platform_details=platform_details
        )
    
    def _get_platform_config(self, platform_info: PlatformInfo) -> Dict[str, Any]:
        """Get configuration settings for the specific platform."""
        configs = {
            "windows": {
                "default_font": ("Segoe UI", 10),
                "scaling_factor": 1.0,
                "touch_support": False,
                "tablet_mode": False,
                "window_decorations": True,
                "menu_style": "native"
            },
            "darwin": {  # macOS
                "default_font": ("SF Pro Display", 12),
                "scaling_factor": 1.0,
                "touch_support": False,
                "tablet_mode": False,
                "window_decorations": True,
                "menu_style": "native"
            },
            "linux": {
                "default_font": ("Ubuntu", 10),
                "scaling_factor": 1.0,
                "touch_support": False,
                "tablet_mode": False,
                "window_decorations": True,
                "menu_style": "native"
            },
            "android": {
                "default_font": ("Roboto", 14),
                "scaling_factor": 1.5,
                "touch_support": True,
                "tablet_mode": False,
                "window_decorations": False,
                "menu_style": "hamburger"
            },
            "ios": {
                "default_font": ("SF Pro Display", 16),
                "scaling_factor": 1.8,
                "touch_support": True,
                "tablet_mode": False,
                "window_decorations": False,
                "menu_style": "hamburger"
            }
        }
        
        # Default config
        default_config = {
            "default_font": ("TkDefaultFont", 10),
            "scaling_factor": 1.0,
            "touch_support": False,
            "tablet_mode": False,
            "window_decorations": True,
            "menu_style": "native"
        }
        
        return configs.get(platform_info.name, default_config)
    
    def get_optimal_font_size(self, base_size: int) -> int:
        """Get the optimal font size for the current platform."""
        scaling_factor = self.platform_config.get("scaling_factor", 1.0)
        return int(base_size * scaling_factor)
    
    def is_touch_device(self) -> bool:
        """Check if the current platform is a touch-enabled device."""
        return self.platform_config.get("touch_support", False)
    
    def get_native_widget_style(self):
        """Get the appropriate widget style for the platform."""
        if self.current_platform.name == "darwin":  # macOS
            return {"relief": tk.FLAT}
        elif self.current_platform.name == "windows":
            return {"relief": tk.RAISED}
        else:  # Linux and others
            return {"relief": tk.RAISED}


class ResponsiveLayout:
    """Helper for creating responsive layouts that adapt to different screen sizes."""

    def __init__(self, root: Optional[tk.Widget] = None):
        self.root = root
        self.breakpoints = {
            "mobile": 480,
            "tablet": 768,
            "desktop": 1024,
            "large_desktop": 1440
        }
        if root:
            self.current_layout = self._get_current_layout()
        else:
            self.current_layout = "desktop"  # Default layout

    def _get_current_layout(self) -> str:
        """Determine the current layout based on window size."""
        try:
            width = self.root.winfo_width()
        except tk.TclError:
            # If window isn't mapped yet, use a default
            width = 800
        except AttributeError:
            # If root is None, use default
            width = 800

        if width < self.breakpoints["mobile"]:
            return "mobile"
        elif width < self.breakpoints["tablet"]:
            return "tablet"
        elif width < self.breakpoints["desktop"]:
            return "desktop"
        else:
            return "large_desktop"
    
    def _get_current_layout(self) -> str:
        """Determine the current layout based on window size."""
        width = self.root.winfo_width()
        
        if width < self.breakpoints["mobile"]:
            return "mobile"
        elif width < self.breakpoints["tablet"]:
            return "mobile"
        elif width < self.breakpoints["desktop"]:
            return "tablet"
        elif width < self.breakpoints["large_desktop"]:
            return "desktop"
        else:
            return "large_desktop"
    
    def adapt_to_layout(self, widget_configs: Dict[str, Dict[str, Any]], 
                       layout: Optional[str] = None) -> Dict[str, Any]:
        """Adapt widget configurations based on the current layout."""
        if layout is None:
            layout = self.current_layout
        
        config = widget_configs.get(layout, {})
        
        # Apply base configuration first
        base_config = widget_configs.get("base", {})
        final_config = base_config.copy()
        final_config.update(config)
        
        return final_config


class MobileOptimizedWidgets:
    """Collection of widgets optimized for mobile/touch interfaces."""
    
    def __init__(self, platform_adapter: PlatformAdapter):
        self.platform_adapter = platform_adapter
    
    def create_touch_friendly_button(self, parent: tk.Widget, text: str, 
                                   command: Callable, size: str = "normal") -> tk.Widget:
        """Create a button optimized for touch interfaces."""
        # Determine size based on platform and request
        if self.platform_adapter.is_touch_device():
            # For touch devices, make buttons larger
            font_size = self.platform_adapter.get_optimal_font_size(
                12 if size == "large" else 10 if size == "small" else 10
            )
            padding = 15 if size == "large" else 10
        else:
            font_size = self.platform_adapter.get_optimal_font_size(
                10 if size == "large" else 8 if size == "small" else 9
            )
            padding = 8 if size == "large" else 5
        
        # Use platform-appropriate font
        font_tuple = (self.platform_adapter.platform_config["default_font"][0], font_size)
        
        # Create the button
        if sys.platform.startswith("darwin"):  # macOS
            button = tk.Button(
                parent,
                text=text,
                command=command,
                font=font_tuple,
                padx=padding,
                pady=padding,
                relief=tk.FLAT,
                bd=0,
                highlightthickness=0
            )
        else:
            button = tk.Button(
                parent,
                text=text,
                command=command,
                font=font_tuple,
                padx=padding,
                pady=padding
            )
        
        return button
    
    def create_large_touch_entry(self, parent: tk.Widget) -> tk.Widget:
        """Create an entry widget optimized for touch input."""
        font_size = self.platform_adapter.get_optimal_font_size(12)
        font_tuple = (self.platform_adapter.platform_config["default_font"][0], font_size)
        
        # For touch devices, we want larger entries
        if self.platform_adapter.is_touch_device():
            entry = tk.Entry(
                parent,
                font=font_tuple,
                relief=tk.SUNKEN,
                bd=2
            )
        else:
            entry = tk.Entry(
                parent,
                font=font_tuple
            )
        
        return entry
    
    def create_scrollable_touch_frame(self, parent: tk.Widget) -> tk.Widget:
        """Create a frame with touch-optimized scrolling."""
        if self.platform_adapter.is_touch_device():
            # On touch devices, we might want to use different scrolling approaches
            canvas = tk.Canvas(parent, highlightthickness=0)
            scrollbar = ttk.Scrollbar(parent, orient="vertical", command=canvas.yview)
            scrollable_frame = tk.Frame(canvas)
            
            scrollable_frame.bind(
                "<Configure>",
                lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
            )
            
            canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
            canvas.configure(yscrollcommand=scrollbar.set)
            
            # On touch devices, enable touch scrolling
            def _on_mousewheel(event):
                canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
            
            def _bind_mousewheel(event):
                canvas.bind_all("<MouseWheel>", _on_mousewheel)
            
            def _unbind_mousewheel(event):
                canvas.unbind_all("<MouseWheel>")
            
            canvas.bind('<Enter>', _bind_mousewheel)
            canvas.bind('<Leave>', _unbind_mousewheel)
            
            return canvas, scrollable_frame, scrollbar
        else:
            # For non-touch devices, use standard approach
            frame = tk.Frame(parent)
            return frame, frame, None


class CrossPlatformUIManager:
    """Manages cross-platform UI differences and compatibility."""

    def __init__(self):
        self.platform_adapter = PlatformAdapter()
        self.responsive_layout = ResponsiveLayout()  # Initialize without root initially
        self.mobile_widgets = MobileOptimizedWidgets(self.platform_adapter)
        self.ui_adaptations: Dict[str, Any] = {}
    
    def initialize_for_window(self, window: tk.Widget):
        """Initialize the manager for a specific window."""
        self.responsive_layout = ResponsiveLayout(window)
        
        # Bind to window resize events to adapt layout
        window.bind("<Configure>", self._on_window_resize)
    
    def _on_window_resize(self, event):
        """Handle window resize events."""
        if event.widget == self.responsive_layout.root:
            new_layout = self.responsive_layout._get_current_layout()
            if new_layout != self.responsive_layout.current_layout:
                self.responsive_layout.current_layout = new_layout
                self._adapt_ui_to_layout(new_layout)
    
    def _adapt_ui_to_layout(self, layout: str):
        """Adapt the UI to the new layout."""
        # This would typically adjust UI elements based on the new layout
        # For now, we'll just print the change
        print(f"UI adapted to {layout} layout")
        
        # In a real implementation, this would:
        # - Adjust widget sizes and positioning
        # - Change navigation patterns (e.g., hamburger menu for mobile)
        # - Modify content density
        # - Adjust font sizes
        pass
    
    def create_platform_optimized_dialog(self, parent: tk.Widget, title: str) -> tk.Toplevel:
        """Create a dialog optimized for the current platform."""
        dialog = tk.Toplevel(parent)
        dialog.title(title)
        
        # Platform-specific window setup
        if self.platform_adapter.current_platform.name == "darwin":
            # macOS-specific adjustments
            dialog.configure(background="#ececec")  # Light gray background is common on macOS
        elif self.platform_adapter.current_platform.name == "windows":
            # Windows-specific adjustments
            pass  # Windows typically uses default styling
        else:
            # Linux and other platforms
            pass
        
        # For mobile/touch platforms, adjust dialog size
        if self.platform_adapter.is_touch_device():
            screen_width = dialog.winfo_screenwidth()
            screen_height = dialog.winfo_screenheight()
            dialog.geometry(f"{int(screen_width*0.8)}x{int(screen_height*0.6)}")
        else:
            dialog.geometry("600x400")
        
        return dialog
    
    def setup_cross_platform_menu(self, menubar: tk.Menu):
        """Setup menu bar with cross-platform compatibility."""
        # Platform-specific menu setup
        if self.platform_adapter.current_platform.name == "darwin":
            # On macOS, add the Apple menu
            apple_menu = tk.Menu(menubar, name="apple")
            menubar.add_cascade(menu=apple_menu)
            
            # Add standard macOS menu items
            apple_menu.add_command(label="About JPE Sims 4 Mod Translator")
            apple_menu.add_separator()
            apple_menu.add_command(label="Preferences...", command=lambda: print("Preferences"))
            apple_menu.add_separator()
            apple_menu.add_command(label="Services", state="disabled")
            apple_menu.add_separator()
            apple_menu.add_command(label="Hide JPE Sims 4 Mod Translator", command=lambda: self.root.iconify())
            apple_menu.add_command(label="Hide Others", command=lambda: self._hide_others())
            apple_menu.add_command(label="Show All", command=lambda: self._show_all())
            apple_menu.add_separator()
            apple_menu.add_command(label="Quit", command=self.root.quit)
        elif self.platform_adapter.current_platform.name == "windows":
            # Windows-specific menu behavior
            pass
        else:
            # Linux and other platforms
            pass
    
    def _hide_others(self):
        """macOS-specific function to hide other applications."""
        # This would be implemented for macOS
        pass
    
    def _show_all(self):
        """macOS-specific function to show all applications."""
        # This would be implemented for macOS
        pass
    
    def get_platform_appropriate_widget(self, widget_type: str, parent: tk.Widget, **kwargs) -> tk.Widget:
        """Get a widget that's appropriate for the current platform."""
        if widget_type == "button":
            size = kwargs.pop("size", "normal")
            command = kwargs.pop("command", lambda: None)
            text = kwargs.pop("text", "")
            return self.mobile_widgets.create_touch_friendly_button(parent, text, command, size)
        elif widget_type == "entry":
            return self.mobile_widgets.create_large_touch_entry(parent)
        else:
            # Default to standard widget
            if widget_type == "frame":
                return tk.Frame(parent, **kwargs)
            elif widget_type == "label":
                return tk.Label(parent, **kwargs)
            elif widget_type == "button":
                return tk.Button(parent, command=kwargs.get("command", lambda: None), text=kwargs.get("text", ""), **kwargs)
            elif widget_type == "entry":
                return tk.Entry(parent, **kwargs)
            else:
                raise ValueError(f"Unknown widget type: {widget_type}")


class MobileInterfaceManager:
    """Manages the mobile-specific interface components."""
    
    def __init__(self, ui_manager: CrossPlatformUIManager):
        self.ui_manager = ui_manager
        self.is_mobile_mode = False
        self.hamburger_menu: Optional[tk.Menu] = None
        self.bottom_navigation: Optional[tk.Frame] = None
    
    def enable_mobile_mode(self, root_window: tk.Tk):
        """Enable mobile-optimized interface elements."""
        self.is_mobile_mode = True
        
        # Set window attributes for mobile-like behavior
        if self.ui_manager.platform_adapter.is_touch_device():
            # For truly mobile platforms, we might set different attributes
            pass
        else:
            # For desktop but mobile-mode, adjust UI elements
            self._setup_mobile_navigation(root_window)
    
    def _setup_mobile_navigation(self, root_window: tk.Tk):
        """Setup mobile-style navigation."""
        # Create hamburger menu for navigation
        self.hamburger_menu = tk.Menu(root_window, tearoff=0)
        
        # Add menu items
        self.hamburger_menu.add_command(label="Home", command=lambda: print("Navigate to Home"))
        self.hamburger_menu.add_command(label="Projects", command=lambda: print("Navigate to Projects"))
        self.hamburger_menu.add_command(label="Templates", command=lambda: print("Navigate to Templates"))
        self.hamburger_menu.add_command(label="Settings", command=lambda: print("Navigate to Settings"))
        self.hamburger_menu.add_separator()
        self.hamburger_menu.add_command(label="Help", command=lambda: print("Navigate to Help"))
        
        # Create hamburger button
        hamburger_btn = tk.Button(
            root_window,
            text="☰",
            command=self._show_hamburger_menu,
            font=("Arial", 16),
            width=3,
            height=1
        )
        hamburger_btn.pack(side=tk.TOP, anchor=tk.W, padx=10, pady=10)
    
    def _show_hamburger_menu(self):
        """Show the hamburger menu."""
        try:
            # Get the hamburger button's coordinates
            btn = [child for child in self.root.winfo_children() 
                   if isinstance(child, tk.Button) and child.cget("text") == "☰"][0]
            
            x = btn.winfo_rootx()
            y = btn.winfo_rooty() + btn.winfo_height()
            
            self.hamburger_menu.post(x, y)
        except IndexError:
            # Hamburger button not found
            pass
    
    def setup_bottom_navigation(self, root_window: tk.Tk):
        """Setup bottom navigation bar for mobile interface."""
        if not self.ui_manager.platform_adapter.is_touch_device():
            return  # Only for touch devices
        
        # Create bottom navigation frame
        self.bottom_navigation = tk.Frame(
            root_window,
            height=60,
            bg="#f0f0f0",
            relief=tk.RAISED,
            bd=1
        )
        self.bottom_navigation.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Add navigation buttons
        nav_items = [
            ("🏠", "Home"),
            ("📝", "Editor"), 
            ("📁", "Projects"),
            ("⚙️", "Settings")
        ]
        
        for emoji, label in nav_items:
            btn = tk.Button(
                self.bottom_navigation,
                text=f"{emoji}\n{label}",
                command=lambda l=label: print(f"Navigate to {l}"),
                font=("Arial", 10),
                height=2,
                width=10
            )
            btn.pack(side=tk.LEFT, expand=True, fill=tk.BOTH, padx=1, pady=5)
    
    def create_mobile_optimized_layout(self, parent: tk.Widget) -> tk.Frame:
        """Create a layout optimized for mobile devices."""
        # Create main container
        container = tk.Frame(parent)
        container.pack(fill=tk.BOTH, expand=True)
        
        # For mobile, use a simpler, more vertical layout
        if self.ui_manager.platform_adapter.is_touch_device():
            # Mobile layout: top-down with large touch targets
            top_bar = tk.Frame(container, height=50, bg="#4a86e8")
            top_bar.pack(fill=tk.X)
            top_bar.pack_propagate(False)  # Maintain fixed height
            
            # Content area
            content_area = tk.Frame(container)
            content_area.pack(fill=tk.BOTH, expand=True, pady=10)
            
            # Bottom navigation bar
            if self.bottom_navigation:
                self.bottom_navigation.pack_forget()  # Temporarily remove system nav if exists
                bottom_nav = tk.Frame(container, height=60, bg="#e0e0e0")
                bottom_nav.pack(fill=tk.X, side=tk.BOTTOM)
                bottom_nav.pack_propagate(False)
                
                # Add navigation items
                nav_items = ["Home", "Edit", "Projects", "More"]
                for item in nav_items:
                    btn = tk.Button(
                        bottom_nav,
                        text=item,
                        command=lambda i=item: print(f"Mobile nav: {i}"),
                        font=self.ui_manager.platform_adapter.platform_config["default_font"]
                    )
                    btn.pack(side=tk.LEFT, expand=True, fill=tk.BOTH)
        
        return container


# Global instances
platform_adapter = PlatformAdapter()
cross_platform_ui_manager = CrossPlatformUIManager()
mobile_interface_manager = MobileInterfaceManager(cross_platform_ui_manager)