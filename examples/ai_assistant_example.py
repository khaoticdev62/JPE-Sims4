"""
Examples: Unified AI Assistant Panel (Ctrl+K).

This example demonstrates:
1. Creating the AI Assistant panel
2. Registering actions
3. Filtering and searching
4. Integration with main window
5. Keyboard shortcuts
6. Action callbacks
"""

from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from jpe_studio_qt.ui.ai_assistant_unified import (
    AIAssistantPanel, AIAssistantManager, AssistantAction, AssistantTab
)


def example_1_create_panel():
    """Example 1: Create AI Assistant Panel."""
    print("\n" + "="*60)
    print("Example 1: Create AI Assistant Panel")
    print("="*60)

    panel = AIAssistantPanel()

    print("✓ AI Assistant Panel created successfully")
    print(f"  - Search input available")
    print(f"  - Results list ready")
    print(f"  - Details panel available")
    print(f"  - Keyboard shortcuts configured")


def example_2_register_actions():
    """Example 2: Register actions."""
    print("\n" + "="*60)
    print("Example 2: Register Actions")
    print("="*60)

    actions = [
        AssistantAction(
            title="Fix Missing Tag",
            description="Apply auto-fix for missing closing </define> tag",
            category="fix",
            icon="check_circle",
            priority=2
        ),
        AssistantAction(
            title="Explain Error",
            description="Get AI explanation of current error",
            category="insight",
            icon="info",
            priority=1
        ),
        AssistantAction(
            title="Code Completion",
            description="Get AI code completion suggestions",
            category="suggestion",
            icon="lightbulb",
            priority=0
        ),
        AssistantAction(
            title="Analyze Code",
            description="Run AI analysis on selected code",
            category="analysis",
            icon="analytics",
            priority=1
        ),
        AssistantAction(
            title="View Documentation",
            description="Search JPE documentation",
            category="doc",
            icon="description",
            priority=0
        ),
    ]

    print(f"✓ Created {len(actions)} actions:")
    for i, action in enumerate(actions, 1):
        priority_str = ["Low", "Medium", "High"][action.priority]
        print(f"  {i}. {action.title}")
        print(f"     Category: {action.category} | Priority: {priority_str}")


def example_3_search_filtering():
    """Example 3: Search and filtering."""
    print("\n" + "="*60)
    print("Example 3: Search and Filtering")
    print("="*60)

    actions = [
        AssistantAction(
            title="Fix Missing Tag",
            description="Apply auto-fix for missing closing tag",
            category="fix",
            icon="check_circle"
        ),
        AssistantAction(
            title="Fix Deprecated Attribute",
            description="Replace deprecated attribute with new one",
            category="fix",
            icon="check_circle"
        ),
        AssistantAction(
            title="Suggest Import",
            description="Suggest required imports",
            category="suggestion",
            icon="lightbulb"
        ),
    ]

    # Simulate search queries
    queries = ["fix", "tag", "suggest"]

    print("✓ Filtering results for different queries:\n")

    for query in queries:
        matching = [
            a for a in actions
            if query.lower() in a.title.lower()
            or query.lower() in a.description.lower()
        ]

        print(f"  Query: '{query}' -> {len(matching)} results")
        for action in matching:
            print(f"    - {action.title}")


def example_4_action_callbacks():
    """Example 4: Action callbacks."""
    print("\n" + "="*60)
    print("Example 4: Action Callbacks")
    print("="*60)

    def on_fix_click(action):
        """Handle fix action."""
        print(f"    [FIX] {action.title}")

    def on_insight_click(action):
        """Handle insight action."""
        print(f"    [INSIGHT] {action.title}")

    actions = [
        AssistantAction(
            title="Fix Error",
            description="Apply fix",
            category="fix",
            icon="check_circle",
            callback=on_fix_click,
            priority=2
        ),
        AssistantAction(
            title="Explain Error",
            description="Get explanation",
            category="insight",
            icon="info",
            callback=on_insight_click,
            priority=1
        ),
    ]

    print("✓ Actions with callbacks:")
    for action in actions:
        print(f"  - {action.title}")
        if action.callback:
            print(f"    Callback: {action.callback.__name__}")


def example_5_manager_usage():
    """Example 5: Manager usage."""
    print("\n" + "="*60)
    print("Example 5: AI Assistant Manager")
    print("="*60)

    manager = AIAssistantManager()

    # Register actions
    actions = [
        AssistantAction(
            title="Auto-Fix All",
            description="Apply all suggested fixes",
            category="fix",
            icon="check_circle",
            priority=2
        ),
        AssistantAction(
            title="Code Analysis",
            description="Analyze code quality",
            category="analysis",
            icon="analytics",
            priority=1
        ),
    ]

    manager.register_actions(actions)

    print(f"✓ Manager created with {len(manager.get_actions())} actions")
    print(f"  Actions registered: {[a.title for a in manager.get_actions()]}")


