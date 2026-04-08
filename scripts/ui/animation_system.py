"""
Animation System for JPE Sims 4 Mod Translator.

This module provides a comprehensive animation framework that can be used
throughout the application for UI enhancements, installer animations, 
boot sequences, and other visual effects.
"""

import tkinter as tk
from tkinter import ttk
import time
import math
import random
from typing import Callable, Optional, List, Tuple, Any
from PIL import Image, ImageTk, ImageDraw
import threading
from dataclasses import dataclass


@dataclass
class AnimationConfig:
    """Configuration for animations."""
    duration: float = 1.0  # Duration in seconds
    easing: str = "linear"  # "linear", "ease_in", "ease_out", "ease_in_out"
    loop: bool = False
    on_complete: Optional[Callable] = None
    on_start: Optional[Callable] = None


class AnimationManager:
    """Manages and runs animations throughout the application."""
    
    def __init__(self):
        self.animations: List['BaseAnimation'] = []
        self.running = True
        self._animation_thread = None
    
    def register_animation(self, animation: 'BaseAnimation'):
        """Register an animation to be managed."""
        self.animations.append(animation)
    
    def remove_animation(self, animation: 'BaseAnimation'):
        """Remove an animation from management."""
        if animation in self.animations:
            self.animations.remove(animation)
    
    def start_animation_loop(self, root_window: tk.Tk):
        """Start the animation loop in a separate thread."""
        if self._animation_thread is None or not self._animation_thread.is_alive():
            self.running = True
            self._animation_thread = threading.Thread(
                target=self._animation_loop, 
                args=(root_window,),
                daemon=True
            )
            self._animation_thread.start()
    
    def stop_animation_loop(self):
        """Stop the animation loop."""
        self.running = False
        if self._animation_thread and self._animation_thread.is_alive():
            self._animation_thread.join(timeout=1)
    
    def _animation_loop(self, root_window: tk.Tk):
        """Main animation loop that updates all registered animations."""
        while self.running:
            current_time = time.time()
            animations_to_remove = []
            
            for anim in self.animations[:]:  # Create a copy to iterate safely
                if anim.update(current_time):
                    # Animation is complete
                    if anim.config.on_complete:
                        anim.config.on_complete()
                    animations_to_remove.append(anim)
            
            # Remove completed animations
            for anim in animations_to_remove:
                self.remove_animation(anim)
            
            # Schedule the next update on the main thread
            try:
                root_window.after(16, lambda: None)  # ~60 FPS
            except tk.TclError:
                # Root window was destroyed
                break
            
            time.sleep(1/120)  # ~120 FPS for smooth animations


class BaseAnimation:
    """Base class for all animations."""
    
    def __init__(self, config: AnimationConfig):
        self.config = config
        self.start_time = 0
        self.is_running = False
        self.is_complete = False
    
    def start(self):
        """Start the animation."""
        self.start_time = time.time()
        self.is_running = True
        self.is_complete = False
        if self.config.on_start:
            self.config.on_start()
    
    def update(self, current_time: float) -> bool:
        """Update the animation. Returns True if animation is complete."""
        if not self.is_running or self.is_complete:
            return False
        
        elapsed = current_time - self.start_time
        progress = min(elapsed / self.config.duration, 1.0)
        
        # Apply easing function
        eased_progress = self._apply_easing(progress)
        
        # Perform animation update
        self._update_frame(eased_progress)
        
        if progress >= 1.0:
            self.is_complete = True
            self.is_running = False
            return True
        
        return False
    
    def _apply_easing(self, progress: float) -> float:
        """Apply easing function to progress value."""
        if self.config.easing == "linear":
            return progress
        elif self.config.easing == "ease_in":
            return progress * progress
        elif self.config.easing == "ease_out":
            return 1 - (1 - progress) * (1 - progress)
        elif self.config.easing == "ease_in_out":
            if progress < 0.5:
                return 2 * progress * progress
            else:
                return 1 - pow(-2 * progress + 2, 2) / 2
        else:
            return progress
    
    def _update_frame(self, progress: float):
        """Override this method to implement specific animation logic."""
        raise NotImplementedError


class FadeAnimation(BaseAnimation):
    """Fades a widget in or out."""
    
    def __init__(self, widget: tk.Widget, target_alpha: float, config: AnimationConfig):
        super().__init__(config)
        self.widget = widget
        self.target_alpha = target_alpha
        self.start_alpha = self._get_current_alpha()
    
    def _get_current_alpha(self) -> float:
        """Get the current alpha of the widget. This is a simplified implementation."""
        # For this implementation, we'll assume we're working with colors
        # In a real implementation, this would need to handle actual transparency
        return 1.0  # Default to fully opaque
    
    def _update_frame(self, progress: float):
        """Update the fade animation frame."""
        current_alpha = self.start_alpha + (self.target_alpha - self.start_alpha) * progress
        # In a real implementation, this would modify the widget's transparency
        pass


