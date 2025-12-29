"""
Installer Animation System for JPE Sims 4 Mod Translator.

This module provides animations for the installer to enhance user experience
during the installation process with visual feedback and progress indicators.
"""

import tkinter as tk
from tkinter import ttk
import time
import math
from typing import Optional, Callable, List
from PIL import Image, ImageTk
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


class InstallerAnimationFrame:
    """An animated frame for installer UI with visual feedback."""
    
    def __init__(self, parent: tk.Widget):
        self.parent = parent
        self.animation_manager = AnimationManager()
        self.particle_system: Optional[ParticleSystem] = None
        
        # Create the animated frame
        self.frame = tk.Frame(parent, bg=BRAND_LIGHT, relief=tk.RAISED, bd=1)
        
        # Create header with animation
        self.header_frame = tk.Frame(self.frame, bg=BRAND_LIGHT)
        self.header_frame.pack(fill=tk.X, padx=20, pady=15)
        
        self.title_label = tk.Label(
            self.header_frame,
            text="Installing JPE Sims 4 Mod Translator",
            font=(get_platform_font(), 16, "bold"),
            fg=BRAND_DARK,
            bg=BRAND_LIGHT
        )
        self.title_label.pack()
        
        # Create canvas for animations
        self.canvas = tk.Canvas(
            self.frame,
            width=400,
            height=200,
            bg=BRAND_LIGHT,
            highlightthickness=0
        )
        self.canvas.pack(pady=20)
        
        # Create progress area
        self.progress_frame = tk.Frame(self.frame, bg=BRAND_LIGHT)
        self.progress_frame.pack(fill=tk.X, padx=20, pady=10)
        
        self.status_label = tk.Label(
            self.progress_frame,
            text="Preparing installation...",
            font=(get_platform_font(), 12),
            fg=BRAND_DARK,
            bg=BRAND_LIGHT
        )
        self.status_label.pack(anchor=tk.W, pady=(0, 10))
        
        # Progress bar
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(
            self.progress_frame,
            variable=self.progress_var,
            maximum=100,
            length=350
        )
        self.progress_bar.pack()
        
        # Setup animations
        self.particle_system = ParticleSystem(self.canvas)
        self._setup_background_animation()
        
        # Start animation loop
        self.animation_manager.start_animation_loop(self.frame)
    
    def _setup_background_animation(self):
        """Setup background animations for the installer."""
        # Create a subtle background animation
        pass  # Placeholder for background animation logic
    
    def update_progress(self, progress: float, status: str = ""):
        """Update the installation progress."""
        self.progress_var.set(progress * 100)
        
        if status:
            self.status_label.config(text=status)
        
        # Trigger particle effects at certain progress points
        if progress > 0.2 and progress < 0.3:
            self._trigger_installation_effect("extracting")
        elif progress > 0.5 and progress < 0.6:
            self._trigger_installation_effect("configuring")
        elif progress > 0.8 and progress < 0.9:
            self._trigger_installation_effect("finalizing")
    
    def _trigger_installation_effect(self, effect_type: str):
        """Trigger a specific installation effect."""
        if self.particle_system:
            if effect_type == "extracting":
                # Emit particles from left to right
                for i in range(10):
                    x = 50 + (i * 20)
                    self.particle_system.emit(x, 100, BRAND_ACCENT, 3)
            elif effect_type == "configuring":
                # Emit particles from center outward
                self.particle_system.emit(200, 100, BRAND_ACCENT, 15)
            elif effect_type == "finalizing":
                # Emit particles to simulate completion
                for i in range(5):
                    self.particle_system.emit(100 + i*50, 50, BRAND_ACCENT, 5)
                    self.particle_system.emit(100 + i*50, 150, BRAND_ACCENT, 5)
    
    def cleanup(self):
        """Clean up animations and resources."""
        if self.animation_manager:
            self.animation_manager.stop_animation_loop()


class AnimatedInstallerStep:
    """An animated installer step with progress visualization."""
    
    def __init__(self, parent: tk.Widget, name: str, description: str):
        self.parent = parent
        self.name = name
        self.description = description
        
        # Create step frame
        self.frame = tk.Frame(parent, bg=BRAND_LIGHT)
        self.frame.pack(fill=tk.X, pady=5)
        
        # Create step indicator
        self.indicator = tk.Frame(
            self.frame,
            width=20,
            height=20,
            bg=BRAND_DARK,
            relief=tk.RAISED,
            bd=1
        )
        self.indicator.pack(side=tk.LEFT, padx=(0, 10))
        self.indicator.pack_propagate(False)
        
        # Create step label
        self.label = tk.Label(
            self.frame,
            text=f"{name}: {description}",
            font=(get_platform_font(), 10),
            fg=BRAND_DARK,
            bg=BRAND_LIGHT,
            anchor=tk.W
        )
        self.label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Status label for step progress
        self.status_label = tk.Label(
            self.frame,
            text="Pending",
            font=(get_platform_font(), 9),
            fg="#666666",
            bg=BRAND_LIGHT
        )
        self.status_label.pack(side=tk.RIGHT)
    
    def set_status(self, status: str, color: str = "#666666"):
        """Update the step status."""
        self.status_label.config(text=status, fg=color)
        
        # Update indicator based on status
        if status.lower() == "completed":
            self.indicator.config(bg="#28a745")  # Green for success
        elif status.lower() == "in progress":
            self.indicator.config(bg=BRAND_ACCENT)  # Accent color for active
        elif status.lower() == "error":
            self.indicator.config(bg="#dc3545")  # Red for error
        else:
            self.indicator.config(bg=BRAND_DARK)  # Default dark color


