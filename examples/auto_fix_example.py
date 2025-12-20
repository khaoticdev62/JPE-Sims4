"""
Examples: One-Click Auto-Fix Workflow.

This example demonstrates:
1. Creating an auto-fix manager
2. Getting suggested fixes for errors
3. Previewing fixes with diff
4. Applying individual or batch fixes
5. Tracking fix history and statistics
"""

from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from jpe_studio_qt.ai.auto_fix import AutoFixManager, SuggestedFix, FixStatus
from jpe_studio_qt.ai.code_diff import CodeDiffAnalyzer
from unittest.mock import Mock


def example_1_create_manager():
    """Example 1: Create an auto-fix manager."""
    print("\n" + "="*60)
    print("Example 1: Create Auto-Fix Manager")
    print("="*60)

    # Create a mock Gemini client
    client = Mock()

    # Initialize manager
    manager = AutoFixManager(client)

    print("✓ Auto-fix manager created successfully")
    print(f"  Manager has signals:")
    print(f"    - fixes_ready: {hasattr(manager, 'fixes_ready')}")
    print(f"    - fix_applied: {hasattr(manager, 'fix_applied')}")
    print(f"    - fix_rejected: {hasattr(manager, 'fix_rejected')}")
    print(f"    - fix_failed: {hasattr(manager, 'fix_failed')}")
    print(f"    - progress: {hasattr(manager, 'progress')}")


def example_2_suggested_fixes():
    """Example 2: Create suggested fixes."""
    print("\n" + "="*60)
    print("Example 2: Create Suggested Fixes")
    print("="*60)

    fixes = [
        SuggestedFix(
            error_code="ERR_001",
            error_message="Missing closing tag",
            fix_index=0,
            fix_description="Add missing </define> tag",
            original_code="<define interaction greeting>",
            fixed_code="<define interaction greeting>\n</define>",
            confidence=0.95
        ),
        SuggestedFix(
            error_code="ERR_002",
            error_message="Deprecated attribute",
            fix_index=0,
            fix_description="Replace 'enabled' with 'active'",
            original_code='<define enabled="true">',
            fixed_code='<define active="true">',
            confidence=0.87
        ),
    ]

    print(f"✓ Created {len(fixes)} suggested fixes:")
    for fix in fixes:
        print(f"\n  Fix #{fix.fix_index + 1}: {fix.error_code}")
        print(f"    Message: {fix.error_message}")
        print(f"    Description: {fix.fix_description}")
        print(f"    Confidence: {int(fix.confidence * 100)}%")
        print(f"    Status: {fix.status.value}")


def example_3_preview_fix():
    """Example 3: Preview a fix with diff."""
    print("\n" + "="*60)
    print("Example 3: Preview Fix with Diff")
    print("="*60)

    # Create a fix
    fix = SuggestedFix(
        error_code="ERR_001",
        error_message="Missing closing tag",
        fix_index=0,
        fix_description="Add missing </define> tag",
        original_code="""<define interaction greeting>
    name: "Say Hello"
    target: Actor
</define>""",
        fixed_code="""<define interaction greeting>
    name: "Say Hello"
    target: Actor
    display_name: "Greeting Interaction"
</define>""",
        confidence=0.92
    )

    # Create analyzer and get diff
    analyzer = CodeDiffAnalyzer()
    diff = analyzer.compare(fix.original_code, fix.fixed_code)

    print(f"✓ Generated diff for fix {fix.error_code}:")
    print(f"\n  Original lines: {diff.additions + diff.deletions}")
    print(f"  New lines: {len(fix.fixed_code.split(chr(10)))}")
    print(f"  Additions: +{diff.additions}")
    print(f"  Deletions: -{diff.deletions}")
    print(f"  Similarity: {int(diff.similarity * 100)}%")

    # Show diff summary
    summary = CodeDiffAnalyzer.format_diff_summary(diff)
    print(f"\n  Diff Summary:")
    for line in summary.split("\n"):
        print(f"    {line}")


def example_4_apply_single_fix():
    """Example 4: Apply a single fix."""
    print("\n" + "="*60)
    print("Example 4: Apply Single Fix")
    print("="*60)

    # Create manager and fix
    client = Mock()
    manager = AutoFixManager(client)

    fix = SuggestedFix(
        error_code="ERR_001",
        error_message="test",
        fix_index=0,
        fix_description="Fix XML syntax",
        original_code="<define>",
        fixed_code="<define></define>",
        confidence=0.90
    )

    print(f"Before applying:")
    print(f"  Fix status: {fix.status.value}")
    print(f"  Applied fixes: {len(manager.get_applied_fixes())}")

    # Apply the fix
    result = manager.apply_fix(fix)

    print(f"\nAfter applying:")
    print(f"  Applied successfully: {result}")
    print(f"  Fix status: {fix.status.value}")
    print(f"  Applied fixes: {len(manager.get_applied_fixes())}")
    print(f"  Applied code:\n    {fix.fixed_code}")


