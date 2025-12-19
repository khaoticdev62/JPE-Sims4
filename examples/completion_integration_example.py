"""
Example: Integrating intelligent completions into UI.

This example demonstrates how to use CompletionSystemManager
to integrate AI code completions throughout an application.
"""

from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from jpe_studio_qt.ai import (
    CompletionSystemManager,
    CompletionConfig,
    get_manager,
    configure_editor,
    get_completion_system,
    update_config,
    clear_cache,
)


def example_1_basic_setup():
    """Example 1: Basic setup with global manager."""
    print("\n" + "=" * 60)
    print("Example 1: Basic Setup")
    print("=" * 60)

    # Get the global manager
    manager = get_manager()

    # Update global configuration
    manager.update_config(
        trigger_delay_ms=300,
        enabled=True,
    )

    print("✓ Manager initialized")
    print(f"  Completion delay: {manager.get_config().trigger_delay_ms}ms")
    print(f"  Completions enabled: {manager.get_config().enabled}")


def example_2_from_ai_settings():
    """Example 2: Configure from AI settings."""
    print("\n" + "=" * 60)
    print("Example 2: Configure from AI Settings")
    print("=" * 60)

    from jpe_studio_qt.settings_manager import AISettings

    # Create AI settings (from user configuration)
    ai_settings = AISettings(
        api_key="dummy_key",
        ai_enabled=True,
        default_model="flash",
        confidence_threshold=0.75,
    )

    # Apply to completion system
    manager = get_manager()
    manager.set_config_from_ai_settings(ai_settings)

    print("✓ Configuration loaded from AI settings")
    print(f"  Enabled: {manager.get_config().enabled}")
    print(f"  Confidence threshold: {manager.get_config().confidence_threshold}")


def example_3_editor_configuration():
    """Example 3: Configuring individual editors."""
    print("\n" + "=" * 60)
    print("Example 3: Per-Editor Configuration")
    print("=" * 60)

    manager = get_manager()

    # Set global default
    manager.update_config(trigger_delay_ms=250)
    print("✓ Global delay set to 250ms")

    # Override for specific editor (editor_id = 12345)
    manager.set_editor_config(12345, trigger_delay_ms=500)
    print("✓ Editor 12345 delay set to 500ms")

    # Get configurations
    global_config = manager.get_config()
    editor_config = manager.get_editor_config(12345)

    print(f"  Global: {global_config.trigger_delay_ms}ms")
    print(f"  Editor 12345: {editor_config.trigger_delay_ms}ms")


def example_4_editor_integration():
    """Example 4: Integrating with AICodeEditor."""
    print("\n" + "=" * 60)
    print("Example 4: Editor Integration")
    print("=" * 60)

    from jpe_studio_qt.ui.ai_code_editor import AICodeEditor

    # Create editor
    editor = AICodeEditor()

    # Configure using manager (this would happen automatically in UI)
    # configure_editor(editor)

    print("""✓ Editor integration workflow:

1. Create AICodeEditor instance
2. Call configure_editor(editor) from manager
3. Manager automatically:
   - Sets completion system
   - Applies global config
   - Applies per-editor overrides

This is typically done in UI constructors:

    editor = AICodeEditor()
    from jpe_studio_qt.ai import configure_editor
    configure_editor(editor)
""")


def example_5_system_management():
    """Example 5: System management."""
    print("\n" + "=" * 60)
    print("Example 5: System Management")
    print("=" * 60)

    manager = get_manager()

    # Get the completion system
    system = manager.get_completion_system()
    print(f"✓ Completion system: {type(system).__name__ if system else 'None'}")

    # Clear cache
    clear_cache()
    print("✓ Cache cleared")

    # Enable/disable all editors
    manager.disable_all()
    print("✓ All completions disabled globally")

    manager.enable_all()
    print("✓ All completions enabled globally")

    # Reset everything
    manager.reset()
    print("✓ Manager reset to defaults")


def example_6_convenience_functions():
    """Example 6: Using convenience functions."""
    print("\n" + "=" * 60)
    print("Example 6: Convenience Functions")
    print("=" * 60)

    # All of these are convenience functions for get_manager()

    system = get_completion_system()
    print(f"✓ Got completion system: {type(system).__name__ if system else 'None'}")

    update_config(trigger_delay_ms=400)
    print("✓ Updated config via convenience function")

    clear_cache()
    print("✓ Cleared cache via convenience function")

    print("""
These convenience functions are equivalent to:

    manager = get_manager()
    system = manager.get_completion_system()
    manager.update_config(...)
    manager.clear_cache()

Use whichever style fits your code better.
""")


def example_7_best_practices():
    """Example 7: Best practices."""
    print("\n" + "=" * 60)
    print("Example 7: Best Practices")
    print("=" * 60)

    print("""
Best practices for completion integration:

1. ✓ Initialize once at app startup
   manager = get_manager()
   manager.set_config_from_ai_settings(app_config.ai_settings)

2. ✓ Configure editors in UI constructors
   editor = AICodeEditor()
   configure_editor(editor)

3. ✓ Allow per-editor customization
   manager.set_editor_config(editor_id, trigger_delay_ms=300)

4. ✓ Update config when settings change
   def on_ai_settings_changed(settings):
       manager.set_config_from_ai_settings(settings)

5. ✓ Clear cache after large operations
   # After processing many files
   clear_cache()

6. ✓ Handle missing system gracefully
   system = get_completion_system()
   if system:
       # Use completions
   else:
       # Fallback to manual editing

7. ✓ Log configuration changes
   manager.update_config(enabled=False)
   # Manager logs this automatically

Example app startup:

    def main():
        # Initialize
        manager = get_manager()

        # Load settings
        app_config = load_config()
        manager.set_config_from_ai_settings(app_config.ai_settings)

        # Create UI
        app = QApplication()
        main_window = MainWindow()
        main_window.show()

        # Connect settings changes
        settings_dialog.settings_changed.connect(on_settings_changed)

        app.exec()

        # Cleanup
        manager.reset()
""")


def main():
    """Run all examples."""
    print("\n" + "=" * 60)
    print("Completion Integration Examples")
    print("=" * 60)

    try:
        example_1_basic_setup()
        example_2_from_ai_settings()
        example_3_editor_configuration()
        example_4_editor_integration()
        example_5_system_management()
        example_6_convenience_functions()
        example_7_best_practices()

        print("\n" + "=" * 60)
        print("All examples completed!")
        print("=" * 60)

    except Exception as e:
        print(f"\n✗ Error in examples: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
