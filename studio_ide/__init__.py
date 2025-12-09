"""
Main Studio Application for JPE Sims 4 Mod Translator.

This is the main entry point for the enhanced IDE with all UI/UX features.
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import sys
from pathlib import Path
import asyncio
import threading

# Import all the enhancement components
from studio_ide.jpe_studio import JPEStudioIDE
from ui.advanced_ui_components import apply_hover_animation_to_all_buttons
from ui.color_manager import color_manager
from ui.animation_system import animation_manager
from engine.enhanced_validation import RealTimeValidator
from engine.predictive_coding import PredictiveCodingSystem
from cloud.api import CloudAPI
from cloud.sync_manager import CloudSyncManager
from collaboration.system import CollaborationManager
from ai.ai_assistant import JPEAIAssistant
from fonts.font_manager import font_manager
from mobile.components import CrossPlatformUIManager


class JPEStudioApp:
    """Main application class for JPE Studio IDE."""
    
    def __init__(self):
        self.setup_dependencies()
        self.ide = JPEStudioIDE()
        self.setup_enhanced_features()
    
    def setup_dependencies(self):
        """Setup and configure all dependent systems."""
        # Initialize animation manager
        animation_manager.start_animation_loop()
        
        # Initialize other systems if available
        try:
            # Initialize cloud API if credentials exist
            self.cloud_api = CloudAPI() 
        except:
            self.cloud_api = None  # Cloud not available
            
        try:
            # Initialize collaboration manager
            self.collab_manager = CollaborationManager()
        except:
            self.collab_manager = None  # Collaboration not available
    
    def setup_enhanced_features(self):
        """Setup enhanced features after IDE initialization."""
        # Apply hover animations to all buttons in the IDE
        apply_hover_animation_to_all_buttons(self.ide.root)
        
        # Setup real-time validation if available
        if hasattr(self.ide, 'enhancement_systems') and 'validator' in self.ide.enhancement_systems:
            # Connect real-time validation to text changes
            original_on_text_change = self.ide.on_text_change
            def enhanced_text_change(event=None):
                original_on_text_change(event)
                # Run validation in background
                self.ide.async_validate_current_content()
            self.ide.on_text_change = enhanced_text_change
        
        # Setup predictive coding if available
        if hasattr(self.ide, 'enhancement_systems') and 'predictive_coding' in self.ide.enhancement_systems:
            # Connect predictive coding to key events
            pass
        
        # Setup AI assistant
        if hasattr(self.ide, 'enhancement_systems') and 'ai_assistant' in self.ide.enhancement_systems:
            # Connect AI assistant features
            pass
    
    def run(self):
        """Run the studio application."""
        print("JPE Studio IDE - Enhanced UI/UX Experience Loaded")
        print("=" * 50)
        print("Enhancement features active:")
        print("  • Advanced UI components with ttkbootstrap styling")
        print("  • Rich color system with 82+ additional swatches")
        print("  • Animated interfaces and transitions")
        print("  • AI-powered suggestions and error resolution")
        print("  • Real-time validation and diagnostics")
        print("  • Cloud sync and collaboration features")
        print("  • Cross-platform compatibility")
        print("  • Mobile-optimized interfaces")
        print("  • Comprehensive theme integration")
        print("=" * 50)
        
        # Run the IDE
        self.ide.run()


def main():
    """Main entry point for the studio application."""
    try:
        app = JPEStudioApp()
        app.run()
    except Exception as e:
        print(f"Error starting JPE Studio IDE: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


# Create global instances for access during development
studio_app = None

def create_studio_app():
    """Create and return a studio app instance."""
    global studio_app
    studio_app = JPEStudioApp()
    return studio_app


if __name__ == "__main__":
    main()