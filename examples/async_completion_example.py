"""
Example: Using Async Gemini Completions.

This example demonstrates:
1. Setting up async Gemini completion fetching
2. Using AsyncAICodeEditor with Gemini
3. Handling async results
4. Fallback to local completions
5. Progress indicators
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
    QStatusBar,
    QProgressBar,
)

from jpe_studio_qt.ui.ai_code_editor_async import AsyncAICodeEditor, AsyncCompletionMode
from jpe_studio_qt.ai.gemini_completion import CompletionStatus


class AsyncEditorDemo(QMainWindow):
    """Demo showing async Gemini completions."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Async Gemini Completions Demo")
        self.setGeometry(100, 100, 1000, 700)

        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        # Title
        title = QLabel("Async Code Editor - Type and press Ctrl+Space for Gemini completions")
        layout.addWidget(title)

        # Create async editor (without real Gemini client for demo)
        self.editor = AsyncAICodeEditor(language="xml")

        # Configure async mode
        config = AsyncCompletionMode(
            enabled=True,
            use_local_fallback=True,
            use_gemini=True,  # Would use real Gemini in production
            timeout_ms=5000,
            min_confidence=0.5
        )
        self.editor.set_async_config(config)

        # Connect signals
        self.editor.async_completion_started.connect(self._on_async_started)
        self.editor.async_completion_finished.connect(self._on_async_finished)
        self.editor.async_completion_failed.connect(self._on_async_failed)

        layout.addWidget(self.editor, 1)

        # Status bar
        self.status_bar = self.statusBar()
        self.status_bar.showMessage("Ready. Press Ctrl+Space to request Gemini completions")

        # Progress bar (shown during async requests)
        self.progress_bar = QProgressBar()
        self.progress_bar.setMaximumWidth(300)
        self.progress_bar.setRange(0, 0)  # Indeterminate
        self.progress_bar.setVisible(False)
        self.status_bar.addPermanentWidget(self.progress_bar)

        # Load example code
        self._load_example_code()

    def _load_example_code(self) -> None:
        """Load example JPE code."""
        example = '''<?xml version="1.0"?>
<define interaction greeting
  name: "Say Hello"
  display_name: "Friendly Greeting"
  description: "A warm greeting"
  class: "SuperInteraction"

  target: Actor
  icon: "ui/icon_greet"

  test_set: GreetingTests

  loot_actions:
    - show_message: "Hello there!"
    - add_statistic_change: social, 5

  end
</define>'''

        self.editor.insertPlainText(example)

    def _on_async_started(self) -> None:
        """Handle async request started."""
        self.status_bar.showMessage("Requesting completions from Gemini...")
        self.progress_bar.setVisible(True)

    def _on_async_finished(self) -> None:
        """Handle async completion finished."""
        self.status_bar.showMessage("Completions ready!")
        self.progress_bar.setVisible(False)

    def _on_async_failed(self, error: str) -> None:
        """Handle async failure."""
        self.status_bar.showMessage(f"Completion failed: {error}")
        self.progress_bar.setVisible(False)


def example_1_basic_async_editor():
    """Example 1: Basic async editor setup."""
    print("\n" + "=" * 60)
    print("Example 1: Basic Async Editor Setup")
    print("=" * 60)

    from jpe_studio_qt.ai.gemini_completion import AsyncGeminiCompletionManager

    # Create editor with async support
    editor = AsyncAICodeEditor()

    # Set Gemini client (would be real client in production)
    client_mock = None  # In real usage, would be GeminiClient instance

    if client_mock:
        editor.set_gemini_client(client_mock)

    print("✓ Async editor created")
    print(f"  Async enabled: {editor._async_config.enabled}")
    print(f"  Timeout: {editor._async_config.timeout_ms}ms")


def example_2_configure_async():
    """Example 2: Configuring async behavior."""
    print("\n" + "=" * 60)
    print("Example 2: Configuring Async Completions")
    print("=" * 60)

    editor = AsyncAICodeEditor()

    # Create custom config
    config = AsyncCompletionMode(
        enabled=True,
        use_local_fallback=True,     # Fallback to local if Gemini fails
        use_gemini=True,              # Use Gemini API
        timeout_ms=3000,              # 3 second timeout
        min_confidence=0.7            # Only show 70%+ confidence
    )

    editor.set_async_config(config)

    print("✓ Async configuration:")
    print(f"  Enabled: {config.enabled}")
    print(f"  Use Gemini: {config.use_gemini}")
    print(f"  Fallback: {config.use_local_fallback}")
    print(f"  Timeout: {config.timeout_ms}ms")
    print(f"  Min confidence: {config.min_confidence}")


def example_3_async_signals():
    """Example 3: Handling async signals."""
    print("\n" + "=" * 60)
    print("Example 3: Handling Async Signals")
    print("=" * 60)

    editor = AsyncAICodeEditor()

    print("""
Async signals emitted by AsyncAICodeEditor:

1. async_completion_started
   - Emitted when async request begins
   - Use to show loading indicator

2. async_completion_finished
   - Emitted when completions are ready
   - Use to hide loading indicator

3. async_completion_failed(str)
   - Emitted when async request fails
   - Passes error message as parameter

Example usage:

    editor = AsyncAICodeEditor()

    def on_started():
        status_label.setText("Fetching from Gemini...")
        progress.show()

    def on_finished():
        status_label.setText("Completions ready!")
        progress.hide()

    def on_failed(error):
        status_label.setText(f"Error: {error}")
        progress.hide()

    editor.async_completion_started.connect(on_started)
    editor.async_completion_finished.connect(on_finished)
    editor.async_completion_failed.connect(on_failed)
""")