class ColorPulseAnimation(BaseAnimation):
    """Pulses a color between two values."""
    
    def __init__(self, widget: tk.Widget, start_color: str, end_color: str, config: AnimationConfig):
        super().__init__(config)
        self.widget = widget
        self.start_color = start_color
        self.end_color = end_color
        self.original_color = str(widget.cget("background")) if hasattr(widget, 'cget') else "#FFFFFF"
    
    def _update_frame(self, progress: float):
        """Update the color pulse animation frame."""
        # For this implementation, we'll interpolate between two colors
        # This is a simplified color interpolation
        r1, g1, b1 = self._hex_to_rgb(self.start_color)
        r2, g2, b2 = self._hex_to_rgb(self.end_color)
        
        r = int(r1 + (r2 - r1) * progress)
        g = int(g1 + (g2 - g1) * progress)
        b = int(b1 + (b2 - b1) * progress)
        
        new_color = f"#{r:02x}{g:02x}{b:02x}"
        
        try:
            self.widget.configure(background=new_color)
        except tk.TclError:
            # Widget doesn't support background color, ignore
            pass
    
    def _hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to RGB."""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


class LoadingSpinnerAnimation(BaseAnimation):
    """Creates a loading spinner animation."""
    
    def __init__(self, canvas: tk.Canvas, x: int, y: int, radius: int, config: AnimationConfig):
        super().__init__(config)
        self.canvas = canvas
        self.x = x
        self.y = y
        self.radius = radius
        self.arc_id = None
        self.angle = 0
        self.setup_spinner()
    
    def setup_spinner(self):
        """Setup the spinner on the canvas."""
        # Create a circle arc to represent the spinner
        bbox = (self.x - self.radius, self.y - self.radius, 
                self.x + self.radius, self.y + self.radius)
        self.arc_id = self.canvas.create_arc(
            bbox, start=0, extent=45, style=tk.ARC, 
            outline="#2EC4B6", width=4
        )
    
    def _update_frame(self, progress: float):
        """Update the spinner animation frame."""
        if self.arc_id:
            # Calculate rotation angle based on progress
            # In a real animation, this would rotate smoothly
            self.angle = (self.angle + 10) % 360
            self.canvas.itemconfig(self.arc_id, start=self.angle)


class ParticleSystem:
    """A particle system for special effects."""
    
    def __init__(self, canvas: tk.Canvas):
        self.canvas = canvas
        self.particles: List['Particle'] = []
    
    def emit(self, x: int, y: int, color: str = "#2EC4B6", count: int = 10):
        """Emit particles at a position."""
        for _ in range(count):
            particle = Particle(
                canvas=self.canvas,
                x=x,
                y=y,
                color=color
            )
            self.particles.append(particle)
    
    def update(self):
        """Update all particles."""
        particles_to_remove = []
        for particle in self.particles:
            if not particle.update():
                particles_to_remove.append(particle)
        
        for particle in particles_to_remove:
            particle.cleanup()
            self.particles.remove(particle)


class Particle:
    """A single particle for the particle system."""
    
    def __init__(self, canvas: tk.Canvas, x: int, y: int, color: str = "#2EC4B6"):
        self.canvas = canvas
        self.x = x
        self.y = y
        self.color = color
        self.vx = random.uniform(-2, 2)
        self.vy = random.uniform(-2, 2)
        self.life = 1.0
        self.decay = 0.02
        self.size = random.randint(2, 5)
        
        # Create the particle on canvas
        self.id = canvas.create_oval(
            x - self.size, y - self.size,
            x + self.size, y + self.size,
            fill=color, outline=color
        )
    
    def update(self) -> bool:
        """Update particle position and state. Returns False when particle dies."""
        self.x += self.vx
        self.y += self.vy
        self.life -= self.decay
        
        if self.life <= 0:
            return False
        
        # Update position on canvas
        self.canvas.coords(
            self.id,
            self.x - self.size, self.y - self.size,
            self.x + self.size, self.y + self.size
        )
        
        # Fade out as life decreases
        alpha = int(self.life * 255)
        faded_color = f"#{alpha:02x}{alpha:02x}{alpha:02x}"
        
        self.canvas.itemconfig(self.id, fill=faded_color, outline=faded_color)
        return True
    
    def cleanup(self):
        """Remove the particle from the canvas."""
        self.canvas.delete(self.id)


# Global animation manager instance
animation_manager = AnimationManager()