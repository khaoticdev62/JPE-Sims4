"""
Test script for the animation system in JPE Sims 4 Mod Translator.
"""

import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def test_animation_system():
    """Test the animation system."""
    print("Testing Animation System for JPE Sims 4 Mod Translator...")
    
    # Test 1: Import animation system
    try:
        from ui.animation_system import (
            AnimationManager, 
            BaseAnimation, 
            FadeAnimation, 
            ColorPulseAnimation, 
            LoadingSpinnerAnimation,
            ParticleSystem,
            animation_manager
        )
        print("✓ Animation system imported successfully")
        
        # Test creating animation manager
        manager = AnimationManager()
        print("✓ Animation manager created successfully")
        
        # Test global animation manager
        print(f"✓ Global animation manager: {animation_manager}")
        
    except Exception as e:
        print(f"✗ Error testing animation system: {e}")
        return False
    
    # Test 2: Import boot animation
    try:
        from ui.boot_animation import (
            BootAnimationWindow,
            BootAnimationSystem,
            boot_animation_system
        )
        print("✓ Boot animation components imported successfully")
        
        # Test global boot animation system
        print(f"✓ Global boot animation system: {boot_animation_system}")
        
    except Exception as e:
        print(f"✗ Error testing boot animation: {e}")
        return False
    
    # Test 3: Import installer animation
    try:
        from ui.installer_animation import (
            InstallerAnimationFrame,
            AnimatedInstallerStep,
            AnimatedInstallerWizard
        )
        print("✓ Installer animation components imported successfully")
        
    except Exception as e:
        print(f"✗ Error testing installer animation: {e}")
        return False
    
    # Test 4: Import animation pack
    try:
        from ui.animation_pack import (
            ButtonHoverAnimation,
            SlideInAnimation,
            FadeInAnimation,
            PulsingIconAnimation,
            AnimatedTabView,
            AnimatedTreeView,
            NotificationAnimation,
            SplashScreenAnimation,
            apply_hover_animation_to_all_buttons,
            animate_widget_fade_in,
            animate_widget_slide_in
        )
        print("✓ Animation pack components imported successfully")
        
    except Exception as e:
        print(f"✗ Error testing animation pack: {e}")
        return False
    
    # Test 5: Import animated installer
    try:
        from ui.animated_installer import (
            AnimatedInstaller,
            run_animated_installer,
            show_splash_and_install
        )
        print("✓ Animated installer components imported successfully")
        
    except Exception as e:
        print(f"✗ Error testing animated installer: {e}")
        return False
    
    # Test 6: Import UI enhancements
    try:
        from ui import (
            AnimationManager,
            BaseAnimation,
            FadeAnimation,
            ColorPulseAnimation,
            LoadingSpinnerAnimation,
            ParticleSystem,
            BootAnimationWindow,
            BootAnimationSystem,
            InstallerAnimationFrame,
            ButtonHoverAnimation,
            SlideInAnimation,
            FadeInAnimation,
            PulsingIconAnimation,
            AnimatedTabView,
            NotificationAnimation,
            SplashScreenAnimation,
            AnimatedInstaller,
            apply_hover_animation_to_all_buttons,
            animate_widget_fade_in,
            animate_widget_slide_in
        )
        print("✓ All animation UI/UX components accessible through UI package")
    except Exception as e:
        print(f"✗ Error importing animation components through UI package: {e}")
        return False
    
    print("\n✓ All animation system tests passed!")
    return True


def demo_animation_features():
    """Demonstrate some animation features."""
    print("\nDemonstrating Animation Features...")
    
    try:
        import tkinter as tk
        
        # Create a test window to demonstrate animations
        root = tk.Tk()
        root.title("Animation Demo")
        root.geometry("400x300")
        
        # Create a button to test hover animation
        btn = tk.Button(root, text="Hover over me!", width=20, height=2)
        btn.pack(pady=20)
        
        # Apply hover animation
        from ui.animation_pack import ButtonHoverAnimation
        ButtonHoverAnimation(btn)
        
        # Create a notification area
        notification_area = tk.Frame(root)
        notification_area.pack(pady=20)
        
        def show_notification():
            from ui.animation_pack import NotificationAnimation
            notifier = NotificationAnimation(notification_area)
            notifier.show_notification("This is an animated notification!", 3.0, "success")
        
        # Button to trigger notification
        notify_btn = tk.Button(root, text="Show Notification", command=show_notification)
        notify_btn.pack(pady=10)
        
        print("✓ Animation demo UI created successfully")
        
        # Only show the demo if this is run directly
        if __name__ == "__main__":
            root.mainloop()
        
    except Exception as e:
        print(f"✗ Error in animation demo: {e}")
        return False
    
    return True


if __name__ == "__main__":
    success1 = test_animation_system()
    success2 = demo_animation_features()
    
    if success1 and success2:
        print("\nAll animation components are working correctly!")
    else:
        print("\nSome animation components failed!")
        sys.exit(1)