def example_4_async_manager():
    """Example 4: Using async manager directly."""
    print("\n" + "=" * 60)
    print("Example 4: Direct Async Manager Usage")
    print("=" * 60)

    from jpe_studio_qt.ai.gemini_completion import AsyncGeminiCompletionManager

    # Create manager
    client_mock = None  # Would be GeminiClient in production
    manager = AsyncGeminiCompletionManager(client_mock, timeout_ms=5000)

    print("""
AsyncGeminiCompletionManager provides:

1. request_completions(context, line)
   - Request completions asynchronously
   - Returns request ID for tracking

2. cancel_request(request_id)
   - Cancel an in-flight request

3. clear_cache()
   - Clear cached completions

4. Signals:
   - completions_ready(result)
   - progress(message)
   - error(message)

Example usage:

    from jpe_studio_qt.ai.gemini_completion import (
        AsyncGeminiCompletionManager,
        CompletionStatus
    )

    manager = AsyncGeminiCompletionManager(client)

    def on_completions_ready(result):
        if result.status == CompletionStatus.COMPLETED:
            print(f"Got {len(result.completions)} completions")
        elif result.status == CompletionStatus.FAILED:
            print(f"Error: {result.error}")

    manager.completions_ready.connect(on_completions_ready)

    request_id = manager.request_completions(context, line)
""")


def example_5_fallback_behavior():
    """Example 5: Fallback to local completions."""
    print("\n" + "=" * 60)
    print("Example 5: Fallback to Local Completions")
    print("=" * 60)

    print("""
Fallback behavior when async fails:

1. If use_local_fallback is True:
   - When Gemini fails/times out
   - Falls back to local IntelligentCodeCompletion
   - Provides seamless experience

2. If use_local_fallback is False:
   - Shows error message
   - No fallback completions
   - Requires user to retry

Configuration:

    config = AsyncCompletionMode(
        use_local_fallback=True  # Enable fallback
    )
    editor.set_async_config(config)

This ensures users always get completions, even if Gemini is slow/unavailable.
""")


def example_6_progress_indicators():
    """Example 6: Progress indicators."""
    print("\n" + "=" * 60)
    print("Example 6: Progress Indicators")
    print("=" * 60)

    print("""
AsyncAICodeEditor shows progress:

1. Loading indicator in popup
   - Animated spinner during fetch
   - Shows "Fetching from Gemini..."
   - Updates every 300ms

2. Signals for UI updates:
   - async_completion_started
   - async_completion_finished
   - async_completion_failed

Example UI integration:

    # Create status bar
    status = QStatusBar()
    progress = QProgressBar()
    progress.setRange(0, 0)  # Indeterminate

    # Connect signals
    editor.async_completion_started.connect(
        lambda: progress.setVisible(True)
    )
    editor.async_completion_finished.connect(
        lambda: progress.setVisible(False)
    )
    editor.async_completion_failed.connect(
        lambda e: progress.setVisible(False)
    )
""")


def example_7_performance_tuning():
    """Example 7: Performance tuning."""
    print("\n" + "=" * 60)
    print("Example 7: Performance Tuning")
    print("=" * 60)

    print("""
Tuning async completions for performance:

1. Timeout:
   - Default: 5000ms
   - Faster response: 2000-3000ms
   - More thorough: 8000-10000ms

2. Confidence threshold:
   - Default: 0.5 (50%)
   - Higher (0.8+): Only best suggestions
   - Lower (0.3): Include marginal suggestions

3. Cache management:
   - Cached completions returned instantly
   - Call manager.clear_cache() periodically
   - Especially after editing large sections

4. Local fallback:
   - Enables instant fallback on failure
   - Reduces perceived latency
   - Recommended for production

Configuration:

    config = AsyncCompletionMode(
        timeout_ms=3000,        # 3 second timeout
        min_confidence=0.7,     # Only high confidence
        use_local_fallback=True # Always have fallback
    )
    editor.set_async_config(config)
""")


def main():
    """Run all examples."""
    print("\n" + "=" * 60)
    print("Async Gemini Completions Examples")
    print("=" * 60)

    try:
        example_1_basic_async_editor()
        example_2_configure_async()
        example_3_async_signals()
        example_4_async_manager()
        example_5_fallback_behavior()
        example_6_progress_indicators()
        example_7_performance_tuning()

        print("\n" + "=" * 60)
        print("All examples completed!")
        print("=" * 60)
        print("""
To see the interactive demo with UI:
    python examples/async_completion_example.py --demo
""")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    if "--demo" in sys.argv:
        # Run interactive Qt demo
        app = QApplication(sys.argv)
        window = AsyncEditorDemo()
        window.show()
        sys.exit(app.exec())
    else:
        # Run code examples
        main()
