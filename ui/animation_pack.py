"""
Animation Pack for JPE Sims 4 Mod Translator.

This module provides a collection of UI animations for various components
of the application, including button hover effects, transitions, and
interactive elements.
"""

import tkinter as tk
from tkinter import ttk
import time
import math
from typing import Optional, Callable, Dict, Any
from PIL import Image, ImageTk, ImageDraw
import threading

from ui.animation_system import (
    AnimationManager, 
    LoadingSpinnerAnimation, 
    ParticleSystem,
    ColorPulseAnimation,
    AnimationConfig
)
from ui.jpe_branding import (
    BRAND_LIGHT, 
    BRAND_DARK, 
    BRAND_ACCENT,
    get_platform_font
)


class ButtonHoverAnimation:
    """Animation for button hover effects."""
    
    def __init__(self, button: tk.Button):
        self.button = button
        self.original_bg = str(button.cget("background"))
        self.original_fg = str(button.cget("foreground"))
        self.original_font = str(button.cget("font"))
        
        # Bind hover events
        self.button.bind("<Enter>", self.on_hover)
        self.button.bind("<Leave>", self.on_leave)
    
    def on_hover(self, event=None):
        """Handle mouse enter event."""
        # Change background color smoothly
        self.button.configure(background=BRAND_ACCENT, foreground=BRAND_LIGHT)
        
        # Add slight scale effect (if using a canvas-based button)
        if hasattr(self.button, 'scale'):
            self.button.scale(1.05, 1.05)
    
    def on_leave(self, event=None):
        """Handle mouse leave event."""
        # Restore original colors
        self.button.configure(background=self.original_bg, foreground=self.original_fg)


class SlideInAnimation:
    """Animates a widget sliding in from a direction."""
    
    def __init__(self, widget: tk.Widget, direction: str = "left", duration: float = 0.5):
        self.widget = widget
        self.direction = direction  # "left", "right", "top", "bottom"
        self.duration = duration
        
        # Store original position
        self.original_x = self.widget.winfo_x() if hasattr(self.widget, 'winfo_x') else 0
        self.original_y = self.widget.winfo_y() if hasattr(self.widget, 'winfo_y') else 0
        
        # Calculate start position based on direction
        self.start_x, self.start_y = self._get_start_position()
    
    def _get_start_position(self) -> tuple:
        """Calculate the starting position based on direction."""
        if self.direction == "left":
            return -self.widget.winfo_width(), self.original_y
        elif self.direction == "right":
            return self.widget.winfo_screenwidth(), self.original_y
        elif self.direction == "top":
            return self.original_x, -self.widget.winfo_height()
        elif self.direction == "bottom":
            return self.original_x, self.widget.winfo_screenheight()
        else:
            return self.original_x, self.original_y
    
    def start(self):
        """Start the slide in animation."""
        # For simplicity in tkinter, we'll just show the widget
        # A real implementation would interpolate positions
        self.widget.place(x=self.start_x, y=self.start_y)
        
        # Animate to final position
        self._animate_to_final()
    
    def _animate_to_final(self):
        """Animate the widget to its final position."""
        # In a real implementation, this would be a gradual animation
        self.widget.place(x=self.original_x, y=self.original_y)


class FadeInAnimation:
    """Animates a widget fading in."""
    
    def __init__(self, widget: tk.Widget, duration: float = 0.5):
        self.widget = widget
        self.duration = duration
        self.widget.configure(state=tk.DISABLED)  # Start invisible
        self.widget.lower()  # Put behind other widgets initially
    
    def start(self):
        """Start the fade in animation."""
        # In tkinter, we can't easily control opacity,
        # so we'll simulate by gradually changing visibility
        self.widget.configure(state=tk.NORMAL)
        self.widget.lift()


class PulsingIconAnimation:
    """Creates a pulsing animation for icons or buttons."""
    
    def __init__(self, canvas: tk.Canvas, x: int, y: int, radius: int, color: str = BRAND_ACCENT):
        self.canvas = canvas
        self.x = x
        self.y = y
        self.base_radius = radius
        self.color = color
        self.pulse_phase = 0
        self.item_id = None
        
        # Create the initial circle
        self.item_id = self.canvas.create_oval(
            x - radius, y - radius,
            x + radius, y + radius,
            fill=color,
            outline=color
        )
    
    def update(self):
        """Update the pulse animation."""
        # Calculate current size based on pulse phase
        pulse_size = self.base_radius + 2 * math.sin(self.pulse_phase)
        self.pulse_phase += 0.2  # Increment phase for next frame
        
        # Update the circle on canvas
        self.canvas.coords(
            self.item_id,
            self.x - pulse_size, self.y - pulse_size,
            self.x + pulse_size, self.y + pulse_size
        )