class AnimatedInstallerWizard:
    """An animated installer wizard with progress visualization."""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("JPE Sims 4 Mod Translator - Setup")
        self.root.geometry("600x500")
        self.root.configure(bg=BRAND_LIGHT)
        self.root.resizable(False, False)
        
        # Center window
        self._center_window()
        
        # Animation components
        self.animation_frame: Optional[InstallerAnimationFrame] = None
        self.steps: List[AnimatedInstallerStep] = []
        
        self.setup_ui()
    
    def _center_window(self):
        """Center the window on screen."""
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (self.root.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (self.root.winfo_height() // 2)
        self.root.geometry(f"+{x}+{y}")
    
    def setup_ui(self):
        """Setup the installer UI with animations."""
        # Main container
        main_frame = tk.Frame(self.root, bg=BRAND_LIGHT)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Create animated header
        header_frame = tk.Frame(main_frame, bg=BRAND_LIGHT)
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        title_label = tk.Label(
            header_frame,
            text="JPE Sims 4 Mod Translator",
            font=(get_platform_font(), 20, "bold"),
            fg=BRAND_DARK,
            bg=BRAND_LIGHT
        )
        title_label.pack()
        
        subtitle_label = tk.Label(
            header_frame,
            text="Installation Wizard",
            font=(get_platform_font(), 12),
            fg=BRAND_ACCENT,
            bg=BRAND_LIGHT
        )
        subtitle_label.pack()
        
        # Create animated frame
        self.animation_frame = InstallerAnimationFrame(main_frame)
        self.animation_frame.frame.pack(fill=tk.X, pady=(0, 20))
        
        # Create steps frame
        steps_frame = tk.LabelFrame(
            main_frame, 
            text="Installation Steps", 
            bg=BRAND_LIGHT,
            fg=BRAND_DARK,
            font=(get_platform_font(), 10, "bold")
        )
        steps_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Create installer steps
        installer_steps = [
            ("License Agreement", "Accept the license terms"),
            ("Destination Folder", "Select installation location"),
            ("Components", "Choose components to install"),
            ("Installation", "Installing application files"),
            ("Finalizing", "Completing setup")
        ]
        
        for name, description in installer_steps:
            step = AnimatedInstallerStep(steps_frame, name, description)
            self.steps.append(step)
        
        # Create buttons frame
        buttons_frame = tk.Frame(main_frame, bg=BRAND_LIGHT)
        buttons_frame.pack(fill=tk.X)
        
        # Progress buttons
        self.prev_btn = tk.Button(
            buttons_frame,
            text="Previous",
            state=tk.DISABLED,
            command=self.previous_step
        )
        self.prev_btn.pack(side=tk.LEFT)
        
        self.next_btn = tk.Button(
            buttons_frame,
            text="Next",
            command=self.next_step
        )
        self.next_btn.pack(side=tk.RIGHT)
        
        self.cancel_btn = tk.Button(
            buttons_frame,
            text="Cancel",
            command=self.cancel_installation
        )
        self.cancel_btn.pack(side=tk.RIGHT, padx=(0, 10))
    
    def next_step(self):
        """Move to the next installation step."""
        current_step = len([s for s in self.steps if "Completed" in s.status_label.cget("text")])
        
        if current_step < len(self.steps):
            # Update the current step
            self.steps[current_step].set_status("In Progress", BRAND_ACCENT)
            
            # Update animation progress
            progress = (current_step + 1) / len(self.steps)
            status_text = f"Step {current_step + 1} of {len(self.steps)}: {self.steps[current_step].name}"
            
            if self.animation_frame:
                self.animation_frame.update_progress(progress, status_text)
    
    def previous_step(self):
        """Move to the previous installation step."""
        pass  # Implementation would depend on installer logic
    
    def cancel_installation(self):
        """Cancel the installation."""
        if self.animation_frame:
            self.animation_frame.cleanup()
        self.root.destroy()
    
    def run(self):
        """Run the installer wizard."""
        self.root.mainloop()


def create_animated_installer():
    """Create and run the animated installer."""
    installer = AnimatedInstallerWizard()
    installer.run()


if __name__ == "__main__":
    create_animated_installer()