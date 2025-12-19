"""
Example: Using AICodeEditor with intelligent completions.

This example demonstrates:
1. Setting up an AICodeEditor with intelligent completions
2. Integrating with the AdvancedCodeCompletionSystem
3. Handling completion events
4. Customizing completion behavior
"""

from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QLabel,
)

from jpe_studio_qt.ui.ai_code_editor import AICodeEditor
from ai.intelligent_completion import AdvancedCodeCompletionSystem


class CodeEditorDemo(QMainWindow):
    """Demo application showcasing AICodeEditor."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("AI Code Editor Demo")
        self.setGeometry(100, 100, 1000, 600)

        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        # Title
        title = QLabel("AI Code Editor - Try Ctrl+Space for completions!")
        layout.addWidget(title)

        # Initialize completion system
        completion_system = AdvancedCodeCompletionSystem()

        # Create AI code editor
        self.editor = AICodeEditor(language="xml")
        self.editor.set_completion_system(completion_system)

        # Connect signals
        self.editor.completion_applied.connect(self._on_completion_applied)

        layout.addWidget(self.editor, 1)

        # Status label
        self.status_label = QLabel("Ready. Type 'define' and press Ctrl+Space to see completions!")
        layout.addWidget(self.status_label)

        # Load example code
        self._load_example_code()

    def _load_example_code(self) -> None:
        """Load example JPE code into the editor."""
        example_code = '''define interaction greet
name: "Friendly Greeting"
display_name: "Say Hello"
description: "A warm greeting"
class: "SuperInteraction"

target: Actor
icon: "ui/icon_greet"

test_set: GreetTestSet

loot_actions:
    - show_message: "Hello there!"
    - add_statistic_change: social, 10
end'''

        self.editor.insertPlainText(example_code)

    def _on_completion_applied(self, completion_text: str) -> None:
        """Handle completion application event."""
        self.status_label.setText(
            f"Completion applied: {completion_text}"
        )


def example_1_basic_usage():
    """Example 1: Basic AICodeEditor setup."""
    print("\n" + "=" * 60)
    print("Example 1: Basic AICodeEditor Setup")
    print("=" * 60)

    from jpe_studio_qt.ui.ai_code_editor import AICodeEditor
    from ai.intelligent_completion import AdvancedCodeCompletionSystem

    # Create editor
    editor = AICodeEditor()

    # Initialize completion system
    system = AdvancedCodeCompletionSystem()

    # Connect editor to system
    editor.set_completion_system(system)

    print("✓ Editor created and connected to completion system")
    print(f"  Editor type: {type(editor).__name__}")
    print(f"  System type: {type(system).__name__}")


def example_2_manual_completions():
    """Example 2: Requesting completions manually."""
    print("\n" + "=" * 60)
    print("Example 2: Manual Completion Requests")
    print("=" * 60)

    from jpe_studio_qt.ui.ai_code_editor import AICodeEditor
    from ai.intelligent_completion import AdvancedCodeCompletionSystem

    # Setup
    editor = AICodeEditor()
    system = AdvancedCodeCompletionSystem()
    editor.set_completion_system(system)

    # Insert some code
    test_code = "define interaction test\n"
    editor.insertPlainText(test_code)

    # Request completions at end
    text = editor.toPlainText()
    cursor_pos = len(text)

    completions = system.get_completions(text, cursor_pos)

    print(f"✓ Requested completions at position {cursor_pos}")
    print(f"  Found {len(completions)} completions")

    for i, completion in enumerate(completions[:3], 1):
        print(f"  {i}. {completion.text} (confidence: {completion.confidence:.1%})")


def example_3_keyboard_shortcuts():
    """Example 3: Keyboard shortcuts."""
    print("\n" + "=" * 60)
    print("Example 3: Keyboard Shortcuts")
    print("=" * 60)

    print("""
Keyboard shortcuts in AICodeEditor:

├─ Ctrl+Space      : Show/request completions
├─ Tab             : Accept selected completion (when popup visible)
├─ Enter           : Accept selected completion (when popup visible)
├─ Up Arrow        : Select previous completion
├─ Down Arrow      : Select next completion
└─ Escape          : Hide completion popup