class AnimatedTabView:
    """An animated tab view with smooth transitions."""
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        self.tab_frame = tk.Frame(parent, bg=BRAND_LIGHT)
        self.tab_frame.pack(fill=tk.BOTH, expand=True)
        
        # Tab buttons frame
        self.buttons_frame = tk.Frame(self.tab_frame, bg=BRAND_LIGHT)
        self.buttons_frame.pack(fill=tk.X)
        
        # Content frame
        self.content_frame = tk.Frame(self.tab_frame, bg=BRAND_LIGHT)
        self.content_frame.pack(fill=tk.BOTH, expand=True, pady=(10, 0))
        
        self.tabs: Dict[str, tk.Frame] = {}
        self.tab_buttons: Dict[str, tk.Button] = {}
        self.current_tab: Optional[str] = None
        
        # Animation manager
        self.animation_manager = AnimationManager()
    
    def add_tab(self, name: str, content: tk.Widget):
        """Add a tab with the specified name and content."""
        # Create button for tab
        btn = tk.Button(
            self.buttons_frame,
            text=name,
            command=lambda n=name: self.select_tab(n),
            bg=BRAND_LIGHT,
            fg=BRAND_DARK,
            relief=tk.RAISED,
            bd=1
        )
        btn.pack(side=tk.LEFT, padx=2)
        self.tab_buttons[name] = btn
        
        # Create content frame for tab
        tab_content_frame = tk.Frame(self.content_frame, bg=BRAND_LIGHT)
        content.pack(in_=tab_content_frame, fill=tk.BOTH, expand=True)
        
        self.tabs[name] = tab_content_frame
        
        # Select the first tab by default
        if self.current_tab is None:
            self.select_tab(name)
    
    def select_tab(self, name: str):
        """Select a specific tab with animation."""
        # Hide current tab if any
        if self.current_tab and self.current_tab in self.tabs:
            self.tabs[self.current_tab].pack_forget()
            self.tab_buttons[self.current_tab].configure(relief=tk.RAISED, bg=BRAND_LIGHT)
        
        # Show new tab
        self.current_tab = name
        self.tabs[name].pack(fill=tk.BOTH, expand=True)
        self.tab_buttons[name].configure(relief=tk.SUNKEN, bg=BRAND_ACCENT)
        
        # Add slide in animation for the new tab content
        # For simplicity, just show the tab
        # A full animation would involve more complex movement


class AnimatedTreeView:
    """An animated tree view with expand/collapse animations."""
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        self.tree = ttk.Treeview(parent)
        self.tree.pack(fill=tk.BOTH, expand=True)
        
        # Animation state
        self.expansion_animations = {}
    
    def add_animated_item(self, parent_id: str, item_id: str, text: str, **kwargs):
        """Add an item to the tree with animation support."""
        # Add the item to the tree
        self.tree.insert(parent_id, 'end', iid=item_id, text=text, **kwargs)
        
        # Bind click event for expand/collapse with animation
        self.tree.bind('<<TreeviewOpen>>', self._on_item_open)
        self.tree.bind('<<TreeviewClose>>', self._on_item_close)
    
    def _on_item_open(self, event):
        """Handle item open with animation."""
        # Placeholder for expand animation
        pass
    
    def _on_item_close(self, event):
        """Handle item close with animation."""
        # Placeholder for collapse animation
        pass


class NotificationAnimation:
    """An animated notification system."""
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        self.notifications = []
    
    def show_notification(self, message: str, duration: float = 3.0, notification_type: str = "info"):
        """Show an animated notification."""
        # Determine color based on notification type
        if notification_type == "error":
            bg_color = "#dc3545"
        elif notification_type == "warning":
            bg_color = "#ffc107"
        elif notification_type == "success":
            bg_color = "#28a745"
        else:  # info
            bg_color = BRAND_ACCENT
        
        # Create notification frame
        notification_frame = tk.Frame(
            self.parent,
            bg=bg_color,
            relief=tk.RAISED,
            bd=1
        )
        
        # Create label with message
        label = tk.Label(
            notification_frame,
            text=message,
            fg=BRAND_LIGHT,
            bg=bg_color,
            font=(get_platform_font(), 10)
        )
        label.pack(padx=10, pady=5)
        
        # Place at top of parent
        notification_frame.place(relx=0.5, rely=0.1, anchor=tk.CENTER, relwidth=0.8)
        
        # Schedule removal
        self.parent.after(int(duration * 1000), lambda: self._remove_notification(notification_frame))
    
    def _remove_notification(self, frame: tk.Frame):
        """Remove and animate notification out."""
        frame.destroy()