def example_6_integration():
    """Example 6: Integration with main window."""
    print("\n" + "="*60)
    print("Example 6: Main Window Integration")
    print("="*60)

    print("✓ Integration steps:")
    print("""
    1. Create manager in main window:
       self.ai_manager = AIAssistantManager()

    2. Register keyboard shortcut:
       shortcut = QShortcut(QKeySequence("Ctrl+K"), self)
       shortcut.activated.connect(self.ai_manager.show)

    3. Register actions from components:
       # From error analyzer
       error_action = AssistantAction(
           title="Explain Error",
           description=f"Error {error_code}: {message}",
           category="insight",
           icon="info",
           callback=self.on_error_explanation
       )
       self.ai_manager.register_action(error_action)

       # From auto-fix
       fix_action = AssistantAction(
           title="Apply Fix",
           description=f"Fix: {fix.fix_description}",
           category="fix",
           icon="check_circle",
           callback=self.on_apply_fix,
           priority=2
       )
       self.ai_manager.register_action(fix_action)

    4. Handle action in main window:
       def on_apply_fix(self, action):
           # Execute fix logic
           self.editor.setPlainText(action.data['fixed_code'])
    """)


def example_7_action_priority():
    """Example 7: Action priority."""
    print("\n" + "="*60)
    print("Example 7: Action Priority and Sorting")
    print("="*60)

    actions = [
        AssistantAction(
            title="Code Completion",
            description="Suggest next code line",
            category="suggestion",
            icon="lightbulb",
            priority=0
        ),
        AssistantAction(
            title="Analyze Code",
            description="Run analysis",
            category="analysis",
            icon="analytics",
            priority=1
        ),
        AssistantAction(
            title="Fix Critical Error",
            description="Apply critical error fix",
            category="fix",
            icon="check_circle",
            priority=2
        ),
    ]

    # Sort by priority (highest first)
    sorted_actions = sorted(actions, key=lambda a: -a.priority)

    print("✓ Actions sorted by priority:")
    for action in sorted_actions:
        priority_icons = ["❌", "⚠️", "⭐"][action.priority]
        print(f"  {priority_icons} [{action.priority}] {action.title}")


def main():
    """Run all examples."""
    print("\n" + "="*60)
    print("AI Assistant Panel Examples")
    print("="*60)

    try:
        example_1_create_panel()
        example_2_register_actions()
        example_3_search_filtering()
        example_4_action_callbacks()
        example_5_manager_usage()
        example_6_integration()
        example_7_action_priority()

        print("\n" + "="*60)
        print("All examples completed!")
        print("="*60)
        print("""
Key Takeaways:

1. AIAssistantPanel is a unified interface for all AI features
   - Search and filter actions
   - Keyboard navigation (↑↓ to navigate, Enter to select)
   - Esc to close

2. AssistantAction represents an AI action
   - Title and description
   - Category (suggestion, fix, insight, analysis, doc)
   - Icon for visual identification
   - Priority for sorting (0=low, 1=medium, 2=high)
   - Optional callback function
   - Optional data payload

3. AIAssistantManager manages the panel and actions
   - Creates and manages the panel
   - Registers actions
   - Shows/hides the panel
   - Handles action callbacks

4. Features:
   - Real-time search filtering
   - Case-insensitive matching
   - Priority-based sorting
   - Keyboard shortcuts (Ctrl+K)
   - Action callbacks for integration
   - Data passing with actions

5. Integration Pattern:
   a. Create manager in main window
   b. Setup Ctrl+K keyboard shortcut
   c. Register actions from various components
   d. Handle action callbacks to execute logic

6. Action Categories:
   - suggestion: Code suggestions and completions
   - fix: Auto-fix and error corrections
   - insight: AI explanations and analysis
   - analysis: Code quality and metrics
   - doc: Documentation lookup

Usage example:

    from jpe_studio_qt.ui.ai_assistant_unified import (
        AIAssistantManager, AssistantAction
    )

    # In main window
    self.ai_manager = AIAssistantManager()

    # Setup keyboard shortcut
    from PySide6.QtGui import QKeySequence, QShortcut
    shortcut = QShortcut(QKeySequence("Ctrl+K"), self)
    shortcut.activated.connect(self.ai_manager.show)

    # Register actions
    action = AssistantAction(
        title="Fix Error",
        description="Apply auto-fix",
        category="fix",
        icon="check_circle",
        callback=self.on_fix_action,
        priority=2
    )
    self.ai_manager.register_action(action)

    # Handle action
    def on_fix_action(self, action):
        print(f"Fixing: {action.title}")
        # Execute fix logic
""")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