def example_5_apply_batch():
    """Example 5: Apply multiple fixes at once."""
    print("\n" + "="*60)
    print("Example 5: Apply Multiple Fixes (Batch)")
    print("="*60)

    # Create manager
    client = Mock()
    manager = AutoFixManager(client)

    # Create multiple fixes
    fixes = [
        SuggestedFix(
            error_code=f"ERR_{i:03d}",
            error_message=f"Error {i}",
            fix_index=0,
            fix_description=f"Fix for error {i}",
            original_code=f"code_{i}",
            fixed_code=f"fixed_{i}",
            confidence=0.9 - (i * 0.05)
        )
        for i in range(1, 4)
    ]

    print(f"Applying {len(fixes)} fixes...")

    # Apply all fixes
    result = manager.apply_batch(fixes)

    print(f"\n✓ Batch apply result: {result}")
    applied = manager.get_applied_fixes()
    print(f"  Total applied: {len(applied)}")
    for error_code, fix in applied.items():
        print(f"    - {error_code}: {fix.status.value}")


def example_6_track_history():
    """Example 6: Track fix history and statistics."""
    print("\n" + "="*60)
    print("Example 6: Track History and Statistics")
    print("="*60)

    # Create manager
    client = Mock()
    manager = AutoFixManager(client)

    # Simulate fixes being suggested and applied
    fixes = [
        SuggestedFix(
            error_code=f"ERR_{i:03d}",
            error_message=f"Error {i}",
            fix_index=0,
            fix_description=f"Fix for error {i}",
            original_code=f"code_{i}",
            fixed_code=f"fixed_{i}",
            confidence=0.85 + (i * 0.05)
        )
        for i in range(1, 6)
    ]

    # Add to history
    manager._fix_history.extend(fixes)

    # Apply some fixes
    manager.apply_fix(fixes[0])
    manager.apply_fix(fixes[1])
    manager.reject_fix(fixes[2])

    # Get statistics
    stats = manager.get_statistics()

    print("✓ Fix statistics:")
    print(f"  Total suggested: {stats['total_fixes_suggested']}")
    print(f"  Applied: {stats['fixes_applied']}")
    print(f"  Rejected: {stats['fixes_rejected']}")
    print(f"  Failed: {stats['fixes_failed']}")
    print(f"  Average confidence: {int(stats['average_confidence'] * 100)}%")

    # Get history
    history = manager.get_fix_history()
    print(f"\n✓ Fix history ({len(history)} items):")
    for i, fix in enumerate(history[:3], 1):
        print(f"  {i}. {fix.error_code}: {fix.status.value} (confidence: {int(fix.confidence * 100)}%)")


def example_7_reject_and_clear():
    """Example 7: Reject fixes and clear history."""
    print("\n" + "="*60)
    print("Example 7: Reject Fixes and Clear History")
    print("="*60)

    # Create manager
    client = Mock()
    manager = AutoFixManager(client)

    # Create fixes
    fixes = [
        SuggestedFix(
            error_code=f"ERR_{i:03d}",
            error_message=f"Error {i}",
            fix_index=0,
            fix_description=f"Fix for error {i}",
            original_code=f"code_{i}",
            fixed_code=f"fixed_{i}",
            confidence=0.90
        )
        for i in range(1, 4)
    ]

    # Add to history
    manager._fix_history.extend(fixes)

    print("Before rejection:")
    print(f"  History: {len(manager.get_fix_history())} fixes")
    print(f"  Applied: {len(manager.get_applied_fixes())} fixes")

    # Reject a fix
    manager.reject_fix(fixes[0])

    print(f"\nAfter rejecting {fixes[0].error_code}:")
    print(f"  Status: {fixes[0].status.value}")

    # Clear all history
    manager.clear_history()

    print(f"\nAfter clearing history:")
    print(f"  History: {len(manager.get_fix_history())} fixes")
    print(f"  Applied: {len(manager.get_applied_fixes())} fixes")


def main():
    """Run all examples."""
    print("\n" + "="*60)
    print("Auto-Fix Workflow Examples")
    print("="*60)

    try:
        example_1_create_manager()
        example_2_suggested_fixes()
        example_3_preview_fix()
        example_4_apply_single_fix()
        example_5_apply_batch()
        example_6_track_history()
        example_7_reject_and_clear()

        print("\n" + "="*60)
        print("All examples completed!")
        print("="*60)
        print("""
Key Takeaways:

1. AutoFixManager coordinates error analysis and code diff.

2. Core workflow:
   a. Get fixes from error analysis
   b. Preview with code diff
   c. Apply individually or as batch
   d. Track history and statistics

3. SuggestedFix includes:
   - Error code and message
   - Fix description
   - Original and fixed code
   - Confidence score (0-1.0)
   - Status (pending/applied/rejected/failed)

4. Signals for UI updates:
   - fixes_ready(list) - Fixes ready for review
   - fix_applied(fix) - Individual fix applied
   - fix_rejected(fix) - Fix rejected
   - fix_failed(error) - Fix application failed
   - progress(message) - Progress updates

5. Statistics tracking:
   - Total fixes suggested
   - Fixes applied/rejected/failed
   - Average confidence
   - Fix history

Integration example:

    from jpe_studio_qt.ai.auto_fix import AutoFixManager
    from jpe_studio_qt.ui.auto_fix_dialog import AutoFixDialog

    # In error handler
    manager = AutoFixManager(gemini_client)
    fixes = manager.get_fixes_for_error(
        error_code, error_message, error_details, code
    )

    # Show dialog
    dialog = AutoFixDialog(fixes)
    result = dialog.exec()

    if dialog.accepted:
        for fix in dialog.get_applied_fixes():
            editor.setPlainText(fix.fixed_code)
""")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
