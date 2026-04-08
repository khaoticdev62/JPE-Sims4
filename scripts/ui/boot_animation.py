"""
Boot Animation System for JPE Sims 4 Mod Translator.

This module provides a visually appealing boot animation that can be displayed
during application startup, with progress visualization and brand integration.
"""

import tkinter as tk
from tkinter import ttk
import time
import math
from typing import Optional, Callable
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


class BootAnimationWindow:
    """A window that displays the boot animation with progress visualization."""
    
    def __init__(self, on_complete: Optional[Callable] = None, duration: float = 3.0):
        self.root = tk.Toplevel()
        self.root.title("JPE Sims 4 Mod Translator - Loading...")
        self.root.geometry("600x400")
        self.root.configure(bg=BRAND_DARK)
        self.root.overrideredirect(True)  # Remove window decorations
        self.root.resizable(False, False)
        
        # Center the window
        self._center_window()
        
        # Store callback
        self.on_complete = on_complete
        self.duration = duration
        self.start_time = time.time()
        
        # Animation components
        self.canvas: Optional[tk.Canvas] = None
        self.spinner: Optional[LoadingSpinnerAnimation] = None
        self.particle_system: Optional[ParticleSystem] = None
        self.brand_label: Optional[tk.Label] = None
        self.progress_label: Optional[tk.Label] = None
        self.progress_bar: Optional[ttk.Progressbar] = None
        
        # Animation state
        self.current_progress = 0.0
        self.animation_phase = 0  # 0=initial, 1=spinning, 2=particles, 3=complete
        
        self.setup_ui()
        self.setup_animations()
        self.start_boot_sequence()
    
    def _center_window(self):
        """Center the window on screen."""
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (self.root.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (self.root.winfo_height() // 2)
        self.root.geometry(f"+{x}+{y}")
    
    def setup_ui(self):
        """Setup the UI elements for the boot animation."""
        # Main container frame
        main_frame = tk.Frame(self.root, bg=BRAND_DARK)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Brand logo/text area
        logo_frame = tk.Frame(main_frame, bg=BRAND_DARK)
        logo_frame.pack(expand=True)
        
        # Brand name
        self.brand_label = tk.Label(
            logo_frame,
            text="JPE Sims 4\nMod Translator",
            font=(get_platform_font(), 24, "bold"),
            fg=BRAND_ACCENT,
            bg=BRAND_DARK
        )
        self.brand_label.pack(pady=(0, 20))
        
        # Animation canvas
        self.canvas = tk.Canvas(
            main_frame,
            width=200,
            height=200,
            bg=BRAND_DARK,
            highlightthickness=0
        )
        self.canvas.pack(pady=20)
        
        # Progress label
        self.progress_label = tk.Label(
            main_frame,
            text="Initializing...",
            font=(get_platform_font(), 12),
            fg=BRAND_LIGHT,
            bg=BRAND_DARK
        )
        self.progress_label.pack(pady=(0, 10))
        
        # Progress bar
        style = ttk.Style()
        style.configure(
            "Boot.Horizontal.TProgressbar",
            background=BRAND_ACCENT,
            troughcolor=BRAND_LIGHT,
            bordercolor=BRAND_DARK
        )
        
        self.progress_bar = ttk.Progressbar(
            main_frame,
            orient=tk.HORIZONTAL,
            length=300,
            mode='determinate',
            style="Boot.Horizontal.TProgressbar"
        )
        self.progress_bar.pack()
        
    def setup_animations(self):
        """Setup the animation components."""
        # Create animation manager for this window
        self.animation_manager = AnimationManager()
        
        # Create particle system
        self.particle_system = ParticleSystem(self.canvas)
        
        # Create initial spinner animation
        spinner_config = AnimationConfig(duration=5.0, loop=True)
        self.spinner = LoadingSpinnerAnimation(
            self.canvas, 
            100, 100, 30, 
            spinner_config
        )
        
        # Add spinner to animation manager
        self.animation_manager.register_animation(self.spinner)
        
        # Start the animation loop
        self.animation_manager.start_animation_loop(self.root)
    
    def update_progress(self, progress: float, message: str = ""):
        """Update the progress bar and message."""
        self.current_progress = max(0.0, min(1.0, progress))
        self.progress_bar['value'] = self.current_progress * 100
        
        if message:
            self.progress_label.config(text=message)
        
        # Trigger particle effects at certain progress points
        if progress > 0.3 and self.animation_phase == 1:
            self.animation_phase = 2
            self._trigger_particle_burst()
        elif progress > 0.7 and self.animation_phase == 2:
            self._trigger_particle_burst()
    
    def _trigger_particle_burst(self):
        """Trigger a burst of particles."""
        if self.particle_system:
            # Emit particles from the center
            self.particle_system.emit(100, 100, BRAND_ACCENT, 15)
    
    def start_boot_sequence(self):
        """Start the boot sequence with timed progress updates."""
        def boot_step():
            # Simulate boot steps with timed updates
            steps = [
                (0.1, "Loading core systems..."),
                (0.2, "Initializing engine..."),
                (0.3, "Loading themes..."),
                (0.4, "Setting up UI..."),
                (0.5, "Loading fonts..."),
                (0.6, "Initializing diagnostics..."),
                (0.7, "Loading plugins..."),
                (0.8, "Finalizing setup..."),
                (0.9, "Almost ready..."),
                (1.0, "Complete!")
            ]
            
            for progress, message in steps:
                # Update UI in the main thread
                self.root.after(0, lambda p=progress, m=message: self.update_progress(p, m))
                time.sleep(self.duration / len(steps))
            
            # Finalize and close
            time.sleep(0.5)  # Brief pause at completion
            self.root.after(0, self._complete_boot)
        
        # Start boot sequence in a separate thread
        boot_thread = threading.Thread(target=boot_step, daemon=True)
        boot_thread.start()
    
    def _complete_boot(self):
        """Handle boot completion."""
        # Stop animations
        self.animation_manager.stop_animation_loop()
        
        # Run completion callback if provided
        if self.on_complete:
            self.on_complete()
        
        # Close the boot window
        self.root.destroy()


class BootAnimationSystem:
    """Main system for managing boot animations."""
    
    def __init__(self):
        self.current_window: Optional[BootAnimationWindow] = None
    
    def show_boot_animation(self, on_complete: Optional[Callable] = None, duration: float = 3.0):
        """Show the boot animation."""
        # Create a root window for the animation if needed
        temp_root = tk.Tk()
        temp_root.withdraw()  # Hide the root window
        
        # Create the boot animation window
        self.current_window = BootAnimationWindow(on_complete, duration)
        
        # Start the animation
        try:
            temp_root.mainloop()
        except tk.TclError:
            # Window was closed elsewhere
            pass
        finally:
            temp_root.destroy()
    
    def update_boot_progress(self, progress: float, message: str = ""):
        """Update the progress of the current boot animation."""
        if self.current_window:
            self.current_window.update_progress(progress, message)


# Global boot animation system instance
boot_animation_system = BootAnimationSystem()