These shortcuts work automatically when a completion system is connected.
Users can type naturally and press Ctrl+Space when they want completions,
or the editor can be configured for automatic triggering.
""")


def example_4_completion_customization():
    """Example 4: Customizing completion behavior."""
    print("\n" + "=" * 60)
    print("Example 4: Completion Customization")
    print("=" * 60)

    from jpe_studio_qt.ui.ai_code_editor import AICodeEditor
    from ai.intelligent_completion import AdvancedCodeCompletionSystem

    # Setup
    editor = AICodeEditor()
    system = AdvancedCodeCompletionSystem()
    editor.set_completion_system(system)

    # Customize completion delay (default: 250ms)
    editor.set_completion_delay(500)
    print("✓ Set completion delay to 500ms")

    # Enable/disable completions
    editor.enable_completions(True)
    print("✓ Completions enabled")

    editor.enable_completions(False)
    print("✓ Completions disabled")

    editor.enable_completions(True)
    print("✓ Completions re-enabled")


def example_5_learning_from_choices():
    """Example 5: Learning from user choices."""
    print("\n" + "=" * 60)
    print("Example 5: Learning from Completion Choices")
    print("=" * 60)

    from jpe_studio_qt.ui.ai_code_editor import AICodeEditor
    from ai.intelligent_completion import AdvancedCodeCompletionSystem

    # Setup
    editor = AICodeEditor()
    system = AdvancedCodeCompletionSystem()
    editor.set_completion_system(system)

    print("""
Learning mechanism:

1. When user accepts a completion, the system records it
2. The IntelligentCodeCompletion learns from user choices
3. Future suggestions become more relevant based on patterns
4. The CompletionCache stores frequently accessed completions

This means the system improves over time as users work!
""")


def example_6_integration_with_ui():
    """Example 6: Integrating into a larger UI."""
    print("\n" + "=" * 60)
    print("Example 6: Integration with Larger UI")
    print("=" * 60)

    print("""
Integration pattern:

1. Create AICodeEditor instance
2. Initialize AdvancedCodeCompletionSystem
3. Connect editor to system via set_completion_system()
4. Connect completion_applied signal to UI handlers
5. Optionally customize delay and other settings

Example code:

    from jpe_studio_qt.ui.ai_code_editor import AICodeEditor
    from ai.intelligent_completion import AdvancedCodeCompletionSystem

    # In your main window or dialog
    self.editor = AICodeEditor()
    self.completion_system = AdvancedCodeCompletionSystem()

    self.editor.set_completion_system(self.completion_system)
    self.editor.completion_applied.connect(self.on_completion)

    def on_completion(self, text):
        print(f"User accepted completion: {text}")
        # Update UI, save state, etc.
""")


def example_7_best_practices():
    """Example 7: Best practices for AICodeEditor."""
    print("\n" + "=" * 60)
    print("Example 7: Best Practices")
    print("=" * 60)

    print("""
Best Practices:

1. ✓ Initialize completion system early
   ✗ Don't create it for every editor instance

2. ✓ Set appropriate completion delay
   ✗ Don't use 0ms (causes lag)

3. ✓ Connect to completion_applied signal
   ✗ Don't ignore user interactions

4. ✓ Handle exceptions in completion requests
   ✗ Don't let errors crash the editor

5. ✓ Clear cache periodically for large files
   ✗ Don't let cache grow unbounded

6. ✓ Provide visual feedback to users
   ✗ Don't silently fail completions

7. ✓ Allow users to disable completions
   ✗ Don't force completions on users

Example:

    # Good: Single shared system
    completion_system = AdvancedCodeCompletionSystem()
    editor1.set_completion_system(completion_system)
    editor2.set_completion_system(completion_system)  # Reuse!

    # Better: Configurable delay
    editor.set_completion_delay(300)  # 300ms is typical

    # Better: Handle and log errors
    try:
        editor._request_completions()
    except Exception as e:
        logger.error(f"Completion error: {e}")
""")


def main():
    """Run all examples."""
    print("\n" + "=" * 60)
    print("AICodeEditor Examples")
    print("=" * 60)

    try:
        example_1_basic_usage()
        example_2_manual_completions()
        example_3_keyboard_shortcuts()
        example_4_completion_customization()
        example_5_learning_from_choices()
        example_6_integration_with_ui()
        example_7_best_practices()

        print("\n" + "=" * 60)
        print("All examples completed!")
        print("=" * 60)
        print("""
To see the interactive demo with UI:
    python examples/ai_code_editor_example.py --demo
""")

    except Exception as e:
        print(f"\n✗ Error in examples: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    import sys

    if "--demo" in sys.argv:
        # Run interactive Qt demo
        app = QApplication(sys.argv)
        window = CodeEditorDemo()
        window.show()
        sys.exit(app.exec())
    else:
        # Run code examples
        main()