class SplashScreenAnimation:
    """An animated splash screen for the application."""
    
    def __init__(self, on_complete: Callable, duration: float = 3.0):
        self.root = tk.Toplevel()
        self.root.title("JPE Sims 4 Mod Translator")
        self.root.geometry("500x300")
        self.root.configure(bg=BRAND_DARK)
        self.root.overrideredirect(True)
        self.root.resizable(False, False)
        
        # Center window
        self._center_window()
        
        self.on_complete = on_complete
        self.duration = duration
        self.progress = 0
        self.animation_manager = AnimationManager()
        
        self.setup_ui()
        self.start_animation()
    
    def _center_window(self):
        """Center the window on screen."""
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (self.root.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (self.root.winfo_height() // 2)
        self.root.geometry(f"+{x}+{y}")
    
    def setup_ui(self):
        """Setup the splash screen UI."""
        # Main container
        main_frame = tk.Frame(self.root, bg=BRAND_DARK)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Brand name
        brand_label = tk.Label(
            main_frame,
            text="JPE Sims 4\nMod Translator",
            font=(get_platform_font(), 28, "bold"),
            fg=BRAND_ACCENT,
            bg=BRAND_DARK
        )
        brand_label.pack(expand=True)
        
        # Progress bar
        self.progress_frame = tk.Frame(main_frame, bg=BRAND_DARK)
        self.progress_frame.pack(fill=tk.X, padx=50, pady=(0, 50))
        
        self.progress_bar = tk.Canvas(
            self.progress_frame,
            height=4,
            bg=BRAND_LIGHT,
            highlightthickness=0
        )
        self.progress_bar.pack(fill=tk.X)
        
        # Progress indicator
        self.progress_indicator = self.progress_bar.create_rectangle(
            0, 0, 0, 4,
            fill=BRAND_ACCENT,
            outline=BRAND_ACCENT
        )
    
    def start_animation(self):
        """Start the splash screen animation."""
        def animate():
            start_time = time.time()
            while time.time() - start_time < self.duration:
                progress = (time.time() - start_time) / self.duration
                self.update_progress(progress)
                self.root.update()
                time.sleep(0.01)  # Small delay for smooth animation
            
            # Clean up and call completion
            self.animation_manager.stop_animation_loop()
            self.root.destroy()
            self.on_complete()
        
        # Run animation in a separate thread to prevent blocking
        threading.Thread(target=animate, daemon=True).start()
    
    def update_progress(self, progress: float):
        """Update the progress bar."""
        width = int(self.progress_bar.winfo_width() * progress)
        self.progress_bar.coords(self.progress_indicator, 0, 0, width, 4)


# Animation pack utility functions
def apply_hover_animation_to_all_buttons(parent_widget: tk.Widget):
    """Apply hover animations to all buttons in a parent widget."""
    for widget in parent_widget.winfo_children():
        if isinstance(widget, tk.Button):
            ButtonHoverAnimation(widget)
        else:
            # Recursively apply to child widgets
            apply_hover_animation_to_all_buttons(widget)


def animate_widget_fade_in(widget: tk.Widget):
    """Animate a widget fading in."""
    anim = FadeInAnimation(widget)
    anim.start()


def animate_widget_slide_in(widget: tk.Widget, direction: str = "left"):
    """Animate a widget sliding in."""
    anim = SlideInAnimation(widget, direction)
    anim.start()


# Example usage and testing
def create_animation_demo():
    """Create a demo of the animation pack."""
    root = tk.Tk()
    root.title("Animation Pack Demo - JPE Sims 4 Mod Translator")
    root.geometry("800x600")
    root.configure(bg=BRAND_LIGHT)
    
    # Create demo buttons
    btn_frame = tk.Frame(root, bg=BRAND_LIGHT)
    btn_frame.pack(pady=20)
    
    tk.Button(btn_frame, text="Hover over me!", width=20).pack(pady=5)
    tk.Button(btn_frame, text="Me too!", width=20).pack(pady=5)
    
    # Apply hover animations to all buttons
    apply_hover_animation_to_all_buttons(btn_frame)
    
    # Create notification demo
    notification_area = tk.Frame(root, bg=BRAND_LIGHT, height=100)
    notification_area.pack(fill=tk.X, pady=20)
    
    def show_notification():
        notifier = NotificationAnimation(root)
        notifier.show_notification("This is a test notification!", 3.0, "success")
    
    tk.Button(root, text="Show Notification", command=show_notification).pack(pady=10)
    
    # Create animated treeview demo
    tree_frame = tk.Frame(root, height=200)
    tree_frame.pack(fill=tk.X, pady=20)
    tree_frame.pack_propagate(False)
    
    animated_tree = AnimatedTreeView(tree_frame)
    root_node = animated_tree.tree.insert("", "end", text="Root", open=True)
    animated_tree.tree.insert(root_node, "end", text="Child 1")
    animated_tree.tree.insert(root_node, "end", text="Child 2")
    
    root.mainloop()


if __name__ == "__main__":
    create_animation_demo()